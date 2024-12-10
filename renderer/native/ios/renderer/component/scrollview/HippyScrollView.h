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
#import "HippyScrollableProtocol.h"
#import "HippyView.h"


/// Delegate for handling nested scrolls' gesture conflict
@protocol HippyNestedScrollGestureDelegate <NSObject>

/// Ask the delegate whether gesture should recognize simultaneously
/// For nested scroll
/// @param view the other view
- (BOOL)shouldRecognizeScrollGestureSimultaneouslyWithView:(UIView *)view;

@end


/// Protocol for nested scrollview
@protocol HippyNestedScrollProtocol <NSObject>

/// Record the last content offset for scroll lock.
@property (nonatomic, assign) CGPoint lastContentOffset;

/// Record the current active inner scrollable view.
/// Used to judge the responder when outer has more than one inner scrollview.
@property (nonatomic, weak) UIScrollView<HippyNestedScrollProtocol> *activeInnerScrollView;

/// Record the current active outer scrollable view.
/// Used to pass the cascadeLock when more than three scrollable views nested.
@property (nonatomic, weak) UIScrollView<HippyNestedScrollProtocol> *activeOuterScrollView;

/// Gesture delegate for handling nested scroll.
@property (nonatomic, weak) id<HippyNestedScrollGestureDelegate> nestedGestureDelegate;

/// Cascade lock for nestedScroll
@property (nonatomic, assign) BOOL cascadeLockForNestedScroll;

/// Whether is temporarily locked in current DidScroll callback.
/// It is used to determine whether to block the sending of onScroll events.
@property (nonatomic, assign) BOOL isLockedInNestedScroll;

@end


/// The hippy's custom scrollView
@interface HippyCustomScrollView : UIScrollView <UIGestureRecognizerDelegate, HippyNestedScrollProtocol>

/// Whether the content needs to be centered.
@property (nonatomic, assign) BOOL centerContent;

@end


/// The HippyScrollView component
@interface HippyScrollView : HippyView <UIScrollViewDelegate, HippyScrollableProtocol>

/**
 * This is where subclasses should create their custom scroll view hierarchy if they dont want to use default scroll view.
 * Should never be called directly.
 */
- (HippyCustomScrollView *)loadScrollView;

/**
 * The `HippyScrollView` may have at most one single subview. This will ensure
 * that the scroll view's `contentSize` will be efficiently set to the size of
 * the single subview's frame. That frame size will be determined somewhat
 * efficiently since it will have already been computed by the off-main-thread
 * layout system.
 */
@property (nonatomic, readonly) UIView *contentView;

/**
 * If the `contentSize` is not specified (or is specified as {0, 0}, then the
 * `contentSize` will automatically be determined by the size of the subview.
 */
@property (nonatomic, assign) CGSize contentSize;

/**
 * Get the underlying scrollview.
 */
@property (nonatomic, readonly) UIScrollView *scrollView;

@property (nonatomic, assign, readonly) UIEdgeInsets contentInset;
@property (nonatomic, assign) NSTimeInterval scrollEventThrottle;
@property (nonatomic, assign) BOOL centerContent;
@property (nonatomic, assign) int snapToInterval;
@property (nonatomic, copy) NSString *snapToAlignment;
@property (nonatomic, copy) NSIndexSet *stickyHeaderIndices;
@property (nonatomic, assign) BOOL horizontal;

// NOTE: currently these event props are only declared so we can export the
// event names to JS - we don't call the blocks directly because scroll events
// need to be coalesced before sending, for performance reasons.
@property (nonatomic, copy) HippyDirectEventBlock onScrollBeginDrag;
@property (nonatomic, copy) HippyDirectEventBlock onScroll;
@property (nonatomic, copy) HippyDirectEventBlock onScrollEndDrag;
@property (nonatomic, copy) HippyDirectEventBlock onMomentumScrollBegin;
@property (nonatomic, copy) HippyDirectEventBlock onMomentumScrollEnd;
@property (nonatomic, copy) HippyDirectEventBlock onScrollAnimationEnd;

@property (nonatomic, assign) CGPoint targetOffset;

@end
