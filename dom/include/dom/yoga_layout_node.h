#pragma once

#include "Yoga.h"

#include "dom/layout_node.h"

namespace hippy {
inline namespace dom {

class YogaLayoutNode : public LayoutNode, public std::enable_shared_from_this<YogaLayoutNode> {
 public:
  YogaLayoutNode();

  virtual ~YogaLayoutNode();

  void CalculateLayout(float parent_width, float parent_height, Direction direction = Direction::RTL,
                       void* layout_context = nullptr) override;

  void SetLayoutStyles(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) override;

  void SetWidth(float width) override;

  void SetHeight(float height) override;

  void SetScaleFactor(float sacle_factor) override;

  void SetMeasureFunction(MeasureFunction measure_function) override;

  float GetLeft() override;

  float GetTop() override;

  float GetRight() override;

  float GetBottom() override;

  float GetWidth() override;

  float GetHeight() override;

  float GetMargin(Edge edge) override;

  float GetPadding(Edge edge) override;

  float GetBorder(Edge edge) override;

  void SetPosition(Edge edge, float position) override; 

  bool LayoutHadOverflow();

  YGNodeRef GetLayoutEngineNodeRef() { return yoga_node_; }

  void InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) override;

  void RemoveChild(const std::shared_ptr<LayoutNode> child) override;

  bool HasNewLayout() override;

  void SetHasNewLayout(bool has_new_layout) override;

  void MarkDirty() override;

  bool IsDirty();

  void Reset();

  int64_t GetKey() { return key_; }

 private:
  void Parser(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map);

  void SetYGWidth(std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetYGHeight(std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetDirection(YGDirection direction);

  void SetYGMaxWidth(std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetYGMaxHeight(std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetYGMinWidth(std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetYGMinHeight(std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetFlexBasis(float flex_basis);

  void SetFlex(float flex);

  void SetFlexGrow(float flex_grow);

  void SetFlexShrink(float flex_shrink);

  void SetFlexDirection(YGFlexDirection flex_direction);

  void SetPositionType(YGPositionType position_type);

  void SetYGPosition(YGEdge edge, std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetYGMargin(YGEdge edge, std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetYGPadding(YGEdge edge, std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetYGBorder(YGEdge edge, std::shared_ptr<tdf::base::DomValue> dom_value);

  void SetFlexWrap(YGWrap wrap_mode);

  void SetJustifyContent(YGJustify justify);

  void SetAlignContent(YGAlign align_content);

  void SetAlignItems(YGAlign align_items);

  void SetAlignSelf(YGAlign align_self);

  void SetDisplay(YGDisplay display_type);

  void SetOverflow(YGOverflow overflow);

  void Allocate();

  void Deallocate();

 private:
  std::weak_ptr<YogaLayoutNode> parent_;
  std::vector<std::shared_ptr<YogaLayoutNode>> children_;

  YGNodeRef yoga_node_;
  YGConfigRef yoga_config_;
  int64_t key_;
};

}  // namespace dom
}  // namespace hippy
