#include "dom/dom_node.h"

#include <utility>
#include "base/logging.h"
#include "dom/node_props.h"

namespace hippy {
inline namespace dom {

DomNode::DomNode(int32_t id, int32_t pid, int32_t index, std::string tag_name, std::string view_name,
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
      dom_manager_(dom_manager),
      current_callback_id_(0){}

DomNode::DomNode(int32_t id, int32_t pid, int32_t index) : id_(id), pid_(pid), index_(index) {}

DomNode::DomNode() = default;

DomNode::~DomNode() = default;

int32_t DomNode::IndexOf(const std::shared_ptr<DomNode>& child) {
  for (int i = 0; i < children_.size(); i++) {
    if (children_[i] == child) {
      return i;
    }
  }
  return -1;
}

std::shared_ptr<DomNode> DomNode::GetChildAt(int32_t index) {
  for (auto & i : children_) {
    if (i->index_ == index) {
      return i;
    }
  }
  return nullptr;
}

void DomNode::AddChildAt(const std::shared_ptr<DomNode>& dom_node, int32_t index) {
  children_.insert(children_.begin() + index, dom_node);
  dom_node->SetParent(shared_from_this());
  std::shared_ptr<TaitankLayoutNode> node = std::static_pointer_cast<TaitankLayoutNode>(node_);
  node->InsertChild(node, index);
}

std::shared_ptr<DomNode> DomNode::RemoveChildAt(int32_t index) {
  auto child = children_[index];
  child->SetParent(nullptr);
  children_.erase(children_.begin() + index);
  std::shared_ptr<TaitankLayoutNode> node = std::static_pointer_cast<TaitankLayoutNode>(node_);
  std::shared_ptr<TaitankLayoutNode> child_node = std::static_pointer_cast<TaitankLayoutNode>(child->node_);
  node->RemoveChild(child_node);
  return child;
}

void DomNode::DoLayout() {
  std::shared_ptr<TaitankLayoutNode> node = std::static_pointer_cast<TaitankLayoutNode>(node_);
  node->CalculateLayout(0, 0);
  TransferLayoutOutputsRecursive(shared_from_this());
}

void DomNode::SetSize(int32_t width, int32_t height) {
    node_->SetWidth(width);
    node_->SetHeight(height);
}

int32_t DomNode::AddDomEventListener(DomEvent event, OnDomEventListener listener) {
  auto dom_manager = dom_manager_.lock();
  int32_t id = ++current_callback_id_;
  if (dom_event_listeners == nullptr) {
    dom_event_listeners =
        std::make_shared<std::unordered_map<DomEvent, std::unordered_map<int32_t, OnDomEventListener>>>();
  }
  (*dom_event_listeners)[event][id] = std::move(listener);
  return id;
}
void DomNode::RemoveDomEventListener(DomEvent event, int32_t listener_id) {
  auto listeners = dom_event_listeners->find(event);
  if (dom_event_listeners || listeners == dom_event_listeners->end()) {
    return;
  }
  if (listeners->second.find(listener_id) != listeners->second.end()) {
    listeners->second.erase(listener_id);
  }
}

void DomNode::OnDomNodeStateChange(DomEvent event) {
  if (!dom_event_listeners) {
    return;
  }
  auto listeners = (*dom_event_listeners).find(event);
  if (listeners == dom_event_listeners->end()) {
    return;
  }
  for (const auto& listener : listeners->second) {
    listener.second();
  }
}

int32_t DomNode::AddOnLayoutListener(LayoutEvent event, OnLayoutEventListener listener) {
  auto dom_manager = dom_manager_.lock();
  int32_t id = ++current_callback_id_;
  if (layout_listeners == nullptr) {
    layout_listeners =
        std::make_shared<std::unordered_map<LayoutEvent, std::unordered_map<int32_t, OnLayoutEventListener>>>();
  }
  (*layout_listeners)[event][id] = std::move(listener);
  return id;
}

void DomNode::RemoveOnLayoutListener(LayoutEvent event, int32_t listener_id) {
  auto listeners = layout_listeners->find(event);
  if (layout_listeners || listeners == layout_listeners->end()) {
    return;
  }
  if (listeners->second.find(listener_id) != listeners->second.end()) {
    listeners->second.erase(listener_id);
  }
}

void DomNode::OnLayout(LayoutEvent event, LayoutResult result) {
  if (!layout_listeners) {
    return;
  }
  auto listeners = (*layout_listeners).find(event);
  if (listeners == layout_listeners->end()) {
    return;
  }
  for (const auto& listener : listeners->second) {
    listener.second(result);
  }
}

void DomNode::ParseLayoutStyleInfo() { node_->SetLayoutStyles(style_map_); }

void DomNode::TransferLayoutOutputsRecursive(const std::shared_ptr<DomNode>& dom_node) {
  std::shared_ptr<TaitankLayoutNode> node = std::static_pointer_cast<TaitankLayoutNode>(node_);
  if (!node->HasNewLayout()) {
    return;
  }
  dom_node->layout_.left = node->GetLeft();
  dom_node->layout_.top = node->GetTop();
  dom_node->layout_.width = node->GetWidth();
  dom_node->layout_.height = node->GetHeight();
  dom_node->layout_.marginLeft = node->GetMargin(TaitankCssDirection::CSSLeft);
  dom_node->layout_.marginTop = node->GetMargin(TaitankCssDirection::CSSTop);
  dom_node->layout_.marginRight = node->GetMargin(TaitankCssDirection::CSSRight);
  dom_node->layout_.marginBottom = node->GetMargin(TaitankCssDirection::CSSBottom);
  dom_node->layout_.paddingLeft = node->GetPadding(TaitankCssDirection::CSSLeft);
  dom_node->layout_.paddingTop = node->GetPadding(TaitankCssDirection::CSSTop);
  dom_node->layout_.paddingRight = node->GetPadding(TaitankCssDirection::CSSRight);
  dom_node->layout_.paddingBottom = node->GetPadding(TaitankCssDirection::CSSBottom);
  OnLayout(LayoutEvent::OnLayout, layout_);
  node->SetHasNewLayout(false);
  for (auto & it : children_) {
    TransferLayoutOutputsRecursive(it);
  }
}

void DomNode::CallFunction(const std::string& name, std::unordered_map<std::string, std::shared_ptr<DomValue>> param,
                           const CallFunctionCallback& cb) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->CallFunction(shared_from_this(), name, std::move(param), cb);
  }
  if (callbacks_ == nullptr) {
    callbacks_ = std::make_shared<std::unordered_map<std::string, CallFunctionCallback>>();
  }
  (*callbacks_)[name] =cb;
}

