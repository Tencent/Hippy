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

@class HippyAnimation;
@class HippyBridge;
@protocol HippyRenderContext;

@interface HippyAnimationIdCount : NSObject
- (void)addCountForAnimationId:(NSNumber *)animationID;
- (BOOL)subtractionCountForAnimationId:(NSNumber *)animationID;
- (NSUInteger)countForAnimationId:(NSNumber *)animationID;
@end

@class HippyAnimator;

@protocol HippyAnimationTimingProtocol <NSObject>

- (BOOL)animationShouldUseCustomerTimingFunction:(HippyAnimator *)animator;

- (void)animationDidStart:(HippyAnimator *)animator animationId:(NSNumber *)animationId;
- (void)animationDidStop:(HippyAnimator *)animator animationId:(NSNumber *)animationId finished:(BOOL)finished;

@end

//TODO HippyAnimator相关的代码逻辑应该移动到hippy，而不是render
@interface HippyAnimator : NSObject

- (instancetype)initWithRenderContext:(id<HippyRenderContext>)renderContext;

@property(nonatomic, weak) id<HippyAnimationTimingProtocol> animationTimingDelegate;
@property(nonatomic, weak) HippyBridge *bridge;

- (void)createAnimation:(NSNumber *)animationId mode:(NSString *)mode params:(NSDictionary *)params;
- (void)createAnimationSet:(NSNumber *)animationId animations:(NSDictionary *)animations;
- (void)startAnimation:(NSNumber *)animationId;
- (void)pauseAnimation:(NSNumber *)animationId;
- (void)resumeAnimation:(NSNumber *)animationId;
- (void)updateAnimation:(NSNumber *)animationId params:(NSDictionary *)params;
- (void)destroyAnimation:(NSNumber *)animationId;

- (NSDictionary *)bindAnimaiton:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag;
- (void)connectAnimationToView:(UIView *)view;
- (HippyAnimation *)animationFromID:(NSNumber *)animationID;
- (void)invalidate;

@end
