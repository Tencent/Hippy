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

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wmacro-redefined"
#define HippyLogInfo(...) do{}while(0)
#pragma clang diagnostic pop

@implementation HippyExtAnimationIdCount {
    NSMutableDictionary *_animationIdDic;
}
- (instancetype) init {
    self = [super init];
    if (self) {
        _animationIdDic = [NSMutableDictionary dictionary];
    }
    return self;
}
- (void) addCountForAnimationId:(NSNumber *)animationId {
    NSNumber *number = [_animationIdDic objectForKey:animationId];
    [_animationIdDic setObject:@([number unsignedIntegerValue] + 1) forKey:animationId];
}
- (BOOL) subtractionCountForAnimationId:(NSNumber *)animationId {
    NSNumber *number = [_animationIdDic objectForKey:animationId];
    if (number) {
        NSUInteger count = [number unsignedIntegerValue];
        if (count == 1) {
            [_animationIdDic removeObjectForKey:animationId];
            return YES;
        }
        else {
            [_animationIdDic setObject:@(count - 1) forKey:animationId];
            return NO;
        }
    }
    return YES;
}
- (NSUInteger) countForAnimationId:(NSNumber *)animationId {
    NSNumber *count = [_animationIdDic objectForKey:animationId];
    return [count unsignedIntegerValue];
}
@end

@interface HippyExtAnimationModule () <CAAnimationDelegate>
@end

@implementation HippyExtAnimationModule {
    NSMutableDictionary <NSNumber *, HippyExtAnimation *> *_animationById;
    NSMutableDictionary <NSNumber *, NSMutableArray <HippyExtAnimationViewParams *> *> *_paramsByAnimationId;
    NSMutableDictionary <NSNumber *, HippyExtAnimationViewParams *> *_paramsByHippyTag;
    NSLock *_lock;
    //  NSMutableArray <NSNumber *> *_virtualAnimations;
    HippyExtAnimationIdCount *_virtualAnimations;
}

//@synthesize executeQueue = _executeQueue;
@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(AnimationModule)

- (dispatch_queue_t)methodQueue {
    return HippyGetUIManagerQueue();
}

- (instancetype)init
{
    if (self = [super init]) {
        _animationById = [NSMutableDictionary new];
        _paramsByHippyTag = [NSMutableDictionary new];
        _paramsByAnimationId = [NSMutableDictionary new];
        _lock = [[NSLock alloc] init];
        //      _virtualAnimations = [NSMutableArray array];
        _virtualAnimations = [[HippyExtAnimationIdCount alloc] init];
    }
    return self;
}

- (void)invalidate
{
    [_lock lock];
    [_paramsByAnimationId removeAllObjects];
    [_paramsByHippyTag removeAllObjects];
    [_animationById removeAllObjects];
    [_lock unlock];
}

- (BOOL)isRunInDomThread
{
    return YES;
}

//bug：create->destroy->create后，如果不重新render：这个方法无法被调用到
//- (NSDictionary *)bindAnimaiton:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag
HIPPY_EXPORT_METHOD(createAnimation:(NSNumber *__nonnull)animationId
                  mode:(NSString *)mode
                  params:(NSDictionary *)params)
{
    [_lock lock];
    HippyExtAnimation *ani = [[HippyExtAnimation alloc] initWithMode: mode animationId: animationId config: params];
    [_animationById setObject: ani forKey: animationId];
    [_lock unlock];
    HippyLogInfo(@"create animation Id:%@",animationId);
}

HIPPY_EXPORT_METHOD(createAnimationSet:(NSNumber *__nonnull)animationId animations:(NSDictionary *)animations)
{
    [_lock lock];
    HippyExtAnimationGroup *group = [[HippyExtAnimationGroup alloc] initWithMode: @"group" animationId: animationId config: animations];
    group.virtualAnimation = [animations[@"virtual"] boolValue];
    NSArray *children = animations[@"children"];
    NSMutableArray *anis = [NSMutableArray arrayWithCapacity: children.count];
    [children enumerateObjectsUsingBlock:^(NSDictionary * info, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
        NSNumber *subAnimationId = info[@"animationId"];
        BOOL follow = [info[@"follow"] boolValue];
        HippyExtAnimation *ani = self->_animationById[subAnimationId];
#ifdef DEBUG
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
    
    HippyLogInfo(@"create group animations:%@",animationId);
}

//该方法会调用[HippyExtAnimationModule paramForAnimationId:]，
//进而调用[HippyExtAnimationModule connectAnimationToView]
//在里面执行动画
HIPPY_EXPORT_METHOD(startAnimation:(NSNumber *__nonnull)animationId)
{
    [_lock lock];
    HippyExtAnimation *ani = _animationById[animationId];
    if (ani.state == HippyExtAnimationStartedState) {
        [_lock unlock];
        HippyLogInfo(@"startAnimation [%@] from [%@] to [%@] not completed", animationId, @(ani.startValue), @(ani.endValue));
        return;
    }
    
    HippyLogInfo(@"startAnimation [%@] from [%@] to [%@]", animationId, @(ani.startValue), @(ani.endValue));
    
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

HIPPY_EXPORT_METHOD(pauseAnimation:(NSNumber *__nonnull)animationId) {
    [_lock lock];
    NSArray <HippyExtAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
            UIView *view = [self.bridge.uiManager viewForHippyTag:param.hippyTag];
            CFTimeInterval pausedTime = [view.layer convertTime:CACurrentMediaTime() fromLayer:nil];
            view.layer.speed = 0.0;
            view.layer.timeOffset = pausedTime;
        }];
    }];
    [_lock unlock];
}

