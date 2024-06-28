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

#import "HippyNextAnimationGroup.h"
#import <objc/runtime.h>

@implementation HippyNextAnimation (Group)

- (void)setIsFollow:(BOOL)isFollow {
    objc_setAssociatedObject(self, @selector(isFollow), @(isFollow), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)isFollow {
    return [objc_getAssociatedObject(self, _cmd) boolValue];
}

@end

#pragma mark -

@interface HippyNextAnimationGroup ()

/// Whether the animation group is paused
@property (nonatomic, assign) BOOL isGroupPaused;

/// All paused animations, record them for restart
@property (nonatomic, strong) NSMutableArray<HippyNextAnimation *> *pausedAnimations;

@end

@implementation HippyNextAnimationGroup
{
    NSInteger _currentRepeatCount;
    BOOL _isGroupPausedCausedReturn;
    
    // Member variables used to correct the animation time.
    CFTimeInterval _totalDuration;
    CFTimeInterval _lastStartTime;
    CFTimeInterval _cumulativeFrameDelay;
}

- (BOOL)prepareForTarget:(id)target withType:(NSString *)type {
    CFTimeInterval totalDuration = 0.0;
    HippyNextAnimation *previousAnimation;
    
    for (HippyNextAnimation *anim in self.animations) {
        if (![anim prepareForTarget:target withType:type]) {
            return NO;
        }
        if (!previousAnimation || (previousAnimation && anim.isFollow)) {
            totalDuration += anim.duration;
        }
        previousAnimation = anim;
        _totalDuration = totalDuration;
    }
    return YES;
}

#pragma mark - Public Methods

- (void)startAnimation {
    self.isGroupPaused = NO;
    [self startAnimationWithRepeatCount:self.repeatCount];
    if (self.delegate && [self.delegate respondsToSelector:@selector(hpop_animationDidStart:)]) {
        [self.delegate hpop_animationDidStart:self];
    }
}

- (void)startAnimationWithRepeatCount:(NSUInteger)repeatCount {
    _currentRepeatCount = repeatCount;
    if (repeatCount == 0) {
        if (self.delegate && [self.delegate respondsToSelector:@selector(hpop_animationDidStop:finished:)]) {
            [self.delegate hpop_animationDidStop:self finished:YES];
        }
        return;
    }
    if (self.isGroupPaused) {
        _isGroupPausedCausedReturn = YES;
        return;
    }
    __block HippyNextAnimation *previousAnimation;
    for (HippyNextAnimation *animation in self.animations) {
        if (animation.isFollow && previousAnimation) {
            [previousAnimation setCompletionBlock:^(HPOPAnimation *anim, BOOL finished) {
                if (finished) {
                    [animation startAnimation];
                }
            }];
        } else {
            // Record the time when the animation group started,
            // and correct the time offset if needed.
            if (!previousAnimation) {
                if (_lastStartTime > DBL_EPSILON) {
                    // Since CADisplayLink's callback is used to execute the animation group,
                    // there is a frame time interval between each animation.
                    // In order to ensure the time synchronization between different animation groups,
                    // we need to continuously correct possible time deviations to avoid the accumulation of time differences.
                    CFTimeInterval refreshPeriod = HPOPAnimator.sharedAnimator.refreshPeriod;
                    if (refreshPeriod > DBL_EPSILON) {
                        if (_cumulativeFrameDelay <= DBL_EPSILON) {
                            for (HippyNextAnimation *animation in self.animations) {
                                _cumulativeFrameDelay += ceil(animation.duration / refreshPeriod) * refreshPeriod - animation.duration;
                            }
                        }
                        
                        CFTimeInterval timeOffset = (CACurrentMediaTime() - _lastStartTime) - (_totalDuration + _cumulativeFrameDelay);
                        animation.beginTime = timeOffset;
                    }
                }
                _lastStartTime = CACurrentMediaTime();
            }
            [animation startAnimation];
        }
        previousAnimation = animation;
    }
    if (previousAnimation) {
        __weak __typeof(self)weakSelf = self;
        [previousAnimation setCompletionBlock:^(HPOPAnimation *anim, BOOL finished) {
            if (finished) {
                __strong __typeof(weakSelf)strongSelf = weakSelf;
                [strongSelf startAnimationWithRepeatCount:repeatCount - 1];
            }
        }];
    }
}

- (void)setPaused:(BOOL)paused {
    [self setPausedWithoutReset:paused];
}

- (void)setPausedWithoutReset:(BOOL)paused {
    self.isGroupPaused = paused;
    if (paused) {
        [self.pausedAnimations removeAllObjects];
        for (HippyNextAnimation *anim in self.animations) {
            if (!anim.isPaused) {
                [anim setPausedWithoutReset:YES];
                [self.pausedAnimations addObject:anim];
            }
        }
    } else {
        // restart animation
        for (HippyNextAnimation *anim in self.pausedAnimations) {
            [anim setPausedWithoutReset:NO];
        }
        if (_isGroupPausedCausedReturn) {
            [self startAnimationWithRepeatCount:_currentRepeatCount];
        }
    }
}

#pragma mark -

- (id)getPretreatedFromValueForAnimType:(NSString *)type {
    return [self.animations.firstObject getPretreatedFromValueForAnimType:type];
}

- (id)getPretreatedToValueForAnimType:(NSString *)type {
    return [self.animations.lastObject getPretreatedToValueForAnimType:type];
}

- (NSMutableArray<HippyNextAnimation *> *)pausedAnimations {
    if (!_pausedAnimations) {
        _pausedAnimations = [NSMutableArray array];
    }
    return _pausedAnimations;
}

@end

