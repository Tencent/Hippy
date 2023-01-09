/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#include "dom/taitank_layout_node.h"

#include <cmath>
#include <map>
#include <mutex>

#include "footstone/logging.h"

#include "dom/node_props.h"

namespace hippy {
inline namespace dom {

static std::atomic<int64_t> global_measure_function_key{0};
static std::map<int64_t, MeasureFunction> measure_function_map;
static std::mutex mutex;

const std::map<std::string, OverflowType> kOverflowMap = {{"visible", OverflowType::OVERFLOW_VISIBLE},
                                                          {"hidden", OverflowType::OVERFLOW_HIDDEN},
                                                          {"scroll", OverflowType::OVERFLOW_SCROLL}};

const std::map<std::string, FlexDirection> kFlexDirectionMap = {
    {"row", FlexDirection::FLEX_DIRECTION_ROW},
    {"row-reverse", FlexDirection::FLEX_DIRECTION_ROW_REVERSE},
    {"column", FlexDirection::FLEX_DIRECTION_COLUMN},
    {"column-reverse", FlexDirection::FLEX_DIRECTION_COLUNM_REVERSE}};

const std::map<std::string, FlexWrapMode> kWrapModeMap = {{"nowrap", FlexWrapMode::FLEX_NO_WRAP},
                                                          {"wrap", FlexWrapMode::FLEX_WRAP},
                                                          {"wrap-reverse", FlexWrapMode::FLEX_WRAP_REVERSE}};

const std::map<std::string, FlexAlign> kJustifyMap = {{"flex-start", FlexAlign::FLEX_ALIGN_START},
                                                      {"center", FlexAlign::FLEX_ALIGN_CENTER},
                                                      {"flex-end", FlexAlign::FLEX_ALIGN_END},
                                                      {"space-between", FlexAlign::FLEX_ALIGN_SPACE_BETWEEN},
                                                      {"space-around", FlexAlign::FLEX_ALIGN_SPACE_AROUND},
                                                      {"space-evenly", FlexAlign::FLEX_ALIGN_SPACE_EVENLY}};

const std::map<std::string, FlexAlign> kAlignMap = {{"auto", FlexAlign::FLEX_ALIGN_AUTO},
                                                    {"flex-start", FlexAlign::FLEX_ALIGN_START},
                                                    {"center", FlexAlign::FLEX_ALIGN_CENTER},
                                                    {"flex-end", FlexAlign::FLEX_ALIGN_END},
                                                    {"stretch", FlexAlign::FLEX_ALIGN_STRETCH},
                                                    {"baseline", FlexAlign::FLEX_ALIGN_BASE_LINE},
                                                    {"space-between", FlexAlign::FLEX_ALIGN_SPACE_BETWEEN},
                                                    {"space-around", FlexAlign::FLEX_ALIGN_SPACE_AROUND}};

const std::map<std::string, CSSDirection> kMarginMap = {{kMargin, CSSDirection::CSS_ALL},
                                                        {kMarginVertical, CSSDirection::CSS_VERTICAL},
                                                        {kMarginHorizontal, CSSDirection::CSS_HORIZONTAL},
                                                        {kMarginLeft, CSSDirection::CSS_LEFT},
                                                        {kMarginRight, CSSDirection::CSS_RIGHT},
                                                        {kMarginTop, CSSDirection::CSS_TOP},
                                                        {kMarginBottom, CSSDirection::CSS_BOTTOM}};

const std::map<std::string, CSSDirection> kPaddingMap = {{kPadding, CSSDirection::CSS_ALL},
                                                         {kPaddingVertical, CSSDirection::CSS_VERTICAL},
                                                         {kPaddingHorizontal, CSSDirection::CSS_HORIZONTAL},
                                                         {kPaddingLeft, CSSDirection::CSS_LEFT},
                                                         {kPaddingRight, CSSDirection::CSS_RIGHT},
                                                         {kPaddingTop, CSSDirection::CSS_TOP},
                                                         {kPaddingBottom, CSSDirection::CSS_BOTTOM}};

const std::map<std::string, CSSDirection> kPositionMap = {{kLeft, CSSDirection::CSS_LEFT},
                                                          {kRight, CSSDirection::CSS_RIGHT},
                                                          {kTop, CSSDirection::CSS_TOP},
                                                          {kBottom, CSSDirection::CSS_BOTTOM}};

const std::map<std::string, CSSDirection> kBorderMap = {{kBorderWidth, CSSDirection::CSS_LEFT},
                                                        {kBorderLeftWidth, CSSDirection::CSS_LEFT},
                                                        {kBorderTopWidth, CSSDirection::CSS_TOP},
                                                        {kBorderRightWidth, CSSDirection::CSS_RIGHT},
                                                        {kBorderBottomWidth, CSSDirection::CSS_BOTTOM}};

const std::map<std::string, PositionType> kPositionTypeMap = {{"relative", PositionType::POSITION_TYPE_RELATIVE},
                                                              {"absolute", PositionType::POSITION_TYPE_ABSOLUTE}};

const std::map<std::string, DisplayType> kDisplayTypeMap = {{"none", DisplayType::DISPLAY_TYPE_NONE}};

const std::map<std::string, TaitankDirection> kDirectionMap = {
    {"inherit", DIRECTION_INHERIT}, {"ltr", DIRECTION_LTR}, {"rtl", DIRECTION_RTL}};

#define TAITANK_GET_STYLE_DECL(NAME, TYPE, DEFAULT)      \
  static TYPE GetStyle##NAME(const std::string& key) {   \
    auto iter = k##NAME##Map.find(key);                  \
    if (iter != k##NAME##Map.end()) return iter->second; \
    return DEFAULT;                                      \
  }

TAITANK_GET_STYLE_DECL(Overflow, OverflowType, OverflowType::OVERFLOW_VISIBLE)

TAITANK_GET_STYLE_DECL(FlexDirection, FlexDirection, FlexDirection::FLEX_DIRECTION_COLUMN)

TAITANK_GET_STYLE_DECL(WrapMode, FlexWrapMode, FlexWrapMode::FLEX_NO_WRAP)

TAITANK_GET_STYLE_DECL(Justify, FlexAlign, FlexAlign::FLEX_ALIGN_START)

TAITANK_GET_STYLE_DECL(Align, FlexAlign, FlexAlign::FLEX_ALIGN_STRETCH)

TAITANK_GET_STYLE_DECL(Margin, CSSDirection, CSSDirection::CSS_NONE)

TAITANK_GET_STYLE_DECL(Padding, CSSDirection, CSSDirection::CSS_NONE)

TAITANK_GET_STYLE_DECL(Border, CSSDirection, CSSDirection::CSS_NONE)

TAITANK_GET_STYLE_DECL(Position, CSSDirection, CSSDirection::CSS_NONE)

TAITANK_GET_STYLE_DECL(PositionType, PositionType, PositionType::POSITION_TYPE_RELATIVE)

TAITANK_GET_STYLE_DECL(DisplayType, DisplayType, DisplayType::DISPLAY_TYPE_FLEX)

TAITANK_GET_STYLE_DECL(Direction, TaitankDirection, TaitankDirection::DIRECTION_LTR)

#define SET_STYLE_VALUE(NAME, DEFAULT)                                                   \
  auto dom_value = style_map.find(k##NAME)->second;                                      \
  if (dom_value == nullptr) {                                                            \
    Set##NAME(DEFAULT);                                                                  \
  } else {                                                                               \
    CheckValueType(dom_value->GetType());                                                \
    float value = DEFAULT;                                                               \
    if (dom_value->IsNumber()) value = static_cast<float>(dom_value->ToDoubleChecked()); \
    Set##NAME(value);                                                                    \
  }

#define SET_STYLE_VALUES(NAME, STYLENAME, DEFAULT)                                       \
  auto dom_value = style_map.find(k##STYLENAME)->second;                                 \
  if (dom_value == nullptr) {                                                            \
    Set##NAME(GetStyle##NAME(k##STYLENAME), DEFAULT);                                    \
  } else {                                                                               \
    CheckValueType(dom_value->GetType());                                                \
    float value = DEFAULT;                                                               \
    if (dom_value->IsNumber()) value = static_cast<float>(dom_value->ToDoubleChecked()); \
    Set##NAME(GetStyle##NAME(k##STYLENAME), value);                                      \
  }

static void CheckValueType(footstone::value::HippyValue::Type type) {
  FOOTSTONE_DCHECK(type == footstone::value::HippyValue::Type::kNumber || type == footstone::value::HippyValue::Type::kObject);
}

static LayoutMeasureMode ToLayoutMeasureMode(MeasureMode measure_mode) {
  if (measure_mode == MeasureMode::MEASURE_MODE_UNDEFINED) {
    return LayoutMeasureMode::Undefined;
  }
  if (measure_mode == MeasureMode::MEASURE_MODE_EXACTLY) {
    return LayoutMeasureMode::Exactly;
  }
  if (measure_mode == MeasureMode::MEASURE_MODE_AT_MOST) {
    return LayoutMeasureMode::AtMost;
  }
  FOOTSTONE_UNREACHABLE();
}

static CSSDirection GetCSSDirectionFromEdge(Edge edge) {
  if (Edge::EdgeLeft == edge) {
    return CSSDirection::CSS_LEFT;
  } else if (Edge::EdgeTop == edge) {
    return CSSDirection::CSS_TOP;
  } else if (Edge::EdgeRight == edge) {
    return CSSDirection::CSS_RIGHT;
  } else if (Edge::EdgeBottom == edge) {
    return CSSDirection::CSS_BOTTOM;
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

TaitankLayoutNode::TaitankLayoutNode() : key_(global_measure_function_key.fetch_add(1)) { Allocate(); }

TaitankLayoutNode::TaitankLayoutNode(TaitankNodeRef engine_node_)
    : engine_node_(engine_node_), key_(global_measure_function_key.fetch_add(1)) {}

TaitankLayoutNode::~TaitankLayoutNode() {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = measure_function_map.find(key_);
  if (it != measure_function_map.end()) measure_function_map.erase(it);
  Deallocate();
}

void TaitankLayoutNode::CalculateLayout(float parent_width, float parent_height, Direction direction,
                                        void* layout_context) {
  assert(engine_node_ != nullptr);
  TaitankDirection taitank_direction;
  if (direction == Direction::Inherit) {
    taitank_direction = TaitankDirection::DIRECTION_INHERIT;
  } else if (direction == Direction::LTR) {
    taitank_direction = TaitankDirection::DIRECTION_LTR;
  } else if (direction == Direction::RTL) {
    taitank_direction = TaitankDirection::DIRECTION_RTL;
  } else {
    FOOTSTONE_UNREACHABLE();
  }
  engine_node_->Layout(parent_width, parent_height, engine_node_->GetConfig(), taitank_direction, layout_context);
}

void TaitankLayoutNode::SetLayoutStyles(
    std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_map) {
  Parser(style_map);
}

void TaitankLayoutNode::Parser(std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_map) {
  if (style_map.find(kWidth) != style_map.end()) {
    SET_STYLE_VALUE(Width, NAN)
  }
  if (style_map.find(kMinWidth) != style_map.end()) {
    SET_STYLE_VALUE(MinWidth, NAN)
  }
  if (style_map.find(kMaxWidth) != style_map.end()) {
    SET_STYLE_VALUE(MaxWidth, NAN)
  }
  if (style_map.find(kHeight) != style_map.end()) {
    SET_STYLE_VALUE(Height, NAN)
  }
  if (style_map.find(kMinHeight) != style_map.end()) {
    SET_STYLE_VALUE(MinHeight, NAN)
  }
  if (style_map.find(kMaxHeight) != style_map.end()) {
    SET_STYLE_VALUE(MaxHeight, NAN)
  }
  if (style_map.find(kFlex) != style_map.end()) {
    if (style_map.find(kFlex)->second == nullptr) {
      SetFlex(0);
    } else {
      SetFlex(static_cast<float>(style_map.find(kFlex)->second->ToDoubleChecked()));
    }
  }
  if (style_map.find(kFlexGrow) != style_map.end()) {
    if (style_map.find(kFlexGrow)->second == nullptr) {
      SetFlexGrow(0);
    } else {
      SetFlexGrow(static_cast<float>(style_map.find(kFlexGrow)->second->ToDoubleChecked()));
    }
  }
  if (style_map.find(kFlexShrink) != style_map.end()) {
    if (style_map.find(kFlexShrink)->second == nullptr) {
      SetFlexShrink(0);
    } else {
      SetFlexShrink(static_cast<float>(style_map.find(kFlexShrink)->second->ToDoubleChecked()));
    }
  }
  if (style_map.find(kFlexBasis) != style_map.end()) {
    if (style_map.find(kFlexBasis)->second == nullptr) {
      SetFlexBasis(NAN);
    } else {
      SetFlexBasis(static_cast<float>(style_map.find(kFlexBasis)->second->ToDoubleChecked()));
    }
  }
  if (style_map.find(kDirection) != style_map.end()) {
    if (style_map.find(kDirection)->second != nullptr) {
      SetDirection(GetStyleDirection(style_map.find(kDirection)->second->ToStringChecked()));
    }
  }
  if (style_map.find(kFlexDirection) != style_map.end()) {
    if (style_map.find(kFlexDirection)->second == nullptr) {
      SetFlexDirection(FlexDirection::FLEX_DIRECTION_COLUMN);
    } else {
      SetFlexDirection(GetStyleFlexDirection(style_map.find(kFlexDirection)->second->ToStringChecked()));
    }
  }
  if (style_map.find(kFlexWrap) != style_map.end()) {
    if (style_map.find(kFlexWrap)->second == nullptr) {
      SetFlexWrap(FlexWrapMode::FLEX_NO_WRAP);
    } else {
      SetFlexWrap(GetStyleWrapMode(style_map.find(kFlexWrap)->second->ToStringChecked()));
    }
  }
  if (style_map.find(kAilgnSelf) != style_map.end()) {
    if (style_map.find(kAilgnSelf)->second == nullptr) {
      SetAlignSelf(FlexAlign::FLEX_ALIGN_AUTO);
    } else {
      SetAlignSelf(GetStyleAlign(style_map.find(kAilgnSelf)->second->ToStringChecked()));
    }
  }
  if (style_map.find(kAlignItems) != style_map.end()) {
    if (style_map.find(kAlignItems)->second == nullptr) {
      SetAlignItems(FlexAlign::FLEX_ALIGN_STRETCH);
    } else {
      SetAlignItems(GetStyleAlign(style_map.find(kAlignItems)->second->ToStringChecked()));
    }
  }
  if (style_map.find(kJustifyContent) != style_map.end()) {
    if (style_map.find(kJustifyContent)->second == nullptr) {
      SetJustifyContent(FlexAlign::FLEX_ALIGN_START);
    } else {
      SetJustifyContent(GetStyleJustify(style_map.find(kJustifyContent)->second->ToStringChecked()));
    }
  }
  if (style_map.find(kOverflow) != style_map.end()) {
    if (style_map.find(kOverflow)->second == nullptr) {
      SetOverflow(OverflowType::OVERFLOW_VISIBLE);
    } else {
      SetOverflow(GetStyleOverflow(style_map.find(kOverflow)->second->ToStringChecked()));
    }
  }
  if (style_map.find(kDisplay) != style_map.end()) {
    SetDisplay(GetStyleDisplayType(style_map.find(kDisplay)->second->ToStringChecked()));
  }
  if (style_map.find(kMargin) != style_map.end()) {
    SET_STYLE_VALUES(Margin, Margin, 0)
  }
  if (style_map.find(kMarginVertical) != style_map.end()) {
    SET_STYLE_VALUES(Margin, MarginVertical, 0)
  }
  if (style_map.find(kMarginHorizontal) != style_map.end()) {
    SET_STYLE_VALUES(Margin, MarginHorizontal, 0)
  }
  if (style_map.find(kMarginLeft) != style_map.end()) {
    SET_STYLE_VALUES(Margin, MarginLeft, 0)
  }
  if (style_map.find(kMarginRight) != style_map.end()) {
    SET_STYLE_VALUES(Margin, MarginRight, 0)
  }
  if (style_map.find(kMarginTop) != style_map.end()) {
    SET_STYLE_VALUES(Margin, MarginTop, 0)
  }
  if (style_map.find(kMarginBottom) != style_map.end()) {
    SET_STYLE_VALUES(Margin, MarginBottom, 0)
  }
  if (style_map.find(kPadding) != style_map.end()) {
    SET_STYLE_VALUES(Padding, Padding, 0)
  }
  if (style_map.find(kPaddingVertical) != style_map.end()) {
    SET_STYLE_VALUES(Padding, PaddingVertical, 0)
  }
  if (style_map.find(kPaddingHorizontal) != style_map.end()) {
    SET_STYLE_VALUES(Padding, PaddingHorizontal, 0)
  }
  if (style_map.find(kPaddingLeft) != style_map.end()) {
    SET_STYLE_VALUES(Padding, PaddingLeft, 0)
  }
  if (style_map.find(kPaddingRight) != style_map.end()) {
    SET_STYLE_VALUES(Padding, PaddingRight, 0)
  }
  if (style_map.find(kPaddingTop) != style_map.end()) {
    SET_STYLE_VALUES(Padding, PaddingTop, 0)
  }
  if (style_map.find(kPaddingBottom) != style_map.end()) {
    SET_STYLE_VALUES(Padding, PaddingBottom, 0)
  }
  if (style_map.find(kBorderWidth) != style_map.end()) {
    SET_STYLE_VALUES(Border, BorderWidth, 0)
  }
  if (style_map.find(kBorderLeftWidth) != style_map.end()) {
    SET_STYLE_VALUES(Border, BorderLeftWidth, 0)
  }
  if (style_map.find(kBorderTopWidth) != style_map.end()) {
    SET_STYLE_VALUES(Border, BorderTopWidth, 0)
  }
  if (style_map.find(kBorderRightWidth) != style_map.end()) {
    SET_STYLE_VALUES(Border, BorderRightWidth, 0)
  }
  if (style_map.find(kBorderBottomWidth) != style_map.end()) {
    SET_STYLE_VALUES(Border, BorderBottomWidth, 0)
  }
  if (style_map.find(kLeft) != style_map.end()) {
    SET_STYLE_VALUES(Position, Left, NAN)
  }
  if (style_map.find(kRight) != style_map.end()) {
    SET_STYLE_VALUES(Position, Right, NAN)
  }
  if (style_map.find(kTop) != style_map.end()) {
    SET_STYLE_VALUES(Position, Top, NAN)
  }
  if (style_map.find(kBottom) != style_map.end()) {
    SET_STYLE_VALUES(Position, Bottom, NAN)
  }
  if (style_map.find(kPosition) != style_map.end()) {
    if (style_map.find(kPosition)->second == nullptr) {
      SetPositionType(PositionType::POSITION_TYPE_RELATIVE);
    } else {
      SetPositionType(GetStylePositionType(style_map.find(kPosition)->second->ToStringChecked()));
    }
  }
}

static TaitankSize TaitankMeasureFunction(TaitankNodeRef node, float width, MeasureMode width_measrue_mode, float height,
                                     MeasureMode height_measure_mode, void* context) {
  auto taitank_node = reinterpret_cast<TaitankLayoutNode*>(node->GetContext());
  int64_t key = taitank_node->GetKey();
  auto iter = measure_function_map.find(key);
  if (iter != measure_function_map.end()) {
    auto size = iter->second(width, ToLayoutMeasureMode(width_measrue_mode), height,
                             ToLayoutMeasureMode(height_measure_mode), context);
    TaitankSize result;
    result.width = size.width;
    result.height = size.height;
    return result;
  }
  return TaitankSize{0, 0};
}

void TaitankLayoutNode::SetMeasureFunction(MeasureFunction measure_function) {
  assert(engine_node_ != nullptr);
  measure_function_map[key_] = measure_function;
  engine_node_->SetContext(reinterpret_cast<void*>(this));
  engine_node_->SetMeasureFunction(TaitankMeasureFunction);
}

float TaitankLayoutNode::GetLeft() {
  assert(engine_node_ != nullptr);
  return engine_node_->layout_result_.position[CSS_LEFT];
}

float TaitankLayoutNode::GetTop() {
  assert(engine_node_ != nullptr);
  return engine_node_->layout_result_.position[CSS_TOP];
}

float TaitankLayoutNode::GetRight() {
  assert(engine_node_ != nullptr);
  return engine_node_->layout_result_.position[CSS_RIGHT];
}

float TaitankLayoutNode::GetBottom() {
  assert(engine_node_ != nullptr);
  return engine_node_->layout_result_.position[CSS_BOTTOM];
}

float TaitankLayoutNode::GetWidth() {
  assert(engine_node_ != nullptr);
  return engine_node_->layout_result_.dim[DIMENSION_WIDTH];
}

float TaitankLayoutNode::GetHeight() {
  assert(engine_node_ != nullptr);
  return engine_node_->layout_result_.dim[DIMENSION_HEIGHT];
}

float TaitankLayoutNode::GetMargin(Edge edge) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  return engine_node_->layout_result_.margin[css_direction];
}

float TaitankLayoutNode::GetPadding(Edge edge) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  return engine_node_->layout_result_.padding[css_direction];
}

float TaitankLayoutNode::GetBorder(Edge edge) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  return engine_node_->layout_result_.border[css_direction];
}

float TaitankLayoutNode::GetStyleWidth() {
  return engine_node_->style_.dim_[DIMENSION_WIDTH];
}

float TaitankLayoutNode::GetStyleHeight() {
  return engine_node_->style_.dim_[DIMENSION_HEIGHT];
}

bool TaitankLayoutNode::LayoutHadOverflow() {
  assert(engine_node_ != nullptr);
  return engine_node_->layout_result_.had_overflow;
}

void TaitankLayoutNode::InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) {
  assert(engine_node_ != nullptr);
  if (engine_node_->measure_ != nullptr) return;
  auto node = std::static_pointer_cast<TaitankLayoutNode>(child);
  assert(node->GetLayoutEngineNodeRef() != nullptr);
  engine_node_->InsertChild(node->GetLayoutEngineNodeRef(), index);
  children_.insert(children_.begin() + static_cast<int>(index), node);
  node->parent_ = shared_from_this();
}

void TaitankLayoutNode::RemoveChild(const std::shared_ptr<LayoutNode> child) {
  assert(engine_node_ != nullptr);
  auto node = std::static_pointer_cast<TaitankLayoutNode>(child);
  assert(node->GetLayoutEngineNodeRef() != nullptr);
  engine_node_->RemoveChild(node->GetLayoutEngineNodeRef());
  auto iter = std::find(children_.begin(), children_.end(), node);
  if (iter != children_.end()) {
    children_.erase(iter);
  }
}

bool TaitankLayoutNode::HasNewLayout() {
  assert(engine_node_ != nullptr);
  return engine_node_->GetHasNewLayout();
}

void TaitankLayoutNode::SetHasNewLayout(bool has_new_layout) {
  assert(engine_node_ != nullptr);
  engine_node_->SetHasNewLayout(has_new_layout);
}

void TaitankLayoutNode::MarkDirty() {
  assert(engine_node_ != nullptr);
  engine_node_->MarkAsDirty();
}

bool TaitankLayoutNode::IsDirty() {
  assert(engine_node_ != nullptr);
  return engine_node_->is_dirty_;
}

void TaitankLayoutNode::Print() {
  assert(engine_node_ != nullptr);
  engine_node_->PrintNode();
}

bool TaitankLayoutNode::Reset() {
  assert(engine_node_ != nullptr);
  if (engine_node_->ChildCount() != 0 || engine_node_->GetParent() != nullptr) return false;
  return engine_node_->Reset();
}

void TaitankLayoutNode::SetDirection(TaitankDirection direction) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.direction_ == direction) return;
  engine_node_->style_.direction_ = direction;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetWidth(float width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.dim_[DIMENSION_WIDTH], width)) {
    return;
  }
  engine_node_->style_.dim_[DIMENSION_WIDTH] = width;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetHeight(float height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.dim_[DIMENSION_HEIGHT], height)) return;
  engine_node_->style_.dim_[DIMENSION_HEIGHT] = height;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetPosition(Edge edge, float position) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  if (FloatIsEqual(engine_node_->style_.position_[css_direction], position)) return;
  if (engine_node_->style_.SetPosition(css_direction, position)) {
    engine_node_->MarkAsDirty();
  }
}

