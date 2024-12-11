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
#import <UIKit/UIKit.h>
#import "HippyScrollView.h"

NS_ASSUME_NONNULL_BEGIN

/// A coordinator responsible for managing scroll priorities
@interface HippyNestedScrollCoordinator : NSObject <UIScrollViewDelegate, HippyNestedScrollGestureDelegate>

/// Priority of nestedScroll in all direction.
@property (nonatomic, assign) HippyNestedScrollPriority nestedScrollPriority;
/// Priority of nestedScroll in specific direction (finger move from bottom to top).
@property (nonatomic, assign) HippyNestedScrollPriority nestedScrollTopPriority;
/// Priority of nestedScroll in specific direction (finger move from right to left).
@property (nonatomic, assign) HippyNestedScrollPriority nestedScrollLeftPriority;
/// Priority of nestedScroll in specific direction (finger move from top to bottom).
@property (nonatomic, assign) HippyNestedScrollPriority nestedScrollBottomPriority;
/// Priority of nestedScroll in specific direction (finger move from left to right).
@property (nonatomic, assign) HippyNestedScrollPriority nestedScrollRightPriority;

/// The inner scrollable view
@property (nonatomic, weak) UIScrollView<HippyNestedScrollProtocol> *innerScrollView;
/// The outer scrollable view
@property (nonatomic, weak) UIScrollView<HippyNestedScrollProtocol> *outerScrollView;

@end

NS_ASSUME_NONNULL_END
