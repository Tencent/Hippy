#include "dom/layout_node.h"

namespace hippy {
inline namespace dom {

void LayoutNode::SetDirection(HPDirection direction) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.direction == direction) return;
  engine_node_->style.direction = direction;
  engine_node_->markAsDirty();
}

void LayoutNode::SetWidth(float width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.dim[DimWidth], width)) {
    return;
  }
  engine_node_->style.dim[DimWidth] = width;
  engine_node_->markAsDirty();
}

void LayoutNode::SetHeight(float height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.dim[DimHeight], height)) return;
  engine_node_->style.dim[DimHeight] = height;
  engine_node_->markAsDirty();
}

void LayoutNode::SetMaxWidth(float max_width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.maxDim[DimWidth], max_width)) return;
  engine_node_->style.maxDim[DimWidth] = max_width;
  engine_node_->markAsDirty();
}

void LayoutNode::SetMaxHeight(float max_height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.maxDim[DimHeight], max_height)) return;
  engine_node_->style.maxDim[DimHeight] = max_height;
  engine_node_->markAsDirty();
}

void LayoutNode::SetMinWidth(float min_width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.minDim[DimWidth], min_width)) return;
  engine_node_->style.minDim[DimWidth] = min_width;
  engine_node_->markAsDirty();
}

void LayoutNode::SetMinHeight(float min_height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.minDim[DimHeight], min_height)) return;
  engine_node_->style.minDim[DimHeight] = min_height;
  engine_node_->markAsDirty();
}

bool LayoutNode::SetMeasureFunction(HPMeasureFunc measure_function) {
  assert(engine_node_ != nullptr);
  return engine_node_->setMeasureFunc(measure_function);
}

void LayoutNode::SetFlexBasis(float flex_basis) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.flexBasis, flex_basis)) return;
  engine_node_->style.flexBasis = flex_basis;
  engine_node_->markAsDirty();
}

void LayoutNode::SetFlex(float flex) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.flex, flex)) return;
  if (FloatIsEqual(flex, 0.0f)) {
    SetFlexGrow(0.0f);
    SetFlexShrink(0.0f);
  } else if (flex > 0.0f) {
    SetFlexGrow(flex);
    SetFlexShrink(1.0f);
  } else {
    SetFlexGrow(0.0f);
    SetFlexShrink(-flex);
  }
  engine_node_->style.flex = flex;
  engine_node_->markAsDirty();
}

void LayoutNode::SetFlexGrow(float flex_grow) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.flexGrow, flex_grow)) return;
  engine_node_->style.flexGrow = flex_grow;
  engine_node_->markAsDirty();
}

void LayoutNode::SetFlexShrink(float flex_shrink) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.flexShrink, flex_shrink)) return;
  engine_node_->style.flexShrink = flex_shrink;
  engine_node_->markAsDirty();
}

void LayoutNode::SetFlexDirection(FlexDirection flex_direction) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.flexDirection == flex_direction) return;
  engine_node_->style.flexDirection = flex_direction;
  engine_node_->markAsDirty();
}

void LayoutNode::SetPositionType(PositionType position_type) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.positionType == position_type) return;
  engine_node_->style.positionType = position_type;
  engine_node_->markAsDirty();
}

void LayoutNode::SetPosition(CSSDirection css_direction, float position) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.position[css_direction], position)) return;
  if (engine_node_->style.setPosition(css_direction, position)) {
    engine_node_->markAsDirty();
  }
}

void LayoutNode::SetMargin(CSSDirection css_direction, float margin) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.setMargin(css_direction, margin)) {
    engine_node_->markAsDirty();
  }
}

void LayoutNode::SetMarginAuto(CSSDirection css_direction) { SetMargin(css_direction, VALUE_AUTO); }

void LayoutNode::SetPadding(CSSDirection css_direction, float padding) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.setPadding(css_direction, padding)) {
    engine_node_->markAsDirty();
  }
}

void LayoutNode::SetBorder(CSSDirection css_direction, float border) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.setBorder(css_direction, border)) {
    engine_node_->markAsDirty();
  }
}

void LayoutNode::SetFlexWrap(FlexWrapMode wrap_mode) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.flexWrap == wrap_mode) return;

  engine_node_->style.flexWrap = wrap_mode;
  engine_node_->markAsDirty();
}

void LayoutNode::SetJustifyContent(FlexAlign justify) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.justifyContent == justify) return;
  engine_node_->style.justifyContent = justify;
  engine_node_->markAsDirty();
}

