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

#import <UIKit/UIKit.h>
#import "HippyBridge.h"

NS_ASSUME_NONNULL_BEGIN

/**
 * This class wraps the -[HippyBridge enqueueJSCall:args:] method, and
 * provides some convenience methods for generating event calls.
 */
@interface HippyEventDispatcher : NSObject <HippyBridgeModule>

/// Send event to JS side with given params.
- (void)dispatchEvent:(NSString *)moduleName methodName:(NSString *)methodName args:(NSDictionary *)params;

/// Similar to the above `dispatchEvent` method, but designed to send Native events only.
/// - Parameters:
///   - eventName: name of event
///   - params: event params
- (void)dispatchNativeEvent:(NSString *)eventName withParams:(nullable NSDictionary *)params;

@end

@interface HippyBridge (HippyEventDispatcher)

/// A dispatcher responsible for sending event to js side.
- (HippyEventDispatcher *)eventDispatcher;

@end

NS_ASSUME_NONNULL_END
