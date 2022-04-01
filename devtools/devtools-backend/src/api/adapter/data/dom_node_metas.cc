//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#include "api/adapter/data/dom_node_metas.h"
#include <iostream>
#include <sstream>
#include "devtools_base/transform_string_util.hpp"
#include "module/inspect_props.h"

namespace tdf {
namespace devtools {
constexpr const char* kNodeType = "nodeType";
constexpr const char* kId = "id";
constexpr const char* kBorderLeft = "borderLeft";
constexpr const char* kBorderTop = "borderTop";
constexpr const char* kBorderRight = "borderRight";
constexpr const char* kBorderBottom = "borderBottom";
constexpr const char* kTotalProps = "total_props";
constexpr const char* kFlexNodeStyle = "flexNodeStyle";
constexpr const char* kBounds = "bounds";
constexpr const char* kChild = "child";
constexpr const char* kAttributes = "attributes";
constexpr const char* kStyle = "style";
constexpr const char* kBgColor = "bgColor";
constexpr const char* kText = "text";
constexpr const char* kBase64 = "base64";
constexpr const char* kDomRelativeRenderId = "domRelativeRenderId";

void DomNodeMetas::AddChild(const DomNodeMetas& meta) { children_.emplace_back(meta); }

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
