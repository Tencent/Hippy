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

#include "renderer/native_render_provider_manager.h"

namespace hippy {
inline namespace render {
inline namespace native {

std::map<uint32_t, std::shared_ptr<NativeRenderProvider>> NativeRenderProviderManager::provider_map_;
std::map<uint32_t, uint32_t> NativeRenderProviderManager::root_id_map_;

void NativeRenderProviderManager::AddRenderProvider(uint32_t instance_id, std::shared_ptr<NativeRenderProvider> &provider) {
  provider_map_[instance_id] = provider;
}

void NativeRenderProviderManager::RemoveRenderProvider(uint32_t instance_id) {
  provider_map_.erase(instance_id);
}

std::shared_ptr<NativeRenderProvider> &NativeRenderProviderManager::GetRenderProvider(uint32_t instance_id) {
  return provider_map_[instance_id];
}

void NativeRenderProviderManager::SaveRootIdWithScopeId(uint32_t root_id, uint32_t scope_id) {
  root_id_map_[root_id] = scope_id;
}

uint32_t NativeRenderProviderManager::GetScopeIdOfRootId(uint32_t root_id) {
  auto it = root_id_map_.find(root_id);
  if (it != root_id_map_.end()) {
    return it->second;
  }
  return 0;
}

} // namespace native
} // namespace render
} // namespace hippy
