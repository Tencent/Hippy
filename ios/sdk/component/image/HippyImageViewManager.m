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
#import <UIKit/UIKit.h>

@interface HippyImageViewManager () {
    NSMapTable<UIView *, id<HippyImageDataLoaderProtocol>> *_imageViewLoaderMapTable;
}

@end

@implementation HippyImageViewManager

HIPPY_EXPORT_MODULE(Image)

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
        id<HippyImageDataLoaderProtocol> imageDataLoader = [self imageDataLoaderForView:view];
        __weak HippyImageView *weakView = view;
        [imageDataLoader loadImageAtPath:path progress:^(NSUInteger current, NSUInteger total) {
        } completion:^(id result, NSString *path, NSError *error) {
            if (!error && weakView) {
                dispatch_async(dispatch_get_main_queue(), ^{
                    if (weakView) {
                        HippyImageView *strongView = weakView;
                        if ([result isKindOfClass:[UIImage class]]) {
                            [strongView updateImage:(UIImage *)result];
                        }
                        else if ([result isKindOfClass:[NSData class]]) {
                            Class cls = [self imageProviderClass];
                            id<HippyImageProviderProtocol> imageProvider = [[cls alloc] init];
                            imageProvider.imageDataPath = path;
                            [imageProvider setImageData:(NSData *)result];
                            [strongView setImageProvider:imageProvider];
                            [strongView reloadImage];
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
    id<HippyImageDataLoaderProtocol> imageDataLoader = [self imageDataLoaderForView:view];
    __weak HippyImageView *weakView = view;
    [imageDataLoader loadImageAtPath:source progress:^(NSUInteger current, NSUInteger total) {
    } completion:^(id result, NSString *path, NSError *error) {
        if (!error && weakView) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (weakView) {
                    HippyImageView *strongView = weakView;
                    if ([result isKindOfClass:[NSData class]]) {
                        Class cls = [self imageProviderClass];
                        id<HippyImageProviderProtocol> imageProvider = [[cls alloc] init];
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
    return [[HippyImageView alloc] initWithBridge:self.bridge];
}

- (Class<HippyImageDataLoaderProtocol>)imageDataLoaderClass {
    if (!_imageDataLoaderClass) {
        _imageDataLoaderClass = [HippyImageDataLoader class];
    }
    return _imageDataLoaderClass;
}

- (Class<HippyImageProviderProtocol>)imageProviderClass {
    if (!_imageProviderClass) {
        _imageProviderClass = [HippyDefaultImageProvider class];
    }
    return _imageProviderClass;
}

- (id<HippyImageDataLoaderProtocol>)getNewImageDataLoaderInstance {
    Class cls = [self imageDataLoaderClass];
    return [[cls alloc] init];
}

- (id<HippyImageProviderProtocol>)getNewImageProviderInstance {
    Class cls = [self imageProviderClass];
    return [[cls alloc] init];
}

- (NSMapTable *)imageViewLoaderMapTable {
    if (_imageViewLoaderMapTable) {
        _imageViewLoaderMapTable = [NSMapTable weakToStrongObjectsMapTable];
    }
    return _imageViewLoaderMapTable;
}

- (id<HippyImageDataLoaderProtocol>)imageDataLoaderForView:(UIView *)view {
    id<HippyImageDataLoaderProtocol> loader = nil;
    if (view) {
        loader = objc_getAssociatedObject(view, @selector(imageDataLoaderForView:));
        if (!loader) {
            loader = [self getNewImageDataLoaderInstance];
            objc_setAssociatedObject(view, @selector(imageDataLoaderForView:), loader, OBJC_ASSOCIATION_RETAIN_NONATOMIC);
        }
    }
    return loader;
}

@end
