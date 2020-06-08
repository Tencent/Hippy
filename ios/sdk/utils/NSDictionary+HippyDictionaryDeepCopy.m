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

#import "NSDictionary+HippyDictionaryDeepCopy.h"

@implementation NSDictionary (HippyDictionaryDeepCopy)
- (id)hippyDeepCopy {
    NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:[self count]];
    [self enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        id copiedKey = [key copy];
        id copiedObj = nil;
        if ([obj conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedObj = [obj hippyDeepCopy];
        }
        else if ([obj respondsToSelector:@selector(copy)]) {
            copiedObj = [obj copy];
        }
        else {
            copiedObj = obj;
        }
        [dictionary setObject:copiedObj forKey:copiedKey];
    }];
    return [NSDictionary dictionaryWithDictionary:dictionary];
}

- (id)hippyMutableDeepCopy {
    NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:[self count]];
    for (id key in self) {
        id copiedKey = [key mutableCopy];
        id obj = [self objectForKey:key];
        id copiedObj = nil;
        if ([obj conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedObj = [obj hippyMutableDeepCopy];
        }
        else if ([obj conformsToProtocol:@protocol(NSMutableCopying)]) {
            copiedObj = [obj mutableCopy];
        }
        else if ([obj conformsToProtocol:@protocol(NSCopying)]) {
            copiedObj = [obj copy];
        }
        else {
            copiedObj = obj;
        }
        [dictionary setObject:copiedObj forKey:copiedKey];
    }
    return dictionary;
}
@end
