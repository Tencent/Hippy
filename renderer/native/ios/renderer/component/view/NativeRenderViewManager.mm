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

#import "NativeRenderViewManager.h"
#import "NativeRenderBorderStyle.h"
#import "NativeRenderConvert.h"
#import "HippyEventDispatcher.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderUtils.h"
#import "NativeRenderView.h"
#import "UIView+NativeRender.h"
#import "NativeRenderConvert+Transform.h"
#import "NativeRenderGradientObject.h"
#import "NativeRenderImageDataLoaderProtocol.h"
#import "NativeRenderContext.h"
#import "NativeRenderImageDataLoader.h"
#import "NativeRenderDefaultImageProvider.h"
#import "objc/runtime.h"
#import "UIView+DirectionalLayout.h"

@interface NativeRenderViewManager () {
    id<NativeRenderImageDataLoaderProtocol> _imageDataLoader;
    NSUInteger _sequence;
}

@end

@implementation NativeRenderViewManager

- (UIView *)view {
    return [[NativeRenderView alloc] init];
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [[NativeRenderObjectView alloc] init];
}

- (NativeRenderRenderUIBlock)uiBlockToAmendWithNativeRenderObjectView:(__unused NativeRenderObjectView *)renderObject {
    return nil;
}

- (NativeRenderRenderUIBlock)uiBlockToAmendWithRenderObjectRegistry:(__unused NSDictionary<NSNumber *, NativeRenderObjectView *> *)renderObjectRegistry {
    return nil;
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(measureInWindow:(NSNumber *)hippyTag callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            callback(@{});
            return;
        }
        UIView *rootView = viewRegistry[view.rootTag];
        if (!rootView) {
            callback(@{});
            return;
        }
        CGRect windowFrame = [rootView convertRect:view.frame fromView:view.superview];
        callback(@{@"width":@(CGRectGetWidth(windowFrame)),
                     @"height": @(CGRectGetHeight(windowFrame)),
                     @"x":@(windowFrame.origin.x),
                     @"y":@(windowFrame.origin.y)});
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(measureInAppWindow:(NSNumber *)hippyTag callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (!view) {
            callback(@{});
            return;
        }
        CGRect windowFrame = [view.window convertRect:view.frame fromView:view.superview];
        callback(@{@"width":@(CGRectGetWidth(windowFrame)),
                     @"height": @(CGRectGetHeight(windowFrame)),
                     @"x":@(windowFrame.origin.x),
                     @"y":@(windowFrame.origin.y)});
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getScreenShot:(nonnull NSNumber *)hippyTag
                                      params:(NSDictionary *__nonnull)params
                                    callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[hippyTag];
        if (view == nil) {
            callback(@[]);
            return;
        }
        CGFloat viewWidth = view.frame.size.width;
        CGFloat viewHeight = view.frame.size.height;
        int maxWidth = [params[@"maxWidth"] intValue];
        int maxHeight = [params[@"maxHeight"] intValue];
        CGFloat scale = 1.f;
        if (viewWidth != 0 && viewHeight != 0 && maxWidth > 0 && maxHeight > 0) {
            CGFloat scaleX = maxWidth / viewWidth;
            CGFloat scaleY = maxHeight / viewHeight;
            scale = MIN(scaleX, scaleY);
        }
        UIGraphicsBeginImageContextWithOptions(view.frame.size, YES, scale);
        [view drawViewHierarchyInRect:view.bounds afterScreenUpdates:YES];
        UIImage *resultImage = UIGraphicsGetImageFromCurrentImageContext();
        UIGraphicsEndImageContext();
        if (resultImage) {
            int quality = [params[@"quality"] intValue];
            NSData *imageData = UIImageJPEGRepresentation(resultImage, (quality > 0 ? quality : 80) / 100.f);
            NSString *base64String = [imageData base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];
            NSDictionary *srceenShotDict = @{
                @"width": @(int(resultImage.size.width * resultImage.scale)),
                @"height": @(int(resultImage.size.height * resultImage.scale)),
                @"screenShot": base64String.length ? base64String : @"",
                @"screenScale": @(resultImage.scale)
            };
            callback(@[srceenShotDict]);
        } else {
            callback(@[]);
        }
    }];
}

