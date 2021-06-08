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
#import "HippyViewEventProtocol.h"

@class HippyShadowView;
@class HippyVirtualNode;

@interface UIView (Hippy) <HippyComponent, HippyViewEventProtocol, HippyViewTouchHandlerProtocol>

/**
 * HippyComponent interface.
 */
- (NSArray<UIView *> *)hippySubviews;
- (UIView *)hippySuperview;
- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex;
- (void)removeHippySubview:(UIView *)subview;
- (void)resetHippySubviews;

/**
 * HippyViewTouchHandlerProtocol interface.
 */
- (BOOL)interceptTouchEvent;

/**
 * z-index, used to override sibling order in didUpdateHippySubviews.
 */
@property (nonatomic, assign) NSInteger hippyZIndex;

/**
 * The hippySubviews array, sorted by zIndex. This value is cached and
 * automatically recalculated if views are added or removed.
 */
@property (nonatomic, copy, readonly) NSArray<UIView *> *sortedHippySubviews;

/**
 * Updates the subviews array based on the hippySubviews. Default behavior is
 * to insert the sortedHippySubviews into the UIView.
 */
- (void)didUpdateHippySubviews;

/**
 * Used by the UIIManager to set the view frame.
 * May be overriden to disable animation, etc.
 */
- (void)hippySetFrame:(CGRect)frame;

/**
 *
 */
- (void)didUpdateWithNode:(HippyVirtualNode *)node;

/**
 * Used to improve performance when compositing views with translucent content.
 */
- (void)hippySetInheritedBackgroundColor:(UIColor *)inheritedBackgroundColor;

/**
 * This method finds and returns the containing view controller for the view.
 */
- (UIViewController *)hippyViewController;

/**
 * This method attaches the specified controller as a child of the
 * the owning view controller of this view. Returns NO if no view
 * controller is found (which may happen if the view is not currently
 * attached to the view hierarchy).
 */
- (void)hippyAddControllerToClosestParent:(UIViewController *)controller;

/**
 * Responder overrides - to be deprecated.
 */
- (void)hippyWillMakeFirstResponder;
- (void)hippyDidMakeFirstResponder;
- (BOOL)hippyRespondsToTouch:(UITouch *)touch;

- (void)sendAttachedToWindowEvent;
- (void)sendDetachedFromWindowEvent;

#if HIPPY_DEV

/**
 Tools for debugging
 */

@property (nonatomic, strong, setter=_DEBUG_setHippyShadowView:) HippyShadowView *_DEBUG_hippyShadowView;

#endif

@end
