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
#import "NativeRenderSmartViewPagerViewManager.h"
#import "NativeRenderSmartViewPagerView.h"
#import "HippyBridgeModule.h"

@implementation NativeRenderSmartViewPagerViewManager

HIPPY_EXPORT_MODULE(SmartViewPager)

HIPPY_EXPORT_VIEW_PROPERTY(scrollEventThrottle, NSTimeInterval)
HIPPY_EXPORT_VIEW_PROPERTY(initialListReady, HippyDirectEventBlock);
HIPPY_EXPORT_VIEW_PROPERTY(onScrollBeginDrag, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPageSelected, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onScroll, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPageScrollStateChanged, HippyDirectEventBlock)

HIPPY_EXPORT_VIEW_PROPERTY(pageGap, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(previousMargin, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(nextMargin, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(autoplayTimeInterval, CGFloat)
HIPPY_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
HIPPY_EXPORT_VIEW_PROPERTY(circular, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(autoplay, BOOL)

- (UIView *)view {
    return [[NativeRenderSmartViewPagerView alloc] init];
}

HIPPY_EXPORT_METHOD(setPage:(nonnull NSNumber *)componentTag
        pageNumber:(NSNumber *)pageNumber) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[componentTag];

        if (view == nil || ![view isKindOfClass:[NativeRenderSmartViewPagerView class]]) {
            HippyLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, componentTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(NativeRenderSmartViewPagerView *)view setPage:pageNumberInteger animated:YES];
    }];
}

HIPPY_EXPORT_METHOD(setPageWithoutAnimation:(nonnull NSNumber *)componentTag
        pageNumber:(NSNumber *)pageNumber) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[componentTag];
        if (view == nil || ![view isKindOfClass:[NativeRenderSmartViewPagerView class]]) {
            HippyLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, componentTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(NativeRenderSmartViewPagerView *)view setPage:pageNumberInteger animated:NO];
    }];
}

HIPPY_EXPORT_METHOD(getPageIndex:(nonnull NSNumber *)componentTag
                    callback:(HippyPromiseResolveBlock)callback) {
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        NativeRenderSmartViewPagerView *view = viewRegistry[componentTag];
        NSInteger currrentPage = [view getCurrentPage];
        callback(@(currrentPage));
    }];
}

@end

