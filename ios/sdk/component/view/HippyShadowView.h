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

#include "HPNode.h"
#include "Hippy.h"
#import "HippyComponent.h"
#import "HippyRootView.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "dom/layout_node.h"
#import "HippyDomNodeUtils.h"

typedef NS_ENUM(NSUInteger, HippyUpdateLifecycle) {
    HippyUpdateLifecycleUninitialized = 0,
    HippyUpdateLifecycleComputed,
    HippyUpdateLifecycleDirtied,
};

@class HippyShadowView;

HIPPY_EXTERN CGRect getShadowViewRectFromDomNode(HippyShadowView *shadowView);

typedef void (^HippyApplierBlock)(NSDictionary<NSNumber *, UIView *> *viewRegistry);

/**
 * ShadowView tree mirrors Hippy view tree. Every node is highly stateful.
 * 1. A node is in one of three lifecycles: uninitialized, computed, dirtied.
 * 2. At the end of each Bridge transaction, we call collectUpdatedFrames:widthConstraint:heightConstraint
 *    at the root node to recursively layout the entire hierarchy.
 * 3. If a node is "computed" and the constraint passed from above is identical to the constraint used to
 *    perform the last computation, we skip laying out the subtree entirely.
 */
@interface HippyShadowView : NSObject <HippyComponent>

/**
 * HippyComponent interface.
 */

/**
 * Get all hippy shadow views
 */
- (NSArray<HippyShadowView *> *)hippySubviews NS_REQUIRES_SUPER;

/**
 * Get super shadow view
 */
- (HippyShadowView *)hippySuperview NS_REQUIRES_SUPER;

/**
 * Insert hippy shadow view at index.
 *
 * @param subview A hippy shadow subview to insert
 * @param atIndex position for hippy subview to insert
 * @discussion atIndex must not exceed range of current index
 */
- (void)insertHippySubview:(HippyShadowView *)subview atIndex:(NSInteger)atIndex;

/**
 * Remove hippy shadow view
 *
 * @param subview A hippy shadow subview to delete
 */
- (void)removeHippySubview:(HippyShadowView *)subview;

@property (nonatomic, weak, readonly) HippyShadowView *superview;
@property (nonatomic, copy) NSString *viewName;
@property (nonatomic, strong) UIColor *backgroundColor;  // Used to propagate to children
@property (nonatomic, copy) HippyDirectEventBlock onLayout;
@property (nonatomic, assign) BOOL isList;
@property (nonatomic, weak) HippyBridge *bridge;
@property (nonatomic, assign) HPDirection layoutDirection;
@property (nonatomic, copy) NSString *visibility;
@property (nonatomic, assign) BOOL visibilityChanged;
@property (nonatomic, assign) BOOL hasNewLayout;

/**
 * isNewView - Used to track the first time the view is introduced into the hierarchy.  It is initialized YES, then is
 * set to NO in HippyUIManager after the layout pass is done and all frames have been extracted to be applied to the
 * corresponding UIViews.
 */
@property (nonatomic, assign, getter=isNewView) BOOL newView;

/**
 * isHidden - HippyUIManager uses this to determine whether or not the UIView should be hidden. Useful if the
 * ShadowView determines that its UIView will be clipped and wants to hide it.
 */
@property (nonatomic, assign, getter=isHidden) BOOL hidden;

/**
 * Get frame set by layout system
 */
@property (nonatomic, assign) CGRect frame;

/**
 * Get padding set by layout system
 */
@property(nonatomic, assign) UIEdgeInsets paddingAsInsets;

/**
 * Indicate whether the view corresponding to this can animate
 */
@property (nonatomic, assign) BOOL animated;

/**
 * z-index, used to override sibling order in the view
 */
@property (nonatomic, assign) NSInteger zIndex;

/**
 * Clipping properties
 */
@property (nonatomic, assign) OverflowType overflow;

- (void)setDomNode:(std::weak_ptr<hippy::DomNode>)domNode;
- (const std::weak_ptr<hippy::DomNode> &)domNode;

/**
 * reset layout frame to mark dirty and re-layout
 */
- (void)setLayoutFrame:(CGRect)frame;

/**
 * Calculate property changes that need to be propagated to the view.
 * The applierBlocks set contains HippyApplierBlock functions that must be applied
 * on the main thread in order to update the view.
 */
- (void)collectUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
                parentProperties:(NSDictionary<NSString *, id> *)parentProperties;

/**
 * Process the updated properties and apply them to view. Shadow view classes
 * that add additional propagating properties should override this method.
 */
- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties NS_REQUIRES_SUPER;

- (void)collectShadowViewsHaveNewLayoutResults:(NSMutableSet<HippyShadowView *> *)shadowViewsNeedToApplyLayout;

/**
 * Return whether or not this node acts as a leaf node in the eyes of CSSLayout. For example
 * HippyShadowText has children which it does not want CSSLayout to lay out so in the eyes of
 * CSSLayout it is a leaf node.
 */
- (BOOL)isCSSLeafNode;

- (void)dirtyPropagation NS_REQUIRES_SUPER;
- (BOOL)isPropagationDirty;

- (void)dirtyText NS_REQUIRES_SUPER;
- (void)setTextComputed NS_REQUIRES_SUPER;
- (BOOL)isTextDirty;

/**
 * As described in HippyComponent protocol.
 */
- (void)didUpdateHippySubviews NS_REQUIRES_SUPER;
- (void)didSetProps:(NSArray<NSString *> *)changedProps NS_REQUIRES_SUPER;

/**
 * Computes the recursive offset, meaning the sum of all descendant offsets -
 * this is the sum of all positions inset from parents. This is not merely the
 * sum of `top`/`left`s, as this function uses the *actual* positions of
 * children, not the style specified positions - it computes this based on the
 * resulting layout. It does not yet compensate for native scroll view insets or
 * transforms or anchor points.
 */
- (CGRect)measureLayoutRelativeToAncestor:(HippyShadowView *)ancestor;

/**
 * Checks if the current shadow view is a descendant of the provided `ancestor`
 */
- (BOOL)viewIsDescendantOf:(HippyShadowView *)ancestor;

- (NSDictionary *)mergeProps:(NSDictionary *)props;

/**
 * check if the current shadowview is a descendant of a shadow view whose corresponding view is created lazily
 */
- (BOOL)isDescendantOfLazilyCreatedShadowView;

/**
 * If true, UIView will be created as needed, not instantly
 */
- (BOOL)isInstantlyCreatedView;

@end
