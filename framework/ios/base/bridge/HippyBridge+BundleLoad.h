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

/// Category of HippyBridge responsible for loading bundle.
@interface HippyBridge (BundleLoad)

typedef NSUInteger HippyBridgeBundleType;
typedef void (^HippyBridgeBundleLoadCompletionBlock)(NSURL * _Nullable bundleURL, NSError * _Nullable error);

/// Setup bundle queue for bundle load operation.
- (void)prepareBundleQueue;

/// Whether the bridge is loading bundle
@property (nonatomic, readonly, getter=isLoading) BOOL loading;

/// Load and Execute bundle from the given bundle URL
/// - Parameters:
///   - bundleURL: bundle url
///   - bundleType: type of bundle, e.g.: whether is `Vendor Bundle`(Common Bundle) or `Business Bundle`
///   - completion: Completion block
///
/// - Disscusion: HippyBridge makes sure bundles will be loaded and execute in order.
- (void)loadBundleURL:(NSURL *)bundleURL
           bundleType:(HippyBridgeBundleType)bundleType
           completion:(HippyBridgeBundleLoadCompletionBlock)completion;

@end

NS_ASSUME_NONNULL_END
