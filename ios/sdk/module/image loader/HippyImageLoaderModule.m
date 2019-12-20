//
//  HippyImageLoaderModule.m
//  Hippy
//
//  Created by mengyanluo on 2018/4/23.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "HippyImageLoaderModule.h"
#import "HippyImageCacheManager.h"
#import <UIKit/UIKit.h>
@implementation HippyImageLoaderModule

HIPPY_EXPORT_MODULE(ImageLoaderModule)

@synthesize bridge = _bridge;

HIPPY_EXPORT_METHOD(getSize:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
    UIImage *image = [[HippyImageCacheManager sharedInstance] loadImageFromCacheForURLString:urlString radius:0 isBlurredImage:nil];
    if (image) {
        NSDictionary *dic = @{@"width": @(image.size.width), @"height": @(image.size.height)};
        resolve(dic);
        return;
    }
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        NSError *error = [NSError errorWithDomain:@"ImageLoaderModuleDomain" code:1 userInfo:@{@"reason": @"url parse error"}];
        reject(@"1", @"url parse error", error);
        return;
    }
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
    NSURL *source_url = CFBridgingRelease(urlRef);
	[[[NSURLSession sharedSession] dataTaskWithURL:source_url completionHandler:^(NSData * _Nullable data, __unused NSURLResponse * _Nullable response, NSError * _Nullable error) {
		if (error) {
            NSError *error = [NSError errorWithDomain:@"ImageLoaderModuleDomain" code:1 userInfo:@{@"reason": @"url parse error"}];
            reject(@"2", @"url request error", error);
		} else {
            [[HippyImageCacheManager sharedInstance] setImageCacheData:data forURLString:urlString];
			UIImage *image = [UIImage imageWithData:data];
			if (image) {
				NSDictionary *dic = @{@"width": @(image.size.width), @"height": @(image.size.height)};
				resolve(dic);
			} else {
                NSError *error = [NSError errorWithDomain:@"ImageLoaderModuleDomain" code:2 userInfo:@{@"reason": @"image parse error"}];
                reject(@"2", @"image request error", error);
			}
		}
	}] resume];
}

HIPPY_EXPORT_METHOD(prefetch:(NSString *)urlString) {
    //这里后续需要使用自定义缓存，目前先使用系统缓存吧
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        return;
    }
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
    NSURL *source_url = CFBridgingRelease(urlRef);
    if (source_url) {
        [[[NSURLSession sharedSession] dataTaskWithURL:source_url completionHandler:^(NSData * _Nullable data, __unused NSURLResponse * _Nullable response, NSError * _Nullable error) {
            if (data) {
                [[HippyImageCacheManager sharedInstance] setImageCacheData:data forURLString:urlString];
            }
        }] resume];
    }
}

@end
