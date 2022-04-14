//
// Created by thomasyqguo on 2022/3/4.
//

#include "devtools/devtool_utils.h"

namespace hippy {
namespace devtools {
constexpr const char* kDefaultNodeName = "DefaultNode";

tdf::devtools::DomNodeMetas DevToolUtils::ToDomNodeMetas(const std::shared_ptr<DomNode>& dom_node) {
  tdf::devtools::DomNodeMetas metas(dom_node->GetId());
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
  metas.SetBounds(tdf::devtools::BoundRect{layout_result.left, layout_result.top,
                                           layout_result.left + layout_result.width,
                                           layout_result.top + layout_result.height});
  metas.SetStyleProps(ParseNodeProps(dom_node->GetStyleMap()));
  metas.SetTotalProps(ParseNodeProps(dom_node->GetExtStyle()));
  auto children = dom_node->GetChildren();
  if (!children.empty()) {
    for (const auto& node : children) {
      metas.AddChild(ToDomNodeMetas(node));
    }
  }
  return metas;
}

tdf::devtools::DomainMetas DevToolUtils::GetDomDomainData(const std::shared_ptr<DomNode>& dom_node,
                                                          uint32_t depth,
                                                          const std::shared_ptr<DomManager>& dom_manager) {
  tdf::devtools::DomainMetas metas(dom_node->GetId());
  metas.SetParentId(dom_node->GetPid());
  metas.SetRootId(dom_manager->GetRootId());
  if (dom_node->GetId() == dom_manager->GetRootId()) {
    metas.SetClassName("rootView");
    metas.SetNodeName("rootView");
    metas.SetLocalName("rootView");
    metas.SetNodeValue("rootView");
  } else {
    metas.SetClassName(dom_node->GetViewName());
    metas.SetNodeName(dom_node->GetTagName());
    metas.SetLocalName(dom_node->GetTagName());
    metas.SetNodeValue("");
  }
  metas.SetStyleProps(ParseNodeProps(dom_node->GetStyleMap()));
  metas.SetTotalProps(ParseNodeProps(dom_node->GetExtStyle()));
  auto children = dom_node->GetChildren();
  metas.SetChildrenCount(children.size());
  // 每获取一层数据 深度减一
  depth--;
  if (depth <= 0) {
    // 不需要孩子节点数据 则直接返回
    return metas;
  }
  for (auto& child : children) {
    metas.AddChild(GetDomDomainData(child, depth, dom_manager));
  }
  auto layout_result = dom_node->GetLayoutInfoFromRoot();
  metas.SetLayoutX(layout_result.left);
  metas.SetLayoutY(layout_result.top);
  metas.SetWidth(layout_result.width);
  metas.SetHeight(layout_result.height);
  return metas;
}

tdf::devtools::DomNodeLocation DevToolUtils::GetNodeIdByDomLocation(const std::shared_ptr<DomNode>& dom_node,
                                                                    double x,
                                                                    double y) {
  auto hit_node = GetMaxDepthAndMinAreaHitNode(dom_node, x, y);
  if (hit_node == nullptr) {
    hit_node = dom_node;
  }
  uint32_t node_id = hit_node->GetId();
  tdf::devtools::DomNodeLocation node_location(node_id);
  node_location.AddRelationId(node_id);
  auto temp_hit_node = hit_node->GetParent();
  while (temp_hit_node != nullptr && temp_hit_node != dom_node) {
    node_location.AddRelationId(temp_hit_node->GetId());
    temp_hit_node = temp_hit_node->GetParent();
  }
  return node_location;
}

std::shared_ptr<DomNode> DevToolUtils::GetMaxDepthAndMinAreaHitNode(const std::shared_ptr<DomNode>& node,
                                                                    double x,
                                                                    double y) {
  if (node == nullptr || !IsLocationHitNode(node, x, y)) {
    return nullptr;
  }
  std::shared_ptr<DomNode> hit_node = node;
  for (auto& child : node->GetChildren()) {
    if (!IsLocationHitNode(child, x, y)) {
      continue;
    }
    auto new_node = GetMaxDepthAndMinAreaHitNode(child, x, y);
    hit_node = GetSmallerAreaNode(hit_node, new_node);
  }
  return hit_node;
}

bool DevToolUtils::IsLocationHitNode(const std::shared_ptr<DomNode>& dom_node, double x, double y) {
  LayoutResult layout_result = dom_node->GetLayoutInfoFromRoot();
  double self_x = static_cast<uint32_t>(layout_result.left);
  double self_y = static_cast<uint32_t>(layout_result.top);
  bool in_top_offset = (x >= self_x) && (y >= self_y);
  bool in_bottom_offset = (x <= self_x + layout_result.width) && (y <= self_y + layout_result.height);
  return in_top_offset && in_bottom_offset;
}

std::shared_ptr<DomNode> DevToolUtils::GetSmallerAreaNode(const std::shared_ptr<DomNode>& old_node,
                                                          const std::shared_ptr<DomNode>& new_node) {
  if (old_node == nullptr) {
    return new_node;
  }
  if (new_node == nullptr) {
    return old_node;
  }
  auto old_node_area = old_node->GetLayoutNode()->GetWidth() * old_node->GetLayoutNode()->GetHeight();
  auto new_node_area = new_node->GetLayoutNode()->GetWidth() * new_node->GetLayoutNode()->GetHeight();
  return old_node_area > new_node_area ? new_node : old_node;
}

std::string DevToolUtils::ParseDomValue(const tdf::base::DomValue& dom_value) {
  if (!dom_value.IsObject()) {
    TDF_BASE_DLOG(INFO) << "ParseTotalProps, node props is not object";
    return "{}";
  }
  std::string node_str = "{";
  bool first_object = true;
  for (auto iterator : dom_value.ToObjectChecked()) {
    if (iterator.first == "uri" || iterator.first == "src") {
      // 这个value是个base64，数据量太大，改成空字符串
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

std::string DevToolUtils::ParseNodeProps(
    const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>>& node_props) {
  if (!node_props || node_props->empty()) {
    TDF_BASE_DLOG(INFO) << "ParseTotalProps, node props is not object";
    return "{}";
  }
  std::string node_str = "{";
  bool first_object = true;
  for (auto iterator = node_props->begin(); iterator != node_props->end(); iterator++) {
    if (iterator->first == "uri" || iterator->first == "src") {
      // 这个value是个base64，数据量太大，改成空字符串
      //            iterator.second = "";
    }
    std::string key = iterator->first;
    if (iterator->second->IsBoolean()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += iterator->second->ToBooleanChecked() ? "true" : "false";
      first_object = false;
    } else if (iterator->second->IsInt32()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator->second->ToInt32Checked());
      first_object = false;
    } else if (iterator->second->IsUInt32()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator->second->IsUInt32());
      first_object = false;
    } else if (iterator->second->IsDouble()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator->second->ToDoubleChecked());
      first_object = false;
    } else if (iterator->second->IsString()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":\"";
      node_str += iterator->second->ToStringChecked();
      node_str += "\"";
      first_object = false;
    } else if (iterator->second->IsArray()) {
      auto props_array = iterator->second->ToArrayChecked();
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
    } else if (iterator->second->IsObject()) {
      tdf::base::DomValue dom_value = *(iterator->second);
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += ParseDomValue(dom_value);
      first_object = false;
    }
  }
  node_str += "}";
  return node_str;
}

void DevToolUtils::PostDomTask(int32_t dom_id, std::function<void()> func) {
  std::shared_ptr<DomManager> dom_manager = DomManager::Find(static_cast<int32_t>(dom_id));
  if (dom_manager) {
    dom_manager->PostTask(func);
  }
}
}  // namespace devtools
}  // namespace hippy
