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

#import "HippyPerformanceModule.h"
#import "HippyPerformanceLogger.h"
#import "HippyBridge.h"


@implementation HippyPerformanceModule

HIPPY_EXPORT_TURBO_MODULE(PerformanceModule)

/// Get all performance entries
HIPPY_EXPORT_TURBO_METHOD(getEntries) {
    NSArray<NSNumber *> *allValues = [self.bridge.performanceLogger valuesForTags];
    NSArray *allCustomLabels = [self.bridge.performanceLogger allCustomTags];
    NSMutableDictionary *entries = [NSMutableDictionary dictionaryWithCapacity:(HippyPLSize + allCustomLabels.count + 1) * 2];
    // multi rootview instances is not supported currently
    // TODO: use moduleName of hippyRootView in the future
    entries[@"name"] = self.bridge.moduleName;
    entries[@"entryType"] = @"navigation"; // js convention

    for (int i = HippyPLNativeModuleInit; i < HippyPLSize; i++) {
        NSString *label = [self.bridge.performanceLogger labelForTag:static_cast<HippyPLTag>(i)];
        NSNumber *start = allValues[i * 2];
        NSNumber *end = allValues[i * 2 + 1];
        [entries setObject:(start ?: @0) forKey:[NSString stringWithFormat:@"%@Start", label ?: @"undefined"]];
        [entries setObject:(end ?: @0) forKey:[NSString stringWithFormat:@"%@End", label ?: @"undefined"]];
    }
    for (NSString *customTag in allCustomLabels) {
        double value = [self.bridge.performanceLogger valueForCustomTag:customTag];
        [entries setObject:@(value) forKey:customTag];
    }
    return @[entries];
}

/// Marks the occurrence time of a custom event
/// - Parameter eventName: event name
/// - Parameter timestamp: Occurrence time, in milliseconds
HIPPY_EXPORT_TURBO_METHOD(mark:(NSString *)event
                          timestamp:(double)timestamp) {
    [self.bridge.performanceLogger setValue:timestamp forCustomTag:event];
    return @YES;
}

@end
