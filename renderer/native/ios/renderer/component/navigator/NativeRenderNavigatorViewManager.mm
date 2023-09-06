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

#import "NativeRenderImpl.h"
#import "NativeRenderNavigatorViewManager.h"

@interface NativeRenderNavigatorViewManager ()

@end

@implementation NativeRenderNavigatorViewManager

NATIVE_RENDER_EXPORT_VIEW(Navigator)

- (UIView *)view {
    NativeRenderNavigatorHostView *hostView = [[NativeRenderNavigatorHostView alloc] initWithProps:self.props];
    hostView.delegate = self;
    return hostView;
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(push:(NSNumber *__nonnull)componentTag parms:(NSDictionary *__nonnull)params) {
    [self.renderImpl addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        NativeRenderNavigatorHostView *navigatorHostView = viewRegistry[componentTag];
        [navigatorHostView push:params];
    }];
}

NATIVE_RENDER_COMPONENT_EXPORT_METHOD(pop:(NSNumber *__nonnull)componentTag parms:(NSDictionary *__nonnull)params) {
    [self.renderImpl addUIBlock:^(NativeRenderImpl *renderContext, NSDictionary<NSNumber *,__kindof UIView *> *viewRegistry) {
        NativeRenderNavigatorHostView *navigatorHostView = viewRegistry[componentTag];
        [navigatorHostView pop:params];
    }];
}
@end
