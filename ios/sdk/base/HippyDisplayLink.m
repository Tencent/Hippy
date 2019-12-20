/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "HippyDisplayLink.h"

#import <Foundation/Foundation.h>
#import <QuartzCore/CADisplayLink.h>

#import "HippyAssert.h"
#import "HippyBridgeModule.h"
#import "HippyFrameUpdate.h"
#import "HippyModuleData.h"

#define HippyAssertRunLoop() \
HippyAssert(_runLoop == [NSRunLoop currentRunLoop], \
@"This method must be called on the CADisplayLink run loop")

@implementation HippyDisplayLink
{
    CADisplayLink *_jsDisplayLink;
    NSMutableSet<HippyModuleData *> *_frameUpdateObservers;
    NSRunLoop *_runLoop;
}

- (instancetype)init
{
    if ((self = [super init])) {
        _frameUpdateObservers = [NSMutableSet new];
        _jsDisplayLink = [CADisplayLink displayLinkWithTarget:self selector:@selector(_jsThreadUpdate:)];
    }
    
    return self;
}

- (void)registerModuleForFrameUpdates:(id<HippyBridgeModule>)module
                       withModuleData:(HippyModuleData *)moduleData
{
    if (![moduleData.moduleClass conformsToProtocol:@protocol(HippyFrameUpdateObserver)] ||
        [_frameUpdateObservers containsObject:moduleData]) {
        return;
    }
    
    [_frameUpdateObservers addObject:moduleData];
    
    // Don't access the module instance via moduleData, as this will cause deadlock
    id<HippyFrameUpdateObserver> observer = (id<HippyFrameUpdateObserver>)module;
    __weak typeof(self) weakSelf = self;
    observer.pauseCallback = ^{
        typeof(self) strongSelf = weakSelf;
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

- (void)addToRunLoop:(NSRunLoop *)runLoop
{
    _runLoop = runLoop;
    [_jsDisplayLink addToRunLoop:runLoop forMode:NSRunLoopCommonModes];
}

- (void)invalidate
{
    [_jsDisplayLink invalidate];
}

- (void)dispatchBlock:(dispatch_block_t)block
                queue:(dispatch_queue_t)queue
{
    if (queue == HippyJSThread) {
        block();
    } else if (queue) {
        dispatch_async(queue, block);
    }
}

- (void)_jsThreadUpdate:(CADisplayLink *)displayLink
{
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

- (void)updateJSDisplayLinkState
{
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
