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

#ifndef NativeRenderManager_h
#define NativeRenderManager_h

#include <vector>
#include <memory>
#include "dom/render_manager.h"
#import "HippyFrameworkProxy.h"
#import "HippyRenderContext.h"

@class UIView, HippyUIManager;

/**
 * NativeRenderManager is used to manager view creation, update and delete for Native UI
 */
class NativeRenderManager : public hippy::RenderManager {
    
public:
    NativeRenderManager();
    NativeRenderManager(HippyUIManager *uiManager):uiManager_(uiManager){}
    
    ~NativeRenderManager();

    /**
     *  create views from dom nodes
     *  @param nodes A set of nodes for creating views
     */
    void CreateRenderNode(std::vector<std::shared_ptr<hippy::DomNode>>&& nodes) override;
    
    /**
     *  update views' properties from dom nodes
     *  @param nodes A set of nodes for updating views' properties
     */
    void UpdateRenderNode(std::vector<std::shared_ptr<hippy::DomNode>>&& nodes) override;
    
    /**
     *  delete views from dom nodes
     *  @param nodes A set of nodes for deleting views
     */
    void DeleteRenderNode(std::vector<std::shared_ptr<hippy::DomNode>>&& nodes) override;
    
    /**
     * update layout for view
     *
     * @param nodes A set of nodes ids for views to update
     */
    void UpdateLayout(const std::vector<std::shared_ptr<hippy::DomNode>>& nodes) override;
    
    /**
     * move views from container to another container
     *
     * @param ids A set of nodes ids id to move
     * @param pid Source view container from which views move
     * @param id Target view container to which views move
     */
    void MoveRenderNode(std::vector<int32_t>&& ids, int32_t pid, int32_t id) override;
    
    /**
     * Invoked after batched operations completed
     */
    void EndBatch() override;
    
    /**
     * Invoked before nodes do layout
     */
    void BeforeLayout() override;

    /**
     * Invoked after nodes do layout
     */
    void AfterLayout() override;

    /**
     * register event for specific view
     *
     * @param dom_node node for the event
     * @param name event name
     */
    void AddEventListener(std::weak_ptr<hippy::DomNode> dom_node, const std::string& name) override;
    
    /**
     * unregister event for specific view
     *
     * @param dom_node node for the event
     * @param name event name
     */
    void RemoveEventListener(std::weak_ptr<hippy::DomNode> dom_node, const std::string &name) override;

    /**
     * call function of view
     *
     * @param dom_node A dom node whose function to be invoked
     * @param name function name
     * @param param parameters of function to be invoked
     * @param cb Callback id
     * @discussion Caller can get callback block from id by DomNode::GetCallback function
     */
    void CallFunction(std::weak_ptr<hippy::DomNode> dom_node, const std::string &name,
                      const DomArgument& param,
                      uint32_t cb) override;
    
    void RegisterRootView(UIView *view);
    
    void SetDomManager(std::weak_ptr<hippy::DomManager> dom_manager);
    
    void SetFrameworkProxy(id<HippyFrameworkProxy> proxy);
    
    id<HippyFrameworkProxy> GetFrameworkProxy();
    
    void SetUICreationLazilyEnabled(bool enabled);
    
    UIView *CreateViewHierarchyFromDomNode(std::shared_ptr<hippy::DomNode> dom_node);
    
    UIView *CreateViewHierarchyFromId(int32_t id);
    
    id<HippyRenderContext> GetRenderContext();
    
private:
    HippyUIManager *uiManager_;
};

#endif /* NativeRenderManager_h */
