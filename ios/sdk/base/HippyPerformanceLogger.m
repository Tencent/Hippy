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

#import <QuartzCore/QuartzCore.h>

#import "HippyPerformanceLogger.h"
#import "HippyRootView.h"
#import "HippyLog.h"

@interface HippyPerformanceLogger () {
    int64_t _data[HippyPLSize][2];
    int64_t _timeDiff; // the diff between CACurrentMediaTime and the timestamp
    NSMutableDictionary<NSString *, NSNumber *> *_customData; // Custom Tags And Values
}

@end

@implementation HippyPerformanceLogger

- (instancetype)init {
    self = [super init];
    if (self) {
        _timeDiff = (NSDate.date.timeIntervalSince1970 - CACurrentMediaTime()) * 1000;
    }
    return self;
}

- (void)markStartForTag:(HippyPLTag)tag {
    _data[tag][0] = CACurrentMediaTime() * 1000 + _timeDiff;
    _data[tag][1] = 0;
}

- (void)markStopForTag:(HippyPLTag)tag {
    if (_data[tag][0] != 0 && _data[tag][1] == 0) {
        _data[tag][1] = CACurrentMediaTime() * 1000 + _timeDiff;
    } else {
        HippyLogInfo(@"[Hippy_OC_Log][Performance],Unbalanced calls start/end for tag %li", (unsigned long)tag);
    }
}

- (void)setValue:(int64_t)value forTag:(HippyPLTag)tag {
    _data[tag][0] = 0;
    _data[tag][1] = value;
}

- (void)addValue:(int64_t)value forTag:(HippyPLTag)tag {
    _data[tag][0] = 0;
    _data[tag][1] += value;
}

- (void)appendStartForTag:(HippyPLTag)tag {
    _data[tag][0] = CACurrentMediaTime() * 1000 + _timeDiff;
}

- (void)appendStopForTag:(HippyPLTag)tag {
    if (_data[tag][0] != 0) {
        _data[tag][1] += CACurrentMediaTime() * 1000 + _timeDiff - _data[tag][0];
        _data[tag][0] = 0;
    } else {
        HippyLogInfo(@"[Hippy_OC_Log][Performance],Unbalanced calls start/end for tag %li", (unsigned long)tag);
    }
}

- (NSArray<NSNumber *> *)valuesForTags {
    NSMutableArray *result = [NSMutableArray array];
    for (NSUInteger index = 0; index < HippyPLSize; index++) {
        [result addObject:@(_data[index][0])];
        [result addObject:@(_data[index][1])];
    }
    return result;
}

- (int64_t)durationForTag:(HippyPLTag)tag {
    return _data[tag][1] - _data[tag][0];
}

- (int64_t)valueForTag:(HippyPLTag)tag {
    return _data[tag][1];
}

- (NSArray<NSNumber *> *)valuesForTag:(HippyPLTag)tag {
    return @[@(_data[tag][0]), @(_data[tag][1])];
}

- (NSString *)labelForTag:(HippyPLTag)tag {
    switch (tag) {
        case HippyPLNativeModuleInit:
            return @"hippyNativeModuleInit";
        case HippyPLNativeModuleMainThread:
            return @"hippyNativeModuleMainThread";
        case HippyPLNativeModulePrepareConfig:
            return @"hippyNativeModulePrepareConfig";
        case HippyPLNativeModuleInjectConfig:
            return @"hippyNativeModuleInjectConfig";
        case HippyPLNativeModuleMainThreadUsesCount:
            return @"hippyNativeModuleMainThreadUsesCount";
        case HippyPLJSCExecutorSetup:
            return @"hippyJSCExecutorSetup";
        case HippyPLJSExecutorScopeInit:
            return @"hippyJSExecutorScopeInit";
        case HippyPLCommonBundleSize:
            return @"hippyCommonBundleSize";
        case HippyPLCommonStartup:
            return @"hippyCommonStartup";
        case HippyPLCommonLoadSource:
            return @"hippyCommonLoadSource";
        case HippyPLCommonExecuteSource:
            return @"hippyCommonExecuteSource";
        case HippyPLCommonScriptExecution:
            return @"hippyCommonScriptExecution";
        case HippyPLSecondaryBundleSize:
            return @"hippySecondaryBundleSize";
        case HippyPLSecondaryStartup:
            return @"hippySecondaryStartup";
        case HippyPLSecondaryLoadSource:
            return @"hippySecondaryLoadSource";
        case HippyPLSecondaryExecuteSource:
            return @"hippySecondaryExecuteSource";
        case HippyPLSecondaryScriptExecution:
            return @"hippySecondaryScriptExecution";
        case HippyPLBridgeStartup:
            return @"hippyBridgeStartup";
        case HippyPLRunApplication:
            return @"hippyRunApplication";
        case HippyPLFP:
            return @"hippyFirstPaint";
        default:
            break;
    }
    return nil;
}

#pragma mark - Custom Tags And Values

NSString *const HippyPLCustomTagUpdateNotification = @"HippyPLCustomTagUpdateNotification";

- (NSMutableDictionary<NSString *, NSNumber *> *)customData {
    if (!_customData) {
        @synchronized (self) {
            if (!_customData) {
                _customData = [NSMutableDictionary dictionary];
            }
        }
    }
    return _customData;
}

- (void)setValue:(double)value forCustomTag:(NSString *)customTag {
    [self.customData setObject:@(value) forKey:customTag];
    [NSNotificationCenter.defaultCenter postNotificationName:HippyPLCustomTagUpdateNotification object:customTag];
}

- (double)valueForCustomTag:(NSString *)customTag {
    id value = self.customData[customTag];
    return [value isKindOfClass:NSNumber.class] ? [(NSNumber *)value doubleValue] : 0;
}

- (NSArray<NSString *> *)allCustomTags {
    return self.customData.allKeys;
}

@end
