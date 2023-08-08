/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.
 
 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

#import "HPOPAnimationEvent.h"
#import "HPOPAnimationEventInternal.h"

static NSString *stringFromType(POPAnimationEventType aType)
{
  switch (aType) {
    case kHPOPAnimationEventPropertyRead:
      return @"read";
    case kHPOPAnimationEventPropertyWrite:
      return @"write";
    case kHPOPAnimationEventToValueUpdate:
      return @"toValue";
    case kHPOPAnimationEventFromValueUpdate:
      return @"fromValue";
    case kHPOPAnimationEventVelocityUpdate:
      return @"velocity";
    case kHPOPAnimationEventSpeedUpdate:
      return @"speed";
    case kHPOPAnimationEventBouncinessUpdate:
      return @"bounciness";
    case kHPOPAnimationEventFrictionUpdate:
      return @"friction";
    case kHPOPAnimationEventMassUpdate:
      return @"mass";
    case kHPOPAnimationEventTensionUpdate:
      return @"tension";
    case kHPOPAnimationEventDidStart:
      return @"didStart";
    case kHPOPAnimationEventDidStop:
      return @"didStop";
    case kHPOPAnimationEventDidReachToValue:
      return @"didReachToValue";
    case kHPOPAnimationEventAutoreversed:
      return @"autoreversed";
    default:
      return nil;
  }
}

@implementation HPOPAnimationEvent
@synthesize type = _type;
@synthesize time = _time;
@synthesize animationDescription = _animationDescription;

- (instancetype)initWithType:(POPAnimationEventType)aType time:(CFTimeInterval)aTime
{
  self = [super init];
  if (nil != self) {
    _type = aType;
    _time = aTime;
  }
  return self;
}

- (NSString *)description
{
  NSMutableString *s = [NSMutableString stringWithFormat:@"<POPAnimationEvent:%f; type = %@", _time, stringFromType(_type)];
  [self _appendDescription:s];
  [s appendString:@">"];
  return s;
}

// subclass override
- (void)_appendDescription:(NSMutableString *)s
{
  if (0 != _animationDescription.length) {
    [s appendFormat:@"; animation = %@", _animationDescription];
  }
}

@end

@implementation HPOPAnimationValueEvent
@synthesize value = _value;
@synthesize velocity = _velocity;

- (instancetype)initWithType:(POPAnimationEventType)aType time:(CFTimeInterval)aTime value:(id)aValue
{
  self = [self initWithType:aType time:aTime];
  if (nil != self) {
    _value = aValue;
  }
  return self;
}

- (void)_appendDescription:(NSMutableString *)s
{
  [super _appendDescription:s];

  if (nil != _value) {
    [s appendFormat:@"; value = %@", _value];
  }

  if (nil != _velocity) {
    [s appendFormat:@"; velocity = %@", _velocity];
  }
}

@end

#endif /* HPOP_CODE_TRIM */
