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

@interface HippyBundleExecutionOperation () {
    dispatch_block_t _block;
    BOOL _cancelled;
    BOOL _executing;
    BOOL _finished;
    BOOL _asynchronous;
    BOOL _ready;
    NSMutableSet<NSOperation *> *_dependencies;
    
    dispatch_semaphore_t _statusSem;
    dispatch_semaphore_t _dependencySem;
}

@end

@implementation HippyBundleExecutionOperation

- (instancetype)initWithBlock:(dispatch_block_t)block queue:(NSOperationQueue *)queue {
    self = [super init];
    if (self) {
        _block = [block copy];
        _dependencies = [NSMutableSet setWithCapacity:8];
        _statusSem = dispatch_semaphore_create(1);
        _dependencySem = dispatch_semaphore_create(1);
        self.ready = YES;
    }
    return self;
}

- (void)dealloc {
    dispatch_semaphore_wait(_dependencySem, DISPATCH_TIME_FOREVER);
    for (NSOperation *op in _dependencies) {
        [op removeObserver:self forKeyPath:@"finished" context:NULL];
    }
    dispatch_semaphore_signal(_dependencySem);
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
        dispatch_semaphore_wait(_dependencySem, DISPATCH_TIME_FOREVER);
        [_dependencies addObject:op];
        dispatch_semaphore_signal(_dependencySem);
    }
    if (![op isFinished]) {
        self.ready = NO;
    }
    [op addObserver:self forKeyPath:@"finished" options:NSKeyValueObservingOptionNew context:NULL];
}

- (void)removeDependency:(NSOperation *)op {
    dispatch_semaphore_wait(_dependencySem, DISPATCH_TIME_FOREVER);
    if ([_dependencies containsObject:op]) {
        [_dependencies removeObject:op];
        [op removeObserver:self forKeyPath:@"finished" context:NULL];
    }
    dispatch_semaphore_signal(_dependencySem);
}

- (NSArray<NSOperation *> *)dependencies {
    dispatch_semaphore_wait(_dependencySem, DISPATCH_TIME_FOREVER);
    NSArray<NSOperation *> *objects = [_dependencies allObjects];
    dispatch_semaphore_signal(_dependencySem);
    return objects;
}

- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary<NSKeyValueChangeKey,id> *)change context:(void *)context {
    if ([keyPath isEqualToString:@"finished"]) {
        [self checkForReadyStatus];
    }
}

- (void)checkForReadyStatus {
    dispatch_semaphore_wait(_dependencySem, DISPATCH_TIME_FOREVER);
    BOOL status = YES;
    for (NSOperation *op in _dependencies) {
        if (![op isFinished]) {
            status = NO;
            break;
        }
    }
    self.ready = status;
    dispatch_semaphore_signal(_dependencySem);
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
        dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
        _cancelled = cancelled;
        dispatch_semaphore_signal(_statusSem);
    }
    [self didChangeValueForKey:@"cancelled"];
}

- (BOOL)isCancelled {
    dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
    BOOL cancel = _cancelled;
    dispatch_semaphore_signal(_statusSem);
    return cancel;
}

- (void)setExecuting:(BOOL)isExecuting {
    if (_executing == isExecuting) {
        return;
    }
    [self willChangeValueForKey:@"executing"];
    {
        dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
        _executing = isExecuting;
        dispatch_semaphore_signal(_statusSem);
    }
    [self didChangeValueForKey:@"executing"];
}

- (BOOL)isExecuting {
    dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
    BOOL executing = _executing;
    dispatch_semaphore_signal(_statusSem);
    return executing;
}

- (void)setFinished:(BOOL)isFinished {
    if (_finished == isFinished) {
        return;
    }
    [self willChangeValueForKey:@"finished"];
    {
        dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
        _finished = isFinished;
        dispatch_semaphore_signal(_statusSem);
    }
    [self didChangeValueForKey:@"finished"];
}

- (BOOL)isFinished {
    dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
    BOOL finished = _finished;
    dispatch_semaphore_signal(_statusSem);
    return finished;
}

- (void)setConcurrent:(BOOL)isConcurrent {
    if (_asynchronous == isConcurrent) {
        return;
    }
    [self willChangeValueForKey:@"concurrent"];
    {
        dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
        _asynchronous = isConcurrent;
        dispatch_semaphore_signal(_statusSem);
    }
    [self didChangeValueForKey:@"concurrent"];
}

- (BOOL)isConcurrent {
    dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
    BOOL asynchronous = _asynchronous;
    dispatch_semaphore_signal(_statusSem);
    return asynchronous;
}

- (void)setAsynchronous:(BOOL)isAsynchronous {
    if (_asynchronous == isAsynchronous) {
        return;
    }
    [self willChangeValueForKey:@"asynchronous"];
    {
        dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
        _asynchronous = isAsynchronous;
        dispatch_semaphore_signal(_statusSem);
    }
    [self didChangeValueForKey:@"asynchronous"];
}

- (BOOL)isAsynchronous {
    dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
    BOOL asynchronous = _asynchronous;
    dispatch_semaphore_signal(_statusSem);
    return asynchronous;
}

- (void)setReady:(BOOL)isReady {
    if (_ready == isReady) {
        return;
    }
    [self willChangeValueForKey:@"ready"];
    {
        dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
        _ready = isReady;
        dispatch_semaphore_signal(_statusSem);
    }
    [self didChangeValueForKey:@"ready"];
}

- (BOOL)isReady {
    dispatch_semaphore_wait(_statusSem, DISPATCH_TIME_FOREVER);
    BOOL ready = _ready;
    dispatch_semaphore_signal(_statusSem);
    return ready;
}

@end
