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

/**
 @abstract A concrete basic animation class.
 @discussion Animation is achieved through interpolation.
 */
@interface HPOPBasicAnimation : HPOPPropertyAnimation

/**
 @abstract The designated initializer.
 @returns An instance of a basic animation.
 */
+ (instancetype)animation;

/**
 @abstract Convenience initializer that returns an animation with animatable property of name.
 @param name The name of the animatable property.
 @returns An instance of a basic animation configured with specified animatable property.
 */
+ (instancetype)animationWithPropertyNamed:(NSString *)name;

/**
 @abstract Convenience constructor.
 @returns Returns a basic animation with kCAMediaTimingFunctionDefault timing function.
 */
+ (instancetype)defaultAnimation;

/**
 @abstract Convenience constructor.
 @returns Returns a basic animation with kCAMediaTimingFunctionLinear timing function.
 */
+ (instancetype)linearAnimation;

/**
 @abstract Convenience constructor.
 @returns Returns a basic animation with kCAMediaTimingFunctionEaseIn timing function.
 */
+ (instancetype)easeInAnimation;

/**
 @abstract Convenience constructor.
 @returns Returns a basic animation with kCAMediaTimingFunctionEaseOut timing function.
 */
+ (instancetype)easeOutAnimation;

/**
 @abstract Convenience constructor.
 @returns Returns a basic animation with kCAMediaTimingFunctionEaseInEaseOut timing function.
 */
+ (instancetype)easeInEaseOutAnimation;

/**
 @abstract The duration in seconds. Defaults to 0.4.
 */
@property (assign, nonatomic) CFTimeInterval duration;

/**
 @abstract A timing function defining the pacing of the animation. Defaults to nil indicating pacing according to kCAMediaTimingFunctionDefault.
 */
@property (strong, nonatomic) CAMediaTimingFunction *timingFunction;

@end
