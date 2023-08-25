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

#include "dom/yoga_layout_node.h"

#include <map>

#include "dom/node_props.h"
#include "footstone/logging.h"
#include "yoga/Yoga.h"

namespace hippy {
inline namespace dom {

static std::atomic<int64_t> global_measure_function_key{0};
static std::map<int64_t, MeasureFunction> measure_function_map;
static std::mutex mutex;

const std::map<std::string, YGOverflow> kOverflowMap = {
    {"visible", YGOverflowVisible}, {"hidden", YGOverflowHidden}, {"scroll", YGOverflowScroll}};

const std::map<std::string, YGFlexDirection> kFlexDirectionMap = {{"row", YGFlexDirectionRow},
                                                                  {"row-reverse", YGFlexDirectionRowReverse},
                                                                  {"column", YGFlexDirectionColumn},
                                                                  {"column-reverse", YGFlexDirectionColumnReverse}};
const std::map<std::string, YGWrap> kWrapModeMap = {
    {"nowrap", YGWrapNoWrap}, {"wrap", YGWrapWrap}, {"wrap-reverse", YGWrapWrapReverse}};

const std::map<std::string, YGJustify> kJustifyMap = {
    {"flex-start", YGJustifyFlexStart},     {"center", YGJustifyCenter},
    {"flex-end", YGJustifyFlexEnd},         {"space-between", YGJustifySpaceBetween},
    {"space-around", YGJustifySpaceAround}, {"space-evenly", YGJustifySpaceEvenly}};

const std::map<std::string, YGAlign> kAlignMap = {{"auto", YGAlignAuto},
                                                  {"flex-start", YGAlignFlexStart},
                                                  {"center", YGAlignCenter},
                                                  {"flex-end", YGAlignFlexEnd},
                                                  {"stretch", YGAlignStretch},
                                                  {"baseline", YGAlignBaseline},
                                                  {"space-between", YGAlignSpaceBetween},
                                                  {"space-around", YGAlignSpaceAround}};

const std::map<std::string, YGEdge> kMarginMap = {
    {"margin", YGEdgeAll},         {"marginVertical", YGEdgeVertical}, {"marginHorizontal", YGEdgeHorizontal},
    {"marginLeft", YGEdgeLeft},    {"marginTop", YGEdgeTop},           {"marginRight", YGEdgeRight},
    {"marginBottom", YGEdgeBottom}};

const std::map<std::string, YGEdge> kPaddingMap = {
    {"padding", YGEdgeAll},         {"paddingVertical", YGEdgeVertical}, {"paddingHorizontal", YGEdgeHorizontal},
    {"paddingLeft", YGEdgeLeft},    {"paddingTop", YGEdgeTop},           {"paddingRight", YGEdgeRight},
    {"paddingBottom", YGEdgeBottom}};

const std::map<std::string, YGEdge> kPositionMap = {
    {"left", YGEdgeLeft}, {"top", YGEdgeTop}, {"right", YGEdgeRight}, {"bottom", YGEdgeBottom}};

const std::map<std::string, YGEdge> kBorderMap = {{"borderWidth", YGEdgeAll},
                                                  {"borderLeftWidth", YGEdgeLeft},
                                                  {"borderTopWidth", YGEdgeTop},
                                                  {"borderRightWidth", YGEdgeRight},
                                                  {"borderBottomWidth", YGEdgeBottom}};

const std::map<std::string, YGPositionType> kPositionTypeMap = {
    {"static", YGPositionTypeStatic}, {"relative", YGPositionTypeRelative}, {"absolute", YGPositionTypeAbsolute}};

const std::map<std::string, YGDisplay> kDisplayTypeMap = {{"flex", YGDisplayFlex}, {"none", YGDisplayNone}};

const std::map<std::string, YGDirection> kDirectionMap = {
    {"inherit", YGDirectionInherit}, {"ltr", YGDirectionLTR}, {"rtl", YGDirectionRTL}};

#define YG_SET_NUMBER_PERCENT_AUTO_DECL(NAME)                                                      \
  void YogaLayoutNode::SetYG##NAME(std::shared_ptr<footstone::value::HippyValue> hippy_value) {    \
    footstone::value::HippyValue::Type type = hippy_value->GetType();                              \
    if (type == footstone::value::HippyValue::Type::kNumber) {                                     \
      auto value = static_cast<float>(hippy_value->ToDoubleChecked());                             \
      YGNodeStyleSet##NAME(yoga_node_, value);                                                     \
    } else if (type == footstone::value::HippyValue::Type::kString) {                              \
      std::string value = hippy_value->ToStringChecked();                                          \
      if (value == "auto") {                                                                       \
        YGNodeStyleSet##NAME##Auto(yoga_node_);                                                    \
      } else if (value.at(value.length() - 1) == '%') {                                            \
        YGNodeStyleSet##NAME##Percent(yoga_node_, std::stof(value.substr(0, value.length() - 1))); \
      } else {                                                                                     \
        FOOTSTONE_DCHECK(false);                                                                   \
      }                                                                                            \
    } else {                                                                                       \
      FOOTSTONE_DCHECK(false);                                                                     \
    }                                                                                              \
  }

#define YG_SET_NUMBER_PERCENT_DECL(NAME)                                                           \
  void YogaLayoutNode::SetYG##NAME(std::shared_ptr<footstone::value::HippyValue> hippy_value) {    \
    footstone::value::HippyValue::Type type = hippy_value->GetType();                              \
    if (type == footstone::value::HippyValue::Type::kNumber) {                                     \
      auto value = static_cast<float>(hippy_value->ToDoubleChecked());                             \
      YGNodeStyleSet##NAME(yoga_node_, value);                                                     \
    } else if (type == footstone::value::HippyValue::Type::kString) {                              \
      std::string value = hippy_value->ToStringChecked();                                          \
      if (value.at(value.length() - 1) == '%') {                                                   \
        YGNodeStyleSet##NAME##Percent(yoga_node_, std::stof(value.substr(0, value.length() - 1))); \
      } else {                                                                                     \
        FOOTSTONE_DCHECK(false);                                                                   \
      }                                                                                            \
    } else {                                                                                       \
      FOOTSTONE_DCHECK(false);                                                                     \
    }                                                                                              \
  }

