/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

#include "dom/dom_node.h"

#include <algorithm>
#include <utility>
#include "dom/diff_utils.h"
#include "dom/node_props.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/scene.h"
#include "footstone/logging.h"
#include "footstone/serializer.h"

namespace hippy {
inline namespace dom {

using Scene = hippy::dom::Scene;

constexpr char kLayoutLayoutKey[] = "layout";
constexpr char kLayoutXKey[] = "x";
constexpr char kLayoutYKey[] = "y";
constexpr char kLayoutWidthKey[] = "width";
constexpr char kLayoutHeightKey[] = "height";

constexpr char kNodePropertyId[] = "id";
constexpr char kNodePropertyPid[] = "pId";
constexpr char kNodePropertyIndex[] = "index";
constexpr char kNodePropertyTagName[] = "tagName";
constexpr char kNodePropertyViewName[] = "name";
constexpr char kNodePropertyStyle[] = "style";
constexpr char kNodePropertyExt[] = "ext";

constexpr char kNodeWillChangeKey[] = "willChange";


const std::map<int32_t, std::string> kRelativeTypeMap = {
    {-1, "kFront"},
    {0, "kDefault"},
    {1, "kBack"},
};

using HippyValueObjectType = footstone::value::HippyValue::HippyValueObjectType;

DomNode::DomNode(uint32_t id, uint32_t pid, int32_t index, std::string tag_name, std::string view_name,
                 std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<HippyValue>>> style_map,
                 std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<HippyValue>>> dom_ext_map,
                 std::weak_ptr<RootNode> weak_root_node)
    : id_(id),
      pid_(pid),
      index_(index),
      tag_name_(std::move(tag_name)),
      view_name_(std::move(view_name)),
      style_map_(std::move(style_map)),
      dom_ext_map_(std::move(dom_ext_map)),
      is_virtual_(false),
      root_node_(std::move(weak_root_node)),
      current_callback_id_(0),
      func_cb_map_(nullptr),
      event_listener_map_(nullptr) {
  layout_node_ = hippy::dom::CreateLayoutNode();
}

DomNode::DomNode(uint32_t id, uint32_t pid, std::weak_ptr<RootNode> weak_root_node)
    : DomNode(id, pid, 0, "", "", nullptr, nullptr, std::move(weak_root_node)) {}

DomNode::DomNode() : DomNode(0, 0, {}) {}

DomNode::~DomNode() = default;

int32_t DomNode::IndexOf(const std::shared_ptr<DomNode>& child) {
  for (size_t i = 0; i < children_.size(); i++) {
    if (children_[i] == child) {
      return footstone::check::checked_numeric_cast<size_t, int32_t>(i);
    }
  }
  return kInvalidIndex;
}

std::shared_ptr<DomNode> DomNode::GetChildAt(size_t index) {
  if (index >= children_.size()) {
    return nullptr;
  }
  return children_[index];
}

int32_t DomNode::AddChildByRefInfo(const std::shared_ptr<DomInfo>& dom_info) {
  std::shared_ptr<RefInfo>& ref_info = dom_info->ref_info;
  if (ref_info) {
    if (children_.size() == 0) {
       children_.push_back(dom_info->dom_node);
    } else {
      for (uint32_t i = 0; i < children_.size(); ++i) {
        auto& child = children_[i];
        if (ref_info->ref_id == child->GetId()) {
          if (ref_info->relative_to_ref == RelativeType::kFront) {
            children_.insert(
                children_.begin() + footstone::check::checked_numeric_cast<uint32_t, int32_t>(i),
                dom_info->dom_node);
          } else {
            children_.insert(
                children_.begin() + footstone::check::checked_numeric_cast<uint32_t, int32_t>(i + 1),
                dom_info->dom_node);
          }
          break;
        }
        if (i == children_.size() - 1) {
          children_.push_back(dom_info->dom_node);
          break;
        }
      }
    }
  } else {
    children_.push_back(dom_info->dom_node);
  }
  dom_info->dom_node->SetParent(shared_from_this());
  int32_t index = dom_info->dom_node->GetSelfIndex();
  // TODO(charleeshen): 支持不同的view，需要终端注册
  if (view_name_ == "Text") {
    return index;
  }
  layout_node_->InsertChild(dom_info->dom_node->GetLayoutNode(),
                            footstone::check::checked_numeric_cast<int32_t, uint32_t>(index));
  return index;
}

int32_t DomNode::GetChildIndex(uint32_t id) {
  int32_t index = -1;
  for (uint32_t i = 0; i < children_.size(); ++i) {
    auto& child = children_[i];
    if (child && child->GetId() == id) {
      index = static_cast<int32_t>(i);
      break;
    }
  }
  return index;
}

void DomNode::MarkWillChange(bool flag) {
  if (!dom_ext_map_) {
    dom_ext_map_ = std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>();
  }
  (*dom_ext_map_)[kNodeWillChangeKey] = std::make_shared<hippy::HippyValue>(flag);
}

int32_t DomNode::GetSelfIndex() {
  auto parent = parent_.lock();
  if (parent) {
    return parent->GetChildIndex(id_);
  }
  return -1;
}

int32_t DomNode::GetSelfDepth() {
  if (auto parent = parent_.lock()) {
    return 1 + parent->GetSelfDepth();
  }
  return 1;
}

std::shared_ptr<DomNode> DomNode::RemoveChildAt(int32_t index) {
  auto child = children_[footstone::check::checked_numeric_cast<int32_t, unsigned long>(index)];
  child->SetParent(nullptr);
  children_.erase(children_.begin() + index);
  layout_node_->RemoveChild(child->GetLayoutNode());
  return child;
}

std::shared_ptr<DomNode> DomNode::RemoveChildById(uint32_t id) {
  auto it = children_.begin();
  while (it != children_.end()) {
    auto child = *it;
    if (id == child->GetId()) {
      child->SetParent(nullptr);
      children_.erase(it);
      layout_node_->RemoveChild(child->GetLayoutNode());
      return child;
    }
    it++;
  }
  return nullptr;
}

void DomNode::DoLayout() {
  std::vector<std::shared_ptr<DomNode>> changed_nodes;
  DoLayout(changed_nodes);
}

void DomNode::DoLayout(std::vector<std::shared_ptr<DomNode>>& changed_nodes) {
  layout_node_->CalculateLayout(is_layout_width_nan_ ? NAN : 0, is_layout_height_nan_ ? NAN : 0);
  TransferLayoutOutputsRecursive(changed_nodes);
}

void DomNode::HandleEvent(const std::shared_ptr<DomEvent>& event) {
  auto root_node = root_node_.lock();
  if (root_node) {
    root_node->HandleEvent(std::move(event));
  }
}

std::tuple<float, float> DomNode::GetLayoutSize() {
  return std::make_tuple(layout_node_->GetWidth(), layout_node_->GetHeight());
}

void DomNode::SetLayoutSize(float width, float height) {
  is_layout_width_nan_ = std::isnan(width) ? true : false;
  is_layout_height_nan_ = std::isnan(height) ? true : false;
  
  layout_node_->SetWidth(width);
  layout_node_->SetHeight(height);
}

void DomNode::SetLayoutOrigin(float x, float y) {
  layout_node_->SetPosition(hippy::Edge::EdgeLeft, x);
  layout_node_->SetPosition(hippy::Edge::EdgeTop, y);
}

void DomNode::AddEventListener(const std::string& name, uint64_t listener_id, bool use_capture,
                               const EventCallback& cb) {
  if (!event_listener_map_) {
    event_listener_map_ = std::make_shared<
        std::unordered_map<std::string, std::array<std::vector<std::shared_ptr<DomEventListenerInfo>>, 2>>>();
  }
  auto it = event_listener_map_->find(name);
  if (it == event_listener_map_->end()) {
    (*event_listener_map_)[name] = {};
    auto root_node = root_node_.lock();
    if (root_node) {
      root_node->AddEvent(GetId(), name);
    }
  }
  if (use_capture) {
    (*event_listener_map_)[name][kCapture].push_back(std::make_shared<DomEventListenerInfo>(listener_id, cb));
  } else {
    (*event_listener_map_)[name][kBubble].push_back(std::make_shared<DomEventListenerInfo>(listener_id, cb));
  }
}

void DomNode::RemoveEventListener(const std::string& name, uint64_t listener_id) {
  if (!event_listener_map_) {
    return;
  }

  // remove dom node capture function
  auto it = event_listener_map_->find(name);
  if (it == event_listener_map_->end()) {
    return;
  }
  auto capture_listeners = it->second[kCapture];
  auto capture_it = std::find_if(capture_listeners.begin(), capture_listeners.end(),
                                 [listener_id](const std::shared_ptr<DomEventListenerInfo>& item) {
                                   if (item->id == listener_id) {
                                     return true;
                                   }
                                   return false;
                                 });
  if (capture_it != capture_listeners.end()) {
    capture_listeners.erase(capture_it);
  }

  // remove dom node bubble function
  auto bubble_listeners = it->second[kBubble];
  auto bubble_it = std::find_if(bubble_listeners.begin(), bubble_listeners.end(),
                                [listener_id](const std::shared_ptr<DomEventListenerInfo>& item) {
                                  if (item->id == listener_id) {
                                    return true;
                                  }
                                  return false;
                                });
  if (bubble_it != bubble_listeners.end()) {
    bubble_listeners.erase(bubble_it);
  }
  if (capture_listeners.empty() && bubble_listeners.empty()) {
    event_listener_map_->erase(it);
    auto root_node = root_node_.lock();
    if (root_node) {
      root_node->RemoveEvent(GetId(), name);
    }
  }
}

std::vector<std::shared_ptr<DomEventListenerInfo>> DomNode::GetEventListener(const std::string& name, bool is_capture) {
  if (!event_listener_map_) {
    return {};
  }
  auto it = event_listener_map_->find(name);
  if (it == event_listener_map_->end()) {
    return {};
  }
  if (is_capture) {
    return it->second[kCapture];
  }
  return it->second[kBubble];
}

void DomNode::ParseLayoutStyleInfo() { layout_node_->SetLayoutStyles(*style_map_, std::vector<std::string>{}); }

void DomNode::UpdateLayoutStyleInfo(
    const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
    const std::vector<std::string>& style_delete) {
  layout_node_->SetLayoutStyles(style_update, style_delete);
}
LayoutResult DomNode::GetLayoutInfoFromRoot() {
  LayoutResult result = layout_;
  auto parent = parent_.lock();
  while (parent != nullptr) {
    result.top += parent->GetLayoutResult().top;
    result.left += parent->GetLayoutResult().left;
    parent = parent->GetParent();
  }
  return result;
}

void DomNode::ResetLayoutCache() {
  layout_node_->ResetLayoutCache();
}

void DomNode::TransferLayoutOutputsRecursive(std::vector<std::shared_ptr<DomNode>>& changed_nodes) {
  auto not_equal = std::not_equal_to<>();
  bool changed =  layout_node_->IsDirty() || layout_node_->HasNewLayout();
  bool trigger_layout_event =
      not_equal(layout_.left, layout_node_->GetLeft()) || not_equal(layout_.top, layout_node_->GetTop()) ||
      not_equal(layout_.width, layout_node_->GetWidth()) || not_equal(layout_.height, layout_node_->GetHeight());

  layout_.left = std::isnan(layout_node_->GetLeft()) ? 0 : layout_node_->GetLeft();
  layout_.top = std::isnan(layout_node_->GetTop()) ? 0 : layout_node_->GetTop();
  layout_.width = std::isnan(layout_node_->GetWidth()) ? 0 : std::max<float>(layout_node_->GetWidth(), .0);
  layout_.height = std::isnan(layout_node_->GetHeight()) ? 0 : std::max<float>(layout_node_->GetHeight(), .0);
  layout_.marginLeft = layout_node_->GetMargin(Edge::EdgeLeft);
  layout_.marginTop = layout_node_->GetMargin(Edge::EdgeTop);
  layout_.marginRight = layout_node_->GetMargin(Edge::EdgeRight);
  layout_.marginBottom = layout_node_->GetMargin(Edge::EdgeBottom);
  layout_.paddingLeft = layout_node_->GetPadding(Edge::EdgeLeft);
  layout_.paddingTop = layout_node_->GetPadding(Edge::EdgeTop);
  layout_.paddingRight = layout_node_->GetPadding(Edge::EdgeRight);
  layout_.paddingBottom = layout_node_->GetPadding(Edge::EdgeBottom);

  float old_absolute_left = render_layout_.left;
  float old_absolute_top = render_layout_.top;
  render_layout_ = layout_;

  if (render_info_.pid != pid_) {
    // 调整层级优化后的最终坐标
    auto parent = GetParent();
    while (parent != nullptr && parent->GetId() != render_info_.pid) {
      render_layout_.left += parent->layout_.left;
      render_layout_.top += parent->layout_.top;
      parent = parent->GetParent();
    }
  }
  // 层级优化后的结果是否改变
  if (not_equal(render_layout_.left, old_absolute_left) || not_equal(render_layout_.top, old_absolute_top)) {
    changed = true;
  }

  layout_node_->SetHasNewLayout(false);
  if (changed) {
    changed_nodes.push_back(shared_from_this());
    HippyValueObjectType layout_param;
    layout_param[kLayoutXKey] = HippyValue(layout_.left);
    layout_param[kLayoutYKey] = HippyValue(layout_.top);
    layout_param[kLayoutWidthKey] = HippyValue(layout_.width);
    layout_param[kLayoutHeightKey] = HippyValue(layout_.height);
    HippyValueObjectType layout_obj;
    layout_obj[kLayoutLayoutKey] = layout_param;
    if (trigger_layout_event) {
      auto event = std::make_shared<DomEvent>(kLayoutEvent, weak_from_this(),
                                              std::make_shared<HippyValue>(std::move(layout_obj)));
      auto root = root_node_.lock();
      if (root != nullptr) {
        auto manager = root->GetDomManager().lock();
        if (manager != nullptr) {
          std::vector<std::function<void()>> ops = {[WEAK_THIS, event] {
            DEFINE_AND_CHECK_SELF(DomNode)
            self->HandleEvent(event);
          }};
          manager->PostTask(Scene(std::move(ops)));
        }
      }
    }
  }
  for (auto& it : children_) {
    it->TransferLayoutOutputsRecursive(changed_nodes);
  }
}

void DomNode::CallFunction(const std::string& name, const DomArgument& param, const CallFunctionCallback& cb) {
  if (!func_cb_map_) {
    func_cb_map_ =
        std::make_shared<std::unordered_map<std::string, std::unordered_map<uint32_t, CallFunctionCallback>>>();
  }
  auto cb_id = kInvalidId;
  if (cb) {
    // taskRunner内置执行确保current_callback_id_无多线程问题
    current_callback_id_ += 1;
    cb_id = current_callback_id_;
    (*func_cb_map_)[name][current_callback_id_] = cb;
  }
  auto root_node = root_node_.lock();
  if (!root_node) {
    return;
  }
  auto dom_manager = root_node->GetDomManager().lock();
  if (!dom_manager) {
    return;
  }
  auto render_manager = dom_manager->GetRenderManager().lock();
  if (!render_manager) {
    return;
  }
  render_manager->CallFunction(root_node_, weak_from_this(), name, param, cb_id);
}

CallFunctionCallback DomNode::GetCallback(const std::string& name, uint32_t id) {
  if (!func_cb_map_) {
    return nullptr;
  }
  auto it = func_cb_map_->find(name);
  if (it != func_cb_map_->end()) {
    auto cb_map = it->second;
    auto cb_it = cb_map.find(id);
    if (cb_it != cb_map.end()) {
      auto ret = std::move(cb_it->second);
      cb_map.erase(cb_it);
      return ret;
    }
  }
  return nullptr;
}

bool DomNode::HasEventListeners() { return event_listener_map_ != nullptr && !event_listener_map_->empty(); }

void DomNode::EmplaceStyleMap(const std::string& key, const HippyValue& value) {
  auto iter = style_map_->find(key);
  if (iter != style_map_->end()) {
    iter->second = std::make_shared<HippyValue>(value);
  } else {
    for (auto& style: *style_map_) {
      auto replaced = ReplaceStyle(*style.second, key, value);
      if (replaced) {
        return;
      }
    }
    style_map_->insert({key, std::make_shared<HippyValue>(value)});
  }
}

void DomNode::EmplaceStyleMapAndGetDiff(const std::string& key, const HippyValue& value,
                                        std::unordered_map<std::string, std::shared_ptr<HippyValue>>& diff) {
  auto it = style_map_->find(key);
  if (it != style_map_->end()) {
    it->second = std::make_shared<HippyValue>(value);
    diff[key] = it->second;
  } else {
    for (auto& style: *style_map_) {
      auto replaced = ReplaceStyle(*style.second, key, value);
      if (replaced) {
        diff[style.first] = style.second;
        return;
      }
    }
    diff[key] = std::make_shared<HippyValue>(value);
    style_map_->insert({key, diff[key]});
  }
}

void DomNode::UpdateProperties(const std::unordered_map<std::string, std::shared_ptr<HippyValue>>& update_style,
                               const std::unordered_map<std::string, std::shared_ptr<HippyValue>>& update_dom_ext) {
  auto root_node = root_node_.lock();
  FOOTSTONE_DCHECK(root_node);
  if (root_node) {
    this->UpdateDiff(update_style, update_dom_ext);
    this->UpdateStyle(update_style);
    this->UpdateDomExt(update_dom_ext);
    root_node->UpdateRenderNode(shared_from_this());
  }
}

void DomNode::UpdateDomNodeStyleAndParseLayoutInfo(
    const std::unordered_map<std::string, std::shared_ptr<HippyValue>>& update_style) {
  UpdateStyle(update_style);
  ParseLayoutStyleInfo();
}

void DomNode::UpdateDiff(const std::unordered_map<std::string,
                                                  std::shared_ptr<HippyValue>>& update_style,
                         const std::unordered_map<std::string,
                                                  std::shared_ptr<HippyValue>>& update_dom_ext) {
  auto style_diff_value = DiffUtils::DiffProps(*this->GetStyleMap(), update_style, false);
  auto ext_diff_value = DiffUtils::DiffProps(*this->GetExtStyle(), update_dom_ext, false);
  auto style_update = std::get<0>(style_diff_value);
  auto ext_update = std::get<0>(ext_diff_value);
  std::shared_ptr<DomValueMap> diff_value = std::make_shared<DomValueMap>();
  if (style_update) {
    diff_value->insert(style_update->begin(), style_update->end());
  }
  if (ext_update) {
    diff_value->insert(ext_update->begin(), ext_update->end());
  }
  SetDiffStyle(diff_value);
}

void DomNode::UpdateDomExt(const std::unordered_map<std::string, std::shared_ptr<HippyValue>>& update_dom_ext) {
  if (update_dom_ext.empty()) return;

  for (const auto& v : update_dom_ext) {
    if (this->dom_ext_map_ == nullptr) {
      this->dom_ext_map_ = std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>();
    }

    auto iter = this->dom_ext_map_->find(v.first);
    if (iter == this->dom_ext_map_->end()) {
      std::pair<std::string, std::shared_ptr<HippyValue>> pair = {v.first, std::make_shared<HippyValue>(*v.second)};
      this->dom_ext_map_->insert(pair);
      continue;
    }

    if (v.second->IsObject() && iter->second->IsObject()) {
      this->UpdateObjectStyle(*iter->second, *v.second);
    } else {
      iter->second = std::make_shared<HippyValue>(*v.second);
    }
  }
}

void DomNode::UpdateStyle(const std::unordered_map<std::string, std::shared_ptr<HippyValue>>& update_style) {
  if (update_style.empty()) return;

  for (const auto& v : update_style) {
    if (this->style_map_ == nullptr) {
      this->style_map_ = std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>();
    }

    auto iter = this->style_map_->find(v.first);
    if (iter == this->style_map_->end()) {
      std::pair<std::string, std::shared_ptr<HippyValue>> pair = {v.first, std::make_shared<HippyValue>(*v.second)};
      this->style_map_->insert(pair);
      continue;
    }

    if (v.second->IsObject() && iter->second->IsObject()) {
      this->UpdateObjectStyle(*iter->second, *v.second);
    } else {
      iter->second = std::make_shared<HippyValue>(*v.second);
    }
  }
}

void DomNode::UpdateObjectStyle(HippyValue& style_map, const HippyValue& update_style) {
  FOOTSTONE_DCHECK(style_map.IsObject());
  FOOTSTONE_DCHECK(update_style.IsObject());

  auto style_object = style_map.ToObjectChecked();
  for (auto& v : update_style.ToObjectChecked()) {
    auto iter = style_object.find(v.first);
    if (iter == style_object.end()) {
      style_object[v.first] = v.second;
    }

    if (v.second.IsObject() && iter->second.IsObject()) {
      UpdateObjectStyle(iter->second, v.second);
    } else {
      iter->second = v.second;
    }
  }
}

bool DomNode::ReplaceStyle(HippyValue& style, const std::string& key, const HippyValue& value) {
  if (style.IsObject()) {
    auto& object = style.ToObjectChecked();
    if (object.find(key) != object.end()) {
      object.at(key) = value;
      return true;
    }

    bool replaced = false;
    for (auto& o : object) {
      replaced = ReplaceStyle(o.second, key, value);
      if (replaced) break;
    }
    return replaced;
  }

  if (style.IsArray()) {
    auto& array = style.ToArrayChecked();
    bool replaced = false;
    for (auto& a : array) {
      replaced = ReplaceStyle(a, key, value);
      if (replaced) break;
    }
    return replaced;
  }

  return false;
}


std::ostream& operator<<(std::ostream& os, const RefInfo& ref_info) {
  os << "{";
  os << "\"ref_id\": " << ref_info.ref_id << ", ";
  os << "\"relative_to_ref\": \"" << kRelativeTypeMap.find(ref_info.relative_to_ref)->second << "\"";
  os << "}";
  return os;
}

std::ostream& operator<<(std::ostream& os, const DiffInfo& diff_info) {
  os << "{";
  os << "\"skip_style_diff\": " << diff_info.skip_style_diff << ", ";
  os << "}";
  return os;
}

std::ostream& operator<<(std::ostream& os, const DomNode& dom_node) {
  os << "{";
  os << "\"id\": " << dom_node.id_ << ", ";
  os << "\"pid\": " << dom_node.pid_ << ", ";
  os << "\"view name\": \"" << dom_node.view_name_ << "\", ";
  if (dom_node.style_map_ != nullptr) {
    os << "\"style\": {";
    for (const auto& s : *dom_node.style_map_) {
      os << "\"" << s.first << "\": " << *s.second << ", ";
    }
    os << "}, ";
  }
  if (dom_node.dom_ext_map_ != nullptr) {
    os << "\"ext style\": {";
    for (const auto& e : *dom_node.dom_ext_map_) {
      os << "\"" << e.first << "\": " << *e.second << ", ";
    }
    os << "}, ";
  }
  os << "}";
  return os;
}

std::ostream& operator<<(std::ostream& os, const DomInfo& dom_info) {
  auto dom_node = dom_info.dom_node;
  auto ref_info = dom_info.ref_info;
  auto diff_info = dom_info.diff_info;
  os << "{";
  if (ref_info != nullptr) {
    os << "\"ref info\": " << *ref_info << ", ";
  }
  if (diff_info != nullptr) {
    os << "\"diff info\": " << *diff_info << ", ";
  }
  if (dom_node != nullptr) {
    os << "\"dom node\": " << *dom_node << ", ";
  }
  os << "}";
  return os;
}

HippyValue DomNode::Serialize() const {
  HippyValueObjectType result;

  auto id = HippyValue(id_);
  result[kNodePropertyId] = id;

  auto pid = HippyValue(pid_);
  result[kNodePropertyPid] = pid;

  auto index = HippyValue(index_);
  result[kNodePropertyIndex] = index;

  auto tag_name = HippyValue(tag_name_);
  result[kNodePropertyTagName] = tag_name;

  auto view_name = HippyValue(view_name_);
  result[kNodePropertyViewName] = view_name;

  HippyValueObjectType style_map_value;
  if (style_map_) {
    for (const auto& value: *style_map_) {
      style_map_value[value.first] = *value.second;
    }
    auto style_map = HippyValue(std::move(style_map_value));
    result[kNodePropertyStyle] = style_map;
  }

  if (dom_ext_map_) {
    HippyValueObjectType dom_ext_map_value;
    for (const auto& value: *dom_ext_map_) {
      dom_ext_map_value[value.first] = *value.second;
    }
    auto dom_ext_map = HippyValue(std::move(dom_ext_map_value));
    result[kNodePropertyExt] = dom_ext_map;
  }

  return HippyValue(std::move(result));
}

bool DomNode::Deserialize(HippyValue value) {
  FOOTSTONE_DCHECK(value.IsObject());
  if (!value.IsObject()) {
    FOOTSTONE_LOG(ERROR) << "Deserialize value is not object";
    return false;
  }
  HippyValueObjectType dom_node_obj = value.ToObjectChecked();

  uint32_t id;
  auto flag = dom_node_obj[kNodePropertyId].ToUint32(id);
  if (flag) {
    SetId(static_cast<uint32_t>(id));
  } else {
    FOOTSTONE_LOG(ERROR) << "Deserialize id error";
    return false;
  }

  uint32_t pid;
  flag = dom_node_obj[kNodePropertyPid].ToUint32(pid);
  if (flag) {
    SetPid(static_cast<uint32_t>(pid));
  } else {
    FOOTSTONE_LOG(ERROR) << "Deserialize pid error";
    return false;
  }

  int32_t index;
  flag = dom_node_obj[kNodePropertyIndex].ToInt32(index);
  if (flag) {
    SetIndex(index);
  } else {
    FOOTSTONE_LOG(ERROR) << "Deserialize index error";
    return false;
  }

  std::string tag_name;
  flag = dom_node_obj[kNodePropertyTagName].ToString(tag_name);
  if (flag) {
    SetTagName(tag_name);
  }

  std::string view_name;
  flag = dom_node_obj[kNodePropertyViewName].ToString(view_name);
  if (flag) {
    SetViewName(view_name);
  } else {
    FOOTSTONE_LOG(ERROR) << "Deserialize view_name error";
    return false;
  }

  auto style_obj = dom_node_obj[kNodePropertyStyle];
  if (style_obj.IsObject()) {
    auto style = style_obj.ToObjectChecked();
    std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<HippyValue>>> style_map =
        std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>();
    for (const auto& p: style) {
      (*style_map)[p.first] = std::make_shared<HippyValue>(p.second);
    }
    SetStyleMap(std::move(style_map));
  }

  auto ext_obj = dom_node_obj[kNodePropertyExt];
  if (ext_obj.IsObject()) {
    auto ext = ext_obj.ToObjectChecked();
    std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<HippyValue>>> ext_map =
        std::make_shared<std::unordered_map<std::string, std::shared_ptr<HippyValue>>>();
    for (const auto& p: ext) {
      (*ext_map)[p.first] = std::make_shared<HippyValue>(p.second);
    }
    SetExtStyleMap(std::move(ext_map));
  }

  return true;
}

}  // namespace dom
}  // namespace hippy
