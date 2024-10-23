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

#import <UIKit/UIKit.h>
#import "HippyComponent.h"
#import "HippyInvalidating.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyBridge;

/// RefreshWrapper add refresh capability to scrollable components such as ListView
@interface HippyRefreshWrapper : UIView <HippyInvalidating>

/// Direction of Refresh
@property (nonatomic, assign, getter=isHorizontal) BOOL horizontal;

/// Bounce time of refresh start/end animation
@property (nonatomic, assign) CGFloat bounceTime;

/// The onRefresh block that JS side binding.
@property (nonatomic, copy) HippyDirectEventBlock onRefresh;

/// The footer onRefresh block that JS side binding.
@property (nonatomic, copy) HippyDirectEventBlock onFooterRefresh;

/// Call to indicate refresh completion.
- (void)refreshCompleted;

/// Call to indicate refresh footer completion.
- (void)refreshFooterCompleted;

/// Call to start the refresh process.
- (void)startRefresh;

/// Call to start the footer refresh process.
- (void)startRefreshFooter;

@end

NS_ASSUME_NONNULL_END
