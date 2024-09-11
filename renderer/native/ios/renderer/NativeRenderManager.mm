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

#import "HippyUIManager.h"
#import "HippyUIManager+Private.h"
#import "NativeRenderManager.h"
#import "HippyShadowText.h"
#import "RenderVsyncManager.h"
#import "HippyAssert.h"
#include "dom/dom_manager.h"
#include "dom/layout_node.h"
#include "dom/root_node.h"

using HippyValue = footstone::value::HippyValue;
using RenderManager = hippy::RenderManager;
using DomNode = hippy::DomNode;
using DomManager = hippy::DomManager;
using DomEvent = hippy::DomEvent;
using LayoutResult = hippy::LayoutResult;
using CallFunctionCallback = hippy::CallFunctionCallback;
using RootNode = hippy::RootNode;


NativeRenderManager::NativeRenderManager(const std::string& name): hippy::RenderManager(name) {}

void NativeRenderManager::CreateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>> &&nodes) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (rootNode) {
            std::shared_lock<std::shared_mutex> lock(_mutex);
            HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
            [uiManager createRenderNodes:std::move(nodes) onRootNode:root_node];
        }
    }
}

void NativeRenderManager::UpdateRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (rootNode) {
            std::shared_lock<std::shared_mutex> lock(_mutex);
            HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
            [uiManager updateRenderNodes:std::move(nodes) onRootNode:root_node];
        }
        
    }
}

void NativeRenderManager::DeleteRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                           std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (rootNode) {
            std::shared_lock<std::shared_mutex> lock(_mutex);
            HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
            [uiManager deleteRenderNodesIds:std::move(nodes) onRootNode:root_node];
        }
    }
}

void NativeRenderManager::UpdateLayout(std::weak_ptr<hippy::RootNode> root_node,
                                       const std::vector<std::shared_ptr<DomNode>>& nodes) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        using DomNodeUpdateInfoTuple = std::tuple<int32_t, hippy::LayoutResult>;
        std::vector<DomNodeUpdateInfoTuple> nodes_infos;
        nodes_infos.reserve(nodes.size());
        for (auto node : nodes) {
            int32_t tag = node->GetId();
            hippy::LayoutResult layoutResult = node->GetRenderLayoutResult();
              DomNodeUpdateInfoTuple nodeUpdateInfo = std::make_tuple(tag, layoutResult);
              nodes_infos.push_back(nodeUpdateInfo);
        }
        [uiManager updateNodesLayout:nodes_infos onRootNode:root_node];
    }
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                         std::vector<int32_t>&& moved_ids,
                                         int32_t from_pid,
                                         int32_t to_pid,
                                         int32_t index) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        [uiManager renderMoveViews:std::move(moved_ids)
                     fromContainer:from_pid
                       toContainer:to_pid
                             index:index
                        onRootNode:root_node];
    }
}

void NativeRenderManager::MoveRenderNode(std::weak_ptr<hippy::RootNode> root_node,
                                         std::vector<std::shared_ptr<DomNode>>&& nodes) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        // Check whether all nodes have the same pid
        uint32_t firstPid = nodes[0]->GetPid();
        bool allSamePid = std::all_of(nodes.begin(), nodes.end(),
                                      [firstPid](const std::shared_ptr<DomNode>& node) {
            return node->GetPid() == firstPid;
        });
        
        if (allSamePid) {
            // If all nodes have the same pid, call directly
            [uiManager renderMoveNodes:std::move(nodes) onRootNode:root_node];
        } else {
            // If not, group them by pid and then call for each group
            std::map<int, std::vector<std::shared_ptr<DomNode>>> pidNodeMap;
            for (auto& node : nodes) {
                pidNodeMap[node->GetPid()].push_back(node);
            }
            for (auto& pair : pidNodeMap) {
                [uiManager renderMoveNodes:std::move(pair.second) onRootNode:root_node];
            }
        }
    }
}

void NativeRenderManager::EndBatch(std::weak_ptr<hippy::RootNode> root_node) {
    @autoreleasepool {
        TDF_PERF_LOG("NativeRenderManager::EndBatch Begin");
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        [uiManager batchOnRootNode:root_node];
        TDF_PERF_LOG("NativeRenderManager::EndBatch End");

    }
}

void NativeRenderManager::BeforeLayout(std::weak_ptr<hippy::RootNode> root_node) {
}

void NativeRenderManager::AfterLayout(std::weak_ptr<hippy::RootNode> root_node) {
}

void NativeRenderManager::AddEventListener(std::weak_ptr<hippy::RootNode> root_node,
                                           std::weak_ptr<DomNode> dom_node,
                                           const std::string& name) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        auto node = dom_node.lock();
        if (node) {
            int32_t tag = node->GetId();
            [uiManager addEventName:name forDomNodeId:tag onRootNode:root_node];
        }
    }
};

void NativeRenderManager::RemoveEventListener(std::weak_ptr<hippy::RootNode> root_node,
                                              std::weak_ptr<DomNode> dom_node,
                                              const std::string &name) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        auto node = dom_node.lock();
        if (node) {
            int32_t node_id = node->GetId();
            [uiManager removeEventName:name forDomNodeId:node_id onRootNode:root_node];
        }
    }
}

void NativeRenderManager::RemoveVSyncEventListener(std::weak_ptr<hippy::RootNode> root_node) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        [uiManager removeVSyncEventOnRootNode:root_node];
    }
}

void NativeRenderManager::CallFunction(std::weak_ptr<hippy::RootNode> root_node,
                                       std::weak_ptr<DomNode> dom_node,
                                       const std::string &name,
                                       const DomArgument& param,
                                       uint32_t cb) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootNode->GetId()];
        std::shared_ptr<DomNode> node = dom_node.lock();
        if (node) {
            HippyValue hippy_value;
            param.ToObject(hippy_value);
            [uiManager dispatchFunction:name 
                               viewName:node->GetViewName()
                                viewTag:node->GetId() 
                             onRootNode:root_node 
                                 params:hippy_value
                               callback:node->GetCallback(name, cb)];
        }
        EndBatch(root_node);
    }
}

void NativeRenderManager::RegisterRootView(UIView *view,
                                           std::weak_ptr<hippy::RootNode> root_node,
                                           HippyUIManager *uiManager) {
    @autoreleasepool {
        auto rootNode = root_node.lock();
        if (!rootNode) {
            return;
        }
        HippyAssertParam(uiManager);
        std::shared_lock<std::shared_mutex> lock(_mutex);
        _uiManagerMap[rootNode->GetId()] = uiManager;
        [uiManager registerRootView:view asRootNode:root_node];
    }
}

void NativeRenderManager::UnregisterRootView(uint32_t rootId) {
    @autoreleasepool {
        std::shared_lock<std::shared_mutex> lock(_mutex);
        HippyUIManager *uiManager = _uiManagerMap[rootId];
        HippyAssertParam(uiManager);
        [uiManager unregisterRootViewFromTag:@(rootId)];
        _uiManagerMap.erase(rootId);
    }
}

NativeRenderManager::~NativeRenderManager() {
    std::shared_lock<std::shared_mutex> lock(_mutex);
    for (auto &pair : _uiManagerMap) {
        [pair.second invalidate];
    }
    _uiManagerMap.clear();
    FOOTSTONE_LOG(INFO) << "~NativeRenderManager";
}
 
