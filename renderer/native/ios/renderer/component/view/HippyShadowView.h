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
#import "HippyConvert+NativeRender.h"

NS_ASSUME_NONNULL_BEGIN

typedef NS_ENUM(NSUInteger, NativeRenderUpdateLifecycle) {
    NativeRenderUpdateLifecycleUninitialized = 0,
    NativeRenderUpdateLifecycleComputed = 1,
    NativeRenderUpdateLifecyclePropsDirtied = 2,
    NativeRenderUpdateLifecycleLayoutDirtied = 3,
    NativeRenderUpdateLifecycleAllDirtied = 4,
};

typedef NS_ENUM(NSUInteger, HippyCreationType) {
    HippyCreationTypeUndetermined = 0,
    HippyCreationTypeInstantly,
    HippyCreationTypeLazily,
};

@class HippyShadowView;

typedef void (^NativeRenderApplierBlock)(NSDictionary<NSNumber *, UIView *> *viewRegistry, UIView * _Nullable lazyCreatedView);

typedef UIView *_Nullable(^HippyViewCreationBlock)(HippyShadowView *renderObject);
typedef void (^HippyViewInsertionBlock)(UIView *container, NSArray<UIView *> *children);

/// ShadowView tree mirrors Hippy view tree. Every node is highly stateful.
/// 1. A node is in one of three lifecycles: uninitialized, computed, dirtied.
/// 2. At the end of each Bridge transaction, we call collectUpdatedFrames:widthConstraint:heightConstraint
///    at the root node to recursively layout the entire hierarchy.
/// 3. If a node is "computed" and the constraint passed from above is identical to the constraint used to
///    perform the last computation, we skip laying out the subtree entirely.
@interface HippyShadowView : NSObject <HippyComponent> {
@protected
    NativeRenderUpdateLifecycle _propagationLifecycle;
}


#pragma mark - Visibility & Layout Properties

/// Background color propagated to children where appropriate.
@property(nonatomic, strong) UIColor *backgroundColor;

/// Whether layout direction has been confirmed changed and needs update.
@property(nonatomic, readonly) BOOL confirmedLayoutDirectionDidUpdated;

/// Whether the corresponding UIView should be hidden.
/// @discussion NativeRenderUIManager uses this to determine visibility. Useful when
/// the view will be clipped and should not be displayed.
@property (nonatomic, assign, getter=isHidden) BOOL hidden;

/// Position and dimensions.
/// Defaults to 0
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

/// Get frame set by layout system
@property (nonatomic, assign) CGRect frame;

/// Get padding set by layout system
@property(nonatomic, assign) UIEdgeInsets paddingAsInsets;

/// z-index, used to override sibling order in the view
@property (nonatomic, assign) NSInteger zIndex;


#pragma mark - Text Attachment Properties

/// Vertical alignment for text / text attachment.
/// @discussion Only takes effect for text-related elements.
@property (nonatomic, assign) HippyTextVerticalAlignType verticalAlignType;

/// Vertical align offset for text / text attachment.
/// @discussion Only takes effect for text-related elements.
@property (nonatomic, assign) CGFloat verticalAlignOffset;


#pragma mark - Creation & View Instantiation

/// Indicates how the corresponding UIView should be created.
/// @discussion
/// - HippyCreationTypeInstantly: Create views when the HippyShadowView is created.
/// - HippyCreationTypeLazily: Create views only when the UIView is needed.
@property (nonatomic, assign) HippyCreationType creationType;

/// Recursively sets the creation type of this node and all descendants to HippyCreationTypeInstantly.
- (void)synchronousRecursivelySetCreationTypeToInstant;

/// Creates the UIView hierarchy for this shadow view subtree.
/// @param creationBlock Block used to create a UIView for a shadow node.
/// @param insertionBlock Block used to insert child UIViews into a container.
/// @return The created container UIView for this shadow node.
- (UIView *)createView:(HippyViewCreationBlock)creationBlock insertChildren:(HippyViewInsertionBlock)insertionBlock;

#pragma mark - Layout & Mounting

/// Resets the layout frame and marks dirty for re-layout.
/// @param frame The new layout frame.
- (void)setLayoutFrame:(CGRect)frame;

/// Resets the layout frame and optionally propagates layout dirtiness.
/// @param frame The new layout frame.
/// @param dirtyPropagation Whether to propagate layout dirtiness up the tree.
- (void)setLayoutFrame:(CGRect)frame dirtyPropagation:(BOOL)dirtyPropagation;

/// Called by UIManager before mounting views.
/// @param blocks Blocks to be executed before mount.
 - (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks;

/// Provides a hook to modify the view before mounting.
/// @discussion Suitable for handling layout adjustments that need to occur
/// after the layout engine has completed calculations.
/// @param applierBlocks Blocks to be executed.
- (void)processUpdatedPropertiesBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks;

#pragma mark - Dirty Propagation & Text

/// Return whether or not this node acts as a leaf node in the eyes of CSSLayout.
/// For example, HippyShadowText has children which it does not want CSSLayout to lay out
/// so in the eyes of CSSLayout it is a leaf node.
- (BOOL)isCSSLeafNode;

/// Marks the node as dirty and propagates the specified lifecycle change.
/// @param type The lifecycle change to propagate.
- (void)dirtyPropagation:(NativeRenderUpdateLifecycle)type NS_REQUIRES_SUPER;

/// Returns whether the node is dirty for the specified lifecycle.
/// @param dirtyType The lifecycle to check.
- (BOOL)isPropagationDirty:(NativeRenderUpdateLifecycle)dirtyType;

/// Marks text as dirty and optionally triggers a layout.
/// @param needToDoLayout Whether layout should be performed.
- (void)dirtyText:(BOOL)needToDoLayout NS_REQUIRES_SUPER;

/// Indicates text layout has been computed.
- (void)setTextComputed NS_REQUIRES_SUPER;

/// Returns whether text layout is dirty.
- (BOOL)isTextDirty;

#pragma mark - Component Protocol

/// As described in NativeRenderComponent protocol.
- (void)didUpdateHippySubviews NS_REQUIRES_SUPER;

/// Called after props are set.
/// @param changedProps The keys of properties that have changed.
- (void)didSetProps:(NSArray<NSString *> *)changedProps NS_REQUIRES_SUPER;

/// Merges new props into current props and returns the actual changes to apply.
/// @param props New props to merge.
/// @return The delta props that should be applied.
- (NSDictionary *)mergeProps:(NSDictionary *)props;

@end

NS_ASSUME_NONNULL_END
