/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

#pragma once

#include <chrono>
#include <string>
#include <vector>
#include "api/adapter/data/serializable.h"

namespace hippy {
namespace devtools {

class DomNodeLocation : public Serializable {
 public:
  DomNodeLocation() = default;
  explicit DomNodeLocation(uint32_t node_id) : node_id_(node_id) {}
  void AddRelationId(uint32_t id) { relation_tree_ids_.emplace_back(id); }
  std::string Serialize() const override;

 private:
  uint32_t node_id_;
  std::vector<uint32_t> relation_tree_ids_;
};
}  // namespace devtools
}  // namespace hippy