#define YG_SET_EDGE_NUMBER_PRECENT_DECL(NAME)                                                                \
  void YogaLayoutNode::SetYG##NAME(YGEdge edge, std::shared_ptr<footstone::value::HippyValue> hippy_value) { \
    footstone::value::HippyValue::Type type = hippy_value->GetType();                                        \
    if (type == footstone::value::HippyValue::Type::kNumber) {                                               \
      auto value = static_cast<float>(hippy_value->ToDoubleChecked());                                       \
      YGNodeStyleSet##NAME(yoga_node_, edge, value);                                                         \
    } else if (type == footstone::value::HippyValue::Type::kString) {                                        \
      std::string value = hippy_value->ToStringChecked();                                                    \
      if (value.at(value.length() - 1) == '%') {                                                             \
        YGNodeStyleSet##NAME##Percent(yoga_node_, edge, std::stof(value.substr(0, value.length() - 1)));     \
      } else {                                                                                               \
        FOOTSTONE_DCHECK(false);                                                                             \
      }                                                                                                      \
    } else {                                                                                                 \
      FOOTSTONE_DCHECK(false);                                                                               \
    }                                                                                                        \
  }

#define YG_SET_EDGE_NUMBER_PERCENT_AUTO_DECL(NAME)                                                           \
  void YogaLayoutNode::SetYG##NAME(YGEdge edge, std::shared_ptr<footstone::value::HippyValue> hippy_value) { \
    footstone::value::HippyValue::Type type = hippy_value->GetType();                                        \
    if (type == footstone::value::HippyValue::Type::kNumber) {                                               \
      float value = static_cast<float>(hippy_value->ToDoubleChecked());                                      \
      YGNodeStyleSet##NAME(yoga_node_, edge, value);                                                         \
    } else if (type == footstone::value::HippyValue::Type::kString) {                                        \
      std::string value = hippy_value->ToStringChecked();                                                    \
      if (value == "auto") {                                                                                 \
        YGNodeStyleSet##NAME##Auto(yoga_node_, edge);                                                        \
      } else if (value.at(value.length() - 1) == '%') {                                                      \
        YGNodeStyleSet##NAME##Percent(yoga_node_, edge, std::stof(value.substr(0, value.length() - 1)));     \
      } else {                                                                                               \
        FOOTSTONE_DCHECK(false);                                                                             \
      }                                                                                                      \
    } else {                                                                                                 \
      FOOTSTONE_DCHECK(false);                                                                               \
    }                                                                                                        \
  }

#define YG_SET_EDGE_NUMBER_DECL(NAME)                                                                        \
  void YogaLayoutNode::SetYG##NAME(YGEdge edge, std::shared_ptr<footstone::value::HippyValue> hippy_value) { \
    footstone::value::HippyValue::Type type = hippy_value->GetType();                                        \
    if (type == footstone::value::HippyValue::Type::kNumber) {                                               \
      float value = static_cast<float>(hippy_value->ToDoubleChecked());                                      \
      YGNodeStyleSet##NAME(yoga_node_, edge, value);                                                         \
    } else {                                                                                                 \
      FOOTSTONE_DCHECK(false);                                                                               \
    }                                                                                                        \
  }

