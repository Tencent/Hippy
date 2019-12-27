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

#import "HippyBridge.h"
#import "HippyBorderStyle.h"
#import "HippyConvert.h"
#import "HippyEventDispatcher.h"
#import "HippyLog.h"
#import "HippyShadowView.h"
#import "HippyUIManager.h"
#import "HippyUtils.h"
#import "HippyView.h"
#import "UIView+Hippy.h"
#import "HippyVirtualNode.h"
#import "HippyConvert+Transform.h"

@implementation HippyViewManager

@synthesize bridge = _bridge;

HIPPY_EXPORT_MODULE(View)

- (dispatch_queue_t)methodQueue
{
  return HippyGetUIManagerQueue();
}

- (UIView *)view
{
  return [HippyView new];
}

- (HippyShadowView *)shadowView
{
  return [HippyShadowView new];
}

- (HippyVirtualNode *)node:(NSNumber *)tag name:(NSString *)name props:(NSDictionary *)props
{
	return [HippyVirtualNode createNode: tag viewName: name props: props];
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowView:(__unused HippyShadowView *)shadowView
{
  return nil;
}

- (HippyViewManagerUIBlock)uiBlockToAmendWithShadowViewRegistry:(__unused NSDictionary<NSNumber *, HippyShadowView *> *)shadowViewRegistry
{
  return nil;
}

#pragma mark - View properties

HIPPY_EXPORT_VIEW_PROPERTY(accessibilityLabel, NSString)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundColor, UIColor)

HIPPY_REMAP_VIEW_PROPERTY(accessible, isAccessibilityElement, BOOL)
HIPPY_REMAP_VIEW_PROPERTY(opacity, alpha, CGFloat)

HIPPY_REMAP_VIEW_PROPERTY(backgroundImage, backgroundImageUrl, NSString)

HIPPY_EXPORT_VIEW_PROPERTY(backgroundPositionX, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(backgroundPositionY, CGFloat)

HIPPY_CUSTOM_VIEW_PROPERTY(overflow, OverflowType, HippyView)
{
  if (json) {
    view.clipsToBounds = [HippyConvert OverflowType:json] != OverflowVisible;
  } else {
    view.clipsToBounds = defaultView.clipsToBounds;
  }
}
HIPPY_CUSTOM_VIEW_PROPERTY(shouldRasterizeIOS, BOOL, HippyView)
{
  view.layer.shouldRasterize = json ? [HippyConvert BOOL:json] : defaultView.layer.shouldRasterize;
  view.layer.rasterizationScale = view.layer.shouldRasterize ? [UIScreen mainScreen].scale : defaultView.layer.rasterizationScale;
}

HIPPY_CUSTOM_VIEW_PROPERTY(transform, CATransform3D, HippyView)
{
  view.layer.transform = json ? [HippyConvert CATransform3D:json] : defaultView.layer.transform;
  // TODO: Improve this by enabling edge antialiasing only for transforms with rotation or skewing
  view.layer.allowsEdgeAntialiasing = !CATransform3DIsIdentity(view.layer.transform);
}
HIPPY_CUSTOM_VIEW_PROPERTY(pointerEvents, HippyPointerEvents, HippyView)
{
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
    case HippyPointerEventsNone:
      view.userInteractionEnabled = NO;
      break;
    default:
      HippyLogError(@"UIView base class does not support pointerEvent value: %@", json);
  }
}

HIPPY_CUSTOM_VIEW_PROPERTY(borderRadius, CGFloat, HippyView) {
  if ([view respondsToSelector:@selector(setBorderRadius:)]) {
    view.borderRadius = json ? [HippyConvert CGFloat:json] : defaultView.borderRadius;
  } else {
    view.layer.cornerRadius = json ? [HippyConvert CGFloat:json] : defaultView.layer.cornerRadius;
  }
}
HIPPY_CUSTOM_VIEW_PROPERTY(borderColor, CGColor, HippyView)
{
  if ([view respondsToSelector:@selector(setBorderColor:)]) {
    view.borderColor = json ? [HippyConvert CGColor:json] : defaultView.borderColor;
  } else {
    view.layer.borderColor = json ? [HippyConvert CGColor:json] : defaultView.layer.borderColor;
  }
}

