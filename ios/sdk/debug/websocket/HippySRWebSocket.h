//
//   Copyright 2012 Square Inc.
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

#import <Foundation/Foundation.h>
#import <Security/SecCertificate.h>

typedef NS_ENUM(unsigned int, HippySRReadyState) {
    HippySR_CONNECTING   = 0,
    HippySR_OPEN         = 1,
    HippySR_CLOSING      = 2,
    HippySR_CLOSED       = 3,
};

typedef NS_ENUM(NSInteger, HippySRStatusCode) {
    HippySRStatusCodeNormal = 1000,
    HippySRStatusCodeGoingAway = 1001,
    HippySRStatusCodeProtocolError = 1002,
    HippySRStatusCodeUnhandledType = 1003,
    // 1004 reserved.
    HippySRStatusNoStatusReceived = 1005,
    // 1004-1006 reserved.
    HippySRStatusCodeInvalidUTF8 = 1007,
    HippySRStatusCodePolicyViolated = 1008,
    HippySRStatusCodeMessageTooBig = 1009,
};

@class HippySRWebSocket;

extern NSString *const HippySRWebSocketErrorDomain;
extern NSString *const HippySRHTTPResponseErrorKey;

#pragma mark - HippySRWebSocketDelegate

@protocol HippySRWebSocketDelegate;

#pragma mark - HippySRWebSocket

@interface HippySRWebSocket : NSObject <NSStreamDelegate>

@property (nonatomic, weak) id<HippySRWebSocketDelegate> delegate;

@property (nonatomic, readonly) HippySRReadyState readyState;
@property (nonatomic, readonly, strong) NSURL *url;
@property (nonatomic, assign) NSUInteger socketID;

// This returns the negotiated protocol.
// It will be nil until after the handshake completes.
@property (nonatomic, readonly, copy) NSString *protocol;

// Protocols should be an array of strings that turn into Sec-WebSocket-Protocol.
- (instancetype)initWithURLRequest:(NSURLRequest *)request protocols:(NSArray<NSString *> *)protocols NS_DESIGNATED_INITIALIZER;
- (instancetype)initWithURLRequest:(NSURLRequest *)request;

// Some helper constructors.
- (instancetype)initWithURL:(NSURL *)url protocols:(NSArray<NSString *> *)protocols;
- (instancetype)initWithURL:(NSURL *)url;

// Delegate queue will be dispatch_main_queue by default.
// You cannot set both OperationQueue and dispatch_queue.
- (void)setDelegateOperationQueue:(NSOperationQueue *)queue;
- (void)setDelegateDispatchQueue:(dispatch_queue_t)queue;

// By default, it will schedule itself on +[NSRunLoop HippySR_networkRunLoop] using defaultModes.
- (void)scheduleInRunLoop:(NSRunLoop *)aRunLoop forMode:(NSString *)mode;
- (void)unscheduleFromRunLoop:(NSRunLoop *)aRunLoop forMode:(NSString *)mode;

// HippySRWebSockets are intended for one-time-use only.  Open should be called once and only once.
- (void)open;

- (void)close;
- (void)closeWithCode:(NSInteger)code reason:(NSString *)reason;

// Send a UTF8 String or Data.
- (void)send:(id)data;

// Send Data (can be nil) in a ping message.
- (void)sendPing:(NSData *)data;

@end

#pragma mark - HippySRWebSocketDelegate

@protocol HippySRWebSocketDelegate <NSObject>

// message will either be an NSString if the server is using text
// or NSData if the server is using binary.
- (void)webSocket:(HippySRWebSocket *)webSocket didReceiveMessage:(id)message;

@optional

- (void)webSocketDidOpen:(HippySRWebSocket *)webSocket;
- (void)webSocket:(HippySRWebSocket *)webSocket didFailWithError:(NSError *)error;
- (void)webSocket:(HippySRWebSocket *)webSocket didCloseWithCode:(NSInteger)code reason:(NSString *)reason wasClean:(BOOL)wasClean;
- (void)webSocket:(HippySRWebSocket *)webSocket didReceivePong:(NSData *)pongPayload;

@end

#pragma mark - NSURLRequest (CertificateAdditions)

@interface NSURLRequest (CertificateAdditions)

@property (nonatomic, readonly, copy) NSArray *HippySR_SSLPinnedCertificates;

@end

#pragma mark - NSMutableURLRequest (CertificateAdditions)

@interface NSMutableURLRequest (CertificateAdditions)

@property (nonatomic, copy) NSArray *HippySR_SSLPinnedCertificates;

@end

#pragma mark - NSRunLoop (HippySRWebSocket)

@interface NSRunLoop (HippySRWebSocket)

+ (NSRunLoop *)HippySR_networkRunLoop;

@end
