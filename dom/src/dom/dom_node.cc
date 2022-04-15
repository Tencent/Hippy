#include "dom/dom_node.h"

#include <algorithm>
#include <utility>
#include "base/logging.h"
#include "dom/diff_utils.h"
#include "dom/macro.h"
#include "dom/node_props.h"
#include "dom/render_manager.h"

namespace hippy {
inline namespace dom {

constexpr char kLayoutLayoutKey[] = "layout";
constexpr char kLayoutXKey[] = "x";
constexpr char kLayoutYKey[] = "y";
constexpr char kLayoutWidthKey[] = "width";
constexpr char kLayoutHeightKey[] = "height";

using DomValueObjectType = tdf::base::DomValue::DomValueObjectType;

DomNode::DomNode(uint32_t id, uint32_t pid, int32_t index, std::string tag_name, std::string view_name,
                 std::unordered_map<std::string, std::shared_ptr<DomValue>>&& style_map,
                 std::unordered_map<std::string, std::shared_ptr<DomValue>>&& dom_ext_map,
                 const std::shared_ptr<DomManager>& dom_manager)
    : id_(id),
      pid_(pid),
      index_(index),
      tag_name_(std::move(tag_name)),
      view_name_(std::move(view_name)),
      style_map_(std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>(std::move(style_map))),
      dom_ext_map_(std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>(std::move(dom_ext_map))),
      is_virtual_(false),
      dom_manager_(dom_manager),
      current_callback_id_(0),
      func_cb_map_(nullptr),
      event_listener_map_(nullptr) {
  layout_node_ = hippy::dom::CreateLayoutNode();
}

DomNode::DomNode(uint32_t id, uint32_t pid, int32_t index)
    : id_(id),
      pid_(pid),
      index_(index),
      is_virtual_(false),
      current_callback_id_(0),
      func_cb_map_(nullptr),
      event_listener_map_(nullptr) {
  layout_node_ = hippy::dom::CreateLayoutNode();
}

DomNode::~DomNode() = default;

int32_t DomNode::IndexOf(const std::shared_ptr<DomNode>& child) {
  for (size_t i = 0; i < children_.size(); i++) {
    if (children_[i] == child) {
      return hippy::base::checked_numeric_cast<size_t, int32_t>(i);
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

void DomNode::AddChildAt(const std::shared_ptr<DomNode>& dom_node, int32_t index) {
  auto it = children_.begin();
  auto insert_index = 0;
  while (it != children_.end()) {
    if (index < it->get()->GetIndex()) {
      break;
    }
    it++;
    insert_index++;
  }
  if (it == children_.end()) {
    children_.push_back(dom_node);
  } else {
    children_.insert(it, dom_node);
  }
  dom_node->SetParent(shared_from_this());

  layout_node_->InsertChild(dom_node->GetLayoutNode(), (uint32_t)(index));
}

std::shared_ptr<DomNode> DomNode::RemoveChildAt(int32_t index) {
  auto child = children_[hippy::base::checked_numeric_cast<int32_t, unsigned long>(index)];
  child->SetParent(nullptr);
  children_.erase(children_.begin() + index);
  layout_node_->RemoveChild(child->GetLayoutNode());
  return child;
}

void DomNode::DoLayout() {
  std::vector<std::shared_ptr<DomNode>> changed_nodes;
  DoLayout(changed_nodes);
}

void DomNode::DoLayout(std::vector<std::shared_ptr<DomNode>>& changed_nodes) {
  layout_node_->CalculateLayout(0, 0);
  TransferLayoutOutputsRecursive(changed_nodes);
}

void DomNode::HandleEvent(const std::shared_ptr<DomEvent>& event) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->HandleEvent(event);
  }
}

std::tuple<float, float> DomNode::GetLayoutSize() {
  return std::make_tuple(layout_node_->GetWidth(), layout_node_->GetHeight());
}

void DomNode::SetLayoutSize(float width, float height) {
  layout_node_->SetWidth(width);
  layout_node_->SetHeight(height);
}

void DomNode::AddEventListener(const std::string& name, bool use_capture, const EventCallback& cb,
                               const CallFunctionCallback& callback) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, name, use_capture, cb, callback]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      // taskRunner内置执行确保current_callback_id_无多线程问题
      self->current_callback_id_ += 1;
      TDF_BASE_DCHECK(self->current_callback_id_ <= std::numeric_limits<uint32_t>::max());
      if (!self->event_listener_map_) {
        self->event_listener_map_ = std::make_shared<
            std::unordered_map<std::string, std::array<std::vector<std::shared_ptr<EventListenerInfo>>, 2>>>();
      }
      auto it = self->event_listener_map_->find(name);
      if (it == self->event_listener_map_->end()) {
        (*self->event_listener_map_)[name] = {};
        auto dom_manager = self->dom_manager_.lock();
        TDF_BASE_DCHECK(dom_manager);
        if (dom_manager) {
          dom_manager->AddEventListenerOperation(self, name);
        }
      }
      if (use_capture) {
        (*self->event_listener_map_)[name][kCapture].push_back(
            std::make_shared<EventListenerInfo>(self->current_callback_id_, cb));
      } else {
        (*self->event_listener_map_)[name][kBubble].push_back(
            std::make_shared<EventListenerInfo>(self->current_callback_id_, cb));
      }
      if (callback) {
        auto arg = std::make_shared<DomArgument>(DomValue(self->current_callback_id_));
        callback(arg);
      }
    });
  }
}

