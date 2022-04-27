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

#include "api/adapter/data/render_node_metas.h"
#include <iostream>
#include <sstream>

namespace hippy {
namespace devtools {
constexpr char kRenderName[] = "name";
constexpr char kDomRelativeRenderId[] = "domRelativeRenderId";
constexpr char kRenderIsRepaintBoundary[] = "isRepaintBoundary";
constexpr char kRenderNeedsCompositing[] = "needsCompositing";
constexpr char kTop[] = "top";
constexpr char kLeft[] = "left";
constexpr char kBottom[] = "bottom";
constexpr char kRight[] = "right";
constexpr char kNodeId[] = "id";
constexpr char kBounds[] = "bounds";
constexpr char kChild[] = "child";

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
}  // namespace hippy
