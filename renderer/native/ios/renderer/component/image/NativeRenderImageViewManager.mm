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

#import "HippyAsserts.h"
#import "HippyUtils.h"
#import "NativeRenderImageViewManager.h"
#import "NativeRenderImageView.h"
#import "HippyUIManager.h"
#import "TypeConverter.h"

#include "VFSUriLoader.h"

@interface NativeRenderImageViewManager () {
}

@end

@implementation NativeRenderImageViewManager

HIPPY_EXPORT_MODULE(Image);

HIPPY_EXPORT_VIEW_PROPERTY(blurRadius, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(capInsets, UIEdgeInsets)
HIPPY_EXPORT_VIEW_PROPERTY(resizeMode, NativeRenderResizeMode)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadStart, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onProgress, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onError, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPartialLoad, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoad, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(downSample, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(shape, NativeRenderShapeMode)
HIPPY_CUSTOM_VIEW_PROPERTY(src, NSString, NativeRenderImageView) {
    NSString *path = [HippyConvert NSString:json];
    [self loadImageSource:path forView:view];
}

HIPPY_CUSTOM_VIEW_PROPERTY(source, NSArray, NativeRenderImageView) {
    NSArray *pathSources = [HippyConvert NSArray:json];
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
    __weak NativeRenderImageView *weakView = view;
    auto loader = [self.bridge.uiManager VFSUriLoader].lock();
    if (!loader) {
        return;
    }
    __weak __typeof(self)weakSelf = self;
    loader->RequestUntrustedContent(path, nil, nil, ^(NSData *data, NSURLResponse *response, NSError *error) {
        __strong __typeof(weakSelf)strongSelf = weakSelf;
        HippyUIManager *renderImpl = strongSelf.bridge.uiManager;
        id<HippyImageProviderProtocol> imageProvider = nil;
        if (renderImpl) {
            for (Class<HippyImageProviderProtocol> cls in [strongSelf.bridge imageProviderClasses]) {
                if ([cls canHandleData:data]) {
                    imageProvider = [[(Class)cls alloc] init];
                    break;
                }
            }
            HippyAssert(imageProvider, @"Image Provider is required");
            imageProvider.imageDataPath = standardizeAssetUrlString;
            [imageProvider setImageData:data];
            dispatch_async(dispatch_get_main_queue(), ^{
                NativeRenderImageView *strongView = weakView;
                if (strongView) {
                    [strongView setImageProvider:imageProvider];
                    [strongView reloadImage];
                }
            });
        }
    });
}

HIPPY_CUSTOM_VIEW_PROPERTY(tintColor, UIColor, NativeRenderImageView) {
    view.tintColor = [HippyConvert UIColor:json] ?: defaultView.tintColor;
    view.renderingMode = json ? UIImageRenderingModeAlwaysTemplate : defaultView.renderingMode;
}

HIPPY_CUSTOM_VIEW_PROPERTY(defaultSource, NSString, NativeRenderImageView) {
    NSString *source = [HippyConvert NSString:json];
    [self loadImageSource:source forView:view];
}

#define NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                                                                 \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, NativeRenderImageView) {                          \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                            \
            view.border##SIDE##Radius = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Radius;   \
        }                                                                                                               \
    }

NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

- (UIView *)view {
    return [[NativeRenderImageView alloc] init];
}

@end
