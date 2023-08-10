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
