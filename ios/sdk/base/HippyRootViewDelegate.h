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

#import <Foundation/Foundation.h>

@class HippyRootView;

@protocol HippyRootViewDelegate <NSObject>
/**
 * Called after the root view's content is updated to a new size. The method is not called
 * when both old size and new size have a dimension that equals to zero.
 *
 * The delegate can use this callback to appropriately resize the root view frame to fit the new
 * content view size. The view will not resize itself. The new content size is available via the
 * intrinsicSize propery of the root view.
 */
- (void)rootViewDidChangeIntrinsicSize:(HippyRootView *)rootView;

/**
 * Called after finish load the bundle.
 */
- (void)rootView:(HippyRootView *)rootView didLoadFinish:(BOOL)success;

@end
