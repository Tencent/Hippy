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
#import "NativeRenderManager.h"
#import "HippyShadowText.h"
#import "dom/taitank_layout_node.h"

using RenderManager = hippy::RenderManager;
using DomNode = hippy::DomNode;
using DomEvent = hippy::DomEvent;
using LayoutResult = hippy::LayoutResult;
using CallFunctionCallback = hippy::CallFunctionCallback;

void NativeRenderManager::CreateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) {
    [uiManager_ createRenderNodes:std::move(nodes)];
}

void NativeRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
    [uiManager_ updateRenderNodes:std::move(nodes)];
}

void NativeRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
    std::vector<int32_t> indices;
    int32_t rootTag = INT32_MIN;
    for (const std::shared_ptr<DomNode> &node : nodes) {
        if (INT32_MIN == rootTag) {
            rootTag = node->GetPid();
        }
        else {
            HippyAssert(rootTag == node->GetPid(), @"DeleteRenderNode ,nodes not on the same parent node");
        }
        indices.push_back(node->GetIndex());
    }
    if (INT32_MIN != rootTag) {
        [uiManager_ renderDeleteViewFromContainer:rootTag forIndices:indices];
    }
}

void NativeRenderManager::UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) {
    [uiManager_ renderNodesUpdateLayout:nodes];
}

void NativeRenderManager::MoveRenderNode(std::vector<int32_t>&& ids,
                                      int32_t pid,
                                      int32_t id) {
    [uiManager_ renderMoveViews:ids fromContainer:pid toContainer:id];
}

void NativeRenderManager::Batch() {
    [uiManager_ batch];
}

void NativeRenderManager::AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) {
    [uiManager_ addEventName:name forDomNode:dom_node];
};

void NativeRenderManager::RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string &name) {
    [uiManager_ removeEventName:name forDomNode:dom_node];
}

void NativeRenderManager::CallFunction(std::weak_ptr<DomNode> dom_node, const std::string &name,
                                    const DomArgument& param,
                                    CallFunctionCallback cb) {
    std::shared_ptr<DomNode> node = dom_node.lock();
    if (node) {
        DomValue dom_value;
        param.ToObject(dom_value);
        [uiManager_ dispatchFunction:name viewName:node->GetViewName() viewTag:node->GetId() params:dom_value callback:cb];
    }
    Batch();
}