static YGOverflow GetFlexOverflow(const std::string& overflow) {
  auto iter = kOverflowMap.find(overflow);
  if (iter == kOverflowMap.end()) return YGOverflowVisible;
  return iter->second;
}

static YGFlexDirection GetFlexDirection(const std::string& flex_direction) {
  auto iter = kFlexDirectionMap.find(flex_direction);
  if (iter == kFlexDirectionMap.end()) return YGFlexDirectionColumn;
  return iter->second;
}

static YGWrap GetFlexWrapMode(const std::string& wrap_mode) {
  auto iter = kWrapModeMap.find(wrap_mode);
  if (iter == kWrapModeMap.end()) return YGWrapNoWrap;
  return iter->second;
}

static YGJustify GetFlexJustify(const std::string& justify_content) {
  auto iter = kJustifyMap.find(justify_content);
  if (iter == kJustifyMap.end()) return YGJustifyFlexStart;
  return iter->second;
}

static YGAlign GetFlexAlign(const std::string& align) {
  auto iter = kAlignMap.find(align);
  if (iter == kAlignMap.end()) return YGAlignStretch;
  return iter->second;
}

#define YG_EDGE_DECL(NAME)                                 \
  static YGEdge Get##NAME##Edge(const std::string& edge) { \
    auto iter = k##NAME##Map.find(edge);                   \
    FOOTSTONE_CHECK(iter != k##NAME##Map.end());           \
    return iter->second;                                   \
  }

YG_EDGE_DECL(Margin)

YG_EDGE_DECL(Padding)

YG_EDGE_DECL(Border)

YG_EDGE_DECL(Position)

static YGPositionType GetPositionType(const std::string& position_type) {
  auto iter = kPositionTypeMap.find(position_type);
  if (iter == kPositionTypeMap.end()) return YGPositionTypeRelative;
  return iter->second;
}

static YGDisplay GetDisplayType(const std::string& display_type) {
  auto iter = kDisplayTypeMap.find(display_type);
  if (iter == kDisplayTypeMap.end()) return YGDisplayFlex;
  return iter->second;
}

static YGDirection GetDirection(const std::string& direction) {
  auto iter = kDirectionMap.find(direction);
  if (iter == kDirectionMap.end()) return YGDirectionLTR;
  return iter->second;
}

static YGEdge GetYGEdgeFromEdge(hippy::dom::Edge edge) {
  if (hippy::dom::Edge::EdgeLeft == edge) {
    return YGEdge::YGEdgeLeft;
  } else if (hippy::dom::Edge::EdgeTop == edge) {
    return YGEdge::YGEdgeTop;
  } else if (hippy::dom::Edge::EdgeRight == edge) {
    return YGEdge::YGEdgeRight;
  } else if (hippy::dom::Edge::EdgeBottom == edge) {
    return YGEdge::YGEdgeBottom;
  } else {
    FOOTSTONE_UNREACHABLE();
  }
}

YogaLayoutNode::YogaLayoutNode() : key_(global_measure_function_key.fetch_add(1)) { Allocate(); }

YogaLayoutNode::~YogaLayoutNode() {
  std::lock_guard<std::mutex> lock(mutex);
  const auto it = measure_function_map.find(key_);
  if (it != measure_function_map.end()) measure_function_map.erase(it);
  Deallocate();
}

void YogaLayoutNode::CalculateLayout(float parent_width, float parent_height, Direction direction,
                                     void* layout_context) {
  assert(yoga_node_ != nullptr);
  YGDirection yoga_direction;
  if (direction == hippy::dom::Direction::Inherit) {
    yoga_direction = YGDirectionInherit;
  } else if (direction == hippy::dom::Direction::LTR) {
    yoga_direction = YGDirectionLTR;
  } else if (direction == hippy::dom::Direction::RTL) {
    yoga_direction = YGDirectionRTL;
  } else {
    FOOTSTONE_UNREACHABLE();
  }

  YGNodeCalculateLayout(yoga_node_, parent_width, parent_height, yoga_direction);
}

void YogaLayoutNode::SetLayoutStyles(
    const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
    const std::vector<std::string>& style_delete) {
  Parser(style_update, style_delete);
}

