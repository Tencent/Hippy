//
//  HippyRefreshWrapperItemViewManager.m
//  Hippy
//
//  Created by mengyanluo on 2018/9/19.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyRefreshWrapperItemViewManager.h"
#import "HippyRefreshWrapperItemView.h"
@implementation HippyRefreshWrapperItemViewManager
HIPPY_EXPORT_MODULE(RefreshWrapperItemView)
- (UIView *)view {
    return [HippyRefreshWrapperItemView new];
}
@end
