//
//  HippyRefreshWrapperViewManager.m
//  Hippy
//
//  Created by mengyanluo on 2018/9/19.
//  Copyright © 2018年 Tencent. All rights reserved.
//

#import "HippyRefreshWrapperViewManager.h"
#import "HippyRefreshWrapper.h"
#import "HippyUIManager.h"
@implementation HippyRefreshWrapperViewManager

HIPPY_EXPORT_MODULE(RefreshWrapper)

HIPPY_EXPORT_VIEW_PROPERTY(onRefresh, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(bounceTime, CGFloat)
- (UIView *)view {
    return [HippyRefreshWrapper new];
}

HIPPY_EXPORT_METHOD(refreshComplected:(NSNumber *__nonnull)hippyTag args:(id)arg) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyRefreshWrapper *wrapperView = viewRegistry[hippyTag];
        [wrapperView refreshCompleted];
    }];
}

HIPPY_EXPORT_METHOD(startRefresh:(NSNumber *__nonnull)hippyTag args:(id)arg) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyRefreshWrapper *wrapperView = viewRegistry[hippyTag];
        [wrapperView startRefresh];
    }];
}

@end
