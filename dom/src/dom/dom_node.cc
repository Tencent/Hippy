#include "dom/dom_node.h"

#include <algorithm>
#include <utility>
#include "base/logging.h"
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
      is_just_layout_(false),
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
      is_just_layout_(false),
      is_virtual_(false),
      current_callback_id_(0),
      func_cb_map_(nullptr),
      event_listener_map_(nullptr) {
  layout_node_ = hippy::dom::CreateLayoutNode();
}

DomNode::~DomNode() = default;

int32_t DomNode::IndexOf(const std::shared_ptr<DomNode>& child) {
  for (int i = 0; i < children_.size(); i++) {
    if (children_[i] == child) {
      return i;
    }
  }
  return kInvalidIndex;
}

std::shared_ptr<DomNode> DomNode::GetChildAt(int32_t index) {
  for (auto& i : children_) {
    if (i->index_ == index) {
      return i;
    }
  }
  return nullptr;
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
}

std::shared_ptr<DomNode> DomNode::RemoveChildAt(int32_t index) {
  auto child = children_[index];
  child->SetParent(nullptr);
  children_.erase(children_.begin() + index);
  return child;
}

void DomNode::DoLayout() {
  layout_node_->CalculateLayout(0, 0);
  TransferLayoutOutputsRecursive();
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

void DomNode::TransferLayoutOutputsRecursive() {
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

  layout_node_->SetHasNewLayout(false);
  if (changed) {
    auto dom_manager = dom_manager_.lock();
    if (dom_manager) {
      dom_manager->AddLayoutChangedNode(shared_from_this());
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
  }
  for (auto& it : children_) {
    it->TransferLayoutOutputsRecursive();
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

bool DomNode::HasTouchEventListeners() {
  if (!event_listener_map_) {
    return false;
  }
  if (event_listener_map_->find(kTouchStartEvent) != event_listener_map_->end() ||
      event_listener_map_->find(kTouchMoveEvent) != event_listener_map_->end() ||
      event_listener_map_->find(kTouchEndEvent) != event_listener_map_->end() ||
      event_listener_map_->find(kTouchCancelEvent) != event_listener_map_->end()) {
    return true;
  }
  return false;
}

#if TDF_SERVICE_ENABLED
tdf::devtools::DomNodeMetas DomNode::ToDomNodeMetas() {
  TDF_BASE_DLOG(INFO) << "node_json1";
  tdf::devtools::DomNodeMetas metas(id_);
  if (!tag_name_.empty()) {
    metas.SetNodeType(tag_name_);
  } else if (!view_name_.empty()) {
    metas.SetNodeType(view_name_);
  } else {
    metas.SetNodeType("rootNode");
  }
  if (layout_node_) {
    metas.SetWidth(static_cast<uint32_t>(layout_node_->GetWidth()));
    metas.SetHeight(static_cast<uint32_t>(layout_node_->GetHeight()));
    auto layout_result = GetLayoutInfoFromRoot();
    metas.SetBounds(tdf::devtools::BoundRect{layout_result.left, layout_result.top,
                                             layout_result.left + layout_result.width,
                                             layout_result.top + layout_result.height});
  }
  metas.SetStyleProps(ParseNodeProps(style_map_));
  metas.SetTotalProps(ParseNodeProps(dom_ext_map_));
  if (!children_.empty()) {
    for (int i = 0; i < children_.size(); i++) {
      metas.AddChild(children_[i]->ToDomNodeMetas());
    }
  }
  return metas;
}

tdf::devtools::DomainMetas DomNode::GetDomDomainData(uint32_t depth, std::shared_ptr<DomManager> dom_manager) {
  tdf::devtools::DomainMetas metas(GetId());
  metas.SetParentId(GetPid());
  metas.SetRootId(dom_manager->GetRootId());
  if (GetId() == dom_manager->GetRootId()) {
    metas.SetClassName("rootView");
    metas.SetNodeName("rootView");
    metas.SetLocalName("rootView");
    metas.SetNodeValue("rootView");
  } else {
    metas.SetClassName(GetViewName());
    metas.SetNodeName(GetTagName());
    metas.SetLocalName(GetTagName());
    metas.SetNodeValue("");
  }
  metas.SetStyleProps(ParseNodeProps(style_map_));
  metas.SetTotalProps(ParseNodeProps(dom_ext_map_));
  // 每获取一层数据 深度减一
  depth--;
  if (depth <= 0) {
    // 不需要孩子节点数据 则直接返回
    return metas;
  }
  for (auto& child : children_) {
    metas.AddChild(child->GetDomDomainData(depth, dom_manager));
  }
  auto layout_result = GetLayoutInfoFromRoot();
  metas.SetLayoutX(layout_result.left);
  metas.SetLayoutY(layout_result.top);
  metas.SetWidth(layout_result.width);
  metas.SetHeight(layout_result.height);
  return metas;
}

tdf::devtools::DomNodeLocation DomNode::GetNodeIdByDomLocation(double x, double y) {
  auto hit_node = GetMaxDepthAndMinAreaHitNode(x, y, shared_from_this());
  if (hit_node == nullptr) {
    hit_node = shared_from_this();
  }
  int32_t node_id = hit_node->GetId();
  tdf::devtools::DomNodeLocation node_location(node_id);
  node_location.AddRelationId(node_id);
  auto temp_hit_node = hit_node->GetParent();
  while (temp_hit_node != nullptr && temp_hit_node != shared_from_this()) {
    node_location.AddRelationId(temp_hit_node->GetId());
    temp_hit_node = temp_hit_node->GetParent();
  }
  return node_location;
}

std::shared_ptr<DomNode> DomNode::GetMaxDepthAndMinAreaHitNode(double x, double y, std::shared_ptr<DomNode> node) {
  if (node == nullptr || !node->IsLocationHitNode(x, y)) {
    return nullptr;
  }
  std::shared_ptr<DomNode> hit_node = node;
  for (auto& child : node->children_) {
    if (!child->IsLocationHitNode(x, y)) {
      continue;
    }
    auto new_node = GetMaxDepthAndMinAreaHitNode(x, y, child);
    hit_node = GetSmallerAreaNode(hit_node, new_node);
  }
  return hit_node;
}

bool DomNode::IsLocationHitNode(double x, double y) {
  LayoutResult layout_result = GetLayoutInfoFromRoot();
  double self_x = static_cast<uint32_t>(layout_result.left);
  double self_y = static_cast<uint32_t>(layout_result.top);
  bool in_top_offset = (x >= self_x) && (y >= self_y);
  bool in_bottom_offset = (x <= self_x + layout_node_->GetWidth()) && (y <= self_y + layout_node_->GetHeight());
  return in_top_offset && in_bottom_offset;
}

std::shared_ptr<DomNode> DomNode::GetSmallerAreaNode(std::shared_ptr<DomNode> old_node,
                                                     std::shared_ptr<DomNode> new_node) {
  if (old_node == nullptr) {
    return new_node;
  }
  if (new_node == nullptr) {
    return old_node;
  }
  auto old_node_area = old_node->layout_node_->GetWidth() * old_node->layout_node_->GetHeight();
  auto new_node_area = new_node->layout_node_->GetWidth() * new_node->layout_node_->GetHeight();
  return old_node_area > new_node_area ? new_node : old_node;
}

std::string DomNode::ParseDomValue(const DomValue& dom_value) {
  if (!dom_value.IsObject()) {
    TDF_BASE_DLOG(INFO) << "ParseTotalProps, node props is not object";
    return "{}";
  }
  std::string node_str = "{";
  bool first_object = true;
  for (auto iterator : dom_value.ToObject()) {
    if (iterator.first == "uri" || iterator.first == "src") {
      // 这个value是个base64，数据量太大，改成空字符串
      iterator.second = "";
    }
    std::string key = iterator.first;
    if (iterator.second.IsBoolean()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += iterator.second.ToBoolean() ? "true" : "false";
      first_object = false;
    } else if (iterator.second.IsInt32()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator.second.ToInt32());
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
      node_str += std::to_string(iterator.second.ToDouble());
      first_object = false;
    } else if (iterator.second.IsString()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":\"";
      node_str += iterator.second.ToString();
      node_str += "\"";
      first_object = false;
    } else if (iterator.second.IsArray()) {
      auto props_array = iterator.second.ToArray();
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

std::string DomNode::ParseNodeProps(
    const std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>>& node_props) {
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
      node_str += iterator->second->ToBoolean() ? "true" : "false";
      first_object = false;
    } else if (iterator->second->IsInt32()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":";
      node_str += std::to_string(iterator->second->ToInt32());
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
      node_str += std::to_string(iterator->second->ToDouble());
      first_object = false;
    } else if (iterator->second->IsString()) {
      node_str += first_object ? "\"" : ",\"";
      node_str += key;
      node_str += "\":\"";
      node_str += iterator->second->ToString();
      node_str += "\"";
      first_object = false;
    } else if (iterator->second->IsArray()) {
      auto props_array = iterator->second->ToArray();
      std::string array = "[";
      for (auto it = props_array.begin(); it != props_array.end(); ++it) {
        if (it->IsNull() || it->IsUndefined()) {
          continue;
        }
        array += ParseDomValue(*it);;
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
      DomValue dom_value = *(iterator->second);
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
#endif

void DomNode::UpdateProperties(const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style,
                               const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_dom_ext) {
  auto dom_manager = dom_manager_.lock();
  TDF_BASE_DCHECK(dom_manager);
  if (dom_manager) {
    dom_manager->PostTask([WEAK_THIS, update_style, update_dom_ext]() {
      DEFINE_AND_CHECK_SELF(DomNode)
      for (const auto& v : update_style) {
        if (self->style_map_ == nullptr) {
          self->style_map_ = std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
        }

        auto iter = self->style_map_->find(v.first);
        if (iter == self->style_map_->end()) {
          std::pair<std::string, std::shared_ptr<DomValue>> pair = {v.first,
                                                                    std::make_shared<DomValue>(std::move(*v.second))};
          self->style_map_->insert(pair);
        }

        if (v.second->IsObject() && iter->second->IsObject()) {
          self->UpdateObjectStyle(*iter->second, *v.second);
        } else {
          iter->second = std::make_shared<DomValue>(std::move(*v.second));
        }
      }

      for (const auto& v : update_dom_ext) {
        if (self->dom_ext_map_ == nullptr) {
          self->dom_ext_map_ = std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
        }

        auto iter = self->dom_ext_map_->find(v.first);
        if (iter == self->dom_ext_map_->end()) {
          std::pair<std::string, std::shared_ptr<DomValue>> pair = {v.first,
                                                                    std::make_shared<DomValue>(std::move(*v.second))};
          self->dom_ext_map_->insert(pair);
        }

        if (v.second->IsObject() && iter->second->IsObject()) {
          self->UpdateObjectStyle(*iter->second, *v.second);
        } else {
          iter->second = std::make_shared<DomValue>(std::move(*v.second));
        }
      }

      // update Render Node
      auto dom_manager = self->dom_manager_.lock();
      TDF_BASE_DCHECK(dom_manager);
      if(dom_manager) {
        dom_manager->UpdateRenderNode(self->shared_from_this());
      }

    });
  }
}

void DomNode::UpdateObjectStyle(DomValue& style_map, const DomValue& update_style) {
  TDF_BASE_DCHECK(style_map.IsObject());
  TDF_BASE_DCHECK(update_style.IsObject());

  auto style_object = style_map.ToObject();
  for (auto& v : update_style.ToObject()) {
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

}  // namespace dom
}  // namespace hippy
