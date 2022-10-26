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
#import "NativeRenderDefaultImageProvider.h"
#import "NativeRenderUtils.h"
#import "TypeConverter.h"

@interface NativeRenderImageViewManager () {
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
    if (!path || !view) {
        return;
    }
    NSString *standardizeAssetUrlString = path;
    if ([self.renderContext.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:forRenderContext:)]) {
        standardizeAssetUrlString = [self.renderContext.frameworkProxy standardizeAssetUrlString:path forRenderContext:self.renderContext];
    }
    NSURL *url = NativeRenderURLWithString(standardizeAssetUrlString, nil);
    __weak NativeRenderImageView *weakView = view;
    self.renderContext.frameworkProxy.URILoader->loadContentsAsynchronously(url, nil, ^(NSData *data, NSURLResponse *response, NSError *error) {
        dispatch_async(dispatch_get_main_queue(), ^{
            NativeRenderImageView *strongView = weakView;
            if (strongView) {
                Class cls = [self imageProviderClass];
                id<NativeRenderImageProviderProtocol> imageProvider = [[cls alloc] init];
                imageProvider.scale = [[UIScreen mainScreen] scale];
                imageProvider.imageDataPath = standardizeAssetUrlString;
                [imageProvider setImageData:data];
                [strongView setImageProvider:imageProvider];
                [strongView reloadImage];
            }
        });
    });
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(tintColor, UIColor, NativeRenderImageView) {
    view.tintColor = [NativeRenderConvert UIColor:json] ?: defaultView.tintColor;
    view.renderingMode = json ? UIImageRenderingModeAlwaysTemplate : defaultView.renderingMode;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(defaultSource, NSString, NativeRenderImageView) {
    NSString *source = [NativeRenderConvert NSString:json];
    [self loadImageSource:source forView:view];
}

#define NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                                                                 \
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, NativeRenderImageView) {                          \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                            \
            view.border##SIDE##Radius = json ? [NativeRenderConvert CGFloat:json] : defaultView.border##SIDE##Radius;   \
        }                                                                                                               \
    }

NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

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

@end
