//
// Created by 万致远 on 2018/12/3.
// Copyright (c) 2018 Tencent. All rights reserved.
//

#import "HippyViewPagerItemManager.h"
#import "HippyViewPagerItem.h"

@implementation HippyViewPagerItemManager
HIPPY_EXPORT_MODULE(ViewPagerItem)
- (UIView *)view
{
    return [HippyViewPagerItem new];
}
@end
