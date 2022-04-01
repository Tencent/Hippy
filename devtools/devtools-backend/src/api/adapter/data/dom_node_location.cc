//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

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
