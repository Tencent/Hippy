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

#import "HippyNextAnimationModule.h"
#import "HippyUIManager.h"
#import "HippyNextAnimationViewParams.h"
#import "HippyNextAnimation.h"
#import "HippyNextAnimationGroup.h"
#import "HippyShadowView.h"
#import "HPOPAnimatorPrivate.h"


@interface HippyNextAnimationModule () <HPOPAnimationDelegate, HPOPAnimatorDelegate, HippyNextAnimationControlDelegate>

/// Map of id-animation
@property (atomic, strong) NSMutableDictionary *animationById;
/// Map of hippyTag-Params
@property (atomic, strong) NSMutableDictionary<NSNumber *, HippyNextAnimationViewParams *> *paramsByHippyTag;
/// Map of AnimationId-Params
@property (atomic, strong) NSMutableDictionary<NSNumber *, NSMutableArray<HippyNextAnimationViewParams *> *> *paramsByAnimationId;

/// whether should relayout on next frame
@property (atomic, assign) BOOL shouldCallUIManagerToUpdateLayout;

/// AnimationGroup synchronization - lock
@property (nonatomic, strong) NSLock *groupAnimSyncLock;
/// AnimationGroup synchronization - pending animations dictionary in AnimationGroup
/// Key: hash of queue, Value: HippyNextAnimation array
@property (nonatomic, strong) NSMutableDictionary<NSNumber *, NSMutableArray<HippyNextAnimation *> *> *pendingStartGroupAnimations;
/// AnimationGroup synchronization - states of all queues
/// Key: hash of queue, Value: should sync state
@property (nonatomic, strong) NSMutableDictionary<NSNumber *, NSNumber * > *shouldFlushPendingAnimsInNextSync;

@end


@implementation HippyNextAnimationModule
{
    NSMutableDictionary<NSNumber *, NSDictionary *> *_updatedPropsForNextFrameDict;
}

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(AnimationModule)

- (dispatch_queue_t)methodQueue {
    return HippyGetUIManagerQueue();
}

- (void)invalidate {
    [self.animationById removeAllObjects];
    [self.paramsByHippyTag removeAllObjects];
    [self.paramsByAnimationId removeAllObjects];
    [HPOPAnimator.sharedAnimator removeAnimatorDelegate:self];
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _animationById = [NSMutableDictionary dictionary];
        _paramsByHippyTag = [NSMutableDictionary dictionary];
        _paramsByAnimationId = [NSMutableDictionary dictionary];
        _updatedPropsForNextFrameDict = [NSMutableDictionary dictionary];
        _groupAnimSyncLock = [[NSLock alloc] init];
        _pendingStartGroupAnimations = [NSMutableDictionary dictionary];
        _shouldFlushPendingAnimsInNextSync = [NSMutableDictionary dictionary];
        [HPOPAnimator.sharedAnimator addAnimatorDelegate:self];
    }
    return self;
}


#pragma mark - JS Methods

HIPPY_EXPORT_METHOD(createAnimation:(NSNumber *__nonnull)animationId
                    mode:(NSString *)mode
                    params:(NSDictionary *)params) {
    // mode: Hippy only support 'timing' mode currently
    HippyNextAnimation *anim = [HippyNextAnimation animationFromConfigParams:params];
    anim.animationId = animationId;
    anim.delegate = self;
    anim.controlDelegate = self;

    // save animation
    self.animationById[animationId] = anim;
}

HIPPY_EXPORT_METHOD(createAnimationSet:(NSNumber *__nonnull)animationId
                    animations:(NSDictionary *)animations) {
    HippyNextAnimationGroup *group = [HippyNextAnimationGroup animation];
    NSArray *children = animations[@"children"];
    NSMutableArray *anis = [NSMutableArray arrayWithCapacity:children.count];
    for (NSDictionary * info in children) {
        NSNumber *subAnimationId = info[@"animationId"];
        BOOL follow = [info[@"follow"] boolValue];
        HippyNextAnimation *ani = self.animationById[subAnimationId];
        if (ani == nil) {
            HippyAssert(ani != nil, @"create group animation but use illege sub animaiton");
            return;
        }
        ani.isFollow = follow;
        [anis addObject:ani];
    }
    NSInteger repeatCount = [animations[@"repeatCount"] integerValue];
    group.repeatCount = repeatCount == -1 ? INT_MAX : MAX(1, repeatCount);
    group.animations = anis;
    group.animationId = animationId;
    group.delegate = self;
    self.animationById[animationId] = group;
}

