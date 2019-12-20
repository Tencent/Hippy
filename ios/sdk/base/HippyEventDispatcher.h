/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
