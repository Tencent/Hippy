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

#import "HippyPerformanceLoggerModule.h"
#import "HippyPerformanceLogger.h"
#import "HippyBridge.h"

@implementation HippyPerformanceLoggerModule

@synthesize bridge = _bridge;
HIPPY_EXPORT_MODULE(PerformanceLogger)

HIPPY_EXPORT_METHOD(markStart:(NSString *)stage value:(NSInteger)value) {
    [self.bridge.performanceLogger markStartForCustomTag:stage value:value];
}

HIPPY_EXPORT_METHOD(markEnd:(NSString *)stage value:(NSInteger)value) {
    [self.bridge.performanceLogger markStopForCustomTag:stage value:value];
}

HIPPY_EXPORT_METHOD(setValueForStage:(NSString *)stage value:(NSInteger)value) {
    [self.bridge.performanceLogger setValue:value forCustomTag:stage];
}

HIPPY_EXPORT_METHOD(getAll:(HippyPromiseResolveBlock)resolve
                    reject:(__unused HippyPromiseRejectBlock)reject) {
    NSArray<NSNumber *> *allValues = [self.bridge.performanceLogger valuesForTags];
    NSArray *allCustomLabels = [self.bridge.performanceLogger allCustomTags];
    NSMutableArray *results = [NSMutableArray arrayWithCapacity:HippyPLSize + allCustomLabels.count];
    for (int i = HippyPLNativeModuleInit; i < HippyPLSize; i++) {
        NSString *label = [self.bridge.performanceLogger labelForTag:i];
        NSNumber *start = allValues[i * 2];
        NSNumber *end = allValues[i * 2 + 1];
        [results addObject:@{ @"eventName" : label ?: @"",
                              @"startTime" : start ?: @0,
                              @"endTime" : end ?: @0 }];
    }
    for (NSString *customTag in allCustomLabels) {
        NSArray *values = [self.bridge.performanceLogger valuesForCustomTag:customTag];
        [results addObject:@{ @"eventName" : customTag,
                              @"startTime" : values.firstObject ?: @0,
                              @"endTime" : values.lastObject ?: @0 }];
    }
    resolve(results);
}

@end