void YogaLayoutNode::SetWidth(float width) { YGNodeStyleSetWidth(yoga_node_, width); }

void YogaLayoutNode::SetHeight(float height) { YGNodeStyleSetHeight(yoga_node_, height); }

void YogaLayoutNode::SetScaleFactor(float scale_factor) { YGConfigSetPointScaleFactor(yoga_config_, scale_factor); }

static LayoutMeasureMode ToLayoutMeasureMode(YGMeasureMode measure_mode) {
  if (measure_mode == YGMeasureMode::YGMeasureModeUndefined) {
    return LayoutMeasureMode::Undefined;
  }
  if (measure_mode == YGMeasureMode::YGMeasureModeExactly) {
    return LayoutMeasureMode::Exactly;
  }
  if (measure_mode == YGMeasureMode::YGMeasureModeAtMost) {
    return LayoutMeasureMode::AtMost;
  }
  FOOTSTONE_UNREACHABLE();
}

static YGSize YGMeasureFunction(YGNodeRef node, float width, YGMeasureMode width_mode, float height,
                                YGMeasureMode height_mode) {
  auto yoga_node = reinterpret_cast<YogaLayoutNode*>(YGNodeGetContext(node));
  int64_t key = yoga_node->GetKey();
  auto iter = measure_function_map.find(key);
  if (iter != measure_function_map.end()) {
    auto size = iter->second(width, ToLayoutMeasureMode(width_mode), height, ToLayoutMeasureMode(height_mode), nullptr);
    YGSize result;
    result.width = size.width;
    result.height = size.height;
    return result;
  }
  return YGSize{0, 0};
}

void YogaLayoutNode::SetMeasureFunction(MeasureFunction measure_function) {
  measure_function_map[key_] = measure_function;
  YGNodeSetContext(yoga_node_, reinterpret_cast<void*>(this));
  return YGNodeSetMeasureFunc(yoga_node_, YGMeasureFunction);
}

bool YogaLayoutNode::HasMeasureFunction() { return measure_function_map.find(key_) != measure_function_map.end(); }
float YogaLayoutNode::GetLeft() { return YGNodeLayoutGetLeft(yoga_node_); }

float YogaLayoutNode::GetTop() { return YGNodeLayoutGetTop(yoga_node_); }

float YogaLayoutNode::GetRight() { return YGNodeLayoutGetRight(yoga_node_); }

float YogaLayoutNode::GetBottom() { return YGNodeLayoutGetBottom(yoga_node_); }

float YogaLayoutNode::GetWidth() { return YGNodeLayoutGetWidth(yoga_node_); }

float YogaLayoutNode::GetHeight() { return YGNodeLayoutGetHeight(yoga_node_); }

float YogaLayoutNode::GetMargin(Edge edge) {
  YGEdge ygedge = GetYGEdgeFromEdge(edge);
  return YGNodeLayoutGetMargin(yoga_node_, ygedge);
}

float YogaLayoutNode::GetPadding(Edge edge) {
  YGEdge ygedge = GetYGEdgeFromEdge(edge);
  return YGNodeLayoutGetPadding(yoga_node_, ygedge);
}

float YogaLayoutNode::GetBorder(Edge edge) {
  YGEdge ygedge = GetYGEdgeFromEdge(edge);
  return YGNodeLayoutGetBorder(yoga_node_, ygedge);
}

float YogaLayoutNode::GetStyleWidth() { return YGNodeStyleGetWidth(yoga_node_).value; }

float YogaLayoutNode::GetStyleHeight() { return YGNodeStyleGetHeight(yoga_node_).value; }

void YogaLayoutNode::SetPosition(Edge edge, float position) {
  YGEdge ygedge = GetYGEdgeFromEdge(edge);
  YGNodeStyleSetPosition(yoga_node_, ygedge, position);
}

bool YogaLayoutNode::LayoutHadOverflow() { return YGNodeLayoutGetHadOverflow(yoga_node_); }

void YogaLayoutNode::InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) {
  if (YGNodeHasMeasureFunc(yoga_node_)) return;
  auto node = std::static_pointer_cast<YogaLayoutNode>(child);
  YGNodeInsertChild(yoga_node_, node->GetLayoutEngineNodeRef(), index);
  children_.insert(children_.begin() + index, node);
  node->parent_ = shared_from_this();
}

void YogaLayoutNode::RemoveChild(const std::shared_ptr<LayoutNode> child) {
  auto node = std::static_pointer_cast<YogaLayoutNode>(child);
  YGNodeRemoveChild(yoga_node_, node->GetLayoutEngineNodeRef());
  auto iter = std::find(children_.begin(), children_.end(), node);
  if (iter != children_.end()) {
    children_.erase(iter);
  }
}

