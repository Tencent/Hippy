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

@property (nonatomic, copy) NSArray<NSString *> *labelsForTags;

@end

@implementation HippyPerformanceLogger

- (instancetype)init {
    if (self = [super init]) {
        _labelsForTags = @[
            @"ScriptDownload",
            @"ScriptExecution",
            @"RAMBundleLoad",
            @"RAMStartupCodeSize",
            @"RAMStartupNativeRequires",
            @"RAMStartupNativeRequiresCount",
            @"RAMNativeRequires",
            @"RAMNativeRequiresCount",
            @"NativeModuleInit",
            @"NativeModuleMainThread",
            @"NativeModulePrepareConfig",
            @"NativeModuleInjectConfig",
            @"NativeModuleMainThreadUsesCount",
            @"JSCWrapperOpenLibrary",
            @"JSCExecutorSetup",
            @"BridgeStartup",
            @"RootViewTTI",
            @"BundleSize",
            @"SecondaryStartup",
        ];
    }
    return self;
}

- (void)markStartForTag:(HippyPLTag)tag {
    _data[tag][0] = CACurrentMediaTime() * 1000;
    _data[tag][1] = 0;
}

- (void)markStopForTag:(HippyPLTag)tag {
    if (_data[tag][0] != 0 && _data[tag][1] == 0) {
        _data[tag][1] = CACurrentMediaTime() * 1000;
    } else {
        HippyLogInfo(@"Unbalanced calls start/end for tag %li", (unsigned long)tag);
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
        HippyLogInfo(@"Unbalanced calls start/end for tag %li", (unsigned long)tag);
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

@end
