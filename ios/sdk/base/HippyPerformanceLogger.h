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

#import <Foundation/Foundation.h>

typedef NS_ENUM(NSUInteger, HippyPLTag) {
  HippyPLScriptDownload = 0,
  HippyPLScriptExecution,
  HippyPLRAMBundleLoad,
  HippyPLRAMStartupCodeSize,
  HippyPLRAMStartupNativeRequires,
  HippyPLRAMStartupNativeRequiresCount,
  HippyPLRAMNativeRequires,
  HippyPLRAMNativeRequiresCount,
  HippyPLNativeModuleInit,
  HippyPLNativeModuleMainThread,
  HippyPLNativeModulePrepareConfig,
  HippyPLNativeModuleInjectConfig,
  HippyPLNativeModuleMainThreadUsesCount,
  HippyPLJSCWrapperOpenLibrary,
  HippyPLJSCExecutorSetup,
  HippyPLBridgeStartup,
  HippyPLTTI,
  HippyPLBundleSize,
  HippySecondaryStartup,
	HippyCommonLoadSource,
	HippyExecuteSource,
	HippyFeedsTimeCost,
  HippyPLSize
};

@interface HippyPerformanceLogger : NSObject

/**
 * Starts measuring a metric with the given tag.
 * Overrides previous value if the measurement has been already started.
 * If HippyProfile is enabled it also begins appropriate async event.
 * All work is scheduled on the background queue so this doesn't block current thread.
 */
- (void)markStartForTag:(HippyPLTag)tag;

/**
 * Stops measuring a metric with given tag.
 * Checks if HippyPerformanceLoggerStart() has been called before
 * and doesn't do anything and log a message if it hasn't.
 * If HippyProfile is enabled it also ends appropriate async event.
 * All work is scheduled on the background queue so this doesn't block current thread.
 */
- (void)markStopForTag:(HippyPLTag)tag;

/**
 * Sets given value for a metric with given tag.
 * All work is scheduled on the background queue so this doesn't block current thread.
 */
- (void)setValue:(int64_t)value forTag:(HippyPLTag)tag;

/**
 * Adds given value to the current value for a metric with given tag.
 * All work is scheduled on the background queue so this doesn't block current thread.
 */
- (void)addValue:(int64_t)value forTag:(HippyPLTag)tag;

/**
 * Starts an additional measurement for a metric with given tag.
 * It doesn't override previous measurement, instead it'll append a new value
 * to the old one.
 * All work is scheduled on the background queue so this doesn't block current thread.
 */
- (void)appendStartForTag:(HippyPLTag)tag;

/**
 * Stops measurement and appends the result to the metric with given tag.
 * Checks if HippyPerformanceLoggerAppendStart() has been called before
 * and doesn't do anything and log a message if it hasn't.
 * All work is scheduled on the background queue so this doesn't block current thread.
 */
- (void)appendStopForTag:(HippyPLTag)tag;

/**
 * Returns an array with values for all tags.
 * Use HippyPLTag to go over the array, there's a pair of values
 * for each tag: start and stop (with indexes 2 * tag and 2 * tag + 1).
 */
- (NSArray<NSNumber *> *)valuesForTags;

/**
 * Returns a duration in ms (stop_time - start_time) for given HippyPLTag.
 */
- (int64_t)durationForTag:(HippyPLTag)tag;

/**
 * Returns a value for given HippyPLTag.
 */
- (int64_t)valueForTag:(HippyPLTag)tag;

/**
 * Returns an array with values for all tags.
 * Use HippyPLTag to go over the array.
 */
- (NSArray<NSString *> *)labelsForTags;

@end
