#include "dom/dom_node.h"
#include "dom/node_props.h"

namespace hippy {
inline namespace dom {

DomNode::DomNode(int32_t id, int32_t pid, int32_t index, std::string tag_name, std::string view_name,
                 std::unordered_map<std::string, std::shared_ptr<DomValue>>&& style_map,
                 std::unordered_map<std::string, std::shared_ptr<DomValue>>&& dom_ext_map,
                 std::shared_ptr<DomManager> dom_manager)
    : id_(id),
      pid_(pid),
      index_(index),
      tag_name_(std::move(tag_name)),
      view_name_(std::move(view_name)),
      style_map_(std::move(style_map)),
      dom_ext_map_(std::move(dom_ext_map)),
      dom_manager(dom_manager) {}

DomNode::DomNode(int32_t id, int32_t pid, int32_t index) : id_(id), pid_(pid), index_(index) {}

void DomNode::AddChildAt(std::shared_ptr<DomNode> dom_node, int32_t index) {
  children_.insert(children_.begin() + index, dom_node);
  dom_node->SetParent(shared_from_this());
  node_->InsertChild(dom_node->node_, index);
}

std::shared_ptr<DomNode> DomNode::RemoveChildAt(int32_t index) {
  auto child = children_[index];
  child->SetParent(nullptr);
  children_.erase(children_.begin() + index);
  node_->RemoveChild(child->node_);
  return child;
}

void DomNode::DoLayout() {
  node_->CalculateLayout(0, 0);
  TransferLayoutOutputsRecursive(shared_from_this());
}

void DomNode::ParseLayoutStyleInfo() { node_->SetLayoutStyles(style_map_); }

void DomNode::TransferLayoutOutputsRecursive(std::shared_ptr<DomNode> dom_node) {
  if (!dom_node->node_->HasNewLayout()) {
    return;
  }
  dom_node->layout_.left = dom_node->node_->GetLeft();
  dom_node->layout_.top = dom_node->node_->GetTop();
  dom_node->layout_.width = dom_node->node_->GetWidth();
  dom_node->layout_.height = dom_node->node_->GetHeight();
  dom_node->layout_.marginLeft = dom_node->node_->GetMargin(TaitankCssDirection::CSSLeft);
  dom_node->layout_.marginTop = dom_node->node_->GetMargin(TaitankCssDirection::CSSTop);
  dom_node->layout_.marginRight = dom_node->node_->GetMargin(TaitankCssDirection::CSSRight);
  dom_node->layout_.marginBottom = dom_node->node_->GetMargin(TaitankCssDirection::CSSBottom);
  dom_node->layout_.paddingLeft = dom_node->node_->GetPadding(TaitankCssDirection::CSSLeft);
  dom_node->layout_.paddingTop = dom_node->node_->GetPadding(TaitankCssDirection::CSSTop);
  dom_node->layout_.paddingRight = dom_node->node_->GetPadding(TaitankCssDirection::CSSRight);
  dom_node->layout_.paddingBottom = dom_node->node_->GetPadding(TaitankCssDirection::CSSBottom);

  dom_node->node_->SetHasNewLayout(false);
  for (auto it = children_.begin(); it != children_.end(); it++) {
    TransferLayoutOutputsRecursive(*it);
  }
}
int32_t DomNode::AddClickEventListener(OnClickEventListener listener) {
  auto domManager = dom_manager.lock();
  int32_t id = -1;
  if (domManager) {
    id = domManager->GetRenderManager()->AddClickEventListener(id_, [listener]() { listener(); });
  }
  return id;
}

void DomNode::RemoveClickEventListener(int32_t listener_id) {
  auto domManager = dom_manager.lock();
  if (domManager) {
    domManager->GetRenderManager()->RemoveClickEventListener(id_, listener_id);
  }
}

int32_t DomNode::AddLongClickEventListener(OnLongClickEventListener listener) {
  auto domManager = dom_manager.lock();
  int32_t id = -1;
  if (domManager) {
    id = domManager->GetRenderManager()->AddLongClickEventListener(id_, [listener]() { listener(); });
  }
  return id;
}

void DomNode::RemoveLongClickEventListener(int32_t listener_id) {
  auto domManager = dom_manager.lock();
  if (domManager) {
    domManager->GetRenderManager()->RemoveLongClickEventListener(id_, listener_id);
  }
}

int32_t DomNode::AddTouchEventListener(TouchEvent event, OnTouchEventListener listener) {
  auto domManager = dom_manager.lock();
  if (domManager) {
    domManager->GetRenderManager()->AddTouchEventListener(id_, event, [listener](TouchEventInfo eventInfo) { listener(eventInfo); });
  }
}

void DomNode::RemoveTouchEventListener(TouchEvent event) {
  auto domManager = dom_manager.lock();
  if (domManager) {
    domManager->GetRenderManager()->RemoveTouchEventListener(id_, event);
  }
}
}  // namespace dom
}  // namespace hippy
