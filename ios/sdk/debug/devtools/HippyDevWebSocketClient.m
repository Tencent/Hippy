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

#import "HippyDevWebSocketClient.h"
#import "HippySRWebSocket.h"
#import "HippyAssert.h"
#import "HippyLog.h"
#import <UIKit/UIDevice.h>

static NSString *generateRandomUUID(void) {
    static char alpha[] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    static uint32_t length = 16;
    char buffer[length + 1];
    for (NSInteger i = 0; i < length; i++) {
        uint32_t index = arc4random_uniform(length);
        buffer[i] = alpha[index];
    }
    buffer[length] = '\0';
    return [NSString stringWithCString:buffer encoding:NSUTF8StringEncoding];
}

static __unused NSString *UUIDForContextName(NSString *contextName) {
    static dispatch_once_t onceToken;
    static NSMutableDictionary *UUIDPairs = nil;
    dispatch_once(&onceToken, ^{
        UUIDPairs = [NSMutableDictionary dictionary];
    });
    if (contextName) {
        NSString *UUIDString = UUIDPairs[contextName];
        if (!UUIDString) {
            UUIDString = generateRandomUUID();
            [UUIDPairs setObject:UUIDString forKey:contextName];
        }
        return UUIDString;
    } else {
        return generateRandomUUID();
    }
}

static const char *stringFromReadyState(HippySRReadyState state) {
    const char *c_state;
    switch (state) {
        case HippySR_CONNECTING:
            c_state = "connection";
            break;
        case HippySR_OPEN:
            c_state = "open";
            break;
        case HippySR_CLOSING:
            c_state = "closing";
            break;
        case HippySR_CLOSED:
            c_state = "closed";
            break;
        default:
            c_state = "state error";
            break;
    }
    return c_state;
}

@interface HippyDevWebSocketClient ()<HippySRWebSocketDelegate> {
    NSURL *_devURL;
    dispatch_queue_t _devQueue;
    HippySRWebSocket *_devWebSocket;
}

@end

@implementation HippyDevWebSocketClient

#pragma mark initialization methods

- (instancetype)initWithDevInfo:(HippyDevInfo *)devInfo
                    contextName:(NSString *)contextName
                       clientId:(NSString *)clientId {
    //ws://127.0.0.1:38989/debugger-proxy?clientId={clientId}&platform=1&role=ios_client&contextName={urlencode(contextName)}&deviceName={urlencode(deviceName)}
    HippyAssertParam(devInfo.ipAddress);
    self = [super init];
    if (self) {
        NSCharacterSet *allowedChar = [[NSCharacterSet characterSetWithCharactersInString:@"?!@#$^&%*+,:;='\"`<>()[]{}/\\| "] invertedSet];
        NSString *encodeName = [contextName stringByAddingPercentEncodingWithAllowedCharacters:allowedChar];
        NSString *deviceName = [[UIDevice currentDevice] name];
        NSString *encodedDeviceName = [deviceName stringByAddingPercentEncodingWithAllowedCharacters:allowedChar];
        NSString *port = devInfo.port;
        if (port.length <= 0) {
            port = [devInfo.scheme isEqualToString:@"wss"] ? @"443": @"80";
        }
        NSString *addressPrefix = [NSString stringWithFormat:@"%@://%@:%@/debugger-proxy", devInfo.scheme, devInfo.ipAddress, port];
        if (devInfo.wsURL.length > 0) {
            // wsURL has a high priority
            addressPrefix = devInfo.wsURL;
        }
        if ([addressPrefix containsString:@"?"]) {
            addressPrefix = [NSString stringWithFormat:@"%@&", addressPrefix];
        } else {
            addressPrefix = [NSString stringWithFormat:@"%@?", addressPrefix];
        }
        NSString *devAddress = [NSString stringWithFormat:@"%@clientId=%@&platform=1&role=ios_client&contextName=%@&deviceName=%@", addressPrefix, clientId, encodeName, encodedDeviceName];
        if (devInfo.versionId.length > 0) {
            devAddress = [NSString stringWithFormat:@"%@&hash=%@", devAddress, devInfo.versionId];
        }
        _devURL = [NSURL URLWithString:devAddress];
        HippyLog(@"[DevTools client]:try to connect to %@", devAddress);
        [self setup];
    }
    return self;
}

- (void)setup {
    _devQueue = dispatch_queue_create("com.tencent.hippy.devQueue", DISPATCH_QUEUE_SERIAL);
    _devWebSocket = [[HippySRWebSocket alloc] initWithURL:_devURL];
    _devWebSocket.delegate = self;
    [_devWebSocket setDelegateDispatchQueue:_devQueue];
    
    [_devWebSocket open];
}

#pragma mark property setter/getter
- (NSURL *)devURL {
    return _devURL;
}

- (HippyDevWebSocketState)state {
    return (HippyDevWebSocketState)[_devWebSocket readyState];
}

#pragma mask other methods
- (NSString *)description {
    NSString *desString = [NSString stringWithFormat:@"ws address %@, state %s", _devURL, stringFromReadyState(_devWebSocket.readyState)];
    return [NSString stringWithFormat:@"%@, %@", [super description], desString];
}

- (void)sendData:(id)data {
    [_devWebSocket send:data];
}

- (void)closeWithCode:(NSInteger)code reason:(NSString *)reason {
    if (!_devWebSocket) {
        return;
    }
    [_devWebSocket closeWithCode:code reason:reason];
}

#pragma mark dev websocket delegate methods
- (void)webSocket:(HippySRWebSocket *)webSocket didReceiveMessage:(id)message {
    HippyLog(@"[DevTools client]:did receive message %@", message);
    if ([_delegate respondsToSelector:@selector(devClient:didReceiveMessage:)]) {
        [_delegate devClient:self didReceiveMessage:message];
    }
}

- (void)webSocketDidOpen:(HippySRWebSocket *)webSocket {
    HippyLog(@"[DevTools client]:ws open %@", [self devURL]);
    if ([_delegate respondsToSelector:@selector(devClientDidConnect:)]) {
        [_delegate devClientDidConnect:self];
    }
}

- (void)webSocket:(HippySRWebSocket *)webSocket didFailWithError:(NSError *)error {
    HippyLog(@"[DevTools client]:ws failed with error %@", error);
    if ([_delegate respondsToSelector:@selector(devClient:didFailWithError:)]) {
        [_delegate devClient:self didFailWithError:error];
    }
}

- (void)webSocket:(HippySRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean {
    HippyLog(@"[DevTools client]:closed for reason %@", reason);
    if ([_delegate respondsToSelector:@selector(devClientDidClose:)]) {
        [_delegate devClientDidClose:self];
    }
}

- (void)webSocket:(HippySRWebSocket *)webSocket didReceivePong:(NSData *)pongPayload {
    
}

@end