HIPPY_EXPORT_METHOD(startAnimation:(NSNumber *__nonnull)animationId) {
    HippyNextAnimation *anim = self.animationById[animationId];
    if (HippyNextAnimationStartedState == anim.state) {
        return;
    }
    
    // make animation ready
    anim.state = HippyNextAnimationReadyState;
    anim.isFirstStartPassed = NO;
    
    // find all views to animate
    NSArray<HippyNextAnimationViewParams *> *params = self.paramsByAnimationId[animationId];
    NSMutableArray<NSNumber *> *hippyTags = [NSMutableArray new];
    for (HippyNextAnimationViewParams *param in params) {
        [hippyTags addObject:param.hippyTag];
    }

    if (hippyTags.count <= 0) {
        return;
    }
    
    // connect animation to view or shadow view
    __weak __typeof(self)weakSelf = self;
    dispatch_async(dispatch_get_main_queue(), ^{
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        if (!strongSelf) return;
        for (NSNumber *tag in hippyTags) {
            // There is room for further optimization,
            // We might not have to get the view
            UIView *view = [strongSelf.bridge.uiManager viewForHippyTag:tag];
            // The old animation module determines whether the view has a window
            // before deciding whether to enable animation,
            // this is not reliable, so the new module only determines whether the view exists
            if (view) {
                [strongSelf connectAnimationToView:view];
            } else {
                [strongSelf stopAnimationAndUpdateViewToEndState:animationId params:params];
            }
        }
    });

}

HIPPY_EXPORT_METHOD(pauseAnimation:(NSNumber *__nonnull)animationId) {
    HippyNextAnimation *anim = self.animationById[animationId];
    [anim setPausedWithoutReset:YES];
}

HIPPY_EXPORT_METHOD(resumeAnimation:(NSNumber *__nonnull)animationId) {
    HippyNextAnimation *anim = self.animationById[animationId];
    [anim setPausedWithoutReset:NO];
}

HIPPY_EXPORT_METHOD(updateAnimation:(NSNumber *__nonnull)animationId
                    params:(NSDictionary *)params) {
    if (!params) return;
    HippyNextAnimation *anim = self.animationById[animationId];
    anim.state = HippyNextAnimationInitState;
    [anim updateAnimation:params];
    
    NSMutableArray<HippyNextAnimationViewParams *> *viewParams = self.paramsByAnimationId[animationId];
    for (HippyNextAnimationViewParams *p in viewParams) {
        [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString * _Nonnull key,
                                                                             NSNumber * _Nonnull obj,
                                                                             BOOL * _Nonnull stop) {
            HippyNextAnimation *rcani = self.animationById[obj];
            if ([obj isEqual:animationId]) {
                [p setValue:[rcani getPretreatedFromValueForAnimType:key] forProp:key];
                HippyLogInfo(@"[Hippy_OC_Log][Animation], Update_Animation:[%@] key:[%@]", animationId, key);
            }
        }];
    }
    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        [self.bridge.uiManager updateViewsFromParams:viewParams completion:NULL];
    }];
}

HIPPY_EXPORT_METHOD(destroyAnimation:(NSNumber * __nonnull)animationId) {
    
    [self.animationById removeObjectForKey:animationId];
    [self.paramsByAnimationId removeObjectForKey:animationId];
}


#pragma mark - Internal Public Methods

