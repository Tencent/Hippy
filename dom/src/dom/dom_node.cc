#include "dom/dom_node.h"

#include <algorithm>
#include <utility>
#include "base/logging.h"
#include "dom/dom_domain_data_props.h"
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
      style_map_(std::move(style_map)),
      dom_ext_map_(std::move(dom_ext_map)),
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

void DomNode::ParseLayoutStyleInfo() { layout_node_->SetLayoutStyles(style_map_); }

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

nlohmann::json DomNode::ToJSONString() {
  TDF_BASE_DLOG(INFO) << "node_json1";
  nlohmann::json node_json{};
  if (!tag_name_.empty()) {
    node_json[kNodeType] = tag_name_;
  } else if(!view_name_.empty()){
    node_json[kNodeType] = view_name_;
  } else {
    node_json[kNodeType] = "";
  }
  node_json[kNodeId] = id_;
  if (layout_node_) {
//    if (layout_node_->GetWidth() != (layout_node_->GetRight() - layout_node_->GetLeft())) {
      TDF_BASE_DLOG(INFO) << "invalid bounds width:" << layout_node_->GetWidth() << " left:" << layout_node_->GetLeft() << " right:" << layout_node_->GetRight()
      << "margin left:" << layout_node_->GetMargin(EdgeLeft)
      << "margin right:" << layout_node_->GetMargin(EdgeRight)
      << "margin top:" << layout_node_->GetMargin(EdgeTop)
      << "margin bottom:" << layout_node_->GetMargin(EdgeBottom);
//    }
    node_json[kWidth] = layout_node_->GetWidth();
    node_json[kHeight] = layout_node_->GetHeight();
    nlohmann::json bounds_json;
    bounds_json[kTop] = layout_node_->GetTop();
    bounds_json[kLeft] = layout_node_->GetLeft();
    bounds_json[kBottom] = layout_node_->GetBottom();
    bounds_json[kRight] = layout_node_->GetRight();
    node_json[kBounds] = bounds_json;
  }
//  node_json[kBorderColor] = border_color_;
  node_json[kTotalProps] = ParseNodeProps(dom_ext_map_);
  node_json[kFlexNodeStyle] = ParseNodeProps(style_map_);
  // child
  if (!children_.empty()) {
    nlohmann::json child_json_array = nlohmann::json::array();
    for (int i = 0; i < children_.size(); i++) {
        child_json_array.push_back(children_[i]->ToJSONString());
    }
    node_json[kChild] = child_json_array;
  }
  return node_json;
}

nlohmann::json DomNode::GetDomDomainData(uint32_t depth) {
  auto dom_manager = dom_manager_.lock();
  auto domain_json = nlohmann::json::object();
  domain_json[kDomainNodeId] = GetId();
  domain_json[kDomainParentId] = GetPid();
  domain_json[kDomainRootId] = dom_manager->GetRootId();
  domain_json[kDomainClassName] = GetViewName();
  domain_json[kDomainNodeName] = GetTagName();
  domain_json[kDomainLocalName] = GetTagName();
  domain_json[kDomainNodeValue] = "";
  domain_json[kDomainChildNodeCount] = children_.size();

  if (!GetStyleMap().empty()) {
    auto style_props = GetStyleMap();
    domain_json[kDomainStyle] = ParseNodeProps(style_props);
  }
  if (!GetExtStyle().empty()) {
    auto attribute_props = GetExtStyle();
    domain_json[kDomainAttributes] = ParseNodeProps(attribute_props);
  }
  // 每获取一层数据 深度减一
  depth--;
  if (depth <= 0) {
    // 不需要孩子节点数据 则直接返回
    return domain_json;
  }
  auto children_data_json = nlohmann::json::array();
  domain_json[kDomainChildren] = children_data_json;
  domain_json[kDomainLayoutX] = layout_node_->GetLeft();
  domain_json[kDomainLayoutY] = layout_node_->GetTop();
  domain_json[kDomainLayoutWidth] = layout_node_->GetWidth();
  domain_json[kDomainLayoutHeight] = layout_node_->GetHeight();
  return domain_json;
}

