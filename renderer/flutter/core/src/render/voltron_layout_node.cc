//
// Created by longquan on 2021/11/11.
//

#include "render/voltron_layout_node.h"

namespace voltron {

void VoltronLayoutNode::ChangeLayout(double x, double y, double w, double h) {
  x_ = x;
  y_ = y;
  width_ = w;
  height_ = h;
  dirty_ = true;
}

void VoltronLayoutNode::FinishLayout() {
  dirty_ = false;
}

double VoltronLayoutNode::GetLayoutX() {
  return x_;
}

double VoltronLayoutNode::GetLayoutY() {
  return y_;
}

double VoltronLayoutNode::GetLayoutWidth() {
  return width_;
}

double VoltronLayoutNode::GetLayoutHeight() {
  return height_;
}

bool VoltronLayoutNode::IsDirty() {
  return dirty_;
}

}  // namespace voltron
