/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */


#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#elif TARGET_OS_MAC
#import <Cocoa/Cocoa.h>
#endif
#import <sys/utsname.h>

#import "VoltronFlutterBridge.h"
#import "utils/VoltronLog.h"
#import "utils/VoltronUtils.h"
#include "core/base/string_view_utils.h"

using StringViewUtils = hippy::base::StringViewUtils;

static NSString *const _VoltronSDKVersion = @"1.0.0";

@interface VoltronFlutterBridge () <VoltronJSCExecutorProvider>
@end


@implementation VoltronFlutterBridge

+ (void)load {
    [self initCommonVars];
}

- (void)initJSFramework:(NSString *)globalConfig wsURL:(NSString *)wsURL debugMode:(BOOL)debugMode completion:(void (^)(BOOL))completion {
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

    self.jscExecutor = [[VoltronJSCExecutor alloc] initWithExecurotKey:@"VoltronExecutor"
                                                          globalConfig:globalConfig
                                                                 wsURL:wsURL
                                                             debugMode:debugMode
                                                            completion:callback];
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

    std::u16string cModule = NSStringToU16(module);
    std::u16string cMethod = NSStringToU16(method);
    std::u16string cCallId = NSStringToU16(callId);
    
    self.platformRuntime->CallDart(cModule, cMethod, cCallId, std::move(CopyToStr(data)), true,
                                    nullptr);
    return nil;
}

const char* getStrCopy(const char* origin, NSInteger len) {
    auto origin_len = strlen(origin);
    auto copy_len = (long)len;
    if (copy_len > origin_len) {
        copy_len = origin_len;
    }
    void *buf = (void *)malloc((size_t)(copy_len + 1));
    memcpy(buf, origin, (size_t)(copy_len + 1));
    return (char *)buf;
}

static std::string CopyToStr(NSData* data) {
  if (!data) {
    return nullptr;
  }
  unsigned long len = [data length];
  if (len > 0) {
    const void* origin_buf = [data bytes];
    std::string copy_str(reinterpret_cast<const char*>(origin_buf), [data length]);
    return copy_str;
  }
    
  return nullptr;
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

    std::u16string cDescriptMsg = NSStringToU16(descriptMsg);
    std::u16string ctTraceMessage = NSStringToU16(traceMessage);
    self.platformRuntime->ReportJSException(cDescriptMsg,
                                            ctTraceMessage);
}

@end
