#pragma once

#include <unordered_map>
#include "dom/dom_value.h"
#include "engine/HPNode.h"

namespace hippy {
inline namespace dom {

typedef HPDirection Direction;

class LayoutNode {
 public:
  LayoutNode();

  virtual ~LayoutNode();

  virtual void CalculateLayout(float parent_width, float parent_height, Direction direction = DirectionLTR,
                               void* layout_context = nullptr) = 0;

  virtual void SetLayoutStyles(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>&& style_map) = 0;
};

}  // namespace dom
}  // namespace hippy
