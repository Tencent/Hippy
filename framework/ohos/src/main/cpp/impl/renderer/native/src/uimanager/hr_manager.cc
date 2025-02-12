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

#include "renderer/uimanager/hr_manager.h"

namespace hippy {
inline namespace render {
inline namespace native {

HRManager::HRManager(uint32_t instance_id, std::shared_ptr<NativeRender> &native_render, bool is_rawfile, const std::string &res_module_name)
  : instance_id_(instance_id), native_render_(native_render), is_rawfile_(is_rawfile), res_module_name_(res_module_name) {
  
}

void HRManager::RegisterCustomTsRenderViews(napi_env ts_env, napi_ref ts_render_provider_ref, std::set<std::string> &custom_views, std::map<std::string, std::string> &mapping_views) {
  mapping_render_views_ = mapping_views;
  custom_ts_render_views_ = custom_views;
  ts_env_ = ts_env;
  ts_render_provider_ref_ = ts_render_provider_ref;
}

// void HRManager::InitViewManager(uint32_t root_id) {
//   auto view_manager = std::make_shared<HRViewManager>();
//   AddViewManager(root_id, view_manager);
//   auto virtual_view_manager = std::make_shared<HRVirtualViewManager>();
//   AddVirtualNodeManager(root_id, virtual_view_manager);
// }

std::shared_ptr<HRViewManager> HRManager::GetViewManager(uint32_t root_id) {
  auto it = view_manager_map_.find(root_id);
  if (it == view_manager_map_.end()) {
    auto native_render = native_render_.lock();
    auto view_manager = std::make_shared<HRViewManager>(instance_id_, root_id, native_render,
      ts_env_, ts_render_provider_ref_, custom_ts_render_views_, mapping_render_views_, is_rawfile_, res_module_name_);
    AddViewManager(root_id, view_manager);
    return view_manager;
  }
  return it->second;
}

std::shared_ptr<HRVirtualViewManager> HRManager::GetVirtualNodeManager(uint32_t root_id) {
  auto it = virtual_view_manager_map_.find(root_id);
  if (it == virtual_view_manager_map_.end()) {
    auto virtual_view_manager = std::make_shared<HRVirtualViewManager>();
    AddVirtualNodeManager(root_id, virtual_view_manager);
    return virtual_view_manager;
  }
  return it->second;
}

void HRManager::RemoveViewManager(uint32_t root_id) {
  view_manager_map_[root_id] = nullptr;
}

void HRManager::RemoveVirtualNodeManager(uint32_t root_id) {
  virtual_view_manager_map_[root_id] = nullptr;
}

void HRManager::AddViewManager(uint32_t root_id, std::shared_ptr<HRViewManager> &view_manager) {
  view_manager_map_[root_id] = view_manager;
}

void HRManager::AddVirtualNodeManager(uint32_t root_id, std::shared_ptr<HRVirtualViewManager> &virtual_view_manager) {
  virtual_view_manager_map_[root_id] = virtual_view_manager;
}

} // namespace native
} // namespace render
} // namespace hippy
