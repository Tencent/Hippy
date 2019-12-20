/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyDefines.h"

#if HIPPY_DEV // Debug executors are only supported in dev mode

#import "HippyWebSocketExecutor.h"

#import "HippyBridge.h"
#import "HippyConvert.h"
#import "HippyLog.h"
#import "HippyUtils.h"
#import "HippySRWebSocket.h"
#import "HippyBridge+Private.h"
#import "HippyBundleURLProvider.h"

typedef void (^HippyWSMessageCallback)(NSError *error, NSDictionary<NSString *, id> *reply);

@interface HippyWebSocketExecutor () <HippySRWebSocketDelegate>

@end

@implementation HippyWebSocketExecutor
{
    HippySRWebSocket *_socket;
    dispatch_queue_t _jsQueue;
    NSMutableDictionary<NSNumber *, HippyWSMessageCallback> *_callbacks;
    dispatch_semaphore_t _socketOpenSemaphore;
    NSMutableDictionary<NSString *, NSString *> *_injectedObjects;
    NSURL *_url;
}

HIPPY_EXPORT_MODULE()

@synthesize bridge = _bridge;
@synthesize pEngine = _pEngine;
@synthesize pEnv = _pEnv;
@synthesize napi_ctx = _napi_ctx;
@synthesize JSGlobalContextRef = _JSGlobalContextRef;
@synthesize businessName = _businessName;
- (instancetype)initWithURL:(NSURL *)URL
{
    HippyAssertParam(URL);
    
    if ((self = [self init])) {
        _url = URL;
    }
    return self;
}

- (void)setUp
{
    NSString *localhost = [HippyBundleURLProvider sharedInstance].localhost ?: @"localhost:38989";
    NSString *urlStr = [NSString stringWithFormat:@"ws://%@/debugger-proxy?role=client", localhost];
    _url = HippyURLWithString(urlStr, NULL);
    _jsQueue = dispatch_queue_create("com.tencent.hippy.WebSocketExecutor", DISPATCH_QUEUE_SERIAL);
    _socket = [[HippySRWebSocket alloc] initWithURL:_url];
    _socket.delegate = self;
    _callbacks = [NSMutableDictionary new];
    _injectedObjects = [NSMutableDictionary new];
    [_socket setDelegateDispatchQueue:_jsQueue];
    
    
    NSString *startDevToolsURLStr = [NSString stringWithFormat:@"http://%@/launch-js-devtools", localhost];
    NSURL *startDevToolsURL = HippyURLWithString(startDevToolsURLStr, NULL);
    
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask = [session dataTaskWithRequest:[NSURLRequest requestWithURL:startDevToolsURL]
                                                completionHandler:^(__unused NSData *data, __unused NSURLResponse *response, __unused NSError *error){}];
    [dataTask resume];
    if (![self connectToProxy]) {
        HippyLogError(@"Connection to %@ timed out. Are you running node proxy? If "
                    "you are running on the device, check if you have the right IP "
                    "address in `HippyWebSocketExecutor.m`.", _url);
        [self invalidate];
        return;
    }
    
    NSInteger retries = 3;
    BOOL runtimeIsReady = [self prepareJSRuntime];
    while (!runtimeIsReady && retries > 0) {
        runtimeIsReady = [self prepareJSRuntime];
        retries--;
    }
    if (!runtimeIsReady) {
        HippyLogError(@"Runtime is not ready for debugging.\n "
                    "- Make sure Packager server is running.\n"
                    "- Make sure the JavaScript Debugger is running and not paused on a breakpoint or exception and try reloading again.");
        [self invalidate];
        return;
    }
}

- (BOOL)connectToProxy
{
    _socketOpenSemaphore = dispatch_semaphore_create(0);
    [_socket open];
    long connected = dispatch_semaphore_wait(_socketOpenSemaphore, dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC * 10));
    return connected == 0;
}

- (BOOL)prepareJSRuntime
{
    __block NSError *initError;
    dispatch_semaphore_t s = dispatch_semaphore_create(0);
    [self sendMessage:@{@"method": @"prepareJSRuntime"} waitForReply:^(NSError *error, __unused NSDictionary<NSString *, id> *reply) {
        initError = error;
        dispatch_semaphore_signal(s);
    }];
    long runtimeIsReady = dispatch_semaphore_wait(s, dispatch_time(DISPATCH_TIME_NOW, NSEC_PER_SEC));
    return runtimeIsReady == 0 && initError == nil;
}

- (void)webSocket:(__unused HippySRWebSocket *)webSocket didReceiveMessage:(id)message
{
    NSError *error = nil;
    NSDictionary<NSString *, id> *reply = HippyJSONParse(message, &error);
    if (reply[@"flushQueueImmediate"]) {
        NSString *result = reply[@"arguments"][@"result"];
        id objcValue = HippyJSONParse(result, NULL);
        [self.bridge processResponse: objcValue error: error];
    } else {
        NSNumber *messageID = reply[@"arguments"][@"replyID"];
        HippyWSMessageCallback callback = _callbacks[messageID];
        if (callback) {
            callback(error, reply[@"arguments"]);
        }
    }
    
}

