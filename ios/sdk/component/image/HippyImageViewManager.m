//
//  HippyImageViewV2Manager.m
//  QBCommonRNLib
//
//  Created by pennyli on 2018/8/21.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyImageViewManager.h"
#import "HippyImageView.h"
#import "HippyConvert.h"
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


HIPPY_CUSTOM_VIEW_PROPERTY(tintColor, UIColor, HippyImageView)
{
	view.tintColor = [HippyConvert UIColor:json] ?: defaultView.tintColor;
	view.renderingMode = json ? UIImageRenderingModeAlwaysTemplate : defaultView.renderingMode;
}

HIPPY_CUSTOM_VIEW_PROPERTY(defaultSource, NSString, HippyImageView) {
    NSString *source = [HippyConvert NSString:json];
    if ([source hasPrefix: @"data:image/"]) {
        NSRange range = [source rangeOfString:@";base64,"];
        if (NSNotFound != range.location) {
            source = [source substringFromIndex:range.location + range.length];
        }
        NSData *imageData = [[NSData alloc] initWithBase64EncodedString:source options:NSDataBase64DecodingIgnoreUnknownCharacters];
        UIImage *image = [view imageFromData:imageData];
        view.defaultImage = image;
    }
}

#define HIPPY_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                           \
HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, HippyImageView)        \
{                                                                       \
    if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {  \
        view.border##SIDE##Radius = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Radius; \
    }                                                                     \
}                                                                       \

HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

- (UIView *)view
{
	return [[HippyImageView alloc] initWithBridge: self.bridge];
}

@end
