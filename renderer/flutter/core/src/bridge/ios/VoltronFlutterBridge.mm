//
//  VoltronFlutterBridge.m
//  RenderCore
//
//  Created by songshaohong on 2021/1/17.
//

#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#elif TARGET_OS_MAC
#import <Cocoa/Cocoa.h>
#endif
#import <sys/utsname.h>

#import "VoltronFlutterBridge.h"
#import "VoltronJSCExecutor.h"
#import "utils/VoltronLog.h"
#import "utils/VoltronUtils.h"
#include "core/base/string_view_utils.h"
#include "bridge/string_util.h"

using StringViewUtils = hippy::base::StringViewUtils;

static NSString *const _VoltronSDKVersion = @"1.0.0";

@interface VoltronFlutterBridge () <VoltronJSCExecutorProvider>
@property (nonatomic, strong) VoltronJSCExecutor *jscExecutor;

@end


@implementation VoltronFlutterBridge

+ (void)load {
    [self initCommonVars];
}

- (void)initJSFramework:(NSString *)globalConfig completion:(void (^)(BOOL))completion {
    if (self.jscExecutor) {
        NSAssert(0, @"initJSFramework has called");
        return;
    }
  
    __weak typeof(self) weakSelf = self;
    VoltronFrameworkInitCallback callback = [weakSelf, completion](BOOL result) {
      NSError *error;
      if (!result) {
        error = [NSError errorWithDomain:VoltronErrorDomain code:2 userInfo:@{NSLocalizedDescriptionKey: @"cannot initJSFramework"}];
      }
      typeof(self) strongSelf = weakSelf;
      [strongSelf dealWithError:error];
      if (!strongSelf || error) {
          if (completion) {
              completion(NO);
          }
          return;
      }

      if (completion) {
          completion(YES);
      }
    };
    
    self.jscExecutor = [[VoltronJSCExecutor alloc] initWithExecurotKey:@"VoltronExecutor" globalConfig:globalConfig completion:callback];
    self.jscExecutor.provider = self;
    [self.jscExecutor setUp];
}

- (void)dealloc {
    
}

+ (void)initCommonVars {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        
    });
}

- (void)executeScript:(NSData *)script url:(NSURL *)url completion:(void (^)(NSError * _Nonnull))completion {
    __weak typeof(self) weakSelf = self;
    [self.jscExecutor executeApplicationScript:script sourceURL:url onComplete:^(NSError *error) {
        typeof(self) strongSelf = weakSelf;
        [strongSelf dealWithError:error];
        
        if (completion) {
            completion(error);
        }
    }];
}

// dart2js
- (void)callFunctionOnAction:(NSString *)action arguments:(NSDictionary *)args callback:(VoltronFlutterCallback)onComplete {
    __weak typeof(self) weakSelf = self;
    [self.jscExecutor callFunctionOnAction:action arguments:args callback:^(id result, NSError *error) {
        VoltronLog(@"callFunctionOnAction:%@ arg:%@ result:%@ error:%@", action, args, result, error);
        typeof(self) strongSelf = weakSelf;
        [strongSelf dealWithError:error];
        
        if (onComplete) {
            onComplete(result, error);
        }
    }];
}

//js2dart
- (id)callNativeModule:(NSString *)module
                method:(NSString *)method
                params:(NSArray *)params
                callId:(NSString *)callId {
    if (module == nil || method == nil) {
        return nil;
    }
    
    if ([method isEqualToString:@"log"]) {
        VoltronLog(@"%@", params);
        return nil;
    }
    VoltronLog(@"callNativeModule:%@ method:%@ params:%@ callId:%@", module, method, params, callId);
    if (!self.platformRuntime) {
        return nil;
    }
    
    if (![NSJSONSerialization isValidJSONObject:params]) {
        VoltronLog(@"params is not valid json");
        params = @[];
    }
    NSData *data = [NSJSONSerialization dataWithJSONObject:params options:0 error:nil];
    
    const char16_t* cModule = copyChar16(NSStringToU16(module).c_str(), (int)module.length);
    const char16_t* cMethod = copyChar16(NSStringToU16(method).c_str(), (int)method.length);
    const char16_t* cCallId = copyChar16(NSStringToU16(callId).c_str(), (int)callId.length);
    const void* buf = [data bytes];
    self.platformRuntime->CallNaive(cModule, cMethod, cCallId, buf, (uint32_t)[data length], true,
                                    [cModule, cMethod, data, cCallId]() {
      free((void *)cModule);
      free((void *)cMethod);
      free((void *)cCallId);
    }, false);
    return nil;
}

const char* getStrCopy(const char* origin, NSInteger len) {
    void *buf = (void *)malloc((size_t)(len + 1));
    memcpy(buf, origin, (size_t)(len + 1));
    return (char *)buf;
}

static std::u16string NSStringToU16(NSString* str) {
  if (!str) {
    return u"";
  }
  unsigned long len = str.length;
  std::u16string ret;
  ret.resize(len);
  unichar *p = reinterpret_cast<unichar*>(const_cast<char16_t*>(&ret[0]));
  [str getCharacters:p range:NSRange{0, len}];
  return ret;
}

#pragma mark - Exception

- (void)dealWithError:(NSError *)error {
    if (!error) {
        return;
    }
    
    VoltronLog(@"execute js error: %@", error);
    NSString *traceMsg;
    id traceKey = [error userInfo][@"VoltronJSStackTraceKey"];
    if ([traceKey isKindOfClass:[NSString class]]) {
        traceMsg = traceKey;
    } else if ([NSJSONSerialization isValidJSONObject:traceKey]) {
        NSData *data = [NSJSONSerialization dataWithJSONObject:traceKey options:0 error:nil];
        traceMsg = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    }
    NSString *descriptMsg = error.localizedDescription ?: @"";
    NSString *traceMessage = traceMsg ?: @"";

    self.platformRuntime->ReportJSException(copyChar16(NSStringToU16(descriptMsg).c_str(), (int)descriptMsg.length),
                                            copyChar16(NSStringToU16(traceMessage).c_str(), (int)traceMessage.length));
}

@end
