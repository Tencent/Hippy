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

#import "HippyViewManager.h"
#import "HippyBorderStyle.h"
#import "HippyConvert.h"
#import "HippyEventDispatcher.h"
#import "NativeRenderObjectView.h"
#import "HippyUtils.h"
#import "HippyView.h"
#import "UIView+Hippy.h"
#import "HippyConvert+Transform.h"
#import "HippyGradientObject.h"
#import "HippyImageDataLoaderProtocol.h"
#import "HippyRenderContext.h"
#import "HippyImageDataLoader.h"
#import "HippyDefaultImageProvider.h"
#import "objc/runtime.h"
#import "UIView+DirectionalLayout.h"

@interface HippyViewManager () {
    id<HippyImageDataLoaderProtocol> _imageDataLoader;
    NSUInteger _sequence;
}

@end

@implementation HippyViewManager

- (dispatch_queue_t)methodQueue {
//    return HippyGetUIManagerQueue();
    //TODO
    NSAssert(NO, @"return queue");
    return nil;
}

- (UIView *)view {
    return [[HippyView alloc] init];
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [[NativeRenderObjectView alloc] init];
}

- (HippyRenderUIBlock)uiBlockToAmendWithNativeRenderObjectView:(__unused NativeRenderObjectView *)renderObject {
    return nil;
}

- (HippyRenderUIBlock)uiBlockToAmendWithRenderObjectRegistry:(__unused NSDictionary<NSNumber *, NativeRenderObjectView *> *)renderObjectRegistry {
    return nil;
}

