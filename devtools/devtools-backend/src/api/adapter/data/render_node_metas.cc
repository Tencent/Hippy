//
// Copyright (c) 2021 Tencent Corporation. All rights reserved.
// Created by thomasyqguo on 2021/11/2.
//

#include "api/adapter/data/render_node_metas.h"
#include <iostream>
#include <sstream>

namespace tdf {
namespace devtools {
constexpr const char* kRenderName = "name";
constexpr const char* kDomRelativeRenderId = "domRelativeRenderId";
constexpr const char* kRenderIsRepaintBoundary = "isRepaintBoundary";
constexpr const char* kRenderNeedsCompositing = "needsCompositing";
constexpr const char* kTop = "top";
constexpr const char* kLeft = "left";
constexpr const char* kBottom = "bottom";
constexpr const char* kRight = "right";
constexpr const char* kNodeId = "id";
constexpr const char* kBounds = "bounds";
constexpr const char* kChild = "child";

void RenderNodeMetas::AddChild(const RenderNodeMetas& meta) { children_.emplace_back(meta); }

std::string RenderNodeMetas::Serialize() const { return ToJsonString(); }

std::string RenderNodeMetas::ToJsonString() const {
  std::string node_str;
  node_str += "{\"id\":";
  node_str += std::to_string(node_id_);
  node_str += ",\"isRepaintBoundary\":";
  node_str += is_repaint_boundary_ ? "true" : "false";
  node_str += ",\"name\":";
  node_str += "\"";
  node_str += render_name_;
  node_str += "\"";
  node_str += ",\"needsCompositing\":";
  node_str += need_compositing_ ? "true" : "false";
  node_str += ",\"bounds\": {";
  node_str += "\"bottom\":";
  node_str += std::to_string(static_cast<int>(bounds_.bottom));
  node_str += ",\"left\":";
  node_str += std::to_string(static_cast<int>(bounds_.left));
  node_str += ",\"right\":";
  node_str += std::to_string(static_cast<int>(bounds_.right));
  node_str += ",\"top\":";
  node_str += std::to_string(static_cast<int>(bounds_.top));
  node_str += "}";

  if (!children_.empty()) {
    node_str += ",\"child\": [";
    for (auto it = children_.begin(); it != children_.end(); ++it) {
      auto format_str = (*it).ToJsonString();
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
