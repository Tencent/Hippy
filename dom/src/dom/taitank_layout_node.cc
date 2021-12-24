#include "dom/taitank_layout_node.h"

#include "base/logging.h"
#include "dom/node_props.h"

namespace hippy {
inline namespace dom {

static OverflowType GetFlexOverflow(const std::string& overflow) {
  if (overflow == "visible") {
    return OverflowType::OverflowVisible;
  }
  if (overflow == "hidden") {
    return OverflowType::OverflowHidden;
  }
  if (overflow == "scroll") {
    return OverflowType::OverflowScroll;
  }
  return OverflowType::OverflowVisible;
}

static FlexDirection GetFlexDirection(const std::string& flex_direction) {
  if (flex_direction == "row") {
    return FlexDirection::FLexDirectionRow;
  }
  if (flex_direction == "row-reverse") {
    return FlexDirection::FLexDirectionRowReverse;
  }
  if (flex_direction == "column") {
    return FlexDirection::FLexDirectionColumn;
  }
  if (flex_direction == "column-reverse") {
    return FlexDirection::FLexDirectionColumnReverse;
  }
  return FlexDirection::FLexDirectionColumn;
}

static FlexWrapMode GetFlexWrapMode(const std::string& wrap_mode) {
  if (wrap_mode == "nowrap") {
    return FlexWrapMode::FlexNoWrap;
  } else if (wrap_mode == "wrap") {
    return FlexWrapMode::FlexWrap;
  } else if (wrap_mode == "wrap-reverse") {
    return FlexWrapMode::FlexWrapReverse;
  }

  // error wrap mode
  return FlexWrapMode::FlexNoWrap;
}

static FlexAlign GetFlexJustify(const std::string& justify_content) {
  if (justify_content == "flex-start") {
    return FlexAlign::FlexAlignStart;
  }
  if (justify_content == "center") {
    return FlexAlign::FlexAlignCenter;
  }
  if (justify_content == "flex-end") {
    return FlexAlign::FlexAlignEnd;
  }
  if (justify_content == "space-between") {
    return FlexAlign::FlexAlignSpaceBetween;
  }
  if (justify_content == "space-around") {
    return FlexAlign::FlexAlignSpaceEvenly;
  }
  return FlexAlign::FlexAlignStart;
}

static FlexAlign GetFlexAlign(const std::string& align) {
  if (align == "auto") {
    return FlexAlign::FlexAlignAuto;
  }
  if (align == "flex-start") {
    return FlexAlign::FlexAlignStart;
  }
  if (align == "center") {
    return FlexAlign::FlexAlignCenter;
  }
  if (align == "flex-end") {
    return FlexAlign::FlexAlignEnd;
  }
  if (align == "stretch") {
    return FlexAlign::FlexAlignStretch;
  }
  if (align == "baseline") {
    return FlexAlign::FlexAlignBaseline;
  }
  if (align == "space-between") {
    return FlexAlign::FlexAlignSpaceBetween;
  }
  if (align == "space-around") {
    return FlexAlign::FlexAlignSpaceAround;
  }
  return FlexAlign::FlexAlignStretch;
}

static CSSDirection GetCSSDirection(const std::string& direction) {
  if (direction == kMargin || direction == kPadding) {
    return CSSDirection::CSSAll;
  }
  if (direction == kMarginVertical || direction == kPaddingVertical) {
    return CSSDirection::CSSVertical;
  }
  if (direction == kMarginHorizontal || direction == kPaddingHorizontal) {
    return CSSDirection::CSSHorizontal;
  }
  if (direction == kMarginLeft || direction == kPaddingLeft || direction == kLeft) {
    return CSSDirection::CSSLeft;
  }
  if (direction == kMarginTop || direction == kPaddingTop || direction == kTop) {
    return CSSDirection::CSSTop;
  }
  if (direction == kMarginRight || direction == kPaddingRight || direction == kRight) {
    return CSSDirection::CSSRight;
  }
  if (direction == kMarginBottom || direction == kPaddingBottom || direction == kBottom) {
    return CSSDirection::CSSBottom;
  }
  return CSSDirection::CSSNONE;
}

static PositionType GetPositionType(const std::string& position) {
  if (position == "relative") {
    return PositionType::PositionTypeRelative;
  }
  if (position == "absolute") {
    return PositionType::PositionTypeAbsolute;
  }
  return PositionType::PositionTypeRelative;
}

static DisplayType GetDisplayType(const std::string& display) {
  if (display == "none") {
    return DisplayType::DisplayTypeNone;
  }
  return DisplayType::DisplayTypeFlex;
}

void TaitankLayoutNode::CalculateLayout(float parent_width, float parent_height, Direction direction,
                                        void* layout_context) {
  assert(engine_node_ != nullptr);
  engine_node_->layout(parent_width, parent_height, engine_node_->GetConfig(), direction, layout_context);
}

void TaitankLayoutNode::SetLayoutStyles(
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) {
  Parser(style_map);
}

void TaitankLayoutNode::Parser(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) {
  if (style_map.find(kAlignItems) != style_map.end()) {
    SetAlignItems(GetFlexAlign(style_map.find(kAlignItems)->second->ToString()));
  }
  if (style_map.find(kAilgnSelf) != style_map.end()) {
    SetAlignSelf(GetFlexAlign(style_map.find(kAilgnSelf)->second->ToString()));
  }
  if (style_map.find(kAlignContent) != style_map.end()) {
    SetAlignContent(GetFlexAlign(style_map.find(kAlignContent)->second->ToString()));
  }
  if (style_map.find(kFlex) != style_map.end()) {
    SetFlex(static_cast<float>(style_map.find(kFlex)->second->ToDouble()));
  }
  if (style_map.find(kFlexDirection) != style_map.end()) {
    SetFlexDirection(GetFlexDirection(style_map.find(kFlexDirection)->second->ToString()));
  }
  if (style_map.find(kFlexWrap) != style_map.end()) {
    SetFlexWrap(GetFlexWrapMode(style_map.find(kFlexWrap)->second->ToString()));
  }
  if (style_map.find(kFlexGrow) != style_map.end()) {
    SetFlexGrow(static_cast<float>(style_map.find(kFlexGrow)->second->ToDouble()));
  }
  if (style_map.find(kFlexShrink) != style_map.end()) {
    SetFlexShrink(static_cast<float>(style_map.find(kFlexShrink)->second->ToDouble()));
  }
  if (style_map.find(kFlexBasis) != style_map.end()) {
    SetFlexBasis(static_cast<float>(style_map.find(kFlexBasis)->second->ToDouble()));
  }
  if (style_map.find(kWidth) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kWidth)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float width =
        style_map.find(kWidth)->second->IsNumber() ? static_cast<float>(style_map.find(kWidth)->second->ToDouble()) : 0;
    SetWidth(width);
  }
  if (style_map.find(kHeight) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kHeight)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float height = style_map.find(kHeight)->second->IsNumber()
                       ? static_cast<float>(style_map.find(kHeight)->second->ToDouble())
                       : 0;
    SetHeight(height);
  }
  if (style_map.find(kMaxWidth) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMaxWidth)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float max_width = style_map.find(kMaxWidth)->second->IsNumber()
                          ? static_cast<float>(style_map.find(kMaxWidth)->second->ToDouble())
                          : 0;
    SetMaxWidth(max_width);
  }
  if (style_map.find(kMaxHeight) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMaxHeight)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float max_height = style_map.find(kMaxHeight)->second->IsNumber()
                           ? static_cast<float>(style_map.find(kMaxHeight)->second->ToDouble())
                           : 0;
    SetMaxHeight(max_height);
  }
  if (style_map.find(kMinWidth) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMinWidth)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float min_width = style_map.find(kMinWidth)->second->IsNumber()
                          ? static_cast<float>(style_map.find(kMinWidth)->second->ToDouble())
                          : 0;
    SetMinWidth(min_width);
  }
  if (style_map.find(kMinHeight) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMinHeight)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float min_height = style_map.find(kMinHeight)->second->IsNumber()
                           ? static_cast<float>(style_map.find(kMinHeight)->second->ToDouble())
                           : 0;
    SetMinHeight(min_height);
  }
  if (style_map.find(kJustifyContent) != style_map.end()) {
    SetJustifyContent(GetFlexJustify(style_map.find(kJustifyContent)->second->ToString()));
  }
  if (style_map.find(kLeft) != style_map.end()) {
    float left =
        style_map.find(kLeft)->second->IsNumber() ? static_cast<float>(style_map.find(kLeft)->second->ToDouble()) : 0;
    SetPosition(GetCSSDirection(kLeft), left);
  }
  if (style_map.find(kRight) != style_map.end()) {
    float right =
        style_map.find(kRight)->second->IsNumber() ? static_cast<float>(style_map.find(kRight)->second->ToDouble()) : 0;
    SetPosition(GetCSSDirection(kRight), right);
  }
  if (style_map.find(kTop) != style_map.end()) {
    float top =
        style_map.find(kTop)->second->IsNumber() ? static_cast<float>(style_map.find(kTop)->second->ToDouble()) : 0;
    SetPosition(GetCSSDirection(kTop), top);
  }
  if (style_map.find(kBottom) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kBottom)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float bottom = style_map.find(kBottom)->second->IsNumber()
                       ? static_cast<float>(style_map.find(kBottom)->second->ToDouble())
                       : 0;
    SetPosition(GetCSSDirection(kBottom), bottom);
  }
  if (style_map.find(kPosition) != style_map.end()) {
    SetPositionType(GetPositionType(style_map.find(kPosition)->second->ToString()));
  }
  if (style_map.find(kDisplay) != style_map.end()) {
    SetDisplay(GetDisplayType(style_map.find(kDisplay)->second->ToString()));
  }
  if (style_map.find(kOverflow) != style_map.end()) {
    SetOverflow(GetFlexOverflow(style_map.find(kOverflow)->second->ToString()));
  }
  if (style_map.find(kMargin) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMargin)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float margin = style_map.find(kMargin)->second->IsNumber()
                       ? static_cast<float>(style_map.find(kMargin)->second->ToDouble())
                       : 0;
    SetMargin(GetCSSDirection(kMargin), margin);
  }
  if (style_map.find(kMarginVertical) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMarginVertical)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float margin_vertical = style_map.find(kMarginVertical)->second->IsNumber()
                                ? static_cast<float>(style_map.find(kMarginVertical)->second->ToDouble())
                                : 0;
    SetMargin(GetCSSDirection(kMarginVertical), margin_vertical);
  }
  if (style_map.find(kMarginHorizontal) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMarginHorizontal)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float margin_horizontal = style_map.find(kMarginHorizontal)->second->IsNumber()
                                  ? static_cast<float>(style_map.find(kMarginHorizontal)->second->ToDouble())
                                  : 0;
    SetMargin(GetCSSDirection(kMarginHorizontal), margin_horizontal);
  }
  if (style_map.find(kMarginLeft) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMarginLeft)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float margin_left = style_map.find(kMarginLeft)->second->IsNumber()
                            ? static_cast<float>(style_map.find(kMarginLeft)->second->ToDouble())
                            : 0;
    SetMargin(GetCSSDirection(kMarginLeft), margin_left);
  }
  if (style_map.find(kMarginTop) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMarginTop)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float margin_top = style_map.find(kMarginTop)->second->IsNumber()
                           ? static_cast<float>(style_map.find(kMarginTop)->second->ToDouble())
                           : 0;
    SetMargin(GetCSSDirection(kMarginTop), margin_top);
  }
  if (style_map.find(kMarginRight) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMarginRight)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float margin_right = style_map.find(kMarginRight)->second->IsNumber()
                             ? static_cast<float>(style_map.find(kMarginRight)->second->ToDouble())
                             : 0;
    SetMargin(GetCSSDirection(kMarginRight), margin_right);
  }
  if (style_map.find(kMarginBottom) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kMarginBottom)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float margin_bottom = style_map.find(kMarginBottom)->second->IsNumber()
                              ? static_cast<float>(style_map.find(kMarginBottom)->second->ToDouble())
                              : 0;
    SetMargin(GetCSSDirection(kMarginBottom), margin_bottom);
  }
  if (style_map.find(kPadding) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kPadding)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float padding = style_map.find(kPadding)->second->IsNumber()
                        ? static_cast<float>(style_map.find(kPadding)->second->ToDouble())
                        : 0;
    SetPadding(GetCSSDirection(kPadding), padding);
  }
  if (style_map.find(kPaddingVertical) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kPaddingVertical)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float padding_vertical = style_map.find(kPaddingVertical)->second->IsNumber()
                                 ? static_cast<float>(style_map.find(kPaddingVertical)->second->ToDouble())
                                 : 0;
    SetPadding(GetCSSDirection(kPaddingVertical), padding_vertical);
  }
  if (style_map.find(kPaddingHorizontal) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kPaddingHorizontal)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float padding_horizontal = style_map.find(kPaddingHorizontal)->second->IsNumber()
                                   ? static_cast<float>(style_map.find(kPaddingHorizontal)->second->ToDouble())
                                   : 0;
    SetPadding(GetCSSDirection(kPaddingHorizontal), padding_horizontal);
  }
  if (style_map.find(kPaddingLeft) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kPaddingLeft)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float padding_left = style_map.find(kPaddingLeft)->second->IsNumber()
                             ? static_cast<float>(style_map.find(kPaddingLeft)->second->ToDouble())
                             : 0;
    SetPadding(GetCSSDirection(kPaddingLeft), padding_left);
  }
  if (style_map.find(kPaddingTop) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kPaddingTop)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float padding_top = style_map.find(kPaddingTop)->second->IsNumber()
                            ? static_cast<float>(style_map.find(kPaddingTop)->second->ToDouble())
                            : 0;
    SetPadding(GetCSSDirection(kPaddingTop), padding_top);
  }
  if (style_map.find(kPaddingRight) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kPaddingRight)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float padding_right = style_map.find(kPaddingRight)->second->IsNumber()
                              ? static_cast<float>(style_map.find(kPaddingRight)->second->ToDouble())
                              : 0;
    SetPadding(GetCSSDirection(kPaddingRight), padding_right);
  }
  if (style_map.find(kPaddingBottom) != style_map.end()) {
    tdf::base::DomValue::Type type = style_map.find(kPaddingBottom)->second->GetType();
    TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
    float padding_bottom = style_map.find(kPaddingBottom)->second->IsNumber()
                               ? static_cast<float>(style_map.find(kPaddingBottom)->second->ToDouble())
                               : 0;
    SetPadding(GetCSSDirection(kPaddingBottom), padding_bottom);
  }
}

