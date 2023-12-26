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

#include "renderer/virtual/hr_virtual_view_manager.h"

namespace hippy {
inline namespace render {
inline namespace native {

HRVirtualViewManager::HRVirtualViewManager() {
  
}

std::shared_ptr<HRVirtualView> HRVirtualViewManager::CreateVirtualNode(uint32_t root_id, uint32_t id, uint32_t pid, int32_t index, HippyValueObjectType &props) {
  auto node = std::make_shared<HRVirtualView>();
  node->root_id_ = root_id;
  node->id_ = id;
  node->pid_ = pid;
  node->index_ = index;
  node->props_ = props;
  return node;
}

void HRVirtualViewManager::AddVirtualNode(uint32_t id, std::shared_ptr<HRVirtualView> &view) {
  virtual_views_[id] = view;
}

void HRVirtualViewManager::RemoveVirtualNode(uint32_t id) {
  virtual_views_.erase(id);
}

std::shared_ptr<HRVirtualView> HRVirtualViewManager::GetVirtualNode(uint32_t id) {
  auto it = virtual_views_.find(id);
  return it != virtual_views_.end() ? it->second : nullptr;
}

std::vector<std::shared_ptr<HRVirtualView>> HRVirtualViewManager::GetVirtualChildrenNode(uint32_t id) {
  std::vector<std::shared_ptr<HRVirtualView>> ret;
  for (auto it = virtual_views_.begin(); it != virtual_views_.end(); it++) {
    auto &view = it->second;
    if (view->pid_ == id) {
      ret.push_back(it->second);
    }
  }
  return ret;
}

} // namespace native
} // namespace render
} // namespace hippy