void TaitankLayoutNode::SetScaleFactor(float sacle_factor) {
  assert(engine_node_ != nullptr);
  TaitankConfigRef config = engine_node_->GetConfig();
  config->SetScaleFactor(sacle_factor);
}

void TaitankLayoutNode::SetMaxWidth(float max_width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.max_dim_[DIMENSION_WIDTH], max_width)) return;
  engine_node_->style_.max_dim_[DIMENSION_WIDTH] = max_width;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetMaxHeight(float max_height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.max_dim_[DIMENSION_HEIGHT], max_height)) return;
  engine_node_->style_.max_dim_[DIMENSION_HEIGHT] = max_height;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetMinWidth(float min_width) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.min_dim_[DIMENSION_WIDTH], min_width)) return;
  engine_node_->style_.min_dim_[DIMENSION_WIDTH] = min_width;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetMinHeight(float min_height) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.min_dim_[DIMENSION_HEIGHT], min_height)) return;
  engine_node_->style_.min_dim_[DIMENSION_HEIGHT] = min_height;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetFlexBasis(float flex_basis) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.flex_basis_, flex_basis)) return;
  engine_node_->style_.flex_basis_ = flex_basis;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetFlex(float flex) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.flex_, flex)) return;
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
  engine_node_->style_.flex_ = flex;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetFlexGrow(float flex_grow) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.flex_grow_, flex_grow)) return;
  engine_node_->style_.flex_grow_ = flex_grow;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetFlexShrink(float flex_shrink) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.flex_shrink_, flex_shrink)) return;
  engine_node_->style_.flex_shrink_ = flex_shrink;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetFlexDirection(FlexDirection flex_direction) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.flex_direction_ == flex_direction) return;
  engine_node_->style_.flex_direction_ = flex_direction;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetPositionType(PositionType position_type) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.position_type_ == position_type) return;
  engine_node_->style_.position_type_ = position_type;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetPosition(CSSDirection css_direction, float position) {
  assert(engine_node_ != nullptr);
  if (FloatIsEqual(engine_node_->style_.position_[css_direction], position)) return;
  if (engine_node_->style_.SetPosition(css_direction, position)) {
    engine_node_->MarkAsDirty();
  }
}