- (void)webSocketDidOpen:(__unused HippySRWebSocket *)webSocket
{
    dispatch_semaphore_signal(_socketOpenSemaphore);
}

- (void)webSocket:(__unused HippySRWebSocket *)webSocket didFailWithError:(__unused NSError *)error
{
    dispatch_semaphore_signal(_socketOpenSemaphore);
    dispatch_async(dispatch_get_main_queue(), ^{
        // Give the setUp method an opportunity to report an error first
        HippyLogError(@"WebSocket connection failed with error %@", error);
    });
}

- (void)sendMessage:(NSDictionary<NSString *, id> *)message waitForReply:(HippyWSMessageCallback)callback
{
    if (!self.valid) {
        return;
    }
    
    static NSUInteger lastID = 10000;
    
    dispatch_async(_jsQueue, ^{
        if (!self.valid) {
            NSError *error = [NSError errorWithDomain:@"WS" code:1 userInfo:@{
                                                                              NSLocalizedDescriptionKey: @"Runtime is not ready for debugging. Make sure Packager server is running."
                                                                              }];
            callback(error, nil);
            return;
        }
        
        NSNumber *expectedID = @(lastID++);
        self->_callbacks[expectedID] = [callback copy];
        NSMutableDictionary<NSString *, id> *messageWithID = [message mutableCopy];
        messageWithID[@"id"] = expectedID;
        [self->_socket send:HippyJSONStringify(messageWithID, NULL)];
    });
}

- (void)executeApplicationScript:(__unused NSData *)script sourceURL:(NSURL *)URL onComplete:(HippyJavaScriptCompleteBlock)onComplete
{
    NSDictionary<NSString *, id> *message = @{
                                              @"method": @"executeApplicationScript",
                                              @"url": HippyNullIfNil(URL.absoluteString),
                                              @"inject": _injectedObjects,
                                              };
    [self sendMessage:message waitForReply:^(NSError *error, __unused NSDictionary<NSString *, id> *reply) {
        if (onComplete) {
            onComplete(error);
        }
    }];
}

- (void)flushedQueue:(HippyJavaScriptCallback)onComplete
{
    [self _executeJSCall:@"flushedQueue" arguments:@[] callback:onComplete];
}

- (void)callFunctionOnModule:(NSString *)module
                      method:(NSString *)method
                   arguments:(NSArray *)args
                    callback:(HippyJavaScriptCallback)onComplete
{
    [self _executeJSCall:@"callFunctionReturnFlushedQueue" arguments:@[module, method, args] callback:onComplete];
}

- (void)invokeCallbackID:(NSNumber *)cbID
               arguments:(NSArray *)args
                callback:(HippyJavaScriptCallback)onComplete
{
    [self _executeJSCall:@"invokeCallbackAndReturnFlushedQueue" arguments:@[cbID, args] callback:onComplete];
}

- (void)_executeJSCall:(NSString *)method arguments:(NSArray *)arguments callback:(HippyJavaScriptCallback)onComplete
{
    HippyAssert(onComplete != nil, @"callback was missing for exec JS call");
    NSDictionary<NSString *, id> *message = @{
                                              @"method": method,
                                              @"arguments": arguments
                                              };
    [self sendMessage:message waitForReply:^(NSError *socketError, NSDictionary<NSString *, id> *reply) {
        if (socketError) {
            onComplete(nil, socketError);
            return;
        }
        
        NSString *result = reply[@"result"];
        id objcValue = HippyJSONParse(result, NULL);
        onComplete(objcValue, nil);
    }];
}

- (void)injectJSONText:(NSString *)script asGlobalObjectNamed:(NSString *)objectName callback:(HippyJavaScriptCompleteBlock)onComplete
{
    dispatch_async(_jsQueue, ^{
        self->_injectedObjects[objectName] = script;
        onComplete(nil);
    });
}

- (void)executeBlockOnJavaScriptQueue:(dispatch_block_t)block
{
    HippyExecuteOnMainQueue(block);
}

- (void)executeAsyncBlockOnJavaScriptQueue:(dispatch_block_t)block
{
    dispatch_async(dispatch_get_main_queue(), block);
}

- (void)invalidate
{
    _socket.delegate = nil;
    [_socket closeWithCode:1000 reason:@"Invalidated"];
    _socket = nil;
}

- (BOOL)isValid
{
    return _socket != nil && _socket.readyState == HippySR_OPEN;
}

- (void)dealloc
{
    HippyAssert(!self.valid, @"-invalidate must be called before -dealloc");
}

@end

#endif