bool TaitankLayoutNode::SetMeasureFunction(TaitankMeasureFunction measure_function) {
  assert(engine_node_ != nullptr);
  return engine_node_->setMeasureFunc(measure_function);
}

float TaitankLayoutNode::GetLeft() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSLeft];
}

float TaitankLayoutNode::GetTop() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSTop];
}

float TaitankLayoutNode::GetRight() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSRight];
}

float TaitankLayoutNode::GetBottom() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.position[CSSBottom];
}

float TaitankLayoutNode::GetWidth() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.dim[DimWidth];
}

float TaitankLayoutNode::GetHeight() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.dim[DimHeight];
}

float TaitankLayoutNode::GetMargin(TaitankCssDirection css_direction) {
  assert(engine_node_ != nullptr);
  if (css_direction > CSSBottom) return 0;
  return engine_node_->result.margin[css_direction];
}

float TaitankLayoutNode::GetPadding(TaitankCssDirection css_direction) {
  assert(engine_node_ != nullptr);
  if (css_direction > CSSBottom) return 0;
  return engine_node_->result.padding[css_direction];
}

float TaitankLayoutNode::GetBorder(TaitankCssDirection css_direction) {
  assert(engine_node_ != nullptr);
  if (css_direction > CSSBottom) return 0;
  return engine_node_->result.border[css_direction];
}

