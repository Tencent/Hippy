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

#import "HPOPSpringAnimationInternal.h"

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

@implementation HPOPSpringAnimation

#pragma mark - Lifecycle

#undef __state
#define __state ((POPSpringAnimationState *)_state)

+ (instancetype)animation
{
  return [[self alloc] init];
}

+ (instancetype)animationWithPropertyNamed:(NSString *)aName
{
  HPOPSpringAnimation *anim = [self animation];
  anim.property = [HPOPAnimatableProperty propertyWithName:aName];
  return anim;
}

- (void)_initState
{
  _state = new POPSpringAnimationState(self);
}

- (id)init
{
  self = [super _init];
  if (nil != self) {
    __state->solver = new SpringSolver4d(1, 1, 1);
    __state->updatedDynamicsThreshold();
    __state->updatedBouncinessAndSpeed();
  }
  return self;
}

- (void)dealloc
{
  if (__state) {
    delete __state->solver;
    __state->solver = NULL;
  }
}

#pragma mark - Properties

- (id)velocity
{
  return POPBox(__state->velocityVec, __state->valueType);
}

- (void)setVelocity:(id)aValue
{
  POPPropertyAnimationState *s = __state;
  VectorRef vec = POPUnbox(aValue, s->valueType, s->valueCount, YES);
  VectorRef origVec = POPUnbox(aValue, s->valueType, s->valueCount, YES);
  if (!vec_equal(vec, s->velocityVec)) {
    s->velocityVec = vec;
    s->originalVelocityVec = origVec;

    if (s->tracing) {
      [s->tracer updateVelocity:aValue];
    }
  }
}

DEFINE_RW_PROPERTY(POPSpringAnimationState, dynamicsTension, setDynamicsTension:, CGFloat, [self _updatedDynamicsTension];);
DEFINE_RW_PROPERTY(POPSpringAnimationState, dynamicsFriction, setDynamicsFriction:, CGFloat, [self _updatedDynamicsFriction];);
DEFINE_RW_PROPERTY(POPSpringAnimationState, dynamicsMass, setDynamicsMass:, CGFloat, [self _updatedDynamicsMass];);

FB_PROPERTY_GET(POPSpringAnimationState, springSpeed, CGFloat);
- (void)setSpringSpeed:(CGFloat)aFloat
{
  POPSpringAnimationState *s = __state;
  if (s->userSpecifiedDynamics || aFloat != s->springSpeed) {
    s->springSpeed = aFloat;
    s->userSpecifiedDynamics = false;
    s->updatedBouncinessAndSpeed();
    if (s->tracing) {
      [s->tracer updateSpeed:aFloat];
    }
  }
}

FB_PROPERTY_GET(POPSpringAnimationState, springBounciness, CGFloat);
- (void)setSpringBounciness:(CGFloat)aFloat
{
  POPSpringAnimationState *s = __state;
  if (s->userSpecifiedDynamics || aFloat != s->springBounciness) {
    s->springBounciness = aFloat;
    s->userSpecifiedDynamics = false;
    s->updatedBouncinessAndSpeed();
    if (s->tracing) {
      [s->tracer updateBounciness:aFloat];
    }
  }
}

- (SpringSolver4d *)solver
{
  return __state->solver;
}

- (void)setSolver:(SpringSolver4d *)aSolver
{
  if (aSolver != __state->solver) {
    if (__state->solver) {
      delete(__state->solver);
    }
    __state->solver = aSolver;
  }
}

#pragma mark - Utility

- (void)_updatedDynamicsTension
{
  __state->userSpecifiedDynamics = true;
  if(__state->tracing) {
    [__state->tracer updateTension:__state->dynamicsTension];
  }
  __state->updatedDynamics();
}

- (void)_updatedDynamicsFriction
{
  __state->userSpecifiedDynamics = true;
  if(__state->tracing) {
    [__state->tracer updateFriction:__state->dynamicsFriction];
  }
  __state->updatedDynamics();
}

- (void)_updatedDynamicsMass
{
  __state->userSpecifiedDynamics = true;
  if(__state->tracing) {
    [__state->tracer updateMass:__state->dynamicsMass];
  }
  __state->updatedDynamics();
}

- (void)_appendDescription:(NSMutableString *)s debug:(BOOL)debug
{
  [super _appendDescription:s debug:debug];

  if (debug) {
    if (_state->userSpecifiedDynamics) {
      [s appendFormat:@"; dynamics = (tension:%f, friction:%f, mass:%f)", __state->dynamicsTension, __state->dynamicsFriction, __state->dynamicsMass];
    } else {
      [s appendFormat:@"; bounciness = %f; speed = %f", __state->springBounciness, __state->springSpeed];
    }
  }
}

@end

@implementation HPOPSpringAnimation (NSCopying)

- (instancetype)copyWithZone:(NSZone *)zone {
  
  HPOPSpringAnimation *copy = [super copyWithZone:zone];
  
  if (copy) {
    id velocity = POPBox(__state->originalVelocityVec, __state->valueType);
    
    // If velocity never gets set, then POPBox will return nil, messing up __state->valueCount.
    if (velocity) {
      copy.velocity = velocity;
    }
    
    copy.springBounciness = self.springBounciness;
    copy.springSpeed = self.springSpeed;
    copy.dynamicsTension = self.dynamicsTension;
    copy.dynamicsFriction = self.dynamicsFriction;
    copy.dynamicsMass = self.dynamicsMass;
  }
  
  return copy;
}

@end

#endif /* HPOP_CODE_TRIM */
