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

#import "NativeRenderInvalidating.h"
#import "NativeRenderViewManager.h"
#include <memory>
#include <unordered_map>
#import "NativeRenderDomNodeUtils.h"
#include "footstone/hippy_value.h"
#include "dom/dom_listener.h"
#include "dom/dom_manager.h"
#include "dom/dom_node.h"
#import "NativeRenderDomNodeUtils.h"
#import "NativeRenderContext.h"

@class NativeRenderAnimationViewParams, NativeRenderObjectView;

/**
 * Posted whenever a new root view is registered with NativeRenderUIManager. The userInfo property
 * will contain a NativeRenderUIManagerRootViewKey with the registered root view.
 */
NATIVE_RENDER_EXTERN NSString *const NativeRenderUIManagerDidRegisterRootViewNotification;

/**
 * Key for the root view property in the above notifications
 */
NATIVE_RENDER_EXTERN NSString *const NativeRenderUIManagerRootViewTagKey;

/**
 * Key for Render UIManager
 */
NATIVE_RENDER_EXTERN NSString *const NativeRenderUIManagerKey;

/**
 * Posted whenever endBatch is called
 */
NATIVE_RENDER_EXTERN NSString *const NativeRenderUIManagerDidEndBatchNotification;

/**
 * The NativeRenderUIManager is the module responsible for updating the view hierarchy.
 */
@interface NativeRenderImpl : NSObject <NativeRenderInvalidating, NativeRenderContext>

@property(nonatomic, assign) BOOL uiCreationLazilyEnabled;

/**
 * Gets the view associated with a componentTag.
 */
- (UIView *)viewForComponentTag:(NSNumber *)componentTag
                  onRootTag:(NSNumber *)rootTag;


/**
 * Get the shadow view associated with a componentTag
 */
- (NativeRenderObjectView *)renderObjectForcomponentTag:(NSNumber *)componentTag
                                          onRootTag:(NSNumber *)rootTag;

/**
 * Update the frame of a view. This might be in response to a screen rotation
 * or some other layout event outside of the NativeRender-managed view hierarchy.
 */
- (void)setFrame:(CGRect)frame forRootView:(UIView *)view;

/**
 * Schedule a block to be executed on the UI thread. Useful if you need to execute
 * view logic after all currently queued view updates have completed.
 */
- (void)addUIBlock:(NativeRenderRenderUIBlock)block;

/**
 * In some cases we might want to trigger layout from native side.
 * NativeRender won't be aware of this, so we need to make sure it happens.
 */
- (void)setNeedsLayoutForRootNodeTag:(NSNumber *)tag;

/**
 * Manully create views recursively from hippy tag
 *
 * @param componentTag hippy tag corresponding to UIView
 * @return view created by hippy tag
 */
- (UIView *)createViewRecursivelyFromcomponentTag:(NSNumber *)componentTag
                                    onRootTag:(NSNumber *)rootTag;

/**
 * Manully create views recursively from renderObject
 *
 * @param renderObject NativeRenderObjectView corresponding to UIView
 * @return view created by NativeRenderObjectView
 */
- (UIView *)createViewRecursivelyFromRenderObject:(NativeRenderObjectView *)renderObject;

/**
 * set dom manager for NativeRenderUIManager which holds a weak reference to domManager
 */
- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager;

/**
 *  create views from dom nodes
 *  @param nodes A set of nodes for creating views
 */
- (void)createRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 *  update views' properties from dom nodes
 *  @param nodes A set of nodes for updating views' properties
 */
- (void)updateRenderNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 *  delete views from dom nodes
 *  @param nodes nodes to delete
 */
- (void)deleteRenderNodesIds:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
                  onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * move views from container to another container
 *
 * @param ids A set of nodes id to move
 * @param fromContainer Source view container from which views move
 * @param toContainer Target view container to which views move
 */
- (void)renderMoveViews:(const std::vector<int32_t> &&)ids
          fromContainer:(int32_t)fromContainer
            toContainer:(int32_t)toContainer
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * update layout for view
 *
 * @param layoutInfos Vector for nodes layout infos
 */
- (void)updateNodesLayout:(const std::vector<std::tuple<int32_t, hippy::LayoutResult>> &)layoutInfos
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * Invoked after batched operations completed
 */
- (void)batchOnRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * call function of view
 *
 * @param functionName Function Name to be invoked
 * @param viewName Name of target view whose function invokes
 * @param componentTag id of target view whose function invokes
 * @param params parameters of function to be invoked
 * @param cb A callback for the return value of function
 *
 * @result Function return result
 */
- (id)dispatchFunction:(const std::string &)functionName
              viewName:(const std::string &)viewName
               viewTag:(int32_t)componentTag
            onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                params:(const footstone::value::HippyValue &)params
              callback:(hippy::CallFunctionCallback)cb;

- (void)registerExtraComponent:(NSDictionary<NSString *, Class> *)extraComponent;

/**
 * register event for specific view
 *
 * @param name event name
 * @param node_id id for node for the event
 */
- (void)addEventName:(const std::string &)name
        forDomNodeId:(int32_t)node_id
          onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * unregister event for specific view
 *
 * @param name event name
 * @param node_id node id for the event
 */
- (void)removeEventName:(const std::string &)name
           forDomNodeId:(int32_t)node_id
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * clear all memories
 */
- (void)invalidate;

@end