    [[maybe_unused]] CallFunctionCallback DomNode::GetCallback(const std::string& name) {
  if (callbacks_ && callbacks_->find(name) != callbacks_->end()) {
    return callbacks_->find(name)->second;
  }
  return nullptr;
}

int32_t DomNode::AddClickEventListener(OnClickEventListener listener) {
  auto dom_manager = dom_manager_.lock();
  int32_t id = ++current_callback_id_;
  if (click_listeners == nullptr) {
    click_listeners = std::make_shared<std::unordered_map<int32_t, OnClickEventListener>>();
  }
  (*click_listeners)[id] = std::move(listener);
  std::weak_ptr<std::unordered_map<int32_t, OnClickEventListener>> weak_listeners = click_listeners;
  auto function = [weak_listeners]() {
    auto listeners = weak_listeners.lock();
    if (!listeners) {
      return;
    }
    for (const auto& func : *listeners) {
      func.second();
    }
  };
  if (dom_manager) {
    dom_manager->GetRenderManager()->SetClickEventListener(id_, function);
  }
  return id;
}

void DomNode::RemoveClickEventListener(int32_t listener_id) {
  if (click_listeners && click_listeners->find(listener_id) != click_listeners->end()) {
    click_listeners->erase(click_listeners->find(listener_id));
    auto dom_manager = dom_manager_.lock();
    if (click_listeners->empty() && dom_manager) {
      dom_manager->GetRenderManager()->RemoveClickEventListener(id_);
    }
  }
}

int32_t DomNode::AddLongClickEventListener(OnLongClickEventListener listener) {
  int32_t id = ++current_callback_id_;
  if (long_click_listeners == nullptr) {
    long_click_listeners = std::make_shared<std::unordered_map<int32_t, OnLongClickEventListener>>();
  }
  (*long_click_listeners)[id] = std::move(listener);
  std::weak_ptr<std::unordered_map<int32_t, OnLongClickEventListener>> weak_listeners = long_click_listeners;
  auto function = [weak_listeners]() {
    auto listeners = weak_listeners.lock();
    if (!listeners) {
      return;
    }
    for (const auto& func : *listeners) {
      func.second();
    }
  };
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->SetLongClickEventListener(id_, function);
  }
  return id;
}

