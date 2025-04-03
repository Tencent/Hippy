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

#ifndef HippyNestedScrollProtocol_h
#define HippyNestedScrollProtocol_h

#import <UIKit/UIKit.h>


#define HIPPY_NESTEDSCROLL_PROTOCOL_PROPERTY_IMP \
@synthesize lastContentOffset; \
@synthesize shouldHaveActiveInner; \
@synthesize activeInnerScrollView; \
@synthesize activeOuterScrollView; \
@synthesize nestedGestureDelegate; \
@synthesize cascadeLockForNestedScroll; \
@synthesize isLockedInNestedScroll; \
@synthesize tempLastContentOffsetForMultiLayerNested;


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

/// A flag indicates that outer should have activeInner,
/// which is set during shouldRecognizeSimultaneously and reset during EndDragging.
/// Use it for unrelated rolling event filtering
@property (nonatomic, assign) BOOL shouldHaveActiveInner;

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

/// lastContentOffset value recorded for multi-level nested scenarios
/// Use only once, set to nil after use.
@property (nonatomic, strong) NSValue *tempLastContentOffsetForMultiLayerNested;

@end

#endif /* HippyNestedScrollProtocol_h */
