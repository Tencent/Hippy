/*
 *
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.
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

#import <UIKit/UIKit.h>
#import "TurboBaseModule.h"
#import "HippyBridgeModule.h"
#import "TurboConfig.h"
#import "HippyBridge.h"

@implementation TurboBaseModule

HIPPY_EXPORT_TURBO_MODULE(demoTurbo)

HIPPY_EXPORT_TURBO_METHOD(getString:(NSString *)string) {
    return string;
}

HIPPY_EXPORT_TURBO_METHOD(getNum:(int)number) {
    return @(number);
}

HIPPY_EXPORT_TURBO_METHOD(getBoolean:(BOOL)result) {
    return @(result);
}

HIPPY_EXPORT_TURBO_METHOD(getMap:(id)map) {
    return map;
}

HIPPY_EXPORT_TURBO_METHOD(getObject:(NSDictionary *)obj) {
    return obj;
}

HIPPY_EXPORT_TURBO_METHOD(getArray:(NSArray *)array) {
    return array;
}

HIPPY_EXPORT_TURBO_METHOD(getTurboConfig) {
    return [self.bridge turboModuleWithName:[TurboConfig turoboModuleName]];
}

HIPPY_EXPORT_TURBO_METHOD(printTurboConfig:(TurboConfig *)turboConfig) {
    TurboConfig *localConfig = [self.bridge turboModuleWithName:[TurboConfig turoboModuleName]];
    NSLog(@"====> turboConfig:%@, self.turboConfig:%@", turboConfig, localConfig);
    return [turboConfig description];
}

HIPPY_EXPORT_TURBO_METHOD(nativeWithPromise:(nullable id)params
                          promise:(HippyPromiseResolveBlock)promise
                          reject:(HippyPromiseRejectBlock)reject) {
    promise([NSString stringWithFormat:@"iOS[%@]: Native call promise!",
             NSStringFromClass([self class])]);
    // reject(@"-1", @"xxxxx", [NSError errorWithDomain:@"test" code:-1 userInfo:nil]);
    return nil;
}

@end