void DomNode::RemoveLongClickEventListener(int32_t listener_id) {
  if (long_click_listeners && long_click_listeners->find(listener_id) != long_click_listeners->end()) {
    long_click_listeners->erase(long_click_listeners->find(listener_id));
    auto dom_manager = dom_manager_.lock();
    if (long_click_listeners->empty() && dom_manager) {
      dom_manager->GetRenderManager()->RemoveLongClickEventListener(id_);
    }
  }
}

int32_t DomNode::AddTouchEventListener(TouchEvent event, OnTouchEventListener listener) {
  int32_t id = ++current_callback_id_;
  if (touch_listeners == nullptr) {
    touch_listeners = std::make_shared<std::unordered_map<int32_t, OnTouchEventListener>>();
  }
  (*touch_listeners)[id] = std::move(listener);
  std::weak_ptr<std::unordered_map<int32_t, OnTouchEventListener>> weak_listeners = touch_listeners;
  auto function = [weak_listeners](TouchEventInfo info) {
    auto listeners = weak_listeners.lock();
    if (!listeners) {
      return;
    }
    for (const auto& func : *listeners) {
      func.second(info);
    }
  };
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->SetTouchEventListener(id_, event, function);
  }
  return id;
}

void DomNode::RemoveTouchEventListener(TouchEvent event, int32_t listener_id) {
  if (touch_listeners && touch_listeners->find(listener_id) != touch_listeners->end()) {
    touch_listeners->erase(touch_listeners->find(listener_id));
    auto dom_manager = dom_manager_.lock();
    if (dom_manager && touch_listeners->empty()) {
      dom_manager->GetRenderManager()->RemoveTouchEventListener(id_, event);
    }
  }
}

int32_t DomNode::SetOnAttachChangedListener(OnAttachChangedListener listener) {
  TDF_BASE_NOTIMPLEMENTED();
  return 0;
}

int32_t DomNode::AddShowEventListener(ShowEvent event, OnShowEventListener listener) {
  auto dom_manager = dom_manager_.lock();
  int32_t id = ++current_callback_id_;
  if (show_listeners == nullptr) {
    show_listeners = std::make_shared<std::unordered_map<int32_t, OnShowEventListener>>();
  }
  (*show_listeners)[id] = std::move(listener);
  std::weak_ptr<std::unordered_map<int32_t, OnShowEventListener>> weak_listeners = show_listeners;
  auto function = [weak_listeners](const std::any& args) {
    auto listeners = weak_listeners.lock();
    if (!listeners) {
      return;
    }
    for (const auto& func : *listeners) {
      func.second(args);
    }
  };
  if (dom_manager) {
    dom_manager->GetRenderManager()->SetShowEventListener(id_, event, function);
  }
  return id;
}

void DomNode::RemoveShowEventListener(ShowEvent event, int32_t listener_id) {
  if (show_listeners != nullptr && show_listeners->find(listener_id) != show_listeners->end()) {
    show_listeners->erase(show_listeners->find(listener_id));
    auto dom_manager = dom_manager_.lock();
    if (show_listeners->empty() && dom_manager) {
      dom_manager->GetRenderManager()->RemoveShowEventListener(id_, event);
    }
  }
}

}  // namespace dom
}  // namespace hippy
