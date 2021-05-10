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

#import "HippyUIManager.h"
#import "HippyExtAnimation.h"
#import "HippyExtAnimationGroup.h"
#import "HippyExtAnimation+Group.h"
#import "HippyExtAnimationModule.h"
#import "HippyExtAnimationViewParams.h"
#import <objc/runtime.h>
#import <UIKit/UIKit.h>
#import "CALayer+HippyAnimation.h"

@implementation HippyExtAnimationIdCount {
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

@interface HippyExtAnimationModule () <CAAnimationDelegate>
@end

@implementation HippyExtAnimationModule {
    NSMutableDictionary<NSNumber *, HippyExtAnimation *> *_animationById;
    NSMutableDictionary<NSNumber *, NSMutableArray<HippyExtAnimationViewParams *> *> *_paramsByAnimationId;
    NSMutableDictionary<NSNumber *, HippyExtAnimationViewParams *> *_paramsByHippyTag;
    NSLock *_lock;
    HippyExtAnimationIdCount *_virtualAnimations;
}

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(AnimationModule)

- (dispatch_queue_t)methodQueue {
    return HippyGetUIManagerQueue();
}

- (instancetype)init {
    if (self = [super init]) {
        _animationById = [NSMutableDictionary new];
        _paramsByHippyTag = [NSMutableDictionary new];
        _paramsByAnimationId = [NSMutableDictionary new];
        _lock = [[NSLock alloc] init];
        _virtualAnimations = [[HippyExtAnimationIdCount alloc] init];
    }
    return self;
}

- (void)invalidate {
    [_lock lock];
    [_paramsByAnimationId removeAllObjects];
    [_paramsByHippyTag removeAllObjects];
    [_animationById removeAllObjects];
    [_lock unlock];
}

- (BOOL)isRunInDomThread {
    return YES;
}

// clang-format off
HIPPY_EXPORT_METHOD(createAnimation:(NSNumber *__nonnull)animationId mode:(NSString *)mode params:(NSDictionary *)params) {
    [_lock lock];
    HippyExtAnimation *ani = [[HippyExtAnimation alloc] initWithMode: mode animationId: animationId config: params];
    [_animationById setObject: ani forKey: animationId];
    [_lock unlock];
    HippyLogInfo(@"[Hippy_OC_Log][Animation],Create_Animation:%@", animationId);
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(createAnimationSet:(NSNumber *__nonnull)animationId animations:(NSDictionary *)animations) {
    [_lock lock];
    HippyExtAnimationGroup *group = [[HippyExtAnimationGroup alloc] initWithMode: @"group" animationId: animationId config: animations];
    group.virtualAnimation = [animations[@"virtual"] boolValue];
    NSArray *children = animations[@"children"];
    NSMutableArray *anis = [NSMutableArray arrayWithCapacity: children.count];
    [children enumerateObjectsUsingBlock:^(NSDictionary * info, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
        NSNumber *subAnimationId = info[@"animationId"];
        BOOL follow = [info[@"follow"] boolValue];
        HippyExtAnimation *ani = self->_animationById[subAnimationId];
#ifdef NSAssert
        if (ani == nil) {
            HippyAssert(ani != nil, @"create group animation but use illege sub animaiton");
        }
#endif
        ani.bFollow = follow;
        [anis addObject: ani];
    }];
    group.animations = anis;
    [_animationById setObject: group forKey: animationId];
    
    [_lock unlock];
    
    HippyLogInfo(@"[Hippy_OC_Log][Animation],Create_AnimationSet:%@", animationId);
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(startAnimation:(NSNumber *__nonnull)animationId) {
    [_lock lock];
    HippyExtAnimation *ani = _animationById[animationId];
    if (ani.state == HippyExtAnimationStartedState) {
        [_lock unlock];
        HippyLogInfo(@"[Hippy_OC_Log][Animation],Start_Animation_Failed, Animation Already Started:%@", animationId);
        return;
    }
    
    HippyLogInfo(@"[Hippy_OC_Log][Animation],Start_Animation, [%@] from [%@] to [%@]", animationId, @(ani.startValue), @(ani.endValue));

    ani.state = HippyExtAnimationReadyState;
    
    if ([ani isKindOfClass:[HippyExtAnimationGroup class]]) {
        HippyExtAnimationGroup *group = (HippyExtAnimationGroup *)ani;
        if (group.virtualAnimation) {
            for (HippyExtAnimation *animation in group.animations) {
                [_virtualAnimations addCountForAnimationId:animationId];
                animation.parentAnimationId = animationId;
                NSNumber *animationId = animation.animationId;
                animation.state = HippyExtAnimationReadyState;
                [self paramForAnimationId:animationId];
            }
        } else {
            [self paramForAnimationId:animationId];
        }
    } else {
        [self paramForAnimationId:animationId];
    }
    [_lock unlock];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(pauseAnimation:(NSNumber *__nonnull)animationId) {
    [_lock lock];
    NSArray <HippyExtAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
            UIView *view = [self.bridge.uiManager viewForHippyTag:param.hippyTag];
            [view.layer pauseLayerAnimation];
        }];
    }];
    [_lock unlock];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(resumeAnimation:(NSNumber *__nonnull)animationId) {
    [_lock lock];
    NSArray <HippyExtAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
            UIView *view = [self.bridge.uiManager viewForHippyTag:param.hippyTag];
            [view.layer resumeLayerAnimation];
        }];
    }];
    [_lock unlock];
}
// clang-format on