void TaitankLayoutNode::SetMargin(CSSDirection css_direction, float margin) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.SetMargin(css_direction, margin)) {
    engine_node_->MarkAsDirty();
  }
}

void TaitankLayoutNode::SetMarginAuto(CSSDirection css_direction) { SetMargin(css_direction, VALUE_AUTO); }

void TaitankLayoutNode::SetPadding(CSSDirection css_direction, float padding) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.SetPadding(css_direction, padding)) {
    engine_node_->MarkAsDirty();
  }
}

void TaitankLayoutNode::SetBorder(CSSDirection css_direction, float border) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.SetBorder(css_direction, border)) {
    engine_node_->MarkAsDirty();
  }
}

void TaitankLayoutNode::SetFlexWrap(FlexWrapMode wrap_mode) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.flex_wrap_ == wrap_mode) return;

  engine_node_->style_.flex_wrap_ = wrap_mode;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetJustifyContent(FlexAlign justify) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.justify_content_ == justify) return;
  engine_node_->style_.justify_content_ = justify;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetAlignContent(FlexAlign align_content) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.align_content_ == align_content) return;
  engine_node_->style_.align_content_ = align_content;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetAlignItems(FlexAlign align_items) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.align_items_ == align_items) return;
  engine_node_->style_.align_items_ = align_items;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetAlignSelf(FlexAlign align_self) {
  assert(engine_node_ != nullptr);
  if (engine_node_->style_.align_self_ == align_self) return;
  engine_node_->style_.align_self_ = align_self;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::SetDisplay(DisplayType display_type) {
  assert(engine_node_ != nullptr);
  engine_node_->SetDisplayType(display_type);
}

void TaitankLayoutNode::SetNodeType(NodeType node_type) {
  assert(engine_node_ != nullptr);
  if (node_type == engine_node_->style_.node_type_) return;
  engine_node_->style_.node_type_ = node_type;
}

void TaitankLayoutNode::SetOverflow(OverflowType overflow_type) {
  assert(engine_node_ != nullptr);
  if (overflow_type == engine_node_->style_.overflow_type_) return;
  engine_node_->style_.overflow_type_ = overflow_type;
  engine_node_->MarkAsDirty();
}

void TaitankLayoutNode::Allocate() { engine_node_ = new TaitankNode(); }

void TaitankLayoutNode::Deallocate() {
  if (engine_node_ == nullptr) return;
  delete engine_node_;
}

std::shared_ptr<LayoutNode> CreateLayoutNode() { return std::make_shared<TaitankLayoutNode>(); }

}  // namespace dom
}  // namespace hippy