HIPPY_EXPORT_METHOD(resumeAnimation:(NSNumber *__nonnull)animationId) {
    [_lock lock];
    NSArray <HippyExtAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
            UIView *view = [self.bridge.uiManager viewForHippyTag:param.hippyTag];
            CFTimeInterval pausedTime = [view.layer timeOffset];
            view.layer.speed = 1.0;
            view.layer.timeOffset = 0.0;
            view.layer.beginTime = 0.0;
            CFTimeInterval timeSincePause = [view.layer convertTime:CACurrentMediaTime() fromLayer:nil] - pausedTime;
            view.layer.beginTime = timeSincePause;
        }];
    }];
    [_lock unlock];
}

//这个方法真是神之命名？
//这个方法里会调用[HippyExtAnimationModule connectAnimationToView]，该方法是真正执行动画的地方
- (void) paramForAnimationId:(NSNumber *)animationId {
    NSArray <HippyExtAnimationViewParams *> *params = _paramsByAnimationId[animationId];
    NSMutableArray <NSNumber *> *hippyTags = [NSMutableArray new];
    [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull param, NSUInteger __unused idx, BOOL * _Nonnull __unused stop) {
        [hippyTags addObject: param.hippyTag];
    }];
    
    //如果这个animationId没有绑定任何view，则不往下执行
    if (!hippyTags.count) {
        return;
    }
    
    HippyLogInfo(@"animation begin:%@",animationId);
    __weak HippyExtAnimationModule *weakSelf = self;
    //动画必须在主线程执行
    dispatch_async(dispatch_get_main_queue(), ^{
        [hippyTags enumerateObjectsUsingBlock:^(NSNumber * _Nonnull tag,__unused NSUInteger idx,__unused BOOL *stop) {
            UIView *view = [weakSelf.bridge.uiManager viewForHippyTag:tag];
            if (!view) {
                //在这里相当于循环的continue
                return;
            }
            
            //爱拍视频业务中，点击某个视频，底部会有loading动画，动画实现方式：动画1开始->动画1结束->动画2开始->动画2结束->动画1开始->动画1结束，如此直到视频载入结束。
            //但是在动画过程中，点击返回按钮，会将当前unit从window上删除但不销毁，而导致原持续500毫秒的动画立刻结束，使动画1与2不停快速执行
            //做个判断，如果view不在window上则不进行动画操作。
            if (view.window) {
                //真正执行动画的地方
                [weakSelf connectAnimationToView: view];
                //在这里相当于循环的continue
                return;
            }
            
            //根据罗老师写的注释，以下是边缘情况
            HippyLogInfo(@"animation view is not added to window");
            [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * p,__unused NSUInteger idx, __unused BOOL *stop) {
                [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString * key, NSNumber * obj,__unused BOOL *stop1) {
                    HippyExtAnimation *ani = self->_animationById[obj];
                    if (![obj isEqual: animationId]) {
                        //在这里相当于循环的continue
                        return;
                    }
                    
                    [p setValue: @(ani.endValue) forProp: key];
                    ani.state = HippyExtAnimationFinishState;
                    //                  HippyLogInfo(@"animationDidStop:%@ finish:%@ prop:%@ value:%@", animationID, @(flag), key, @(ani.endValue));
                }];
            }];
            [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
                [self.bridge.uiManager updateViewsFromParams:params completion:^(__unused HippyUIManager *uiManager) {
                }];
            }];
            
        }];
    });
}

