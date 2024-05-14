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

#include "footstone/logging.h"

#include "dom/node_props.h"

namespace hippy {
inline namespace dom {

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

const std::map<std::string, CSSDirection> kBorderMap = {{kBorderWidth, CSSDirection::CSS_ALL},
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

#define SET_STYLE_VALUE(NAME, DEFAULT)                                                         \
  if (style_update.find(k##NAME) != style_update.end()) {                                      \
    auto hippy_value = style_update.find(k##NAME)->second;                                     \
    FOOTSTONE_DCHECK(hippy_value != nullptr);                                                  \
    if (hippy_value != nullptr) {                                                              \
      CheckValueType(hippy_value->GetType());                                                  \
      float value = DEFAULT;                                                                   \
      if (hippy_value->IsNumber()) value = static_cast<float>(hippy_value->ToDoubleChecked()); \
      Set##NAME(value);                                                                        \
    }                                                                                          \
  } else {                                                                                     \
    auto it = std::find(style_delete.begin(), style_delete.end(), k##NAME);                    \
    if (it != style_delete.end()) Set##NAME(DEFAULT);                                          \
  }

#define SET_STYLE_VALUES(NAME, STYLENAME, DEFAULT)                                             \
  if (style_update.find(k##STYLENAME) != style_update.end()) {                                 \
    auto hippy_value = style_update.find(k##STYLENAME)->second;                                \
    FOOTSTONE_DCHECK(hippy_value != nullptr);                                                  \
    if (hippy_value != nullptr) {                                                              \
      CheckValueType(hippy_value->GetType());                                                  \
      float value = DEFAULT;                                                                   \
      if (hippy_value->IsNumber()) value = static_cast<float>(hippy_value->ToDoubleChecked()); \
      Set##NAME(GetStyle##NAME(k##STYLENAME), value);                                          \
    }                                                                                          \
  } else {                                                                                     \
    auto it = std::find(style_delete.begin(), style_delete.end(), k##STYLENAME);               \
    if (it != style_delete.end()) Set##NAME(GetStyle##NAME(k##STYLENAME), DEFAULT);            \
  }

static void CheckValueType(footstone::value::HippyValue::Type type) {
  if (type == footstone::value::HippyValue::Type::kString || type == footstone::value::HippyValue::Type::kObject)
    FOOTSTONE_DLOG(WARNING) << "Taitank Layout Node Value Type Error";
}

static float GetDefaultValue(
    const std::string& key, const std::string& relation_key,
    const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
    const std::vector<std::string>& style_delete) {
  auto it = std::find(style_delete.begin(), style_delete.end(), key);
  if (it == style_delete.end()) return 0;

  float default_value = 0;
  if (style_update.find(relation_key) != style_update.end()) {
    auto hippy_value = style_update.find(relation_key)->second;
    if (hippy_value->IsNumber()) default_value = static_cast<float>(hippy_value->ToDoubleChecked());
  }
  return default_value;
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

TaitankLayoutNode::TaitankLayoutNode() { Allocate(); }

TaitankLayoutNode::TaitankLayoutNode(TaitankNodeRef engine_node_) : engine_node_(engine_node_) {}

TaitankLayoutNode::~TaitankLayoutNode() { Deallocate(); }

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
    const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
    const std::vector<std::string>& style_delete) {
  Parser(style_update, style_delete);
}

void TaitankLayoutNode::Parser(
    const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
    const std::vector<std::string>& style_delete) {
  SET_STYLE_VALUE(Width, NAN)
  SET_STYLE_VALUE(MinWidth, NAN)
  SET_STYLE_VALUE(MaxWidth, NAN)
  SET_STYLE_VALUE(Height, NAN)
  SET_STYLE_VALUE(MinHeight, NAN)
  SET_STYLE_VALUE(MaxHeight, NAN)

  if (style_update.find(kFlex) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kFlex)->second != nullptr);
    if (style_update.find(kFlex)->second != nullptr) {
      double value;
      if (style_update.find(kFlex)->second->ToDouble(value)) {
        SetFlex(static_cast<float>(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout flex value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlex);
    if (it != style_delete.end()) SetFlex(0);
  }

  if (style_update.find(kFlexGrow) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kFlexGrow)->second != nullptr);
    if (style_update.find(kFlexGrow)->second != nullptr) {
      double value;
      if (style_update.find(kFlexGrow)->second->ToDouble(value)) {
        SetFlexGrow(static_cast<float>(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout flex grow value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexGrow);
    if (it != style_delete.end()) SetFlexGrow(0);
  }

  if (style_update.find(kFlexShrink) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kFlexShrink)->second != nullptr);
    if (style_update.find(kFlexShrink)->second != nullptr) {
      double value;
      if (style_update.find(kFlexShrink)->second->ToDouble(value)) {
        SetFlexShrink(static_cast<float>(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout flex shrink value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexShrink);
    if (it != style_delete.end()) SetFlexShrink(0);
  }

  if (style_update.find(kFlexBasis) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kFlexBasis)->second != nullptr);
    if (style_update.find(kFlexBasis)->second != nullptr) {
      double value;
      if (style_update.find(kFlexBasis)->second->ToDouble(value)) {
        SetFlexBasis(static_cast<float>(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout flex basis value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexBasis);
    if (it != style_delete.end()) SetFlexBasis(NAN);
  }

  if (style_update.find(kDirection) != style_update.end()) {
    if (style_update.find(kDirection)->second != nullptr) {
      std::string value;
      if (style_update.find(kDirection)->second->ToString(value)) {
        SetDirection(GetStyleDirection(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout direction value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kDirection);
    if (it != style_delete.end()) SetDirection(TaitankDirection::DIRECTION_LTR);
  }

  if (style_update.find(kFlexDirection) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kFlexDirection)->second != nullptr);
    if (style_update.find(kFlexDirection)->second != nullptr) {
      std::string value;
      if (style_update.find(kFlexDirection)->second->ToString(value)) {
        SetFlexDirection(GetStyleFlexDirection(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout style flex direction value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexDirection);
    if (it != style_delete.end()) SetFlexDirection(FlexDirection::FLEX_DIRECTION_COLUMN);
  }

  if (style_update.find(kFlexWrap) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kFlexWrap)->second != nullptr);
    if (style_update.find(kFlexWrap)->second != nullptr) {
      std::string value;
      if (style_update.find(kFlexWrap)->second->ToString(value)) {
        SetFlexWrap(GetStyleWrapMode(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout style flex wrap value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexWrap);
    if (it != style_delete.end()) SetFlexWrap(FlexWrapMode::FLEX_NO_WRAP);
  }

  if (style_update.find(kAilgnSelf) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kAilgnSelf)->second != nullptr);
    if (style_update.find(kAilgnSelf)->second != nullptr) {
      std::string value;
      if (style_update.find(kAilgnSelf)->second->ToString(value)) {
        SetAlignSelf(GetStyleAlign(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout style flex align self value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kAilgnSelf);
    if (it != style_delete.end()) SetAlignSelf(FlexAlign::FLEX_ALIGN_AUTO);
  }

  if (style_update.find(kAlignItems) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kAlignItems)->second != nullptr);
    if (style_update.find(kAlignItems)->second != nullptr) {
      std::string value;
      if (style_update.find(kAlignItems)->second->ToString(value)) {
        SetAlignItems(GetStyleAlign(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout style flex align items value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kAlignItems);
    if (it != style_delete.end()) SetAlignItems(FlexAlign::FLEX_ALIGN_STRETCH);
  }

  if (style_update.find(kJustifyContent) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kJustifyContent)->second != nullptr);
    if (style_update.find(kJustifyContent)->second != nullptr) {
      std::string value;
      if (style_update.find(kJustifyContent)->second->ToString(value)) {
        SetJustifyContent(GetStyleJustify(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout style flex justify content value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kJustifyContent);
    if (it != style_delete.end()) SetJustifyContent(FlexAlign::FLEX_ALIGN_START);
  }

  if (style_update.find(kOverflow) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kOverflow)->second != nullptr);
    if (style_update.find(kOverflow)->second != nullptr) {
      std::string value;
      if (style_update.find(kOverflow)->second->ToString(value)) {
        SetOverflow(GetStyleOverflow(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout style over flow value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kOverflow);
    if (it != style_delete.end()) SetOverflow(OverflowType::OVERFLOW_VISIBLE);
  }

  if (style_update.find(kDisplay) != style_update.end()) {
    std::string value;
    if (style_update.find(kDisplay)->second != nullptr && style_update.find(kDisplay)->second->ToString(value)) {
      SetDisplay(GetStyleDisplayType(value));
    } else {
      FOOTSTONE_LOG(WARNING) << "layout style display value is not correct";
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kOverflow);
    if (it != style_delete.end()) SetDisplay(DisplayType::DISPLAY_TYPE_FLEX);
  }

  SET_STYLE_VALUES(Margin, Margin, 0)
  SET_STYLE_VALUES(Margin, MarginVertical, 0)
  SET_STYLE_VALUES(Margin, MarginHorizontal, 0)
  SET_STYLE_VALUES(Margin, MarginLeft, GetDefaultValue(kMarginLeft, kMargin, style_update, style_delete))
  SET_STYLE_VALUES(Margin, MarginRight, GetDefaultValue(kMarginRight, kMargin, style_update, style_delete))
  SET_STYLE_VALUES(Margin, MarginTop, GetDefaultValue(kMarginTop, kMargin, style_update, style_delete))
  SET_STYLE_VALUES(Margin, MarginBottom, GetDefaultValue(kMarginBottom, kMargin, style_update, style_delete))
  SET_STYLE_VALUES(Padding, Padding, 0)
  SET_STYLE_VALUES(Padding, PaddingVertical, 0)
  SET_STYLE_VALUES(Padding, PaddingHorizontal, 0)
  SET_STYLE_VALUES(Padding, PaddingLeft, GetDefaultValue(kPaddingLeft, kPadding, style_update, style_delete))
  SET_STYLE_VALUES(Padding, PaddingRight, GetDefaultValue(kPaddingRight, kPadding, style_update, style_delete))
  SET_STYLE_VALUES(Padding, PaddingTop, GetDefaultValue(kPaddingTop, kPadding, style_update, style_delete))
  SET_STYLE_VALUES(Padding, PaddingBottom, GetDefaultValue(kPaddingBottom, kPadding, style_update, style_delete))
  SET_STYLE_VALUES(Border, BorderWidth, 0)
  SET_STYLE_VALUES(Border, BorderLeftWidth, GetDefaultValue(kBorderLeftWidth, kBorderWidth, style_update, style_delete))
  SET_STYLE_VALUES(Border, BorderTopWidth, GetDefaultValue(kBorderTopWidth, kBorderWidth, style_update, style_delete))
  SET_STYLE_VALUES(Border, BorderRightWidth,
                   GetDefaultValue(kBorderRightWidth, kBorderWidth, style_update, style_delete))
  SET_STYLE_VALUES(Border, BorderBottomWidth,
                   GetDefaultValue(kBorderBottomWidth, kBorderWidth, style_update, style_delete))
  SET_STYLE_VALUES(Position, Left, NAN)
  SET_STYLE_VALUES(Position, Right, NAN)
  SET_STYLE_VALUES(Position, Top, NAN)
  SET_STYLE_VALUES(Position, Bottom, NAN)
  if (style_update.find(kPosition) != style_update.end()) {
    FOOTSTONE_DCHECK(style_update.find(kPosition)->second != nullptr);
    if (style_update.find(kPosition)->second != nullptr) {
      std::string value;
      if (style_update.find(kPosition)->second->ToString(value)) {
        SetPositionType(GetStylePositionType(value));
      } else {
        FOOTSTONE_LOG(WARNING) << "layout style position type value is not correct";
      }
    }
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPosition);
    if (it != style_delete.end()) SetPositionType(PositionType::POSITION_TYPE_RELATIVE);
  }
}

void TaitankLayoutNode::SetMeasureFunction(MeasureFunction measure_function) {
  assert(engine_node_ != nullptr);
  measure_function_ = measure_function;
  engine_node_->SetContext(reinterpret_cast<void*>(this));
  auto func = [](TaitankNodeRef node, float width, MeasureMode width_measrue_mode, float height,
                 MeasureMode height_measure_mode, void* context) -> TaitankSize {
    auto taitank_node = reinterpret_cast<TaitankLayoutNode*>(node->GetContext());
    if (taitank_node->measure_function_) {
      auto size = taitank_node->measure_function_(width, ToLayoutMeasureMode(width_measrue_mode), height,
                                                  ToLayoutMeasureMode(height_measure_mode), context);
      TaitankSize result;
      result.width = size.width;
      result.height = size.height;
      return result;
    }
    return TaitankSize{0, 0};
  };
  TaitankMeasureFunction taitank_measure_function = func;
  engine_node_->SetMeasureFunction(taitank_measure_function);
}

bool TaitankLayoutNode::HasMeasureFunction() {
  assert(engine_node_ != nullptr);
  return measure_function_ != nullptr;
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

float TaitankLayoutNode::GetStyleWidth() { return engine_node_->style_.dim_[DIMENSION_WIDTH]; }

float TaitankLayoutNode::GetStyleHeight() { return engine_node_->style_.dim_[DIMENSION_HEIGHT]; }

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

bool TaitankLayoutNode::HasParentEngineNode() {
  assert(engine_node_ != nullptr);
  if (engine_node_->GetParent() == nullptr) {
    return false;
  }
  return true;
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
