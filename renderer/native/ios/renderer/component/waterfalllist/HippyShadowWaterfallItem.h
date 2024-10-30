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

#import "HippyShadowView.h"

NS_ASSUME_NONNULL_BEGIN

@class HippyShadowWaterfallItem;

@protocol HippyShadowWaterfallItemFrameChangedProtocol <NSObject>

@required
/// Calledn when item frame changed
/// - Parameter item: shadow waterfall item
- (void)itemFrameChanged:(__kindof HippyShadowWaterfallItem *)item;

@end

/// Waterfall item's shadowView
@interface HippyShadowWaterfallItem : HippyShadowView

/// Whether is header view
@property (nonatomic, assign) BOOL isHeader;

/// Whether is footer view
@property (nonatomic, assign) BOOL isFooter;

/// frame change observer, usually is shadowListView
@property (nonatomic, weak) id<HippyShadowWaterfallItemFrameChangedProtocol> observer;

@end

NS_ASSUME_NONNULL_END
