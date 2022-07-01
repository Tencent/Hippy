/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderHeaderRefreshManager.h"
#import "NativeRenderHeaderRefresh.h"

@implementation NativeRenderHeaderRefreshManager

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onHeaderReleased, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onHeaderPulling, NativeRenderDirectEventBlock)

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(expandPullHeader:(nonnull NSNumber *)reactTag) {
    [self.renderContext addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        NativeRenderRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refresh];
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(collapsePullHeader:(nonnull NSNumber *)reactTag) {
    [self.renderContext addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        NativeRenderRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refreshFinish];
    }];
}
// clang-format on

// clang-format off
NATIVE_RENDER_COMPONENT_EXPORT_METHOD(collapsePullHeaderWithOptions:(nonnull NSNumber *)reactTag options:(NSDictionary *)options) {
    [self.renderContext addUIBlock:^(id<NativeRenderContext> renderContext, NSDictionary<NSNumber *, __kindof UIView *> *viewRegistry) {
        NativeRenderRefresh *refreshView = viewRegistry[reactTag];
        [refreshView refreshFinishWithOption:options];
    }];
}
// clang-format on

- (UIView *)view {
    return [[NativeRenderHeaderRefresh alloc] init];
}

@end
