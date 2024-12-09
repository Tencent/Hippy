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
#import "HippyConvert+NativeRender.h"

/**
 * Protocol for any scrollable components inherit from UIScrollView
 */
@protocol HippyScrollableProtocol <UIScrollViewDelegate>

/**
 * Content size for components
 */
@property (nonatomic, readonly) CGSize contentSize;

/**
 * Add listener for scroll events
 *
 * @param scrollListener listener for scroll events
 */
- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener;

/**
 * Remove listener for scroll events
 *
 * @param scrollListener listener for scroll events
 */
- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener;

/**
 * Get the internal UIScrollView
 *
 * @return Internal UIScrollView
 */
- (UIScrollView *)realScrollView;

/**
 * Scroll event listeners table
 */
- (NSHashTable *)scrollListeners;

@optional

/**
 * Set components scroll to location offset
 *
 * @param offset X coordinate for the offset
 * @param animated Indicate whether to show animation effects
 */
- (void)scrollToOffset:(CGPoint)offset animated:(BOOL)animated;

/**
 * Set components scroll to index
 *
 * @param index Index of item
 * @param animated Indicate whether to show animation effects
 */
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;


#pragma mark - Nested Scroll Props

/// Priority of nestedScroll, see `HippyNestedScrollCoordinator` for more
- (void)setNestedScrollPriority:(HippyNestedScrollPriority)nestedScrollPriority;

/// Priority of nestedScroll in specific direction (finger move from bottom to top)
- (void)setNestedScrollTopPriority:(HippyNestedScrollPriority)nestedScrollTopPriority;

/// Priority of nestedScroll in specific direction (finger move from right to left)
- (void)setNestedScrollLeftPriority:(HippyNestedScrollPriority)nestedScrollLeftPriority;

/// Priority of nestedScroll in specific direction (finger move from top to bottom)
- (void)setNestedScrollBottomPriority:(HippyNestedScrollPriority)nestedScrollBottomPriority;

/// Set priority of nestedScroll in specific direction (finger move from left to right)
- (void)setNestedScrollRightPriority:(HippyNestedScrollPriority)nestedScrollRightPriority;


@end
