#pragma once

#include <unordered_map>
#include "dom/dom_value.h"

namespace hippy {
inline namespace dom {

enum Edge {
  EdgeLeft,
  EdgeTop,
  EdgeRight,
  EdgeBottom,
  EdgeStart,
  EdgeEnd,
};

enum Direction {
  Inherit,
  LTR,
  RTL,
};

enum LayoutMeasureMode {
  Undefined,
  Exactly,
  AtMost,
};

struct LayoutSize {
  float width;
  float height;
};

using Edge = Edge;
using Direction = Direction;
using LayoutSize = LayoutSize;
using LayoutMeasureMode = LayoutMeasureMode;

using MeasureFunction = std::function<LayoutSize(float width, LayoutMeasureMode widthMeasureMode, float height,
                                                 LayoutMeasureMode heightMeasureMode, void* layoutContext)>;

class LayoutNode {
 public:
  LayoutNode();

  virtual ~LayoutNode();

  virtual float GetWidth() = 0;
  virtual float GetHeight() = 0;
  virtual float GetLeft() = 0;
  virtual float GetTop() = 0;
  virtual float GetRight() = 0;
  virtual float GetBottom() = 0;
  virtual float GetStyleWidth() = 0;
  virtual float GetStyleHeight() = 0;
  virtual float GetMargin(Edge edge) = 0;
  virtual float GetPadding(Edge edge) = 0;
  virtual float GetBorder(Edge edge) = 0;

  virtual void SetWidth(float width) = 0;
  virtual void SetHeight(float height) = 0;
  virtual void SetPosition(Edge edge, float position) = 0;
  virtual void SetScaleFactor(float scale_factor) = 0;
  virtual bool HasNewLayout() = 0;
  virtual void SetHasNewLayout(bool has_new_layout) = 0;
  virtual void SetMeasureFunction(MeasureFunction measure_function) = 0;
  virtual void MarkDirty() = 0;

  /**
   * @brief 插入子节点
   * @param child
   * @param index
   */
  virtual void InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) = 0;

  /**
   * @brief 删除子节点
   * @param child
   */
  virtual void RemoveChild(const std::shared_ptr<LayoutNode> child) = 0;

  /**
   * @brief 删除子节点
   * @param parent_width 父容器宽度
   * @param parent_height 父容器高度
   * @param direction 排版方向
   * @param layout_context layout context
   */
  virtual void CalculateLayout(float parent_width, float parent_height, Direction direction = LTR,
                               void* layout_context = nullptr) = 0;

  /**
   * @brief 设置属性
   * @param style_map 属性的map
   */
  virtual void SetLayoutStyles(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) = 0;
};

std::shared_ptr<LayoutNode> CreateLayoutNode();

}  // namespace dom
}  // namespace hippy
