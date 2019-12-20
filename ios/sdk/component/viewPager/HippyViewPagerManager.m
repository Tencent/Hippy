//
// Created by 万致远 on 2018/11/21.
// Copyright (c) 2018 Tencent. All rights reserved.
//

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


HIPPY_EXPORT_METHOD(setPage:(nonnull NSNumber *)hippyTag
        pageNumber:(__unused NSNumber *)pageNumber
        )
{
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

HIPPY_EXPORT_METHOD(setPageWithoutAnimation:(nonnull NSNumber *)hippyTag
        pageNumber:(__unused NSNumber *)pageNumber
)
{
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
