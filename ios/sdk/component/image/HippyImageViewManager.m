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
#import "HippyBridge+LocalFileSource.h"
#import <UIKit/UIKit.h>

@implementation HippyImageViewManager

HIPPY_EXPORT_MODULE(Image)

HIPPY_EXPORT_VIEW_PROPERTY(blurRadius, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(capInsets, UIEdgeInsets)
HIPPY_EXPORT_VIEW_PROPERTY(resizeMode, HippyResizeMode)
HIPPY_EXPORT_VIEW_PROPERTY(source, NSArray)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadStart, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onProgress, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onError, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPartialLoad, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoad, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLoadEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(downSample, BOOL)

HIPPY_CUSTOM_VIEW_PROPERTY(tintColor, UIColor, HippyImageView) {
    view.tintColor = [HippyConvert UIColor:json] ?: defaultView.tintColor;
    view.renderingMode = json ? UIImageRenderingModeAlwaysTemplate : defaultView.renderingMode;
}

HIPPY_CUSTOM_VIEW_PROPERTY(defaultSource, NSString, HippyImageView) {
    NSString *source = [HippyConvert NSString:json];
    if ([HippyBridge isHippyLocalFileURLString:source]) {
        NSString *localPath = [self.bridge absoluteStringFromHippyLocalFileURLString:source];
        BOOL isDirectory = NO;
        BOOL fileExist = [[NSFileManager defaultManager] fileExistsAtPath:localPath isDirectory:&isDirectory];
        if (fileExist && !isDirectory) {
            NSData *imageData = [NSData dataWithContentsOfFile:localPath];
            UIImage *image = [view imageFromData:imageData];
            view.defaultImage = image;
        }
    }
    else if ([source hasPrefix:@"data:image/"]) {
        NSRange range = [source rangeOfString:@";base64,"];
        if (NSNotFound != range.location) {
            source = [source substringFromIndex:range.location + range.length];
        }
        NSData *imageData = [[NSData alloc] initWithBase64EncodedString:source options:NSDataBase64DecodingIgnoreUnknownCharacters];
        UIImage *image = [view imageFromData:imageData];
        view.defaultImage = image;
    }
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

@end
