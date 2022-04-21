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
#import "RenderDefines.h"

static NSString *const kImageLoaderModuleErrorDomain = @"kImageLoaderModuleErrorDomain";
static NSUInteger const ImageLoaderErrorParseError = 2;
static NSUInteger const ImageLoaderErrorRequestError = 3;

@interface HippyImageLoaderModule () {
    id<HippyImageDataLoaderProtocol> _imageDataLoader;
    Class<HippyImageProviderProtocol> _imageProviderClass;
    NSUInteger _sequence;
}

@end

@implementation HippyImageLoaderModule

HIPPY_EXPORT_MODULE(ImageLoaderModule)

@synthesize bridge = _bridge;

// clang-format off
HIPPY_EXPORT_METHOD(getSize:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
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
                Class<HippyImageProviderProtocol> imageProviderClass = [self imageProviderClass];
                if ([imageProviderClass canHandleData:(NSData *)result]) {
                    id<HippyImageProviderProtocol> imageProvider = [[(Class)imageProviderClass alloc] init];
                    imageProvider.scale = [[UIScreen mainScreen] scale];
                    imageProvider.imageDataPath = [retURL absoluteString];
                    [imageProvider setImageData:(NSData *)result];
                    retImage = [imageProvider image];
                }
            }
            if (retImage) {
                NSDictionary *dic = @{@"width": @(retImage.size.width), @"height": @(retImage.size.height)};
                resolve(dic);
            }
            else {
                NSError *error = [NSError errorWithDomain:kImageLoaderModuleErrorDomain
                                                    code:ImageLoaderErrorParseError userInfo:@{@"reason": @"image parse error"}];
                NSString *errorKey = [NSString stringWithFormat:@"%lu", ImageLoaderErrorParseError];
                reject(errorKey, @"image parse error", error);
            }
        }
        else {
            NSString *errorKey = [NSString stringWithFormat:@"%lu", ImageLoaderErrorRequestError];
            reject(errorKey, @"image request error", error);
        }
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(prefetch:(NSString *)urlString) {
    id<HippyImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
    NSURL *url = HippyURLWithString(urlString, nil);
    NSUInteger sequence = _sequence++;
    [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
        
    } completion:^(NSUInteger seq, id ret, NSURL *url, NSError *error) {
        
    }];
}
// clang-format on

- (id<HippyImageDataLoaderProtocol>)imageDataLoader {
    if (!_imageDataLoader) {
        if ([self.bridge.frameworkProxy respondsToSelector:@selector(imageDataLoaderForRenderContext:)]) {
            _imageDataLoader = [self.bridge.frameworkProxy imageDataLoaderForRenderContext:self.bridge.renderContext];
        }
        if (!_imageDataLoader) {
            _imageDataLoader = [[HippyImageDataLoader alloc] init];
        }
    }
    return _imageDataLoader;
}

- (Class<HippyImageProviderProtocol>)imageProviderClass {
    if (!_imageProviderClass) {
        if ([self.bridge.frameworkProxy respondsToSelector:@selector(imageProviderClassForRenderContext:)]) {
            _imageProviderClass = [self.bridge.frameworkProxy imageProviderClassForRenderContext:self.bridge.renderContext];
        }
        if (!_imageProviderClass) {
            _imageProviderClass = [HippyDefaultImageProvider class];
        }
    }
    return _imageProviderClass;
}

@end
