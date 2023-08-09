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

#import "HPOPAnimationTracer.h"
#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

#import <QuartzCore/QuartzCore.h>

#import "HPOPAnimationEventInternal.h"
#import "HPOPAnimationInternal.h"
#import "HPOPSpringAnimation.h"
#import "HPOPDefines.h"

@implementation HPOPAnimationTracer
{
  __weak HPOPAnimation *_animation;
  POPAnimationState *_animationState;
  NSMutableArray *_events;
  BOOL _animationHasVelocity;
}
@synthesize shouldLogAndResetOnCompletion = _shouldLogAndResetOnCompletion;

static HPOPAnimationEvent *create_event(HPOPAnimationTracer *self, POPAnimationEventType type, id value = nil, bool recordAnimation = false)
{
  bool useLocalTime = 0 != self->_animationState->startTime;
  CFTimeInterval time = useLocalTime
    ? self->_animationState->lastTime - self->_animationState->startTime
    : self->_animationState->lastTime;

  HPOPAnimationEvent *event;
  __strong HPOPAnimation* animation = self->_animation;

  if (!value) {
    event = [[HPOPAnimationEvent alloc] initWithType:type time:time];
  } else {
    event = [[HPOPAnimationValueEvent alloc] initWithType:type time:time value:value];
    if (self->_animationHasVelocity) {
#if HPOP_CODE_TRIM
      [(HPOPAnimationValueEvent *)event setVelocity:[(HPOPSpringAnimation *)animation velocity]];
#endif /* HPOP_CODE_TRIM */
    }
  }

  if (recordAnimation) {
    event.animationDescription = [animation description];
  }

  return event;
}

- (id)initWithAnimation:(HPOPAnimation *)anAnim
{
  self = [super init];
  if (nil != self) {
    _animation = anAnim;
    _animationState = POPAnimationGetState(anAnim);
    _events = [[NSMutableArray alloc] initWithCapacity:50];
    _animationHasVelocity = [anAnim respondsToSelector:@selector(velocity)];
  }
  return self;
}

- (void)readPropertyValue:(id)aValue
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventPropertyRead, aValue);
  [_events addObject:event];
}

- (void)writePropertyValue:(id)aValue
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventPropertyWrite, aValue);
  [_events addObject:event];
}

- (void)updateToValue:(id)aValue
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventToValueUpdate, aValue);
  [_events addObject:event];
}

- (void)updateFromValue:(id)aValue
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventFromValueUpdate, aValue);
  [_events addObject:event];
}

- (void)updateVelocity:(id)aValue
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventVelocityUpdate, aValue);
  [_events addObject:event];
}

- (void)updateSpeed:(float)aFloat
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventSpeedUpdate, @(aFloat));
  [_events addObject:event];
}

- (void)updateBounciness:(float)aFloat
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventBouncinessUpdate, @(aFloat));
  [_events addObject:event];
}

- (void)updateFriction:(float)aFloat
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventFrictionUpdate, @(aFloat));
  [_events addObject:event];
}

- (void)updateMass:(float)aFloat
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventMassUpdate, @(aFloat));
  [_events addObject:event];
}

- (void)updateTension:(float)aFloat
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventTensionUpdate, @(aFloat));
  [_events addObject:event];
}

- (void)didStart
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventDidStart, nil, true);
  [_events addObject:event];
}

- (void)didStop:(BOOL)finished
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventDidStop, @(finished), true);
  [_events addObject:event];

  if (_shouldLogAndResetOnCompletion) {
    NSLog(@"events:%@", self.allEvents);
    [self reset];
  }
}

- (void)didReachToValue:(id)aValue
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventDidReachToValue, aValue);
  [_events addObject:event];
}

- (void)autoreversed
{
  HPOPAnimationEvent *event = create_event(self, kHPOPAnimationEventAutoreversed);
  [_events addObject:event];
}

- (void)start
{
  POPAnimationState *s = POPAnimationGetState(_animation);
  s->tracing = true;
}

- (void)stop
{
  POPAnimationState *s = POPAnimationGetState(_animation);
  s->tracing = false;
}

- (void)reset
{
  [_events removeAllObjects];
}

- (NSArray *)allEvents
{
  return [_events copy];
}

- (NSArray *)writeEvents
{
  return [self eventsWithType:kHPOPAnimationEventPropertyWrite];
}

- (NSArray *)eventsWithType:(POPAnimationEventType)aType
{
  NSMutableArray *array = [NSMutableArray array];
  for (HPOPAnimationEvent *event in _events) {
    if (aType == event.type) {
      [array addObject:event];
    }
  }
  return array;
}

@end

#else
@implementation HPOPAnimationTracer
@end
#endif /* HPOP_CODE_TRIM */
