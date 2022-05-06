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

#import "TimingAnimationVSync.h"
#import <QuartzCore/CADisplayLink.h>

double const AnimationRefreshRate = 30.f;

@interface TimingAnimationVSync () {
    CADisplayLink *_vsync;
    NSMutableDictionary<id, VSyncCallback> *_vsyncCallbacksMap;
}

@end

@implementation TimingAnimationVSync

+ (instancetype)sharedInstance {
    static TimingAnimationVSync *instance = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        instance = [[TimingAnimationVSync alloc] init];
    });
    return instance;
}

- (id)copy {
    return self;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _vsync = [CADisplayLink displayLinkWithTarget:self selector:@selector(vsyncInvoked)];
        [_vsync addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];
        _vsync.paused = YES;
        _vsyncCallbacksMap = [NSMutableDictionary dictionaryWithCapacity:32];
        [self setRefreshRate];
    }
    return self;
}

- (void)setRefreshRate {
    if (@available(iOS 15.0, *)) {
        CAFrameRateRange range = {.minimum = AnimationRefreshRate, .maximum = AnimationRefreshRate, .preferred = AnimationRefreshRate};
        _vsync.preferredFrameRateRange = range;
    }
    else if (@available(iOS 10.0, *)) {
        _vsync.preferredFramesPerSecond = AnimationRefreshRate;
    }
    else {
        _vsync.frameInterval = 60 / AnimationRefreshRate;
    }
}

- (void)vsyncInvoked {
    NSArray *callbacks = [_vsyncCallbacksMap allValues];
    for (VSyncCallback callback in callbacks) {
        callback();
    }
}

- (void)addVSyncCallback:(VSyncCallback)callback forKey:(id)key {
    if (callback && key) {
        [_vsyncCallbacksMap setObject:callback forKey:key];
        _vsync.paused = NO;
    }
}

- (void)removeVSyncCallbackForKey:(id)key {
    if (key) {
        [_vsyncCallbacksMap removeObjectForKey:key];
        _vsync.paused = !([_vsyncCallbacksMap count] > 0);
    }
}

@end
