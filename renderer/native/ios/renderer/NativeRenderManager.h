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

#ifndef NativeRenderManager_h
#define NativeRenderManager_h

#include <vector>
#include <memory>
#include "dom/render_manager.h"
#include "dom/root_node.h"
#import "NativeRenderFrameworkProxy.h"
#import "NativeRenderContext.h"

@class UIView, NativeRenderImpl;

/**
 * NativeRenderManager is used to manager view creation, update and delete for Native UI
 */
class NativeRenderManager : public hippy::RenderManager {
    
public:
    NativeRenderManager();
    NativeRenderManager(NativeRenderImpl *uiManager):renderImpl_(uiManager){}
    
    ~NativeRenderManager();

    /**
     *  create views from dom nodes
     *  @param nodes A set of nodes for creating views
     */
    void CreateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                          std::vector<std::shared_ptr<hippy::DomNode>>&& nodes) override;
    
    /**
     *  update views' properties from dom nodes
     *  @param nodes A set of nodes for updating views' properties
     */
    void UpdateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                          std::vector<std::shared_ptr<hippy::DomNode>>&& nodes) override;
    
    /**
     *  delete views from dom nodes
     *  @param nodes A set of nodes for deleting views
     */
    void DeleteRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                          std::vector<std::shared_ptr<hippy::DomNode>>&& nodes) override;
    
    /**
     * update layout for view
     *
     * @param nodes A set of nodes ids for views to update
     */
    void UpdateLayout(std::weak_ptr<hippy::RootNode> root_node,
                      const std::vector<std::shared_ptr<hippy::DomNode>>& nodes) override;
    
    /**
     * move views from container to another container
     *
     * @param moved_ids A set of nodes ids id to move
     * @param from_pid Source view container from which views move
     * @param to_pid Target view container to which views move
     */
    void MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                        std::vector<int32_t>&& moved_ids,
                        int32_t from_pid,
                        int32_t to_pid) override;

    void MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node, std::vector<std::shared_ptr<hippy::DomNode>>&& nodes) override;
    
    /**
     * Invoked after batched operations completed
     */
    void EndBatch(std::weak_ptr<hippy::RootNode> root_node) override;
    
    /**
     * Invoked before nodes do layout
     */
    void BeforeLayout(std::weak_ptr<hippy::RootNode> root_node) override;

    /**
     * Invoked after nodes do layout
     */
    void AfterLayout(std::weak_ptr<hippy::RootNode> root_node) override;

    /**
     * register event for specific view
     *
     * @param dom_node node for the event
     * @param name event name
     */
    void AddEventListener(std::weak_ptr<hippy::RootNode> root_node, std::weak_ptr<hippy::DomNode> dom_node, const std::string& name) override;
    
    /**
     * unregister event for specific view
     *
     * @param dom_node node for the event
     * @param name event name
     */
    void RemoveEventListener(std::weak_ptr<hippy::RootNode> root_node, std::weak_ptr<hippy::DomNode> dom_node, const std::string &name) override;

    /**
     * call function of view
     *
     * @param dom_node A dom node whose function to be invoked
     * @param name function name
     * @param param parameters of function to be invoked
     * @param cb Callback id
     * @discussion Caller can get callback block from id by DomNode::GetCallback function
     */
    void CallFunction(std::weak_ptr<hippy::RootNode> root_node,
                      std::weak_ptr<hippy::DomNode> dom_node, const std::string &name,
                      const DomArgument& param,
                      uint32_t cb) override;
    
    void RegisterExtraComponent(NSDictionary<NSString *, Class> *extraComponent);
        
    void RegisterRootView(UIView *view, std::weak_ptr<hippy::RootNode> root_node);
    
    void SetDomManager(std::weak_ptr<hippy::DomManager> dom_manager);
    
    void SetFrameworkProxy(id<NativeRenderFrameworkProxy> proxy);
    
    id<NativeRenderFrameworkProxy> GetFrameworkProxy();
    
    void SetUICreationLazilyEnabled(bool enabled);
        
    id<NativeRenderContext> GetRenderContext();
        
private:
    NativeRenderImpl *renderImpl_;
};

#endif /* NativeRenderManager_h */
