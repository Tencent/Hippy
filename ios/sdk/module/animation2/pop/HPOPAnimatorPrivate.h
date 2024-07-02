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

#import "HPOPAnimator.h"

@class HPOPAnimation;

@protocol HPOPAnimatorObserving <NSObject>
@required

/**
 @abstract Called on each observer after animator has advanced. Core Animation actions are disabled by default.
 */
- (void)animatorDidAnimate:(HPOPAnimator *)animator;

@end

@interface HPOPAnimator ()

#if !TARGET_OS_IPHONE
/**
 Determines whether or not to use a high priority background thread for animation updates. Using a background thread can result in faster, more responsive updates, but may be less compatible. Defaults to YES.
 */
+ (BOOL)disableBackgroundThread;
+ (void)setDisableBackgroundThread:(BOOL)flag;

/**
 Determines the frequency (Hz) of the timer used when no display is available. Defaults to 60Hz.
 */
+ (uint64_t)displayTimerFrequency;
+ (void)setDisplayTimerFrequency:(uint64_t)frequency;
#endif

/**
 Used for externally driven animator instances.
 */
@property (assign, nonatomic) BOOL disableDisplayLink;

/**
 Time used when starting animations. Defaults to 0 meaning current media time is used. Exposed for unit testing.
 */
@property (assign, nonatomic) CFTimeInterval beginTime;

/**
 Exposed for unit testing.
 */
- (void)renderTime:(CFTimeInterval)time;

/**
 Funnel methods for category additions.
 */
- (void)addAnimation:(HPOPAnimation *)anim forObject:(id)obj key:(NSString *)key;
- (void)addAnimations:(NSArray<HPOPAnimation *> *)anims forObjects:(NSArray<id> *)objs andKeys:(NSArray<NSString *> *)keys;
- (void)removeAllAnimationsForObject:(id)obj;
- (void)removeAnimationForObject:(id)obj key:(NSString *)key;
- (NSArray *)animationKeysForObject:(id)obj;
- (HPOPAnimation *)animationForObject:(id)obj key:(NSString *)key;

/**
 @abstract Add an animator observer. Observer will be notified of each subsequent animator advance until removal.
 */
- (void)addObserver:(id<HPOPAnimatorObserving>)observer;

/**
 @abstract Remove an animator observer.
 */
- (void)removeObserver:(id<HPOPAnimatorObserving>)observer;

@end
