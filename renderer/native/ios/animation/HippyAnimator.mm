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

#import "HippyAnimation.h"
#import "HippyAnimationGroup.h"
#import "HippyAnimation+Group.h"
#import "HippyAnimator.h"
#import "HippyAnimationViewParams.h"
#import <objc/runtime.h>
#import <UIKit/UIKit.h>
#import "CALayer+HippyAnimation.h"
#import "UIView+Hippy.h"
#import "HippyRenderContext.h"
#import "TimingAnimation.h"
#import "HippyUIManager.h"
#import "HippyBridge.h"

@implementation HippyAnimationIdCount {
    NSMutableDictionary *_animationIdDic;
}
- (instancetype)init {
    self = [super init];
    if (self) {
        _animationIdDic = [NSMutableDictionary dictionary];
    }
    return self;
}
- (void)addCountForAnimationId:(NSNumber *)animationId {
    NSNumber *number = [_animationIdDic objectForKey:animationId];
    [_animationIdDic setObject:@([number unsignedIntegerValue] + 1) forKey:animationId];
}
- (BOOL)subtractionCountForAnimationId:(NSNumber *)animationId {
    NSNumber *number = [_animationIdDic objectForKey:animationId];
    if (number) {
        NSUInteger count = [number unsignedIntegerValue];
        if (count == 1) {
            [_animationIdDic removeObjectForKey:animationId];
            return YES;
        } else {
            [_animationIdDic setObject:@(count - 1) forKey:animationId];
            return NO;
        }
    }
    return YES;
}
- (NSUInteger)countForAnimationId:(NSNumber *)animationId {
    NSNumber *count = [_animationIdDic objectForKey:animationId];
    return [count unsignedIntegerValue];
}
@end

@interface HippyAnimator () <CAAnimationDelegate>
@property(nonatomic, weak) id<HippyRenderContext> renderContext;
@end

@implementation HippyAnimator {
    NSMutableDictionary<NSNumber *, HippyAnimation *> *_animationById;
    NSMutableDictionary<NSNumber *, NSMutableArray<HippyAnimationViewParams *> *> *_paramsByAnimationId;
    NSMutableDictionary<NSNumber *, HippyAnimationViewParams *> *_paramsByHippyTag;
    NSMapTable<NSNumber *, TimingAnimation *> *_timingAnimationMap;
    HippyAnimationIdCount *_virtualAnimations;
    std::mutex _mutex;
}

- (instancetype)initWithRenderContext:(id<HippyRenderContext>)renderContext {
    if (self = [super init]) {
        _animationById = [NSMutableDictionary new];
        _paramsByHippyTag = [NSMutableDictionary new];
        _paramsByAnimationId = [NSMutableDictionary new];
        _renderContext = renderContext;
        _virtualAnimations = [[HippyAnimationIdCount alloc] init];
        _timingAnimationMap = [NSMapTable strongToWeakObjectsMapTable];
    }
    return self;
}

- (void)invalidate {
    std::lock_guard<std::mutex> lock(_mutex);
    [_paramsByAnimationId removeAllObjects];
    [_paramsByHippyTag removeAllObjects];
    [_animationById removeAllObjects];
}

- (BOOL)isRunInDomThread {
    return YES;
}

- (void)createAnimation:(NSNumber *)animationId mode:(NSString *)mode params:(NSDictionary *)params {
    std::lock_guard<std::mutex> lock(_mutex);
    HippyAnimation *ani = [[HippyAnimation alloc] initWithMode: mode animationId: animationId config: params];
    [_animationById setObject: ani forKey: animationId];
}

- (void)createAnimationSet:(NSNumber *)animationId animations:(NSDictionary *)animations {
    std::lock_guard<std::mutex> lock(_mutex);
    HippyAnimationGroup *group = [[HippyAnimationGroup alloc] initWithMode: @"group" animationId: animationId config: animations];
    group.virtualAnimation = [animations[@"virtual"] boolValue];
    NSArray *children = animations[@"children"];
    NSMutableArray *anis = [NSMutableArray arrayWithCapacity: children.count];
    [children enumerateObjectsUsingBlock:^(NSDictionary * info, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
        NSNumber *subAnimationId = info[@"animationId"];
        BOOL follow = [info[@"follow"] boolValue];
        HippyAnimation *ani = self->_animationById[subAnimationId];
        if (ani == nil) {
            NSAssert(ani != nil, @"create group animation but use illege sub animaiton");
            return;
        }
        ani.bFollow = follow;
        [anis addObject: ani];
    }];
    group.animations = anis;
    [_animationById setObject: group forKey: animationId];
}


