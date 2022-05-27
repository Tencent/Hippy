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

namespace hippy::devtools {
constexpr char kNodeId[] = "nodeId";

std::string DomNodeLocation::Serialize() const {
  std::string node_str;
  node_str += "{";
  node_str += "\"";
  node_str += kNodeId;
  node_str += "\":";
  node_str += std::to_string(node_id_);
  if (!relation_tree_ids_.empty()) {
    node_str += ",\"hitNodeRelationTree\": [";
    for (auto& child : relation_tree_ids_) {
      node_str += std::to_string(child);
      node_str += ",";
    }
    node_str = node_str.substr(0, node_str.length() - 1); // remove last ","
    node_str += "]";
  }
  node_str += "}";
  return node_str;
}
}  // namespace hippy::devtools
