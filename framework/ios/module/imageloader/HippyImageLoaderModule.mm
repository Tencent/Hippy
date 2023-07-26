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
#import "HPToolUtils.h"
#import "HippyDefines.h"

static NSString *const kImageLoaderModuleErrorDomain = @"kImageLoaderModuleErrorDomain";
static NSUInteger const ImageLoaderErrorParseError = 2;
static NSUInteger const ImageLoaderErrorRequestError = 3;
static NSUInteger const ImageLoaderErrorNoProviderError = 4;

@interface HippyImageLoaderModule () {
}

@end

@implementation HippyImageLoaderModule

HIPPY_EXPORT_MODULE(ImageLoaderModule)

@synthesize bridge = _bridge;

- (id<HPImageProviderProtocol>)imageProviderForData:(NSData *)data {
    NSArray<Class<HPImageProviderProtocol>> *providers = [self.bridge imageProviderClasses];
    for (Class<HPImageProviderProtocol> cls in providers) {
        if ([cls canHandleData:data]) {
            id<HPImageProviderProtocol> object = [[(Class)cls alloc] init];
            [object setImageData:data];
            return object;
        }
    }
    return nil;
}

HIPPY_EXPORT_METHOD(getSize:(NSString *)urlString resolver:(HippyPromiseResolveBlock)resolve rejecter:(HippyPromiseRejectBlock)reject) {
    [self.bridge loadContentsAsynchronouslyFromUrl:urlString
                                            method:@"Get"
                                            params:nil
                                              body:nil
                                             queue:nil
                                          progress:nil
                                 completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
        if (!error) {
            id<HPImageProviderProtocol> imageProvider = [self imageProviderForData:data];
            if (!imageProvider) {
                NSError *error = [NSError errorWithDomain:kImageLoaderModuleErrorDomain
                                                     code:ImageLoaderErrorParseError userInfo:@{@"reason": @"no image provider error"}];
                NSString *errorKey = [NSString stringWithFormat:@"%lu", ImageLoaderErrorNoProviderError];
                reject(errorKey, @"image parse error", error);
                return;
            }
            imageProvider.imageDataPath = urlString;
            [imageProvider setImageData:data];
            UIImage *retImage = [imageProvider image];
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

HIPPY_EXPORT_METHOD(prefetch:(NSString *)urlString) {
    [self.bridge loadContentsAsynchronouslyFromUrl:urlString
                                            method:@"Get"
                                            params:nil
                                              body:nil
                                             queue:nil
                                          progress:nil
                                 completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {

    }];
}

@end
