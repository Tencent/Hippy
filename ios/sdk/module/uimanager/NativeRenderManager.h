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
#include "dom/dom_event.h"
#import "HippyUIManager.h"

class NativeRenderManager : public hippy::RenderManager {
    using DomValue = tdf::base::DomValue;
    using DomManager = hippy::DomManager;
    using DomNode = hippy::DomNode;
    using LayoutResult = hippy::LayoutResult;
    using DomValueType = tdf::base::DomValue::Type;
    using DomValueNumberType = tdf::base::DomValue::NumberType;
    using RenderInfo = hippy::DomNode::RenderInfo;
    using CallFunctionCallback = hippy::CallFunctionCallback;
public:
    NativeRenderManager(HippyUIManager *uiManager):uiManager_(uiManager){}
    
    void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
    void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
    void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
    void UpdateLayout(const std::vector<std::shared_ptr<DomNode>>& nodes) override;
    void MoveRenderNode(std::vector<int32_t>&& ids,
                        int32_t pid,
                        int32_t id) override;

    void Batch() override;
    
    void AddEventListener(std::weak_ptr<DomNode> dom_node, const std::string& name) override;
    void RemoveEventListener(std::weak_ptr<DomNode> dom_node, const std::string &name) override;

    void CallFunction(std::weak_ptr<DomNode> dom_node, const std::string &name,
                      const DomValue& param,
                      CallFunctionCallback cb) override;
    
private:
    HippyUIManager *uiManager_;
};

#endif /* NativeRenderManager_h */
