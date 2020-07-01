//
//  HippyHeaderRefreshManager.m
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/8.
//  Copyright © 2020 Tencent. All rights reserved.
//

#import "HippyHeaderRefreshManager.h"
#import "HippyHeaderRefresh.h"
#import "HippyUIManager.h"

@implementation HippyHeaderRefreshManager

HIPPY_EXPORT_MODULE(PullHeaderView)

HIPPY_EXPORT_VIEW_PROPERTY(onHeaderReleased, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onHeaderPulling, HippyDirectEventBlock)

HIPPY_EXPORT_METHOD(expandPullHeader : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        HippyRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refresh];
    }];
}

HIPPY_EXPORT_METHOD(collapsePullHeader : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        HippyRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refreshFinish];
    }];
}

- (UIView *)view {
    return [[HippyHeaderRefresh alloc] init];
}

@end
