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

nlohmann::json DomainMetas::ToJson() const {
  nlohmann::json jsonObject;
  jsonObject[kNodeId] = node_id_;
  jsonObject[kParentId] = parent_id_;
  jsonObject[kRootId] = root_id_;
  jsonObject[kClassName] = class_name_;
  jsonObject[kNodeName] = node_name_;
  jsonObject[kLocalName] = local_name_;
  jsonObject[kNodeValue] = node_value_;
  jsonObject[kChildNodeCount] = children_.size();
  jsonObject[kStyle] = nlohmann::json::parse(style_props_, nullptr, false);
  jsonObject[kAttributes] = nlohmann::json::parse(total_props_, nullptr, false);
  jsonObject[kLayoutX] = static_cast<int>(layout_x_);
  jsonObject[kLayoutY] = static_cast<int>(layout_y_);
  jsonObject[kWidth] = static_cast<int>(width_);
  jsonObject[kHeight] = static_cast<int>(height_);
  jsonObject[kChildNodeCount] = static_cast<int>(children_count_);
  if (!children_.empty()) {
    for (auto& child : children_) {
      jsonObject["children"].push_back(child.ToJson());
    }
  }
  return jsonObject;
}
}  // namespace hippy::devtools
