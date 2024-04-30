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

#import "HPOPAnimationExtras.h"
#import "HPOPAnimationInternal.h"

#import <objc/runtime.h>

#import "HPOPAction.h"
#import "HPOPAnimationRuntime.h"
#import "HPOPAnimationTracerInternal.h"
#import "HPOPAnimatorPrivate.h"

using namespace HPOP;

#pragma mark - POPAnimation

@implementation HPOPAnimation
@synthesize solver = _solver;
@synthesize currentValue = _currentValue;
@synthesize progressMarkers = _progressMarkers;

#pragma mark - Lifecycle

- (id)init
{
  [NSException raise:NSStringFromClass([self class]) format:@"Attempting to instantiate an abstract class. Use a concrete subclass instead."];
  return nil;
}

- (id)_init
{
  self = [super init];
  if (nil != self) {
    [self _initState];
  }
  return self;
}

- (void)_initState
{
  _state = new POPAnimationState(self);
}

- (void)dealloc
{
  if (_state) {
    delete _state;
    _state = NULL;
  };
}

#pragma mark - Properties

- (id)delegate
{
  return _state->delegate;
}

- (void)setDelegate:(id)delegate
{
  _state->setDelegate(delegate);
}

- (BOOL)isPaused
{
  return _state->paused;
}

- (void)setPaused:(BOOL)paused
{
  _state->setPaused(paused ? true : false);
}

- (void)setPausedWithoutReset:(BOOL)paused {
  _state->setPausedWithoutReset(paused ? true : false);
}

- (NSInteger)repeatCount
{
  if (_state->autoreverses) {
    return _state->repeatCount / 2;
  } else {
    return _state->repeatCount;
  }
}

- (void)setRepeatCount:(NSInteger)repeatCount
{
  if (repeatCount > 0) {
    if (repeatCount > NSIntegerMax / 2) {
      repeatCount = NSIntegerMax / 2;
    }

    if (_state->autoreverses) {
      _state->repeatCount = (repeatCount * 2);
    } else {
      _state->repeatCount = repeatCount;
    }
  }
}

- (BOOL)autoreverses
{
  return _state->autoreverses;
}

- (void)setAutoreverses:(BOOL)autoreverses
{
  _state->autoreverses = autoreverses;
  if (autoreverses) {
    if (_state->repeatCount == 0) {
      [self setRepeatCount:1];
    }
  }
}

FB_PROPERTY_GET(POPAnimationState, type, POPAnimationType);
DEFINE_RW_PROPERTY_OBJ_COPY(POPAnimationState, animationDidStartBlock, setAnimationDidStartBlock:, POPAnimationDidStartBlock);
DEFINE_RW_PROPERTY_OBJ_COPY(POPAnimationState, animationDidReachToValueBlock, setAnimationDidReachToValueBlock:, POPAnimationDidReachToValueBlock);
DEFINE_RW_PROPERTY_OBJ_COPY(POPAnimationState, completionBlock, setCompletionBlock:, POPAnimationCompletionBlock);
DEFINE_RW_PROPERTY_OBJ_COPY(POPAnimationState, animationDidApplyBlock, setAnimationDidApplyBlock:, POPAnimationDidApplyBlock);
DEFINE_RW_PROPERTY_OBJ_COPY(POPAnimationState, name, setName:, NSString*);
DEFINE_RW_PROPERTY(POPAnimationState, beginTime, setBeginTime:, CFTimeInterval);
DEFINE_RW_FLAG(POPAnimationState, removedOnCompletion, removedOnCompletion, setRemovedOnCompletion:);
DEFINE_RW_FLAG(POPAnimationState, repeatForever, repeatForever, setRepeatForever:);

- (id)valueForUndefinedKey:(NSString *)key
{
  return _state->dict[key];
}

- (void)setValue:(id)value forUndefinedKey:(NSString *)key
{
  if (!value) {
    [_state->dict removeObjectForKey:key];
  } else {
    if (!_state->dict)
      _state->dict = [[NSMutableDictionary alloc] init];
    _state->dict[key] = value;
  }
}

- (HPOPAnimationTracer *)tracer
{
  if (!_state->tracer) {
    _state->tracer = [[HPOPAnimationTracer alloc] initWithAnimation:self];
  }
  return _state->tracer;
}

- (NSString *)description
{
  NSMutableString *s = [NSMutableString stringWithFormat:@"<%@:%p", NSStringFromClass([self class]), self];
  [self _appendDescription:s debug:NO];
  [s appendString:@">"];
  return s;
}

