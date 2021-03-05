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

#import "HippyExtAnimationGroup.h"
#import "HippyLog.h"
#import <objc/runtime.h>
#import "HippyExtAnimation+Group.h"
#import "HippyExtAnimation+Value.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wmacro-redefined"
#define HippyLogInfo(...) \
    do {                  \
    } while (0)
#pragma clang diagnostic pop

@implementation HippyExtAnimationGroup

- (void)setAnimations:(NSArray<HippyExtAnimation *> *)animations {
    _animations = animations;
    [self setupAnimation:animations];
}

- (double)startValue {
    HippyExtAnimation *fist = [_animations firstObject];
    return fist.startValue;
}

- (double)endValue {
    HippyExtAnimation *last = [_animations lastObject];
    return last.endValue;
}

- (void)setupAnimation:(NSArray<HippyExtAnimation *> *)animations {
    __block HippyExtAnimation *lastAnimation = nil;
    __block NSTimeInterval duration = 0;

    [animations enumerateObjectsUsingBlock:^(HippyExtAnimation *ani, __unused NSUInteger idx, __unused BOOL *stop) {
        if (lastAnimation) {
            if (ani.bFollow) {
                duration += ani.duration + ani.delay;
                ani.beginTime = lastAnimation.beginTime + lastAnimation.duration + ani.delay;
            } else {
                if ((lastAnimation.duration + lastAnimation.delay) < (ani.duration + lastAnimation.delay)) {
                    duration -= (lastAnimation.duration + lastAnimation.delay);
                    duration += (ani.duration + ani.delay);
                }
                ani.beginTime = lastAnimation.beginTime + ani.delay;
            }
        } else {
            duration += ani.duration + ani.delay;
            ani.beginTime = ani.delay;
        }
        lastAnimation = ani;
    }];

    self.duration = duration;
    HippyLogInfo(@"animationGroup:%@ duration:%@", self.animationId, @(duration));
    _animations = animations;
}

- (CAAnimation *)animationOfView:(UIView *)view forProp:(NSString *)prop {
    NSMutableArray *ca_animations = [NSMutableArray arrayWithCapacity:_animations.count];
    __block HippyExtAnimation *firstAnimaiton = nil;
    HippyLogInfo(@"--------animaiton start [%@]--------", prop);
    [_animations enumerateObjectsUsingBlock:^(HippyExtAnimation *ani, __unused NSUInteger idx, __unused BOOL *_Nonnull stop) {
        CABasicAnimation *ca_ani = (CABasicAnimation *)[ani animationOfView:view forProp:prop];
        if (ca_ani) {
            [ca_ani setValue:ani.animationId forKey:@"animationID"];
            ca_ani.beginTime = ani.beginTime;
            if (firstAnimaiton) {
                if ([prop isEqualToString:@"top"]) {
                    CGPoint center = view.center;
                    self.fromValue = @(center.y);
                    self.toValue = @(center.y - (self.startValue - self.endValue));
                } else if ([prop isEqualToString:@"bottom"]) {
                    CGPoint center = view.center;
                    self.fromValue = @(center.y);
                    self.toValue = @(center.y + (self.startValue - self.endValue));
                } else if ([prop isEqualToString:@"left"]) {
                    CGPoint center = view.center;
                    self.fromValue = @(center.x);
                    self.toValue = @(center.x - (self.startValue - self.endValue));
                } else if ([prop isEqualToString:@"right"]) {
                    CGPoint center = view.center;
                    self.fromValue = @(center.x);
                    self.toValue = @(center.x + (self.startValue - self.endValue));
                }
            }
            [ca_animations addObject:ca_ani];
            if (firstAnimaiton == nil) {
                firstAnimaiton = ani;
            }
            HippyLogInfo(@"--------startValue:%@ tovalue:%@ beginTime:%@ duration:%@", ca_ani.fromValue, ca_ani.toValue, @(ca_ani.beginTime),
                @(ca_ani.duration));
        }
    }];
    HippyLogInfo(@"--------animation duration:%@", @(self.duration));
    HippyLogInfo(@"--------animaiton end [%@]--------", prop);
    CAAnimationGroup *group = [CAAnimationGroup animation];
    group.animations = ca_animations;
    group.repeatCount = self.repeatCount;
    group.duration = self.duration;
    group.removedOnCompletion = NO;
    group.fillMode = kCAFillModeForwards;

    return group;
}

@end

@implementation HippyExtAnimation (Group)

- (void)setBeginTime:(NSTimeInterval)beginTime {
    objc_setAssociatedObject(self, @selector(beginTime), @(beginTime), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (CFTimeInterval)beginTime {
    return [objc_getAssociatedObject(self, _cmd) doubleValue];
}

- (void)setBFollow:(BOOL)bFollow {
    objc_setAssociatedObject(self, @selector(bFollow), @(bFollow), OBJC_ASSOCIATION_RETAIN_NONATOMIC);
}

- (BOOL)bFollow {
    return [objc_getAssociatedObject(self, _cmd) boolValue];
}

@end
