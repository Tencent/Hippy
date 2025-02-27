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

#import <QuartzCore/CADisplayLink.h>
#import "HippyVsyncManager.h"
#import "HippyAssert.h"
#import <objc/runtime.h>

// MARK: - CADisplayLink Category for Vsync Handling
@interface CADisplayLink (Vsync)

/// Associated block to be executed on vsync
@property(nonatomic, copy) dispatch_block_t block;

/// Applies refresh rate with validation
/// @param rate Target refresh rate (1-120 Hz)
- (void)applyRefreshRate:(float)rate;

@end

@implementation CADisplayLink (Vsync)

- (void)setBlock:(dispatch_block_t)block {
    // Use COPY association to maintain block ownership
    objc_setAssociatedObject(self, @selector(block), block, OBJC_ASSOCIATION_COPY);
}

- (dispatch_block_t)block {
    return objc_getAssociatedObject(self, _cmd);
}

- (void)applyRefreshRate:(float)rate {
    // Validate refresh rate boundaries
    HippyAssert(rate >= 1 && rate <= 120, @"VSync refresh rate must be between 1 and 120 Hz");
    
    if (@available(iOS 15.0, *)) {
        CAFrameRateRange rateRange = CAFrameRateRangeMake(rate, rate, rate);
        self.preferredFrameRateRange = rateRange;
    } else {
        // Cap to 60 FPS for devices below iOS 15
        self.preferredFramesPerSecond = MIN(rate, 60);
    }
}

@end

// MARK: - Vsync Manager Implementation
@interface HippyVsyncManager () {
    NSMutableDictionary<NSString *, CADisplayLink *> *_observers;
    dispatch_semaphore_t _semaphore;
}

@end

@implementation HippyVsyncManager

// MARK: - Singleton Pattern
+ (instancetype)sharedInstance {
    static dispatch_once_t onceToken;
    static HippyVsyncManager *instance;
    dispatch_once(&onceToken, ^{
        instance = [[HippyVsyncManager alloc] init];
    });
    return instance;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _observers = [NSMutableDictionary dictionary];
        _semaphore = dispatch_semaphore_create(1);
    }
    return self;
}

// MARK: - Vsync Callback Handling
- (void)vsyncSignalInvoked:(CADisplayLink *)displayLink {
    // Execute block if exists
    dispatch_block_t block = displayLink.block;
    if (block) {
        block();
    }
}

// MARK: - Public Interface
- (void)registerVsyncObserver:(dispatch_block_t)observer forKey:(NSString *)key {
    // Default to 60Hz refresh rate
    [self registerVsyncObserver:observer rate:60.0f forKey:key];
}

- (void)registerVsyncObserver:(dispatch_block_t)observer rate:(float)rate forKey:(NSString *)key {
    if (!observer || !key) {
        HippyAssert(NO, @"Invalid parameters for observer registration");
        return;
    }
    
    // Remove existing observer for key
    [self unregisterVsyncObserverForKey:key];
    
    // Create and configure display link
    CADisplayLink *vsync = [CADisplayLink displayLinkWithTarget:self selector:@selector(vsyncSignalInvoked:)];
    [vsync applyRefreshRate:rate];
    [vsync addToRunLoop:[NSRunLoop mainRunLoop] forMode:NSRunLoopCommonModes];
    vsync.block = observer;
    
    // Thread-safe dictionary update
    dispatch_semaphore_wait(_semaphore, DISPATCH_TIME_FOREVER);
    _observers[key] = vsync;
    dispatch_semaphore_signal(_semaphore);
}

- (void)unregisterVsyncObserverForKey:(NSString *)key {
    if (!key) {
        HippyAssert(NO, @"Attempted to unregister with nil key");
        return;
    }
    
    CADisplayLink *vsync = nil;
    
    // Thread-safe dictionary access
    dispatch_semaphore_wait(_semaphore, DISPATCH_TIME_FOREVER);
    vsync = _observers[key];
    if (vsync) {
        [_observers removeObjectForKey:key];
    }
    dispatch_semaphore_signal(_semaphore);
    
    // Invalidate outside lock to prevent deadlocks
    [vsync invalidate];
}

@end