- (void)startAnimation:(NSNumber *)animationId {
    std::lock_guard<std::mutex> lock(_mutex);
    HippyAnimation *ani = _animationById[animationId];
    if (ani.state == HippyAnimationStartedState) {
        return;
    }
    ani.state = HippyAnimationReadyState;
    
    if ([ani isKindOfClass:[HippyAnimationGroup class]]) {
        HippyAnimationGroup *group = (HippyAnimationGroup *)ani;
        if (group.virtualAnimation) {
            for (HippyAnimation *animation in group.animations) {
                [_virtualAnimations addCountForAnimationId:animationId];
                animation.parentAnimationId = animationId;
                NSNumber *animationId = animation.animationId;
                animation.state = HippyAnimationReadyState;
                [self paramForAnimationId:animationId];
            }
        } else {
            [self paramForAnimationId:animationId];
        }
    } else {
        [self paramForAnimationId:animationId];
    }
}


- (void)pauseAnimation:(NSNumber *)animationId {
    std::lock_guard<std::mutex> lock(_mutex);
    TimingAnimation *tAni = [_timingAnimationMap objectForKey:animationId];
    if (tAni) {
        [tAni performSelectorOnMainThread:@selector(pauseAnimating) withObject:nil waitUntilDone:NO];
    }
    else {
        NSArray <HippyAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
        [self.renderContext addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [params enumerateObjectsUsingBlock:^(HippyAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
                UIView *view = [renderContext viewFromRenderViewTag:param.hippyTag];
                [view.layer pauseLayerAnimation];
            }];
        }];
    }
}

- (void)resumeAnimation:(NSNumber *)animationId {
    std::lock_guard<std::mutex> lock(_mutex);
    TimingAnimation *tAni = [_timingAnimationMap objectForKey:animationId];
    if (tAni) {
        [tAni performSelectorOnMainThread:@selector(resumeAnimating) withObject:nil waitUntilDone:NO];
    }
    else {
        NSArray <HippyAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
        [self.renderContext addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [params enumerateObjectsUsingBlock:^(HippyAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
                UIView *view = [renderContext viewFromRenderViewTag:param.hippyTag];
                [view.layer resumeLayerAnimation];
            }];
        }];
    }
}

- (void)paramForAnimationId:(NSNumber *)animationId {
    NSArray<HippyAnimationViewParams *> *params = _paramsByAnimationId[animationId];
    NSMutableArray<NSNumber *> *hippyTags = [NSMutableArray new];
    [params enumerateObjectsUsingBlock:^(HippyAnimationViewParams *_Nonnull param, NSUInteger __unused idx, BOOL *_Nonnull __unused stop) {
        [hippyTags addObject:param.hippyTag];
    }];

    if (!hippyTags.count) {
        return;
    }

    __weak HippyAnimator *weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        [hippyTags enumerateObjectsUsingBlock:^(NSNumber *_Nonnull tag, __unused NSUInteger idx, __unused BOOL *stop) {
            UIView *view = [self.renderContext viewFromRenderViewTag:tag];
            if (!view) {
                return;
            }
            if (view.window) {
                [view.layer resumeLayerAnimation];
                [weakSelf connectAnimationToView:view];
                return;
            }
            
            //HippyLogInfo(@"[Hippy_OC_Log][Animation],Animation_Not_Add_To_Window, %@", animationId);
            [params enumerateObjectsUsingBlock:^(HippyAnimationViewParams *p, __unused NSUInteger idx, __unused BOOL *stop) {
                [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *obj, __unused BOOL *stop1) {
                    HippyAnimation *ani = self->_animationById[obj];
                    if (![obj isEqual:animationId]) {
                        return;
                    }

                    [p setValue:@(ani.endValue) forProp:key];
                    ani.state = HippyAnimationFinishState;
                }];
            }];
            [self.renderContext executeBlockOnRenderQueue:^{
                for (HippyAnimationViewParams *param in params) {
                    [self.renderContext updateView:param.hippyTag props:param.updateParams];
                }
                [self.renderContext setNeedsLayout];
            }];
        }];
    });
}

