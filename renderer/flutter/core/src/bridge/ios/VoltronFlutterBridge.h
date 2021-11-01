//
//  HippyFlutterBridge.h
//  RenderCore
//
//  Created by songshaohong on 2021/1/17.
//

#import <Foundation/Foundation.h>
#import "bridge/bridge_runtime.h"

NS_ASSUME_NONNULL_BEGIN

typedef void (^VoltronFlutterCallback)(id _Nullable result, NSError * _Nullable error);

@interface VoltronFlutterBridge : NSObject

@property (nonatomic, assign) std::shared_ptr<PlatformRuntime> platformRuntime;

- (void)initJSFramework:(NSString *)globalConfig completion:(void (^)(BOOL) _Nullable)completion;

- (void)executeScript:(NSData *)script url:(NSURL *)url completion:(void (^)(NSError * _Nullable) _Nullable)completion;

- (void)callFunctionOnAction:(NSString *)action
                   arguments:(NSDictionary *)args
                    callback:(VoltronFlutterCallback _Nullable)onComplete;

@end

NS_ASSUME_NONNULL_END
