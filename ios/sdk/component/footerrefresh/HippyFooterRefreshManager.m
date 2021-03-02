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

#import "HippyFooterRefreshManager.h"
#import "HippyUIManager.h"
#import "HippyFooterRefresh.h"

@implementation HippyFooterRefreshManager

HIPPY_EXPORT_MODULE(PullFooterView)

HIPPY_EXPORT_VIEW_PROPERTY(refreshStick, BOOL)
HIPPY_EXPORT_VIEW_PROPERTY(onFooterReleased, HippyDirectEventBlock)
HIPPY_EXPORT_VIEW_PROPERTY(onFooterPulling, HippyDirectEventBlock)

// clang-format off
HIPPY_EXPORT_METHOD(collapsePullFooter : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        HippyRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refreshFinish];
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(expandPullFooter : (nonnull NSNumber *)reactTag) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        HippyRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refresh];
    }];
}
// clang-format on

- (UIView *)view {
    return [[HippyFooterRefresh alloc] init];
}

@end
