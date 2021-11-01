#pragma once

#include <cstdint>

namespace hippy {
inline namespace dom {

class LayoutNode {
 private:
  std::shared_ptr<LayoutNode> parent_;
  std::vector<LayoutNode> children_;
  int32_t index;

  float width_ = 0;
  float height_ = 0;
  float top_ = 0;
  float left_ = 0;
  float margin_left_ = 0;
  float margin_top_ = 0;
  float margin_right_ = 0;
  float margin_bottom_ = 0;
  float padding_left_ = 0;
  float padding_top_ = 0;
  float padding_right_ = 0;
  float padding_bottom_ = 0;
  float border_left_ = 0;
  float border_top_ = 0;
  float border_right_ = 0;
  float border_bottom_ = 0;
  uint32_t border_color_ = 0;
  int32_t edge_set_flag_ = 0;
};

}
}
