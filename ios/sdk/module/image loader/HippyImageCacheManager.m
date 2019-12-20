//
//  HippyImageCacheManager.m
//  Hippy
//
//  Created by mengyanluo on 2018/11/14.
//  Copyright © 2018 Tencent. All rights reserved.
//

#import "HippyImageCacheManager.h"
#import "HippyLog.h"
#import <pthread.h>
@interface HippyImageCacheManager() {
    NSCache *_cache;
}
@end
@implementation HippyImageCacheManager
+ (instancetype) sharedInstance {
    static dispatch_once_t onceToken;
    static HippyImageCacheManager *instance;
    dispatch_once(&onceToken, ^{
        instance = [[[self class] alloc] init];
    });
    return instance;
}
- (instancetype) init {
    self = [super init];
    if (self) {
        _cache = [[NSCache alloc] init];
        _cache.totalCostLimit = 10 * 1024 * 1024;
        _cache.name = @"com.tencent.HippyImageCache";
    }
    return self;
}
- (void) setImageCacheData:(NSData *)data forURLString:(NSString *)URLString {
    if (URLString && data) {
        [_cache setObject:data forKey:URLString cost:[data length]];
    }
}

- (NSData *) imageCacheDataForURLString:(NSString *)URLString {
    NSData *data = nil;
    if (URLString) {
        data = [_cache objectForKey:URLString];
    }
    return data;
}

- (void) setImage:(UIImage *)image forURLString:(NSString *)URLString blurRadius:(CGFloat)radius {
    if (URLString && image) {
        NSString *key = [URLString stringByAppendingFormat:@"%.1f", radius];
        [_cache setObject:image forKey:key cost:image.size.width * image.size.height * image.scale * image.scale];
    }
}

- (UIImage *) imageForURLString:(NSString *)URLString blurRadius:(CGFloat)radius {
    UIImage *retImage = nil;
    if (URLString && [URLString isKindOfClass:[NSString class]]) {
        NSString *key = [URLString stringByAppendingFormat:@"%.1f", radius];
        retImage = [_cache objectForKey:key];
    }
    return retImage;
}

@end

@implementation HippyImageCacheManager (ImageLoader)

- (UIImage *)loadImageFromCacheForURLString:(NSString *)URLString radius:(CGFloat)radius isBlurredImage:(BOOL *)isBlurredImage{
    if (isBlurredImage) {
        *isBlurredImage = NO;
    }
    UIImage *image = [self imageForURLString:URLString blurRadius:radius];
    if (nil == image) {
        NSData *data = [self imageCacheDataForURLString:URLString];
        if (data) {
            image = [UIImage imageWithData:data];
        }
    }
    else if (radius > __FLT_EPSILON__ && isBlurredImage) {
        *isBlurredImage = YES;
    }
    return image;
}

@end
