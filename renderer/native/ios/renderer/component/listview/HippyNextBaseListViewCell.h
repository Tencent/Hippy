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
#import "HippyWaterfallView.h"
#import "HippyWaterfallViewCell.h"

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, CellAppearState) {
    CellInitialState,
    CellWillAppearState,
    CellDidAppearState,
    CellWillDisappearState,
    CellDidDisappearState
};

typedef NS_ENUM(NSUInteger, CellShowState) { CellNotShowState, CellHalfShowState, CellFullShowState };

@protocol ViewAppearStateProtocol <NSObject>

/// Called when cell appear state changed
/// - Parameter state: CellAppearState
- (void)cellAppearStateChanged:(CellAppearState)state;

@end

@interface HippyNextBaseListViewCell : HippyWaterfallViewCell

- (void)setCellShowState:(CellShowState)cellShowState NS_REQUIRES_SUPER;

- (CellShowState)cellShowState;

@end

NS_ASSUME_NONNULL_END
