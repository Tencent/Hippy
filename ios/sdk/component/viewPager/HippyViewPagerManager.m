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

#import "HippyViewPagerManager.h"
#import "HippyViewPager.h"

@implementation HippyViewPagerManager

HIPPY_EXPORT_MODULE(ViewPager)

- (UIView *)view
{
    return [HippyViewPager new];
}

HIPPY_EXPORT_VIEW_PROPERTY(initialPage, NSInteger)
HIPPY_EXPORT_VIEW_PROPERTY(scrollEnabled, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(loop, BOOL)

HIPPY_EXPORT_VIEW_PROPERTY(onPageSelected, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPageScroll, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onPageScrollStateChanged, HippyDirectEventBlock)

// clang-format off
HIPPY_EXPORT_METHOD(setPage:(nonnull NSNumber *)hippyTag
        pageNumber:(__unused NSNumber *)pageNumber) {
// clang-format on
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];

        if (view == nil || ![view isKindOfClass:[HippyViewPager class]]) {
            HippyLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, hippyTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(HippyViewPager *)view setPage:pageNumberInteger animated:YES];
    }];

}

// clang-format off
HIPPY_EXPORT_METHOD(setPageWithoutAnimation:(nonnull NSNumber *)hippyTag
        pageNumber:(__unused NSNumber *)pageNumber) {
// clang-format on
    [self.bridge.uiManager addUIBlock:^(__unused HippyUIManager *uiManager, NSDictionary<NSNumber *, UIView *> *viewRegistry){
        UIView *view = viewRegistry[hippyTag];
        if (view == nil || ![view isKindOfClass:[HippyViewPager class]]) {
            HippyLogError(@"tried to setPage: on an error viewPager %@ "
                        "with tag #%@", view, hippyTag);
        }
        NSInteger pageNumberInteger = pageNumber.integerValue;
        [(HippyViewPager *)view setPage:pageNumberInteger animated:NO];
    }];
}


@end
