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

static ValueInfo ValueForMediaTime(double startValue, double endValue, double duration, double startTime, double targetTime, double pauseTimeDuration, RSTimingFunction *timingFunction) {
    double valueDiff = endValue - startValue;
    double timeDiff = targetTime - pauseTimeDuration - startTime;
    long loopIndex = 0;
    while (timeDiff > duration) {
        loopIndex++;
        timeDiff -= duration;
    }
    double y = [timingFunction valueForX:timeDiff / duration];
    double taretValue = startValue + y * valueDiff;
    ValueInfo valueInfo = {.loopIndex = loopIndex, .targetValue = taretValue};
    return valueInfo;
}

@interface TimingAnimation () {
    NSString *_keyPath;
    RSTimingFunction *_timingFunction;
    std::weak_ptr<hippy::AnimationManager> _animationManager;
    double _duration;
    int32_t _viewTag;
    double _aniBeginTime;
    BOOL _isPausing;
    double _pauseTimeDuration;
    double _pauseTimeInterval;
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
    [self performSelector:@selector(performAnimating) withObject:nil afterDelay:_hpAni.delay];
}

- (void)performAnimating {
    if ([self.delegate respondsToSelector:@selector(timingAnimationDidStart:)]) {
        [self.delegate timingAnimationDidStart:self];
    }
    _aniBeginTime = CACurrentMediaTime();
    NSNumber *animationId = self.animationId;
    __weak __typeof(self) weakSelf = self;
    [[TimingAnimationVSync sharedInstance] addVSyncCallback:^{
        __strong __typeof(weakSelf) strongSelf = weakSelf;
        if (strongSelf) {
            if (!strongSelf->_isPausing) {
                if (![strongSelf animatingAction]) {
                    [strongSelf removeAnimating];
                }
            }
        }
        else {
            [[TimingAnimationVSync sharedInstance] removeVSyncCallbackForKey:animationId completion:^(BOOL containAnimation) {
                if (containAnimation && [self.delegate respondsToSelector:@selector(timingAnimationDidStop:)]) {
                    [self.delegate timingAnimationDidStop:self];
                }
            }];
        }
    } forKey:animationId];
}

- (void)pauseAnimating {
    if (_isPausing) {
        return;
    }
    _isPausing = YES;
    _pauseTimeInterval = CACurrentMediaTime();
    [[TimingAnimationVSync sharedInstance] pauseVSyncForKey:self.animationId];
}

- (void)resumeAnimating {
    if (_isPausing) {
        _isPausing = NO;
        _pauseTimeDuration += (CACurrentMediaTime() - _pauseTimeInterval);
        _pauseTimeInterval = 0.f;
        [[TimingAnimationVSync sharedInstance] resumeVSyncForKey:self.animationId];
    }
}

- (void)removeAnimating {
    _isPausing = NO;
    _pauseTimeInterval = 0.f;
    _pauseTimeDuration = 0.f;
    [[TimingAnimationVSync sharedInstance] removeVSyncCallbackForKey:self.animationId completion:^(BOOL containAnimation) {
        if (containAnimation && [self.delegate respondsToSelector:@selector(timingAnimationDidStop:)]) {
            [self.delegate timingAnimationDidStop:self];
        }
    }];
}

- (BOOL)animatingAction {
    HippyAnimation *animation = _hpAni;
    if (!animation) {
        [self removeAnimating];
        return NO;
    }
    auto aniManager = _animationManager.lock();
    if (aniManager) {
        ValueInfo valueInfo = ValueForMediaTime(animation.startValue, animation.endValue, _duration, _aniBeginTime, CACurrentMediaTime(), _pauseTimeDuration, _timingFunction);
        if (valueInfo.loopIndex < _hpAni.repeatCount) {
            using DomValue = tdf::base::DomValue;
            std::shared_ptr<DomValue> value = std::make_shared<DomValue>(valueInfo.targetValue);
            std::pair<uint32_t, std::shared_ptr<DomValue>> pair = std::make_pair([self.animationId unsignedIntValue], std::move(value));
            std::vector<std::pair<uint32_t, std::shared_ptr<DomValue>>> valueVector = {std::move(pair)};
            // aniManager->OnAnimationUpdate(std::move(valueVector));
            return YES;
        }
    }
    return NO;
}

- (void)dealloc {
    [self removeAnimating];
}

@end

@implementation UIView(TimingAnimation)

- (void)addTimingAnimation:(TimingAnimation *)animation {
    objc_setAssociatedObject(self, @selector(addTimingAnimation:), animation, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
    [animation startAnimating];
}

@end
