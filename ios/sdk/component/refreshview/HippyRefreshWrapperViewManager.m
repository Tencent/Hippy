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

// clang-format off
HIPPY_EXPORT_METHOD(refreshComplected:(NSNumber *__nonnull)hippyTag args:(id)arg) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyRefreshWrapper *wrapperView = viewRegistry[hippyTag];
        [wrapperView refreshCompleted];
    }];
}
// clang-format on

// clang-format off
HIPPY_EXPORT_METHOD(startRefresh:(NSNumber *__nonnull)hippyTag args:(id)arg) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyRefreshWrapper *wrapperView = viewRegistry[hippyTag];
        [wrapperView startRefresh];
    }];
}
// clang-format on

@end
