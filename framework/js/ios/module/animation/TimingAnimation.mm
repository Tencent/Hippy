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

#import "TimingAnimation.h"
#import "RSTimingFunction.h"
#import "objc/runtime.h"
#import "TimingAnimationVSync.h"
#import "HippyAnimation.h"

typedef struct _ValueInfo{
    long loopIndex;
    double targetValue;
}ValueInfo;

static RSTimingFunction *MediaTimingFunctionToRSTimingFunction(CAMediaTimingFunction *f) {
    if (f) {
        float controlPoints1[2], controlPoints2[2];
        [f getControlPointAtIndex:1 values:controlPoints1];
        [f getControlPointAtIndex:2 values:controlPoints2];
        RSTimingFunction *ret =
            [RSTimingFunction timingFunctionWithControlPoint1:{.x = controlPoints1[0], .y = controlPoints1[1]}
                                                controlPoint2:{.x = controlPoints2[0], .y = controlPoints2[1]}];
        return ret;
    }
    return NULL;
}

static ValueInfo valueForMediaTime(double startValue, double endValue, double duration, double startTime, RSTimingFunction *timingFunction, double targetTime) {
    double valuePerSecond = (endValue - startValue) / duration;
    double timeDiff = targetTime - startTime;
    long loopIndex = 0;
    while (timeDiff > duration) {
        loopIndex++;
        timeDiff -= duration;
    }
    double valueDiff = valuePerSecond * timeDiff;
    ValueInfo valueInfo = {.loopIndex = loopIndex, .targetValue = valueDiff + startValue};
    return valueInfo;
}

@interface TimingAnimation () {
    NSString *_keyPath;
    RSTimingFunction *_timingFunction;
    std::weak_ptr<hippy::AnimationManager> _animationManager;
    NSTimeInterval _duration;
    int32_t _viewTag;
    CFTimeInterval _aniBeginTime;
}

@end

@implementation TimingAnimation

+ (BOOL)canHandleAnimationForProperty:(NSString *)keyPath {
    if (0 == [keyPath length]) {
        return NO;
    }
    static NSArray *properties = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        properties = @[@"left", @"right", @"top", @"bottom", @"width", @"height"];
    });
    return [properties containsObject:keyPath];
}

- (instancetype)initWithKeyPath:(NSString *)keyPath timingFunction:(CAMediaTimingFunction *)timingFunction
                     domManager:(std::weak_ptr<hippy::AnimationManager>)animationManager viewTag:(int32_t)viewTag {
    self = [super init];
    if (self) {
        _keyPath = keyPath;
        _animationManager = animationManager;
        _timingFunction = MediaTimingFunctionToRSTimingFunction(timingFunction);
        _viewTag = viewTag;
    }
    return self;
}

- (void)setDuration:(NSTimeInterval)duration {
    _duration = duration;
    _timingFunction.duration = duration;
}

- (void)startAnimating {
    _aniBeginTime = CACurrentMediaTime();
    __weak __typeof(self) weakSelf = self;
    [[TimingAnimationVSync sharedInstance] addVSyncCallback:^{
        __typeof(weakSelf) strongSelf = weakSelf;
        if (strongSelf) {
            [strongSelf animatingAction];
        }
    } forKey:self.animationId];
}

- (void)pauseAnimating {
    
}

- (void)removeAnimating {
    [[TimingAnimationVSync sharedInstance] removeVSyncCallbackForKey:self.animationId];
}

- (void)animatingAction {
    HippyAnimation *animation = _hpAni;
    if (!animation) {
        [self removeAnimating];
    }
    auto aniManager = _animationManager.lock();
    if (aniManager) {
        ValueInfo valueInfo = valueForMediaTime(_hpAni.startValue, _hpAni.endValue, _hpAni.duration, _aniBeginTime, _timingFunction, CACurrentMediaTime());
        using DomValue = tdf::base::DomValue;
        std::shared_ptr<DomValue> value = std::make_shared<DomValue>(valueInfo.targetValue);
        std::pair<uint32_t, std::shared_ptr<DomValue>> pair = std::make_pair([_hpAni.animationId unsignedIntValue], std::move(value));
        std::vector<std::pair<uint32_t, std::shared_ptr<DomValue>>> valueVector = {std::move(pair)};
        aniManager->OnAnimationUpdate(std::move(valueVector));
    }
}

- (void)dealloc {
    [[TimingAnimationVSync sharedInstance] removeVSyncCallbackForKey:self.animationId];
}

@end

@implementation UIView(TimingAnimation)

- (void)addTimingAnimation:(TimingAnimation *)animation {
    objc_setAssociatedObject(self, @selector(addTimingAnimation:), animation, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    [animation startAnimating];
}

@end
