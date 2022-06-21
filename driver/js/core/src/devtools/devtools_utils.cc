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

#include "devtools/devtools_utils.h"

namespace hippy::devtools {
constexpr char kDefaultNodeName[] = "DefaultNode";
constexpr char kAttributes[] = "attributes";
constexpr char kText[] = "text";

DomNodeMetas DevToolsUtil::ToDomNodeMetas(const std::shared_ptr<DomNode>& dom_node) {
  DomNodeMetas metas(dom_node->GetId());
  if (!dom_node->GetTagName().empty()) {
    metas.SetNodeType(dom_node->GetTagName());
  } else if (!dom_node->GetViewName().empty()) {
    metas.SetNodeType(dom_node->GetViewName());
  } else {
    metas.SetNodeType(kDefaultNodeName);
  }
  auto layout_result = dom_node->GetLayoutInfoFromRoot();
  metas.SetWidth(static_cast<uint32_t>(layout_result.width));
  metas.SetHeight(static_cast<uint32_t>(layout_result.height));
  metas.SetBounds(hippy::devtools::BoundRect{layout_result.left, layout_result.top,
                                             layout_result.left + layout_result.width,
                                             layout_result.top + layout_result.height});
  metas.SetStyleProps(ParseNodeProps(dom_node->GetStyleMap()));
  metas.SetTotalProps(ParseNodeProps(dom_node->GetExtStyle()));
  for (const auto& node : dom_node->GetChildren()) {
    metas.AddChild(ToDomNodeMetas(node));
  }
  return metas;
}

DomainMetas DevToolsUtil::GetDomDomainData(const std::shared_ptr<DomNode>& root_node,
                                           const std::shared_ptr<DomNode>& dom_node,
                                           uint32_t depth,
                                           const std::shared_ptr<DomManager>& dom_manager) {
  DomainMetas metas(dom_node->GetId());
  metas.SetParentId(dom_node->GetPid());
  metas.SetRootId(root_node->GetId());
  if (dom_node->GetId() == root_node->GetId()) {
    metas.SetClassName(kDefaultNodeName);
    metas.SetNodeName(kDefaultNodeName);
    metas.SetLocalName(kDefaultNodeName);
    metas.SetNodeValue(kDefaultNodeName);
  } else {
    metas.SetClassName(dom_node->GetViewName());
    metas.SetNodeName(dom_node->GetTagName());
    metas.SetLocalName(dom_node->GetTagName());
    metas.SetNodeValue(ParseNodeKeyProps(kText, dom_node->GetExtStyle()));
  }
  metas.SetStyleProps(ParseNodeProps(dom_node->GetStyleMap()));
  metas.SetTotalProps(ParseNodeKeyProps(kAttributes, dom_node->GetExtStyle()));
  auto children = dom_node->GetChildren();
  metas.SetChildrenCount(children.size());
  depth--;
  if (depth <= 0) {
    return metas;
  }
  for (auto& child : children) {
    metas.AddChild(GetDomDomainData(root_node, child, depth, dom_manager));
  }
  auto layout_result = dom_node->GetLayoutInfoFromRoot();
  metas.SetLayoutX(layout_result.left);
  metas.SetLayoutY(layout_result.top);
  metas.SetWidth(layout_result.width);
  metas.SetHeight(layout_result.height);
  return metas;
}

DomNodeLocation DevToolsUtil::GetNodeIdByDomLocation(const std::shared_ptr<DomNode>& dom_node, double x, double y) {
  auto hit_node = GetHitNode(dom_node, x, y);
  if (hit_node == nullptr) {
    hit_node = dom_node;
  }
  uint32_t node_id = hit_node->GetId();
  DomNodeLocation node_location(node_id);
  node_location.AddRelationId(node_id);
  auto temp_hit_node = hit_node->GetParent();
  while (temp_hit_node != nullptr && temp_hit_node != dom_node) {
    node_location.AddRelationId(temp_hit_node->GetId());
    temp_hit_node = temp_hit_node->GetParent();
  }
  return node_location;
}

DomPushNodePathMetas DevToolsUtil::GetPushNodeByPath(const std::shared_ptr<DomNode>& dom_node,
                                                     std::vector<std::map<std::string, int32_t>> path) {
  auto temp_node = dom_node;
  DomPushNodePathMetas metas;
  for (auto& path_it : path) {
    auto node_tag_name_id_it = path_it.begin();
    auto tag_name = node_tag_name_id_it->first;
    auto child_number = node_tag_name_id_it->second;
    auto child_node = temp_node->GetChildAt(static_cast<size_t>(child_number));
    if (!child_node || strcasecmp(child_node->GetTagName().c_str(), tag_name.c_str()) != 0) {
      continue;
    }
    temp_node = child_node;
    metas.AddRelationNodeId(child_node->GetId());
  }
  metas.SetHitNodeId(temp_node->GetId());
  return metas;
}

std::shared_ptr<DomNode> DevToolsUtil::GetHitNode(const std::shared_ptr<DomNode>& node, double x, double y) {
  if (node == nullptr || !IsLocationHitNode(node, x, y)) {
    return nullptr;
  }
  std::shared_ptr<DomNode> hit_node = node;
  for (auto& child : node->GetChildren()) {
    if (!IsLocationHitNode(child, x, y)) {
      continue;
    }
    auto new_node = GetHitNode(child, x, y);
    if (hit_node == nullptr) {
      hit_node = new_node;
    } else if (new_node != nullptr) {
      auto hit_node_area = hit_node->GetLayoutNode()->GetWidth() * hit_node->GetLayoutNode()->GetHeight();
      auto new_node_area = new_node->GetLayoutNode()->GetWidth() * new_node->GetLayoutNode()->GetHeight();
      hit_node = hit_node_area > new_node_area ? new_node : hit_node;
    }
  }
  return hit_node;
}

bool DevToolsUtil::IsLocationHitNode(const std::shared_ptr<DomNode>& dom_node, double x, double y) {
  LayoutResult layout_result = dom_node->GetLayoutInfoFromRoot();
  double self_x = static_cast<uint32_t>(layout_result.left);
  double self_y = static_cast<uint32_t>(layout_result.top);
  bool in_top_offset = (x >= self_x) && (y >= self_y);
  bool in_bottom_offset = (x <= self_x + layout_result.width) && (y <= self_y + layout_result.height);
  return in_top_offset && in_bottom_offset;
}

std::string DevToolsUtil::ParseDomValue(const HippyValue& dom_value) {
  if (!dom_value.IsObject()) {
    FOOTSTONE_DLOG(INFO) << "ParseTotalProps, node props is not object";
    return "{}";
  }
  std::string node_str = "{";
  bool first_object = true;
  for (auto iterator : dom_value.ToObjectChecked()) {
    if (iterator.first == "uri" || iterator.first == "src") {
      iterator.second = "";
    }
    std::string key = iterator.first;
    if (iterator.second.IsBoolean()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += iterator.second.ToBooleanChecked() ? "true" : "false";
      first_object = false;
    } else if (iterator.second.IsInt32()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator.second.ToInt32Checked());
      first_object = false;
    } else if (iterator.second.IsUInt32()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator.second.IsUInt32());
      first_object = false;
    } else if (iterator.second.IsDouble()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator.second.ToDoubleChecked());
      first_object = false;
    } else if (iterator.second.IsString()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":\"";
      node_str += iterator.second.ToStringChecked();
      node_str += "\"";
      first_object = false;
    } else if (iterator.second.IsArray()) {
      auto props_array = iterator.second.ToArrayChecked();
      std::string array = "[";
      for (auto it = props_array.begin(); it != props_array.end(); ++it) {
        if (it->IsNull() || it->IsUndefined()) {
          continue;
        }
        array += ParseDomValue(*it);
        if (it != props_array.end() - 1) {
          array += ",";
        }
      }
      array += "]";

      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += array;
      first_object = false;

    } else if (iterator.second.IsObject()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += ParseDomValue(iterator.second);
      first_object = false;
    }
  }
  node_str += "}";
  return node_str;
}

