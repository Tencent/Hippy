//
//  HippyDevWebSocketClient.m
//  HippyDemo
//
//  Created by mengyanluo on 2021/10/20.
//  Copyright © 2021 tencent. All rights reserved.
//

#import "HippyDevWebSocketClient.h"
#import "HippySRWebSocket.h"
#import "HippyAssert.h"
#import "HippyLog.h"

static NSString *generateRandomUUID() {
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

- (instancetype)initWithDevIPAddress:(NSString *)ipAddress port:(NSString *)port contextName:(NSString *)contextName {
    //ws://127.0.0.1:38989/debugger-proxy?clientId=123145124&platform=1&role=ios_client
    HippyAssertParam(ipAddress);
    self = [super init];
    if (self) {
        NSString *uuid = generateRandomUUID();
        NSCharacterSet *allowedChar = [[NSCharacterSet characterSetWithCharactersInString:@"?!@#$^&%*+,:;='\"`<>()[]{}/\\| "] invertedSet];
        NSString *encodeName = [contextName stringByAddingPercentEncodingWithAllowedCharacters:allowedChar];
        NSString *devAddress = [NSString stringWithFormat:@"ws://%@:%@/debugger-proxy?clientId=%@&platform=1&role=ios_client&contextName=%@", ipAddress, port?:@"38989", uuid, encodeName];
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

#pragma mask other methods
- (NSString *)description {
    NSString *desString = [NSString stringWithFormat:@"ws address %@, state %s", _devURL, stringFromReadyState(_devWebSocket.readyState)];
    return [NSString stringWithFormat:@"%@, %@", [super description], desString];
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
