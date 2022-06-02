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
#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>
#import "dom/animation/animation_manager.h"

@class HippyAnimation;

typedef NS_ENUM(NSInteger, HippyAnimationValueType) {
    HippyAnimationValueTypeNone,
    HippyAnimationValueTypeRad,
    HippyAnimationValueTypeDeg,
    HippyAnimationValueTypeColor,
};

typedef NS_ENUM(NSInteger, HippyAnimationDirection) {
    HippyAnimationDirectionCenter,
    HippyAnimationDirectionLeft,
    HippyAnimationDirectionTop,
    HippyAnimationDirectionBottom,
    HippyAnimationDirectionRight
};
typedef NS_ENUM(NSInteger, HippyAnimationState) {
    HippyAnimationInitState,
    HippyAnimationReadyState,
    HippyAnimationStartedState,
    HippyAnimationFinishState
};

@interface HippyAnimation : NSObject <CAAnimationDelegate>

@property (nonatomic, assign) double startValue;
@property (nonatomic, assign) double endValue;
@property (nonatomic, assign, readonly) NSTimeInterval delay;
@property (nonatomic, assign, readonly) float repeatCount;
@property (nonatomic, strong, readonly) NSNumber *animationId;
@property (nonatomic, assign) NSTimeInterval duration;
@property (nonatomic, strong, readonly) CAMediaTimingFunction *timingFunction;
@property (nonatomic, assign, readonly) HippyAnimationValueType valueType;
@property (nonatomic, assign, readonly) HippyAnimationDirection directionType;
@property (nonatomic, copy) NSNumber *parentAnimationId;
@property (nonatomic, assign) HippyAnimationState state;
@property (nonatomic, assign) std::weak_ptr<hippy::AnimationManager> animationManager;

- (void)updateAnimation:(NSDictionary *)config;

- (CAAnimation *)animationOfView:(UIView *)view forProp:(NSString *)prop;

- (instancetype)initWithMode:(NSString *)mode animationId:(NSNumber *)animationID config:(NSDictionary *)config;

@end