#pragma mark - RenderObject properties
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(visibility, NSString)

#pragma mark - View properties

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(accessibilityLabel, NSString)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(shadowSpread, CGFloat)

NATIVE_RENDER_REMAP_VIEW_PROPERTY(accessible, isAccessibilityElement, BOOL)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(opacity, alpha, CGFloat)

NATIVE_RENDER_REMAP_VIEW_PROPERTY(shadowOpacity, layer.shadowOpacity, float)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(shadowRadius, layer.shadowRadius, CGFloat)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(backgroundPositionX, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(backgroundPositionY, CGFloat)

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(backgroundImage, NSString, NativeRenderView) {
    if (json) {
        NSString *imagePath = [NativeRenderConvert NSString:json];
        if ([self.renderContext.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:forRenderContext:)]) {
            imagePath = [self.renderContext.frameworkProxy standardizeAssetUrlString:imagePath forRenderContext:self.renderContext];
        }
        id<NativeRenderImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
        __weak NativeRenderView *weakView = view;
        CGFloat scale = [UIScreen mainScreen].scale;
        NSURL *url = NativeRenderURLWithString(imagePath, nil);
        NSUInteger sequence = _sequence++;
        [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
        } completion:^(NSUInteger seq, id result, NSURL *url, NSError *error) {
            if (!error && sequence == seq) {
                UIImage *backgroundImage = nil;
                if ([result isKindOfClass:[UIImage class]]) {
                    backgroundImage = result;
                }
                else if ([result isKindOfClass:[NSData class]]) {
                    NativeRenderDefaultImageProvider *imageProvider = [[NativeRenderDefaultImageProvider alloc] init];
                    imageProvider.imageDataPath = imagePath;
                    [imageProvider setImageData:(NSData *)result];
                    imageProvider.scale = scale;
                    backgroundImage = [imageProvider image];
                }
                dispatch_async(dispatch_get_main_queue(), ^{
                    NativeRenderView *strongView = weakView;
                    if (strongView) {
                        strongView.backgroundImage = backgroundImage;
                    }
                });
            }
        }];
    }
    else {
        view.backgroundImage = nil;
    }
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

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(linearGradient, NSDictionary, NativeRenderView) {
    if (json) {
        NSDictionary *linearGradientObject = [NativeRenderConvert NSDictionary:json];
        view.gradientObject = [[NativeRenderGradientObject alloc] initWithGradientObject:linearGradientObject];
        [view.layer setNeedsDisplay];
    }
    else {
        view.gradientObject = defaultView.gradientObject;
        [view.layer setNeedsDisplay];
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(backgroundSize, NSString, NativeRenderView) {
    NSString *bgSize = @"auto";
    if (json) {
        bgSize = [NativeRenderConvert NSString:json];
    }
    view.backgroundSize = bgSize;
    [view.layer setNeedsDisplay];
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowColor, UIColor, NativeRenderView) {
    if (json) {
        view.layer.shadowColor = [NativeRenderConvert UIColor:json].CGColor;
    } else {
        view.layer.shadowColor = defaultView.layer.shadowColor;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowOffsetX, CGFloat, NativeRenderView) {
    CGSize shadowOffset = view.layer.shadowOffset;
    if (json) {
        shadowOffset.width = [NativeRenderConvert CGFloat:json];
    }
    else {
        shadowOffset.width = defaultView.layer.shadowOffset.width;
    }
    view.layer.shadowOffset = shadowOffset;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowOffsetY, CGFloat, NativeRenderView) {
    CGSize shadowOffset = view.layer.shadowOffset;
    if (json) {
        shadowOffset.height = [NativeRenderConvert CGFloat:json];
    }
    else {
        shadowOffset.height = defaultView.layer.shadowOffset.height;
    }
    view.layer.shadowOffset = shadowOffset;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowOffset, NSDictionary, NativeRenderView) {
    if (json) {
        NSDictionary *offset = [NativeRenderConvert NSDictionary:json];
        NSNumber *width = offset[@"width"];
        if (nil == width) {
            width = offset[@"x"];
        }
        NSNumber *height = offset[@"height"];
        if (nil == height) {
            height = offset[@"y"];
        }
        view.layer.shadowOffset = CGSizeMake([width floatValue], [height floatValue]);
    }
    else {
        view.layer.shadowOffset = defaultView.layer.shadowOffset;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(overflow, OverflowType, NativeRenderView) {
    if (json) {
        view.clipsToBounds = [NativeRenderConvert OverflowType:json] != OverflowVisible;
    } else {
        view.clipsToBounds = defaultView.clipsToBounds;
    }
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shouldRasterizeIOS, BOOL, NativeRenderView) {
    view.layer.shouldRasterize = json ? [NativeRenderConvert BOOL:json] : defaultView.layer.shouldRasterize;
    view.layer.rasterizationScale = view.layer.shouldRasterize ? [UIScreen mainScreen].scale : defaultView.layer.rasterizationScale;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(transform, CATransform3D, NativeRenderView) {
    view.layer.transform = json ? [NativeRenderConvert CATransform3D:json] : defaultView.layer.transform;
    view.layer.allowsEdgeAntialiasing = !CATransform3DIsIdentity(view.layer.transform);
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(pointerEvents, NativeRenderPointerEvents, NativeRenderView) {
    if ([view respondsToSelector:@selector(setPointerEvents:)]) {
        view.pointerEvents = json ? [NativeRenderConvert NativeRenderPointerEvents:json] : defaultView.pointerEvents;
        return;
    }

    if (!json) {
        view.userInteractionEnabled = defaultView.userInteractionEnabled;
        return;
    }

    switch ([NativeRenderConvert NativeRenderPointerEvents:json]) {
        case NativeRenderPointerEventsUnspecified:
            // Pointer events "unspecified" acts as if a stylesheet had not specified,
            // which is different than "auto" in CSS (which cannot and will not be
            // supported in `NativeRender`. "auto" may override a parent's "none".
            // Unspecified values do not.
            // This wouldn't override a container view's `userInteractionEnabled = NO`
            view.userInteractionEnabled = YES;
            break;
        case NativeRenderPointerEventsNone:
            view.userInteractionEnabled = NO;
            break;
        default:
            //NativeRenderLogError(@"UIView base class does not support pointerEvent value: %@", json);
            break;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderRadius, CGFloat, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderRadius:)]) {
        view.borderRadius = json ? [NativeRenderConvert CGFloat:json] : defaultView.borderRadius;
    } else {
        view.layer.cornerRadius = json ? [NativeRenderConvert CGFloat:json] : defaultView.layer.cornerRadius;
    }
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderColor, CGColor, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderColor:)]) {
        view.borderColor = json ? [NativeRenderConvert CGColor:json] : defaultView.borderColor;
    } else {
        view.layer.borderColor = json ? [NativeRenderConvert CGColor:json] : defaultView.layer.borderColor;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderWidth, CGFloat, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderWidth:)]) {
        view.borderWidth = json ? [NativeRenderConvert CGFloat:json] : defaultView.borderWidth;
    } else {
        view.layer.borderWidth = json ? [NativeRenderConvert CGFloat:json] : defaultView.layer.borderWidth;
    }
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderStyle, NativeRenderBorderStyle, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderStyle:)]) {
        view.borderStyle = json ? [NativeRenderConvert NativeRenderBorderStyle:json] : defaultView.borderStyle;
    }
}

