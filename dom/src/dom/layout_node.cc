#include "dom/layout_node.h"

namespace hippy {
inline namespace dom {

LayoutNode::LayoutNode() {}

LayoutNode::~LayoutNode() {}

void LayoutNode::InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) {}

void LayoutNode::RemoveChild(const std::shared_ptr<LayoutNode> child) {}

}  // namespace dom
}  // namespace hippy