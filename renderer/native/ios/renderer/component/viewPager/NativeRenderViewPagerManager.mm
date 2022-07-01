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

#import "NativeRenderViewPagerManager.h"
#import "NativeRenderViewPager.h"

@implementation NativeRenderViewPagerManager

- (UIView *)view {
    return [NativeRenderViewPager new];
}

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(loop, BOOL)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageSelected, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageScroll, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageScrollStateChanged, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(bounces, BOOL)

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setPage:(nonnull NSNumber *)hippyTag
        pageNumber:(__unused NSNumber *)pageNumber) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];

        if (view == nil || ![view isKindOfClass:[NativeRenderViewPager class]]) {
//            NativeRenderLogError(@"tried to setPage: on an error viewPager %@ "
//                        "with tag #%@", view, hippyTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(NativeRenderViewPager *)view setPage:pageNumberInteger animated:YES];
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setPageWithoutAnimation:(nonnull NSNumber *)hippyTag
        pageNumber:(__unused NSNumber *)pageNumber) {
    [self.renderContext addUIBlock:^(__unused id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];
        if (view == nil || ![view isKindOfClass:[NativeRenderViewPager class]]) {
//            NativeRenderLogError(@"tried to setPage: on an error viewPager %@ "
//                        "with tag #%@", view, hippyTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(NativeRenderViewPager *)view setPage:pageNumberInteger animated:NO];
    }];
}
// clang-format on

@end