/// Called when create or update the animated View
/// - Parameters:
///   - params: view properties
///   - viewTag: view tag
///   - rootTag: root view tag
- (NSDictionary *)bindAnimaiton:(NSDictionary *)params
                        viewTag:(NSNumber *)viewTag
                        rootTag:(NSNumber *)rootTag {
    HippyNextAnimationViewParams *p = [[HippyNextAnimationViewParams alloc] initWithParams:params
                                                                                   viewTag:viewTag
                                                                                   rootTag:rootTag];
    [p parse];

    BOOL contain = [self.paramsByHippyTag.allValues containsObject:p];
    [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *animationId, __unused BOOL *stop) {
        HippyNextAnimation *ani = self.animationById[animationId];

        if (ani.state == HippyNextAnimationFinishState) {
            id tmpToValue = [ani getPretreatedToValueForAnimType:key];
            HippyAssert(tmpToValue != nil, @"should not be nil");
            [p setValue:tmpToValue forProp:key];
        } else {
            id tmpFromValue = [ani getPretreatedFromValueForAnimType:key];
            HippyAssert(tmpFromValue != nil, @"should not be nil");
            [p setValue:tmpFromValue forProp:key];
        }

        NSMutableArray *viewParams = self.paramsByAnimationId[animationId];
        if (viewParams == nil) {
            viewParams = [NSMutableArray new];
            self.paramsByAnimationId[animationId] = viewParams;
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
    
    // record viewTag and view params
    [self.paramsByHippyTag setObject:p forKey:viewTag];

    return p.updateParams;
}

/// Connect animation before start
/// - Parameter view: view with animation
- (void)connectAnimationToView:(UIView *)view {
    NSNumber *hippyTag = view.hippyTag;
    HippyNextAnimationViewParams *p = self.paramsByHippyTag[hippyTag];
    
    for (NSString *prop in p.animationIdWithPropDictionary.allKeys) {
        NSNumber *animationId = p.animationIdWithPropDictionary[prop];
        HippyNextAnimation *anim = self.animationById[animationId];
        if (HippyNextAnimationReadyState != anim.state) {
            continue;
        }
        
        // TODO: use contains rotateY to judge
        if ([HippyNextAnimation isShadowViewAnimationProp:prop treatTransformAsShadowAnimation:YES]) {
            // connect to ShadowView object
            __weak __typeof(self)weakSelf = self;
            [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
                if (HippyNextAnimationStartedState == anim.state) {
                    return;
                }
                __strong __typeof(weakSelf)strongSelf = weakSelf;
                HippyShadowView *shadowView = [strongSelf.bridge.uiManager shadowViewForHippyTag:hippyTag];
                if (!shadowView) return;
                if (![anim prepareForTarget:shadowView withType:prop]) {
                    return;
                }
                [anim startAnimation];
                anim.state = HippyNextAnimationStartedState;
            }];
        } else {
            // connect to UIView object
            if (![anim prepareForTarget:view withType:prop]) {
                continue;
            }
            [anim startAnimation];
            anim.state = HippyNextAnimationStartedState;
        }
    }
}


#pragma mark -

- (void)stopAnimationAndUpdateViewToEndState:(NSNumber * _Nonnull)animationId
                                      params:(NSArray<HippyNextAnimationViewParams *> *)params {
    __weak __typeof(self)weakSelf = self;
    [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
        HippyLogInfo(@"[Hippy_OC_Log][Animation], Animation_Not_Add_To_Window, %@", animationId);
        [params enumerateObjectsUsingBlock:^(HippyNextAnimationViewParams *p,
                                             __unused NSUInteger idx,
                                             __unused BOOL *stop) {
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *obj, __unused BOOL *stop1) {
                HippyNextAnimation *ani = strongSelf.animationById[obj];
                if (![obj isEqual:animationId]) {
                    return;
                }
                
                [p setValue:[ani getPretreatedFromValueForAnimType:key] forProp:key];
                ani.state = HippyNextAnimationFinishState;
            }];
        }];
        [weakSelf.bridge.uiManager updateViewsFromParams:params completion:nil];
    }];
}


#pragma mark - HippyNextAnimationControlDelegate

