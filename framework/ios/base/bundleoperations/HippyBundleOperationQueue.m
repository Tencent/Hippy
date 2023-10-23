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

#import "HippyBundleOperationQueue.h"

@interface HippyBundleOperationQueue () {
    NSMutableArray *_ops;
}

@end

@implementation HippyBundleOperationQueue

- (instancetype)init {
    self = [super init];
    if (self) {
        _ops = [NSMutableArray array];
    }
    return self;
}

- (void)addOperations:(NSArray<NSOperation *> *)ops {
    if (ops) {
        for (NSOperation *op in ops) {
            if ([op isReady]) {
                [op addObserver:self forKeyPath:@"finished" options:NSKeyValueObservingOptionNew context:NULL];
                @synchronized (self) {
                    [_ops addObject:op];
                }
                [op start];
            } else if ([op isCancelled]) {
                // do nothing
            } else {
                [op addObserver:self forKeyPath:@"ready" options:NSKeyValueObservingOptionNew context:NULL];
                [op addObserver:self forKeyPath:@"finished" options:NSKeyValueObservingOptionNew context:NULL];
                @synchronized (self) {
                    [_ops addObject:op];
                }
            }
        }
    }
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary<NSKeyValueChangeKey,id> *)change
                       context:(void *)context {
    NSNumber *value = [change objectForKey:NSKeyValueChangeNewKey];
    if (!value) {
        return;
    }
    NSOperation *op = (NSOperation *)object;
    if (![op isKindOfClass:[NSOperation class]]) {
        return;
    }
    BOOL status = [value boolValue];
    if ([keyPath isEqualToString:@"ready"] && status) {
        [op removeObserver:self forKeyPath:@"ready" context:NULL];
        [op start];
    } else if ([keyPath isEqualToString:@"finished"] && status) {
        @synchronized (self) {
            [_ops removeObject:object];
        }
        [op removeObserver:self forKeyPath:@"finished" context:NULL];
    }
}

@end