void LayoutNode::SetAlignContent(FlexAlign align_content) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.alignContent == align_content) return;
  engine_node_->style.alignContent = align_content;
  engine_node_->markAsDirty();
}

void LayoutNode::SetAlignItems(FlexAlign align_items) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.alignItems == align_items) return;
  engine_node_->style.alignItems = align_items;
  engine_node_->markAsDirty();
}

void LayoutNode::SetAlignSelf(FlexAlign align_self) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.alignSelf == align_self) return;
  engine_node_->style.alignSelf = align_self;
  engine_node_->markAsDirty();
}

void LayoutNode::SetDisplay(DisplayType display_type) {
  assert(engine_node_ != nullptr);
  engine_node_->setDisplayType(display_type);
}

void LayoutNode::SetNodeType(NodeType node_type) {
  assert(engine_node_ != nullptr);
  if (node_type == engine_node_->style.nodeType) return;
  engine_node_->style.nodeType = node_type;
}

void LayoutNode::SetOverflow(OverflowType overflow_type) {
  assert(engine_node_ != nullptr);
  if (overflow_type == engine_node_->style.overflowType) return;
  engine_node_->style.overflowType = overflow_type;
  engine_node_->markAsDirty();
}

float LayoutNode::GetLeft() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSLeft];
}

float LayoutNode::GetTop() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSTop];
}

float LayoutNode::GetRight() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSRight];
}

float LayoutNode::GetBottom() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSBottom];
}

float LayoutNode::GetWidth() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.dim[DimWidth];
}

float LayoutNode::GetHeight() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.dim[DimHeight];
}

float LayoutNode::GetMargin(CSSDirection css_direction) {
  assert(engine_node_ != nullptr);
  if (css_direction > CSSBottom) return 0;
  return engine_node_->result.margin[css_direction];
}

float LayoutNode::GetPadding(CSSDirection css_direction) {
  assert(engine_node_ != nullptr);
  if (css_direction > CSSBottom) return 0;
  return engine_node_->result.padding[css_direction];
}

float LayoutNode::GetBorder(CSSDirection css_direction) {
  assert(engine_node_ != nullptr);
  if (css_direction > CSSBottom) return 0;
  return engine_node_->result.border[css_direction];
}

bool LayoutNode::LayoutHadOverflow() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.hadOverflow;
}

void LayoutNode::InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) {
  assert(engine_node_ != nullptr);
  assert(child->GetLayoutEngineNodeRef() != nullptr);
  engine_node_->insertChild(child->GetLayoutEngineNodeRef(), index);
  children_.insert(children_.begin() + index, child);
  child->parent_ = shared_from_this();
}

void LayoutNode::RemoveChild(const std::shared_ptr<LayoutNode> child) {
  assert(engine_node_ != nullptr);
  assert(child->GetLayoutEngineNodeRef() != nullptr);
  engine_node_->removeChild(child->GetLayoutEngineNodeRef());
  auto iter = std::find(children_.begin(), children_.end(), child);
  if (iter != children_.end()) {
    children_.erase(iter);
    child->parent_ = nullptr;
  }
}

bool LayoutNode::HasNewLayout() {
  assert(engine_node_ != nullptr);
  return engine_node_->hasNewLayout();
}

void LayoutNode::SetHasNewLayout(bool has_new_layout) {
  assert(engine_node_ != nullptr);
  engine_node_->setHasNewLayout(has_new_layout);
}

void LayoutNode::MarkDirty() {
  assert(engine_node_ != nullptr);
  engine_node_->markAsDirty();
}

bool LayoutNode::IsDirty() {
  assert(engine_node_ != nullptr);
  return engine_node_->isDirty;
}

void LayoutNode::DoLayout(float parent_width, float parent_height, HPDirection direction, void* layout_context) {
  assert(engine_node_ != nullptr);
  engine_node_->layout(parent_width, parent_height, direction, layout_context);
}

void LayoutNode::Print() {
  assert(engine_node_ != nullptr);
  engine_node_->printNode();
}

bool LayoutNode::Reset() {
  assert(engine_node_ != nullptr);
  if (engine_node_->childCount() != 0 || engine_node_->getParent() != nullptr) return false;
  return engine_node_->reset();
}

void LayoutNode::Allocate() {
  engine_node_ = new HPNode();
}

void LayoutNode::Deallocate() {
  if (engine_node_ == nullptr) return;
  delete engine_node_;
}

}  // namespace dom
}  // namespace hippy