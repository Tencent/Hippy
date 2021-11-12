#pragma once

#include "render/const.h"

namespace voltron {

class VoltronLayoutNode {
 public:
  void ChangeLayout(double x, double y, double w, double h);
  void FinishLayout();

  double GetLayoutX();
  double GetLayoutY();
  double GetLayoutWidth();
  double GetLayoutHeight();
  bool IsDirty();
 private:
  double x_ = kInvalidSize;
  double y_ = kInvalidSize;
  double width_ = kInvalidSize;
  double height_ = kInvalidSize;
  bool dirty_ = false;
};

}  // namespace voltron
