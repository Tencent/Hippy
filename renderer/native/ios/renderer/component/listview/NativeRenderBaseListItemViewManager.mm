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

#import "NativeRenderBaseListItemViewManager.h"
#import "NativeRenderBaseListItemView.h"
#import "NativeRenderObjectBaseListItem.h"

@implementation NativeRenderBaseListItemViewManager

NATIVE_RENDER_EXPORT_VIEW(ListViewItem)

NATIVE_RENDER_EXPORT_VIEW_PROPERTY(type, id)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(isSticky, BOOL)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onAppear, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onDisappear, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onWillAppear, NativeRenderDirectEventBlock)
NATIVE_RENDER_EXPORT_VIEW_PROPERTY(onWillDisappear, NativeRenderDirectEventBlock)

- (UIView *)view {
    return [[NativeRenderBaseListItemView alloc] init];
}

- (NativeRenderObjectView *)nativeRenderObjectView {
    return [[NativeRenderObjectBaseListItem alloc] init];
}

@end
