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

#import "HippyUIManager.h"
#import "HippyNavigatorViewManager.h"

@interface HippyNavigatorViewManager ()

@end

@implementation HippyNavigatorViewManager

HIPPY_EXPORT_MODULE(Navigator)

- (UIView *)view {
    HippyNavigatorHostView *hostView = [[HippyNavigatorHostView alloc] initWithProps:self.props];
    hostView.delegate = self;
    return hostView;
}

HIPPY_EXPORT_METHOD(push:(NSNumber *__nonnull)componentTag parms:(NSDictionary *__nonnull)params) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyNavigatorHostView *navigatorHostView = viewRegistry[componentTag];
        [navigatorHostView push:params];
    }];
}

HIPPY_EXPORT_METHOD(pop:(NSNumber *__nonnull)componentTag parms:(NSDictionary *__nonnull)params) {
    [self.bridge.uiManager addUIBlock:^(HippyUIManager *uiManager, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        HippyNavigatorHostView *navigatorHostView = viewRegistry[componentTag];
        [navigatorHostView pop:params];
    }];
}
@end
