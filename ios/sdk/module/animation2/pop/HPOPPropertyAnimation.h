/**
 Copyright (c) 2014-present, Facebook, Inc.
 All rights reserved.

 This source code is licensed under the BSD-style license found in the
 LICENSE file in the root directory of this source tree. An additional grant
 of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HPOPAnimatableProperty.h"
#import "HPOPAnimation.h"

/**
 @abstract Flags for clamping animation values.
 @discussion Animation values can optionally be clamped to avoid overshoot. kHPOPAnimationClampStart ensures values are more than fromValue and kHPOPAnimationClampEnd ensures values are less than toValue.
 */
typedef NS_OPTIONS(NSUInteger, POPAnimationClampFlags)
{
  kHPOPAnimationClampNone        = 0,
  kHPOPAnimationClampStart       = 1UL << 0,
  kHPOPAnimationClampEnd         = 1UL << 1,
  kHPOPAnimationClampBoth = kHPOPAnimationClampStart | kHPOPAnimationClampEnd,
};

/**
 @abstract The semi-concrete property animation subclass.
 */
@interface HPOPPropertyAnimation : HPOPAnimation

/**
 @abstract The property to animate.
 */
@property (strong, nonatomic) HPOPAnimatableProperty *property;

/**
 @abstract The value to animate from.
 @discussion The value type should match the property. If unspecified, the value is initialized to the object's current value on animation start.
 */
@property (copy, nonatomic) id fromValue;

/**
 @abstract The value to animate to.
 @discussion The value type should match the property. If unspecified, the value is initialized to the object's current value on animation start.
 */
@property (copy, nonatomic) id toValue;

/**
 @abstract The rounding factor applied to the current animated value.
 @discussion Specify 1.0 to animate between integral values. Defaults to 0 meaning no rounding.
 */
@property (assign, nonatomic) CGFloat roundingFactor;

/**
 @abstract The clamp mode applied to the current animated value.
 @discussion See {@ref POPAnimationClampFlags} for possible values. Defaults to kHPOPAnimationClampNone.
 */
@property (assign, nonatomic) NSUInteger clampMode;

/**
 @abstract The flag indicating whether values should be "added" each frame, rather than set.
 @discussion Addition may be type dependent. Defaults to NO.
 */
@property (assign, nonatomic, getter = isAdditive) BOOL additive;

@end

@interface HPOPPropertyAnimation (CustomProperty)

+ (instancetype)animationWithCustomPropertyNamed:(NSString *)name
                                       readBlock:(HPOPAnimatablePropertyReadBlock)readBlock
                                      writeBlock:(HPOPAnimatablePropertyWriteBlock)writeBlock;

+ (instancetype)animationWithCustomPropertyReadBlock:(HPOPAnimatablePropertyReadBlock)readBlock
                                          writeBlock:(HPOPAnimatablePropertyWriteBlock)writeBlock;

@end
