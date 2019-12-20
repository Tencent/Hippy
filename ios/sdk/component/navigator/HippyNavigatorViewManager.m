//
//  HippyNavigatorViewManager.m
//  Hippy
//
//  Created by mengyanluo on 2018/9/28.
//  Copyright © 2018 Tencent. All rights reserved.
//

#import "HippyNavigatorViewManager.h"
#import "HippyNavigatorHostView.h"
#import "HippyUIManager.h"
@interface HippyNavigatorViewManager()

@end

@implementation HippyNavigatorViewManager
HIPPY_EXPORT_MODULE(Navigator)
- (UIView *)view {
    HippyNavigatorHostView *hostView = [[HippyNavigatorHostView alloc] initWithBridge:self.bridge props:self.props];
    hostView.delegate = self;
    return hostView;
}

HIPPY_EXPORT_METHOD(push:(NSNumber *__nonnull)hippyTag parms:(NSDictionary *__nonnull)params) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyNavigatorHostView *navigatorHostView = viewRegistry[hippyTag];
        [navigatorHostView push:params];
    }];
}

HIPPY_EXPORT_METHOD(pop:(NSNumber *__nonnull)hippyTag parms:(NSDictionary *__nonnull)params) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyNavigatorHostView *navigatorHostView = viewRegistry[hippyTag];
        [navigatorHostView pop:params];
    }];
}
@end