RENDER_COMPONENT_EXPORT_METHOD(measureInWindow:(NSNumber *)hippyTag callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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

RENDER_COMPONENT_EXPORT_METHOD(measureInAppWindow:(NSNumber *)hippyTag callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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

RENDER_COMPONENT_EXPORT_METHOD(getScreenShot:(nonnull NSNumber *)hippyTag
                                      params:(NSDictionary *__nonnull)params
                                    callback:(HippyResponseSenderBlock)callback) {
    [self.renderContext addUIBlock:^(__unused id<HippyRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(visibility, NSString)

#pragma mark - View properties

HIPPY_EXPORT_VIEW_PROPERTY(accessibilityLabel, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)
HIPPY_EXPORT_VIEW_PROPERTY(shadowSpread, CGFloat)

HIPPY_REMAP_VIEW_PROPERTY(accessible, isAccessibilityElement, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(opacity, alpha, CGFloat)

HIPPY_REMAP_VIEW_PROPERTY(shadowOpacity, layer.shadowOpacity, float)
HIPPY_REMAP_VIEW_PROPERTY(shadowRadius, layer.shadowRadius, CGFloat)

HIPPY_EXPORT_VIEW_PROPERTY(backgroundPositionX, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundPositionY, CGFloat)

HIPPY_CUSTOM_VIEW_PROPERTY(backgroundImage, NSString, HippyView) {
    if (json) {
        NSString *imagePath = [HippyConvert NSString:json];
        if ([self.renderContext.frameworkProxy respondsToSelector:@selector(standardizeAssetUrlString:forRenderContext:)]) {
            imagePath = [self.renderContext.frameworkProxy standardizeAssetUrlString:imagePath forRenderContext:self.renderContext];
        }
        id<HippyImageDataLoaderProtocol> imageDataLoader = [self imageDataLoader];
        __weak HippyView *weakView = view;
        CGFloat scale = [UIScreen mainScreen].scale;
        NSURL *url = HippyURLWithString(imagePath, nil);
        NSUInteger sequence = _sequence++;
        [imageDataLoader loadImageAtUrl:url sequence:sequence progress:^(NSUInteger current, NSUInteger total) {
        } completion:^(NSUInteger seq, id result, NSURL *url, NSError *error) {
            if (!error && sequence == seq) {
                UIImage *backgroundImage = nil;
                if ([result isKindOfClass:[UIImage class]]) {
                    backgroundImage = result;
                }
                else if ([result isKindOfClass:[NSData class]]) {
                    HippyDefaultImageProvider *imageProvider = [[HippyDefaultImageProvider alloc] init];
                    imageProvider.imageDataPath = imagePath;
                    [imageProvider setImageData:(NSData *)result];
                    imageProvider.scale = scale;
                    backgroundImage = [imageProvider image];
                }
                dispatch_async(dispatch_get_main_queue(), ^{
                    if (weakView) {
                        HippyView *strongView = weakView;
                        strongView.backgroundImage = backgroundImage;
                    }
                });
            }
        }];
    }
}

- (id<HippyImageDataLoaderProtocol>)imageDataLoader {
    if (!_imageDataLoader) {
        if ([self.renderContext.frameworkProxy respondsToSelector:@selector(imageDataLoaderForRenderContext:)]) {
            _imageDataLoader = [self.renderContext.frameworkProxy imageDataLoaderForRenderContext:self.renderContext];
        }
        if (!_imageDataLoader) {
            _imageDataLoader = [[HippyImageDataLoader alloc] init];
        }
    }
    return _imageDataLoader;
}

HIPPY_CUSTOM_VIEW_PROPERTY(linearGradient, NSDictionary, HippyView) {
    if (json) {
        NSDictionary *linearGradientObject = [HippyConvert NSDictionary:json];
        view.gradientObject = [[HippyGradientObject alloc] initWithGradientObject:linearGradientObject];
        [view.layer setNeedsDisplay];
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(backgroundSize, NSString, HippyView) {
    NSString *bgSize = @"auto";
    if (json) {
        bgSize = [HippyConvert NSString:json];
    }
    view.backgroundSize = bgSize;
    [view.layer setNeedsDisplay];
}

HIPPY_CUSTOM_VIEW_PROPERTY(shadowColor, UIColor, HippyView) {
    if (json) {
        view.layer.shadowColor = [HippyConvert UIColor:json].CGColor;
    } else {
        view.layer.shadowColor = [UIColor blackColor].CGColor;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(shadowOffsetX, CGFloat, HippyView) {
    if (json) {
        CGSize shadowOffset = view.layer.shadowOffset;
        shadowOffset.width = [HippyConvert CGFloat:json];
        view.layer.shadowOffset = shadowOffset;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(shadowOffsetY, CGFloat, HippyView) {
    if (json) {
        CGSize shadowOffset = view.layer.shadowOffset;
        shadowOffset.height = [HippyConvert CGFloat:json];
        view.layer.shadowOffset = shadowOffset;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(shadowOffset, NSDictionary, HippyView) {
    if (json) {
        NSDictionary *offset = [HippyConvert NSDictionary:json];
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
}

HIPPY_CUSTOM_VIEW_PROPERTY(overflow, OverflowType, HippyView) {
    if (json) {
        view.clipsToBounds = [HippyConvert OverflowType:json] != OverflowVisible;
    } else {
        view.clipsToBounds = defaultView.clipsToBounds;
    }
}
HIPPY_CUSTOM_VIEW_PROPERTY(shouldRasterizeIOS, BOOL, HippyView) {
    view.layer.shouldRasterize = json ? [HippyConvert BOOL:json] : defaultView.layer.shouldRasterize;
    view.layer.rasterizationScale = view.layer.shouldRasterize ? [UIScreen mainScreen].scale : defaultView.layer.rasterizationScale;
}

HIPPY_CUSTOM_VIEW_PROPERTY(transform, CATransform3D, HippyView) {
    view.layer.transform = json ? [HippyConvert CATransform3D:json] : defaultView.layer.transform;
    view.layer.allowsEdgeAntialiasing = !CATransform3DIsIdentity(view.layer.transform);
}
HIPPY_CUSTOM_VIEW_PROPERTY(pointerEvents, HippyPointerEvents, HippyView) {
    if ([view respondsToSelector:@selector(setPointerEvents:)]) {
        view.pointerEvents = json ? [HippyConvert HippyPointerEvents:json] : defaultView.pointerEvents;
        return;
    }

    if (!json) {
        view.userInteractionEnabled = defaultView.userInteractionEnabled;
        return;
    }

    switch ([HippyConvert HippyPointerEvents:json]) {
        case HippyPointerEventsUnspecified:
            // Pointer events "unspecified" acts as if a stylesheet had not specified,
            // which is different than "auto" in CSS (which cannot and will not be
            // supported in `Hippy`. "auto" may override a parent's "none".
            // Unspecified values do not.
            // This wouldn't override a container view's `userInteractionEnabled = NO`
            view.userInteractionEnabled = YES;
            break;
        case HippyPointerEventsNone:
            view.userInteractionEnabled = NO;
            break;
        default:
            //HippyLogError(@"UIView base class does not support pointerEvent value: %@", json);
            break;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(borderRadius, CGFloat, HippyView) {
    if ([view respondsToSelector:@selector(setBorderRadius:)]) {
        view.borderRadius = json ? [HippyConvert CGFloat:json] : defaultView.borderRadius;
    } else {
        view.layer.cornerRadius = json ? [HippyConvert CGFloat:json] : defaultView.layer.cornerRadius;
    }
}
HIPPY_CUSTOM_VIEW_PROPERTY(borderColor, CGColor, HippyView) {
    if ([view respondsToSelector:@selector(setBorderColor:)]) {
        view.borderColor = json ? [HippyConvert CGColor:json] : defaultView.borderColor;
    } else {
        view.layer.borderColor = json ? [HippyConvert CGColor:json] : defaultView.layer.borderColor;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(borderWidth, CGFloat, HippyView) {
    if ([view respondsToSelector:@selector(setBorderWidth:)]) {
        view.borderWidth = json ? [HippyConvert CGFloat:json] : defaultView.borderWidth;
    } else {
        view.layer.borderWidth = json ? [HippyConvert CGFloat:json] : defaultView.layer.borderWidth;
    }
}
HIPPY_CUSTOM_VIEW_PROPERTY(borderStyle, HippyBorderStyle, HippyView) {
    if ([view respondsToSelector:@selector(setBorderStyle:)]) {
        view.borderStyle = json ? [HippyConvert HippyBorderStyle:json] : defaultView.borderStyle;
    }
}

#define HIPPY_VIEW_BORDER_PROPERTY(SIDE)                                                                     \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Width, CGFloat, HippyView) {                                    \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Width:)]) {                                  \
            view.border##SIDE##Width = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Width; \
        }                                                                                                    \
    }                                                                                                        \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Color, UIColor, HippyView) {                                    \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Color:)]) {                                  \
            view.border##SIDE##Color = json ? [HippyConvert CGColor:json] : defaultView.border##SIDE##Color; \
        }                                                                                                    \
    }

HIPPY_VIEW_BORDER_PROPERTY(Top)
HIPPY_VIEW_BORDER_PROPERTY(Right)
HIPPY_VIEW_BORDER_PROPERTY(Bottom)
HIPPY_VIEW_BORDER_PROPERTY(Left)

#define HIPPY_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                                                                \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, HippyView) {                                     \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                   \
            view.border##SIDE##Radius = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Radius; \
        }                                                                                                      \
    }

HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

HIPPY_REMAP_VIEW_PROPERTY(zIndex, hippyZIndex, NSInteger)

#pragma mark - ShadowView properties

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(backgroundColor, UIColor)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(top, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(right, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(bottom, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(left, CGFloat);

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(width, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(height, CGFloat)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(minWidth, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(maxWidth, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(minHeight, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(maxHeight, CGFloat)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(borderTopWidth, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(borderRightWidth, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(borderBottomWidth, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(borderLeftWidth, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(borderWidth, CGFloat)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(marginTop, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(marginRight, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(marginBottom, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(marginLeft, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(marginVertical, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(marginHorizontal, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(margin, CGFloat)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(paddingTop, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(paddingRight, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(paddingBottom, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(paddingLeft, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(paddingVertical, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(paddingHorizontal, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(padding, CGFloat)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(flex, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(flexGrow, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(flexShrink, CGFloat)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(flexBasis, CGFloat)

// hplayout
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(flexDirection, FlexDirection)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(flexWrap, FlexWrapMode)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(justifyContent, FlexAlign)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(alignItems, FlexAlign)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(alignSelf, FlexAlign)
HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(position, PositionType)

HIPPY_REMAP_RENDER_OBJECT_PROPERTY(display, displayType, DisplayType)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(overflow, OverflowType)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(onLayout, HippyDirectEventBlock)

HIPPY_EXPORT_VIEW_PROPERTY(onDidMount, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onDidUnmount, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onAttachedToWindow, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onDetachedFromWindow, HippyDirectEventBlock)

HIPPY_EXPORT_RENDER_OBJECT_PROPERTY(zIndex, NSInteger)

- (HPDirection)convertDirection:(NSString *)direction {
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

//HIPPY_CUSTOM_VIEW_PROPERTY(direction, id, UIView) {
//    if (json) {
//        view.layoutDirection = [self convertDirection:json];
//    }
//}

HIPPY_CUSTOM_RENDER_OBJECT_PROPERTY(direction, id, NativeRenderObjectView) {
    if (json) {
        view.layoutDirection = [self convertDirection:json];
    }
}

@end

#import <objc/runtime.h>

static const char *init_props_identifier = "init_props_identifier";

@implementation HippyViewManager (InitProps)

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
