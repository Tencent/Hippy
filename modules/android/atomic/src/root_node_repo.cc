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

#include "atomic/root_node_repo.h"

#include <unordered_map>
#include <mutex>

namespace hippy {
namespace bridge {

std::unordered_map<uint32_t, std::shared_ptr<RootNode>> root_nodes;
std::mutex mutex;

void RootNodeRepo::Insert(const std::shared_ptr<RootNode>& root_node) {
  std::lock_guard<std::mutex> lock(mutex);
  root_nodes[root_node->GetId()] = root_node;
}

std::shared_ptr<RootNode> RootNodeRepo::Find(uint32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto& it = root_nodes.find(id);
  if (it == root_nodes.end()) {
    return nullptr;
  }

  return it->second;
}

bool RootNodeRepo::Erase(uint32_t id) {
  std::lock_guard<std::mutex> lock(mutex);
  const auto& it = root_nodes.find(id);
  if (it == root_nodes.end()) {
    return false;
  }

  root_nodes.erase(it);
  return true;
}

}  // namespace bridge
}  // namespace hippy
