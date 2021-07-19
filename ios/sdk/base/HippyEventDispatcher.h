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

/**
 * The threshold at which text inputs will start warning that the JS thread
 * has fallen behind (resulting in poor input performance, missed keys, etc.)
 */
HIPPY_EXTERN const NSInteger HippyTextUpdateLagWarningThreshold;

/**
 * Takes an input event name and normalizes it to the form that is required
 * by the events system (currently that means starting with the "top" prefix,
 * but that's an implementation detail that may change in future).
 */
HIPPY_EXTERN NSString *HippyNormalizeInputEventName(NSString *eventName);

/**
 * This class wraps the -[HippyBridge enqueueJSCall:args:] method, and
 * provides some convenience methods for generating event calls.
 */
@interface HippyEventDispatcher : NSObject <HippyBridgeModule>

- (void)dispatchEvent:(NSString *)moduleName methodName:(NSString *)methodName args:(NSDictionary *)params;

@end

@interface HippyBridge (HippyEventDispatcher)

- (HippyEventDispatcher *)eventDispatcher;

@end

#ifdef __cplusplus
extern "C" {
#endif

void viewEventSend(UIView *, NSDictionary *);

#ifdef __cplusplus
}
#endif
