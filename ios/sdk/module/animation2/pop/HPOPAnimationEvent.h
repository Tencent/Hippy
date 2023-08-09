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

#import "HPOPDefines.h"
#if HPOP_CODE_TRIM

/**
 @abstract Enumeraton of animation event types.
 */
typedef NS_ENUM(NSUInteger, POPAnimationEventType) {
  kHPOPAnimationEventPropertyRead = 0,
  kHPOPAnimationEventPropertyWrite,
  kHPOPAnimationEventToValueUpdate,
  kHPOPAnimationEventFromValueUpdate,
  kHPOPAnimationEventVelocityUpdate,
  kHPOPAnimationEventBouncinessUpdate,
  kHPOPAnimationEventSpeedUpdate,
  kHPOPAnimationEventFrictionUpdate,
  kHPOPAnimationEventMassUpdate,
  kHPOPAnimationEventTensionUpdate,
  kHPOPAnimationEventDidStart,
  kHPOPAnimationEventDidStop,
  kHPOPAnimationEventDidReachToValue,
  kHPOPAnimationEventAutoreversed
};

/**
 @abstract The base animation event class.
 */
@interface HPOPAnimationEvent : NSObject

/**
 @abstract The event type. See {@ref POPAnimationEventType} for possible values.
 */
@property (readonly, nonatomic, assign) POPAnimationEventType type;

/**
 @abstract The time of event.
 */
@property (readonly, nonatomic, assign) CFTimeInterval time;

/**
 @abstract Optional string describing the animation at time of event.
 */
@property (readonly, nonatomic, copy) NSString *animationDescription;

@end

/**
 @abstract An animation event subclass for recording value and velocity.
 */
@interface HPOPAnimationValueEvent : HPOPAnimationEvent

/**
 @abstract The value recorded.
 */
@property (readonly, nonatomic, strong) id value;

/**
 @abstract The velocity recorded, if any.
 */
@property (readonly, nonatomic, strong) id velocity;

@end

#endif /* HPOP_CODE_TRIM */
