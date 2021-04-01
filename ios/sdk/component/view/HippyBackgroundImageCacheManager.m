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

#import "HippyBackgroundImageCacheManager.h"
#import "HippyUtils.h"
#import "HippyBridge.h"
#import "HippyImageViewCustomLoader.h"
#import "HippyUtils.h"

@interface HippyBackgroundImageCacheManager ()

@end

@implementation HippyBackgroundImageCacheManager

- (BOOL)canHandleImageURL:(NSString *)URLString {
    id<HippyImageViewCustomLoader> imageLoader = self.bridge.imageLoader;
    if (imageLoader && [imageLoader respondsToSelector:@selector(canHandleImageURL:)]) {
        return [imageLoader canHandleImageURL:HippyURLWithString(URLString, nil)];
    } else {
        if ([URLString hasPrefix:@"http://"] || [URLString hasPrefix:@"https://"] || [URLString hasPrefix:@"data:image/"]) {
            return YES;
        }
    }
    return NO;
}

- (void)imageWithUrl:(NSString *)uri completionHandler:(HippyBackgroundImageCompletionHandler)completionHandler {
    if (!completionHandler) {
        return;
    }
    if (!uri) {
        completionHandler(nil, HippyErrorWithMessage(@"background image url nil"));
        return;
    }
    NSURL *imageURL = HippyURLWithString(uri, nil);
    if (!imageURL) {
        NSString *errorString = [NSString stringWithFormat:@"background image url convert error:%@", uri];
        NSError *error = HippyErrorWithMessageAndModuleName(errorString, self.bridge.moduleName);
        completionHandler(nil, error);
        return;
    }
    id<HippyImageViewCustomLoader> imageLoader = self.bridge.imageLoader;
    if (imageLoader) {
        [imageLoader loadImage:imageURL completed:^(NSData *imgData, NSURL *url, NSError *error, BOOL cached) {
            UIImage *image = [UIImage imageWithData:imgData scale:[UIScreen mainScreen].scale];
            completionHandler(image, error);
        }];
    } else {
        if ([uri hasPrefix:@"http://"] || [uri hasPrefix:@"https://"]) {
            [self loadHTTPURL:imageURL completionHandler:completionHandler];
        } else if ([uri hasPrefix:@"data:image/"]) {
            [self loadBase64URL:imageURL completionHandler:completionHandler];
        }
        else {
            completionHandler(nil, nil);
        }
    }
}

- (void)loadHTTPURL:(NSURL *)URL completionHandler:(HippyBackgroundImageCompletionHandler)completionHandler {
    NSURLRequest *request = [NSURLRequest requestWithURL:URL cachePolicy:NSURLRequestUseProtocolCachePolicy timeoutInterval:10];
    NSURLSession *session = [NSURLSession sharedSession];
    NSURLSessionDataTask *dataTask =
        [session dataTaskWithRequest:request
                   completionHandler:^(NSData *_Nullable data, NSURLResponse *_Nullable response, NSError *_Nullable error) {
                       if (data) {
                           CGFloat scale = [UIScreen mainScreen].scale;
                           UIImage *originImage = [UIImage imageWithData:data scale:scale];
                           if (originImage) {
                               completionHandler(originImage, nil);
                           } else {
                               NSString *errorString = [NSString stringWithFormat:@"image decode error:%@", [URL absoluteString]];
                               NSError *error = HippyErrorWithMessageAndModuleName(errorString, self.bridge.moduleName);
                               completionHandler(nil, error);
                           }
                       } else {
                           completionHandler(nil, error);
                       }
                   }];
    [dataTask resume];
}

- (void)loadBase64URL:(NSURL *)base64URL completionHandler:(HippyBackgroundImageCompletionHandler)completionHandler {
    NSData *imgData = [NSData dataWithContentsOfURL:base64URL];
    if (imgData) {
        UIImage *image = [UIImage imageWithData:imgData scale:[UIScreen mainScreen].scale];
        if (image) {
            completionHandler(image, nil);
        } else {
            NSString *errorString = [NSString stringWithFormat:@"image decode error for base64URL"];
            NSError *error = HippyErrorWithMessageAndModuleName(errorString, self.bridge.moduleName);
            completionHandler(nil, error);
        }
    } else {
        NSString *errorString = [NSString stringWithFormat:@"data convert error for base64URL"];
        NSError *error = HippyErrorWithMessageAndModuleName(errorString, self.bridge.moduleName);
        completionHandler(nil, error);
    }
}

@end
