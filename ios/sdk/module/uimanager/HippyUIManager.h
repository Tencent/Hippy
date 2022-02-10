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

#import "HippyBridge.h"
#import "HippyBridgeModule.h"
#import "HippyInvalidating.h"
#import "HippyViewManager.h"
#import "HippyRootView.h"
#include <memory>
#include <unordered_map>
#import "HippyDomNodeUtils.h"
#include "dom/dom_value.h"
#include "dom/dom_listener.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#import "HippyDomNodeUtils.h"

@class HippyExtAnimationViewParams, HippyShadowView;

typedef void (^HippyViewUpdateCompletedBlock)(HippyUIManager *uiManager);

/**
 * UIManager queue
 */
HIPPY_EXTERN dispatch_queue_t HippyGetUIManagerQueue(void);

/**
 * Default name for the UIManager queue
 */
HIPPY_EXTERN const char *HippyUIManagerQueueName;

/**
 * Posted right before re-render happens. This is a chance for views to invalidate their state so
 * next render cycle will pick up updated views and layout appropriately.
 */
HIPPY_EXTERN NSString *const HippyUIManagerWillUpdateViewsDueToContentSizeMultiplierChangeNotification;

/**
 * Posted whenever a new root view is registered with HippyUIManager. The userInfo property
 * will contain a HippyUIManagerRootViewKey with the registered root view.
 */
HIPPY_EXTERN NSString *const HippyUIManagerDidRegisterRootViewNotification;

/**
 * Key for the root view property in the above notifications
 */
HIPPY_EXTERN NSString *const HippyUIManagerRootViewKey;

/**
 * Posted whenever endBatch is called
 */
HIPPY_EXTERN NSString *const HippyUIManagerDidEndBatchNotification;

/**
 * The HippyUIManager is the module responsible for updating the view hierarchy.
 */
@interface HippyUIManager : NSObject <HippyBridgeModule, HippyInvalidating>


/**
 * Register a root view with the HippyUIManager.
 */
- (void)registerRootView:(UIView *)rootView withSizeFlexibility:(HippyRootViewSizeFlexibility)sizeFlexibility;

/**
 * Gets the view associated with a hippyTag.
 */
- (UIView *)viewForHippyTag:(NSNumber *)hippyTag;

/**
 * Get the shadow view associated with a hippyTag
 */
- (HippyShadowView *)shadowViewForHippyTag:(NSNumber *)hippyTag;

/**
 * Update the frame of a view. This might be in response to a screen rotation
 * or some other layout event outside of the Hippy-managed view hierarchy.
 */
- (void)setFrame:(CGRect)frame forView:(UIView *)view;

/**
 * Update the background color of a view. The source of truth for
 * backgroundColor is the shadow view, so if to update backgroundColor from
 * native code you will need to call this method.
 */
- (void)setBackgroundColor:(UIColor *)color forView:(UIView *)view;

/**
 * Schedule a block to be executed on the UI thread. Useful if you need to execute
 * view logic after all currently queued view updates have completed.
 */
- (void)addUIBlock:(HippyViewManagerUIBlock)block;

/**
 * Schedule a block to be executed on the UIManager queue.
 */
- (void)executeBlockOnUIManagerQueue:(dispatch_block_t)block;

/**
 * Get root view hippyTag
 */
- (NSNumber *)rootHippyTag;

/**
 * In some cases we might want to trigger layout from native side.
 * Hippy won't be aware of this, so we need to make sure it happens.
 */
- (void)setNeedsLayout;

/**
 * After core animation did finish, we need to apply view's final status.
 *
 * @param params Animation params
 * @param block Completion block
 */
- (void)updateViewsFromParams:(NSArray<HippyExtAnimationViewParams *> *)params completion:(HippyViewUpdateCompletedBlock)block;

/**
 *  Manually update view props ,then flush block
 *
 *  @param hippyTag hippyTag for view
 *  @param props New properties for view
 */
- (void)updateViewWithHippyTag:(NSNumber *)hippyTag props:(NSDictionary *)props;

/**
 * Manully create a view from shadowView
 *
 * @param shadowView HippyShadowView corresponding to UIView
 * @return A view created by HippyShadowView
 */
- (UIView *)createViewFromShadowView:(HippyShadowView *)shadowView;

- (UIView *)createViewRecursivelyFromShadowView:(HippyShadowView *)shadowView;

/**
 * set dom manager for HippyUIManager which holds a weak reference to domManager
 */
- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager;

/**
 *  create views from dom nodes
 *  @param nodes A set of nodes for creating views
 */
- (void)createRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes;

/**
 *  update views' properties from dom nodes
 *  @param nodes A set of nodes for updating views' properties
 */
- (void)updateRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes;

/**
 *  delete views from dom nodes
 *  @param nodes nodes to delete
 */
- (void)deleteRenderNodesIds:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes;

/**
 * move views from container to another container
 *
 * @param ids A set of nodes id to move
 * @param fromContainer Source view container from which views move
 * @param toContainer Target view container to which views move
 */
- (void)renderMoveViews:(const std::vector<int32_t> &&)ids fromContainer:(int32_t)fromContainer toContainer:(int32_t)toContainer;

/**
 * update layout for view
 *
 * @param layoutInfos Vector for nodes layout infos
 */
- (void)updateNodesLayout:(const std::vector<std::tuple<int32_t, hippy::LayoutResult, bool,
                           std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>>>> &)layoutInfos;

/**
 * Invoked after batched operations completed
 */
- (void)batch;

/**
 * call function of view
 *
 * @param functionName Function Name to be invoked
 * @param viewName Name of target view whose function invokes
 * @param hippyTag id of target view whose function invokes
 * @param params parameters of function to be invoked
 * @param cb A callback for the return value of function
 */
- (void)dispatchFunction:(const std::string &)functionName viewName:(const std::string &)viewName viewTag:(int32_t)hippyTag
                  params:(const tdf::base::DomValue &)params callback:(hippy::CallFunctionCallback)cb;

/**
 * register event for specific view
 *
 * @param name event name
 * @param node_id id for node for the event
 */
- (void)addEventName:(const std::string &)name forDomNodeId:(int32_t)node_id;

/**
 * unregister event for specific view
 *
 * @param name event name
 * @param node_id node id for the event
 */
- (void)removeEventName:(const std::string &)name forDomNodeId:(int32_t)node_id;

/**
 * unregister event for specific view.
 *
 * @param name event name
 * @param node_id id of node for the event
 * @discussion this function will handle any event but gesture event, like touch, press, click, longclick, etc...
 */
- (void)addRenderEvent:(const std::string &)name forDomNode:(int32_t)node_id;

/**
 * unregister event for specific view
 *
 * @param name event name
 * @param node_id node id for the event
 */
- (void)removeRenderEvent:(const std::string &)name forDomNodeId:(int32_t)node_id;

@end

/**
 * This category makes the current HippyUIManager instance available via the
 * HippyBridge, which is useful for HippyBridgeModules or HippyViewManagers that
 * need to access the HippyUIManager.
 */
@interface HippyBridge (HippyUIManager)

@property (nonatomic, readonly) HippyUIManager *uiManager;

@end
