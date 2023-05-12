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
#import "NativeRenderViewPagerManager.h"
#import "NativeRenderViewPager.h"

@implementation NativeRenderViewPagerManager

NATIVE_RENDER_EXPORT_VIEW(ViewPager)

- (UIView *)view {
    return [NativeRenderViewPager new];
}

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(bounces, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageSelected, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageScroll, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onPageScrollStateChanged, NativeRenderDirectEventBlock)


- (void)setPage:(NSNumber *)pageNumber withTag:(NSNumber * _Nonnull)componentTag animated:(BOOL)animated {
    [self.renderImpl addUIBlock:^(__unused NativeRenderImpl *renderContext,
                                  NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[componentTag];
        if (![view isKindOfClass:[NativeRenderViewPager class]]) {
            HPLogError(@"tried to setPage: on an error viewPager %@ with tag #%@", view, componentTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(NativeRenderViewPager *)view setPage:pageNumberInteger animated:animated];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setPage:(nonnull NSNumber *)componentTag
                                      pageNumber:(__unused NSNumber *)pageNumber) {
    [self setPage:pageNumber withTag:componentTag animated:YES];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(setPageWithoutAnimation:(nonnull NSNumber *)componentTag
                                      pageNumber:(__unused NSNumber *)pageNumber) {
    [self setPage:pageNumber withTag:componentTag animated:NO];
}

@end