std::string DevToolsUtil::ParseNodeKeyProps(const std::string& node_key, const NodePropsUnorderedMap& node_props) {
  if (!node_props || node_props->empty()) {
    FOOTSTONE_DLOG(INFO) << "ParseNodeKeyProps, node props is not object";
    return node_key == kAttributes ? "{}" : "";
  }
  if (!node_key.empty()) {
    for (auto& node_prop : *node_props) {
      if (node_prop.first != node_key) {
        continue;
      }
      if (node_key == kAttributes && node_prop.second->IsObject()) {
        std::unordered_map<std::string, HippyValue> sec = node_prop.second->ToObjectChecked();
        return ParseNodeProps(sec);
      }
      if (node_key == kText && node_prop.second->IsString()) {
        return node_prop.second->ToStringChecked();
      }
    }
  }
  return node_key == kAttributes ? "{}" : "";
}

std::string DevToolsUtil::ParseNodeProps(const NodePropsUnorderedMap& node_props) {
  if (!node_props || node_props->empty()) {
    FOOTSTONE_DLOG(INFO) << "ParseNodeProps, node props is not object";
    return "{}";
  }
  std::string node_str = "{";
  bool first_object = true;
  for (auto& iterator : *node_props) {
    AppendDomKeyValue(node_str, first_object, iterator.first, *iterator.second);
  }
  node_str += "}";
  return node_str;
}

