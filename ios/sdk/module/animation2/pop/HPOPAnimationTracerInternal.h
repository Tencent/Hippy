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

#import <Foundation/Foundation.h>

#import "HPOPAnimationTracer.h"

@interface HPOPAnimationTracer (Internal)

/**
 @abstract Designated initializer. Pass the animation being traced.
 */
- (instancetype)initWithAnimation:(HPOPAnimation *)anAnim;

/**
 @abstract Records read value.
 */
- (void)readPropertyValue:(id)aValue;

/**
 @abstract Records write value.
 */
- (void)writePropertyValue:(id)aValue;

/**
 Records to value update.
 */
- (void)updateToValue:(id)aValue;

/**
 @abstract Records from value update.
 */
- (void)updateFromValue:(id)aValue;

/**
 @abstract Records from value update.
 */
- (void)updateVelocity:(id)aValue;

/**
 @abstract Records bounciness update.
 */
- (void)updateBounciness:(float)aFloat;

/**
 @abstract Records speed update.
 */
- (void)updateSpeed:(float)aFloat;

/**
 @abstract Records friction update.
 */
- (void)updateFriction:(float)aFloat;

/**
 @abstract Records mass update.
 */
- (void)updateMass:(float)aFloat;

/**
 @abstract Records tension update.
 */
- (void)updateTension:(float)aFloat;

/**
 @abstract Records did add.
 */
- (void)didAdd;

/**
 @abstract Records did start.
 */
- (void)didStart;

/**
 @abstract Records did stop.
 */
- (void)didStop:(BOOL)finished;

/**
 @abstract Records did reach to value.
 */
- (void)didReachToValue:(id)aValue;

/**
 @abstract Records when an autoreverse animation takes place.
 */
- (void)autoreversed;

@end
