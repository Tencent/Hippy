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

#import "HPAsserts.h"
#import "HPConvert.h"
#import "HPConvert+NativeRender.h"
#import "HPImageProviderProtocol.h"
#import "HPToolUtils.h"
#import "NativeRenderGradientObject.h"
#import "NativeRenderImpl.h"
#import "NativeRenderObjectView.h"
#import "NativeRenderViewManager.h"
#import "NativeRenderView.h"
#import "UIView+DirectionalLayout.h"
#import "UIView+NativeRender.h"

#include <objc/runtime.h>

#include "VFSUriLoader.h"
#include "dom/layout_node.h"

@interface NativeRenderViewManager () {
    NSUInteger _sequence;
    __weak NativeRenderImpl *_renderImpl;
}

@end

@implementation NativeRenderViewManager

NATIVE_RENDER_EXPORT_VIEW(View);

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

- (NativeRenderImpl *)renderImpl {
    return _renderImpl;
}

static NSString * const NativeRenderViewManagerGetBoundingRelToContainerKey = @"relToContainer";
static NSString * const NativeRenderViewManagerGetBoundingErrMsgrKey = @"errMsg";
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getBoundingClientRect:(nonnull NSNumber *)hippyTag
                                      options:(nullable NSDictionary *)options
                                      callback:(RenderUIResponseSenderBlock)callback ) {
    if (options && [[options objectForKey:NativeRenderViewManagerGetBoundingRelToContainerKey] boolValue]) {
        [self measureInWindow:hippyTag withErrMsg:YES callback:callback];
    } else {
        [self measureInAppWindow:hippyTag withErrMsg:YES callback:callback];
    }
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(measureInWindow:(NSNumber *)componentTag
                                      callback:(RenderUIResponseSenderBlock)callback) {
    [self measureInWindow:componentTag withErrMsg:NO callback:callback];
}

- (void)measureInWindow:(NSNumber *)componentTag
             withErrMsg:(BOOL)withErrMsg
               callback:(RenderUIResponseSenderBlock)callback {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext,
                                     NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
        if (!view) {
            if (withErrMsg) {
                NSString *formatStr = @"measure cannot find view with tag #%@";
                NSString *errMsg = [NSString stringWithFormat:formatStr, componentTag];
                callback(@{NativeRenderViewManagerGetBoundingErrMsgrKey : errMsg});
            } else {
                callback(@{});
            }
            return;
        }
        UIView *rootView = viewRegistry[view.rootTag];
        if (!rootView) {
            if (withErrMsg) {
                NSString *formatStr = @"measure cannot find view's root view with tag #%@";
                NSString *errMsg = [NSString stringWithFormat:formatStr, componentTag];
                callback(@{NativeRenderViewManagerGetBoundingErrMsgrKey : errMsg});
            } else {
                callback(@{});
            }
            return;
        }
        CGRect windowFrame = [rootView convertRect:view.frame fromView:view.superview];
        callback(@{@"width":@(CGRectGetWidth(windowFrame)),
                   @"height": @(CGRectGetHeight(windowFrame)),
                   @"x":@(windowFrame.origin.x),
                   @"y":@(windowFrame.origin.y)});
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(measureInAppWindow:(NSNumber *)componentTag
                                      callback:(RenderUIResponseSenderBlock)callback) {
    [self measureInAppWindow:componentTag withErrMsg:NO callback:callback];
}

- (void)measureInAppWindow:(NSNumber *)componentTag
                withErrMsg:(BOOL)withErrMsg
                  callback:(RenderUIResponseSenderBlock)callback {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext,
                                     NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
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

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getScreenShot:(nonnull NSNumber *)componentTag
                                      params:(NSDictionary *__nonnull)params
                                    callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
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
                @"width": @(int(viewWidth)),
                @"height": @(int(viewHeight)),
                @"screenShot": base64String.length ? base64String : @"",
                @"screenScale": @(1.0f)
            };
            callback(@[srceenShotDict]);
        } else {
            callback(@[]);
        }
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getLocationOnScreen:(nonnull NSNumber *)componentTag
                                      params:(NSDictionary *__nonnull)params
                                    callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
        if (view == nil) {
            callback(@[]);
            return;
        }
        CGRect windowFrame = [view.window convertRect:view.frame fromView:view.superview];
        NSDictionary *locationDict = @{
            @"xOnScreen": @(static_cast<int>(windowFrame.origin.x)),
            @"yOnScreen": @(static_cast<int>(windowFrame.origin.y)),
            @"viewWidth": @(static_cast<int>(CGRectGetHeight(windowFrame))),
            @"viewHeight": @(static_cast<int>(CGRectGetWidth(windowFrame)))
        };
        callback(@[locationDict]);
    }];
}

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
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onInterceptTouchEvent, BOOL)
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(visibility, NSString, NativeRenderView) {
    if (json) {
        NSString *status = [HPConvert NSString:json];
        view.hidden = [status isEqualToString:@"hidden"];
    }
    else {
        view.hidden = NO;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(backgroundImage, NSString, NativeRenderView) {
    if (json) {
        NSString *imagePath = [HPConvert NSString:json];
        [self loadImageSource:imagePath forView:view];
    }
    else {
        view.backgroundImage = nil;
    }
}

- (void)loadImageSource:(NSString *)path forView:(NativeRenderView *)view {
    if (!path || !view) {
        return;
    }
    NSString *standardizeAssetUrlString = path;
    __weak NativeRenderView *weakView = view;
    auto loader = [[self renderImpl] VFSUriLoader].lock();
    if (!loader) {
        return;
    }
    loader->RequestUntrustedContent(path, nil, nil, ^(NSData *data, NSURLResponse *response, NSError *error) {
        NativeRenderImpl *renderImpl = self.renderImpl;
        id<HPImageProviderProtocol> imageProvider = nil;
        if (renderImpl) {
            for (Class<HPImageProviderProtocol> cls in [renderImpl imageProviderClasses]) {
                if ([cls canHandleData:data]) {
                    imageProvider = [[(Class)cls alloc] init];
                    break;
                }
            }
            imageProvider.imageDataPath = standardizeAssetUrlString;
            [imageProvider setImageData:data];
            UIImage *backgroundImage = [imageProvider image];
            dispatch_async(dispatch_get_main_queue(), ^{
                NativeRenderView *strongView = weakView;
                if (strongView) {
                    strongView.backgroundImage = backgroundImage;
                }
            });
        }
    });
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(linearGradient, NSDictionary, NativeRenderView) {
    if (json) {
        NSDictionary *linearGradientObject = [HPConvert NSDictionary:json];
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
        bgSize = [HPConvert NSString:json];
    }
    view.backgroundSize = bgSize;
    [view.layer setNeedsDisplay];
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowColor, UIColor, NativeRenderView) {
    if (json) {
        view.layer.shadowColor = [HPConvert UIColor:json].CGColor;
    } else {
        view.layer.shadowColor = defaultView.layer.shadowColor;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowOffsetX, CGFloat, NativeRenderView) {
    CGSize shadowOffset = view.layer.shadowOffset;
    if (json) {
        shadowOffset.width = [HPConvert CGFloat:json];
    }
    else {
        shadowOffset.width = defaultView.layer.shadowOffset.width;
    }
    view.layer.shadowOffset = shadowOffset;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowOffsetY, CGFloat, NativeRenderView) {
    CGSize shadowOffset = view.layer.shadowOffset;
    if (json) {
        shadowOffset.height = [HPConvert CGFloat:json];
    }
    else {
        shadowOffset.height = defaultView.layer.shadowOffset.height;
    }
    view.layer.shadowOffset = shadowOffset;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shadowOffset, NSDictionary, NativeRenderView) {
    if (json) {
        NSDictionary *offset = [HPConvert NSDictionary:json];
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

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(overflow, NSString, NativeRenderView) {
    if (json) {
        view.clipsToBounds = ![json isEqualToString:@"visible"];
    } else {
        view.clipsToBounds = defaultView.clipsToBounds;
    }
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(shouldRasterizeIOS, BOOL, NativeRenderView) {
    view.layer.shouldRasterize = json ? [HPConvert BOOL:json] : defaultView.layer.shouldRasterize;
    view.layer.rasterizationScale = view.layer.shouldRasterize ? [UIScreen mainScreen].scale : defaultView.layer.rasterizationScale;
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(transform, CATransform3D, NativeRenderView) {
    view.layer.transform = json ? [HPConvert CATransform3D:json] : defaultView.layer.transform;
    view.layer.allowsEdgeAntialiasing = !CATransform3DIsIdentity(view.layer.transform);
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(pointerEvents, NativeRenderPointerEvents, NativeRenderView) {
    if ([view respondsToSelector:@selector(setPointerEvents:)]) {
        view.pointerEvents = json ? [HPConvert NativeRenderPointerEvents:json] : defaultView.pointerEvents;
        return;
    }

    if (!json) {
        view.userInteractionEnabled = defaultView.userInteractionEnabled;
        return;
    }

    switch ([HPConvert NativeRenderPointerEvents:json]) {
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
            HPLogError(@"UIView base class does not support pointerEvent value: %@", json);
            break;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderRadius, CGFloat, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderRadius:)]) {
        view.borderRadius = json ? [HPConvert CGFloat:json] : defaultView.borderRadius;
    } else {
        view.layer.cornerRadius = json ? [HPConvert CGFloat:json] : defaultView.layer.cornerRadius;
    }
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderColor, CGColor, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderColor:)]) {
        view.borderColor = json ? [HPConvert CGColor:json] : defaultView.borderColor;
    } else {
        view.layer.borderColor = json ? [HPConvert CGColor:json] : defaultView.layer.borderColor;
    }
}

NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderWidth, CGFloat, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderWidth:)]) {
        view.borderWidth = json ? [HPConvert CGFloat:json] : defaultView.borderWidth;
    } else {
        view.layer.borderWidth = json ? [HPConvert CGFloat:json] : defaultView.layer.borderWidth;
    }
}
NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(borderStyle, NativeRenderBorderStyle, NativeRenderView) {
    if ([view respondsToSelector:@selector(setBorderStyle:)]) {
        view.borderStyle = json ? [HPConvert NativeRenderBorderStyle:json] : defaultView.borderStyle;
    }
}