void DomNode::RemoveEventListener(const std::string& name, uint32_t id) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, name, id]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      if (!self->event_listener_map_) {
        return;
      }
      auto it = self->event_listener_map_->find(name);
      if (it == self->event_listener_map_->end()) {
        return;
      }
      auto capture_listeners = it->second[kCapture];
      auto capture_it = std::find_if(capture_listeners.begin(), capture_listeners.end(),
                                     [id](const std::shared_ptr<EventListenerInfo>& item) {
                                       if (item->id == id) {
                                         return true;
                                       }
                                       return false;
                                     });
      if (capture_it != capture_listeners.end()) {
        capture_listeners.erase(capture_it);
      }
      auto bubble_listeners = it->second[kBubble];
      auto bubble_it = std::find_if(bubble_listeners.begin(), bubble_listeners.end(),
                                    [id](const std::shared_ptr<EventListenerInfo>& item) {
                                      if (item->id == id) {
                                        return true;
                                      }
                                      return false;
                                    });
      if (bubble_it != bubble_listeners.end()) {
        bubble_listeners.erase(bubble_it);
      }
      if (capture_listeners.empty() && bubble_listeners.empty()) {
        auto dom_manager = self->dom_manager_.lock();
        TDF_BASE_DCHECK(dom_manager);
        if (dom_manager) {
          dom_manager->RemoveEventListenerOperation(self, name);
        }
      }
    });
  }
}

std::vector<std::shared_ptr<DomNode::EventListenerInfo>> DomNode::GetEventListener(const std::string& name,
                                                                                   bool is_capture) {
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

void DomNode::ParseLayoutStyleInfo() { layout_node_->SetLayoutStyles(*style_map_); }

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

void DomNode::TransferLayoutOutputsRecursive(std::vector<std::shared_ptr<DomNode>>& changed_nodes) {
  bool changed = layout_.left != layout_node_->GetLeft() || layout_.top != layout_node_->GetTop() ||
                 layout_.width != layout_node_->GetWidth() || layout_.height != layout_node_->GetHeight();
  layout_.left = layout_node_->GetLeft();
  layout_.top = layout_node_->GetTop();
  layout_.width = layout_node_->GetWidth();
  layout_.height = layout_node_->GetHeight();
  layout_.marginLeft = layout_node_->GetMargin(Edge::EdgeLeft);
  layout_.marginTop = layout_node_->GetMargin(Edge::EdgeTop);
  layout_.marginRight = layout_node_->GetMargin(Edge::EdgeRight);
  layout_.marginBottom = layout_node_->GetMargin(Edge::EdgeBottom);
  layout_.paddingLeft = layout_node_->GetPadding(Edge::EdgeLeft);
  layout_.paddingTop = layout_node_->GetPadding(Edge::EdgeTop);
  layout_.paddingRight = layout_node_->GetPadding(Edge::EdgeRight);
  layout_.paddingBottom = layout_node_->GetPadding(Edge::EdgeBottom);

  render_layout_ = layout_;

  if (render_info_.pid != pid_) {
    // 调整层级优化后的最终坐标
    auto parent = GetParent();
    while (parent != nullptr && parent->GetId() != render_info_.pid) {
      render_layout_.left += parent->layout_.left;
      render_layout_.top += parent->layout_.top;
      parent = parent->GetParent();
    }
    changed |= true;
  }

  layout_node_->SetHasNewLayout(false);
  if (changed) {
    changed_nodes.push_back(shared_from_this());
    DomValueObjectType layout_param;
    layout_param[kLayoutXKey] = DomValue(layout_.left);
    layout_param[kLayoutYKey] = DomValue(layout_.top);
    layout_param[kLayoutWidthKey] = DomValue(layout_.width);
    layout_param[kLayoutHeightKey] = DomValue(layout_.height);
    DomValueObjectType layout_obj;
    layout_obj[kLayoutLayoutKey] = std::move(layout_param);
    HandleEvent(std::make_shared<DomEvent>(kLayoutEvent, weak_from_this(),
                                           std::make_shared<DomValue>(std::move(layout_obj))));
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
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->CallFunction(shared_from_this(), name, param, cb_id);
  }
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

bool DomNode::HasEventListeners() {
  return event_listener_map_ != nullptr && !event_listener_map_->empty();
}

void DomNode::EmplaceStyleMap(const std::string key, const DomValue& value) {
  auto iter = style_map_->find(key);
  if (iter != style_map_->end()) {
    iter->second = std::make_shared<DomValue>(value);
  } else {
    bool replaced = false;
    for (auto& style : *style_map_) {
      replaced = ReplaceStyle(*style.second, key, value);
      if (replaced) return;
    }
    style_map_->insert({key, std::make_shared<DomValue>(value)});
  }
}

void DomNode::UpdateProperties(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style,
                               const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_dom_ext) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, update_style, update_dom_ext]() {
      DEFINE_AND_CHECK_SELF(DomNode)

      self->UpdateDiff(update_style, update_dom_ext);
      self->UpdateStyle(update_style);
      self->UpdateDomExt(update_dom_ext);

      // update Render Node
      auto dom_manager = self->dom_manager_.lock();
      TDF_BASE_DCHECK(dom_manager);
      if (dom_manager) {
        dom_manager->UpdateRenderNode(self->shared_from_this());
      }
    });
  }
}

