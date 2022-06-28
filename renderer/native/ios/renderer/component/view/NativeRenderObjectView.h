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
#import "HippyDomNodeUtils.h"
#import "HippyComponent.h"
#include "dom/dom_listener.h"
#include "dom/dom_node.h"
#include "dom/layout_node.h"
#include "dom/root_node.h"
#include "Hippy.h"
#include "Flex.h"
#import "HippyDefines.h"

typedef NS_ENUM(NSUInteger, HippyUpdateLifecycle) {
    HippyUpdateLifecycleUninitialized = 0,
    HippyUpdateLifecycleComputed,
    HippyUpdateLifecycleDirtied,
};

typedef NS_ENUM(NSUInteger, HippyCreationType) {
    HippyCreationTypeUndetermined = 0,
    HippyCreationTypeInstantly,
    HippyCreationTypeLazily,
};

@class NativeRenderObjectView;

typedef void (^HippyApplierBlock)(NSDictionary<NSNumber *, UIView *> *viewRegistry);

typedef UIView *(^HippyViewCreationBlock)(NativeRenderObjectView *renderObject);
typedef void (^HippyViewInsertionBlock)(UIView *container, NSArray<UIView *> *children);

//TODO remove unused string
extern NSString *const HippyShadowViewDiffInsertion;
extern NSString *const HippyShadowViewDiffRemove;
extern NSString *const HippyShadowViewDiffUpdate;
extern NSString *const HippyShadowViewDiffTag;

/**
 * RenderObject tree mirrors Hippy view tree. Every node is highly stateful.
 * 1. A node is in one of three lifecycles: uninitialized, computed, dirtied.
 * 2. At the end of each Bridge transaction, we call collectUpdatedFrames:widthConstraint:heightConstraint
 *    at the root node to recursively layout the entire hierarchy.
 * 3. If a node is "computed" and the constraint passed from above is identical to the constraint used to
 *    perform the last computation, we skip laying out the subtree entirely.
 */
@interface NativeRenderObjectView : NSObject <HippyComponent>

/**
 * HippyComponent interface.
 */

/**
 * Get all hippy shadow views
 */
- (NSArray<NativeRenderObjectView *> *)hippySubviews NS_REQUIRES_SUPER;

/**
 * Get super shadow view
 */
- (NativeRenderObjectView *)hippySuperview NS_REQUIRES_SUPER;

/**
 * Insert hippy shadow view at index.
 *
 * @param subview A hippy shadow subview to insert
 * @param atIndex position for hippy subview to insert
 * @discussion atIndex must not exceed range of current index
 */
- (void)insertHippySubview:(NativeRenderObjectView *)subview atIndex:(NSInteger)atIndex;

/**
 * Remove hippy shadow view
 *
 * @param subview A hippy shadow subview to delete
 */
- (void)removeHippySubview:(NativeRenderObjectView *)subview;

@property(nonatomic, weak, readonly) NativeRenderObjectView *superview;
@property(nonatomic, copy) NSString *viewName;
@property(nonatomic, strong) UIColor *backgroundColor;  // Used to propagate to children
@property(nonatomic, copy) HippyDirectEventBlock onLayout;
@property(nonatomic, assign) BOOL isList;
@property(nonatomic, copy) NSString *visibility;
@property(nonatomic, assign) BOOL visibilityChanged;
@property(nonatomic, assign) BOOL hasNewLayout;
@property(nonatomic, readonly) BOOL confirmedLayoutDirectionDidUpdated;

/**
 * isHidden - HippyUIManager uses this to determine whether or not the UIView should be hidden. Useful if the
 * RenderObject determines that its UIView will be clipped and wants to hide it.
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
 * z-index, used to override sibling order in the view
 */
@property (nonatomic, assign) NSInteger zIndex;

/**
 * Clipping properties
 */
@property (nonatomic, assign) OverflowType overflow;

/**
 * Indicate how we create coresponding UIView
 * HippyCreationTypeInstantly : create views instantly when NativeRenderObject is created
 * HippyCreationTypeLazily: create views when UIView is needed
 */
@property (nonatomic, assign) HippyCreationType creationType;

@property (nonatomic, assign) std::weak_ptr<hippy::DomManager>domManager;

@property (nonatomic, assign) std::weak_ptr<hippy::RootNode>rootNode;

/**
 * set create type of itself and its all descendants to HippyCreationTypeInstantly
 */
- (void)recusivelySetCreationTypeToInstant;

- (UIView *)createView:(HippyViewCreationBlock)creationBlock insertChildren:(HippyViewInsertionBlock)insertionBlock;

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

- (void)amendLayoutBeforeMount;

/**
 * Return whether or not this node acts as a leaf node in the eyes of CSSLayout. For example
 * HippyShadowText has children which it does not want CSSLayout to lay out so in the eyes of
 * CSSLayout it is a leaf node.
 */
- (BOOL)isCSSLeafNode;

- (void)dirtyPropagation NS_REQUIRES_SUPER;
- (void)dirtySelfPropagation;
- (void)dirtyDescendantPropagation;
- (BOOL)isPropagationDirty;

- (void)dirtyText NS_REQUIRES_SUPER;
- (void)setTextComputed NS_REQUIRES_SUPER;
- (BOOL)isTextDirty;

/**
 * As described in HippyComponent protocol.
 */
- (void)didUpdateHippySubviews NS_REQUIRES_SUPER;
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

@property(nonatomic, assign) HPDirection layoutDirection;
@property(nonatomic, assign) HPDirection confirmedLayoutDirection;
- (void)applyConfirmedLayoutDirectionToSubviews:(HPDirection)confirmedLayoutDirection;
- (BOOL)isLayoutSubviewsRTL;

@end
