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

#include "api/adapter/data/domain_metas.h"

namespace hippy::devtools {
constexpr char kWidth[] = "width";
constexpr char kHeight[] = "height";
constexpr char kRootId[] = "rootId";
constexpr char kNodeId[] = "nodeId";
constexpr char kChildren[] = "children";
constexpr char kChildNodeCount[] = "childNodeCount";
constexpr char kNodeName[] = "nodeName";
constexpr char kLocalName[] = "localName";
constexpr char kClassName[] = "className";
constexpr char kNodeValue[] = "nodeValue";
constexpr char kParentId[] = "parentId";
constexpr char kAttributes[] = "attributes";
constexpr char kLayoutX[] = "x";
constexpr char kLayoutY[] = "y";
constexpr char kStyle[] = "style";

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
    for (auto& child : children_) {
      node_str += child.Serialize();
      node_str += ",";
    }
    node_str = node_str.substr(0, node_str.length() - 1); // remove last ","
    node_str += "]";
  }
  node_str += "}";
  return node_str;
}

}  // namespace hippy::devtools
