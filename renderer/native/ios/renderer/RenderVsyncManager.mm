/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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
#import "objc/runtime.h"
#import <QuartzCore/CADisplayLink.h>
#import <mutex>

@interface CADisplayLink (Vsync)

@property(nonatomic, copy)dispatch_block_t block;

- (void)applyRefreshRate:(float)rate;

@end

@implementation CADisplayLink (Vsync)

- (void)setBlock:(dispatch_block_t)block {
    objc_setAssociatedObject(self, @selector(block), block, OBJC_ASSOCIATION_COPY);
}

- (dispatch_block_t)block {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)applyRefreshRate:(float)rate {
    NSAssert(1 <= rate && 120 >=rate, @"vsync refresh rate must between 1 and 120");
    if (@available(iOS 15.0, *)) {
        CAFrameRateRange rateRange = {rate, rate, rate};
        self.preferredFrameRateRange = rateRange;
    }
    else if (@available(iOS 10.0, *)) {
        self.preferredFramesPerSecond = rate;
    }
    else {
#if __IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_10_0
        self.frameInterval = 60.f / rate;
#endif //__IPHONE_OS_VERSION_MIN_REQUIRED < __IPHONE_10_0
    }
}

@end

@interface RenderVsyncManager () {
    NSMutableDictionary<NSString *, CADisplayLink *> *_observers;
    std::mutex _mutex;
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
        _observers = [NSMutableDictionary dictionaryWithCapacity:8];
    }
    return self;
}

- (void)vsyncSignalInvoked:(CADisplayLink *)displayLink {
    dispatch_block_t block = displayLink.block;
    if (block) {
        block();
    }
}

- (void)registerVsyncObserver:(dispatch_block_t)observer rate:(float)rate forKey:(NSString *)key {
    if (observer && key) {
        CADisplayLink *vsync = [CADisplayLink displayLinkWithTarget:self selector:@selector(vsyncSignalInvoked:)];
        [vsync applyRefreshRate:rate];
        [vsync addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
        vsync.block = observer;
        std::lock_guard<std::mutex> lock(_mutex);
        [_observers setObject:vsync forKey:key];
    }
}

- (void)unregisterVsyncObserverForKey:(NSString *)key {
    if (key) {
        CADisplayLink *vsync = [_observers objectForKey:key];
        if (vsync) {
            {
                std::lock_guard<std::mutex> lock(_mutex);
                [_observers removeObjectForKey:key];
            }
            [vsync invalidate];
        }
    }
}

@end