- (void)requestUpdateUILayout:(HippyNextAnimation *)anim withNextFrameProp:(NSDictionary *)nextFrameProp {
    // run in UIManager queue
    
    if (nextFrameProp) {
        NSAssert([nextFrameProp count] == 1, @"can only have one child");
        // merge all nextFrameProps
        HippyShadowView *shadowView = anim.targetObject;
        NSMutableDictionary *mutableProps = _updatedPropsForNextFrameDict[shadowView.hippyTag].mutableCopy;
        
        if (!mutableProps) {
            // Note that we do not need to get the original props from `shadowView.props`,
            // because the raw data might also be animated, it may be outdated,
            // but at the same time, doing so limits some possible scenarios,
            // such as the original props value is an array, and the effects are not superimposed.
            // Because Transform Animations are superimposed, they are not affected by this restriction.
            mutableProps = [NSMutableDictionary dictionary];
        }
        
        // then we merge original props with the new nextFrameProp
        for (NSString *key in nextFrameProp.allKeys) {
            id oldValueObj = mutableProps[key];
            if (!oldValueObj) {
                mutableProps[key] = nextFrameProp[key];
            } else if ([oldValueObj isKindOfClass:NSArray.class]) {
                NSAssert([nextFrameProp[key] count] == 1, @"can only have one child");
                NSDictionary *nextFramePropValue = [nextFrameProp[key] firstObject];
                NSAssert([nextFramePropValue count] == 1, @"can only have one prop");
                NSMutableArray *oldValuesArr = ((NSArray *)oldValueObj).mutableCopy;
                NSString *nextFramePropKey = [[nextFramePropValue allKeys] firstObject];
                NSMutableArray *tmpArr = [NSMutableArray arrayWithCapacity:1];
                for (NSDictionary *dict in oldValuesArr) {
                    if ([dict.allKeys.firstObject isEqualToString:nextFramePropKey]) {
                        [tmpArr addObject:dict];
                    }
                }
                [oldValuesArr removeObjectsInArray:tmpArr];
                [oldValuesArr addObject:nextFramePropValue];
                mutableProps[key] = oldValuesArr;
            } else {
                mutableProps[key] = nextFrameProp[key];
            }
        }
        _updatedPropsForNextFrameDict[shadowView.hippyTag] = mutableProps;
    }
    
    if (!self.shouldCallUIManagerToUpdateLayout) {
        self.shouldCallUIManagerToUpdateLayout = YES;
    }
}

- (void)addAnimInGroupToPendingStartList:(HippyNextAnimation *)anim {
    // run in mainQueue or anim.customRunningQueue
    NSNumber *queueKey = @([anim.customRunningQueue?:dispatch_get_main_queue() hash]);
    
    // lock
    [self.groupAnimSyncLock lock];
    
    // get pending animations array and state for current queue
    BOOL shouldFlush = [[self.shouldFlushPendingAnimsInNextSync objectForKey:queueKey] boolValue];
    NSMutableArray *pendings = [self.pendingStartGroupAnimations objectForKey:queueKey];
    if (!pendings) {
        pendings = [NSMutableArray arrayWithObject:anim];
        self.pendingStartGroupAnimations[queueKey] = pendings;
    } else {
        [pendings addObject:anim];
    }
    
    // update state
    if (!shouldFlush) {
        self.shouldFlushPendingAnimsInNextSync[queueKey] = @(YES);
    }
    
    // unlock
    [self.groupAnimSyncLock unlock];
}

#pragma mark - HPOPAnimatorDelegate

- (void)animatorWillAnimate:(HPOPAnimator *)animator {
    // do nothing
}

- (void)animatorDidAnimate:(HPOPAnimator *)animator {
    // relayout, call from main thread
    if (self.shouldCallUIManagerToUpdateLayout) {
        __weak __typeof(self)weakSelf = self;
        [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            [strongSelf->_updatedPropsForNextFrameDict enumerateKeysAndObjectsUsingBlock:^(NSNumber * _Nonnull key,
                                                                                           NSDictionary * _Nonnull obj,
                                                                                           BOOL * _Nonnull stop) {
                [strongSelf.bridge.uiManager updateViewFromAnimationWithHippyTag:key props:obj];
            }];
            
            [strongSelf.bridge.uiManager batchDidComplete];
            [strongSelf->_updatedPropsForNextFrameDict removeAllObjects];
        }];
        self.shouldCallUIManagerToUpdateLayout = NO;
    }
}

