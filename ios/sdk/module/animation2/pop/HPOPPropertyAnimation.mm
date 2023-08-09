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

#import "HPOPPropertyAnimationInternal.h"

@implementation HPOPPropertyAnimation

#pragma mark - Lifecycle

#undef __state
#define __state ((POPPropertyAnimationState *)_state)

- (void)_initState
{
  _state = new POPPropertyAnimationState(self);
}

#pragma mark - Properties

DEFINE_RW_FLAG(POPPropertyAnimationState, additive, isAdditive, setAdditive:);
DEFINE_RW_PROPERTY(POPPropertyAnimationState, roundingFactor, setRoundingFactor:, CGFloat);
DEFINE_RW_PROPERTY(POPPropertyAnimationState, clampMode, setClampMode:, NSUInteger);
DEFINE_RW_PROPERTY_OBJ(POPPropertyAnimationState, property, setProperty:, HPOPAnimatableProperty*, ((POPPropertyAnimationState*)_state)->updatedDynamicsThreshold(););
DEFINE_RW_PROPERTY_OBJ_COPY(POPPropertyAnimationState, progressMarkers, setProgressMarkers:, NSArray*, ((POPPropertyAnimationState*)_state)->updatedProgressMarkers(););

- (id)fromValue
{
  return POPBox(__state->fromVec, __state->valueType);
}

- (void)setFromValue:(id)aValue
{
  POPPropertyAnimationState *s = __state;
  VectorRef vec = POPUnbox(aValue, s->valueType, s->valueCount, YES);
  if (!vec_equal(vec, s->fromVec)) {
    s->fromVec = vec;

    if (s->tracing) {
      [s->tracer updateFromValue:aValue];
    }
  }
}

- (id)toValue
{
  return POPBox(__state->toVec, __state->valueType);
}

- (void)setToValue:(id)aValue
{
  POPPropertyAnimationState *s = __state;
  VectorRef vec = POPUnbox(aValue, s->valueType, s->valueCount, YES);

  if (!vec_equal(vec, s->toVec)) {
    s->toVec = vec;

    // invalidate to dependent state
    s->didReachToValue = false;
    s->distanceVec = NULL;

    if (s->tracing) {
      [s->tracer updateToValue:aValue];
    }

    // automatically unpause active animations
    if (s->active && s->paused) {
      s->setPaused(false);
    }
  }
}

- (id)currentValue
{
  return POPBox(__state->currentValue(), __state->valueType);
}

#pragma mark - Utility

- (void)_appendDescription:(NSMutableString *)s debug:(BOOL)debug
{
  [s appendFormat:@"; from = %@; to = %@", describe(__state->fromVec), describe(__state->toVec)];

  if (_state->active)
    [s appendFormat:@"; currentValue = %@", describe(__state->currentValue())];

  if (__state->velocityVec && 0 != __state->velocityVec->norm())
    [s appendFormat:@"; velocity = %@", describe(__state->velocityVec)];

  if (!self.removedOnCompletion)
    [s appendFormat:@"; removedOnCompletion = %@", POPStringFromBOOL(self.removedOnCompletion)];

  if (__state->progressMarkers)
    [s appendFormat:@"; progressMarkers = [%@]", [__state->progressMarkers componentsJoinedByString:@", "]];

  if (_state->active)
    [s appendFormat:@"; progress = %f", __state->progress];
}

@end

@implementation HPOPPropertyAnimation (NSCopying)

- (instancetype)copyWithZone:(NSZone *)zone {
  
  HPOPPropertyAnimation *copy = [super copyWithZone:zone];
  
  if (copy) {
    copy.property = [self.property copyWithZone:zone];
    copy.fromValue = self.fromValue;
    copy.toValue = self.toValue;
    copy.roundingFactor = self.roundingFactor;
    copy.clampMode = self.clampMode;
    copy.additive = self.additive;
  }
  
  return copy;
}

@end

@implementation HPOPPropertyAnimation (CustomProperty)

+ (instancetype)animationWithCustomPropertyNamed:(NSString *)name
                                       readBlock:(HPOPAnimatablePropertyReadBlock)readBlock
                                      writeBlock:(HPOPAnimatablePropertyWriteBlock)writeBlock
{
  HPOPPropertyAnimation *animation = [[self alloc] init];
  animation.property = [HPOPAnimatableProperty propertyWithName:name initializer:^(HPOPMutableAnimatableProperty *prop) {
    prop.readBlock = readBlock;
    prop.writeBlock = writeBlock;
  }];
  return animation;
}

+ (instancetype)animationWithCustomPropertyReadBlock:(HPOPAnimatablePropertyReadBlock)readBlock
                                          writeBlock:(HPOPAnimatablePropertyWriteBlock)writeBlock
{
  return [self animationWithCustomPropertyNamed:[NSUUID UUID].UUIDString
                                      readBlock:readBlock
                                     writeBlock:writeBlock];
}

@end
