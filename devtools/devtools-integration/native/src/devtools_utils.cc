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

#include "api/devtools_define.h"
#include "devtools/devtools_utils.h"

namespace hippy::devtools {
constexpr char kDefaultNodeName[] = "DefaultNode";
constexpr char kAttributes[] = "attributes";
constexpr char kText[] = "text";
constexpr char kGetLocationOnScreen[] = "getLocationOnScreen";
constexpr char kXOnScreen[] = "xOnScreen";
constexpr char kYOnScreen[] = "yOnScreen";
constexpr char kViewWidth[] = "viewWidth";
constexpr char kViewHeight[] = "viewHeight";

DomNodeMetas DevToolsUtil::ToDomNodeMetas(const std::shared_ptr<DomNode>& root_node, const std::shared_ptr<DomNode>& dom_node) {
  DomNodeMetas metas(dom_node->GetId());
  if (!dom_node->GetTagName().empty()) {
    metas.SetNodeType(dom_node->GetTagName());
  } else if (!dom_node->GetViewName().empty()) {
    metas.SetNodeType(dom_node->GetViewName());
  } else {
    metas.SetNodeType(kDefaultNodeName);
  }
  auto layout_result = GetLayoutOnScreen(root_node, dom_node);
  metas.SetWidth(static_cast<uint32_t>(layout_result.width));
  metas.SetHeight(static_cast<uint32_t>(layout_result.height));
  metas.SetBounds(hippy::devtools::BoundRect{layout_result.left, layout_result.top,
                                             layout_result.left + layout_result.width,
                                             layout_result.top + layout_result.height});
  metas.SetStyleProps(ParseNodeProps(dom_node->GetStyleMap()));
  metas.SetTotalProps(ParseNodeProps(dom_node->GetExtStyle()));
  for (const auto& node : dom_node->GetChildren()) {
    metas.AddChild(ToDomNodeMetas(root_node, node));
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
  auto layout_result = GetLayoutOnScreen(root_node, dom_node);
  metas.SetLayoutX(layout_result.left);
  metas.SetLayoutY(layout_result.top);
  metas.SetWidth(layout_result.width);
  metas.SetHeight(layout_result.height);
  return metas;
}

DomNodeLocation DevToolsUtil::GetNodeIdByDomLocation(const std::shared_ptr<DomNode>& root_node, double x, double y) {
  auto hit_node = GetHitNode(root_node, root_node, x, y);
  FOOTSTONE_LOG(INFO) << "GetNodeIdByDomLocation hit_node:" << hit_node << ", " << x << ",y:" << y;
  if (hit_node == nullptr) {
    hit_node = root_node;
  }
  uint32_t node_id = hit_node->GetId();
  DomNodeLocation node_location(node_id);
  node_location.AddRelationId(node_id);
  auto temp_hit_node = hit_node->GetParent();
  while (temp_hit_node != nullptr && temp_hit_node != root_node) {
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

std::shared_ptr<DomNode> DevToolsUtil::GetHitNode(const std::shared_ptr<DomNode>& root_node, const std::shared_ptr<DomNode>& node, double x, double y) {
  if (node == nullptr || !IsLocationHitNode(root_node, node, x, y)) {
    return nullptr;
  }
  std::shared_ptr<DomNode> hit_node = node;
  for (auto& child : node->GetChildren()) {
    if (!IsLocationHitNode(root_node, child, x, y)) {
      continue;
    }
    auto new_node = GetHitNode(root_node, child, x, y);
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

bool DevToolsUtil::IsLocationHitNode(const std::shared_ptr<DomNode>& root_node, const std::shared_ptr<DomNode>& dom_node, double x, double y) {
  LayoutResult layout_result = GetLayoutOnScreen(root_node, dom_node);
  double self_x = static_cast<uint32_t>(layout_result.left);
  double self_y = static_cast<uint32_t>(layout_result.top);
  bool in_top_offset = (x >= self_x) && (y >= self_y);
  bool in_bottom_offset = (x <= self_x + layout_result.width) && (y <= self_y + layout_result.height);
  return in_top_offset && in_bottom_offset;
}

template <class F>
auto MakeCopyable(F&& f) {
  auto s = std::make_shared<std::decay_t<F>>(std::forward<F>(f));
  return [s](auto&&... args) -> decltype(auto) {
    return (*s)(decltype(args)(args)...);
  };
}

LayoutResult DevToolsUtil::GetLayoutOnScreen(const std::shared_ptr<DomNode>& root_node, const std::shared_ptr<DomNode>& dom_node) {
  std::shared_ptr<DomNode> find_node = nullptr;
  if (dom_node == root_node) {
    auto children = root_node->GetChildren();
    if (!children.empty()) {
      find_node = children[0];
    }
  } else {
    find_node = dom_node;
  }
  LayoutResult layout_result;
  std::promise<LayoutResult> layout_promise;
  std::future<LayoutResult> read_file_future = layout_promise.get_future();
  if (!find_node) {
    return layout_result;
  }
  footstone::value::HippyValue::HippyValueObjectType hippy_value_object;
  hippy_value_object["id"] = footstone::value::HippyValue(1);
  footstone::value::HippyValue::HippyValueArrayType hippy_value_array;
  hippy_value_array.push_back(footstone::value::HippyValue(hippy_value_object));
  footstone::value::HippyValue argument_hippy_value(hippy_value_array);
  hippy::dom::DomArgument argument(argument_hippy_value);
  auto screen_shot_callback =
      MakeCopyable([promise = std::move(layout_promise)](std::shared_ptr<hippy::dom::DomArgument> arg) mutable {
        footstone::value::HippyValue result_hippy_value;
        arg->ToObject(result_hippy_value);
        footstone::value::HippyValue::HippyValueObjectType result_dom_object;
        LayoutResult result;
        if (result_hippy_value.IsArray() && !result_hippy_value.ToArrayChecked().empty()) {
          result_dom_object = result_hippy_value.ToArrayChecked()[0].ToObjectChecked();
        } else if (result_hippy_value.IsObject()) {
          result_dom_object = result_hippy_value.ToObjectChecked();
        } else {
          // maybe flat ui optimization and remove it
          promise.set_value(result);
          return;
        }
        result.left = static_cast<float>(result_dom_object.find(kXOnScreen)->second.ToDoubleChecked());
        result.top = static_cast<float>(result_dom_object.find(kYOnScreen)->second.ToDoubleChecked());
        result.width = static_cast<float>(result_dom_object.find(kViewWidth)->second.ToDoubleChecked());
        result.height = static_cast<float>(result_dom_object.find(kViewHeight)->second.ToDoubleChecked());
        promise.set_value(result);
      });
  find_node->CallFunction(kGetLocationOnScreen, argument, screen_shot_callback);
  std::chrono::milliseconds span(10);
  if (read_file_future.wait_for(span) == std::future_status::timeout) {
    FOOTSTONE_DLOG(WARNING) << kDevToolsTag << "GetLayoutOnScreen wait_for timeout, node:" << find_node->GetViewName() << ",id:" << find_node->GetId();
    return layout_result;
  }
  layout_result = read_file_future.get();
  return layout_result;
}

std::string DevToolsUtil::ParseDomValue(const HippyValue& hippy_value) {
  if (!hippy_value.IsObject()) {
    FOOTSTONE_DLOG(INFO) << kDevToolsTag << "ParseTotalProps, node props is not object";
    return "{}";
  }
  std::string node_str = "{";
  bool first_object = true;
  for (auto iterator : hippy_value.ToObjectChecked()) {
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
    FOOTSTONE_DLOG(INFO) << kDevToolsTag << "ParseNodeKeyProps, node props is not object";
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
    FOOTSTONE_DLOG(INFO) << kDevToolsTag << "ParseNodeProps, node props is not object";
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
    FOOTSTONE_DLOG(INFO) << kDevToolsTag << "ParseNodeProps, node props is not object";
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
                                     const HippyValue& hippy_value) {
  if (hippy_value.IsBoolean()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += hippy_value.ToBooleanChecked() ? "true" : "false";
    first_object = false;
  } else if (hippy_value.IsInt32()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += std::to_string(hippy_value.ToInt32Checked());
    first_object = false;
  } else if (hippy_value.IsUInt32()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += std::to_string(hippy_value.IsUInt32());
    first_object = false;
  } else if (hippy_value.IsDouble()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += std::to_string(hippy_value.ToDoubleChecked());
    first_object = false;
  } else if (hippy_value.IsString()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":\"";
    node_str += hippy_value.ToStringChecked();
    node_str += "\"";
    first_object = false;
  } else if (hippy_value.IsArray()) {
    auto props_array = hippy_value.ToArrayChecked();
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
  } else if (hippy_value.IsObject()) {
    node_str += first_object ? "\"" : ",\"";
    node_str += node_key;
    node_str += "\":";
    node_str += ParseDomValue(hippy_value);
    first_object = false;
  }
}

void DevToolsUtil::PostDomTask(const std::weak_ptr<DomManager>& weak_dom_manager, std::function<void()> func) {
  auto dom_manager = weak_dom_manager.lock();
  if (dom_manager) {
    std::vector<std::function<void()>> ops = {func};
    dom_manager->PostTask(hippy::dom::Scene(std::move(ops)));
  }
}

/**
 * Specific methods like getLocationOnScreen should wait in the dom manager task runner. To avoid a deadlock, the
 * callback must not be posted in the same task runner.
 */
bool DevToolsUtil::ShouldAvoidPostDomManagerTask(const std::string& event_name) {
  return event_name == kGetLocationOnScreen;
}

}  // namespace hippy::devtools
