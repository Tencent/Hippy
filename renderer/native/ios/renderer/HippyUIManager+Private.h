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

#ifndef HippyUIManager_Private_h
#define HippyUIManager_Private_h

#import "HippyUIManager.h"
#include <memory>
#include <unordered_map>
#include <functional>

class VFSUriLoader;
namespace hippy {
inline namespace dom {
class RenderManager;
class DomManager;
class DomArgument;
class RootNode;
class DomNode;
struct LayoutResult;
using CallFunctionCallback = std::function<void(std::shared_ptr<DomArgument>)>;
}
}

namespace footstone {
inline namespace value {
class HippyValue;
}
}

@interface HippyUIManager (Private)

/// Set hippy::RenderManager
/// - Parameter renderManager: hippy::RenderManager
- (void)registRenderManager:(std::weak_ptr<hippy::RenderManager>)renderManager;

/// Get hippy::RenderManager
- (std::weak_ptr<hippy::RenderManager>)renderManager;


- (void)registerRootView:(UIView *)rootView asRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

- (void)unregisterRootViewFromTag:(NSNumber *)rootTag;


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
                  index:(int32_t)index
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

- (void)renderMoveNodes:(std::vector<std::shared_ptr<hippy::DomNode>> &&)nodes
             onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;
/**
 * update layout for view
 *
 * @param layoutInfos Vector for nodes layout infos
 */
- (void)updateNodesLayout:(const std::vector<std::tuple<int32_t, hippy::LayoutResult>> &)layoutInfos
               onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * call function of view
 *
 * @param functionName Function Name to be invoked
 * @param viewName Name of target view whose function invokes
 * @param hippyTag id of target view whose function invokes
 * @param params parameters of function to be invoked
 * @param cb A callback for the return value of function
 */
- (void)dispatchFunction:(const std::string &)functionName
                viewName:(const std::string &)viewName
                 viewTag:(int32_t)hippyTag
              onRootNode:(std::weak_ptr<hippy::RootNode>)rootNode
                  params:(const footstone::value::HippyValue &)params
                callback:(hippy::CallFunctionCallback)cb;


/**
 * set dom manager for NativeRenderUIManager which holds a weak reference to domManager
 */
- (void)setDomManager:(std::weak_ptr<hippy::DomManager>)domManager;

/**
 * Invoked after batched operations completed
 */
- (void)batchOnRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

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
 * unregister vsync event
 */
- (void)removeVSyncEventOnRootNode:(std::weak_ptr<hippy::RootNode>)rootNode;

/**
 * Set root view size changed event callback
 *
 *@param cb callback
 */
- (void)setRootViewSizeChangedEvent:(std::function<void(int32_t rootTag, NSDictionary *)>)cb;


@end

#endif /* HippyUIManager_Private_h */