void DomNode::UpdateDomNodeStyleAndParseLayoutInfo(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, update_style]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      self->UpdateStyle(update_style);
      self->ParseLayoutStyleInfo();
    });
  }
}

void DomNode::UpdateDiff(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style,
                         const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_dom_ext) {
  auto style_diff_value = DiffUtils::DiffProps(*this->GetStyleMap(), update_style);
  auto ext_diff_value = DiffUtils::DiffProps(*this->GetStyleMap(), update_dom_ext);
  auto style_update = std::get<0>(style_diff_value);
  auto ext_update = std::get<0>(ext_diff_value);
  std::shared_ptr<DomValueMap> diff_value = std::make_shared<DomValueMap>();
  if (style_update) {
    diff_value->insert(style_update->begin(), style_update->end());
  }
  if (ext_update) {
    diff_value->insert(ext_update->begin(), ext_update->end());
  }
  this->SetDiffStyle(diff_value);
}

void DomNode::UpdateDomExt(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_dom_ext) {
  if (update_dom_ext.size() == 0) return;

  for (const auto& v : update_dom_ext) {
    if (this->dom_ext_map_ == nullptr) {
      this->dom_ext_map_ = std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
    }

    auto iter = this->dom_ext_map_->find(v.first);
    if (iter == this->dom_ext_map_->end()) {
      std::pair<std::string, std::shared_ptr<DomValue>> pair = {v.first, std::make_shared<DomValue>(*v.second)};
      this->dom_ext_map_->insert(pair);
      continue;
    }

    if (v.second->IsObject() && iter->second->IsObject()) {
      this->UpdateObjectStyle(*iter->second, *v.second);
    } else {
      iter->second = std::make_shared<DomValue>(*v.second);
    }
  }
}

void DomNode::UpdateStyle(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style) {
  if (update_style.size() == 0) return;

  for (const auto& v : update_style) {
    if (this->style_map_ == nullptr) {
      this->style_map_ = std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
    }

    auto iter = this->style_map_->find(v.first);
    if (iter == this->style_map_->end()) {
      std::pair<std::string, std::shared_ptr<DomValue>> pair = {v.first, std::make_shared<DomValue>(*v.second)};
      this->style_map_->insert(pair);
      continue;
    }

    if (v.second->IsObject() && iter->second->IsObject()) {
      this->UpdateObjectStyle(*iter->second, *v.second);
    } else {
      iter->second = std::make_shared<DomValue>(*v.second);
    }
  }
}

void DomNode::UpdateObjectStyle(DomValue& style_map, const DomValue& update_style) {
  TDF_BASE_DCHECK(style_map.IsObject());
  TDF_BASE_DCHECK(update_style.IsObject());

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

bool DomNode::ReplaceStyle(DomValue& style, const std::string& key, const DomValue& value) {
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
}  // namespace dom
}  // namespace hippy
