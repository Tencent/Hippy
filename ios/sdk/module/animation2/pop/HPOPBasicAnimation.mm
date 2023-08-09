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

#import "HPOPBasicAnimationInternal.h"

@implementation HPOPBasicAnimation

#undef __state
#define __state ((POPBasicAnimationState *)_state)

#pragma mark - Lifecycle

+ (instancetype)animation
{
  return [[self alloc] init];
}

+ (instancetype)animationWithPropertyNamed:(NSString *)aName
{
  HPOPBasicAnimation *anim = [self animation];
  anim.property = [HPOPAnimatableProperty propertyWithName:aName];
  return anim;
}

- (void)_initState
{
  _state = new POPBasicAnimationState(self);
}

+ (instancetype)linearAnimation
{
  HPOPBasicAnimation *anim = [self animation];
  anim.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionLinear];
  return anim;
}

+ (instancetype)easeInAnimation
{
  HPOPBasicAnimation *anim = [self animation];
  anim.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn];
  return anim;
}

+ (instancetype)easeOutAnimation
{
  HPOPBasicAnimation *anim = [self animation];
  anim.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseOut];
  return anim;
}

+ (instancetype)easeInEaseOutAnimation
{
  HPOPBasicAnimation *anim = [self animation];
  anim.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseInEaseOut];
  return anim;
}

+ (instancetype)defaultAnimation
{
  HPOPBasicAnimation *anim = [self animation];
  anim.timingFunction = [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionDefault];
  return anim;
}

- (id)init
{
  return [self _init];
}

#pragma mark - Properties

DEFINE_RW_PROPERTY(POPBasicAnimationState, duration, setDuration:, CFTimeInterval);
DEFINE_RW_PROPERTY_OBJ(POPBasicAnimationState, timingFunction, setTimingFunction:, CAMediaTimingFunction*, __state->updatedTimingFunction(););

#pragma mark - Utility

- (void)_appendDescription:(NSMutableString *)s debug:(BOOL)debug
{
  [super _appendDescription:s debug:debug];
  if (__state->duration)
    [s appendFormat:@"; duration = %f", __state->duration];
}

@end

@implementation HPOPBasicAnimation (NSCopying)

- (instancetype)copyWithZone:(NSZone *)zone {
  
  HPOPBasicAnimation *copy = [super copyWithZone:zone];
  
  if (copy) {
    copy.duration = self.duration;
    copy.timingFunction = self.timingFunction; // not a 'copy', but timing functions are publicly immutable.
  }
  
  return copy;
}

@end
