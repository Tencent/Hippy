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

#import "NativeRenderManager.h"
#import "NativeRenderObjectText.h"
#import "NativeRenderUIManager.h"
#import "dom/layout_node.h"
#import "dom/dom_manager.h"
#import "RenderVsyncManager.h"

using HippyValue = footstone::value::HippyValue;
using RenderManager = hippy::RenderManager;
using DomNode = hippy::DomNode;
using DomManager = hippy::DomManager;
using DomEvent = hippy::DomEvent;
using LayoutResult = hippy::LayoutResult;
using CallFunctionCallback = hippy::CallFunctionCallback;
using RootNode = hippy::RootNode;

NativeRenderManager::NativeRenderManager() {
    uiManager_ = [[NativeRenderUIManager alloc] init];
}

void NativeRenderManager::CreateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>> &&nodes) {
    @autoreleasepool {
        [uiManager_ createRenderNodes:std::move(nodes) onRootNode:root_node];
    }
}

void NativeRenderManager::UpdateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        [uiManager_ updateRenderNodes:std::move(nodes) onRootNode:root_node];
    }
}

void NativeRenderManager::DeleteRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        [uiManager_ deleteRenderNodesIds:std::move(nodes) onRootNode:root_node];
    }
}

void NativeRenderManager::UpdateLayout(std::weak_ptr<hippy::RootNode> root_node,
                                       const std::vector<std::shared_ptr<DomNode>>& nodes) {
    @autoreleasepool {
        using DomNodeUpdateInfoTuple = std::tuple<int32_t, hippy::LayoutResult>;
        std::vector<DomNodeUpdateInfoTuple> nodes_infos;
        nodes_infos.reserve(nodes.size());
        for (auto node : nodes) {
            int32_t tag = node->GetId();
            hippy::LayoutResult layoutResult = node->GetRenderLayoutResult();
              DomNodeUpdateInfoTuple nodeUpdateInfo = std::make_tuple(tag, layoutResult);
              nodes_infos.push_back(nodeUpdateInfo);
        }
        [uiManager_ updateNodesLayout:nodes_infos onRootNode:root_node];
    }
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                         std::vector<int32_t>&& moved_ids,
                                         int32_t from_pid,
                                         int32_t to_pid) {
    @autoreleasepool {
        [uiManager_ renderMoveViews:std::move(moved_ids) fromContainer:from_pid toContainer:to_pid onRootNode:root_node];
    }
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                         std::vector<std::shared_ptr<DomNode>>&& nodes) {
    //TODO implement it
    @autoreleasepool {
        NSCAssert(NO, @"implement it, how to move nodes");
    }
}

void NativeRenderManager::EndBatch(std::weak_ptr<hippy::RootNode> root_node) {
    @autoreleasepool {
        [uiManager_ batchOnRootNode:root_node];
    }
}

void NativeRenderManager::BeforeLayout(std::weak_ptr<hippy::RootNode> root_node) {}

void NativeRenderManager::AfterLayout(std::weak_ptr<hippy::RootNode> root_node) {}

void NativeRenderManager::AddEventListener(std::weak_ptr<hippy::RootNode> root_node,
                                           std::weak_ptr<DomNode> dom_node,
                                           const std::string& name) {
    @autoreleasepool {
        auto node = dom_node.lock();
        if (node) {
            int32_t tag = node->GetId();
            [uiManager_ addEventName:name forDomNodeId:tag onRootNode:root_node];
        }
    }
};

void NativeRenderManager::RemoveEventListener(std::weak_ptr<hippy::RootNode> root_node,
                                              std::weak_ptr<DomNode> dom_node,
                                              const std::string &name) {
    @autoreleasepool {
        auto node = dom_node.lock();
        if (node) {
            int32_t node_id = node->GetId();
            [uiManager_ removeEventName:name forDomNodeId:node_id onRootNode:root_node];
        }
    }
}

void NativeRenderManager::CallFunction(std::weak_ptr<hippy::RootNode> root_node,
                                       std::weak_ptr<DomNode> dom_node,
                                       const std::string &name,
                                       const DomArgument& param,
                                       uint32_t cb) {
    @autoreleasepool {
        std::shared_ptr<DomNode> node = dom_node.lock();
        if (node) {
            HippyValue dom_value;
            param.ToObject(dom_value);
            [uiManager_ dispatchFunction:name viewName:node->GetViewName()
                                 viewTag:node->GetId() onRootNode:root_node params:dom_value
                                callback:node->GetCallback(name, cb)];
        }
        EndBatch(root_node);
    }
}

void NativeRenderManager::RegisterExtraComponent(NSDictionary<NSString *, Class> *extraComponent) {
    @autoreleasepool {
        [uiManager_ registerExtraComponent:extraComponent];
    }
}

void NativeRenderManager::RegisterRootView(UIView *view, std::weak_ptr<hippy::RootNode> root_node) {
    @autoreleasepool {
        [uiManager_ registerRootView:view asRootNode:root_node];
    }
}

void NativeRenderManager::SetDomManager(std::weak_ptr<DomManager> dom_manager) {
    @autoreleasepool {
        [uiManager_ setDomManager:dom_manager];
    }
}

void NativeRenderManager::SetFrameworkProxy(id<NativeRenderFrameworkProxy> proxy) {
    uiManager_.frameworkProxy = proxy;
}

id<NativeRenderFrameworkProxy> NativeRenderManager::GetFrameworkProxy() {
    return uiManager_.frameworkProxy;
}

void NativeRenderManager::SetUICreationLazilyEnabled(bool enabled) {
    uiManager_.uiCreationLazilyEnabled = enabled;
}

id<NativeRenderContext> NativeRenderManager::GetRenderContext() {
    return uiManager_;
}

NativeRenderManager::~NativeRenderManager() {
    [uiManager_ invalidate];
    uiManager_ = nil;
}
