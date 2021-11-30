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

#import "HippyVirtualNode.h"

typedef NS_ENUM(NSUInteger, HippyUpdateLifecycle) {
    HippyUpdateLifecycleUninitialized = 0,
    HippyUpdateLifecycleComputed,
    HippyUpdateLifecycleDirtied,
};

typedef void (^HippyApplierBlock)(NSDictionary<NSNumber *, UIView *> *viewRegistry);

typedef void (^HippyApplierVirtualBlock)(NSDictionary<NSNumber *, HippyVirtualNode *> *virtualNodeRegistry);

/**
 * ShadowView tree mirrors Hippy view tree. Every node is highly stateful.
 * 1. A node is in one of three lifecycles: uninitialized, computed, dirtied.
 * 1. HippyBridge may call any of the padding/margin/width/height/top/left setters. A setter would dirty
 *    the node and all of its ancestors.
 * 2. At the end of each Bridge transaction, we call collectUpdatedFrames:widthConstraint:heightConstraint
 *    at the root node to recursively lay out the entire hierarchy.
 * 3. If a node is "computed" and the constraint passed from above is identical to the constraint used to
 *    perform the last computation, we skip laying out the subtree entirely.
 */
@interface HippyShadowView : NSObject <HippyComponent>

/**
 * HippyComponent interface.
 */
- (NSArray<HippyShadowView *> *)hippySubviews NS_REQUIRES_SUPER;
- (HippyShadowView *)hippySuperview NS_REQUIRES_SUPER;
- (void)insertHippySubview:(HippyShadowView *)subview atIndex:(NSInteger)atIndex NS_REQUIRES_SUPER;
- (void)removeHippySubview:(HippyShadowView *)subview NS_REQUIRES_SUPER;

@property (nonatomic, weak, readonly) HippyShadowView *superview;
//@property (nonatomic, assign, readonly) CSSNodeRef cssNode;
@property (nonatomic, assign, readonly) HPNodeRef nodeRef;
@property (nonatomic, copy) NSString *viewName;
@property (nonatomic, strong) UIColor *backgroundColor;  // Used to propagate to children
@property (nonatomic, copy) HippyDirectEventBlock onLayout;
@property (nonatomic, assign) BOOL isList;
@property (nonatomic, weak) HippyBridge *bridge;
@property (nonatomic, assign) HPDirection layoutDirection;
@property (nonatomic, copy) NSString *visibility;
@property (nonatomic, assign) BOOL visibilityChanged;

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
 * Position and dimensions.
 * Defaults to { 0, 0, NAN, NAN }.
 */
@property (nonatomic, assign) CGFloat top;
@property (nonatomic, assign) CGFloat left;
@property (nonatomic, assign) CGFloat bottom;
@property (nonatomic, assign) CGFloat right;

@property (nonatomic, assign) CGFloat width;
@property (nonatomic, assign) CGFloat height;

@property (nonatomic, assign) CGFloat minWidth;
@property (nonatomic, assign) CGFloat maxWidth;
@property (nonatomic, assign) CGFloat minHeight;
@property (nonatomic, assign) CGFloat maxHeight;

@property (nonatomic, assign) CGRect frame;

- (void)setTopLeft:(CGPoint)topLeft;
- (void)setSize:(CGSize)size;

/**
 * Set the natural size of the view, which is used when no explicit size is set.
 * Use UIViewNoIntrinsicMetric to ignore a dimension.
 */
- (void)setIntrinsicContentSize:(CGSize)size;

/**
 * Border. Defaults to { 0, 0, 0, 0 }.
 */
@property (nonatomic, assign) CGFloat borderWidth;
@property (nonatomic, assign) CGFloat borderTopWidth;
@property (nonatomic, assign) CGFloat borderLeftWidth;
@property (nonatomic, assign) CGFloat borderBottomWidth;
@property (nonatomic, assign) CGFloat borderRightWidth;

/**
 * Margin. Defaults to { 0, 0, 0, 0 }.
 */