bool TaitankLayoutNode::LayoutHadOverflow() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.hadOverflow;
}

void TaitankLayoutNode::InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) {
  assert(engine_node_ != nullptr);
  auto node = std::static_pointer_cast<TaitankLayoutNode>(child);
  assert(node->GetLayoutEngineNodeRef() != nullptr);
  engine_node_->insertChild(node->GetLayoutEngineNodeRef(), index);
  children_.insert(children_.begin() + index, node);
  node->parent_ = shared_from_this();
}

void TaitankLayoutNode::RemoveChild(const std::shared_ptr<LayoutNode> child) {
  assert(engine_node_ != nullptr);
  auto node = std::static_pointer_cast<TaitankLayoutNode>(child);
  assert(node->GetLayoutEngineNodeRef() != nullptr);
  engine_node_->removeChild(node->GetLayoutEngineNodeRef());
  auto iter = std::find(children_.begin(), children_.end(), node);
  if (iter != children_.end()) {
    children_.erase(iter);
  }
}

bool TaitankLayoutNode::HasNewLayout() {
  assert(engine_node_ != nullptr);
  return engine_node_->hasNewLayout();
}

void TaitankLayoutNode::SetHasNewLayout(bool has_new_layout) {
  assert(engine_node_ != nullptr);
  engine_node_->setHasNewLayout(has_new_layout);
}

