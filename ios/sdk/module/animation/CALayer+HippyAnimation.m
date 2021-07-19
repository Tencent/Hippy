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

#import "CALayer+HippyAnimation.h"
#import "objc/runtime.h"

@implementation CALayer (HippyAnimation)

- (void)setAnimationPaused:(BOOL)animationPaused {
    objc_setAssociatedObject(self, @selector(isAnimationPaused), @(animationPaused), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)isAnimationPaused {
    NSNumber *paused = objc_getAssociatedObject(self, @selector(isAnimationPaused));
    return [paused boolValue];
}

- (void)pauseLayerAnimation {
    if (!self.animationPaused) {
        CFTimeInterval pausedTime = [self convertTime:CACurrentMediaTime() fromLayer:nil];
        self.speed = 0.0;
        self.timeOffset = pausedTime;
        self.animationPaused = YES;
    }
}

- (void)resumeLayerAnimation {
    if (self.animationPaused) {
        CFTimeInterval pausedTime = [self timeOffset];
        self.speed = 1.0;
        self.timeOffset = 0.0;
        self.beginTime = 0.0;
        CFTimeInterval timeSincePause = [self convertTime:CACurrentMediaTime() fromLayer:nil] - pausedTime;
        self.beginTime = timeSincePause;
        self.animationPaused = NO;
    }
}

@end
