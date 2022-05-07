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

#import <Foundation/Foundation.h>
#import <QuartzCore/CAMediaTimingFunction.h>
#import <UIKit/UIView.h>
#import "dom/animation_manager.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyAnimation, TimingAnimation;

@protocol TimingAnimationDelegate <NSObject>

@optional
- (void)timingAnimationDidStart:(TimingAnimation *)animation;
- (void)timingAnimationDidStop:(TimingAnimation *)animation;

@end

@interface TimingAnimation : NSObject

+ (BOOL)canHandleAnimationForProperty:(NSString *)keyPath;

- (instancetype)initWithKeyPath:(NSString *)keyPath timingFunction:(CAMediaTimingFunction *)timingFunction
                     domManager:(std::weak_ptr<hippy::AnimationManager>)animationManager viewTag:(int32_t)viewTag;

- (void)startAnimating;
- (void)pauseAnimating;
- (void)resumeAnimating;
- (void)removeAnimating;

//TODO 这里应该使用协议抽象HippyAnimation与TimingAnimation。
@property(nonatomic, weak) HippyAnimation *hpAni;
@property(nonatomic, assign) NSTimeInterval duration;
@property(nonatomic, strong) NSNumber *animationId;
@property(nonatomic, weak) id<TimingAnimationDelegate> delegate;

@end

@interface UIView(TimingAnimation)

- (void)addTimingAnimation:(TimingAnimation *)animation;

@end

NS_ASSUME_NONNULL_END