void TaitankLayoutNode::MarkDirty() {
  assert(engine_node_ != nullptr);
  engine_node_->markAsDirty();
}

bool TaitankLayoutNode::IsDirty() {
  assert(engine_node_ != nullptr);
  return engine_node_->isDirty;
}

void TaitankLayoutNode::Print() {
  assert(engine_node_ != nullptr);
  engine_node_->printNode();
}

bool TaitankLayoutNode::Reset() {
  assert(engine_node_ != nullptr);
  if (engine_node_->childCount() != 0 || engine_node_->getParent() != nullptr) return false;
  return engine_node_->reset();
}

void TaitankLayoutNode::SetDirection(HPDirection direction) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.direction == direction) return;
  engine_node_->style.direction = direction;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetWidth(float width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.dim[DimWidth], width)) {
    return;
  }
  engine_node_->style.dim[DimWidth] = width;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetHeight(float height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.dim[DimHeight], height)) return;
  engine_node_->style.dim[DimHeight] = height;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetScaleFactor(float sacle_factor) {
  assert(engine_node_ != nullptr);
  HPConfigRef config = engine_node_->GetConfig();
  config->SetScaleFactor(sacle_factor);
}

void TaitankLayoutNode::SetMaxWidth(float max_width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.maxDim[DimWidth], max_width)) return;
  engine_node_->style.maxDim[DimWidth] = max_width;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetMaxHeight(float max_height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.maxDim[DimHeight], max_height)) return;
  engine_node_->style.maxDim[DimHeight] = max_height;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetMinWidth(float min_width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.minDim[DimWidth], min_width)) return;
  engine_node_->style.minDim[DimWidth] = min_width;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetMinHeight(float min_height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.minDim[DimHeight], min_height)) return;
  engine_node_->style.minDim[DimHeight] = min_height;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetFlexBasis(float flex_basis) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.flexBasis, flex_basis)) return;
  engine_node_->style.flexBasis = flex_basis;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetFlex(float flex) {
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

void TaitankLayoutNode::SetFlexGrow(float flex_grow) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.flexGrow, flex_grow)) return;
  engine_node_->style.flexGrow = flex_grow;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetFlexShrink(float flex_shrink) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.flexShrink, flex_shrink)) return;
  engine_node_->style.flexShrink = flex_shrink;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetFlexDirection(FlexDirection flex_direction) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.flexDirection == flex_direction) return;
  engine_node_->style.flexDirection = flex_direction;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetPositionType(PositionType position_type) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.positionType == position_type) return;
  engine_node_->style.positionType = position_type;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetPosition(CSSDirection css_direction, float position) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style.position[css_direction], position)) return;
  if (engine_node_->style.setPosition(css_direction, position)) {
    engine_node_->markAsDirty();
  }
}

