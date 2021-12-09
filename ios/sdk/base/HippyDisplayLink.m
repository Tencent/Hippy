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

#import "HippyDisplayLink.h"

#import <Foundation/Foundation.h>
#import <QuartzCore/CADisplayLink.h>

#import "HippyAssert.h"
#import "HippyBridgeModule.h"
#import "HippyFrameUpdate.h"
#import "HippyModuleData.h"

#define HippyAssertRunLoop() HippyAssert(_runLoop == [NSRunLoop currentRunLoop], @"This method must be called on the CADisplayLink run loop")

@implementation HippyDisplayLink {
    CADisplayLink *_jsDisplayLink;
    NSMutableSet<HippyModuleData *> *_frameUpdateObservers;
    NSRunLoop *_runLoop;
}

- (instancetype)init {
    if ((self = [super init])) {
        _frameUpdateObservers = [NSMutableSet new];
        _jsDisplayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(_jsThreadUpdate:)];
    }

    return self;
}

- (void)registerModuleForFrameUpdates:(id<HippyBridgeModule>)module withModuleData:(HippyModuleData *)moduleData {
    if (![moduleData.moduleClass conformsToProtocol:@protocol(HippyFrameUpdateObserver)] || [_frameUpdateObservers containsObject:moduleData]) {
        return;
    }

    [_frameUpdateObservers addObject:moduleData];

    // Don't access the module instance via moduleData, as this will cause deadlock
    id<HippyFrameUpdateObserver> observer = (id<HippyFrameUpdateObserver>)module;
    __weak __typeof(self) weakSelf = self;
    observer.pauseCallback = ^{
        __typeof(self) strongSelf = weakSelf;
        if (!strongSelf) {
            return;
        }

        CFRunLoopRef cfRunLoop = [strongSelf->_runLoop getCFRunLoop];
        if (!cfRunLoop) {
            return;
        }

        if ([NSRunLoop currentRunLoop] == strongSelf->_runLoop) {
            [weakSelf updateJSDisplayLinkState];
        } else {
            CFRunLoopPerformBlock(cfRunLoop, kCFRunLoopDefaultMode, ^{
                [weakSelf updateJSDisplayLinkState];
            });
            CFRunLoopWakeUp(cfRunLoop);
        }
    };

    // Assuming we're paused right now, we only need to update the display link's state
    // when the new observer is not paused. If it not paused, the observer will immediately
    // start receiving updates anyway.
    if (![observer isPaused] && _runLoop) {
        CFRunLoopPerformBlock([_runLoop getCFRunLoop], kCFRunLoopDefaultMode, ^{
            [self updateJSDisplayLinkState];
        });
    }
}

- (void)addToRunLoop:(NSRunLoop *)runLoop {
    _runLoop = runLoop;
    [_jsDisplayLink addToRunLoop:runLoop forMode:NSRunLoopCommonModes];
}

- (void)invalidate {
    [_jsDisplayLink invalidate];
}

- (void)dispatchBlock:(dispatch_block_t)block queue:(dispatch_queue_t)queue {
    if (queue == HippyJSThread) {
        block();
    } else if (queue) {
        dispatch_async(queue, block);
    }
}

- (void)_jsThreadUpdate:(CADisplayLink *)displayLink {
    HippyAssertRunLoop();

    HippyFrameUpdate *frameUpdate = [[HippyFrameUpdate alloc] initWithDisplayLink:displayLink];
    for (HippyModuleData *moduleData in _frameUpdateObservers) {
        id<HippyFrameUpdateObserver> observer = (id<HippyFrameUpdateObserver>)moduleData.instance;
        if (!observer.paused) {
            [self dispatchBlock:^{
                [observer didUpdateFrame:frameUpdate];
            } queue:moduleData.methodQueue];
        }
    }

    [self updateJSDisplayLinkState];
}

- (void)updateJSDisplayLinkState {
    HippyAssertRunLoop();

    BOOL pauseDisplayLink = YES;
    for (HippyModuleData *moduleData in _frameUpdateObservers) {
        id<HippyFrameUpdateObserver> observer = (id<HippyFrameUpdateObserver>)moduleData.instance;
        if (!observer.paused) {
            pauseDisplayLink = NO;
            break;
        }
    }

    _jsDisplayLink.paused = pauseDisplayLink;
}

@end
