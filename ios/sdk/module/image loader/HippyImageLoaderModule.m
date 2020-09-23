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

#import <UIKit/UIKit.h>
#import "HippyImageLoaderModule.h"
#import "HippyImageCacheManager.h"
#import "HippyImageProviderProtocol.h"

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
    __weak __typeof(self) weakSelf = self;
	[[[NSURLSession sharedSession] dataTaskWithURL:source_url completionHandler:^(NSData * _Nullable data, __unused NSURLResponse * _Nullable response, NSError * _Nullable error) {
        __typeof(weakSelf) strongSelf = weakSelf;
		if (error) {
            NSError *error = [NSError errorWithDomain:@"ImageLoaderModuleDomain" code:1 userInfo:@{@"reason": @"url parse error"}];
            reject(@"2", @"url request error", error);
		} else {
            [[HippyImageCacheManager sharedInstance] setImageCacheData:data forURLString:urlString];
            Class<HippyImageProviderProtocol> ipClass = imageProviderClassFromBridge(data, strongSelf.bridge);
            id<HippyImageProviderProtocol> instance = [ipClass imageProviderInstanceForData:data];
            UIImage *image = [instance image];
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