void TaitankLayoutNode::SetMargin(CSSDirection css_direction, float margin) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.setMargin(css_direction, margin)) {
    engine_node_->markAsDirty();
  }
}

void TaitankLayoutNode::SetMarginAuto(CSSDirection css_direction) { SetMargin(css_direction, VALUE_AUTO); }

void TaitankLayoutNode::SetPadding(CSSDirection css_direction, float padding) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.setPadding(css_direction, padding)) {
    engine_node_->markAsDirty();
  }
}

void TaitankLayoutNode::SetBorder(CSSDirection css_direction, float border) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.setBorder(css_direction, border)) {
    engine_node_->markAsDirty();
  }
}

void TaitankLayoutNode::SetFlexWrap(FlexWrapMode wrap_mode) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.flexWrap == wrap_mode) return;

  engine_node_->style.flexWrap = wrap_mode;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetJustifyContent(FlexAlign justify) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.justifyContent == justify) return;
  engine_node_->style.justifyContent = justify;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetAlignContent(FlexAlign align_content) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.alignContent == align_content) return;
  engine_node_->style.alignContent = align_content;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetAlignItems(FlexAlign align_items) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.alignItems == align_items) return;
  engine_node_->style.alignItems = align_items;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetAlignSelf(FlexAlign align_self) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style.alignSelf == align_self) return;
  engine_node_->style.alignSelf = align_self;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::SetDisplay(DisplayType display_type) {
  assert(engine_node_ != nullptr);
  engine_node_->setDisplayType(display_type);
}

void TaitankLayoutNode::SetNodeType(NodeType node_type) {
  assert(engine_node_ != nullptr);
  if (node_type == engine_node_->style.nodeType) return;
  engine_node_->style.nodeType = node_type;
}

void TaitankLayoutNode::SetOverflow(OverflowType overflow_type) {
  assert(engine_node_ != nullptr);
  if (overflow_type == engine_node_->style.overflowType) return;
  engine_node_->style.overflowType = overflow_type;
  engine_node_->markAsDirty();
}

void TaitankLayoutNode::Allocate() { engine_node_ = new HPNode(); }

void TaitankLayoutNode::Deallocate() {
  if (engine_node_ == nullptr) return;
  delete engine_node_;
}

}  // namespace dom
}  // namespace hippy
