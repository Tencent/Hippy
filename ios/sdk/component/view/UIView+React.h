/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
- (NSArray<UIView *> *)hippySubviews NS_REQUIRES_SUPER;
- (UIView *)hippySuperview NS_REQUIRES_SUPER;
- (void)insertHippySubview:(UIView *)subview atIndex:(NSInteger)atIndex;
- (void)removeHippySubview:(UIView *)subview;

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
