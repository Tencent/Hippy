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

#import "HippyReusableNodeCache.h"
#import "HippyVirtualNode.h"

@interface HippyReusableNodeCache () {
    NSMutableDictionary<NSString *, NSMutableSet<HippyVirtualNode *> *> *_cache;
}

@end

@implementation HippyReusableNodeCache

- (instancetype)init {
    self = [super init];
    if (self) {
        _cache = [[NSMutableDictionary  alloc] initWithCapacity:8];
    }
    return self;
}

- (void)enqueueItemNode:(HippyVirtualNode *)node forIdentifier:(NSString *)identifier {
    NSMutableSet *set = _cache[identifier];
    if (!set) {
        set = [NSMutableSet set];
        _cache[identifier] = set;
    }
    [set addObject:node];
}

- (HippyVirtualNode *)dequeueItemNodeForIdentifier:(NSString *)identifier {
    NSMutableSet *set = _cache[identifier];
    HippyVirtualNode *cell = [set anyObject];
    if (cell) {
        [set removeObject:cell];
    }
    return cell;
}

- (BOOL)queueContainsNode:(HippyVirtualNode *)node forIdentifier:(NSString *)identifier {
    NSSet *set = _cache[identifier];
    return [set containsObject:node];
}

- (BOOL)removeNode:(HippyVirtualNode *)node forIdentifier:(NSString *)identifier {
    NSMutableSet *set = _cache[identifier];
    if ([set containsObject:node]) {
        [set removeObject:node];
        return YES;
    }
    return NO;
}

@end
