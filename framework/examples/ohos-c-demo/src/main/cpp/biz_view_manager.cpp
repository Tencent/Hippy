/*
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
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

#include "biz_view_manager.h"
#include "renderer/api_c/hippy.h"
#include "renderer/utils/hr_pixel_utils.h"
#include <arkui/native_interface.h>
#include <arkui/native_node.h>
#include <mutex>

const uint32_t DEMO_VIEW_A_ID = 1;
const uint32_t DEMO_RENDER_MANAGER_ID = 1;
const uint32_t DEMO_FIRST_DOM_MANAGER_ID = 2;

ArkUI_NativeNodeAPI_1 *GetNativeNodeAPI() {
  static ArkUI_NativeNodeAPI_1 *api = nullptr;
  if (api == nullptr) {
    api = reinterpret_cast<ArkUI_NativeNodeAPI_1 *>(
      OH_ArkUI_QueryModuleInterfaceByName(ARKUI_NATIVE_NODE, "ArkUI_NativeNodeAPI_1"));
  }
  return api;
}

BizViewManager::BizViewManager() {
  BuildBizViews();
}

BizViewManager::~BizViewManager() {
  
}

std::shared_ptr<BizViewManager> BizViewManager::GetInstance() {
  static std::shared_ptr<BizViewManager> sp = nullptr;
  static std::once_flag flag;
  std::call_once(flag, []{ sp = std::make_shared<BizViewManager>(); });
  return sp;
}

void BizViewManager::BindBizNativeView(ArkUI_NodeContentHandle contentHandle, uint32_t view_id) {
  ArkUI_NodeContentHandle savedHandle = nullptr;
  auto it = nodeContentMap_.find(view_id);
  if (it != nodeContentMap_.end()) {
    savedHandle = it->second;
  }
  if (contentHandle == savedHandle) {
    return;
  }
  
  auto viewIt = viewHandleMap_.find(view_id);
  if (viewIt == viewHandleMap_.end()) {
    return;
  }
  auto viewHandle = viewIt->second;
  
  nodeContentMap_[view_id] = contentHandle;
  OH_ArkUI_NodeContent_RegisterCallback(contentHandle, nullptr);
  OH_ArkUI_NodeContent_AddNode(contentHandle, viewHandle);
}

void BizViewManager::UnbindBizNativeView(uint32_t view_id) {
  auto it = nodeContentMap_.find(view_id);
  if (it == nodeContentMap_.end()) {
    return;
  }
  ArkUI_NodeContentHandle savedHandle = it->second;
  auto viewIt = viewHandleMap_.find(view_id);
  if (viewIt == viewHandleMap_.end()) {
    return;
  }
  auto viewHandle = viewIt->second;
  OH_ArkUI_NodeContent_RemoveNode(savedHandle, viewHandle);
  nodeContentMap_.erase(view_id);
}

void BizViewManager::OnHippyRootViewReady() {
}

void BizViewManager::TestDestroy() {
  if (rootId_ > 0) {
    HippyViewProvider_DestroyRoot(DEMO_RENDER_MANAGER_ID, rootId_);
    rootId_ = 0;
  }
}

void BizViewManager::BuildBizViews() {
  ArkUI_NodeHandle viewHandle = GetNativeNodeAPI()->createNode(ArkUI_NodeType::ARKUI_NODE_STACK);
  viewHandleMap_[DEMO_VIEW_A_ID] = viewHandle;
  
  // 参数说明：
  // first_dom_manager_id - 实际由业务从ts层传到c层，ts层获取：hippyEngine.getHippyEngineContext()?.getDomManagerId()
  rootId_ = HippyViewProvider_CreateRoot(DEMO_FIRST_DOM_MANAGER_ID, HippyLayoutEngineYoga);

  // 参数说明：
  // parent_node_handle - Hippy根节点的父节点
  // render_manager_id - 实际由业务从ts层传到c层，ts层获取：hippyEngine.getNativeRenderProvider().getInstanceId()
  // root_id - 根节点id
  HippyViewProvider_BindNativeRoot(viewHandle, DEMO_RENDER_MANAGER_ID, rootId_);
  
  // 方法说明：
  // 该方法一定在HippyViewProvider_CreateRoot后调用。
  // 参数说明：
  // render_manager_id - 实际由业务从ts层传到c层，ts层获取：hippyEngine.getNativeRenderProvider().getInstanceId()
  // root_id - 根节点id
  // width -宽度
  // height - 高度
  HippyViewProvider_UpdateRootSize(DEMO_RENDER_MANAGER_ID, rootId_, 300, 400);
  
}
