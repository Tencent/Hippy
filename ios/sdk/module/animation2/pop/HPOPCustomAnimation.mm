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

#import "HPOPAnimationInternal.h"

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

#import "HPOPCustomAnimation.h"

@interface HPOPCustomAnimation ()
@property (nonatomic, copy) HPOPCustomAnimationBlock animate;
@end

@implementation HPOPCustomAnimation
@synthesize currentTime = _currentTime;
@synthesize elapsedTime = _elapsedTime;
@synthesize animate = _animate;

+ (instancetype)animationWithBlock:(BOOL(^)(id target, HPOPCustomAnimation *))block
{
  HPOPCustomAnimation *b = [[self alloc] _init];
  b.animate = block;
  return b;
}

- (id)_init
{
  self = [super _init];
  if (nil != self) {
    _state->type = kHPOPAnimationCustom;
  }
  return self;
}

- (CFTimeInterval)beginTime
{
  POPAnimationState *s = POPAnimationGetState(self);
  return s->startTime > 0 ? s->startTime : s->beginTime;
}

- (BOOL)_advance:(id)object currentTime:(CFTimeInterval)currentTime elapsedTime:(CFTimeInterval)elapsedTime
{
  _currentTime = currentTime;
  _elapsedTime = elapsedTime;
  return _animate(object, self);
}

- (void)_appendDescription:(NSMutableString *)s debug:(BOOL)debug
{
  [s appendFormat:@"; elapsedTime = %f; currentTime = %f;", _elapsedTime, _currentTime];
}

@end

/**
 *  Note that only the animate block is copied, but not the current/elapsed times
 */
@implementation HPOPCustomAnimation (NSCopying)

- (instancetype)copyWithZone:(NSZone *)zone {
  
  HPOPCustomAnimation *copy = [super copyWithZone:zone];
  
  if (copy) {
    copy.animate = self.animate;
  }
  
  return copy;
}

@end

#endif /* HPOP_CODE_TRIM */