std::string DevToolsUtil::ParseNodeProps(const std::unordered_map<std::string, HippyValue>& node_props) {
  if (node_props.empty()) {
    FOOTSTONE_DLOG(INFO) << "ParseNodeProps, node props is not object";
    return "{}";
  }
  std::string node_str = "{";
  bool first_object = true;
  for (const auto& node_prop : node_props) {
    std::string key = node_prop.first;
    AppendDomKeyValue(node_str, first_object, node_prop.first, node_prop.second);
  }
  node_str += "}";
  return node_str;
}

void DevToolsUtil::AppendDomKeyValue(std::string& node_str,
                                     bool& first_object,
                                     const std::string& node_key,
                                     const HippyValue& dom_value) {
  if (dom_value.IsBoolean()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += dom_value.ToBooleanChecked() ? "true" : "false";
    first_object = false;
  } else if (dom_value.IsInt32()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += std::to_string(dom_value.ToInt32Checked());
    first_object = false;
  } else if (dom_value.IsUInt32()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += std::to_string(dom_value.IsUInt32());
    first_object = false;
  } else if (dom_value.IsDouble()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += std::to_string(dom_value.ToDoubleChecked());
    first_object = false;
  } else if (dom_value.IsString()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":\"";
    node_str += dom_value.ToStringChecked();
    node_str += "\"";
    first_object = false;
  } else if (dom_value.IsArray()) {
    auto props_array = dom_value.ToArrayChecked();
    std::string array = "[";
    for (auto it = props_array.begin(); it != props_array.end(); ++it) {
      if (it->IsNull() || it->IsUndefined()) {
        continue;
      }
      array += ParseDomValue(*it);  // ParseDomValue(*it);
      if (it != props_array.end() - 1) {
        array += ",";
      }
    }
    array += "]";
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += array;
    first_object = false;
  } else if (dom_value.IsObject()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += ParseDomValue(dom_value);
    first_object = false;
  }
}

void DevToolsUtil::PostDomTask(int32_t dom_id, std::function<void()> func) {
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id));
  if (dom_manager) {
    std::vector<std::function<void()>> ops = {func};
    dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
  }
}
}  // namespace hippy::devtools
