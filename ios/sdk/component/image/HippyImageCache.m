//
//  HippyImageCache.m
//  Hippy
//
//  Created by mengyanluo on 2018/11/1.
//  Copyright © 2018 Tencent. All rights reserved.
//

#import "HippyImageCache.h"

@interface HippyImageCache ()
@property (nonatomic, strong) NSCache *imageCache;
@end

@implementation HippyImageCache

+ (instancetype) sharedInstance {
    static HippyImageCache *cache = nil;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        cache = [[[self class] alloc] init];
    });
    return cache;
}

- (instancetype) init {
    self = [super init];
    if (self) {
        _imageCache = [[NSCache alloc] init];
        _imageCache.totalCostLimit = 1024 * 1024 * 5;
    }
    return self;
}

@end