- (void)updateAnimation:(NSNumber *__nonnull)animationId params:(NSDictionary *)params {
    if (params == nil) {
        return;
    }
    std::lock_guard<std::mutex> lock(_mutex);
    HippyAnimation *ani = _animationById[animationId];
    
    ani.state = HippyAnimationInitState;
    
    [ani updateAnimation: params];
    
    NSMutableArray <HippyAnimationViewParams *> *viewParams = _paramsByAnimationId[animationId];
    NSMutableArray *updateParams = [NSMutableArray new];
    [viewParams enumerateObjectsUsingBlock:^(HippyAnimationViewParams * _Nonnull p,__unused NSUInteger idx,__unused BOOL * stop) {
        [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString * key, NSNumber * obj,__unused BOOL * istop) {
            HippyAnimation *rcani = self->_animationById[obj];
            if ([obj isEqual: animationId]) {
                [p setValue: @(rcani.startValue) forProp: key];
                [updateParams addObject: p.updateParams];
                //HippyLogInfo(@"[Hippy_OC_Log][Animation],Update_Animation:[%@] key:[%@] value:[%@]", animationId, key, params[@"startValue"]);
            }
        }];
    }];
    [self.renderContext executeBlockOnRenderQueue:^{
        for (HippyAnimationViewParams *param in params) {
            [self.renderContext updateView:param.hippyTag props:param.updateParams];
        }
        [self.renderContext setNeedsLayout];
    }];
}

- (void)destroyAnimation:(NSNumber * __nonnull)animationId {
    std::lock_guard<std::mutex> lock(_mutex);
    [_animationById removeObjectForKey: animationId];
    TimingAnimation *tAni = [_timingAnimationMap objectForKey:animationId];
    if (tAni) {
        [tAni removeAnimating];
        [_timingAnimationMap removeObjectForKey:animationId];
    }
    else {
        NSMutableArray <HippyAnimationViewParams *> *params = _paramsByAnimationId[animationId];
        [self.renderContext addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            [params enumerateObjectsUsingBlock:^(HippyAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
                UIView *view = [renderContext viewFromRenderViewTag:param.hippyTag];
                [view.layer removeAnimationForKey: [NSString stringWithFormat: @"%@", animationId]];
            }];
        }];
    }
    [_paramsByAnimationId removeObjectForKey: animationId];
}

#pragma mark - CAAnimationDelegate
- (void)animationDidStart:(CAAnimation *)anim {
    NSNumber *animationId = [anim valueForKey:@"animationID"];
    if ([self.animationTimingDelegate respondsToSelector:@selector(animationDidStart:animationId:)]) {
        [self.animationTimingDelegate animationDidStart:self animationId:animationId];
    }
}

- (void)animationDidStop:(CAAnimation *)anim finished:(BOOL)flag {
    std::lock_guard<std::mutex> lock(_mutex);
    NSNumber *animationId = [anim valueForKey:@"animationID"];
    NSNumber *viewId = [anim valueForKey:@"viewID"];

    NSMutableArray<HippyAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
    [self.renderContext executeBlockOnRenderQueue:^{
        [params enumerateObjectsUsingBlock:^(HippyAnimationViewParams *p, __unused NSUInteger idx, __unused BOOL *stop) {
            [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *obj, __unused BOOL *stop1) {
                HippyAnimation *ani = self->_animationById[obj];
                if (![obj isEqual:animationId]) {
                    return;
                }

                [p setValue:@(ani.endValue) forProp:key];
                ani.state = HippyAnimationFinishState;
                //HippyLogInfo(@"[Hippy_OC_Log][Animation],Animation_Did_Stop:%@ finish:%@ prop:%@ value:%@", animationId, @(flag), key, @(ani.endValue));
            }];
        }];
    }];

    [self.renderContext executeBlockOnRenderQueue:^{
        for (HippyAnimationViewParams *param in params) {
            [self.renderContext updateView:param.hippyTag props:param.updateParams];
        }
        [self.renderContext addUIBlock:^(id<HippyRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
            UIView *view = [viewRegistry objectForKey:viewId];
            [view.layer removeAnimationForKey:[NSString stringWithFormat:@"%@", animationId]];
            if (!CGPointEqualToPoint(view.layer.anchorPoint, CGPointMake(.5f, .5f))) {
                CALayer *viewLayer = view.layer;
                CGPoint cener = CGPointMake(CGRectGetWidth(viewLayer.bounds) / 2, CGRectGetHeight(viewLayer.bounds) / 2);
                CGPoint expectedPosition = [viewLayer convertPoint:cener toLayer:viewLayer.superlayer];
                viewLayer.anchorPoint = CGPointMake(.5f, .5f);
                viewLayer.position = expectedPosition;
            }
        }];
        [self.renderContext setNeedsLayout];
    }];
    NSNumber *animationSetId = [anim valueForKey:@"animationParentID"];
    if (animationSetId) {
        if ([_virtualAnimations subtractionCountForAnimationId:animationSetId]) {
            if ([self.animationTimingDelegate respondsToSelector:@selector(animationDidStop:animationId:finished:)]) {
                [self.animationTimingDelegate animationDidStop:self animationId:animationSetId finished:flag];
            }
        }
    } else {
        if ([self.animationTimingDelegate respondsToSelector:@selector(animationDidStop:animationId:finished:)]) {
            [self.animationTimingDelegate animationDidStop:self animationId:animationId finished:flag];
        }
    }
}
#pragma mark -
- (NSDictionary *)bindAnimaiton:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag {
    std::lock_guard<std::mutex> lock(_mutex);
    HippyAnimationViewParams *p = [[HippyAnimationViewParams alloc] initWithParams:params animator:self viewTag:viewTag rootTag:rootTag];
    [p parse];

    BOOL contain = [self alreadyConnectAnimation:p];
    [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *animationId, __unused BOOL *stop) {
        HippyAnimation *ani = self->_animationById[animationId];

        if (ani.state == HippyAnimationFinishState) {
            [p setValue:@(ani.endValue) forProp:key];
        } else {
            [p setValue:@(ani.startValue) forProp:key];
        }

        NSMutableArray *viewParams = self->_paramsByAnimationId[animationId];
        if (viewParams == nil) {
            viewParams = [NSMutableArray new];
            [self->_paramsByAnimationId setObject:viewParams forKey:animationId];
        }

        if (!contain) {
            [viewParams addObject:p];
            //HippyLogInfo(@"[Hippy_OC_Log][Animation],Bind_Animation:[%@] to view [%@] prop [%@]", animationId, viewTag, key);
        } else {
            NSInteger index = [viewParams indexOfObject:p];
            if (index != NSNotFound) {
                [viewParams removeObjectAtIndex:index];
            }
            [viewParams addObject:p];
        }
    }];
    [_paramsByHippyTag setObject:p forKey:viewTag];
    return p.updateParams;
}

