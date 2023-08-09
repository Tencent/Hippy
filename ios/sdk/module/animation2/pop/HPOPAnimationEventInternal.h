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

#import "HPOPAnimationEvent.h"

@interface HPOPAnimationEvent ()

/**
 @abstract Default initializer.
 */
- (instancetype)initWithType:(POPAnimationEventType)type time:(CFTimeInterval)time;

/**
 @abstract Readwrite redefinition of public property.
 */
@property (readwrite, nonatomic, copy) NSString *animationDescription;

@end

@interface HPOPAnimationValueEvent ()

/**
 @abstract Default initializer.
 */
- (instancetype)initWithType:(POPAnimationEventType)type time:(CFTimeInterval)time value:(id)value;

/**
 @abstract Readwrite redefinition of public property.
 */
@property (readwrite, nonatomic, strong) id velocity;

@end

#endif /* HPOP_CODE_TRIM */
