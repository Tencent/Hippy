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

#import "HippyReusableViewPool.h"
#import "HippyAssert.h"
#import "UIView+Hippy.h"

@interface HippyReusableViewPool () {
    NSMutableDictionary<NSString *, NSHashTable<__kindof UIView *> *> *_viewCache;
}

@end

@implementation HippyReusableViewPool

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

- (void)clearCache {
    HippyAssert([NSThread mainThread], @"clearing cache must be in main thread");
    [_viewCache removeAllObjects];
}

- (NSMutableDictionary<NSString *, NSHashTable<__kindof UIView *> *> *)viewCache {
    if (!_viewCache) {
        _viewCache = [NSMutableDictionary dictionaryWithCapacity:8];
    }
    return _viewCache;
}

- (NSHashTable<__kindof UIView *> *)viewSetForKey:(NSString *)key {
    NSHashTable<__kindof UIView *> *set = [[self viewCache] objectForKey:key];
    if (!set) {
        set = [NSHashTable weakObjectsHashTable];
        [[self viewCache] setObject:set forKey:key];
    }
    return set;
}

- (void)addView:(__kindof UIView *)view forKey:(NSString *)key {
    if (view && key) {
        [[self viewSetForKey:key] addObject:view];
    }
}

- (void)addHippyViewRecursively:(__kindof UIView *)view {
    NSNumber *tag = [view hippyTag];
    if (tag && [tag integerValue] > 0) {
        NSString *viewName = [view viewName];
        if (viewName) {
            [self addView:view forKey:viewName];
        }
    }
    for (UIView *subview in [view hippySubviews]) {
        [self addHippyViewRecursively:subview];
    }
    [view resetHippySubviews];
}

- (__kindof UIView *)popViewForKey:(NSString *)key {
    if (key) {
        NSHashTable<__kindof UIView *> *viewSet = [self viewSetForKey:key];
        UIView *view = [viewSet anyObject];
        if (view) {
            [viewSet removeObject:view];
        }
        return view;
    }
    return nil;
}

@end
