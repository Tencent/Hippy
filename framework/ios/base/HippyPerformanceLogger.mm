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
#import "HPLog.h"

#include <unordered_map>

struct PerformanceValue {
    int64_t startTime;
    int64_t endTime;
    PerformanceValue():startTime(0), endTime(0) {}
};

struct NSStringHash {
    std::size_t operator()(const NSString* str) const {
        return [str hash];
    }
};

struct NSStringEqual {
    bool operator()(const NSString* lhs, const NSString* rhs) const {
        return 0 == std::strcmp([lhs UTF8String], [rhs UTF8String]);
    }
};

using PerformanceTagValue = std::unordered_map<NSString *, PerformanceValue, NSStringHash, NSStringEqual>;
using PerformanceMap = std::unordered_map<HippyPLTag, PerformanceTagValue>;
@interface HippyPerformanceLogger () {
    PerformanceMap _data;
}

@property (nonatomic, copy) NSArray<NSString *> *labelsForTags;

@end

@implementation HippyPerformanceLogger

- (instancetype)init {
    if (self = [super init]) {
        _labelsForTags = @[
            @"ScriptDownload",
            @"ScriptExecution",
            @"NativeModuleInit",
            @"JSExecutorSetup",
            @"BridgeStartup",
            @"BundleSize",
            @"ExecuteSource",
        ];
        _data.reserve(HippyPLSize);
    }
    return self;
}

- (PerformanceValue &)getPLValue:(HippyPLTag)tag forKey:(NSString *)key {
    NSString *finalKey = key ?: [NSString stringWithFormat:@"%p", self];
    PerformanceTagValue &tagValue = _data[tag];
    PerformanceValue &value = tagValue[finalKey];
    return value;
}

- (void)markStartForTag:(HippyPLTag)tag forKey:(NSString *)key {
    PerformanceValue &value = [self getPLValue:tag forKey:key];
    value.startTime = CACurrentMediaTime() * 1000.f;
}

- (void)markStopForTag:(HippyPLTag)tag forKey:(NSString *)key {
    PerformanceValue &value = [self getPLValue:tag forKey:key];
    if (value.startTime != 0 && value.endTime == 0) {
        value.endTime = CACurrentMediaTime() * 1000.f;
    }
    else {
        HPLogInfo(@"[Hippy_OC_Log][Performance],Unbalanced calls start/end for tag %li", (unsigned long)tag);
    }
}

- (void)setValue:(int64_t)value forTag:(HippyPLTag)tag forKey:(NSString *)key {
    PerformanceValue &pvalue = [self getPLValue:tag forKey:key];
    pvalue.startTime = 0;
    pvalue.endTime = value;
}

- (void)addValue:(int64_t)value forTag:(HippyPLTag)tag forKey:(NSString *)key {
    PerformanceValue &pvalue = [self getPLValue:tag forKey:key];
    pvalue.startTime = pvalue.startTime + value;
}

- (int64_t)durationForTag:(HippyPLTag)tag forKey:(NSString *)key {
    PerformanceValue &value = [self getPLValue:tag forKey:key];
    return value.endTime - value.startTime;
}

- (int64_t)valueForTag:(HippyPLTag)tag forKey:(NSString *)key {
    PerformanceValue &value = [self getPLValue:tag forKey:key];
    return value.endTime;
}

@end