#define NATIVE_RENDER_VIEW_BORDER_PROPERTY(SIDE)                                                                    \
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Width, CGFloat, NativeRenderView) {                            \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Width:)]) {                                         \
            view.border##SIDE##Width = json ? [HPConvert CGFloat:json] : defaultView.border##SIDE##Width; \
        }                                                                                                           \
    }                                                                                                               \
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Color, UIColor, NativeRenderView) {                            \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Color:)]) {                                         \
            view.border##SIDE##Color = json ? [HPConvert CGColor:json] : defaultView.border##SIDE##Color; \
        }                                                                                                           \
    }

NATIVE_RENDER_VIEW_BORDER_PROPERTY(Top)
NATIVE_RENDER_VIEW_BORDER_PROPERTY(Right)
NATIVE_RENDER_VIEW_BORDER_PROPERTY(Bottom)
NATIVE_RENDER_VIEW_BORDER_PROPERTY(Left)

#define NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                                                                 \
    NATIVE_RENDER_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, NativeRenderView) {                               \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                            \
            view.border##SIDE##Radius = json ? [HPConvert CGFloat:json] : defaultView.border##SIDE##Radius;   \
        }                                                                                                               \
    }

NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

NATIVE_RENDER_REMAP_VIEW_PROPERTY(zIndex, nativeRenderZIndex, NSInteger)

