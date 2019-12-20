//
//  NSArray+HippyArrayDeepCopy.m
//  hippy
//
//  Created by ozonelmy on 2019/9/9.
//  Copyright © 2019 Tencent. All rights reserved.
//

#import "NSArray+HippyArrayDeepCopy.h"

@implementation NSArray (HippyArrayDeepCopy)
- (id)deepCopy {
    NSMutableArray *array = [NSMutableArray arrayWithCapacity:[self count]];
    for (id item in self) {
        id copiedItem = nil;
        if ([item conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedItem = [item deepCopy];
        }
        else if ([item respondsToSelector:@selector(copy)]) {
            copiedItem = [item copy];
        }
        else {
            copiedItem = item;
        }
        [array addObject:copiedItem];
    }
    return [NSArray arrayWithArray:array];
}

- (id)mutableDeepCopy {
    NSMutableArray *array = [NSMutableArray arrayWithCapacity:[self count]];
    for (id item in self) {
        id copiedItem = nil;
        if ([item conformsToProtocol:@protocol(HippyDeepCopyProtocol)]) {
            copiedItem = [item mutableDeepCopy];
        }
        else if ([item conformsToProtocol:@protocol(NSMutableCopying)]) {
            copiedItem = [item mutableCopy];
        }
        else if ([item conformsToProtocol:@protocol(NSCopying)]) {
            copiedItem = [item copy];
        }
        else {
            copiedItem = item;
        }
        [array addObject:copiedItem];
    }
    return array;
}
@end
