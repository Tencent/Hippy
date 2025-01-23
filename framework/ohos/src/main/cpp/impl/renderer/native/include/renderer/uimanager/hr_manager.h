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

#pragma once

#include <memory>
#include <map>
#include "renderer/uimanager/hr_view_manager.h"
#include "renderer/virtual/hr_virtual_view_manager.h"

namespace hippy {
inline namespace render {
inline namespace native {

class HRManager {
public:
  HRManager(uint32_t instance_id, std::shared_ptr<NativeRender> &native_render, bool is_rawfile, const std::string &res_module_name);
  ~HRManager() = default;
  
  void RegisterCustomTsRenderViews(napi_env ts_env, napi_ref ts_render_provider_ref, std::set<std::string> &custom_views, std::map<std::string, std::string> &mapping_views);
  
//   void InitViewManager(uint32_t root_id);
  std::shared_ptr<HRViewManager> GetViewManager(uint32_t root_id);
  std::shared_ptr<HRVirtualViewManager> GetVirtualNodeManager(uint32_t root_id);
  
  void RemoveViewManager(uint32_t root_id);
  void RemoveVirtualNodeManager(uint32_t root_id);

private:
  void AddViewManager(uint32_t root_id, std::shared_ptr<HRViewManager> &view_manager);
  void AddVirtualNodeManager(uint32_t root_id, std::shared_ptr<HRVirtualViewManager> &virtual_view_manager);

  uint32_t instance_id_;
  std::weak_ptr<NativeRender> native_render_;
  std::map<uint32_t, std::shared_ptr<HRViewManager>> view_manager_map_;
  std::map<uint32_t, std::shared_ptr<HRVirtualViewManager>> virtual_view_manager_map_;
  
  std::map<std::string, std::string> mapping_render_views_;
  std::set<std::string> custom_ts_render_views_;
  napi_env ts_env_ = nullptr;
  napi_ref ts_render_provider_ref_ = nullptr;
  
  bool is_rawfile_ = false;
  std::string res_module_name_;
};

} // namespace native
} // namespace render
} // namespace hippy
