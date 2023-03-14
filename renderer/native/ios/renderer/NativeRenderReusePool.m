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

#import "NativeRenderReusePool.h"
#import "HPAsserts.h"
#import "UIView+NativeRender.h"
#import "UIView+NRReuse.h"

@interface NativeRenderReusePool () {
    NSMutableDictionary<NSString *, NSHashTable<__kindof UIView *> *> *_viewCache;
}

@end

@implementation NativeRenderReusePool

- (instancetype)init {
    self = [super init];
    if (self) {
        [[NSNotificationCenter defaultCenter] addObserver:self
                                                 selector:@selector(clearCache)
                                                     name:UIApplicationDidReceiveMemoryWarningNotification
                                                   object:nil];
    }
    return self;
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSMutableDictionary<NSString *, NSHashTable<__kindof UIView *> *> *)viewCache {
    if (!_viewCache) {
        _viewCache = [NSMutableDictionary dictionaryWithCapacity:8];
    }
    return _viewCache;
}

- (NSHashTable<__kindof UIView *> *)viewHashTableForKey:(NSString *)key {
    if (!key) {
        return nil;
    }
    NSHashTable<__kindof UIView *> *hashTable = [[self viewCache] objectForKey:key];
    if (!hashTable) {
        hashTable = [NSHashTable weakObjectsHashTable];
        [[self viewCache] setObject:hashTable forKey:key];
    }
    return hashTable;
}

- (void)addView:(__kindof UIView *)view forKey:(NSString *)key {
    HPAssertMainQueue();
    if (view && key) {
        [[self viewHashTableForKey:key] addObject:view];
    }
}

- (void)dismemberNativeRenderViewTree:(__kindof UIView *)view {
    HPAssertMainQueue();
    NSNumber *tag = [view componentTag];
    if (tag && [tag integerValue] > 0) {
        NSString *viewName = [view viewName];
        if (viewName) {
            [self addView:view forKey:viewName];
        }
    }
    for (UIView *subview in [view subcomponents]) {
        [self dismemberNativeRenderViewTree:subview];
    }
    [view prepareForReuse];
    [view resetNativeRenderSubviews];
}

- (__kindof UIView *)popViewForKey:(NSString *)key {
    if (!key) {
        return nil;
    }
    HPAssertMainQueue();
    NSHashTable<__kindof UIView *> *views = [self viewHashTableForKey:key];
    __kindof UIView *view = [views anyObject];
    if (view) {
        [views removeObject:view];
    }
    return view;
}

- (void)clearCache {
    [_viewCache removeAllObjects];
}

@end
