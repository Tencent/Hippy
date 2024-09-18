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

#import "HippyUIManager.h"
#import "HippyShadowView.h"
#import "HippyScrollViewManager.h"
#import "HippyScrollView.h"
#import "HippyBridgeModule.h"

@implementation HippyConvert (UIScrollView)

HIPPY_ENUM_CONVERTER(UIScrollViewKeyboardDismissMode, (@{
    @"none": @(UIScrollViewKeyboardDismissModeNone),
    @"on-drag": @(UIScrollViewKeyboardDismissModeOnDrag),
    @"interactive": @(UIScrollViewKeyboardDismissModeInteractive),
    // Backwards compatibility
    @"onDrag": @(UIScrollViewKeyboardDismissModeOnDrag),
}),
    UIScrollViewKeyboardDismissModeNone, integerValue)

HIPPY_ENUM_CONVERTER(UIScrollViewIndicatorStyle, (@{
    @"default": @(UIScrollViewIndicatorStyleDefault),
    @"black": @(UIScrollViewIndicatorStyleBlack),
    @"white": @(UIScrollViewIndicatorStyleWhite),
}),
    UIScrollViewIndicatorStyleDefault, integerValue)

@end

@implementation HippyScrollViewManager

HIPPY_EXPORT_MODULE(ScrollView)

- (UIView *)view {
    return [[HippyScrollView alloc] init];
}

HIPPY_EXPORT_VIEW_PROPERTY(alwaysBounceHorizontal, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(alwaysBounceVertical, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(horizontal, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(bounces, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(bouncesZoom, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(canCancelContentTouches, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(centerContent, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(decelerationRate, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(directionalLockEnabled, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(indicatorStyle, UIScrollViewIndicatorStyle)
HIPPY_EXPORT_VIEW_PROPERTY(keyboardDismissMode, UIScrollViewKeyboardDismissMode)
HIPPY_EXPORT_VIEW_PROPERTY(maximumZoomScale, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(minimumZoomScale, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(pagingEnabled, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(scrollsToTop, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(showsHorizontalScrollIndicator, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(showsVerticalScrollIndicator, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(stickyHeaderIndices, NSIndexSet)
HIPPY_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSTimeInterval)
HIPPY_EXPORT_VIEW_PROPERTY(zoomScale, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(scrollIndicatorInsets, UIEdgeInsets)
HIPPY_EXPORT_VIEW_PROPERTY(snapToInterval, int)
HIPPY_EXPORT_VIEW_PROPERTY(snapToAlignment, NSString)
HIPPY_REMAP_VIEW_PROPERTY(contentInset, _scrollView.contentInset, UIEdgeInsets)
HIPPY_REMAP_VIEW_PROPERTY(contentOffset, scrollView.contentOffset, CGPoint)
HIPPY_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScroll, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScrollEndDrag, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onMomentumScrollBegin, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onMomentumScrollEnd, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScrollAnimationEnd, HippyDirectEventBlock)


HIPPY_EXPORT_METHOD(getContentSize:(nonnull NSNumber *)hippyTag
                    callback:(HippyPromiseResolveBlock)callback) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyScrollView *view = viewRegistry[hippyTag];
        CGSize size = view.scrollView.contentSize;
        callback(@{@"width" : @(size.width),@"height" : @(size.height)});
    }];
}

HIPPY_EXPORT_METHOD(scrollTo:(nonnull NSNumber *)hippyTag
                    offsetX:(NSNumber *)x
                    offsetY:(NSNumber *)y
                    animated:(NSNumber *)animated) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];
        if (view == nil) return ;
        if ([view conformsToProtocol:@protocol(HippyScrollableProtocol)]) {
            [(id<HippyScrollableProtocol>)view scrollToOffset:(CGPoint){[x floatValue], [y floatValue]} animated:[animated boolValue]];
        } else {
            HippyLogError(@"tried to scrollTo: on non-HippyScrollableProtocol view %@ "
                          "with tag #%@", view, hippyTag);
        }
    }];
}

HIPPY_EXPORT_METHOD(scrollToWithOptions:(nonnull NSNumber *)hippyTag
                    options:(NSDictionary *)options) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];
        if (view == nil) return ;
        if ([view conformsToProtocol:@protocol(HippyScrollableProtocol)]) {
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
                [(id<HippyScrollableProtocol>)view scrollToOffset:(CGPoint){x,y} animated:NO];
            }];
        } else {
            HippyLogError(@"tried to scrollTo: on non-HippyScrollableProtocol view %@ "
                          "with tag #%@", view, hippyTag);
        }
    }];
}

@end
