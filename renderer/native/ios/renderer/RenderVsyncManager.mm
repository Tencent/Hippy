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

#import "RenderVsyncManager.h"
#import <QuartzCore/CADisplayLink.h>
#import <unordered_map>

//
//RenderVsyncManager &RenderVsyncManager::instance() {
//    return RenderVsyncManager::vsync_manager_;
//}
//
//RenderVsyncManager::RenderVsyncManager() {
//    display_link_ = [CADisplayLink display]
//}
//
//void RenderVsyncManager::RegisterVsyncObserver(std::function<void ()> observer) {
//    vsync_observers_.emplace_back(observer);
//}

@interface RenderVsyncManager () {
    std::unordered_map<std::string, std::function<void()>> _observers;
    CADisplayLink *_vsync;
    NSUInteger _rate;
}

@end

@implementation RenderVsyncManager

+ (instancetype)sharedInstance {
    static dispatch_once_t onceToken;
    static RenderVsyncManager *instance = nil;
    dispatch_once(&onceToken, ^{
        instance = [[RenderVsyncManager alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _rate = 30;
        _vsync = [CADisplayLink displayLinkWithTarget:self selector:@selector(displayLinkTrigger)];
        [self applyRefreshRate];
    }
    return self;
}

- (void)applyRefreshRate {
    NSAssert(1 <= _rate && 60 >=_rate, @"vsync refresh rate must between 1 and 60");
    if (@available(iOS 15.0, *)) {
        float f = static_cast<float>(_rate);
        CAFrameRateRange rateRange = {f, f, f};
        _vsync.preferredFrameRateRange = rateRange;
    }
    else if (@available(iOS 10.0, *)) {
        _vsync.preferredFramesPerSecond = _rate;
    }
    else {
        _vsync.frameInterval = 60 / _rate;
    }
}

- (void)displayLinkTrigger {
    for (const auto &it : _observers) {
        it.second();
    }
}

- (void)setRate:(NSUInteger)rate {
    _rate = rate;
    [self applyRefreshRate];
}

- (void)registerVsyncObserver:(std::function<void()>)observer forKey:(const std::string &)key {
    _observers[key] = observer;
    _vsync.paused = NO;
}

- (void)unregisterVsyncObserverForKey:(const std::string &)key {
    _observers[key] = nullptr;
    if (_observers.size() == 0) {
        _vsync.paused = YES;
    }
}

@end
