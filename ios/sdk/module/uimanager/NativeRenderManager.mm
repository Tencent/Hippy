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

using RenderManager = hippy::RenderManager;
using DomNode = hippy::DomNode;
using DomEvent = hippy::DomEvent;
using LayoutResult = hippy::LayoutResult;

void NativeRenderManager::CreateRenderNode(std::vector<std::shared_ptr<DomNode>> &&nodes) {
    auto block = [tmpManager = uiManager_, tmpNodes = std::move(nodes)]() mutable {
        [tmpManager createRenderNodes:std::move(tmpNodes)];
    };
    dispatch_async(HippyGetUIManagerQueue(), block);
}

void NativeRenderManager::UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
    for (const std::shared_ptr<DomNode> &node : nodes) {
        int32_t tag = node->GetId();
        const std::string &viewName = node->GetViewName();
        [uiManager_ renderUpdateView:tag viewName:viewName props:node->GetStyleMap()];
    }
}

void NativeRenderManager::DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) {
    std::vector<int32_t> indices;
    int32_t rootTag = INT32_MIN;
    for (const std::shared_ptr<DomNode> &node : nodes) {
        DomNode::RenderInfo info = node->GetRenderInfo();
        if (INT32_MIN == rootTag) {
            rootTag = info.pid;
        }
        else {
            HippyAssert(rootTag == info.pid, @"DeleteRenderNode ,nodes not on the same parent node");
        }
        indices.push_back(info.index);
    }
    if (INT32_MIN != rootTag) {
        [uiManager_ renderDeleteViewFromContainer:rootTag forIndices:indices];
    }
}

void NativeRenderManager::UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) {
    auto block = [tmpManager = uiManager_, tmpNodes = std::move(nodes)]() {
        [tmpManager renderNodesUpdateLayout:tmpNodes];
    };
    dispatch_async(HippyGetUIManagerQueue(), block);
}

void NativeRenderManager::MoveRenderNode(std::vector<int32_t>&& ids,
                                      int32_t pid,
                                      int32_t id) {
    [uiManager_ renderMoveViews:ids fromContainer:pid toContainer:id];
}

void NativeRenderManager::Batch() {
    [uiManager_ batch];
}

void NativeRenderManager::AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name, const DomValue& param) {
    std::shared_ptr<DomNode> node = dom_node.lock();
    if (node) {
        if (name == hippy::kClickEvent) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [uiManager_ addClickEventListenerforNode:dom_node forView:node->GetId()];
            });
        } else if (name == hippy::kLongClickEvent) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [uiManager_ addLongClickEventListenerforNode:dom_node forView:node->GetId()];
            });
        } else if (name == hippy::kTouchStartEvent || name == hippy::kTouchMoveEvent
                   || name == hippy::kTouchEndEvent || name == hippy::kTouchCancelEvent) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [uiManager_ addTouchEventListenerforNode:dom_node forType:name forView:node->GetId()];
            });
        } else if (name == hippy::kShow || name == hippy::kDismiss) {
            dispatch_async(dispatch_get_main_queue(), ^{
                [uiManager_ addShowEventListenerforNode:dom_node forType:name forView:node->GetId()];
            });
        }
    }
};

void NativeRenderManager::CallFunction(std::weak_ptr<DomNode> dom_node, const std::string &name,
                                    const DomValue& param,
                                    CallFunctionCallback cb) {
    std::shared_ptr<DomNode> node = dom_node.lock();
    if (node) {
        [uiManager_ dispatchFunction:name forView:node->GetId() params:param callback:cb];
    }
}
