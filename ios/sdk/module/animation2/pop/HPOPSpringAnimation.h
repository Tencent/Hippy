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

#import "HPOPPropertyAnimation.h"

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

/**
 @abstract A concrete spring animation class.
 @discussion Animation is achieved through modeling spring dynamics.
 */
@interface HPOPSpringAnimation : HPOPPropertyAnimation

/**
 @abstract The designated initializer.
 @returns An instance of a spring animation.
 */
+ (instancetype)animation;

/**
 @abstract Convenience initializer that returns an animation with animatable property of name.
 @param name The name of the animatable property.
 @returns An instance of a spring animation configured with specified animatable property.
 */
+ (instancetype)animationWithPropertyNamed:(NSString *)name;

/**
 @abstract The current velocity value.
 @discussion Set before animation start to account for initial velocity. Expressed in change of value units per second.
 */
@property (copy, nonatomic) id velocity;

/**
 @abstract The effective bounciness.
 @discussion Use in conjunction with 'springSpeed' to change animation effect. Values are converted into corresponding dynamics constants. Higher values increase spring movement range resulting in more oscillations and springiness. Defined as a value in the range [0, 20]. Defaults to 4.
 */
@property (assign, nonatomic) CGFloat springBounciness;

/**
 @abstract The effective speed.
 @discussion Use in conjunction with 'springBounciness' to change animation effect. Values are converted into corresponding dynamics constants. Higher values increase the dampening power of the spring resulting in a faster initial velocity and more rapid bounce slowdown. Defined as a value in the range [0, 20]. Defaults to 12.
 */
@property (assign, nonatomic) CGFloat springSpeed;

/**
 @abstract The tension used in the dynamics simulation.
 @discussion Can be used over bounciness and speed for finer grain tweaking of animation effect.
 */
@property (assign, nonatomic) CGFloat dynamicsTension;

/**
 @abstract The friction used in the dynamics simulation.
 @discussion Can be used over bounciness and speed for finer grain tweaking of animation effect.
 */
@property (assign, nonatomic) CGFloat dynamicsFriction;

/**
 @abstract The mass used in the dynamics simulation.
 @discussion Can be used over bounciness and speed for finer grain tweaking of animation effect.
 */
@property (assign, nonatomic) CGFloat dynamicsMass;

@end

#endif /* HPOP_CODE_TRIM */
