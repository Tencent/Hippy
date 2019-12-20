//
//  NSDictionary+HippyDictionaryDeepCopy.m
//  hippy
//
//  Created by ozonelmy on 2019/9/9.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "NSDictionary+HippyDictionaryDeepCopy.h"

@implementation NSDictionary (HippyDictionaryDeepCopy)
- (id)deepCopy {
    NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:[self count]];
    [self enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        id copiedKey = [key copy];
        id copiedObj = nil;
        if ([obj conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedObj = [obj deepCopy];
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

- (id)mutableDeepCopy {
    NSMutableDictionary *dictionary = [NSMutableDictionary dictionaryWithCapacity:[self count]];
    for (id key in self) {
        id copiedKey = [key mutableCopy];
        id obj = [self objectForKey:key];
        id copiedObj = nil;
        if ([obj conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedObj = [obj mutableDeepCopy];
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
