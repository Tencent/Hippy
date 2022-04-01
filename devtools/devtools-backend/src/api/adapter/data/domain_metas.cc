//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#include "api/adapter/data/domain_metas.h"
#include <iostream>
#include <sstream>

namespace tdf {
namespace devtools {
constexpr const char* kWidth = "width";
constexpr const char* kHeight = "height";
constexpr const char* kRootId = "rootId";
constexpr const char* kNodeId = "nodeId";
constexpr const char* kChildren = "children";
constexpr const char* kChildNodeCount = "childNodeCount";
constexpr const char* kNodeName = "nodeName";
constexpr const char* kLocalName = "localName";
constexpr const char* kClassName = "className";
constexpr const char* kNodeValue = "nodeValue";
constexpr const char* kParentId = "parentId";
constexpr const char* kAttributes = "attributes";
constexpr const char* kLayoutX = "x";
constexpr const char* kLayoutY = "y";
constexpr const char* kStyle = "style";

void DomainMetas::AddChild(const DomainMetas& meta) { children_.emplace_back(meta); }

std::string DomainMetas::Serialize() const {
  std::string node_str = "{\"";
  node_str += kNodeId;
  node_str += "\":";
  node_str += std::to_string(node_id_);
  node_str += ",\"";
  node_str += kParentId;
  node_str += "\":";
  node_str += std::to_string(parent_id_);
  node_str += ",\"";
  node_str += kRootId;
  node_str += "\":";
  node_str += std::to_string(root_id_);
  node_str += ",\"";
  node_str += kClassName;
  node_str += "\":\"";
  node_str += class_name_;
  node_str += "\",\"";
  node_str += kNodeName;
  node_str += "\":\"";
  node_str += node_name_;
  node_str += "\",\"";
  node_str += kLocalName;
  node_str += "\":\"";
  node_str += local_name_;
  node_str += "\",\"";
  node_str += kNodeValue;
  node_str += "\":\"";
  node_str += node_value_;
  node_str += "\",\"";
  node_str += kChildNodeCount;
  node_str += "\":";
  node_str += std::to_string(children_.size());
  node_str += ",\"";
  node_str += kStyle;
  node_str += "\":";
  node_str += style_props_;
  node_str += ",\"";
  node_str += kAttributes;
  node_str += "\":";
  node_str += total_props_;
  node_str += ",\"";
  node_str += kLayoutX;
  node_str += "\":";
  node_str += std::to_string(static_cast<int>(layout_x_));
  node_str += ",\"";
  node_str += kLayoutY;
  node_str += "\":";
  node_str += std::to_string(static_cast<int>(layout_y_));
  node_str += ",\"";
  node_str += kWidth;
  node_str += "\":";
  node_str += std::to_string(static_cast<int>(width_));
  node_str += ",\"";
  node_str += kHeight;
  node_str += "\":";
  node_str += std::to_string(static_cast<int>(height_));
  node_str += ",\"";
  node_str += kChildNodeCount;
  node_str += "\":";
  node_str += std::to_string(static_cast<int>(children_count_));
  if (!children_.empty()) {
    node_str += ",\"children\": [";
    for (auto it = children_.begin(); it != children_.end(); ++it) {
      auto format_str = (*it).Serialize();
      node_str += format_str;
      if (it != children_.end() - 1) {
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
