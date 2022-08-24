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

#import "HippyBundleExecutionOperation.h"
#include <mutex>

@interface HippyBundleExecutionOperation () {
    dispatch_block_t _block;
    BOOL _cancelled;
    BOOL _executing;
    BOOL _finished;
    BOOL _asynchronous;
    BOOL _ready;
    NSMutableSet<NSOperation *> *_dependencies;
    std::mutex _statusMutex;
    std::mutex _dependencyMutex;
}

@end

@implementation HippyBundleExecutionOperation

- (instancetype)initWithBlock:(dispatch_block_t)block {
    self = [super init];
    if (self) {
        _block = [block copy];
        _dependencies = [NSMutableSet setWithCapacity:8];
        self.ready = YES;
    }
    return self;
}

- (void)dealloc {
    std::lock_guard<std::mutex> lock(_dependencyMutex);
    for (NSOperation *op in _dependencies) {
        [op removeObserver:self forKeyPath:@"finished" context:NULL];
    }
}

- (void)start {
    if (self.cancelled) {
        return;
    }
    if (self.ready) {
        [self main];
    }
}

- (void)main {
    if (self.cancelled) {
        return;
    }
    self.finished = NO;
    self.executing = YES;
    if (_block) {
        _block();
    }
    self.finished = YES;
    self.executing = NO;
}

- (void)addDependency:(NSOperation *)op {
    if (self.cancelled || self.executing || self.finished || !op) {
        return;
    }
    {
        std::lock_guard<std::mutex> lock(_dependencyMutex);
        [_dependencies addObject:op];
    }
    if (![op isFinished]) {
        self.ready = NO;
    }
    [op addObserver:self forKeyPath:@"finished" options:NSKeyValueObservingOptionNew context:NULL];
}

- (void)removeDependency:(NSOperation *)op {
    std::lock_guard<std::mutex> lock(_dependencyMutex);
    if ([_dependencies containsObject:op]) {
        [_dependencies removeObject:op];
        [op removeObserver:self forKeyPath:@"finished" context:NULL];
    }
}

- (NSArray<NSOperation *> *)dependencies {
    std::lock_guard<std::mutex> lock(_dependencyMutex);
    return [_dependencies allObjects];
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
    if ([keyPath isEqualToString:@"finished"]) {
        [self checkForReadyStatus];
    }
}

- (void)checkForReadyStatus {
    std::lock_guard<std::mutex> lock(_dependencyMutex);
    BOOL status = YES;
    for (NSOperation *op in _dependencies) {
        if (![op isFinished]) {
            status = NO;
            break;
        }
    }
    self.ready = status;
}

- (void)cancel {
    self.cancelled = YES;
}

- (void)setCancelled:(BOOL)cancelled {
    if (_cancelled == cancelled) {
        return;
    }
    [self willChangeValueForKey:@"cancelled"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _cancelled = cancelled;
    }
    [self didChangeValueForKey:@"cancelled"];
}

- (BOOL)isCancelled {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _cancelled;
}

- (void)setExecuting:(BOOL)isExecuting {
    if (_executing == isExecuting) {
        return;
    }
    [self willChangeValueForKey:@"executing"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _executing = isExecuting;
    }
    [self didChangeValueForKey:@"executing"];
}

- (BOOL)isExecuting {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _executing;
}

- (void)setFinished:(BOOL)isFinished {
    if (_finished == isFinished) {
        return;
    }
    [self willChangeValueForKey:@"finished"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _finished = isFinished;
    }
    [self didChangeValueForKey:@"finished"];
}

- (BOOL)isFinished {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _finished;
}

- (void)setConcurrent:(BOOL)isConcurrent {
    if (_asynchronous == isConcurrent) {
        return;
    }
    [self willChangeValueForKey:@"concurrent"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _asynchronous = isConcurrent;
    }
    [self didChangeValueForKey:@"concurrent"];
}

- (BOOL)isConcurrent {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _asynchronous;
}

- (void)setAsynchronous:(BOOL)isAsynchronous {
    if (_asynchronous == isAsynchronous) {
        return;
    }
    [self willChangeValueForKey:@"asynchronous"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _asynchronous = isAsynchronous;
    }
    [self didChangeValueForKey:@"asynchronous"];
}

- (BOOL)isAsynchronous {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _asynchronous;
}

- (void)setReady:(BOOL)isReady {
    if (_ready == isReady) {
        return;
    }
    [self willChangeValueForKey:@"ready"];
    {
        std::lock_guard<std::mutex> lock(_statusMutex);
        _ready = isReady;
    }
    [self didChangeValueForKey:@"ready"];
}

- (BOOL)isReady {
    std::lock_guard<std::mutex> lock(_statusMutex);
    return _ready;
}

@end
