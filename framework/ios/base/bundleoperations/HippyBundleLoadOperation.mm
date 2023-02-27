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

#import "HippyBundleLoadOperation.h"
#import "HippyBridge+VFSLoader.h"
#import "HippyPerformanceLogger.h"

#include <mutex>

@interface HippyBundleLoadOperation () {
    HippyBridge *_bridge;
    NSURL *_bundleURL;
    
    BOOL _cancelled;
    BOOL _executing;
    BOOL _finished;
    BOOL _asynchronous;
    BOOL _ready;
    std::mutex _statusMutex;
    dispatch_queue_t _finishQueue;
}

@end

@implementation HippyBundleLoadOperation

@synthesize finished = _finished;
@synthesize executing = _executing;

- (instancetype)initWithBridge:(HippyBridge *)bridge bundleURL:(NSURL *)bundleURL queue:(dispatch_queue_t)queue {
    if (self) {
        _bridge = bridge;
        _bundleURL = bundleURL;
        _finishQueue = queue;
        self.ready = YES;
    }
    return self;
}

- (void)start {
    self.asynchronous = YES;
    self.concurrent = YES;
    [self main];
}

- (void)main {
    if (self.cancelled) {
        return;
    }
    self.finished = NO;
    self.executing = YES;
    HippyBridge *bridge = _bridge;
    HippyPerformanceLogger *performanceLogger = bridge?bridge.performanceLogger:nil;
    [performanceLogger markStartForTag:HippyPLScriptDownload];
    __weak HippyBundleLoadOperation *weakSelf = self;
    [bridge loadContentsAsynchronouslyFromUrl:[_bundleURL absoluteString]
                                       method:@"get"
                                       params:nil
                                         body:nil
                                     progress:nil
                            completionHandler:^(NSData * _Nonnull data, NSURLResponse * _Nonnull response, NSError * _Nonnull error) {
        HippyBundleLoadOperation *strongSelf = weakSelf;
        if (!strongSelf || strongSelf.cancelled) {
            strongSelf.finished = YES;
            strongSelf.executing = NO;
            return;
        }
        int64_t sourceLength = [data length];
        [performanceLogger markStopForTag:HippyPLScriptDownload];
        [performanceLogger setValue:sourceLength forTag:HippyPLBundleSize];
        if (strongSelf.onLoad) {
            if (strongSelf->_finishQueue) {
                dispatch_sync(strongSelf->_finishQueue, ^{
                    strongSelf.onLoad(data, error);
                });
            }
            else {
                strongSelf.onLoad(data, error);
            }
        }
        strongSelf.finished = YES;
        strongSelf.executing = NO;
    }];
}

- (void)cancel {
    self.cancelled = YES;
}

- (void)setCancelled:(BOOL)cancelled {
    if (_cancelled == cancelled) {
        return;
    }
    [self willChangeValueForKey:@"isCancelled"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _cancelled = cancelled;
    }
    [self didChangeValueForKey:@"isCancelled"];
}

- (BOOL)isCancelled {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _cancelled;
}

- (void)setExecuting:(BOOL)isExecuting {
    if (_executing == isExecuting) {
        return;
    }
    [self willChangeValueForKey:@"isExecuting"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _executing = isExecuting;
    }
    [self didChangeValueForKey:@"isExecuting"];
}

- (BOOL)isExecuting {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _executing;
}

- (void)setFinished:(BOOL)isFinished {
    if (_finished == isFinished) {
        return;
    }
    [self willChangeValueForKey:@"isFinished"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _finished = isFinished;
    }
    [self didChangeValueForKey:@"isFinished"];
}

- (BOOL)isFinished {
    return _finished;
}

- (void)setConcurrent:(BOOL)isConcurrent {
    if (_asynchronous == isConcurrent) {
        return;
    }
    [self willChangeValueForKey:@"isConcurrent"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _asynchronous = isConcurrent;
    }
    [self didChangeValueForKey:@"isConcurrent"];
}

- (BOOL)isConcurrent {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _asynchronous;
}

- (void)setAsynchronous:(BOOL)isAsynchronous {
    if (_asynchronous == isAsynchronous) {
        return;
    }
    [self willChangeValueForKey:@"isAsynchronous"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _asynchronous = isAsynchronous;
    }
    [self didChangeValueForKey:@"isAsynchronous"];
}

- (BOOL)isAsynchronous {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _asynchronous;
}

- (void)setReady:(BOOL)isReady {
    if (_ready == isReady) {
        return;
    }
    [self willChangeValueForKey:@"isReady"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _ready = isReady;
    }
    [self didChangeValueForKey:@"isReady"];
}

- (BOOL)isReady {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _ready;
}

- (void)dealloc {
    
}

@end
