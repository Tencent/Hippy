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

#import "HippyImageViewManager.h"
#import "HippyImageView.h"
#import "HippyConvert.h"
#import "HippyImageDataLoader.h"
#import "HippyDefaultImageProvider.h"
#import "objc/runtime.h"
#import "HippyFrameworkProxy.h"
#import "HippyUtils.h"
#import "UIView+Sequence.h"
#import <UIKit/UIKit.h>

@interface HippyImageViewManager () {
    id<HippyImageDataLoaderProtocol> _imageDataLoader;
    NSUInteger _sequence;
}

@end

@implementation HippyImageViewManager

HIPPY_EXPORT_VIEW_PROPERTY(blurRadius, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(capInsets, UIEdgeInsets)
HIPPY_EXPORT_VIEW_PROPERTY(resizeMode, HippyResizeMode)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadStart, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onProgress, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onError, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPartialLoad, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoad, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(downSample, BOOL)

HIPPY_CUSTOM_VIEW_PROPERTY(source, NSArray, HippyImageView) {
    NSArray *pathSources = [HippyConvert NSArray:json];
    if ([pathSources isKindOfClass:[NSArray class]]) {
        NSDictionary *dicSource = [pathSources firstObject];
        NSString *path = dicSource[@"uri"];
        if ([self.renderContext.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:)]) {
            path = [self.renderContext.frameworkProxy standardizeAssetUrlString:path];
        }
        id<HippyImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
        __weak HippyImageView *weakView = view;
        NSURL *url = HippyURLWithString(path, nil);
        NSUInteger sequence = _sequence++;
        weakView.sequence = sequence;
        [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
        } completion:^(NSUInteger seq, id result, NSURL *url, NSError *error) {
            if (!error && weakView) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    if (weakView) {
                        HippyImageView *strongView = weakView;
                        NSUInteger viewSeq = strongView.sequence;
                        if (seq == viewSeq) {
                            if ([result isKindOfClass:[UIImage class]]) {
                                [strongView updateImage:(UIImage *)result];
                            }
                            else if ([result isKindOfClass:[NSData class]]) {
                                Class cls = [self imageProviderClass];
                                id<HippyImageProviderProtocol> imageProvider = [[cls alloc] init];
                                imageProvider.scale = [[UIScreen mainScreen] scale];
                                imageProvider.imageDataPath = path;
                                [imageProvider setImageData:(NSData *)result];
                                [strongView setImageProvider:imageProvider];
                                [strongView reloadImage];
                            }
                        }
                    }
                });
            }
        }];
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(tintColor, UIColor, HippyImageView) {
    view.tintColor = [HippyConvert UIColor:json] ?: defaultView.tintColor;
    view.renderingMode = json ? UIImageRenderingModeAlwaysTemplate : defaultView.renderingMode;
}

HIPPY_CUSTOM_VIEW_PROPERTY(defaultSource, NSString, HippyImageView) {
    NSString *source = [HippyConvert NSString:json];
    if ([self.renderContext.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:)]) {
        source = [self.renderContext.frameworkProxy standardizeAssetUrlString:source];
    }
    id<HippyImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
    __weak HippyImageView *weakView = view;
    NSURL *url = HippyURLWithString(source, nil);
    NSUInteger sequence = _sequence++;
    [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
    } completion:^(NSUInteger seq, id result, NSURL *url, NSError *error) {
        if (!error && weakView) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (weakView) {
                    HippyImageView *strongView = weakView;
                    if ([result isKindOfClass:[NSData class]]) {
                        Class cls = [self imageProviderClass];
                        id<HippyImageProviderProtocol> imageProvider = [[cls alloc] init];
                        imageProvider.scale = [UIScreen mainScreen].scale;
                        [imageProvider setImageData:(NSData *)result];
                        strongView.defaultImage = [imageProvider image];
                    }
                    else if ([result isKindOfClass:[UIImage class]]) {
                        strongView.defaultImage = (UIImage *)result;
                    }
                }
            });
        }
    }];
}

#define HIPPY_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                                                                \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, HippyImageView) {                                \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                   \
            view.border##SIDE##Radius = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Radius; \
        }                                                                                                      \
    }

HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

- (UIView *)view {
    return [[HippyImageView alloc] init];
}

- (Class<HippyImageProviderProtocol>)imageProviderClass {
    if (!_imageProviderClass) {
        //TODO HippyImageProviderProtocol instance should be fetched from proxy
        _imageProviderClass = [HippyDefaultImageProvider class];
    }
    return _imageProviderClass;
}

- (id<HippyImageProviderProtocol>)getNewImageProviderInstance {
    Class cls = [self imageProviderClass];
    return [[cls alloc] init];
}

- (id<HippyImageDataLoaderProtocol>)imageDataLoader {
    if (!_imageDataLoader) {
        if ([self.renderContext.frameworkProxy respondsToSelector:@selector(imageDataLoader)]) {
            _imageDataLoader = [self.renderContext.frameworkProxy imageDataLoader];
        }
        if (!_imageDataLoader) {
            _imageDataLoader = [[HippyImageDataLoader alloc] init];
        }
    }
    return _imageDataLoader;
}

@end
