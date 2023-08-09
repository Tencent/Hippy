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

#import <Foundation/NSObject.h>

#import "HPOPAnimationTracer.h"
#import "HPOPGeometry.h"

@class CAMediaTimingFunction;

/**
 @abstract The abstract animation base class.
 @discussion Instantiate and use one of the concrete animation subclasses.
 */
@interface HPOPAnimation : NSObject

/**
 @abstract The name of the animation.
 @discussion Optional property to help identify the animation.
 */
@property (copy, nonatomic) NSString *name;

/**
 @abstract Customize the queue on which the animation is executed.
 @discussion Optional property, default at main queue.
 */
@property (nonatomic, weak) dispatch_queue_t customRunningQueue;

/**
 @abstract The beginTime of the animation in media time.
 @discussion Defaults to 0 and starts immediately.
 */
@property (assign, nonatomic) CFTimeInterval beginTime;

/**
 @abstract The animation delegate.
 @discussion See {@ref HPOPAnimationDelegate} for details.
 */
@property (weak, nonatomic) id delegate;

/**
 @abstract The animation tracer.
 @discussion Returns the existing tracer, creating one if needed. Call start/stop on the tracer to toggle event collection.
 */
@property (readonly, nonatomic) HPOPAnimationTracer *tracer;

/**
 @abstract Optional block called on animation start.
 */
@property (copy, nonatomic) void (^animationDidStartBlock)(HPOPAnimation *anim);

/**
 @abstract Optional block called when value meets or exceeds to value.
 */
@property (copy, nonatomic) void (^animationDidReachToValueBlock)(HPOPAnimation *anim);

/**
 @abstract Optional block called on animation completion.
 */
@property (copy, nonatomic) void (^completionBlock)(HPOPAnimation *anim, BOOL finished);

/**
 @abstract Optional block called each frame animation is applied.
 */
@property (copy, nonatomic) void (^animationDidApplyBlock)(HPOPAnimation *anim);

/**
 @abstract Flag indicating whether animation should be removed on completion.
 @discussion Setting to NO can facilitate animation reuse. Defaults to YES.
 */
@property (assign, nonatomic) BOOL removedOnCompletion;

/**
 @abstract Flag indicating whether animation is paused.
 @discussion A paused animation is excluded from the list of active animations. On initial creation, defaults to YES. On animation addition, the animation is implicity unpaused. On animation completion, the animation is implicity paused including for animations with removedOnCompletion set to NO.
 */
@property (assign, nonatomic, getter = isPaused) BOOL paused;

/**
 @abstract Flag indicating whether animation autoreverses.
 @discussion An animation that autoreverses will have twice the duration before it is considered finished. It will animate to the toValue, stop, then animate back to the original fromValue. The delegate methods are called as follows:

     1) animationDidStart: is called at the beginning, as usual, and then after each toValue is reached and the autoreverse is going to start.
     2) animationDidReachToValue: is called every time the toValue is reached. The toValue is swapped with the fromValue at the end of each animation segment. This means that with autoreverses set to YES, the animationDidReachToValue: delegate method will be called a minimum of twice.
     3) animationDidStop:finished: is called every time the toValue is reached, the finished argument will be NO if the autoreverse is not yet complete.
 */
@property (assign, nonatomic) BOOL autoreverses;

/**
 @abstract The number of times to repeat the animation.
 @discussion A repeatCount of 0 or 1 means that the animation will not repeat, just like Core Animation. A repeatCount of 2 or greater means that the animation will run that many times before stopping. The delegate methods are called as follows:

     1) animationDidStart: is called at the beginning of each animation repeat.
     2) animationDidReachToValue: is called every time the toValue is reached.
     3) animationDidStop:finished: is called every time the toValue is reached, the finished argument will be NO if the autoreverse is not yet complete.

When combined with the autoreverses property, a singular animation is effectively twice as long.
 */
@property (assign, nonatomic) NSInteger repeatCount;

/**
 @abstract Repeat the animation forever.
 @discussion This property will make the animation repeat forever. The value of the repeatCount property is undefined when this property is set. The finished parameter of the delegate callback animationDidStop:finished: will always be NO.
 */
@property (assign, nonatomic) BOOL repeatForever;

/**
 @abstract Set pause without reset current state.
 @discussion The `setPaused` method resets the state of the animation and will resume the next time;
 This method, on the other hand, preserves the current state and resumes from the current state.
 */
- (void)setPausedWithoutReset:(BOOL)paused;

@end

/**
 @abstract The animation delegate.
 */
@protocol HPOPAnimationDelegate <NSObject>
@optional

/**
 @abstract Called on animation start.
 @param anim The relevant animation.
 */
- (void)hpop_animationDidStart:(HPOPAnimation *)anim;

/**
 @abstract Called when value meets or exceeds to value.
 @param anim The relevant animation.
 */
- (void)hpop_animationDidReachToValue:(HPOPAnimation *)anim;

/**
 @abstract Called on animation stop.
 @param anim The relevant animation.
 @param finished Flag indicating finished state. Flag is true if the animation reached completion before being removed.
 */
- (void)hpop_animationDidStop:(HPOPAnimation *)anim finished:(BOOL)finished;

/**
 @abstract Called each frame animation is applied.
 @param anim The relevant animation.
 */
- (void)hpop_animationDidApply:(HPOPAnimation *)anim;

@end


@interface NSObject (POP)

/**
 @abstract Add an animation to the reciver.
 @param anim The animation to add.
 @param key The key used to identify the animation.
 @discussion The 'key' may be any string such that only one animation per unique key is added per object.
 */
- (void)hpop_addAnimation:(HPOPAnimation *)anim forKey:(NSString *)key;

/**
 @abstract Remove all animations attached to the receiver.
 */
- (void)hpop_removeAllAnimations;

/**
 @abstract Remove any animation attached to the receiver for 'key'.
 @param key The key used to identify the animation.
 */
- (void)hpop_removeAnimationForKey:(NSString *)key;

/**
 @abstract Returns an array containing the keys of all animations currently attached to the receiver.
 The order of keys reflects the order in which animations will be applied.
 */
- (NSArray *)hpop_animationKeys;

/**
 @abstract Returns any animation attached to the receiver.
 @param key The key used to identify the animation.
 @returns The animation currently attached, or nil if no such animation exists.
 */
- (id)hpop_animationForKey:(NSString *)key;

@end

/**
 *  This implementation of NSCopying does not do any copying of animation's state, but only configuration.
 *  i.e. you cannot copy an animation and expect to apply it to a view and have the copied animation pick up where the original left off.
 *  Two common uses of copying animations:
 *  * you need to apply the same animation to multiple different views.
 *  * you need to absolutely ensure that the the caller of your function cannot mutate the animation once it's been passed in.
 */
@interface HPOPAnimation (NSCopying) <NSCopying>

@end