@property (nonatomic, assign) CGFloat margin;
@property (nonatomic, assign) CGFloat marginVertical;
@property (nonatomic, assign) CGFloat marginHorizontal;
@property (nonatomic, assign) CGFloat marginTop;
@property (nonatomic, assign) CGFloat marginLeft;
@property (nonatomic, assign) CGFloat marginBottom;
@property (nonatomic, assign) CGFloat marginRight;

/**
 * Padding. Defaults to { 0, 0, 0, 0 }.
 */
@property (nonatomic, assign) CGFloat padding;
@property (nonatomic, assign) CGFloat paddingVertical;
@property (nonatomic, assign) CGFloat paddingHorizontal;
@property (nonatomic, assign) CGFloat paddingTop;
@property (nonatomic, assign) CGFloat paddingLeft;
@property (nonatomic, assign) CGFloat paddingBottom;
@property (nonatomic, assign) CGFloat paddingRight;

- (UIEdgeInsets)paddingAsInsets;

/**
 * Flexbox properties. All zero/disabled by default
 */
@property (nonatomic, assign) FlexDirection flexDirection;
@property (nonatomic, assign) FlexAlign justifyContent;
@property (nonatomic, assign) FlexAlign alignSelf;
@property (nonatomic, assign) FlexAlign alignItems;
@property (nonatomic, assign) PositionType position;
@property (nonatomic, assign) FlexWrapMode flexWrap;
@property (nonatomic, assign) DisplayType displayType;
@property (nonatomic, assign) CGFloat flex;
@property (nonatomic, assign) CGFloat flexGrow;
@property (nonatomic, assign) CGFloat flexShrink;
@property (nonatomic, assign) CGFloat flexBasis;

@property (nonatomic, assign) BOOL animated;

/**
 * z-index, used to override sibling order in the view
 */
@property (nonatomic, assign) NSInteger zIndex;

/**
 * Clipping properties
 */
@property (nonatomic, assign) OverflowType overflow;

/**
 * Calculate property changes that need to be propagated to the view.
 * The applierBlocks set contains HippyApplierBlock functions that must be applied
 * on the main thread in order to update the view.
 */

- (void)collectUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
            virtualApplierBlocks:(NSMutableSet<HippyApplierVirtualBlock> *)virtualApplierBlocks
                parentProperties:(NSDictionary<NSString *, id> *)parentProperties;

- (void)collectUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks parentProperties:(NSDictionary<NSString *, id> *)parentProperties;

/**
 * Process the updated properties and apply them to view. Shadow view classes
 * that add additional propagating properties should override this method.
 */
- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
                                      virtualApplierBlocks:(NSMutableSet<HippyApplierVirtualBlock> *)virtualApplierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties NS_REQUIRES_SUPER;

- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<HippyApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties NS_REQUIRES_SUPER;

/**
 * Can be called by a parent on a child in order to calculate all views whose frame needs
 * updating in that branch. Adds these frames to `viewsWithNewFrame`. Useful if layout
 * enters a view where flex doesn't apply (e.g. Text) and then you want to resume flex
 * layout on a subview.
 */
- (void)collectUpdatedFrames:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
                   withFrame:(CGRect)frame
                      hidden:(BOOL)hidden
            absolutePosition:(CGPoint)absolutePosition;

/**
 * Apply the CSS layout.
 * This method also calls `applyLayoutToChildren:` internally. The functionality
 * is split into two methods so subclasses can override `applyLayoutToChildren:`
 * while using default implementation of `applyLayoutNode:`.
 */
- (void)applyLayoutNode:(HPNodeRef)node
      viewsWithNewFrame:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
       absolutePosition:(CGPoint)absolutePosition NS_REQUIRES_SUPER;

/**
 * Enumerate the child nodes and tell them to apply layout.
 */
- (void)applyLayoutToChildren:(HPNodeRef)node
            viewsWithNewFrame:(NSMutableSet<HippyShadowView *> *)viewsWithNewFrame
             absolutePosition:(CGPoint)absolutePosition;

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

@end
