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

@protocol HippyScrollableProtocol;
/// Delegate used to deliver layout events
@protocol HippyScrollableLayoutDelegate <NSObject>

/// Trigger when scrollable did layout subviews.
/// - Parameter scrollableView: scrollable object
- (void)scrollableDidLayout:(id<HippyScrollableProtocol>)scrollableView;

@end


/// Scrollable components' protocol
@protocol HippyScrollableProtocol <UIScrollViewDelegate>

/// Return realScrollView's contentSize
@property (nonatomic, readonly) CGSize contentSize;

/// Add scroll event listener
/// - Parameter scrollListener: id
- (void)addScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener;

/// Remove scroll event listener
/// - Parameter scrollListener: id
- (void)removeScrollListener:(NSObject<UIScrollViewDelegate> *)scrollListener;

/// Get the real scrollView
- (UIScrollView *)realScrollView;

/// Get all scroll event listeners
- (NSHashTable *)scrollListeners;

@optional

/// Scroll to specific offset
/// - Parameters:
///   - offset: contentOffset CGPoint
///   - animated: BOOL
- (void)scrollToOffset:(CGPoint)offset animated:(BOOL)animated;

/// Scroll to specific index
/// - Parameters:
///   - index: NSInteger
///   - animated: BOOL
- (void)scrollToIndex:(NSInteger)index animated:(BOOL)animated;

/// Add layout event delegate
/// - Parameter delegate: id
- (void)addHippyScrollableLayoutDelegate:(id<HippyScrollableLayoutDelegate>)delegate;

/// Remove layout delegate
/// - Parameter delegate: id
- (void)removeHippyScrollableLayoutDelegate:(id<HippyScrollableLayoutDelegate>)delegate;

@end
