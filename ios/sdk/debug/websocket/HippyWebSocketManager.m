/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2019 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#import "HippyDefines.h"

#if HIPPY_DEV // Only supported in dev mode

#import "HippyWebSocketManager.h"

#import "HippyConvert.h"
#import "HippyLog.h"
#import "HippyUtils.h"
#import "HippySRWebSocket.h"

#pragma mark - HippyWebSocketObserver

@interface HippyWebSocketObserver : NSObject <HippySRWebSocketDelegate> {
    NSURL *_url;
}

@property (nonatomic, strong) HippySRWebSocket *socket;
@property (nonatomic, weak) id<HippyWebSocketProxyDelegate> delegate;
@property (nonatomic, strong) dispatch_semaphore_t socketOpenSemaphore;

- (instancetype)initWithURL:(NSURL *)url delegate:(id<HippyWebSocketProxyDelegate>)delegate;

@end

@implementation HippyWebSocketObserver

- (instancetype)initWithURL:(NSURL *)url delegate:(id<HippyWebSocketProxyDelegate>)delegate
{
    if ((self = [self init])) {
        _url = url;
        _delegate = delegate;
    }
    return self;
}

- (void)start
{
    [self stop];
    _socket = [[HippySRWebSocket alloc] initWithURL:_url];
    _socket.delegate = self;
    
    [_socket open];
}

- (void)stop
{
    _socket.delegate = nil;
    [_socket closeWithCode:1000 reason:@"Invalidated"];
    _socket = nil;
}

- (void)webSocket:(__unused HippySRWebSocket *)webSocket didReceiveMessage:(id)message
{
    if (_delegate) {
        NSError *error = nil;
        NSDictionary<NSString *, id> *msg = HippyJSONParse(message, &error);
        
        if (!error) {
            [_delegate socketProxy:[HippyWebSocketManager sharedInstance] didReceiveMessage:msg];
        } else {
            HippyLogError(@"WebSocketManager failed to parse message with error %@\n<message>\n%@\n</message>", error, message);
        }
    }
}

- (void)reconnect
{
    __weak HippySRWebSocket *socket = _socket;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        // Only reconnect if the observer wasn't stoppped while we were waiting
        if (socket) {
            [self start];
        }
    });
}

- (void)webSocket:(__unused HippySRWebSocket *)webSocket didFailWithError:(__unused NSError *)error
{
    [self reconnect];
}

- (void)webSocket:(__unused HippySRWebSocket *)webSocket didCloseWithCode:(__unused NSInteger)code reason:(__unused NSString *)reason wasClean:(__unused BOOL)wasClean
{
    [self reconnect];
}

@end

#pragma mark - HippyWebSocketManager

@interface HippyWebSocketManager()

@property (nonatomic, strong) NSMutableDictionary *sockets;
@property (nonatomic, strong) dispatch_queue_t queue;

@end

@implementation HippyWebSocketManager

+ (instancetype)sharedInstance
{
    static HippyWebSocketManager *sharedInstance = nil;
    static dispatch_once_t onceToken;
    
    dispatch_once(&onceToken, ^{
        sharedInstance = [self new];
    });
    
    return sharedInstance;
}

- (void)setDelegate:(id<HippyWebSocketProxyDelegate>)delegate forURL:(NSURL *)url
{
    NSString *key = [url absoluteString];
    HippyWebSocketObserver *observer = _sockets[key];
    
    if (observer) {
        if (!delegate) {
            [observer stop];
            [_sockets removeObjectForKey:key];
        } else {
            observer.delegate = delegate;
        }
    } else {
        HippyWebSocketObserver *newObserver = [[HippyWebSocketObserver alloc] initWithURL:url delegate:delegate];
        [newObserver start];
        _sockets[key] = newObserver;
    }
}

- (instancetype)init
{
    if ((self = [super init])) {
        _sockets = [NSMutableDictionary new];
        _queue = dispatch_queue_create("com.tencent.hippy.WebSocketManager", DISPATCH_QUEUE_SERIAL);
    }
    return self;
}

@end

#endif
