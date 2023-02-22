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
#import "HippyDefines.h"

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, HippyPLTag) {
    // Native module related
    HippyPLNativeModuleInit = 0, // native module init
    HippyPLNativeModuleMainThread, // native module主线程初始化时间
    HippyPLNativeModulePrepareConfig, // native module config时间
    HippyPLNativeModuleInjectConfig, // native module inject时间
    HippyPLNativeModuleMainThreadUsesCount, // native module 主线程计数
    
    // JSCExecutor related
    HippyPLJSCExecutorSetup, // JSCExecutor初始化
    HippyPLJSExecutorScopeInit, // JSCExecutor Scope初始化
    
    // Common bundle related
    HippyPLCommonBundleSize, // common包大小
    HippyPLCommonStartup, // common包加载到执行完成总耗时
    HippyPLCommonLoadSource, // common包IO读取耗时(加载或下载)，原HippyPLScriptDownload
    HippyPLCommonExecuteSource, // common包enqueue执行耗时（包含等待耗时）
    HippyPLCommonScriptExecution, // common包执行耗时（底层实际执行）
    
    // Secondary bundle related
    HippyPLSecondaryBundleSize, // 业务包大小
    HippyPLSecondaryStartup, // 业务包加载到执行完成总耗时
    HippyPLSecondaryLoadSource, // 业务包IO读取耗时(加载或下载)
    HippyPLSecondaryExecuteSource, // 业务包enqueue执行耗时（包含等待耗时）
    HippyPLSecondaryScriptExecution, // 业务包执行耗时（底层实际执行）
    
    // Important indicators
    HippyPLBridgeStartup, // Bridge启动到完成耗时
    HippyPLRunApplication, // JS入口函数执行到首帧耗时
    HippyPLTTI, // RootView创建到首帧耗时（FP）
    HippyPLFP = HippyPLTTI, // RootView创建到首帧耗时（FP）
    
    HippyPLSize
};

@interface HippyPerformanceLogger : NSObject

/// Starts measuring a metric with the given tag.
/// Overrides previous value if the measurement has been already started.
/// If HippyProfile is enabled it also begins appropriate async event.
/// All work is scheduled on the background queue so this doesn't block current thread.
- (void)markStartForTag:(HippyPLTag)tag;

/// Stops measuring a metric with given tag.
/// Checks if HippyPerformanceLoggerStart() has been called before
/// and doesn't do anything and log a message if it hasn't.
/// If HippyProfile is enabled it also ends appropriate async event.
/// All work is scheduled on the background queue so this doesn't block current thread.
- (void)markStopForTag:(HippyPLTag)tag;

/// Sets given value for a metric with given tag.
/// All work is scheduled on the background queue so this doesn't block current thread.
- (void)setValue:(int64_t)value forTag:(HippyPLTag)tag;

/// Adds given value to the current value for a metric with given tag.
/// All work is scheduled on the background queue so this doesn't block current thread.
- (void)addValue:(int64_t)value forTag:(HippyPLTag)tag;

/// Starts an additional measurement for a metric with given tag.
/// It doesn't override previous measurement, instead it'll append a new value
/// to the old one.
/// All work is scheduled on the background queue so this doesn't block current thread.
- (void)appendStartForTag:(HippyPLTag)tag;

/// Stops measurement and appends the result to the metric with given tag.
/// Checks if HippyPerformanceLoggerAppendStart() has been called before
/// and doesn't do anything and log a message if it hasn't.
/// All work is scheduled on the background queue so this doesn't block current thread.
/// - Parameter tag: HippyPLTag
- (void)appendStopForTag:(HippyPLTag)tag;

/// Returns an array with values for all tags.
/// Use HippyPLTag to go over the array, there's a pair of values
/// for each tag: start and stop (with indexes 2 * tag and 2 * tag + 1).
- (NSArray<NSNumber *> *)valuesForTags;

/// Returns a duration in ms (stop_time - start_time) for given HippyPLTag.
/// - Parameter tag: HippyPLTag
- (int64_t)durationForTag:(HippyPLTag)tag;

/// Returns a value for given HippyPLTag.
/// - Parameter tag: HippyPLTag
- (int64_t)valueForTag:(HippyPLTag)tag;

/// Returns an array with the start and stop value for the given tag.
/// - Parameter tag: HippyPLTag
- (NSArray<NSNumber *> *)valuesForTag:(HippyPLTag)tag;

/// Returns the label for given HippyPLTag.
/// - Parameter tag: HippyPLTag
- (nullable NSString *)labelForTag:(HippyPLTag)tag;


#pragma mark - Custom Tags And Values

HIPPY_EXTERN NSString *const HippyPLCustomTagUpdateNotification;

/// Set a custom metric with the given tag name and value.
/// - Parameters:
///   - value: any double value
///   - customTag: nonnull name
- (void)setValue:(double)value forCustomTag:(NSString *)customTag;

/// Get the value of custom metric with the given tag name.
/// - Parameter customTag: nonnull name
- (double)valueForCustomTag:(NSString *)customTag;

/// Returns all names of custom tags.
- (NSArray<NSString *> *)allCustomTags;


@end

NS_ASSUME_NONNULL_END
