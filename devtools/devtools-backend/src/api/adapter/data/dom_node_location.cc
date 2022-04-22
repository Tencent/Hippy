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

#include "api/adapter/data/dom_node_location.h"
#include <iostream>
#include <sstream>

namespace tdf {
namespace devtools {
constexpr const char* kNodeId = "nodeId";
constexpr const char* kHitNodeRelationTree = "hitNodeRelationTree";

std::string DomNodeLocation::Serialize() const {
  std::string node_str;
  node_str += "{";
  node_str += "\"";
  node_str += kNodeId;
  node_str += "\":";
  node_str += std::to_string(node_id_);
  if (!relation_tree_ids_.empty()) {
    node_str += ",\"hitNodeRelationTree\": [";
    for (int i = 0; i < relation_tree_ids_.size(); ++i) {
      node_str += std::to_string(relation_tree_ids_[i]);
      if (i < relation_tree_ids_.size() - 1) {
        node_str += ",";
      }
    }
    node_str += "]";
  }
  node_str += "}";
  return node_str;
}

}  // namespace devtools
}  // namespace tdf