HIPPY_CUSTOM_VIEW_PROPERTY(borderWidth, CGFloat, HippyView)
{
  if ([view respondsToSelector:@selector(setBorderWidth:)]) {
    view.borderWidth = json ? [HippyConvert CGFloat:json] : defaultView.borderWidth;
  } else {
    view.layer.borderWidth = json ? [HippyConvert CGFloat:json] : defaultView.layer.borderWidth;
  }
}
HIPPY_CUSTOM_VIEW_PROPERTY(borderStyle, HippyBorderStyle, HippyView)
{
  if ([view respondsToSelector:@selector(setBorderStyle:)]) {
    view.borderStyle = json ? [HippyConvert HippyBorderStyle:json] : defaultView.borderStyle;
  }
}

#define HIPPY_VIEW_BORDER_PROPERTY(SIDE)                                  \
HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Width, CGFloat, HippyView)         \
{                                                                       \
  if ([view respondsToSelector:@selector(setBorder##SIDE##Width:)]) {   \
    view.border##SIDE##Width = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Width; \
  }                                                                     \
}                                                                       \
HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Color, UIColor, HippyView)         \
{                                                                       \
  if ([view respondsToSelector:@selector(setBorder##SIDE##Color:)]) {   \
    view.border##SIDE##Color = json ? [HippyConvert CGColor:json] : defaultView.border##SIDE##Color; \
  }                                                                     \
}                                                                       \

HIPPY_VIEW_BORDER_PROPERTY(Top)
HIPPY_VIEW_BORDER_PROPERTY(Right)
HIPPY_VIEW_BORDER_PROPERTY(Bottom)
HIPPY_VIEW_BORDER_PROPERTY(Left)

#define HIPPY_VIEW_BORDER_RADIUS_PROPERTY(SIDE)                           \
HIPPY_CUSTOM_VIEW_PROPERTY(border##SIDE##Radius, CGFloat, HippyView)        \
{                                                                       \
  if ([view respondsToSelector:@selector(setBorder##SIDE##Radius:)]) {  \
    view.border##SIDE##Radius = json ? [HippyConvert CGFloat:json] : defaultView.border##SIDE##Radius; \
  }                                                                     \
}                                                                       \

HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(TopRight)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomLeft)
HIPPY_VIEW_BORDER_RADIUS_PROPERTY(BottomRight)

HIPPY_REMAP_VIEW_PROPERTY(zIndex, hippyZIndex, NSInteger)

#pragma mark - ShadowView properties

HIPPY_EXPORT_SHADOW_PROPERTY(backgroundColor, UIColor)

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

//hplayout
HIPPY_EXPORT_SHADOW_PROPERTY(flexDirection, FlexDirection)
HIPPY_EXPORT_SHADOW_PROPERTY(flexWrap, FlexWrapMode)
HIPPY_EXPORT_SHADOW_PROPERTY(justifyContent, FlexAlign)
HIPPY_EXPORT_SHADOW_PROPERTY(alignItems, FlexAlign)
HIPPY_EXPORT_SHADOW_PROPERTY(alignSelf, FlexAlign)
HIPPY_EXPORT_SHADOW_PROPERTY(position, PositionType)

HIPPY_REMAP_SHADOW_PROPERTY(display, displayType, DisplayType)

HIPPY_EXPORT_SHADOW_PROPERTY(overflow, OverflowType)


HIPPY_EXPORT_SHADOW_PROPERTY(onLayout, HippyDirectEventBlock)


HIPPY_EXPORT_VIEW_PROPERTY(onClick, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onLongClick, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPressIn, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPressOut, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onTouchDown, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onTouchMove, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onTouchEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onTouchCancel, HippyDirectEventBlock)


HIPPY_EXPORT_SHADOW_PROPERTY(zIndex, NSInteger)

HIPPY_EXPORT_VIEW_PROPERTY(onAttachedToWindow, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onDetachedFromWindow, HippyDirectEventBlock)

@end

#import <objc/runtime.h>

static const char* init_props_identifier = "init_props_identifier";

@implementation HippyViewManager(InitProps)

- (NSDictionary *)props
{
  return objc_getAssociatedObject(self, init_props_identifier);
}

- (void)setProps:(NSDictionary *)props
{
  if (props == nil) {
    return;
  }
  
  objc_setAssociatedObject(self, init_props_identifier, props, OBJC_ASSOCIATION_RETAIN);
}
@end