- (void)paramForAnimationId:(NSNumber *)animationId {
    NSArray<HippyExtAnimationViewParams *> *params = _paramsByAnimationId[animationId];
    NSMutableArray<NSNumber *> *hippyTags = [NSMutableArray new];
    [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams *_Nonnull param, NSUInteger __unused idx, BOOL *_Nonnull __unused stop) {
        [hippyTags addObject:param.hippyTag];
    }];

    if (!hippyTags.count) {
        return;
    }

    __weak HippyExtAnimationModule *weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        [hippyTags enumerateObjectsUsingBlock:^(NSNumber *_Nonnull tag, __unused NSUInteger idx, __unused BOOL *stop) {
            UIView *view = [weakSelf.bridge.uiManager viewForHippyTag:tag];
            if (!view) {
                return;
            }
            if (view.window) {
                [view.layer resumeLayerAnimation];
                [weakSelf connectAnimationToView:view];
                return;
            }
            
            HippyLogInfo(@"[Hippy_OC_Log][Animation],Animation_Not_Add_To_Window, %@", animationId);
            [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams *p, __unused NSUInteger idx, __unused BOOL *stop) {
                [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *obj, __unused BOOL *stop1) {
                    HippyExtAnimation *ani = self->_animationById[obj];
                    if (![obj isEqual:animationId]) {
                        return;
                    }

                    [p setValue:@(ani.endValue) forProp:key];
                    ani.state = HippyExtAnimationFinishState;
                }];
            }];
            [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
                [self.bridge.uiManager updateViewsFromParams:params completion:^(__unused HippyUIManager *uiManager) {
                }];
            }];
        }];
    });
}

// clang-format off
HIPPY_EXPORT_METHOD(updateAnimation:(NSNumber *__nonnull)animationId params:(NSDictionary *)params) {
    if (params == nil) {
        return;
    }
    [_lock lock];
    HippyExtAnimation *ani = _animationById[animationId];
    
    ani.state = HippyExtAnimationInitState;
    
    [ani updateAnimation: params];
    
    NSMutableArray <HippyExtAnimationViewParams *> *viewParams = _paramsByAnimationId[animationId];
    NSMutableArray *updateParams = [NSMutableArray new];
    [viewParams enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull p,__unused NSUInteger idx,__unused BOOL * stop) {
        [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString * key, NSNumber * obj,__unused BOOL * istop) {
            HippyExtAnimation *rcani = self->_animationById[obj];
            if ([obj isEqual: animationId]) {
                [p setValue: @(rcani.startValue) forProp: key];
                [updateParams addObject: p.updateParams];
                HippyLogInfo(@"[Hippy_OC_Log][Animation],Update_Animation:[%@] key:[%@] value:[%@]", animationId, key, params[@"startValue"]);
            }
        }];
    }];
    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        [self.bridge.uiManager updateViewsFromParams:viewParams completion:NULL];
    }];
    [_lock unlock];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(destroyAnimation:(NSNumber * __nonnull)animationId) {
    [_lock lock];
    [_animationById removeObjectForKey: animationId];
    NSMutableArray <HippyExtAnimationViewParams *> *params = _paramsByAnimationId[animationId];
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
            UIView *view = [self.bridge.uiManager viewForHippyTag:param.hippyTag];
            [view.layer removeAnimationForKey: [NSString stringWithFormat: @"%@", animationId]];
        }];
    }];
    [_paramsByAnimationId removeObjectForKey: animationId];
    [_lock unlock];
    HippyLogInfo(@"[Hippy_OC_Log][Animation],Destroy_Animation:%@", animationId);
}
// clang-format on

#pragma mark - CAAnimationDelegate
- (void)animationDidStart:(CAAnimation *)anim {
    NSNumber *animationId = [anim valueForKey:@"animationID"];
    [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent"
                                          args:@{ @"eventName": @"onAnimationStart", @"extra": animationId }];
}

