/*!
 * iOS SDK
 *
 * Tencent is pleased to support the open source community by making
 * NativeRender available.
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

#import "NativeRenderComponentProtocol.h"
#import "HPConvert+NativeRender.h"

#include <memory>

namespace hippy {
inline namespace dom {
class DomManager;
class DomNode;
class RootNode;
struct LayoutResult;
enum class Direction;
}
}

typedef NS_ENUM(NSUInteger, NativeRenderUpdateLifecycle) {
    NativeRenderUpdateLifecycleUninitialized = 0,
    NativeRenderUpdateLifecycleComputed = 1,
    NativeRenderUpdateLifecyclePropsDirtied = 2,
    NativeRenderUpdateLifecycleLayoutDirtied = 3,
    NativeRenderUpdateLifecycleAllDirtied = 4,
};

typedef NS_ENUM(NSUInteger, NativeRenderCreationType) {
    NativeRenderCreationTypeUndetermined = 0,
    NativeRenderCreationTypeInstantly,
    NativeRenderCreationTypeLazily,
};

@class NativeRenderObjectView;

typedef void (^NativeRenderApplierBlock)(NSDictionary<NSNumber *, UIView *> *viewRegistry);

typedef UIView *(^NativeRenderViewCreationBlock)(NativeRenderObjectView *renderObject);
typedef void (^NativeRenderViewInsertionBlock)(UIView *container, NSArray<UIView *> *children);

//TODO remove unused string
extern NSString *const NativeRenderShadowViewDiffInsertion;
extern NSString *const NativeRenderShadowViewDiffRemove;
extern NSString *const NativeRenderShadowViewDiffUpdate;
extern NSString *const NativeRenderShadowViewDiffTag;

/**
 * RenderObject tree mirrors NativeRender view tree. Every node is highly stateful.
 * 1. A node is in one of three lifecycles: uninitialized, computed, dirtied.
 * 2. At the end of each Bridge transaction, we call collectUpdatedFrames:widthConstraint:heightConstraint
 *    at the root node to recursively layout the entire hierarchy.
 * 3. If a node is "computed" and the constraint passed from above is identical to the constraint used to
 *    perform the last computation, we skip laying out the subtree entirely.
 */
@interface NativeRenderObjectView : NSObject <NativeRenderComponentProtocol> {
@protected
    NativeRenderUpdateLifecycle _propagationLifecycle;
}

/**
 * NativeRenderComponent interface.
 */

/**
 * Get all native render object
 */
- (NSArray<NativeRenderObjectView *> *)subcomponents;

/**
 * Get super render object
 */
- (NativeRenderObjectView *)parentComponent;

/**
 * Insert native render object at index.
 *
 * @param subview A render object subview to insert
 * @param atIndex position for hippy subview to insert
 * @discussion atIndex must not exceed range of current index
 */
- (void)insertNativeRenderSubview:(NativeRenderObjectView *)subview atIndex:(NSInteger)atIndex;

/**
 * Remove render object
 *
 * @param subview A render object to delete
 */
- (void)removeNativeRenderSubview:(NativeRenderObjectView *)subview;

@property(nonatomic, weak, readonly) NativeRenderObjectView *superview;
@property(nonatomic, copy) NSString *viewName;
@property(nonatomic, strong) UIColor *backgroundColor;  // Used to propagate to children
@property(nonatomic, copy) NativeRenderDirectEventBlock onLayout;
@property(nonatomic, readonly) BOOL confirmedLayoutDirectionDidUpdated;

/**
 * isHidden - NativeRenderUIManager uses this to determine whether or not the UIView should be hidden. Useful if the
 * RenderObject determines that its UIView will be clipped and wants to hide it.
 */
@property (nonatomic, assign, getter=isHidden) BOOL hidden;

/**
 * Position and dimensions.
 * Defaults to 0
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

/**
 * Get frame set by layout system
 */
@property (nonatomic, assign) CGRect frame;

/**
 * Get padding set by layout system
 */
@property(nonatomic, assign) UIEdgeInsets paddingAsInsets;

/**
 * z-index, used to override sibling order in the view
 */
@property (nonatomic, assign) NSInteger zIndex;

/**
 * Clipping properties
 */
//@property (nonatomic, assign) NSString *overflow;


#pragma mark - Text Attachment Properties

