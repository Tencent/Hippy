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

#import "NativeRenderImpl.h"
#import "NativeRenderManager.h"
#import "NativeRenderObjectText.h"
#import "RenderVsyncManager.h"

#include "dom/dom_manager.h"
#include "dom/layout_node.h"

using HippyValue = footstone::value::HippyValue;
using RenderManager = hippy::RenderManager;
using DomNode = hippy::DomNode;
using DomManager = hippy::DomManager;
using DomEvent = hippy::DomEvent;
using LayoutResult = hippy::LayoutResult;
using CallFunctionCallback = hippy::CallFunctionCallback;
using RootNode = hippy::RootNode;

NativeRenderManager::NativeRenderManager(): hippy::RenderManager("NativeRenderManager") {
    renderImpl_ = [[NativeRenderImpl alloc] init];
}

void NativeRenderManager::CreateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>> &&nodes) {
    @autoreleasepool {
        [renderImpl_ createRenderNodes:std::move(nodes) onRootNode:root_node];
    }
}

void NativeRenderManager::UpdateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        [renderImpl_ updateRenderNodes:std::move(nodes) onRootNode:root_node];
    }
}

void NativeRenderManager::DeleteRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        [renderImpl_ deleteRenderNodesIds:std::move(nodes) onRootNode:root_node];
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
        [renderImpl_ updateNodesLayout:nodes_infos onRootNode:root_node];
    }
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                         std::vector<int32_t>&& moved_ids,
                                         int32_t from_pid,
                                         int32_t to_pid,
                                         int32_t index) {
    @autoreleasepool {
        [renderImpl_ renderMoveViews:std::move(moved_ids)
                       fromContainer:from_pid
                         toContainer:to_pid
                               index:index
                          onRootNode:root_node];
    }
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                         std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        [renderImpl_ renderMoveNodes:std::move(nodes) onRootNode:root_node];
    }
}

void NativeRenderManager::EndBatch(std::weak_ptr<hippy::RootNode> root_node) {
    @autoreleasepool {
        [renderImpl_ batchOnRootNode:root_node];
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
            [renderImpl_ addEventName:name forDomNodeId:tag onRootNode:root_node];
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
            [renderImpl_ removeEventName:name forDomNodeId:node_id onRootNode:root_node];
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
            [renderImpl_ dispatchFunction:name viewName:node->GetViewName()
                                 viewTag:node->GetId() onRootNode:root_node params:dom_value
                                callback:node->GetCallback(name, cb)];
        }
        EndBatch(root_node);
    }
}

void NativeRenderManager::RegisterExtraComponent(NSArray<Class> *extraComponents) {
    @autoreleasepool {
        [renderImpl_ registerExtraComponent:extraComponents];
    }
}

void NativeRenderManager::RegisterRootView(UIView *view, std::weak_ptr<hippy::RootNode> root_node) {
    @autoreleasepool {
        [renderImpl_ registerRootView:view asRootNode:root_node];
    }
}

void NativeRenderManager::UnregisterRootView(uint32_t id) {
    @autoreleasepool {
        [renderImpl_ unregisterRootViewFromTag:@(id)];
    }
}

NSArray<UIView *> *NativeRenderManager::rootViews() {
    @autoreleasepool {
        return [renderImpl_ rootViews];
    }
}

void NativeRenderManager::SetDomManager(std::weak_ptr<DomManager> dom_manager) {
    @autoreleasepool {
        [renderImpl_ setDomManager:dom_manager];
    }
}

void NativeRenderManager::SetUICreationLazilyEnabled(bool enabled) {
    renderImpl_.uiCreationLazilyEnabled = enabled;
}

void NativeRenderManager::AddImageProviderClass(Class<HPImageProviderProtocol> cls) {
    @autoreleasepool {
        [renderImpl_ addImageProviderClass:cls];
    }
}

NSArray<Class<HPImageProviderProtocol>> *NativeRenderManager::GetImageProviderClasses() {
    @autoreleasepool {
        return [renderImpl_ imageProviderClasses];
    }
}

void NativeRenderManager::SetVFSUriLoader(std::shared_ptr<VFSUriLoader> loader) {
    renderImpl_.VFSUriLoader = loader;
}

void NativeRenderManager::SetRootViewSizeChangedEvent(std::function<void(int32_t rootTag, NSDictionary *)> cb) {
    [renderImpl_ setRootViewSizeChangedEvent:cb];
}

NativeRenderManager::~NativeRenderManager() {
    [renderImpl_ invalidate];
    renderImpl_ = nil;
}
 