- (void)animationDidStop:(CAAnimation *)anim finished:(BOOL)flag {
    [_lock lock];
    NSNumber *animationId = [anim valueForKey:@"animationID"];
    NSNumber *viewId = [anim valueForKey:@"viewID"];

    NSMutableArray<HippyExtAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams *p, __unused NSUInteger idx, __unused BOOL *stop) {
            [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *obj, __unused BOOL *stop1) {
                HippyExtAnimation *ani = self->_animationById[obj];
                if (![obj isEqual:animationId]) {
                    return;
                }

                [p setValue:@(ani.endValue) forProp:key];
                ani.state = HippyExtAnimationFinishState;
                HippyLogInfo(@"[Hippy_OC_Log][Animation],Animation_Did_Stop:%@ finish:%@ prop:%@ value:%@", animationId, @(flag), key, @(ani.endValue));
            }];
        }];
    }];
    [_lock unlock];

    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        [self.bridge.uiManager updateViewsFromParams:params completion:^(HippyUIManager *uiManager) {
            UIView *view = [uiManager viewForHippyTag:viewId];
            if (flag) {
                [view.layer removeAnimationForKey:[NSString stringWithFormat:@"%@", animationId]];
            }
            if (!CGPointEqualToPoint(view.layer.anchorPoint, CGPointMake(.5f, .5f))) {
                CALayer *viewLayer = view.layer;
                CGPoint cener = CGPointMake(CGRectGetWidth(viewLayer.bounds) / 2, CGRectGetHeight(viewLayer.bounds) / 2);
                CGPoint expectedPosition = [viewLayer convertPoint:cener toLayer:viewLayer.superlayer];
                viewLayer.anchorPoint = CGPointMake(.5f, .5f);
                viewLayer.position = expectedPosition;
            }
        }];
    }];
    NSNumber *animationSetId = [anim valueForKey:@"animationParentID"];
    if (animationSetId) {
        if ([_virtualAnimations subtractionCountForAnimationId:animationSetId]) {
            [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent"
                                                  args:@{ @"eventName": @"onAnimationEnd", @"extra": animationSetId }];
        }
    } else {
        [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent"
                                              args:@{ @"eventName": @"onAnimationEnd", @"extra": animationId }];
    }
}
#pragma mark -
- (NSDictionary *)bindAnimaiton:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag {
    [_lock lock];

    HippyExtAnimationViewParams *p = [[HippyExtAnimationViewParams alloc] initWithParams:params viewTag:viewTag rootTag:rootTag];
    [p parse];

    BOOL contain = [self alreadyConnectAnimation:p];
    [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *animationId, __unused BOOL *stop) {
        HippyExtAnimation *ani = self->_animationById[animationId];

        if (ani.state == HippyExtAnimationFinishState) {
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
            HippyLogInfo(@"[Hippy_OC_Log][Animation],Bind_Animation:[%@] to view [%@] prop [%@]", animationId, viewTag, key);
        } else {
            NSInteger index = [viewParams indexOfObject:p];
            if (index != NSNotFound) {
                [viewParams removeObjectAtIndex:index];
            }
            [viewParams addObject:p];
        }
    }];
    [_paramsByHippyTag setObject:p forKey:viewTag];
    [_lock unlock];

    return p.updateParams;
}

- (void)connectAnimationToView:(UIView *)view {
    [_lock lock];
    NSNumber *hippyTag = view.hippyTag;
    HippyExtAnimationViewParams *p = _paramsByHippyTag[hippyTag];

    NSMutableArray<CAAnimation *> *animations = [NSMutableArray new];
    [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *prop, NSNumber *animationId, __unused BOOL *stop) {
        HippyExtAnimation *animation = self->_animationById[animationId];
        if (animation.state != HippyExtAnimationReadyState) {
            return;
        }
        CAAnimation *ani = [animation animationOfView:view forProp:prop];
        animation.state = HippyExtAnimationStartedState;
        [ani setValue:animationId forKey:@"animationID"];
        if (animation.parentAnimationId) {
            [ani setValue:animation.parentAnimationId forKey:@"animationParentID"];
        }
        [ani setValue:view.hippyTag forKey:@"viewID"];
        ani.delegate = self;
        [animations addObject:ani];
        HippyLogInfo(@"[Hippy_OC_Log][Animation],Connect_Animation:[%@] to view [%@] prop [%@] from [%@] to [%@]", animationId, view.hippyTag, prop, @(animation.startValue),
                     @(animation.endValue));

    }];
    [animations enumerateObjectsUsingBlock:^(CAAnimation *_Nonnull ani, __unused NSUInteger idx, __unused BOOL *stop) {
        NSNumber *animationId = [ani valueForKey:@"animationID"];
        [view.layer addAnimation:ani forKey:[NSString stringWithFormat:@"%@", animationId]];
    }];

    [_lock unlock];
}

- (BOOL)alreadyConnectAnimation:(HippyExtAnimationViewParams *)p {
    return [[_paramsByHippyTag allValues] containsObject:p];
}

@end