#define HIPPY_VIEW_BORDER_PROPERTY(SIDE)                                                                     \
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Width, CGFloat, NativeRenderView) {                                    \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Width:)]) {                                  \
            view.border##SIDE##Width = json ? [NativeRenderConvert CGFloat:json] : defaultView.border##SIDE##Width; \
        }                                                                                                    \
    }                                                                                                        \
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Color, UIColor, NativeRenderView) {                                    \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Color:)]) {                                  \
            view.border##SIDE##Color = json ? [NativeRenderConvert CGColor:json] : defaultView.border##SIDE##Color; \
        }                                                                                                    \
    }

HIPPY_VIEW_BORDER_PROPERTY(Top)
HIPPY_VIEW_BORDER_PROPERTY(Right)
HIPPY_VIEW_BORDER_PROPERTY(Bottom)
HIPPY_VIEW_BORDER_PROPERTY(Left)

#define HIPPY_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                                                                \
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, NativeRenderView) {                                     \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                   \
            view.border##SIDE##Radius = json ? [NativeRenderConvert CGFloat:json] : defaultView.border##SIDE##Radius; \
        }                                                                                                      \
    }

HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

NATIVE_RENDER_REMAP_VIEW_PROPERTY(zIndex, hippyZIndex, NSInteger)

#pragma mark - ShadowView properties

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(backgroundColor, UIColor)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(top, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(right, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(bottom, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(left, CGFloat);

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(width, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(height, CGFloat)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(minWidth, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(maxWidth, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(minHeight, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(maxHeight, CGFloat)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(borderTopWidth, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(borderRightWidth, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(borderBottomWidth, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(borderLeftWidth, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(borderWidth, CGFloat)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(marginTop, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(marginRight, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(marginBottom, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(marginLeft, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(marginVertical, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(marginHorizontal, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(margin, CGFloat)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(paddingTop, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(paddingRight, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(paddingBottom, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(paddingLeft, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(paddingVertical, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(paddingHorizontal, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(padding, CGFloat)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(flex, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(flexGrow, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(flexShrink, CGFloat)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(flexBasis, CGFloat)

// hplayout
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(flexDirection, FlexDirection)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(flexWrap, FlexWrapMode)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(justifyContent, FlexAlign)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(alignItems, FlexAlign)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(alignSelf, FlexAlign)
NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(position, PositionType)

NATIVE_RENDER_REMAP_RENDER_OBJECT_PROPERTY(display, displayType, DisplayType)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(overflow, OverflowType)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(onLayout, NativeRenderDirectEventBlock)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDidMount, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDidUnmount, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onAttachedToWindow, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDetachedFromWindow, NativeRenderDirectEventBlock)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(zIndex, NSInteger)

static inline HPDirection ConvertDirection(id direction) {
    if (!direction) {
        return DirectionInherit;
    }
    if ([direction isKindOfClass:[NSNumber class]]) {
        return (HPDirection)[direction intValue];
    }
    else if ([direction isKindOfClass:[NSString class]]) {
        if ([direction isEqualToString:@"rtl"]) {
            return DirectionRTL;
        }
        else if ([direction isEqualToString:@"ltr"]) {
            return DirectionLTR;
        }
        else {
            return DirectionInherit;
        }
    }
    return DirectionInherit;
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(direction, id, NativeRenderObjectView) {
    view.layoutDirection = ConvertDirection(json);
}

@end

#import <objc/runtime.h>

static const char *init_props_identifier = "init_props_identifier";

@implementation NativeRenderViewManager (InitProps)

- (NSDictionary *)props {
    return objc_getAssociatedObject(self, init_props_identifier);
}

- (void)setProps:(NSDictionary *)props {
    if (props == nil) {
        return;
    }
    objc_setAssociatedObject(self, init_props_identifier, props, OBJC_ASSOCIATION_RETAIN);
}

@end
