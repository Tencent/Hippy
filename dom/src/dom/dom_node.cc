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
      dom_manager_(dom_manager) {}

DomNode::DomNode(int32_t id, int32_t pid, int32_t index) : id_(id), pid_(pid), index_(index) {}

void DomNode::AddChildAt(std::shared_ptr<DomNode> dom_node, int32_t index) {
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
  std::shared_ptr<TaitankLayoutNode> child_node =
    std::static_pointer_cast<TaitankLayoutNode>(child->node_);
  node->RemoveChild(child_node);
  return child;
}

void DomNode::DoLayout() {
  std::shared_ptr<TaitankLayoutNode> node = std::static_pointer_cast<TaitankLayoutNode>(node_);
  node->CalculateLayout(0, 0);
  TransferLayoutOutputsRecursive(shared_from_this());
}

void DomNode::ParseLayoutStyleInfo() { node_->SetLayoutStyles(style_map_); }

void DomNode::TransferLayoutOutputsRecursive(std::shared_ptr<DomNode> dom_node) {
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

  node->SetHasNewLayout(false);
  for (auto it = children_.begin(); it != children_.end(); it++) {
    TransferLayoutOutputsRecursive(*it);
  }
}
int32_t DomNode::AddClickEventListener(OnClickEventListener listener) {
  auto dom_manager = dom_manager_.lock();
  int32_t id = -1;
  if (dom_manager) {
    id = dom_manager->GetRenderManager()->AddClickEventListener(id_, [listener]() { listener(); });
  }
  return id;
}

void DomNode::RemoveClickEventListener(int32_t listener_id) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->RemoveClickEventListener(id_, listener_id);
  }
}

int32_t DomNode::AddLongClickEventListener(OnLongClickEventListener listener) {
  auto dom_manager = dom_manager_.lock();
  int32_t id = -1;
  if (dom_manager) {
    id = dom_manager->GetRenderManager()->AddLongClickEventListener(id_, [listener]() { listener(); });
  }
  return id;
}

void DomNode::RemoveLongClickEventListener(int32_t listener_id) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->RemoveLongClickEventListener(id_, listener_id);
  }
}

int32_t DomNode::AddTouchEventListener(TouchEvent event, OnTouchEventListener listener) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->AddTouchEventListener(id_, event, [listener](TouchEventInfo eventInfo) { listener(eventInfo); });
  }
  return 0;
}

void DomNode::RemoveTouchEventListener(TouchEvent event) {
  auto dom_manager = dom_manager_.lock();
  if (dom_manager) {
    dom_manager->GetRenderManager()->RemoveTouchEventListener(id_, event);
  }
}
}  // namespace dom
}  // namespace hippy
