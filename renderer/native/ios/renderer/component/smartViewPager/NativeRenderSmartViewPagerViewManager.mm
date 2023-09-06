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

#import "NativeRenderImpl.h"
#import "NativeRenderSmartViewPagerViewManager.h"
#import "NativeRenderSmartViewPagerView.h"

@implementation NativeRenderSmartViewPagerViewManager

NATIVE_RENDER_EXPORT_VIEW(SmartViewPager)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSTimeInterval)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(initialListReady, NativeRenderDirectEventBlock);
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageSelected, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onScroll, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageScrollStateChanged, NativeRenderDirectEventBlock)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(pageGap, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(previousMargin, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(nextMargin, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(autoplayTimeInterval, CGFloat)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(circular, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(autoplay, BOOL)

- (UIView *)view {
    return [[NativeRenderSmartViewPagerView alloc] init];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setPage:(nonnull NSNumber *)componentTag
        pageNumber:(NSNumber *)pageNumber) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[componentTag];

        if (view == nil || ![view isKindOfClass:[NativeRenderSmartViewPagerView class]]) {
            HPLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, componentTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(NativeRenderSmartViewPagerView *)view setPage:pageNumberInteger animated:YES];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setPageWithoutAnimation:(nonnull NSNumber *)componentTag
        pageNumber:(NSNumber *)pageNumber) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[componentTag];
        if (view == nil || ![view isKindOfClass:[NativeRenderSmartViewPagerView class]]) {
            HPLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, componentTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(NativeRenderSmartViewPagerView *)view setPage:pageNumberInteger animated:NO];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(getPageIndex:(nonnull NSNumber *)componentTag
                    callback:(RenderUIResponseSenderBlock)callback) {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        NativeRenderSmartViewPagerView *view = viewRegistry[componentTag];
        NSInteger currrentPage = [view getCurrentPage];
        callback(@(currrentPage));
    }];
}

@end

