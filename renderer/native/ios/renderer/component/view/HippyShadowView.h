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

typedef NS_ENUM(NSUInteger, HippyCreationType) {
    HippyCreationTypeUndetermined = 0,
    HippyCreationTypeInstantly,
    HippyCreationTypeLazily,
};

@class HippyShadowView;

typedef void (^NativeRenderApplierBlock)(NSDictionary<NSNumber *, UIView *> *viewRegistry, UIView * _Nullable lazyCreatedView);

typedef UIView *_Nullable(^HippyViewCreationBlock)(HippyShadowView *shadowView);
typedef void (^HippyViewInsertionBlock)(UIView *container, NSArray<UIView *> *children);

/// ShadowView tree mirrors Hippy view tree. Every node is highly stateful.
/// 1. A node is in one of three lifecycles: uninitialized, computed, dirtied.
/// 2. At the end of each Bridge transaction, we call collectUpdatedFrames:widthConstraint:heightConstraint
///    at the root node to recursively layout the entire hierarchy.
/// 3. If a node is "computed" and the constraint passed from above is identical to the constraint used to
///    perform the last computation, we skip laying out the subtree entirely.
@interface HippyShadowView : NSObject <HippyComponent> {
@protected
    /// Indicates whether layout has been computed and processed.
    /// Set to YES after amendLayoutBeforeMount completes, reset to NO when properties or layout changes.
    BOOL _isLayoutComputed;
}


#pragma mark - Visibility & Layout Properties

/// Background color for this view.
/// @discussion This property is set by JS and used for rendering the view's background.
/// Note: Each view has its own backgroundColor; there is no automatic propagation to children.
@property(nonatomic, strong) UIColor *backgroundColor;

/// Whether layout direction has been confirmed changed and needs update.
@property(nonatomic, readonly) BOOL confirmedLayoutDirectionDidUpdated;

/// Frame set by layout system (computed by C++ DOM engine).
/// @discussion This is the only layout property actually used in HippyShadowView.
/// Other layout properties (top/left/width/height/etc) are exported to JS but handled entirely
/// by the C++ DOM engine, not stored in ObjC.
@property (nonatomic, assign) CGRect frame;

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

/// Marks the node as dirty, indicating it needs layout processing.
/// This method should be called when properties or layout changes.
- (void)markLayoutDirty NS_REQUIRES_SUPER;

/// Returns whether the node's layout has been computed.
/// @return YES if layout is computed and up-to-date, NO if dirty and needs processing.
- (BOOL)isLayoutComputed;

/// Marks text as dirty and optionally triggers a layout.
/// @param needToDoLayout Whether layout should be performed.
- (void)dirtyText:(BOOL)needToDoLayout NS_REQUIRES_SUPER;

/// Returns whether text layout is dirty.
- (BOOL)isTextDirty;

#pragma mark - Layout Style Getters

/// Gets the style width and height from C++ DomNode.
/// @discussion These values are the layout properties set from JS and managed by the C++ layout engine.
/// @return CGSize with width and height, or NAN values if unable to retrieve.
- (CGSize)getStyleSize;

/// Gets the style width from C++ DomNode.
/// @return Width value, or NAN if unable to retrieve.
- (CGFloat)getStyleWidth;

/// Gets the style height from C++ DomNode.
/// @return Height value, or NAN if unable to retrieve.
- (CGFloat)getStyleHeight;

/// Gets the padding from C++ LayoutResult.
/// @discussion Extracts padding values (paddingTop, paddingLeft, paddingBottom, paddingRight)
/// from the layout result computed by the C++ layout engine.
/// Mainly used by text components to calculate content area and apply contentInset.
/// @return UIEdgeInsets with padding values.
- (UIEdgeInsets)paddingAsInsets;

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
