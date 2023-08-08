/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.
 
 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#import <QuartzCore/CAAnimation.h>

#import "HPOPSpringAnimation.h"

/**
 @abstract The current drag coefficient.
 @discussion A value greater than 1.0 indicates Simulator slow-motion animations are enabled. Defaults to 1.0.
 */
extern CGFloat HPOPAnimationDragCoefficient(void);

@interface CAAnimation (HPOPAnimationExtras)

/**
 @abstract Apply the current drag coefficient to animation speed.
 @discussion Convenience utility to respect Simulator slow-motion animation settings.
 */
- (void)hpop_applyDragCoefficient;

@end

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

@interface HPOPSpringAnimation (HPOPAnimationExtras)

/**
 @abstract Converts from spring bounciness and speed to tension, friction and mass dynamics values.
 */
+ (void)convertBounciness:(CGFloat)bounciness speed:(CGFloat)speed toTension:(CGFloat *)outTension friction:(CGFloat *)outFriction mass:(CGFloat *)outMass;

/**
 @abstract Converts from dynamics tension, friction and mass to spring bounciness and speed values.
 */
+ (void)convertTension:(CGFloat)tension friction:(CGFloat)friction toBounciness:(CGFloat *)outBounciness speed:(CGFloat *)outSpeed;

@end

#endif /* HPOP_CODE_TRIM */
