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

#import "HippyBridge+VFSLoader.h"
#import "HippyImageLoaderModule.h"
#import "NativeRenderDefaultImageProvider.h"
#import "NativeRenderUtils.h"

static NSString *const kImageLoaderModuleErrorDomain = @"kImageLoaderModuleErrorDomain";
static NSUInteger const ImageLoaderErrorParseError = 2;
static NSUInteger const ImageLoaderErrorRequestError = 3;

@interface HippyImageLoaderModule () {
    Class<NativeRenderImageProviderProtocol> _imageProviderClass;
}

@end

@implementation HippyImageLoaderModule

HIPPY_EXPORT_MODULE(ImageLoaderModule)

@synthesize bridge = _bridge;

// clang-format off
HIPPY_EXPORT_METHOD(getSize:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
    NSString *standardizeAssetUrlString = urlString;
    if ([self.bridge.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:forRenderContext:)]) {
        standardizeAssetUrlString = [self.bridge.frameworkProxy standardizeAssetUrlString:standardizeAssetUrlString forRenderContext:[self.bridge renderContext]];
    }
    NSURL *url = NativeRenderURLWithString(standardizeAssetUrlString, nil);
    [self.bridge loadContentsAsynchronouslyFromUrl:url params:nil completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (!error) {
            UIImage *retImage = nil;
            Class<NativeRenderImageProviderProtocol> imageProviderClass = [self imageProviderClass];
            if ([imageProviderClass canHandleData:data]) {
                id <NativeRenderImageProviderProtocol> imageProvider = [[(Class) imageProviderClass alloc] init];
                imageProvider.scale = [[UIScreen mainScreen] scale];
                imageProvider.imageDataPath = [url absoluteString];
                [imageProvider setImageData:data];
                retImage = [imageProvider image];
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
    NSString *standardizeAssetUrlString = urlString;
    if ([self.bridge.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:forRenderContext:)]) {
        standardizeAssetUrlString = [self.bridge.frameworkProxy standardizeAssetUrlString:standardizeAssetUrlString forRenderContext:[self.bridge renderContext]];
    }
    NSURL *url = NativeRenderURLWithString(standardizeAssetUrlString, nil);
    [self.bridge loadContentsAsynchronouslyFromUrl:url params:nil completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {

    }];
}
// clang-format on

- (Class<NativeRenderImageProviderProtocol>)imageProviderClass {
    if (!_imageProviderClass) {
        if ([self.bridge.frameworkProxy respondsToSelector:@selector(imageProviderClassForRenderContext:)]) {
            _imageProviderClass = [self.bridge.frameworkProxy imageProviderClassForRenderContext:self.bridge.renderContext];
        }
        if (!_imageProviderClass) {
            _imageProviderClass = [NativeRenderDefaultImageProvider class];
        }
    }
    return _imageProviderClass;
}

@end
