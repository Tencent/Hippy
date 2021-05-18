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
#import "HippyWebSocketManager.h"
#import "HippyConvert.h"
#import "HippyLog.h"
#import "HippyUtils.h"
#import "HippySRWebSocket.h"

static NSUInteger socketIndex = 0;

#pragma mark - HippyWebSocketManager

@interface HippyWebSocketManager () <HippySRWebSocketDelegate>

@property (nonatomic, strong) NSMutableDictionary<NSNumber *, HippySRWebSocket *> *sockets;
@property (nonatomic, strong) dispatch_queue_t queue;

@end

@implementation HippyWebSocketManager

HIPPY_EXPORT_MODULE(websocket)

- (dispatch_queue_t)methodQueue {
    return _queue;
}

- (instancetype)init {
    if ((self = [super init])) {
        _sockets = [NSMutableDictionary new];
        _queue = dispatch_queue_create("com.tencent.hippy.WebSocketManager", DISPATCH_QUEUE_SERIAL);
    }
    return self;
}

- (void)invalidate {
    for (HippySRWebSocket *socket in _sockets.allValues) {
        socket.delegate = nil;
        [socket close];
    }
}

// clang-format off
HIPPY_EXPORT_METHOD(connect:(NSDictionary *)params resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
    NSDictionary *headers = params[@"headers"];
    NSString *url = params[@"url"];
    NSString *protocols = headers[@"Sec-WebSocket-Protocol"];
    NSArray<NSString *> *protocolArray = [protocols componentsSeparatedByString:@","];
    HippySRWebSocket *socket = [[HippySRWebSocket alloc] initWithURL:[NSURL URLWithString:url] protocols:protocolArray];
    socket.delegate = self;
    socket.socketID = socketIndex++;
    NSNumber *socketId = @(socket.socketID);
    [_sockets setObject:socket forKey:socketId];
    resolve(@{@"code": @(0), @"id": socketId});
    [socket open];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(close:(NSDictionary *)params) {
    NSNumber *socketId = params[@"id"];
    NSNumber *code = params[@"code"];
    NSString *reason = params[@"reason"];
    HippySRWebSocket *socket = [_sockets objectForKey:socketId];
    if (socket) {
        if (code) {
            [socket closeWithCode:[code integerValue] reason:reason];
        }
        else {
            [socket close];
        }
    }
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(send:(NSDictionary *)params) {
    NSNumber *socketId = params[@"id"];
    NSString *data = params[@"data"];
    HippySRWebSocket *socket = [_sockets objectForKey:socketId];
    if (socket) {
        [socket send:data];
    }
}
// clang-format on

- (void)webSocket:(HippySRWebSocket *)webSocket didReceiveMessage:(id)message {
    dispatch_async(_queue, ^{
        [self sendEventType:@"onMessage" socket:webSocket data:@ { @"type": @"text", @"data": message }];
    });
}

- (void)webSocketDidOpen:(HippySRWebSocket *)webSocket {
    dispatch_async(_queue, ^{
        [self sendEventType:@"onOpen" socket:webSocket data:@ {}];
    });
}

- (void)webSocket:(HippySRWebSocket *)webSocket didFailWithError:(NSError *)error {
    NSString *errString = [error localizedFailureReason];
    [self sendEventType:@"onError" socket:webSocket data:@{ @"error": errString }];
    [_sockets removeObjectForKey:@(webSocket.socketID)];
}

- (void)webSocket:(HippySRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean {
    NSDictionary *data = @{ @"code": @(code), @"reason": reason };
    [self sendEventType:@"onClose" socket:webSocket data:data];
    [_sockets removeObjectForKey:@(webSocket.socketID)];
}

- (void)webSocket:(HippySRWebSocket *)webSocket didReceivePong:(NSData *)pongPayload {
}

- (void)sendEventType:(NSString *)type socket:(HippySRWebSocket *)socket data:(id)data {
    for (NSNumber *key in [_sockets allKeys]) {
        HippySRWebSocket *canSocket = [_sockets objectForKey:key];
        if (canSocket == socket) {
            NSDictionary *params = @{ @"id": key, @"type": type, @"data": data ?: @ {} };
            [self sendEvent:@"hippyWebsocketEvents" params:params];
            break;
        }
    }
}

@end
