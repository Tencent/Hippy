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

#include "dom/render_manager.h"
#include <vector>
#include <memory>
#import "HippyUIManager.h"

class NativeRenderManager : public hippy::RenderManager {
    
public:
    NativeRenderManager(HippyUIManager *uiManager):uiManager_(uiManager){}
    
    void CreateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
    void UpdateRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
    void DeleteRenderNode(std::vector<std::shared_ptr<DomNode>>&& nodes) override;
    void MoveRenderNode(std::vector<int32_t>&& ids,
                        int32_t pid,
                        int32_t id) override;

    void Batch() override;

    void CallFunction(std::weak_ptr<DomNode> domNode, const std::string &name,
                      std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                      DispatchFunctionCallback cb) override;

    void SetClickEventListener(int32_t id, OnClickEventListener listener) override;
    void RemoveClickEventListener(int32_t id) override;
    void SetLongClickEventListener(int32_t id, OnLongClickEventListener listener) override;
    void RemoveLongClickEventListener(int32_t id) override;
    void SetTouchEventListener(int32_t id, TouchEvent event, OnTouchEventListener listener) override;
    void RemoveTouchEventListener(int32_t id, TouchEvent event) override;
    void SetShowEventListener(int32_t id, ShowEvent event, OnShowEventListener listener) override;
    void RemoveShowEventListener(int32_t id, ShowEvent event) override;
    
private:
    HippyUIManager *uiManager_;
};

#endif /* NativeRenderManager_h */
