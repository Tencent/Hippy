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

#import "HippyAssert.h"
#import "HippyConvert.h"
#import "HippyConvert+NativeRender.h"
#import "HippyImageProviderProtocol.h"
#import "HippyUtils.h"
#import "NativeRenderGradientObject.h"
#import "HippyUIManager.h"
#import "HippyShadowView.h"
#import "HippyViewManager.h"
#import "HippyView.h"
#import "UIView+DirectionalLayout.h"
#import "UIView+Hippy.h"
#import "HippyBridgeModule.h"
#import <objc/runtime.h>
#import "VFSUriLoader.h"
#import "dom/layout_node.h"

@interface HippyViewManager () {
    NSUInteger _sequence;
}

@end

@implementation HippyViewManager

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(View);

- (UIView *)view {
    return [[HippyView alloc] init];
}

- (HippyShadowView *)hippyShadowView {
    return [[HippyShadowView alloc] init];
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(__unused HippyShadowView *)shadowView {
    return nil;
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(__unused NSDictionary<NSNumber *, HippyShadowView *> *)shadowViewRegistry {
    return nil;
}

static NSString * const HippyViewManagerGetBoundingRelToContainerKey = @"relToContainer";
static NSString * const HippyViewManagerGetBoundingErrMsgrKey = @"errMsg";
HIPPY_EXPORT_METHOD(getBoundingClientRect:(nonnull NSNumber *)hippyTag
                    options:(nullable NSDictionary *)options
                    callback:(HippyPromiseResolveBlock)callback ) {
    if (options && [[options objectForKey:HippyViewManagerGetBoundingRelToContainerKey] boolValue]) {
        [self measureInWindow:hippyTag withErrMsg:YES callback:callback];
    } else {
        [self measureInAppWindow:hippyTag withErrMsg:YES callback:callback];
    }
}

HIPPY_EXPORT_METHOD(measureInWindow:(NSNumber *)componentTag
                    callback:(HippyPromiseResolveBlock)callback) {
    [self measureInWindow:componentTag withErrMsg:NO callback:callback];
}

- (void)measureInWindow:(NSNumber *)componentTag
             withErrMsg:(BOOL)withErrMsg
               callback:(HippyPromiseResolveBlock)callback {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager,
                                     NSDictionary<NSNumber *, UIView *> *viewRegistry) {
        UIView *view = viewRegistry[componentTag];
        if (!view) {
            if (withErrMsg) {
                NSString *formatStr = @"measure cannot find view with tag #%@";
                NSString *errMsg = [NSString stringWithFormat:formatStr, componentTag];
                callback(@{HippyViewManagerGetBoundingErrMsgrKey : errMsg});
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
                callback(@{HippyViewManagerGetBoundingErrMsgrKey : errMsg});
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

HIPPY_EXPORT_METHOD(measureInAppWindow:(NSNumber *)componentTag
                                      callback:(HippyPromiseResolveBlock)callback) {
    [self measureInAppWindow:componentTag withErrMsg:NO callback:callback];
}

- (void)measureInAppWindow:(NSNumber *)componentTag
                withErrMsg:(BOOL)withErrMsg
                  callback:(HippyPromiseResolveBlock)callback {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager,
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

HIPPY_EXPORT_METHOD(getScreenShot:(nonnull NSNumber *)componentTag
                                      params:(NSDictionary *__nonnull)params
                                    callback:(HippyPromiseResolveBlock)callback) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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

HIPPY_EXPORT_METHOD(getLocationOnScreen:(nonnull NSNumber *)componentTag
                                      params:(NSDictionary *__nonnull)params
                                    callback:(HippyPromiseResolveBlock)callback) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry) {
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

HIPPY_EXPORT_VIEW_PROPERTY(accessibilityLabel, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)
HIPPY_EXPORT_VIEW_PROPERTY(shadowSpread, CGFloat)

HIPPY_REMAP_VIEW_PROPERTY(accessible, isAccessibilityElement, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(opacity, alpha, CGFloat)

HIPPY_REMAP_VIEW_PROPERTY(shadowOpacity, layer.shadowOpacity, float)
HIPPY_REMAP_VIEW_PROPERTY(shadowRadius, layer.shadowRadius, CGFloat)

HIPPY_EXPORT_VIEW_PROPERTY(backgroundPositionX, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundPositionY, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(onInterceptTouchEvent, BOOL)
HIPPY_CUSTOM_VIEW_PROPERTY(visibility, NSString, HippyView) {
    if (json) {
        NSString *status = [HippyConvert NSString:json];
        view.hidden = [status isEqualToString:@"hidden"];
    }
    else {
        view.hidden = NO;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(backgroundImage, NSString, HippyView) {
    if (json) {
        NSString *imagePath = [HippyConvert NSString:json];
        [self loadImageSource:imagePath forView:view];
    }
    else {
        view.backgroundImage = nil;
    }
}

- (void)loadImageSource:(NSString *)path forView:(HippyView *)view {
    if (!path || !view) {
        return;
    }
    NSString *standardizeAssetUrlString = path;
    __weak HippyView *weakView = view;
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
            imageProvider.imageDataPath = standardizeAssetUrlString;
            [imageProvider setImageData:data];
            UIImage *backgroundImage = [imageProvider image];
            dispatch_async(dispatch_get_main_queue(), ^{
                HippyView *strongView = weakView;
                if (strongView) {
                    strongView.backgroundImage = backgroundImage;
                }
            });
        }
    });
}

HIPPY_CUSTOM_VIEW_PROPERTY(linearGradient, NSDictionary, HippyView) {
    if (json) {
        NSDictionary *linearGradientObject = [HippyConvert NSDictionary:json];
        view.gradientObject = [[NativeRenderGradientObject alloc] initWithGradientObject:linearGradientObject];
        [view.layer setNeedsDisplay];
    }
    else {
        view.gradientObject = defaultView.gradientObject;
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
        view.layer.shadowColor = defaultView.layer.shadowColor;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(shadowOffsetX, CGFloat, HippyView) {
    CGSize shadowOffset = view.layer.shadowOffset;
    if (json) {
        shadowOffset.width = [HippyConvert CGFloat:json];
    }
    else {
        shadowOffset.width = defaultView.layer.shadowOffset.width;
    }
    view.layer.shadowOffset = shadowOffset;
}

HIPPY_CUSTOM_VIEW_PROPERTY(shadowOffsetY, CGFloat, HippyView) {
    CGSize shadowOffset = view.layer.shadowOffset;
    if (json) {
        shadowOffset.height = [HippyConvert CGFloat:json];
    }
    else {
        shadowOffset.height = defaultView.layer.shadowOffset.height;
    }
    view.layer.shadowOffset = shadowOffset;
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
    else {
        view.layer.shadowOffset = defaultView.layer.shadowOffset;
    }
}

HIPPY_CUSTOM_VIEW_PROPERTY(overflow, NSString, HippyView) {
    if (json) {
        view.clipsToBounds = ![json isEqualToString:@"visible"];
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
HIPPY_CUSTOM_VIEW_PROPERTY(pointerEvents, NativeRenderPointerEvents, HippyView) {
    if ([view respondsToSelector:@selector(setPointerEvents:)]) {
        view.pointerEvents = json ? [HippyConvert NativeRenderPointerEvents:json] : defaultView.pointerEvents;
        return;
    }

    if (!json) {
        view.userInteractionEnabled = defaultView.userInteractionEnabled;
        return;
    }

    switch ([HippyConvert NativeRenderPointerEvents:json]) {
        case NativeRenderPointerEventsUnspecified:
            // Pointer events "unspecified" acts as if a stylesheet had not specified,
            // which is different than "auto" in CSS (which cannot and will not be
            // supported in `Hippy`. "auto" may override a parent's "none".
            // Unspecified values do not.
            // This wouldn't override a container view's `userInteractionEnabled = NO`
            view.userInteractionEnabled = YES;
            break;
        case NativeRenderPointerEventsNone:
            view.userInteractionEnabled = NO;
            break;
        default:
            HippyLogError(@"UIView base class does not support pointerEvent value: %@", json);
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
HIPPY_CUSTOM_VIEW_PROPERTY(borderStyle, NativeRenderBorderStyle, HippyView) {
    if ([view respondsToSelector:@selector(setBorderStyle:)]) {
        view.borderStyle = json ? [HippyConvert NativeRenderBorderStyle:json] : defaultView.borderStyle;
    }
}

#define NATIVE_RENDER_VIEW_BORDER_PROPERTY(SIDE)                                                                    \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Width, CGFloat, HippyView) {                            \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Width:)]) {                                         \
            view.border##SIDE##Width = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Width; \
        }                                                                                                           \
    }                                                                                                               \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Color, UIColor, HippyView) {                            \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Color:)]) {                                         \
            view.border##SIDE##Color = json ? [HippyConvert CGColor:json] : defaultView.border##SIDE##Color; \
        }                                                                                                           \
    }

NATIVE_RENDER_VIEW_BORDER_PROPERTY(Top)
NATIVE_RENDER_VIEW_BORDER_PROPERTY(Right)
NATIVE_RENDER_VIEW_BORDER_PROPERTY(Bottom)
NATIVE_RENDER_VIEW_BORDER_PROPERTY(Left)

#define NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                                                                 \
    HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, HippyView) {                               \
        if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {                                            \
            view.border##SIDE##Radius = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Radius;   \
        }                                                                                                               \
    }

NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
NATIVE_RENDER_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

HIPPY_REMAP_VIEW_PROPERTY(zIndex, hippyZIndex, NSInteger)

#pragma mark - native render object properties

HIPPY_EXPORT_SHADOW_PROPERTY(backgroundColor, UIColor)

//TODO remove layout codes
HIPPY_EXPORT_SHADOW_PROPERTY(top, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(right, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(bottom, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(left, CGFloat);

HIPPY_EXPORT_SHADOW_PROPERTY(width, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(height, CGFloat)

HIPPY_EXPORT_SHADOW_PROPERTY(minWidth, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(maxWidth, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(minHeight, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(maxHeight, CGFloat)

HIPPY_EXPORT_SHADOW_PROPERTY(borderTopWidth, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(borderRightWidth, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(borderBottomWidth, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(borderLeftWidth, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(borderWidth, CGFloat)

HIPPY_EXPORT_SHADOW_PROPERTY(marginTop, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(marginRight, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(marginBottom, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(marginLeft, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(marginVertical, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(marginHorizontal, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(margin, CGFloat)

HIPPY_EXPORT_SHADOW_PROPERTY(paddingTop, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(paddingRight, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(paddingBottom, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(paddingLeft, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(paddingVertical, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(paddingHorizontal, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(padding, CGFloat)

HIPPY_EXPORT_SHADOW_PROPERTY(flex, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(flexGrow, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(flexShrink, CGFloat)
HIPPY_EXPORT_SHADOW_PROPERTY(flexBasis, CGFloat)

HIPPY_EXPORT_SHADOW_PROPERTY(overflow, NSString)

HIPPY_EXPORT_SHADOW_PROPERTY(onLayout, HippyDirectEventBlock)

HIPPY_EXPORT_VIEW_PROPERTY(onDidMount, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onDidUnmount, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onAttachedToWindow, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onDetachedFromWindow, HippyDirectEventBlock)

HIPPY_EXPORT_SHADOW_PROPERTY(zIndex, NSInteger)

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

HIPPY_CUSTOM_SHADOW_PROPERTY(direction, id, HippyShadowView) {
    view.layoutDirection = ConvertDirection(json);
}

HIPPY_CUSTOM_SHADOW_PROPERTY(verticalAlign, NativeRenderTextVerticalAlignType, HippyShadowView) {
    if (json && [json isKindOfClass:NSString.class]) {
        view.verticalAlignType = [HippyConvert NativeRenderTextVerticalAlignType:json];
    } else if ([json isKindOfClass:NSNumber.class]) {
        view.verticalAlignType = NativeRenderTextVerticalAlignMiddle;
        view.verticalAlignOffset = [HippyConvert CGFloat:json];
    } else {
        HippyLogError(@"Unsupported value for verticalAlign of Text: %@, type: %@", json, [json classForCoder]);
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