- (NSString *)debugDescription
{
  NSMutableString *s = [NSMutableString stringWithFormat:@"<%@:%p", NSStringFromClass([self class]), self];
  [self _appendDescription:s debug:YES];
  [s appendString:@">"];
  return s;
}

#pragma mark - Utility

POPAnimationState *POPAnimationGetState(HPOPAnimation *a)
{
  return a->_state;
}

- (BOOL)_advance:(id)object currentTime:(CFTimeInterval)currentTime elapsedTime:(CFTimeInterval)elapsedTime
{
  return YES;
}

- (void)_appendDescription:(NSMutableString *)s debug:(BOOL)debug
{
  if (_state->name)
    [s appendFormat:@"; name = %@", _state->name];
  
  if (!self.removedOnCompletion)
    [s appendFormat:@"; removedOnCompletion = %@", POPStringFromBOOL(self.removedOnCompletion)];
  
  if (debug) {
    if (_state->active)
      [s appendFormat:@"; active = %@", POPStringFromBOOL(_state->active)];
    
    if (_state->paused)
      [s appendFormat:@"; paused = %@", POPStringFromBOOL(_state->paused)];
  }
  
  if (_state->beginTime) {
    [s appendFormat:@"; beginTime = %f", _state->beginTime];
  }
  
  for (NSString *key in _state->dict) {
    [s appendFormat:@"; %@ = %@", key, _state->dict[key]];
  }
}

@end


#pragma mark - POPPropertyAnimation

#pragma mark - POPBasicAnimation

#pragma mark - POPDecayAnimation

@implementation NSObject (POP)

- (void)hpop_addAnimation:(HPOPAnimation *)anim forKey:(NSString *)key
{
  [[HPOPAnimator sharedAnimator] addAnimation:anim forObject:self key:key];
}

- (void)hpop_removeAllAnimations
{
  [[HPOPAnimator sharedAnimator] removeAllAnimationsForObject:self];
}

- (void)hpop_removeAnimationForKey:(NSString *)key
{
  [[HPOPAnimator sharedAnimator] removeAnimationForObject:self key:key];
}

- (NSArray *)hpop_animationKeys
{
  return [[HPOPAnimator sharedAnimator] animationKeysForObject:self];
}

- (id)hpop_animationForKey:(NSString *)key
{
  return [[HPOPAnimator sharedAnimator] animationForObject:self key:key];
}

@end

@implementation NSProxy (POP)

- (void)hpop_addAnimation:(HPOPAnimation *)anim forKey:(NSString *)key
{
  [[HPOPAnimator sharedAnimator] addAnimation:anim forObject:self key:key];
}

- (void)hpop_removeAllAnimations
{
  [[HPOPAnimator sharedAnimator] removeAllAnimationsForObject:self];
}

- (void)hpop_removeAnimationForKey:(NSString *)key
{
  [[HPOPAnimator sharedAnimator] removeAnimationForObject:self key:key];
}

- (NSArray *)hpop_animationKeys
{
  return [[HPOPAnimator sharedAnimator] animationKeysForObject:self];
}

- (id)hpop_animationForKey:(NSString *)key
{
  return [[HPOPAnimator sharedAnimator] animationForObject:self key:key];
}

@end

@implementation HPOPAnimation (NSCopying)

- (instancetype)copyWithZone:(NSZone *)zone
{
  /*
   * Must use [self class] instead of POPAnimation so that subclasses can call this via super.
   * Even though POPAnimation and POPPropertyAnimation throw exceptions on init,
   * it's safe to call it since you can only copy objects that have been successfully created.
   */
  HPOPAnimation *copy = [[[self class] allocWithZone:zone] init];
  
  if (copy) {
    copy.name = self.name;
    copy.beginTime = self.beginTime;
    copy.delegate = self.delegate;
    copy.animationDidStartBlock = self.animationDidStartBlock;
    copy.animationDidReachToValueBlock = self.animationDidReachToValueBlock;
    copy.completionBlock = self.completionBlock;
    copy.animationDidApplyBlock = self.animationDidApplyBlock;
    copy.removedOnCompletion = self.removedOnCompletion;
    
    copy.autoreverses = self.autoreverses;
    copy.repeatCount = self.repeatCount;
    copy.repeatForever = self.repeatForever;
  }
    
  return copy;
}

@end
