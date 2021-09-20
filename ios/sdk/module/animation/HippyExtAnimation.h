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
@class HippyExtAnimation;

typedef NS_ENUM(NSInteger, HippyExtAnimationValueType) {
    HippyExtAnimationValueTypeNone,
    HippyExtAnimationValueTypeRad,
    HippyExtAnimationValueTypeDeg,
    HippyExtAnimationValueTypeColor,
};

typedef NS_ENUM(NSInteger, HippyExtAnimationDirection) {
    HippyExtAnimationDirectionCenter,
    HippyExtAnimationDirectionLeft,
    HippyExtAnimationDirectionTop,
    HippyExtAnimationDirectionBottom,
    HippyExtAnimationDirectionRight
};
typedef NS_ENUM(NSInteger, HippyExtAnimationState) {
    HippyExtAnimationInitState,
    HippyExtAnimationReadyState,
    HippyExtAnimationStartedState,
    HippyExtAnimationFinishState
};

@interface HippyExtAnimation : NSObject <CAAnimationDelegate>

@property (nonatomic, assign) double startValue;
@property (nonatomic, assign) double endValue;
@property (nonatomic, assign, readonly) NSTimeInterval delay;
@property (nonatomic, assign, readonly) float repeatCount;
@property (nonatomic, strong, readonly) NSNumber *animationId;
@property (nonatomic, assign) NSTimeInterval duration;
@property (nonatomic, strong, readonly) CAMediaTimingFunction *timingFunction;
@property (nonatomic, assign, readonly) HippyExtAnimationValueType valueType;
@property (nonatomic, assign, readonly) HippyExtAnimationDirection directionType;
@property (nonatomic, copy) NSNumber *parentAnimationId;
@property (nonatomic, assign) HippyExtAnimationState state;

- (void)updateAnimation:(NSDictionary *)config;

- (CAAnimation *)animationOfView:(UIView *)view forProp:(NSString *)prop;

- (instancetype)initWithMode:(NSString *)mode animationId:(NSNumber *)animationID config:(NSDictionary *)config;

@end
