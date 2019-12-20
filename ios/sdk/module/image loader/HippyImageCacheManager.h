//
//  HippyImageCacheManager.h
//  Hippy
//
//  Created by mengyanluo on 2018/11/14.
//  Copyright © 2018 Tencent. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIImage.h>

@interface HippyImageCacheManager : NSObject
+ (instancetype) sharedInstance;
- (void) setImageCacheData:(NSData *)data forURLString:(NSString *)URLString;
- (NSData *) imageCacheDataForURLString:(NSString *)URLString;
- (void) setImage:(UIImage *)image forURLString:(NSString *)URLString blurRadius:(CGFloat)radius;
- (UIImage *) imageForURLString:(NSString *)URLString blurRadius:(CGFloat)radius;
@end

@interface HippyImageCacheManager (ImageLoader)

- (UIImage *)loadImageFromCacheForURLString:(NSString *)URLString radius:(CGFloat)radius isBlurredImage:(BOOL *)isBlurredImage;

@end
