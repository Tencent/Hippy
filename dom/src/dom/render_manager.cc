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

#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {
static std::unordered_map<int32_t, std::shared_ptr<RenderManager>> render_manager_map;
static std::mutex mutex;
static std::atomic<int32_t> global_render_manager_key{0};

int32_t RenderManager::GenerateRenderId() { return global_render_manager_key.fetch_add(1); }

void RenderManager::Insert(const std::shared_ptr<RenderManager>& render_manager) {
  std::lock_guard<std::mutex> lock(mutex);
  render_manager_map[render_manager->GetId()] = render_manager;
}

std::shared_ptr<RenderManager> RenderManager::Find(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = render_manager_map.find(id);
  if (it == render_manager_map.end()) {
    return nullptr;
  }
  return it->second;
}

bool RenderManager::Erase(int32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = render_manager_map.find(id);
  if (it == render_manager_map.end()) {
    return false;
  }
  render_manager_map.erase(it);
  return true;
}

bool RenderManager::Erase(const std::shared_ptr<RenderManager>& render_manager) {
  return RenderManager::Erase(render_manager->GetId());
}

}  // namespace dom
}  // namespace hippy