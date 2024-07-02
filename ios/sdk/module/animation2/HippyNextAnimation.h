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
#import "HippyUIManager.h"
#import "HPOP.h"

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSInteger, HippyNextAnimationState) {
    HippyNextAnimationInitState,
    HippyNextAnimationReadyState,
    HippyNextAnimationStartedState,
    HippyNextAnimationFinishState
};

typedef NS_ENUM(NSInteger, HippyNextAnimationValueType) {
    HippyNextAnimationValueTypeUndefined,
    HippyNextAnimationValueTypeRad,
    HippyNextAnimationValueTypeDeg,
    HippyNextAnimationValueTypeColor,
};


@class HippyNextAnimation;
/// A delegate which animation uses to notify ui relayout
@protocol HippyNextAnimationControlDelegate <NSObject>

/// request for updating layout
- (void)requestUpdateUILayout:(HippyNextAnimation *)anim withNextFrameProp:(nullable NSDictionary *)nextFrameProp;

/// Add animation to pending start list 
///
/// To ensure that the animation in AnimationGroup starts simultaneously.
/// - Parameter anim: HippyNextAnimation instance
- (void)addAnimInGroupToPendingStartList:(HippyNextAnimation *)anim;

@end


/// Hippy Animation Object
@interface HippyNextAnimation : HPOPBasicAnimation

/// the id for animation
@property (nonatomic, strong) NSNumber *animationId;

/// delegate for special animation events
@property (nonatomic, weak) id<HippyNextAnimationControlDelegate> controlDelegate;

/// the animation state
@property (atomic, assign) HippyNextAnimationState state;

/// Whether is first start, YES means is not first Start, default NO.
/// Used in event report (judge is first start or not).
@property (nonatomic, assign) BOOL isFirstStartPassed;

/// original From value before apply unit conversion
@property (nonatomic, strong) id originFromValue;

/// original To value before apply unit conversion
@property (nonatomic, strong) id originToValue;

/// type of value
@property (nonatomic, assign) HippyNextAnimationValueType valueType;

/// delay time before start
@property (nonatomic, assign) NSTimeInterval delayTime;

/// the target object
@property (nonatomic, weak) id targetObject;


/// Create an instance from config
/// - Parameter prop: animation config
+ (instancetype)animationFromConfigParams:(NSDictionary *)params;

/// Is animation prop belong to shadow view
/// - Parameter prop: layout prop
/// - Parameter isShadow: Whether to bind the transform animation to shadowView
+ (BOOL)isShadowViewAnimationProp:(NSString *)prop treatTransformAsShadowAnimation:(BOOL)isShadow;

/// Do some stuff before start, like value pre-treat
/// - Parameters:
///   - target: animation target, view or shadowView or others
///   - type: the animation type, like `width` or `height` etc...
- (BOOL)prepareForTarget:(id)target withType:(NSString *)type;

/// Update Animation Config
/// - Parameter updatedConfig: the updated config
- (void)updateAnimation:(NSDictionary *)updatedConfig;

/// Start
- (void)startAnimation;

/// Gets the from value converted by units
/// - Parameter type: animation type
- (id)getPretreatedFromValueForAnimType:(NSString *)type;

/// Gets the to value converted by units
/// - Parameter type: animation type
- (id)getPretreatedToValueForAnimType:(NSString *)type;

@end

NS_ASSUME_NONNULL_END