- (void)animatorDidAnimate:(HPOPAnimator *)animator inCustomQueue:(dispatch_queue_t)queue {
    // call from main and custom queue
    NSNumber *queueKey = @(queue.hash);
    
    // lock
    [self.groupAnimSyncLock lock];
    
    // get sync state for current queue
    BOOL shouldFlush = [[self.shouldFlushPendingAnimsInNextSync objectForKey:queueKey] boolValue];
    if (shouldFlush) {
        [self.shouldFlushPendingAnimsInNextSync removeObjectForKey:queueKey];
        
        // flush pending animations
        __weak __typeof(self)weakSelf = self;
        dispatch_async(queue ?: dispatch_get_main_queue(), ^{
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            if (!strongSelf) {
                return;
            }
            
            // flush pending animations
            [strongSelf.groupAnimSyncLock lock];
            NSMutableArray<HippyNextAnimation *> *pendingAnims = [strongSelf.pendingStartGroupAnimations objectForKey:queueKey];
            [strongSelf.groupAnimSyncLock unlock];
            
            NSMutableArray<HippyNextAnimation *> *resultAnims = nil;
            NSMutableArray<id> *targetObjects = [NSMutableArray arrayWithCapacity:pendingAnims.count];
            CFTimeInterval now = CACurrentMediaTime();
            for (HippyNextAnimation *anim in pendingAnims) {
                id target = anim.targetObject;
                if (!target) {
                    if (!resultAnims) {
                        // only copy when needed
                        resultAnims = [pendingAnims mutableCopy];
                    }
                    [resultAnims removeObject:anim];
                    continue;
                }
                anim.beginTime = now + anim.delayTime;
                [targetObjects addObject:target];
            }
            
            [[HPOPAnimator sharedAnimator] addAnimations:resultAnims ?: pendingAnims
                                              forObjects:targetObjects andKeys:nil];
            [pendingAnims removeAllObjects];
        });
    }
    
    // unlock
    [self.groupAnimSyncLock unlock];
}


#pragma mark - HPOPAnimationDelegate

static NSString *const HippyEventDispatcherKey = @"EventDispatcher";
static NSString *const HippyNativeEventKey = @"receiveNativeEvent";
static NSString *const HippyEventNameKey = @"eventName";
static NSString *const HippyEventExtraKey = @"extra";
static NSString *const HippyAnimationEventStart = @"onAnimationStart";
// static NSString *const HippyAnimationEventCancel = @"onAnimationCancel"; // not in use
static NSString *const HippyAnimationEventEnd = @"onAnimationEnd";
static NSString *const HippyAnimationEventRepeat = @"onAnimationRepeat";


- (void)hpop_animationDidStart:(HPOPAnimation *)anim {
    HippyNextAnimation *ani = (HippyNextAnimation *)anim;
    NSString *event = HippyAnimationEventRepeat;
    if (!ani.isFirstStartPassed) {
        event = HippyAnimationEventStart;
        ani.isFirstStartPassed = YES;
    }
    NSNumber *animationId = ani.animationId;
    [self.bridge.eventDispatcher dispatchEvent:HippyEventDispatcherKey methodName:HippyNativeEventKey
                                          args:@{ HippyEventNameKey : event,
                                                  HippyEventExtraKey : animationId }];
}

- (void)hpop_animationDidStop:(HPOPAnimation *)anim finished:(BOOL)finished {
    if (finished) {
        NSNumber *animationId = ((HippyNextAnimation *)anim).animationId;
        __weak __typeof(self)weakSelf = self;
        [self.bridge.uiManager executeBlockOnUIManagerQueue:^{
            __strong __typeof(weakSelf)strongSelf = weakSelf;
            for (HippyNextAnimationViewParams *p in strongSelf.paramsByAnimationId[animationId]) {
                [p.animationIdWithPropDictionary enumerateKeysAndObjectsUsingBlock:^(NSString *key, NSNumber *obj, __unused BOOL *stop1) {
                    HippyNextAnimation *ani = strongSelf.animationById[obj];
                    if (![obj isEqual:animationId]) {
                        return;
                    }
                    
                    [p setValue:[ani getPretreatedToValueForAnimType:key] forProp:key];
                    ani.state = HippyNextAnimationFinishState;
                    HippyLogInfo(@"[Hippy_OC_Log][Animation],Animation_Did_Stop:%@ prop:%@", animationId, key);
                }];
            }
            
            [strongSelf.bridge.eventDispatcher dispatchEvent:HippyEventDispatcherKey methodName:HippyNativeEventKey
                                                        args:@{ HippyEventNameKey : HippyAnimationEventEnd,
                                                                HippyEventExtraKey : animationId }];
        }];
    }
}

@end