nlohmann::json DomNode::GetNodeIdByDomLocation(double x, double y) {
  auto result_json = nlohmann::json::object();
  auto hit_node = GetMaxDepthAndMinAreaHitNode(x, y, shared_from_this());
  if (hit_node == nullptr) {
    hit_node = shared_from_this();
  }
  auto hit_node_relation_tree_json = nlohmann::json::array();
  int32_t node_id = hit_node->GetId();
  hit_node_relation_tree_json.push_back(node_id);
  auto temp_hit_node = hit_node->GetParent();
  while (temp_hit_node != nullptr && temp_hit_node != shared_from_this()) {
    hit_node_relation_tree_json.push_back(temp_hit_node->GetId());
    temp_hit_node = temp_hit_node->GetParent();
  }
  result_json[kDomainNodeId] = node_id;
  result_json[kDomainHitNodeRelationTree] = hit_node_relation_tree_json;
  return result_json;
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
  double self_x = layout_node_->GetLeft();
  double self_y = layout_node_->GetTop();
  auto bounds_json = GetNodeBounds();
  if (bounds_json.is_object()) {
    self_x = bounds_json[kDomainLeft];
    self_y = bounds_json[kDomainTop];
  }
  bool in_top_offset = (x >= self_x) && (y >= self_y);
  bool in_bottom_offset = (x <= self_x + layout_node_->GetWidth()) && (y <= self_y + layout_node_->GetHeight());
  return in_top_offset && in_bottom_offset;
}

nlohmann::json DomNode::GetNodeBounds() {
  nlohmann::json bounds_json;
  bounds_json[kDomainTop] = layout_node_->GetTop();
  bounds_json[kDomainLeft] = layout_node_->GetLeft();
  bounds_json[kDomainBottom] = layout_node_->GetBottom();
  bounds_json[kDomainRight] = layout_node_->GetRight();

  return bounds_json;
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

nlohmann::json DomNode::ParseDomValue(const DomValue& dom_value) {
  nlohmann::json props_json = nlohmann::json::object();
  if (!dom_value.IsObject()) {
    TDF_BASE_DLOG(INFO) << "ParseTotalProps, node props is not object";
    return props_json;
  }
  for (auto iterator : dom_value.ToObject()) {
    if (iterator.first == "uri" || iterator.first == "src") {
      // 这个value是个base64，数据量太大，改成空字符串
      iterator.second = "";
    }
    std::string key = iterator.first;
    if (iterator.second.IsBoolean()) {
      props_json[key] = iterator.second.ToBoolean();
    } else if (iterator.second.IsInt32()) {
      props_json[key] = iterator.second.ToInt32();
    } else if (iterator.second.IsUInt32()) {
      props_json[key] = iterator.second.ToUint32();
    } else if (iterator.second.IsDouble()) {
      props_json[key] = iterator.second.ToDouble();
    } else if (iterator.second.IsString()) {
      props_json[key] = iterator.second.ToString();
    } else if (iterator.second.IsArray()) {
      nlohmann::json props_json_array = nlohmann::json::array();
      auto props_array = iterator.second.ToArray();
      for (auto &child : props_array) {
        if (child.IsNull() || child.IsUndefined()) {
          continue;
        }
        props_json_array.push_back(ParseDomValue(child));
      }
      props_json[key] = props_json_array;
    } else if (iterator.second.IsObject()) {
      props_json[key] = ParseDomValue(iterator.second);
    }
  }
  return props_json;
}

nlohmann::json DomNode::ParseNodeProps(const std::unordered_map<std::string, std::shared_ptr<DomValue>> &node_props) {
  nlohmann::json props_json = nlohmann::json::object();
  if (node_props.empty()) {
    TDF_BASE_DLOG(INFO) << "ParseTotalProps, node props is not object";
    return props_json;
  }

  for(auto iterator = node_props.begin(); iterator != node_props.end(); iterator++){
    if (iterator->first == "uri" || iterator->first == "src") {
      // 这个value是个base64，数据量太大，改成空字符串
//      iterator.second = "";
    }
    std::string key = iterator->first;
    if (iterator->second->IsBoolean()) {
      props_json[key] = iterator->second->ToBoolean();
    } else if (iterator->second->IsInt32()) {
      props_json[key] = iterator->second->ToInt32();
    } else if (iterator->second->IsUInt32()) {
      props_json[key] = iterator->second->IsUInt32();
    } else if (iterator->second->IsDouble()) {
      props_json[key] = iterator->second->ToDouble();
    } else if (iterator->second->IsString()) {
      props_json[key] = iterator->second->ToString();
    } else if (iterator->second->IsArray()) {
      nlohmann::json props_json_array = nlohmann::json::array();
      auto props_array = iterator->second->ToArray();
      for (auto &child : props_array) {
        if (child.IsNull() || child.IsUndefined()) {
          continue;
        }
        props_json_array.push_back(ParseDomValue(child));
      }
      props_json[key] = props_json_array;
    } else if (iterator->second->IsObject()) {
      DomValue dom_value = *(iterator->second);
      props_json[key] = ParseDomValue(dom_value);
    }
  }
  return props_json;
}

}  // namespace dom
}  // namespace hippy
