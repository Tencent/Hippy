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

#import "HippyBridge.h"

NS_ASSUME_NONNULL_BEGIN

/// Performance data dictionary keys
HIPPY_EXTERN NSString *const HippyPerformanceKeyFP;           // First Paint
HIPPY_EXTERN NSString *const HippyPerformanceKeyFCP;          // First Contentful Paint
HIPPY_EXTERN NSString *const HippyPerformanceKeyInit;         // Native Init
HIPPY_EXTERN NSString *const HippyPerformanceKeyJSInit;       // JS Engine Init
HIPPY_EXTERN NSString *const HippyPerformanceKeyRunApp;       // Run Application
HIPPY_EXTERN NSString *const HippyPerformanceKeyDomCreate;    // DOM Create
HIPPY_EXTERN NSString *const HippyPerformanceKeyFirstFrame;   // First Frame

/// Performance API Category of HippyBridge
@interface HippyBridge (PerformanceAPI)

/// Update perf records of FP, DOM_START/DOM_END etc.
/// - Parameter rootTag: Tag of rootView
- (void)updatePerfRecordsOnRootContentDidAppear:(NSNumber *)rootTag;

/// Update FCP perf record.
- (void)updatePerfRecordOnFirstContentfulPaintEnd;

/// Get all perf data (Thread-safe version with completion block)
/// - Parameter completion: Completion block called with performance data on main thread
- (void)getHippyInitPerformanceData:(void(^)(NSDictionary * _Nullable data))completion;

/// Get fcp perf data (Thread-safe version with completion block)
/// - Parameter completion: Completion block called with performance data on main thread
- (void)getFCPPerformanceData:(void(^)(NSDictionary * _Nullable data))completion;

/// Get all perf data
/// @warning This method is not thread-safe. Use getHippyInitPerformanceData: instead.
- (NSDictionary *)getHippyInitPerformanceData __attribute__((deprecated("Use getHippyInitPerformanceData: instead")));

/// Get fcp perf data
/// @warning This method is not thread-safe. Use getFCPPerformanceData: instead.
- (NSDictionary *)getFCPPerformanceData __attribute__((deprecated("Use getFCPPerformanceData: instead")));

@end

NS_ASSUME_NONNULL_END