bool YogaLayoutNode::HasNewLayout() { return YGNodeGetHasNewLayout(yoga_node_); }

void YogaLayoutNode::SetHasNewLayout(bool has_new_layout) { YGNodeSetHasNewLayout(yoga_node_, has_new_layout); }

void YogaLayoutNode::MarkDirty() { YGNodeMarkDirty(yoga_node_); }

bool YogaLayoutNode::HasParentEngineNode() {
  if (parent_.lock() != nullptr && parent_.lock()->yoga_node_ != nullptr) {
    return true;
  }
  return false;
}

void YogaLayoutNode::Print() {
#ifdef DEBUG
  YGNodePrint(yoga_node_, (YGPrintOptions)(YGPrintOptionsLayout | YGPrintOptionsStyle | YGPrintOptionsChildren));
#endif
}

bool YogaLayoutNode::IsDirty() { return YGNodeIsDirty(yoga_node_); }

void YogaLayoutNode::Reset() { YGNodeReset(yoga_node_); }

void YogaLayoutNode::Parser(
    const std::unordered_map<std::string, std::shared_ptr<footstone::value::HippyValue>>& style_update,
    const std::vector<std::string>& style_delete) {
  if (style_update.find(kWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kWidth)->second;
    SetYGWidth(hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kWidth);
    if (it != style_delete.end()) YGNodeStyleSetWidth(yoga_node_, NAN);
  }
  if (style_update.find(kMinWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kMinWidth)->second;
    SetYGMinWidth(hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMinWidth);
    if (it != style_delete.end()) YGNodeStyleSetMinWidth(yoga_node_, NAN);
  }
  if (style_update.find(kMaxWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kMaxWidth)->second;
    SetYGMaxWidth(hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMaxWidth);
    if (it != style_delete.end()) YGNodeStyleSetMaxWidth(yoga_node_, NAN);
  }
  if (style_update.find(kHeight) != style_update.end()) {
    auto hippy_value = style_update.find(kHeight)->second;
    SetYGHeight(hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kHeight);
    if (it != style_delete.end()) YGNodeStyleSetHeight(yoga_node_, NAN);
  }
  if (style_update.find(kMinHeight) != style_update.end()) {
    auto hippy_value = style_update.find(kMinHeight)->second;
    SetYGMinHeight(hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMinHeight);
    if (it != style_delete.end()) YGNodeStyleSetMinHeight(yoga_node_, NAN);
  }
  if (style_update.find(kMaxHeight) != style_update.end()) {
    auto hippy_value = style_update.find(kMaxHeight)->second;
    SetYGMaxHeight(hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMaxHeight);
    if (it != style_delete.end()) YGNodeStyleSetMaxHeight(yoga_node_, NAN);
  }
  if (style_update.find(kFlex) != style_update.end()) {
    SetFlex(static_cast<float>(style_update.find(kFlex)->second->ToDoubleChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlex);
    if (it != style_delete.end()) YGNodeStyleSetFlex(yoga_node_, 0);
  }
  if (style_update.find(kFlexGrow) != style_update.end()) {
    SetFlexGrow(static_cast<float>(style_update.find(kFlexGrow)->second->ToDoubleChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexGrow);
    if (it != style_delete.end()) YGNodeStyleSetFlexGrow(yoga_node_, 0);
  }
  if (style_update.find(kFlexShrink) != style_update.end()) {
    SetFlexShrink(static_cast<float>(style_update.find(kFlexShrink)->second->ToDoubleChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexShrink);
    if (it != style_delete.end()) YGNodeStyleSetFlexShrink(yoga_node_, 0);
  }
  if (style_update.find(kFlexBasis) != style_update.end()) {
    SetFlexBasis(static_cast<float>(style_update.find(kFlexBasis)->second->ToDoubleChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexBasis);
    if (it != style_delete.end()) YGNodeStyleSetFlexBasis(yoga_node_, NAN);
  }
  if (style_update.find(kDirection) != style_update.end()) {
    SetDirection(GetDirection(style_update.find(kDirection)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kDirection);
    if (it != style_delete.end()) YGNodeStyleSetDirection(yoga_node_, YGDirectionLTR);
  }
  if (style_update.find(kFlexDirection) != style_update.end()) {
    SetFlexDirection(GetFlexDirection(style_update.find(kFlexDirection)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexDirection);
    if (it != style_delete.end()) YGNodeStyleSetFlexDirection(yoga_node_, YGFlexDirectionColumn);
  }
  if (style_update.find(kFlexWrap) != style_update.end()) {
    SetFlexWrap(GetFlexWrapMode(style_update.find(kFlexWrap)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kFlexWrap);
    if (it != style_delete.end()) YGNodeStyleSetFlexWrap(yoga_node_, YGWrapNoWrap);
  }
  if (style_update.find(kAilgnSelf) != style_update.end()) {
    SetAlignSelf(GetFlexAlign(style_update.find(kAilgnSelf)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kAilgnSelf);
    if (it != style_delete.end()) YGNodeStyleSetAlignSelf(yoga_node_, YGAlignAuto);
  }
  if (style_update.find(kAlignItems) != style_update.end()) {
    SetAlignItems(GetFlexAlign(style_update.find(kAlignItems)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kAlignItems);
    if (it != style_delete.end()) YGNodeStyleSetAlignItems(yoga_node_, YGAlignStretch);
  }
  if (style_update.find(kJustifyContent) != style_update.end()) {
    SetJustifyContent(GetFlexJustify(style_update.find(kJustifyContent)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kJustifyContent);
    if (it != style_delete.end()) YGNodeStyleSetJustifyContent(yoga_node_, YGJustifyFlexStart);
  }
  if (style_update.find(kOverflow) != style_update.end()) {
    SetOverflow(GetFlexOverflow(style_update.find(kOverflow)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kOverflow);
    if (it != style_delete.end()) YGNodeStyleSetOverflow(yoga_node_, YGOverflowVisible);
  }
  if (style_update.find(kDisplay) != style_update.end()) {
    SetDisplay(GetDisplayType(style_update.find(kDisplay)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kDisplay);
    if (it != style_delete.end()) YGNodeStyleSetDisplay(yoga_node_, YGDisplayFlex);
  }
  if (style_update.find(kMargin) != style_update.end()) {
    auto hippy_value = style_update.find(kMargin)->second;
    SetYGMargin(GetMarginEdge(kMargin), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMargin);
    if (it != style_delete.end()) YGNodeStyleSetMargin(yoga_node_, YGEdgeAll, 0);
  }
  if (style_update.find(kMarginVertical) != style_update.end()) {
    auto hippy_value = style_update.find(kMarginVertical)->second;
    SetYGMargin(GetMarginEdge(kMarginVertical), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMarginVertical);
    if (it != style_delete.end()) YGNodeStyleSetMargin(yoga_node_, YGEdgeVertical, 0);
  }
  if (style_update.find(kMarginHorizontal) != style_update.end()) {
    auto hippy_value = style_update.find(kMarginHorizontal)->second;
    SetYGMargin(GetMarginEdge(kMarginHorizontal), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMarginHorizontal);
    if (it != style_delete.end()) YGNodeStyleSetMargin(yoga_node_, YGEdgeHorizontal, 0);
  }
  if (style_update.find(kMarginLeft) != style_update.end()) {
    auto hippy_value = style_update.find(kMarginLeft)->second;
    SetYGMargin(GetMarginEdge(kMarginLeft), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMarginLeft);
    if (it != style_delete.end()) YGNodeStyleSetMargin(yoga_node_, YGEdgeLeft, 0);
  }
  if (style_update.find(kMarginRight) != style_update.end()) {
    auto hippy_value = style_update.find(kMarginRight)->second;
    SetYGMargin(GetMarginEdge(kMarginRight), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMarginRight);
    if (it != style_delete.end()) YGNodeStyleSetMargin(yoga_node_, YGEdgeRight, 0);
  }
  if (style_update.find(kMarginTop) != style_update.end()) {
    auto hippy_value = style_update.find(kMarginTop)->second;
    SetYGMargin(GetMarginEdge(kMarginTop), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMarginTop);
    if (it != style_delete.end()) YGNodeStyleSetMargin(yoga_node_, YGEdgeTop, 0);
  }
  if (style_update.find(kMarginBottom) != style_update.end()) {
    auto hippy_value = style_update.find(kMarginBottom)->second;
    SetYGMargin(GetMarginEdge(kMarginBottom), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kMarginBottom);
    if (it != style_delete.end()) YGNodeStyleSetMargin(yoga_node_, YGEdgeBottom, 0);
  }
  if (style_update.find(kPadding) != style_update.end()) {
    auto hippy_value = style_update.find(kPadding)->second;
    SetYGPadding(GetPaddingEdge(kPadding), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPadding);
    if (it != style_delete.end()) YGNodeStyleSetPadding(yoga_node_, YGEdgeAll, 0);
  }
  if (style_update.find(kPaddingVertical) != style_update.end()) {
    auto hippy_value = style_update.find(kPaddingVertical)->second;
    SetYGPadding(GetPaddingEdge(kPaddingVertical), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPaddingVertical);
    if (it != style_delete.end()) YGNodeStyleSetPadding(yoga_node_, YGEdgeVertical, 0);
  }
  if (style_update.find(kPaddingHorizontal) != style_update.end()) {
    auto hippy_value = style_update.find(kPaddingHorizontal)->second;
    SetYGPadding(GetPaddingEdge(kPaddingHorizontal), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPaddingHorizontal);
    if (it != style_delete.end()) YGNodeStyleSetPadding(yoga_node_, YGEdgeHorizontal, 0);
  }
  if (style_update.find(kPaddingLeft) != style_update.end()) {
    auto hippy_value = style_update.find(kPaddingLeft)->second;
    SetYGPadding(GetPaddingEdge(kPaddingLeft), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPaddingLeft);
    if (it != style_delete.end()) YGNodeStyleSetPadding(yoga_node_, YGEdgeLeft, 0);
  }
  if (style_update.find(kPaddingRight) != style_update.end()) {
    auto hippy_value = style_update.find(kPaddingRight)->second;
    SetYGPadding(GetPaddingEdge(kPaddingRight), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPaddingRight);
    if (it != style_delete.end()) YGNodeStyleSetPadding(yoga_node_, YGEdgeRight, 0);
  }
  if (style_update.find(kPaddingTop) != style_update.end()) {
    auto hippy_value = style_update.find(kPaddingTop)->second;
    SetYGPadding(GetPaddingEdge(kPaddingTop), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPaddingTop);
    if (it != style_delete.end()) YGNodeStyleSetPadding(yoga_node_, YGEdgeTop, 0);
  }
  if (style_update.find(kPaddingBottom) != style_update.end()) {
    auto hippy_value = style_update.find(kPaddingBottom)->second;
    SetYGPadding(GetPaddingEdge(kPaddingBottom), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPaddingBottom);
    if (it != style_delete.end()) YGNodeStyleSetPadding(yoga_node_, YGEdgeBottom, 0);
  }
  if (style_update.find(kBorderWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kBorderWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderWidth), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kBorderWidth);
    if (it != style_delete.end()) YGNodeStyleSetBorder(yoga_node_, YGEdgeAll, 0);
  }
  if (style_update.find(kBorderLeftWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kBorderLeftWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderLeftWidth), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kBorderLeftWidth);
    if (it != style_delete.end()) YGNodeStyleSetBorder(yoga_node_, YGEdgeLeft, 0);
  }
  if (style_update.find(kBorderTopWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kBorderTopWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderTopWidth), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kBorderTopWidth);
    if (it != style_delete.end()) YGNodeStyleSetBorder(yoga_node_, YGEdgeTop, 0);
  }
  if (style_update.find(kBorderRightWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kBorderRightWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderRightWidth), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kBorderRightWidth);
    if (it != style_delete.end()) YGNodeStyleSetBorder(yoga_node_, YGEdgeRight, 0);
  }
  if (style_update.find(kBorderBottomWidth) != style_update.end()) {
    auto hippy_value = style_update.find(kBorderBottomWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderBottomWidth), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kBorderBottomWidth);
    if (it != style_delete.end()) YGNodeStyleSetBorder(yoga_node_, YGEdgeBottom, 0);
  }
  if (style_update.find(kLeft) != style_update.end()) {
    auto hippy_value = style_update.find(kLeft)->second;
    SetYGPosition(GetPositionEdge(kLeft), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kLeft);
    if (it != style_delete.end()) YGNodeStyleSetPosition(yoga_node_, YGEdgeLeft, 0);
  }
  if (style_update.find(kRight) != style_update.end()) {
    auto hippy_value = style_update.find(kRight)->second;
    SetYGPosition(GetPositionEdge(kRight), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kRight);
    if (it != style_delete.end()) YGNodeStyleSetPosition(yoga_node_, YGEdgeRight, 0);
  }
  if (style_update.find(kTop) != style_update.end()) {
    auto hippy_value = style_update.find(kTop)->second;
    SetYGPosition(GetPositionEdge(kTop), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kTop);
    if (it != style_delete.end()) YGNodeStyleSetPosition(yoga_node_, YGEdgeTop, 0);
  }
  if (style_update.find(kBottom) != style_update.end()) {
    auto hippy_value = style_update.find(kBottom)->second;
    SetYGPosition(GetPositionEdge(kBottom), hippy_value);
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kBottom);
    if (it != style_delete.end()) YGNodeStyleSetPosition(yoga_node_, YGEdgeBottom, 0);
  }
  if (style_update.find(kPosition) != style_update.end()) {
    SetPositionType(GetPositionType(style_update.find(kPosition)->second->ToStringChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kPosition);
    if (it != style_delete.end()) YGNodeStyleSetPositionType(yoga_node_, YGPositionTypeRelative);
  }
  if (style_update.find(kAspectRatio) != style_update.end()) {
    SetAspectRatio(static_cast<float>(style_update.find(kAspectRatio)->second->ToDoubleChecked()));
  } else {
    auto it = std::find(style_delete.begin(), style_delete.end(), kAspectRatio);
    if (it != style_delete.end()) YGNodeStyleSetAspectRatio(yoga_node_, 0);
  }

  // if (style_update.find(kAlignContent) != style_update.end()) {
  //   SetAlignContent(GetFlexAlign(style_update.find(kAlignContent)->second->ToString()));
  // }
}

YG_SET_NUMBER_PERCENT_AUTO_DECL(Width)

YG_SET_NUMBER_PERCENT_AUTO_DECL(Height)

YG_SET_NUMBER_PERCENT_DECL(MaxWidth)

YG_SET_NUMBER_PERCENT_DECL(MaxHeight)

YG_SET_NUMBER_PERCENT_DECL(MinWidth)

YG_SET_NUMBER_PERCENT_DECL(MinHeight)

void YogaLayoutNode::SetDirection(YGDirection direction) { YGNodeStyleSetDirection(yoga_node_, direction); }

void YogaLayoutNode::SetFlexBasis(float flex_basis) { YGNodeStyleSetFlexBasis(yoga_node_, flex_basis); }

void YogaLayoutNode::SetFlex(float flex) { YGNodeStyleSetFlex(yoga_node_, flex); }

void YogaLayoutNode::SetFlexGrow(float flex_grow) { YGNodeStyleSetFlexGrow(yoga_node_, flex_grow); }

void YogaLayoutNode::SetFlexShrink(float flex_shrink) { YGNodeStyleSetFlexShrink(yoga_node_, flex_shrink); }

void YogaLayoutNode::SetFlexDirection(YGFlexDirection flex_direction) {
  YGNodeStyleSetFlexDirection(yoga_node_, flex_direction);
}

void YogaLayoutNode::SetPositionType(YGPositionType position_type) {
  YGNodeStyleSetPositionType(yoga_node_, position_type);
}

YG_SET_EDGE_NUMBER_PRECENT_DECL(Position)

YG_SET_EDGE_NUMBER_PRECENT_DECL(Padding)

YG_SET_EDGE_NUMBER_PERCENT_AUTO_DECL(Margin)

YG_SET_EDGE_NUMBER_DECL(Border)

void YogaLayoutNode::SetFlexWrap(YGWrap wrap_mode) { YGNodeStyleSetFlexWrap(yoga_node_, wrap_mode); }

void YogaLayoutNode::SetJustifyContent(YGJustify justify) { YGNodeStyleSetJustifyContent(yoga_node_, justify); }

// void YogaLayoutNode::SetAlignContent(YGAlign align_content) { YGNodeStyleSetAlignContent(yoga_node_, align_content);
// }

void YogaLayoutNode::SetAlignItems(YGAlign align_items) { YGNodeStyleSetAlignItems(yoga_node_, align_items); }

void YogaLayoutNode::SetAlignSelf(YGAlign align_self) { YGNodeStyleSetAlignSelf(yoga_node_, align_self); }

void YogaLayoutNode::SetDisplay(YGDisplay display) { YGNodeStyleSetDisplay(yoga_node_, display); }

// void SetNodeType(NodeType node_type);

void YogaLayoutNode::SetOverflow(YGOverflow overflow) { YGNodeStyleSetOverflow(yoga_node_, overflow); }

void YogaLayoutNode::SetAspectRatio(float aspectRatio) { YGNodeStyleSetAspectRatio(yoga_node_, aspectRatio); }

void YogaLayoutNode::Allocate() {
  yoga_config_ = YGConfigNew();
  yoga_node_ = YGNodeNewWithConfig(yoga_config_);
}

void YogaLayoutNode::Deallocate() {
  YGNodeFree(yoga_node_);
  YGConfigFree(yoga_config_);
}

std::shared_ptr<LayoutNode> CreateLayoutNode() { return std::make_shared<YogaLayoutNode>(); }

}  // namespace dom
}  // namespace hippy
