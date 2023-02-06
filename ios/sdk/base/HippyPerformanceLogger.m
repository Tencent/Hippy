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
}

/// Custom Tags And Values
@property (nonatomic, strong) NSMutableDictionary<NSString *, NSArray *> *customData;

@end

@implementation HippyPerformanceLogger

- (void)markStartForTag:(HippyPLTag)tag {
    _data[tag][0] = CACurrentMediaTime() * 1000;
    _data[tag][1] = 0;
}

- (void)markStopForTag:(HippyPLTag)tag {
    if (_data[tag][0] != 0 && _data[tag][1] == 0) {
        _data[tag][1] = CACurrentMediaTime() * 1000;
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
    _data[tag][0] = CACurrentMediaTime() * 1000;
}

- (void)appendStopForTag:(HippyPLTag)tag {
    if (_data[tag][0] != 0) {
        _data[tag][1] += CACurrentMediaTime() * 1000 - _data[tag][0];
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

- (NSString *)labelForTag:(HippyPLTag)tag {
    switch (tag) {
        case HippyPLNativeModuleInit:
            return @"NativeModuleInit";
        case HippyPLNativeModuleMainThread:
            return @"NativeModuleMainThread";
        case HippyPLNativeModulePrepareConfig:
            return @"NativeModulePrepareConfig";
        case HippyPLNativeModuleInjectConfig:
            return @"NativeModuleInjectConfig";
        case HippyPLNativeModuleMainThreadUsesCount:
            return @"NativeModuleMainThreadUsesCount";
        case HippyPLJSCExecutorSetup:
            return @"JSCExecutorSetup";
        case HippyPLJSExecutorScopeInit:
            return @"JSExecutorScopeInit";
        case HippyPLCommonBundleSize:
            return @"CommonBundleSize";
        case HippyPLCommonStartup:
            return @"CommonStartup";
        case HippyPLCommonLoadSource:
            return @"CommonLoadSource";
        case HippyPLCommonExecuteSource:
            return @"CommonExecuteSource";
        case HippyPLCommonScriptExecution:
            return @"CommonScriptExecution";
        case HippyPLSecondaryBundleSize:
            return @"SecondaryBundleSize";
        case HippyPLSecondaryStartup:
            return @"SecondaryStartup";
        case HippyPLSecondaryLoadSource:
            return @"SecondaryLoadSource";
        case HippyPLSecondaryExecuteSource:
            return @"SecondaryExecuteSource";
        case HippyPLSecondaryScriptExecution:
            return @"SecondaryScriptExecution";
        case HippyPLBridgeStartup:
            return @"BridgeStartup";
        case HippyPLRunApplication:
            return @"RunApplication";
        case HippyPLFP:
            return @"FP";
        default:
            break;
    }
    return nil;
}

#pragma mark - Custom Tags And Values

- (NSMutableDictionary<NSString *,NSArray *> *)customData {
    if (!_customData) {
        @synchronized (self) {
            if (!_customData) {
                _customData = [NSMutableDictionary dictionary];
            }
        }
    }
    return _customData;
}

- (void)markStartForCustomTag:(NSString *)customTag value:(int64_t)value {
    [self.customData setObject:@[@(value)] forKey:customTag];
}

- (void)markStopForCustomTag:(NSString *)customTag value:(int64_t)value {
    id values = self.customData[customTag];
    if (![values isKindOfClass:NSArray.class]) {
        HippyLogInfo(@"[Hippy_OC_Log][Performance], Unbalanced calls start/end for custom tag: %@", customTag);
    } else {
        [self.customData setObject:@[((NSArray *)values).firstObject, @(value)] forKey:customTag];
    }
}

- (void)setValue:(int64_t)value forCustomTag:(NSString *)customTag {
    [self.customData setObject:@[NSNull.null, @(value)] forKey:customTag];
}

- (int64_t)valueForCustomTag:(NSString *)customTag {
    id value = [self.customData[customTag] lastObject];
    return [value isKindOfClass:NSNumber.class] ? [(NSNumber *)value doubleValue] : 0;
}

- (NSArray<NSNumber *> *)valuesForCustomTag:(NSString *)customTag {
    return self.customData[customTag];
}

- (int64_t)durationForCustomTag:(NSString *)customTag {
    id values = self.customData[customTag];
    if ([values isKindOfClass:NSArray.class] && ((NSArray *)values).count == 2) {
        double start = [(NSNumber *)(((NSArray *)values).lastObject) doubleValue];
        double end = [(NSNumber *)(((NSArray *)values).firstObject) doubleValue];
        return end - start;
    } else {
        HippyLogInfo(@"[Hippy_OC_Log][Performance], Null start or end for custom tag: %@", customTag);
    }
    return -1;
}

- (NSArray<NSString *> *)allCustomTags {
    return self.customData.allKeys;
}

@end