/// Vertical Alignment for Text / Text Attachment,
/// Note that this property only takes effect for Text Element.
@property (nonatomic, assign) NativeRenderTextVerticalAlignType verticalAlignType;

/// Vertical Align Offset for Text / Text Attachment,
/// Note that this property only takes effect for Text Element.
@property (nonatomic, assign) CGFloat verticalAlignOffset;


#pragma mark -

/**
 * Indicate how we create coresponding UIView
 * NativeRenderCreationTypeInstantly : create views instantly when NativeRenderObject is created
 * NativeRenderCreationTypeLazily: create views when UIView is needed
 */
@property (nonatomic, assign) NativeRenderCreationType creationType;

@property (nonatomic, assign) std::weak_ptr<hippy::DomManager> domManager;

@property (nonatomic, assign) std::weak_ptr<hippy::DomNode> domNode;

@property (nonatomic, assign) std::weak_ptr<hippy::RootNode> rootNode;

/**
 * set create type of itself and its all descendants to NativeRenderCreationTypeInstantly
 */
- (void)recusivelySetCreationTypeToInstant;

- (UIView *)createView:(NativeRenderViewCreationBlock)creationBlock insertChildren:(NativeRenderViewInsertionBlock)insertionBlock;

/**
 * reset layout frame to mark dirty and re-layout
 */
- (void)setLayoutFrame:(CGRect)frame;
- (void)setLayoutFrame:(CGRect)frame dirtyPropagation:(BOOL)dirtyPropagation;

/**
 * Calculate property changes that need to be propagated to the view.
 * The applierBlocks set contains NativeRenderApplierBlock functions that must be applied
 * on the main thread in order to update the view.
 */
- (void)collectUpdatedProperties:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks
                parentProperties:(NSDictionary<NSString *, id> *)parentProperties;

/**
 * Process the updated properties and apply them to view. Shadow view classes
 * that add additional propagating properties should override this method.
 */
- (NSDictionary<NSString *, id> *)processUpdatedProperties:(NSMutableSet<NativeRenderApplierBlock> *)applierBlocks
                                          parentProperties:(NSDictionary<NSString *, id> *)parentProperties;

- (void)amendLayoutBeforeMount:(NSMutableSet<NativeRenderApplierBlock> *)blocks;

/**
 * Return whether or not this node acts as a leaf node in the eyes of CSSLayout. For example
 * NativeRenderShadowText has children which it does not want CSSLayout to lay out so in the eyes of
 * CSSLayout it is a leaf node.
 */
- (BOOL)isCSSLeafNode;

- (void)dirtyPropagation:(NativeRenderUpdateLifecycle)type NS_REQUIRES_SUPER;
- (BOOL)isPropagationDirty:(NativeRenderUpdateLifecycle)dirtyType;

- (void)dirtyText:(BOOL)needToDoLayout NS_REQUIRES_SUPER;
- (void)setTextComputed NS_REQUIRES_SUPER;
- (BOOL)isTextDirty;

/**
 * As described in NativeRenderComponent protocol.
 */
- (void)didUpdateNativeRenderSubviews NS_REQUIRES_SUPER;
- (void)didSetProps:(NSArray<NSString *> *)changedProps NS_REQUIRES_SUPER;

- (NSDictionary *)mergeProps:(NSDictionary *)props;

/**
 * Add event to NativeRenderObject
 * @param name event name
 * @discussion In general, events are mounted directly on UIViews.
 * But for the lazy loading UIViews, UIViews may not be created when events requires to mount on UIViews.
 * So we have to mount on RenderObject temparily, and mount on UIViews when UIViews are created by NativeRenderObject
 */
- (void)addEventName:(const std::string &)name;

/**
 * Get all events name
 * @return all events name
 */
- (const std::vector<std::string> &)allEventNames;

/**
 * clear all event names
 */
- (void)clearEventNames;

@property(nonatomic, assign) hippy::LayoutResult nodeLayoutResult;

@property(nonatomic, assign) hippy::Direction layoutDirection;
@property(nonatomic, assign) hippy::Direction confirmedLayoutDirection;
- (void)applyConfirmedLayoutDirectionToSubviews:(hippy::Direction)confirmedLayoutDirection;
- (BOOL)isLayoutSubviewsRTL;

@end
