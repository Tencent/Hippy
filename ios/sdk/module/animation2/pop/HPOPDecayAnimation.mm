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

#import "HPOPDecayAnimationInternal.h"

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

#if TARGET_OS_IPHONE
#import <UIKit/UIKit.h>
#endif

const POPValueType supportedVelocityTypes[6] = { kHPOPValuePoint, kHPOPValueInteger, kHPOPValueFloat, kHPOPValueRect, kHPOPValueSize, kHPOPValueEdgeInsets };

@implementation HPOPDecayAnimation

#pragma mark - Lifecycle

#undef __state
#define __state ((POPDecayAnimationState *)_state)

+ (instancetype)animation
{
  return [[self alloc] init];
}

+ (instancetype)animationWithPropertyNamed:(NSString *)aName
{
  HPOPDecayAnimation *anim = [self animation];
  anim.property = [HPOPAnimatableProperty propertyWithName:aName];
  return anim;
}

- (id)init
{
  return [self _init];
}

- (void)_initState
{
  _state = new POPDecayAnimationState(self);
}

#pragma mark - Properties

DEFINE_RW_PROPERTY(POPDecayAnimationState, deceleration, setDeceleration:, CGFloat, __state->toVec = NULL;);

@dynamic velocity;

- (id)toValue
{
  [self _ensureComputedProperties];
  return POPBox(__state->toVec, __state->valueType);
}

- (CFTimeInterval)duration
{
  [self _ensureComputedProperties];
  return __state->duration;
}

- (void)setFromValue:(id)fromValue
{
  super.fromValue = fromValue;
  [self _invalidateComputedProperties];
}

- (void)setToValue:(id)aValue
{
  // no-op
  NSLog(@"ignoring to value on decay animation %@", self);
}

- (id)reversedVelocity
{
  id reversedVelocity = nil;

  POPValueType velocityType = POPSelectValueType(self.originalVelocity, supportedVelocityTypes, POP_ARRAY_COUNT(supportedVelocityTypes));
  if (velocityType == kHPOPValueFloat) {
#if CGFLOAT_IS_DOUBLE
    CGFloat originalVelocityFloat = [(NSNumber *)self.originalVelocity doubleValue];
#else
    CGFloat originalVelocityFloat = [(NSNumber *)self.originalVelocity floatValue];
#endif
    NSNumber *negativeOriginalVelocityNumber = @(-originalVelocityFloat);
    reversedVelocity = negativeOriginalVelocityNumber;
  } else if (velocityType == kHPOPValueInteger) {
    NSInteger originalVelocityInteger = [(NSNumber *)self.originalVelocity integerValue];
    NSNumber *negativeOriginalVelocityNumber = @(-originalVelocityInteger);
    reversedVelocity = negativeOriginalVelocityNumber;
  } else if (velocityType == kHPOPValuePoint) {
    CGPoint originalVelocityPoint = [self.originalVelocity CGPointValue];
    CGPoint negativeOriginalVelocityPoint = CGPointMake(-originalVelocityPoint.x, -originalVelocityPoint.y);
    reversedVelocity = [NSValue valueWithCGPoint:negativeOriginalVelocityPoint];
  } else if (velocityType == kHPOPValueRect) {
    CGRect originalVelocityRect = [self.originalVelocity CGRectValue];
    CGRect negativeOriginalVelocityRect = CGRectMake(-originalVelocityRect.origin.x, -originalVelocityRect.origin.y, -originalVelocityRect.size.width, -originalVelocityRect.size.height);
    reversedVelocity = [NSValue valueWithCGRect:negativeOriginalVelocityRect];
  } else if (velocityType == kHPOPValueSize) {
    CGSize originalVelocitySize = [self.originalVelocity CGSizeValue];
    CGSize negativeOriginalVelocitySize = CGSizeMake(-originalVelocitySize.width, -originalVelocitySize.height);
    reversedVelocity = [NSValue valueWithCGSize:negativeOriginalVelocitySize];
  } else if (velocityType == kHPOPValueEdgeInsets) {
#if TARGET_OS_IPHONE
    UIEdgeInsets originalVelocityInsets = [self.originalVelocity UIEdgeInsetsValue];
    UIEdgeInsets negativeOriginalVelocityInsets = UIEdgeInsetsMake(-originalVelocityInsets.top, -originalVelocityInsets.left, -originalVelocityInsets.bottom, -originalVelocityInsets.right);
    reversedVelocity = [NSValue valueWithUIEdgeInsets:negativeOriginalVelocityInsets];
#endif
  }

  return reversedVelocity;
}

- (id)originalVelocity
{
  return POPBox(__state->originalVelocityVec, __state->valueType);
}

- (id)velocity
{
  return POPBox(__state->velocityVec, __state->valueType);
}

- (void)setVelocity:(id)aValue
{
  POPValueType valueType = POPSelectValueType(aValue, supportedVelocityTypes, POP_ARRAY_COUNT(supportedVelocityTypes));
  if (valueType != kHPOPValueUnknown) {
    VectorRef vec = POPUnbox(aValue, __state->valueType, __state->valueCount, YES);
    VectorRef origVec = POPUnbox(aValue, __state->valueType, __state->valueCount, YES);

    if (!vec_equal(vec, __state->velocityVec)) {
      __state->velocityVec = vec;
      __state->originalVelocityVec = origVec;

      if (__state->tracing) {
        [__state->tracer updateVelocity:aValue];
      }

      [self _invalidateComputedProperties];

      // automatically unpause active animations
      if (__state->active && __state->paused) {
        __state->fromVec = NULL;
        __state->setPaused(false);
      }
    }
  } else {
    __state->velocityVec = NULL;
    NSLog(@"Invalid velocity value for the decayAnimation: %@", aValue);
  }
}

#pragma mark - Utility

- (void)_ensureComputedProperties
{
  if (NULL == __state->toVec) {
    __state->computeDuration();
    __state->computeToValue();
  }
}

- (void)_invalidateComputedProperties
{
  __state->toVec = NULL;
  __state->duration = 0;
}

- (void)_appendDescription:(NSMutableString *)s debug:(BOOL)debug
{
  [super _appendDescription:s debug:debug];

  if (0 != self.duration) {
    [s appendFormat:@"; duration = %f", self.duration];
  }

  if (__state->deceleration) {
    [s appendFormat:@"; deceleration = %f", __state->deceleration];
  }
}

@end

@implementation HPOPDecayAnimation (NSCopying)

- (instancetype)copyWithZone:(NSZone *)zone {
  
  HPOPDecayAnimation *copy = [super copyWithZone:zone];
  
  if (copy) {
    // Set the velocity to the animation's original velocity, not its current.
    copy.velocity = self.originalVelocity;
    copy.deceleration = self.deceleration;
    
  }
  
  return copy;
}

@end

#endif /* HPOP_CODE_TRIM */
