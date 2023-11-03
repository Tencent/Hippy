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

#import "HippyPageCache.h"
#import <hippy/HippyRootView.h>

@implementation HippyPageCache

- (BOOL)isEqual:(id)object {
    if (![object isKindOfClass:[self class]]) {
        return NO;
    }
    return _hippyBridge == [object hippyBridge];
}

- (NSUInteger)hash {
    return [(NSObject *)_hippyBridge hash] + [_rootView hash];
}

@end

@interface HippyPageCacheManager () {
    NSMutableArray<HippyPageCache *> *_pageCaches;
    NSHashTable<id<HippyPageCacheManagerObserverProtocol>> *_observers;
}

@end

@implementation HippyPageCacheManager

+ (instancetype)defaultPageCacheManager {
    static dispatch_once_t onceToken;
    static HippyPageCacheManager *manager = nil;
    dispatch_once(&onceToken, ^{
        manager = [[HippyPageCacheManager alloc] init];
    });
    return manager;
}

- (instancetype)init {
    self = [super init];
    if (self) {
        _pageCaches = [NSMutableArray arrayWithCapacity:8];
        _observers = [NSHashTable weakObjectsHashTable];
    }
    return self;
}

- (NSArray<HippyPageCache *> *)pageCaches {
    return [_pageCaches copy];
}

- (void)addPageCache:(HippyPageCache *)cache {
    NSUInteger index = [_pageCaches indexOfObject:cache];
    if (NSNotFound != index) {
        [_pageCaches replaceObjectAtIndex:index withObject:cache];
        for (id<HippyPageCacheManagerObserverProtocol> observer in _observers) {
            [observer pageCacheManager:self didUpdatePageCache:cache atIndex:index];
        }
    }
    else {
        [_pageCaches addObject:cache];
        for (id<HippyPageCacheManagerObserverProtocol> observer in _observers) {
            [observer pageCacheManager:self didAddPageCache:cache];
        }
    }
}

- (void)removePageCache:(HippyPageCache *)cache {
    NSUInteger index = [_pageCaches indexOfObject:cache];
    for (id<HippyPageCacheManagerObserverProtocol> observer in _observers) {
        [observer pageCacheManager:self willRemovePageCache:cache atIndex:index];
    }
    [_pageCaches removeObject:cache];
}

- (void)removePageCacheAtIndex:(NSUInteger)index {
    HippyPageCache *cache = [_pageCaches objectAtIndex:index];
    [self removePageCache:cache];
}

- (void)removeAllPageCaches {
    NSArray<HippyPageCache *> *caches = [self pageCaches];
    for (HippyPageCache *cache in caches) {
        [self removePageCache:cache];
    }
}

- (HippyPageCache *)pageCacheAtIndex:(NSUInteger)index {
    return [_pageCaches objectAtIndex:index];
}

- (void)addObserver:(id<HippyPageCacheManagerObserverProtocol>)observer {
    [_observers addObject:observer];
}

- (void)removeObserver:(id<HippyPageCacheManagerObserverProtocol>)observer {
    [_observers removeObject:observer];
}

@end
