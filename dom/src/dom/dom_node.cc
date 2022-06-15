#include "dom/dom_node.h"

#include <algorithm>
#include <utility>
#include "base/logging.h"
#include "dom/diff_utils.h"
#include "dom/macro.h"
#include "dom/node_props.h"
#include "dom/render_manager.h"
#include "dom/root_node.h"
#include "dom/serializer.h"

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

using DomValueObjectType = tdf::base::DomValue::DomValueObjectType;

DomNode::DomNode(uint32_t id,
                 uint32_t pid,
                 int32_t index,
                 std::string tag_name,
                 std::string view_name,
                 std::shared_ptr<std::unordered_map<std::string,
                                                    std::shared_ptr<DomValue>>> style_map,
                 std::shared_ptr<std::unordered_map<std::string,
                                                    std::shared_ptr<DomValue>>> dom_ext_map,
                 std::shared_ptr<RootNode> weak_root_node)
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

DomNode::DomNode(uint32_t id,
                 uint32_t pid,
                 int32_t index,
                 std::string tag_name,
                 std::string view_name,
                 std::shared_ptr<std::unordered_map<std::string,
                                                    std::shared_ptr<DomValue>>> style_map,
                 std::shared_ptr<std::unordered_map<std::string,
                                                    std::shared_ptr<DomValue>>> dom_ext_map)
    : DomNode(id,
              pid,
              index,
              std::move(tag_name),
              std::move(view_name),
              std::move(style_map),
              std::move(dom_ext_map),
              nullptr) {
}

DomNode::DomNode(uint32_t id, uint32_t pid)
  : DomNode(id, pid, -1, "", "", nullptr, nullptr) {}

DomNode::DomNode() : DomNode(0, 0) {}

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