HIPPY_EXPORT_METHOD(updateAnimation:(NSNumber *__nonnull)animationId params:(NSDictionary *)params)
{
    if (params == nil) {
        return;
    }
    [_lock lock];
    HippyExtAnimation *ani = _animationById[animationId];
//    if (ani.state == HippyExtAnimationStartedState) {
//        HippyLogInfo(@"updateAnimation [%@] from [%@] to [%@] animation is not completed", animationId, @(ani.startValue), @(ani.endValue));
//        [_lock unlock];
//        return;
//    }
    
    ani.state = HippyExtAnimationInitState;
    
    [ani updateAnimation: params];
    
    // 更新
    NSMutableArray <HippyExtAnimationViewParams *> *viewParams = _paramsByAnimationId[animationId];
    NSMutableArray *updateParams = [NSMutableArray new];
    [viewParams enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull p,__unused NSUInteger idx,__unused BOOL * stop) {
        [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString * key, NSNumber * obj,__unused BOOL * istop) {
            HippyExtAnimation *rcani = self->_animationById[obj];
            if ([obj isEqual: animationId]) {
                [p setValue: @(rcani.startValue) forProp: key];
                [updateParams addObject: p.updateParams];
                HippyLogInfo(@"updateAnimation:[%@] key:[%@] value:[%@]", animationId, key, params[@"startValue"]);
            }
        }];
    }];
    
    //    [self.bridge executeBlockOnComponentThread:^{
    //      [self.bridge.uiManager updateNode: nil params: updateParams callBack: nil];
    //    }];
    
    //调用updateView，更新动画属性
    //最后收集各个view对应的rootTag，给rootView调用layoutAndMount
    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        [self.bridge.uiManager updateViewsFromParams:viewParams completion:NULL];
    }];
    [_lock unlock];
}

HIPPY_EXPORT_METHOD(destroyAnimation:(NSNumber * __nonnull)animationId)
{
    [_lock lock];
    [_animationById removeObjectForKey: animationId];
    NSMutableArray <HippyExtAnimationViewParams *> *params = _paramsByAnimationId[animationId];
    if (params.count) {
        NSMutableArray *hippyTags = [[NSMutableArray alloc] initWithCapacity: params.count];
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * _Nonnull obj,__unused NSUInteger idx,__unused BOOL * stop) {
            [hippyTags addObject: obj.hippyTag];
        }];
        dispatch_async(dispatch_get_main_queue(), ^{
            for (NSNumber *hippyTag in hippyTags) {
                //        UIView *view = [self.bridge viewForTag: viewID];
                UIView *view = [self.bridge.uiManager viewForHippyTag:hippyTag];
                [view.layer removeAnimationForKey: [NSString stringWithFormat: @"%@", animationId]];
            }
        });
    }
    [_paramsByAnimationId removeObjectForKey: animationId];
    [_lock unlock];
    HippyLogInfo(@"animaiton destory:%@",animationId);
}

