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

#import "NSArray+HippyArrayDeepCopy.h"

@implementation NSArray (HippyArrayDeepCopy)
- (id)hippyDeepCopy {
    NSMutableArray *array = [NSMutableArray arrayWithCapacity:[self count]];
    for (id item in self) {
        id copiedItem = nil;
        if ([item conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedItem = [item hippyDeepCopy];
        } else if ([item respondsToSelector:@selector(copy)]) {
            copiedItem = [item copy];
        } else {
            copiedItem = item;
        }
        [array addObject:copiedItem];
    }
    return [NSArray arrayWithArray:array];
}

- (id)hippyMutableDeepCopy {
    NSMutableArray *array = [NSMutableArray arrayWithCapacity:[self count]];
    for (id item in self) {
        id copiedItem = nil;
        if ([item conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedItem = [item hippyMutableDeepCopy];
        } else if ([item conformsToProtocol:@protocol(NSMutableCopying)]) {
            copiedItem = [item mutableCopy];
        } else if ([item conformsToProtocol:@protocol(NSCopying)]) {
            copiedItem = [item copy];
        } else {
            copiedItem = item;
        }
        [array addObject:copiedItem];
    }
    return array;
}
@end
