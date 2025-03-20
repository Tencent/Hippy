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

#include "renderer/api_c/hippy.h"
#include "oh_napi/data_holder.h"
#include "renderer/native_render_manager.h"
#include "renderer/utils/hr_pixel_utils.h"

#define ROOT_VIEW_ID_INCREMENT 10

static uint32_t sHippyRootIdCounter = 0;
static std::mutex sMutex;

using namespace hippy;

static hippy::LayoutEngineType HippyLayoutEngineTypeToInnerType(HippyLayoutEngineType layout_engine_type) {
  switch (layout_engine_type) {
    case HippyLayoutEngineTaitank:
      return hippy::LayoutEngineTaitank;
    case HippyLayoutEngineYoga:
      return hippy::LayoutEngineYoga;
    case HippyLayoutEngineDefault:
      return hippy::LayoutEngineDefault;
  }
  return hippy::LayoutEngineDefault;
}

uint32_t HippyViewProvider_CreateRoot(uint32_t first_dom_manager_id, HippyLayoutEngineType layout_engine_type) {
  std::lock_guard<std::mutex> lock(sMutex);
  sHippyRootIdCounter += ROOT_VIEW_ID_INCREMENT;
  uint32_t root_id = sHippyRootIdCounter;
  double density = HRPixelUtils::GetDensity();
  hippy::LayoutEngineType layout_type = HippyLayoutEngineTypeToInnerType(layout_engine_type);

  std::shared_ptr<hippy::RootNode> saved_root_node;
  auto& persistent_map = RootNode::PersistentMap();
  if (!persistent_map.Find(root_id, saved_root_node)) {
    auto root_node = std::make_shared<hippy::RootNode>(root_id, layout_type);
    auto layout = root_node->GetLayoutNode();
    layout->SetScaleFactor(static_cast<float>(density));
    auto flag = persistent_map.Insert(root_id, root_node);
    FOOTSTONE_DCHECK(flag);
  }

  std::shared_ptr<RootNode> root_node;
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);

  if (root_node->GetDomManager().lock()) {
    return root_id;
  }

  uint32_t next_id = GlobalGetNextDomManagerId(first_dom_manager_id);

  std::any dom_manager;
  flag = hippy::global_data_holder.Find(next_id, dom_manager);
  FOOTSTONE_CHECK(flag);
  auto dom_manager_object = std::any_cast<std::shared_ptr<DomManager>>(dom_manager);

  root_node->SetDomManager(dom_manager_object);
  return root_id;
}

void HippyViewProvider_DestroyRoot(uint32_t render_manager_id, uint32_t root_id) {
  auto& persistent_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  auto flag = persistent_map.Find(root_id, root_node);
  FOOTSTONE_CHECK(flag);
  root_node->ReleaseResources();
  persistent_map.Erase(root_id);

  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "DestroyRoot: render_manager_id invalid";
    return;
  }

  render_manager->DestroyRoot(root_id);
}

void HippyViewProvider_BindNativeRoot(void *parent_node_handle, uint32_t render_manager_id, uint32_t root_id) {
  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "BindRoot: render_manager_id invalid";
    return;
  }

  render_manager->BindNativeRootToParent((ArkUI_NodeHandle)parent_node_handle, root_id, 0);
}

void HippyViewProvider_UnbindNativeRoot(uint32_t render_manager_id, uint32_t root_id) {
  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UnbindRoot: render_manager_id invalid";
    return;
  }

  render_manager->UnbindNativeRootFromParent(root_id, 0);
}

void HippyViewProvider_UpdateRootSize(uint32_t render_manager_id, uint32_t root_id, float width, float height) {
  auto &map = NativeRenderManager::PersistentMap();
  std::shared_ptr<NativeRenderManager> render_manager;
  bool ret = map.Find(render_manager_id, render_manager);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize render_manager_id invalid";
    return;
  }

  auto &root_map = RootNode::PersistentMap();
  std::shared_ptr<RootNode> root_node;
  ret = root_map.Find(root_id, root_node);
  if (!ret) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize root_node is nullptr";
    return;
  }
  
  std::shared_ptr<DomManager> dom_manager = root_node->GetDomManager().lock();
  if (dom_manager == nullptr) {
    FOOTSTONE_DLOG(WARNING) << "UpdateRootSize dom_manager is nullptr";
    return;
  }

  std::vector<std::function<void()>> ops;
  ops.emplace_back([dom_manager, root_node, width, height] {
    FOOTSTONE_LOG(INFO) << "update root size width = " << width << ", height = " << height << std::endl;
    dom_manager->SetRootSize(root_node, width, height);
    dom_manager->DoLayout(root_node);
    dom_manager->EndBatch(root_node);
  });
  dom_manager->PostTask(Scene(std::move(ops)));
}
