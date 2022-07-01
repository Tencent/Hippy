/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderImageViewManager.h"
#import "NativeRenderImageView.h"
#import "NativeRenderImageDataLoader.h"
#import "NativeRenderDefaultImageProvider.h"
#import "NativeRenderUtils.h"
#import "UIView+Sequence.h"

@interface NativeRenderImageViewManager () {
    id<NativeRenderImageDataLoaderProtocol> _imageDataLoader;
    Class<NativeRenderImageProviderProtocol> _imageProviderClass;
    NSUInteger _sequence;
}

@end

@implementation NativeRenderImageViewManager

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(blurRadius, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(capInsets, UIEdgeInsets)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(resizeMode, NativeRenderResizeMode)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onLoadStart, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onProgress, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onError, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPartialLoad, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onLoad, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onLoadEnd, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(downSample, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(shape, NativeRenderShapeMode)
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(src, NSString, NativeRenderImageView) {
    NSString *path = [NativeRenderConvert NSString:json];
    [self loadImageSource:path forView:view];
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(source, NSArray, NativeRenderImageView) {
    NSArray *pathSources = [NativeRenderConvert NSArray:json];
    if ([pathSources isKindOfClass:[NSArray class]]) {
        NSDictionary *dicSource = [pathSources firstObject];
        NSString *path = dicSource[@"uri"];
        [self loadImageSource:path forView:view];
    }
}

- (void)loadImageSource:(NSString *)path forView:(NativeRenderImageView *)view {
    if ([self.renderContext.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:forRenderContext:)]) {
        path = [self.renderContext.frameworkProxy standardizeAssetUrlString:path forRenderContext:self.renderContext];
    }
    id<NativeRenderImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
    __weak NativeRenderImageView *weakView = view;
    NSURL *url = NativeRenderURLWithString(path, nil);
    NSUInteger sequence = _sequence++;
    weakView.sequence = sequence;
    [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
    } completion:^(NSUInteger seq, id result, NSURL *url, NSError *error) {
        if (!error && weakView) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (weakView) {
                    NativeRenderImageView *strongView = weakView;
                    NSUInteger viewSeq = strongView.sequence;
                    if (seq == viewSeq) {
                        if ([result isKindOfClass:[UIImage class]]) {
                            [strongView updateImage:(UIImage *)result];
                        }
                        else if ([result isKindOfClass:[NSData class]]) {
                            Class cls = [self imageProviderClass];
                            id<NativeRenderImageProviderProtocol> imageProvider = [[cls alloc] init];
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

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(tintColor, UIColor, NativeRenderImageView) {
    view.tintColor = [NativeRenderConvert UIColor:json] ?: defaultView.tintColor;
    view.renderingMode = json ? UIImageRenderingModeAlwaysTemplate : defaultView.renderingMode;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(defaultSource, NSString, NativeRenderImageView) {
    NSString *source = [NativeRenderConvert NSString:json];
    if ([self.renderContext.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:forRenderContext:)]) {
        source = [self.renderContext.frameworkProxy standardizeAssetUrlString:source forRenderContext:self.renderContext];
    }
    id<NativeRenderImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
    __weak NativeRenderImageView *weakView = view;
    NSURL *url = NativeRenderURLWithString(source, nil);
    NSUInteger sequence = _sequence++;
    [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
    } completion:^(NSUInteger seq, id result, NSURL *url, NSError *error) {
        if (!error && weakView) {
            dispatch_async(dispatch_get_main_queue(), ^{
                if (weakView) {
                    NativeRenderImageView *strongView = weakView;
                    if ([result isKindOfClass:[NSData class]]) {
                        Class cls = [self imageProviderClass];
                        id<NativeRenderImageProviderProtocol> imageProvider = [[cls alloc] init];
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
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, NativeRenderImageView) {                                \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                   \
            view.border##SIDE##Radius = json ? [NativeRenderConvert CGFloat:json] : defaultView.border##SIDE##Radius; \
        }                                                                                                      \
    }

HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

- (UIView *)view {
    return [[NativeRenderImageView alloc] init];
}

- (Class<NativeRenderImageProviderProtocol>)imageProviderClass {
    if (!_imageProviderClass) {
        if ([self.renderContext.frameworkProxy respondsToSelector:@selector(imageProviderClassForRenderContext:)]) {
            _imageProviderClass = [self.renderContext.frameworkProxy imageProviderClassForRenderContext:self.renderContext];
        }
        else {
            _imageProviderClass = [NativeRenderDefaultImageProvider class];
        }
    }
    return _imageProviderClass;
}

- (id<NativeRenderImageProviderProtocol>)getNewImageProviderInstance {
    Class cls = [self imageProviderClass];
    return [[cls alloc] init];
}

- (id<NativeRenderImageDataLoaderProtocol>)imageDataLoader {
    if (!_imageDataLoader) {
        if ([self.renderContext.frameworkProxy respondsToSelector:@selector(imageDataLoaderForRenderContext:)]) {
            _imageDataLoader = [self.renderContext.frameworkProxy imageDataLoaderForRenderContext:self.renderContext];
        }
        if (!_imageDataLoader) {
            _imageDataLoader = [[NativeRenderImageDataLoader alloc] init];
        }
    }
    return _imageDataLoader;
}

@end