#pragma mark - CAAnimationDelegate
- (void)animationDidStart:(CAAnimation *)anim
{
    NSNumber *animationId = [anim valueForKey: @"animationID"];
    [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent" args:@{@"eventName": @"onAnimationStart", @"extra": animationId}];
}

- (void)animationDidStop:(CAAnimation *)anim finished:(BOOL)flag
{
    [_lock lock];
    NSNumber *animationId = [anim valueForKey: @"animationID"];
    NSNumber *viewId = [anim valueForKey: @"viewID"];
    
    NSMutableArray <HippyExtAnimationViewParams *> *params = [_paramsByAnimationId[animationId] copy];
    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        //这段代码放在UIManagerQueue中执行原因在于：
        //这段代码和375行代码都会对HippyExtAnimationViewParams中的_style进行修改，导致错误crash'dictionary was mutabled when enum'
        [params enumerateObjectsUsingBlock:^(HippyExtAnimationViewParams * p,__unused NSUInteger idx, __unused BOOL * stop) {
            [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString * key, NSNumber * obj,__unused BOOL * stop1) {
                HippyExtAnimation *ani = self->_animationById[obj];
                if (![obj isEqual: animationId]) {
                    return;
                }
                
                [p setValue: @(ani.endValue) forProp: key];
                ani.state = HippyExtAnimationFinishState;
                HippyLogInfo(@"animationDidStop:%@ finish:%@ prop:%@ value:%@", animationId, @(flag), key, @(ani.endValue));
            }];
        }];
    }];
    [_lock unlock];
    
    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        //如果hippy示例销毁早于动画的结束，那么
        //这里的调用可能uiManager为nil，不过看起来没啥问题，先观察一下
        [self.bridge.uiManager updateViewsFromParams:params completion:^(HippyUIManager *uiManager) {
            UIView *view = [uiManager viewForHippyTag:viewId];
            if (flag) {
                [view.layer removeAnimationForKey: [NSString stringWithFormat: @"%@", animationId]];
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
        //    [_virtualAnimations removeObject:animationSetID];
        if ([_virtualAnimations subtractionCountForAnimationId:animationSetId]) {
            [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent" args:@{@"eventName": @"onAnimationEnd", @"extra": animationSetId}];
        }
    }
    else {
        [self.bridge.eventDispatcher dispatchEvent:@"EventDispatcher" methodName:@"receiveNativeEvent" args:@{@"eventName": @"onAnimationEnd", @"extra": animationId}];
    }
}
#pragma mark -

//如果props[@"useAnimation"]为true，那么
//在[HippyUIManager createView:]和[HippyUIManager updateView:]中就会调用这个方法

//一顿操作猛如虎，其实就是：
//在_paramsByAnimationID根据animationId做了一份索引
//在_paramsByHippyTag根据hippyTag做了一份索引
//然后复制了一份最初的props回去
- (NSDictionary *)bindAnimaiton:(NSDictionary *)params viewTag:(NSNumber *)viewTag rootTag:(NSNumber *)rootTag
{
    [_lock lock];
    
    //p是对这个params的封装
    HippyExtAnimationViewParams *p = [[HippyExtAnimationViewParams alloc] initWithParams: params viewTag:viewTag rootTag: rootTag];
    [p parse];
    
    BOOL contain = [self alreadyConnectAnimation: p];
    [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString * key, NSNumber * animationId,__unused BOOL * stop) {
        HippyExtAnimation *ani = self->_animationById[animationId];
        
        //这个if看不懂。。
        if (ani.state == HippyExtAnimationFinishState) {
            [p setValue: @(ani.endValue) forProp: key];
        } else {
            [p setValue: @(ani.startValue) forProp: key];
        }
        
        //viewParams是
        NSMutableArray *viewParams = self->_paramsByAnimationId[animationId];
        if (viewParams == nil) {
            viewParams = [NSMutableArray new];
            [self->_paramsByAnimationId setObject: viewParams forKey: animationId];
        }
        
        if (!contain) {
            //如果不包含，就添加
            [viewParams addObject: p];
            HippyLogInfo(@"bind aniamtion [%@] to view [%@] prop [%@]",animationId, viewTag, key);
        } else {
            //如果包含，就替换
            NSInteger index = [viewParams indexOfObject: p];
            if (index != NSNotFound) {
                [viewParams removeObjectAtIndex: index];
            }
            [viewParams addObject: p];
        }
    }];
    
    //根据RhippyTag做了一份索引
    [_paramsByHippyTag setObject: p forKey: viewTag];
    [_lock unlock];
    
    return p.updateParams;
}

//真正执行动画的地方，createAnimation和startAnimation都会调用这个地方
- (void)connectAnimationToView:(UIView *)view
{
    [_lock lock];
    NSNumber *hippyTag = view.hippyTag;
    HippyExtAnimationViewParams *p = _paramsByHippyTag[hippyTag];
    
    NSMutableArray <CAAnimation *> *animations = [NSMutableArray new];
    [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *prop, NSNumber * animationId,__unused BOOL * stop) {
        HippyExtAnimation *animation = self->_animationById[animationId];
        //createAnimation的时候也会进这个地方，由于HippyExtAnimationState为InitState，故不调用
        if (animation.state != HippyExtAnimationReadyState) {
            return;
        }
        //取出关键的动画
        CAAnimation *ani = [animation animationOfView: view forProp: prop];
        animation.state = HippyExtAnimationStartedState;
        [ani setValue: animationId forKey: @"animationID"];
        if (animation.parentAnimationId) {
            [ani setValue:animation.parentAnimationId forKey:@"animationParentID"];
        }
        [ani setValue: view.hippyTag forKey: @"viewID"];
        ani.delegate = self;
        [animations addObject: ani];
        HippyLogInfo(@"connect aniamtion[%@] to view [%@] prop [%@] from [%@] to [%@]",animationId, view.hippyTag, prop, @(animation.startValue), @(animation.endValue));
    }];
    
    //遍历动画  一一执行
    [animations enumerateObjectsUsingBlock:^(CAAnimation * _Nonnull ani, __unused NSUInteger idx, __unused BOOL *stop) {
        NSNumber *animationId = [ani valueForKey: @"animationID"];
        //真正执行动画的地方
        [view.layer addAnimation: ani forKey: [NSString stringWithFormat: @"%@", animationId]];
    }];
    
    [_lock unlock];
}

- (BOOL)alreadyConnectAnimation:(HippyExtAnimationViewParams *)p
{
    return [[_paramsByHippyTag allValues] containsObject: p];
}

@end
