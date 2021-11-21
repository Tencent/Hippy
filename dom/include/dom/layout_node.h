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

  /**
   * @brief 插入子节点
   * @param child
   * @param index
   */
  virtual void InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index);

  /**
   * @brief 删除子节点
   * @param child
   */
  virtual void RemoveChild(const std::shared_ptr<LayoutNode> child);

  /**
   * @brief 删除子节点
   * @param parent_width 父容器宽度
   * @param parent_height 父容器高度
   * @param direction 排版方向
   * @param layout_context layout context
   */
  virtual void CalculateLayout(float parent_width, float parent_height, Direction direction = DirectionLTR,
                               void* layout_context = nullptr) = 0;

  /**
   * @brief 设置属性
   * @param style_map 属性的map
   */
  virtual void SetLayoutStyles(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) = 0;
};

}  // namespace dom
}  // namespace hippy
