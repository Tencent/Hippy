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

#import "NativeRenderScrollViewManager.h"
#import "NativeRenderScrollView.h"
#import "NativeRenderObjectView.h"

@implementation NativeRenderConvert (UIScrollView)

NATIVE_RENDER_ENUM_CONVERTER(UIScrollViewKeyboardDismissMode, (@{
    @"none": @(UIScrollViewKeyboardDismissModeNone),
    @"on-drag": @(UIScrollViewKeyboardDismissModeOnDrag),
    @"interactive": @(UIScrollViewKeyboardDismissModeInteractive),
    // Backwards compatibility
    @"onDrag": @(UIScrollViewKeyboardDismissModeOnDrag),
}),
    UIScrollViewKeyboardDismissModeNone, integerValue)

NATIVE_RENDER_ENUM_CONVERTER(UIScrollViewIndicatorStyle, (@{
    @"default": @(UIScrollViewIndicatorStyleDefault),
    @"black": @(UIScrollViewIndicatorStyleBlack),
    @"white": @(UIScrollViewIndicatorStyleWhite),
}),
    UIScrollViewIndicatorStyleDefault, integerValue)

@end

@implementation NativeRenderScrollViewManager

- (UIView *)view {
    return [[NativeRenderScrollView alloc] init];
}

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(alwaysBounceHorizontal, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(alwaysBounceVertical, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(horizontal, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(bounces, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(bouncesZoom, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(canCancelContentTouches, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(centerContent, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(automaticallyAdjustContentInsets, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(decelerationRate, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(directionalLockEnabled, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(indicatorStyle, UIScrollViewIndicatorStyle)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(keyboardDismissMode, UIScrollViewKeyboardDismissMode)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(maximumZoomScale, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(minimumZoomScale, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(pagingEnabled, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollsToTop, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(showsHorizontalScrollIndicator, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(showsVerticalScrollIndicator, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(stickyHeaderIndices, NSIndexSet)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSTimeInterval)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(zoomScale, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(contentInset, UIEdgeInsets)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollIndicatorInsets, UIEdgeInsets)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(snapToInterval, int)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(snapToAlignment, NSString)
NATIVE_RENDER_REMAP_VIEW_PROPERTY(contentOffset, scrollView.contentOffset, CGPoint)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScroll, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScrollEndDrag, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onMomentumScrollBegin, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onMomentumScrollEnd, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScrollAnimationEnd, NativeRenderDirectEventBlock)

// overflow is used both in css-layout as well as by reac-native. In css-layout
// we always want to treat overflow as scroll but depending on what the overflow
// is set to from js we want to clip drawing or not. This piece of code ensures
// that css-layout is always treating the contents of a scroll container as
// overflow: 'scroll'.
NATIVE_RENDER_CUSTOM_RENDER_OBJECT_PROPERTY(overflow, OverflowType, NativeRenderObjectView) {
    (void)json;
    view.overflow = OverflowScroll;
}

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getContentSize:(nonnull NSNumber *)componentTag
                    callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        NativeRenderScrollView *view = viewRegistry[componentTag];
        CGSize size = view.scrollView.contentSize;
        callback(@{@"width" : @(size.width),@"height" : @(size.height)});
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(scrollTo:(nonnull NSNumber *)componentTag
                    offsetX:(NSNumber *)x
                    offsetY:(NSNumber *)y
                    animated:(NSNumber *)animated) {
    [self.renderContext addUIBlock:
     ^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[componentTag];
        if (view == nil) return ;
        if ([view conformsToProtocol:@protocol(NativeRenderScrollableProtocol)]) {
            [(id<NativeRenderScrollableProtocol>)view scrollToOffset:(CGPoint){[x floatValue], [y floatValue]} animated:[animated boolValue]];
        } else {
            NativeRenderLogError(@"tried to scrollTo: on non-NativeRenderScrollableProtocol view %@ "
                          "with tag #%@", view, componentTag);
        }
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(scrollToWithOptions:(nonnull NSNumber *)componentTag
                    options:(NSDictionary *)options) {
    [self.renderContext addUIBlock:
     ^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[componentTag];
        if (view == nil) return ;
        if ([view conformsToProtocol:@protocol(NativeRenderScrollableProtocol)]) {
            CGFloat duration = 1.0;
            CGFloat x = 0;
            CGFloat y = 0;
            if (options && [options[@"duration"] isKindOfClass:[NSNumber class]]) {//毫秒
                duration = ((NSNumber *)(options[@"duration"])).floatValue / 1000.0;
            }
            if (options && [options[@"x"] isKindOfClass:[NSNumber class]]) {
                x = ((NSNumber *)(options[@"x"])).floatValue;
            }
            if (options && [options[@"y"] isKindOfClass:[NSNumber class]]) {
                y = ((NSNumber *)(options[@"y"])).floatValue;
            }
            [UIView animateWithDuration:duration animations:^{
                ((NativeRenderScrollView *)view).scrollView.contentOffset = CGPointMake(x, y);
            }];
        } else {
            NativeRenderLogError(@"tried to scrollTo: on non-NativeRenderScrollableProtocol view %@ "
                          "with tag #%@", view, componentTag);
        }
    }];
}
// clang-format on

@end