int32_t DomNode::AddChildByRefInfo(const std::shared_ptr<DomInfo>& dom_info) {
  std::shared_ptr<RefInfo> ref_info = dom_info->ref_info;
  if (ref_info) {
    for (uint32_t i = 0; i < children_.size(); ++i) {
      auto child = children_[i];
      if (ref_info->ref_id == child->GetId()) {
        if (ref_info->relative_to_ref == RelativeType::kFront) {
          children_.insert(
              children_.begin() + hippy::base::checked_numeric_cast<uint32_t, int32_t>(i),
              dom_info->dom_node);
        } else {
          children_.insert(
              children_.begin() + hippy::base::checked_numeric_cast<uint32_t, int32_t>(i + 1),
              dom_info->dom_node);
        }
        break;
      }
      if (i == children_.size() - 1) {
        children_.push_back(dom_info->dom_node);
        break;
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
                            hippy::base::checked_numeric_cast<int32_t, uint32_t>(index));
  return index;
}

int32_t DomNode::GetChildIndex(uint32_t id) {
  int32_t index = -1;
  for (uint32_t i = 0; i < children_.size(); ++i) {
    auto child = children_[i];
    if (child && child->GetId() == id) {
      index = static_cast<int32_t>(i);
      break;
    }
  }
  return index;
}

int32_t DomNode::GetSelfIndex() {
  auto parent = parent_.lock();
  if (parent) {
    return parent->GetChildIndex(id_);
  }
  return -1;
}

std::shared_ptr<DomNode> DomNode::RemoveChildAt(int32_t index) {
  auto child = children_[hippy::base::checked_numeric_cast<int32_t, unsigned long>(index)];
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
  layout_node_->CalculateLayout(0, 0);
  TransferLayoutOutputsRecursive(changed_nodes);
}

void DomNode::HandleEvent(const std::shared_ptr<DomEvent>& event) {
  auto root_node = root_node_.lock();
  TDF_BASE_DCHECK(root_node);
  if (root_node) {
    root_node->HandleEvent(std::move(event));
  }
}

std::tuple<float, float> DomNode::GetLayoutSize() {
  return std::make_tuple(layout_node_->GetWidth(), layout_node_->GetHeight());
}

void DomNode::SetLayoutSize(float width, float height) {
  layout_node_->SetWidth(width);
  layout_node_->SetHeight(height);
}

void DomNode::SetLayoutOrigin(float x, float y) {
  layout_node_->SetPosition(hippy::Edge::EdgeLeft, x);
  layout_node_->SetPosition(hippy::Edge::EdgeTop, y);
}

void DomNode::AddEventListener(const std::string& name,
                               uint64_t listener_id,
                               bool use_capture,
                               const EventCallback& cb) {
  auto root_node = root_node_.lock();
  TDF_BASE_DCHECK(root_node);
  if (root_node) {
    current_callback_id_ += 1;
    TDF_BASE_DCHECK(current_callback_id_ <= std::numeric_limits<uint32_t>::max());
    if (!event_listener_map_) {
      event_listener_map_ = std::make_shared<
          std::unordered_map<std::string,
                             std::array<std::vector<std::shared_ptr<EventListenerInfo>>, 2>>>();
    }
    auto it = event_listener_map_->find(name);
    if (it == event_listener_map_->end()) {
      (*event_listener_map_)[name] = {};
      root_node->AddEvent(GetId(), name);
    }
    if (use_capture) {
      (*event_listener_map_)[name][kCapture].push_back(std::make_shared<EventListenerInfo>(
          listener_id,
          cb));
    } else {
      (*event_listener_map_)[name][kBubble].push_back(std::make_shared<EventListenerInfo>(
          listener_id,
          cb));
    }
  }
}

void DomNode::RemoveEventListener(const std::string& name, uint64_t listener_id) {
  auto root_node = root_node_.lock();
  TDF_BASE_DCHECK(root_node);
  if (root_node) {
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
                                   [listener_id](const std::shared_ptr<EventListenerInfo>& item) {
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
                                  [listener_id](const std::shared_ptr<EventListenerInfo>& item) {
                                    if (item->id == listener_id) {
                                      return true;
                                    }
                                    return false;
                                  });
    if (bubble_it != bubble_listeners.end()) {
      bubble_listeners.erase(bubble_it);
    }
    if (capture_listeners.empty() && bubble_listeners.empty()) {
      root_node->RemoveEvent(GetId(), name);
      event_listener_map_->erase(it);
    }
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
  auto not_equal = std::not_equal_to<>();
  bool changed = not_equal(layout_.left, layout_node_->GetLeft())
      || not_equal(layout_.top, layout_node_->GetTop()) ||
      not_equal(layout_.width, layout_node_->GetWidth()) ||
      not_equal(layout_.height, layout_node_->GetHeight());
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
    layout_obj[kLayoutLayoutKey] = layout_param;
    auto event =
        std::make_shared<DomEvent>(kLayoutEvent,
                                   weak_from_this(),
                                   std::make_shared<DomValue>(std::move(layout_obj)));
    HandleEvent(event);
  }
  for (auto& it: children_) {
    it->TransferLayoutOutputsRecursive(changed_nodes);
  }
}

void DomNode::CallFunction(const std::string& name,
                           const DomArgument& param,
                           const CallFunctionCallback& cb) {
  if (!func_cb_map_) {
    func_cb_map_ =
        std::make_shared<std::unordered_map<std::string,
                                            std::unordered_map<uint32_t, CallFunctionCallback>>>();
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

bool DomNode::HasEventListeners() {
  return event_listener_map_ != nullptr && !event_listener_map_->empty();
}

void DomNode::EmplaceStyleMap(const std::string& key, const DomValue& value) {
  auto iter = style_map_->find(key);
  if (iter != style_map_->end()) {
    iter->second = std::make_shared<DomValue>(value);
  } else {
    bool replaced = false;
    for (auto& style: *style_map_) {
      replaced = ReplaceStyle(*style.second, key, value);
      if (replaced) return;
    }
    style_map_->insert({key, std::make_shared<DomValue>(value)});
  }
}

void DomNode::UpdateProperties(const std::unordered_map<std::string,
                                                        std::shared_ptr<DomValue>>& update_style,
                               const std::unordered_map<std::string,
                                                        std::shared_ptr<DomValue>>& update_dom_ext) {
  auto root_node = root_node_.lock();
  TDF_BASE_DCHECK(root_node);
  if (root_node) {
    this->UpdateDiff(update_style, update_dom_ext);
    this->UpdateStyle(update_style);
    this->UpdateDomExt(update_dom_ext);
    root_node->UpdateRenderNode(shared_from_this());
  }
}

void DomNode::UpdateDomNodeStyleAndParseLayoutInfo(
    const std::unordered_map<std::string, std::shared_ptr<DomValue>>& update_style) {
  UpdateStyle(update_style);
  ParseLayoutStyleInfo();
}

void DomNode::UpdateDiff(const std::unordered_map<std::string,
                                                  std::shared_ptr<DomValue>>& update_style,
                         const std::unordered_map<std::string,
                                                  std::shared_ptr<DomValue>>& update_dom_ext) {
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

void DomNode::UpdateDomExt(const std::unordered_map<std::string,
                                                    std::shared_ptr<DomValue>>& update_dom_ext) {
  if (update_dom_ext.empty()) return;

  for (const auto& v: update_dom_ext) {
    if (this->dom_ext_map_ == nullptr) {
      this->dom_ext_map_ =
          std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
    }

    auto iter = this->dom_ext_map_->find(v.first);
    if (iter == this->dom_ext_map_->end()) {
      std::pair<std::string, std::shared_ptr<DomValue>>
          pair = {v.first, std::make_shared<DomValue>(*v.second)};
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

void DomNode::UpdateStyle(const std::unordered_map<std::string,
                                                   std::shared_ptr<DomValue>>& update_style) {
  if (update_style.empty()) return;

  for (const auto& v: update_style) {
    if (this->style_map_ == nullptr) {
      this->style_map_ =
          std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
    }

    auto iter = this->style_map_->find(v.first);
    if (iter == this->style_map_->end()) {
      std::pair<std::string, std::shared_ptr<DomValue>>
          pair = {v.first, std::make_shared<DomValue>(*v.second)};
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
  for (auto& v: update_style.ToObjectChecked()) {
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
    for (auto& o: object) {
      replaced = ReplaceStyle(o.second, key, value);
      if (replaced) break;
    }
    return replaced;
  }

  if (style.IsArray()) {
    auto& array = style.ToArrayChecked();
    bool replaced = false;
    for (auto& a: array) {
      replaced = ReplaceStyle(a, key, value);
      if (replaced) break;
    }
    return replaced;
  }

  return false;
}

DomValue DomNode::Serialize() const {
  DomValueObjectType result;

  auto id = DomValue(id_);
  result[kNodePropertyId] = id;

  auto pid = DomValue(pid_);
  result[kNodePropertyPid] = pid;

  auto index = DomValue(index_);
  result[kNodePropertyIndex] = index;

  auto tag_name = DomValue(tag_name_);
  result[kNodePropertyTagName] = tag_name;

  auto view_name = DomValue(view_name_);
  result[kNodePropertyViewName] = view_name;

  DomValueObjectType style_map_value;
  for (const auto& value: *style_map_) {
    style_map_value[value.first] = *value.second;
  }
  auto style_map = DomValue(std::move(style_map_value));
  result[kNodePropertyStyle] = style_map;

  DomValueObjectType dom_ext_map_value;
  for (const auto& value: *dom_ext_map_) {
    dom_ext_map_value[value.first] = *value.second;
  }
  auto dom_ext_map = DomValue(std::move(dom_ext_map_value));
  result[kNodePropertyExt] = dom_ext_map;
  return DomValue(std::move(result));
}

bool DomNode::Deserialize(DomValue value) {
  TDF_BASE_DCHECK(value.IsObject());
  if (!value.IsObject()) {
    TDF_BASE_LOG(ERROR) << "Deserialize value is not object";
    return false;
  }
  DomValueObjectType dom_node_obj = value.ToObjectChecked();

  uint32_t id;
  auto flag = dom_node_obj[kNodePropertyId].ToUint32(id);
  if (flag) {
    SetId(static_cast<uint32_t>(id));
  } else {
    TDF_BASE_LOG(ERROR) << "Deserialize id error";
    return false;
  }

  uint32_t pid;
  flag = dom_node_obj[kNodePropertyPid].ToUint32(pid);
  if (flag) {
    SetPid(static_cast<uint32_t>(pid));
  } else {
    TDF_BASE_LOG(ERROR) << "Deserialize pid error";
    return false;
  }

  int32_t index;
  flag = dom_node_obj[kNodePropertyIndex].ToInt32(index);
  if (flag) {
    SetIndex(index);
  } else {
    TDF_BASE_LOG(ERROR) << "Deserialize index error";
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
    TDF_BASE_LOG(ERROR) << "Deserialize view_name error";
    return false;
  }

  DomValueObjectType style;
  flag = dom_node_obj[kNodePropertyStyle].ToObject(style);
  if (flag) {
    std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>>
        style_map = std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
    for (const auto& p: style) {
      (*style_map)[p.first] = std::make_shared<DomValue>(p.second);
    }
    SetStyleMap(std::move(style_map));
  } else {
    TDF_BASE_LOG(ERROR) << "Deserialize style error";
    return false;
  }

  DomValueObjectType ext;
  flag = dom_node_obj[kNodePropertyExt].ToObject(ext);
  if (flag) {
    std::shared_ptr<std::unordered_map<std::string, std::shared_ptr<DomValue>>>
        ext_map = std::make_shared<std::unordered_map<std::string, std::shared_ptr<DomValue>>>();
    for (const auto& p: ext) {
      (*ext_map)[p.first] = std::make_shared<DomValue>(p.second);
    }
    SetExtStyleMap(std::move(ext_map));
  } else {
    TDF_BASE_LOG(ERROR) << "Deserialize ext error";
    return false;
  }

  return true;
}

}  // namespace dom
}  // namespace hippy
