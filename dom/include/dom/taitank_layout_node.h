#pragma once

#include <cstdint>
#include "dom/layout_node.h"
#include "engine/HPNode.h"

namespace hippy {
inline namespace dom {

typedef CSSDirection TaitankCssDirection;
typedef HPMeasureFunc TaitankMeasureFunction;

class TaitankLayoutNode : public LayoutNode, public std::enable_shared_from_this<TaitankLayoutNode> {
 public:
  TaitankLayoutNode() { Allocate(); }

  TaitankLayoutNode(HPNodeRef engine_node_) : engine_node_(engine_node_){};

  ~TaitankLayoutNode() { Deallocate(); };

  /**
   * @brief 执行排版
   * @param parent_width 父节点宽度
   * @param parent_height 父节点高度
   * @param direction 布局方向
   * @param layout_context context
   */
  void CalculateLayout(float parent_width, float parent_height, Direction direction = DirectionLTR,
                       void* layout_context = nullptr) override;

  /**
   * @brief 设置 Taitank Layout 的属性
   * @param style_map 属性的map
   */
  void SetLayoutStyles(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) override;

  /**
   * @brief 设置宽度
   * @param width 宽度
   */
  void SetWidth(float width) override;

  /**
   * @brief 设置高度
   * @param height 高度
   */
  void SetHeight(float height) override;
  /**
   * @brief 设置测量函数
   * @param measure_function 测量函数
   * @return 是否成功
   */
  bool SetMeasureFunction(TaitankMeasureFunction measure_function);

  /**
   * @brief 获取 left 属性
   * @return left 属性
   */
  float GetLeft();

  /**
   * @brief 获取 top 属性
   * @return top 属性
   */
  float GetTop();

  /**
   * @brief 获取 right 属性
   * @return right 属性
   */
  float GetRight();

  /**
   * @brief 获取 bottom 属性
   * @return bottom 属性
   */
  float GetBottom();

  /**
   * @brief 获取 width 属性
   * @return width 属性
   */
  float GetWidth() override;

  /**
   * @brief 获取 height 属性
   * @return height 属性
   */
  float GetHeight() override;

  /**
   * @brief 获取 margin 属性
   * @param css_direction
   * @return left 属性
   */
  float GetMargin(TaitankCssDirection css_direction);

  /**
   * @brief 获取 padding 属性
   * @param css_direction
   * @return padding 属性
   */
  float GetPadding(TaitankCssDirection css_direction);

  /**
   * @brief 获取 border 属性
   * @param css_direction
   * @return border 属性
   */
  float GetBorder(TaitankCssDirection css_direction);

  /**
   * @brief 是否 overflow
   * @param overflow
   * @return border 属性
   */
  bool LayoutHadOverflow();

  /**
   * @brief 获取 taitank engine node pointer
   * @return HPNodeRef 属性
   */
  HPNodeRef GetLayoutEngineNodeRef() { return engine_node_; }

  /**
   * @brief 插入子节点
   * @param child
   * @param index
   */
  void InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) override;

  /**
   * @brief 删除子节点
   * @param child
   */
  void RemoveChild(const std::shared_ptr<LayoutNode> child) override;

  /**
   * @brief 是否有新的布局
   * @return 是否有新的布局
   */
  bool HasNewLayout();

  /**
   * @brief 设置 has new layout 属性
   * @param has_new_layout
   */
  void SetHasNewLayout(bool has_new_layout);

  /**
   * @brief 节点标脏
   */
  void MarkDirty();

  /**
   * @brief 是否脏节点
   * @return 是否脏节点
   */
  bool IsDirty();

  /**
   * @brief 打印节点信息
   */
  void Print();

  /**
   * @brief 重置节点
   */
  bool Reset();

 private:
  /**
   * @brief 解析属性
   */
  void Parser(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map);

  /**
   * @brief 设置方向
   * @param direction 方向(DirectionInherit|DirectionLTR|DirectionRTL)
   */
  void SetDirection(HPDirection direction);


  /**
   * @brief 设置 max width 属性
   * @param max_width 最大宽度
   */
  void SetMaxWidth(float max_width);

  /**
   * @brief 设置 max height 属性
   * @param max_height 最大高度
   */
  void SetMaxHeight(float max_height);

  /**
   * @brief 设置 min width 属性
   * @param min_width 最小宽度
   */
  void SetMinWidth(float min_width);

  /**
   * @brief 设置 min height 属性
   * @param min_height 最小高度
   */
  void SetMinHeight(float min_height);

  /**
   * @brief 设置 flex basis 属性
   * @param flex basis
   */
  void SetFlexBasis(float flex_basis);

  /**
   * @brief 设置flex属性
   * @param flex 属性
   */
  void SetFlex(float flex);

  /**
   * @brief 设置 flex grow属性
   * @param flex grow
   */
  void SetFlexGrow(float flex_grow);

  /**
   * @brief 设置 flex shrink属性
   * @param flex shrink
   */
  void SetFlexShrink(float flex_shrink);

  /**
   * @brief 设置 flex direction 属性
   * @param flex direction (FLexDirectionRow|FLexDirectionRowReverse|FLexDirectionColumn|FLexDirectionColumnReverse)
   */
  void SetFlexDirection(FlexDirection flex_direction);

  /**
   * @brief 设置 position type 属性
   * @param position_type（PositionTypeRelative|PositionTypeAbsolute)
   */
  void SetPositionType(PositionType position_type);

  /**
   * @brief 设置 position 属性
   * @param css_direction（CSSLeft|CSSTop|CSSRight|CSSBottom|CSSStart|CSSEnd)
   * @param position
   */
  void SetPosition(CSSDirection css_direction, float position);

  /**
   * @brief 设置 margin 属性
   * @param css_direction
   * @param margin
   */
  void SetMargin(CSSDirection css_direction, float margin);

  /**
   * @brief 设置 margin auto属性
   * @param css_direction
   */
  void SetMarginAuto(CSSDirection css_direction);

  /**
   * @brief 设置 padding 属性
   * @param css_direction
   * @param padding
   */
  void SetPadding(CSSDirection css_direction, float padding);

  /**
   * @brief 设置 border 属性
   * @param css_direction
   * @param border
   */
  void SetBorder(CSSDirection css_direction, float border);

  /**
   * @brief 设置 flex wrap 属性
   * @param wrap_mode (FlexNoWrap|FlexWrap|FlexWrapReverse)
   */
  void SetFlexWrap(FlexWrapMode wrap_mode);

  /**
   * @brief 设置 justify content 属性
   * @param justify
   */
  void SetJustifyContent(FlexAlign justify);

  /**
   * @brief 设置 align content 属性
   * @param align_content
   */
  void SetAlignContent(FlexAlign align_content);

  /**
   * @brief 设置 align items 属性
   * @param align_items
   */
  void SetAlignItems(FlexAlign align_items);

  /**
   * @brief 设置 align self 属性
   * @param align_self
   */
  void SetAlignSelf(FlexAlign align_self);

  /**
   * @brief 设置 display 属性
   * @param display_type (DisplayTypeFlex|DisplayTypeNone)
   */
  void SetDisplay(DisplayType display_type);

  /**
   * @brief 设置 node type 属性
   * @param node_type (NodeTypeDefault|NodeTypeText)
   */
  void SetNodeType(NodeType node_type);

  /**
   * @brief 设置 overflow 属性
   * @param overflow_type (OverflowVisible|OverflowHidden|OverflowScroll)
   */
  void SetOverflow(OverflowType overflow_type);

  /**
   * @brief 分配节点
   * @param overflow_type (OverflowVisible|OverflowHidden|OverflowScroll)
   */
  void Allocate();

  /**
   * @brief 释放节点
   */
  void Deallocate();

 private:
  std::weak_ptr<TaitankLayoutNode> parent_;
  std::vector<std::shared_ptr<TaitankLayoutNode>> children_;

  HPNodeRef engine_node_;
};

}  // namespace dom
}  // namespace hippy