#pragma mark - native render object properties

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(backgroundColor, UIColor)

//TODO remove layout codes
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

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(overflow, NSString)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(onLayout, NativeRenderDirectEventBlock)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDidMount, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDidUnmount, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onAttachedToWindow, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDetachedFromWindow, NativeRenderDirectEventBlock)

NATIVE_RENDER_EXPORT_RENDER_OBJECT_PROPERTY(zIndex, NSInteger)

static inline hippy::Direction ConvertDirection(id direction) {
    if (!direction) {
        return hippy::Direction::Inherit;
    }
    if ([direction isKindOfClass:[NSNumber class]]) {
        return (hippy::Direction)[direction intValue];
    }
    else if ([direction isKindOfClass:[NSString class]]) {
        if ([direction isEqualToString:@"rtl"]) {
            return hippy::Direction::RTL;
        }
        else if ([direction isEqualToString:@"ltr"]) {
            return hippy::Direction::LTR;
        }
        else {
            return hippy::Direction::Inherit;
        }
    }
    return hippy::Direction::Inherit;
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(direction, id, NativeRenderObjectView) {
    view.layoutDirection = ConvertDirection(json);
}

NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(verticalAlign, HippyTextAttachmentVerticalAlign, NativeRenderObjectView) {
    if (json && [json isKindOfClass:NSString.class]) {
        view.verticalAlignType = [HPConvert NativeRenderTextVerticalAlignType:json];
    } else if ([json isKindOfClass:NSNumber.class]) {
        view.verticalAlignType = NativeRenderTextVerticalAlignMiddle;
        view.verticalAlignOffset = [HPConvert CGFloat:json];
    } else {
        HPLogError(@"Unsupported value for verticalAlign of Text: %@, type: %@", json, [json classForCoder]);
    }
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
