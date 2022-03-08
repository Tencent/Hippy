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
#import "HippyBridge.h"
#import "HippyImageLoaderModule.h"
#import "HippyImageCacheManager.h"
#import "HippyFrameworkProxy.h"
#import "HippyImageDataLoaderProtocol.h"
#import "HippyImageDataLoader.h"
#import "HippyUtils.h"
#import "HippyDefaultImageProvider.h"

@interface HippyImageLoaderModule () {
    id<HippyImageDataLoaderProtocol> _imageDataLoader;
    NSUInteger _sequence;
}

@end

@implementation HippyImageLoaderModule

HIPPY_EXPORT_MODULE(ImageLoaderModule)

@synthesize bridge = _bridge;

// clang-format off
HIPPY_EXPORT_METHOD(getSize:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
    //TODO complete this method
    id<HippyImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
    NSURL *url = HippyURLWithString(urlString, nil);
    NSUInteger sequence = _sequence++;
    [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
        
    } completion:^(NSUInteger seq, id result, NSURL *retURL, NSError *error) {
        UIImage *retImage = nil;
        if (!error) {
            if ([result isKindOfClass:[UIImage class]]) {
                retImage = result;
            }
            else if ([result isKindOfClass:[NSData class]]) {
                //TODO use custome image provider instead of HippyDefaultImageProvider
                id<HippyImageProviderProtocol> imageProvider = [[HippyDefaultImageProvider alloc] init];
                imageProvider.scale = [[UIScreen mainScreen] scale];
                imageProvider.imageDataPath = [retURL absoluteString];
                [imageProvider setImageData:(NSData *)result];
                retImage = [imageProvider image];
            }
            if (retImage) {
                NSDictionary *dic = @{@"width": @(retImage.size.width), @"height": @(retImage.size.height)};
                resolve(dic);
            }
            else {
                //TOOD standardize error
               NSError *error = [NSError errorWithDomain:@"ImageLoaderModuleDomain" code:2 userInfo:@{@"reason": @"image parse error"}];
               reject(@"2", @"image parse error", error);
            }
        }
        else {
            reject(@"2", @"image request error", error);
        }
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(prefetch:(NSString *)urlString) {
    NSData *uriData = [urlString dataUsingEncoding:NSUTF8StringEncoding];
    if (nil == uriData) {
        return;
    }
    
    if([[HippyImageCacheManager sharedInstance] imageCacheDataForURLString: urlString]) {
        return;
    }
    
    CFURLRef urlRef = CFURLCreateWithBytes(NULL, [uriData bytes], [uriData length], kCFStringEncodingUTF8, NULL);
    NSURL *source_url = CFBridgingRelease(urlRef);
    
    if (source_url) {
        
        typedef void (^HandleCompletedBlock)(BOOL, NSData *);
        HandleCompletedBlock completedBlock = ^void(BOOL cached, NSData *data) {
            if (data && !cached) {
               [[HippyImageCacheManager sharedInstance] setImageCacheData:data forURLString:urlString];
            }
        };
        
        if (_bridge.imageLoader && [_bridge.imageLoader respondsToSelector: @selector(loadImage:completed:)]) {
            [_bridge.imageLoader loadImage: source_url completed:^(NSData *data, NSURL *url, NSError *error, BOOL cached) {
                completedBlock(cached, data);
            }];
        } else {
            [[[NSURLSession sharedSession] dataTaskWithURL:source_url completionHandler:^(NSData * _Nullable data, __unused NSURLResponse * _Nullable response, NSError * _Nullable error) {
                completedBlock(NO, data);
            }] resume];
        }
        
    }
}
// clang-format on

- (id<HippyImageDataLoaderProtocol>)imageDataLoader {
    if (!_imageDataLoader) {
        if ([self.bridge.frameworkProxy respondsToSelector:@selector(imageDataLoader)]) {
            _imageDataLoader = [self.bridge.frameworkProxy imageDataLoader];
        }
        if (!_imageDataLoader) {
            _imageDataLoader = [[HippyImageDataLoader alloc] init];
        }
    }
    return _imageDataLoader;
}

@end
