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

#include "api/adapter/data/dom_node_metas.h"
#include "devtools_base/transform_string_util.h"
#include "module/inspect_props.h"

namespace hippy::devtools {
constexpr char kNodeType[] = "nodeType";
constexpr char kFlexNodeStyle[] = "flexNodeStyle";
constexpr char kAttributes[] = "attributes";
constexpr char kBgColor[] = "bgColor";
constexpr char kText[] = "text";
constexpr char kBase64[] = "base64";
constexpr char kDomRelativeRenderId[] = "domRelativeRenderId";

std::string DomNodeMetas::Serialize() const {
  std::string node_str;
  node_str += "{\"id\":";
  node_str += std::to_string(node_id_);
  node_str += ",\"";
  node_str += kNodeType;
  node_str += "\":\"";
  node_str += node_type_;
  node_str += "\",\"";
  node_str += kFlexNodeStyle;
  node_str += "\":";
  node_str += TransformStringUtil::CombineNodeDefaultValue(style_props_);
  node_str += ",\"";
  node_str += kAttributes;
  node_str += "\":";
  node_str += total_props_;
  node_str += ",\"";
  node_str += kWidth;
  node_str += "\":";
  node_str += std::to_string(static_cast<int>(width_));
  node_str += ",\"";
  node_str += kHeight;
  node_str += "\":";
  node_str += std::to_string(static_cast<int>(height_));
  node_str += ",\"";
  node_str += kDomRelativeRenderId;
  node_str += "\":";
  node_str += "0";
  node_str += ",\"";
  node_str += kBgColor;
  node_str += "\":";
  node_str += "0";
  node_str += ",\"";
  node_str += kBorderColor;
  node_str += "\":";
  node_str += "0";
  node_str += ",\"";
  node_str += kText;
  node_str += "\":";
  node_str += "\"\"";
  node_str += ",\"";
  node_str += kBase64;
  node_str += "\":";
  node_str += "\"\"";
  node_str += ",";
  node_str += "\"bounds\": {";
  node_str += "\"bottom\":";
  node_str += std::to_string(static_cast<int>(bound_.bottom));
  node_str += ",\"left\":";
  node_str += std::to_string(static_cast<int>(bound_.left));
  node_str += ",\"right\":";
  node_str += std::to_string(static_cast<int>(bound_.right));
  node_str += ",\"top\":";
  node_str += std::to_string(static_cast<int>(bound_.top));
  node_str += "}";
  if (!children_.empty()) {
    node_str += ",\"child\": [";
    for (auto& child : children_) {
      node_str += child.Serialize();
      node_str += ",";
    }
    node_str = node_str.substr(0, node_str.length() - 1);  // remove last ","
    node_str += "]";
  }
  node_str += "}";
  return node_str;
}
}  // namespace hippy::devtools
