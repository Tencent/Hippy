//
//  HippyFooterRefreshManager.m
//  QBCommonRNLib
//
//  Created by ozonelmy on 2020/3/9.
//  Copyright © 2020 Tencent. All rights reserved.
//

#import "HippyFooterRefreshManager.h"
#import "HippyUIManager.h"
#import "HippyFooterRefresh.h"

@implementation HippyFooterRefreshManager

HIPPY_EXPORT_MODULE(PullFooterView)

HIPPY_EXPORT_VIEW_PROPERTY(refreshStick, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(onFooterReleased, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onFooterPulling, HippyDirectEventBlock)

HIPPY_EXPORT_METHOD(pullFooterFinished : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        HippyRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refreshFinish];
    }];
}

- (UIView *)view {
    return [[HippyFooterRefresh alloc] init];
}

@end