- (void)connectAnimationToView:(UIView *)view {
    std::lock_guard<std::mutex> lock(_mutex);
    NSNumber *hippyTag = view.hippyTag;
    HippyAnimationViewParams *p = _paramsByHippyTag[hippyTag];
    NSMutableArray<CAAnimation *> *animations = [NSMutableArray new];
    NSDictionary *animationIdWithPropDictionary = p.animationIdWithPropDictionary;
    [animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *prop, NSNumber *animationId, __unused BOOL *stop) {
        HippyAnimation *animation = self->_animationById[animationId];
        if (animation.state != HippyAnimationReadyState) {
            return;
        }
        BOOL useCustomerTimingFunction = NO;
        if ([self.animationTimingDelegate respondsToSelector:@selector(animationShouldUseCustomerTimingFunction:)]) {
            useCustomerTimingFunction = [self.animationTimingDelegate animationShouldUseCustomerTimingFunction:self];
        }
        useCustomerTimingFunction |= [TimingAnimation canHandleAnimationForProperty:prop];
        if (useCustomerTimingFunction) {
            //TODO implemente customer animation timing function
            TimingAnimation *tAnimation =
                [[TimingAnimation alloc] initWithKeyPath:prop timingFunction:animation.timingFunction
                                              domManager:self.bridge.animationManager viewTag:[[view hippyTag] intValue]];
            tAnimation.hpAni = animation;
            tAnimation.duration = animation.duration;
            tAnimation.animationId = animationId;
            [view addTimingAnimation:tAnimation];
            [_timingAnimationMap setObject:tAnimation forKey:animationId];
        }
        else {
            CAAnimation *ani = [animation animationOfView:view forProp:prop];
            animation.state = HippyAnimationStartedState;
            [ani setValue:animationId forKey:@"animationID"];
            if (animation.parentAnimationId) {
                [ani setValue:animation.parentAnimationId forKey:@"animationParentID"];
            }
            [ani setValue:view.hippyTag forKey:@"viewID"];
            ani.delegate = self;
            [animations addObject:ani];
        }
    }];
    [animations enumerateObjectsUsingBlock:^(CAAnimation *_Nonnull ani, __unused NSUInteger idx, __unused BOOL *stop) {
        NSNumber *animationId = [ani valueForKey:@"animationID"];
        [view.layer addAnimation:ani forKey:[NSString stringWithFormat:@"%@", animationId]];
    }];
}

- (BOOL)alreadyConnectAnimation:(HippyAnimationViewParams *)p {
    return [[_paramsByHippyTag allValues] containsObject:p];
}

- (HippyAnimation *)animationFromID:(NSNumber *)animationID {
    return _animationById[animationID];
}

@end
