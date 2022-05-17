#include "dom/yoga_layout_node.h"

#include <map>

#include "Yoga.h"
#include "base/logging.h"
#include "dom/node_props.h"

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
  void YogaLayoutNode::SetYG##NAME(std::shared_ptr<tdf::base::DomValue> dom_value) {               \
    tdf::base::DomValue::Type type = dom_value->GetType();                                         \
    if (type == tdf::base::DomValue::Type::kNumber) {                                              \
      auto value = static_cast<float>(dom_value->ToDoubleChecked());                               \
      YGNodeStyleSet##NAME(yoga_node_, value);                                                     \
    } else if (type == tdf::base::DomValue::Type::kString) {                                       \
      std::string value = dom_value->ToStringChecked();                                            \
      if (value == "auto") {                                                                       \
        YGNodeStyleSet##NAME##Auto(yoga_node_);                                                    \
      } else if (value.at(value.length() - 1) == '%') {                                            \
        YGNodeStyleSet##NAME##Percent(yoga_node_, std::stof(value.substr(0, value.length() - 1))); \
      } else {                                                                                     \
        TDF_BASE_DCHECK(false);                                                                    \
      }                                                                                            \
    } else {                                                                                       \
      TDF_BASE_DCHECK(false);                                                                      \
    }                                                                                              \
  }

#define YG_SET_NUMBER_PERCENT_DECL(NAME)                                                           \
  void YogaLayoutNode::SetYG##NAME(std::shared_ptr<tdf::base::DomValue> dom_value) {               \
    tdf::base::DomValue::Type type = dom_value->GetType();                                         \
    if (type == tdf::base::DomValue::Type::kNumber) {                                              \
      auto value = static_cast<float>(dom_value->ToDoubleChecked());                               \
      YGNodeStyleSet##NAME(yoga_node_, value);                                                     \
    } else if (type == tdf::base::DomValue::Type::kString) {                                       \
      std::string value = dom_value->ToStringChecked();                                            \
      if (value.at(value.length() - 1) == '%') {                                                   \
        YGNodeStyleSet##NAME##Percent(yoga_node_, std::stof(value.substr(0, value.length() - 1))); \
      } else {                                                                                     \
        TDF_BASE_DCHECK(false);                                                                    \
      }                                                                                            \
    } else {                                                                                       \
      TDF_BASE_DCHECK(false);                                                                      \
    }                                                                                              \
  }

#define YG_SET_EDGE_NUMBER_PRECENT_DECL(NAME)                                                            \
  void YogaLayoutNode::SetYG##NAME(YGEdge edge, std::shared_ptr<tdf::base::DomValue> dom_value) {        \
    tdf::base::DomValue::Type type = dom_value->GetType();                                               \
    if (type == tdf::base::DomValue::Type::kNumber) {                                                    \
      auto value = static_cast<float>(dom_value->ToDoubleChecked());                                     \
      YGNodeStyleSet##NAME(yoga_node_, edge, value);                                                     \
    } else if (type == tdf::base::DomValue::Type::kString) {                                             \
      std::string value = dom_value->ToStringChecked();                                                  \
      if (value.at(value.length() - 1) == '%') {                                                         \
        YGNodeStyleSet##NAME##Percent(yoga_node_, edge, std::stof(value.substr(0, value.length() - 1))); \
      } else {                                                                                           \
        TDF_BASE_DCHECK(false);                                                                          \
      }                                                                                                  \
    } else {                                                                                             \
      TDF_BASE_DCHECK(false);                                                                            \
    }                                                                                                    \
  }

#define YG_SET_EDGE_NUMBER_PERCENT_AUTO_DECL(NAME)                                                       \
  void YogaLayoutNode::SetYG##NAME(YGEdge edge, std::shared_ptr<tdf::base::DomValue> dom_value) {        \
    tdf::base::DomValue::Type type = dom_value->GetType();                                               \
    if (type == tdf::base::DomValue::Type::kNumber) {                                                    \
      float value = static_cast<float>(dom_value->ToDoubleChecked());                                    \
      YGNodeStyleSet##NAME(yoga_node_, edge, value);                                                     \
    } else if (type == tdf::base::DomValue::Type::kString) {                                             \
      std::string value = dom_value->ToStringChecked();                                                  \
      if (value == "auto") {                                                                             \
        YGNodeStyleSet##NAME##Auto(yoga_node_, edge);                                                    \
      } else if (value.at(value.length() - 1) == '%') {                                                  \
        YGNodeStyleSet##NAME##Percent(yoga_node_, edge, std::stof(value.substr(0, value.length() - 1))); \
      } else {                                                                                           \
        TDF_BASE_DCHECK(false);                                                                          \
      }                                                                                                  \
    } else {                                                                                             \
      TDF_BASE_DCHECK(false);                                                                            \
    }                                                                                                    \
  }

#define YG_SET_EDGE_NUMBER_DECL(NAME)                                                             \
  void YogaLayoutNode::SetYG##NAME(YGEdge edge, std::shared_ptr<tdf::base::DomValue> dom_value) { \
    tdf::base::DomValue::Type type = dom_value->GetType();                                        \
    if (type == tdf::base::DomValue::Type::kNumber) {                                             \
      float value = static_cast<float>(dom_value->ToDoubleChecked());                             \
      YGNodeStyleSet##NAME(yoga_node_, edge, value);                                              \
    } else {                                                                                      \
      TDF_BASE_DCHECK(false);                                                                     \
    }                                                                                             \
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
    TDF_BASE_CHECK(iter != k##NAME##Map.end());            \
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
    TDF_BASE_UNREACHABLE();
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
    TDF_BASE_UNREACHABLE();
  }

  YGNodeCalculateLayout(yoga_node_, parent_width, parent_height, yoga_direction);
}

void YogaLayoutNode::SetLayoutStyles(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) {
  Parser(style_map);
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
  TDF_BASE_UNREACHABLE();
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

float YogaLayoutNode::GetStyleWidth() {
  return YGNodeStyleGetWidth(yoga_node_).value;
}

float YogaLayoutNode::GetStyleHeight() {
  return YGNodeStyleGetHeight(yoga_node_).value;
}

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

void YogaLayoutNode::Print() {YGNodePrint(yoga_node_, YGPrintOptionsLayout | YGPrintOptionsStyle | YGPrintOptionsChildren);}

bool YogaLayoutNode::IsDirty() { return YGNodeIsDirty(yoga_node_); }

void YogaLayoutNode::Reset() { YGNodeReset(yoga_node_); }

void YogaLayoutNode::Parser(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) {
  if (style_map.find(kWidth) != style_map.end()) {
    auto dom_value = style_map.find(kWidth)->second;
    SetYGWidth(dom_value);
  }
  if (style_map.find(kMinWidth) != style_map.end()) {
    auto dom_value = style_map.find(kMinWidth)->second;
    SetYGMinWidth(dom_value);
  }
  if (style_map.find(kMaxWidth) != style_map.end()) {
    auto dom_value = style_map.find(kMaxWidth)->second;
    SetYGMaxWidth(dom_value);
  }
  if (style_map.find(kHeight) != style_map.end()) {
    auto dom_value = style_map.find(kHeight)->second;
    SetYGHeight(dom_value);
  }
  if (style_map.find(kMinHeight) != style_map.end()) {
    auto dom_value = style_map.find(kMinHeight)->second;
    SetYGMinHeight(dom_value);
  }
  if (style_map.find(kMaxHeight) != style_map.end()) {
    auto dom_value = style_map.find(kMaxHeight)->second;
    SetYGMaxHeight(dom_value);
  }
  if (style_map.find(kFlex) != style_map.end()) {
    SetFlex(static_cast<float>(style_map.find(kFlex)->second->ToDoubleChecked()));
  }
  if (style_map.find(kFlexGrow) != style_map.end()) {
    SetFlexGrow(static_cast<float>(style_map.find(kFlexGrow)->second->ToDoubleChecked()));
  }
  if (style_map.find(kFlexShrink) != style_map.end()) {
    SetFlexShrink(static_cast<float>(style_map.find(kFlexShrink)->second->ToDoubleChecked()));
  }
  if (style_map.find(kFlexBasis) != style_map.end()) {
    SetFlexBasis(static_cast<float>(style_map.find(kFlexBasis)->second->ToDoubleChecked()));
  }
  if (style_map.find(kDirection) != style_map.end()) {
    SetDirection(GetDirection(style_map.find(kDirection)->second->ToStringChecked()));
  }
  if (style_map.find(kFlexDirection) != style_map.end()) {
    SetFlexDirection(GetFlexDirection(style_map.find(kFlexDirection)->second->ToStringChecked()));
  }
  if (style_map.find(kFlexWrap) != style_map.end()) {
    SetFlexWrap(GetFlexWrapMode(style_map.find(kFlexWrap)->second->ToStringChecked()));
  }
  if (style_map.find(kAilgnSelf) != style_map.end()) {
    SetAlignSelf(GetFlexAlign(style_map.find(kAilgnSelf)->second->ToStringChecked()));
  }
  if (style_map.find(kAlignItems) != style_map.end()) {
    SetAlignItems(GetFlexAlign(style_map.find(kAlignItems)->second->ToStringChecked()));
  }
  if (style_map.find(kJustifyContent) != style_map.end()) {
    SetJustifyContent(GetFlexJustify(style_map.find(kJustifyContent)->second->ToStringChecked()));
  }
  if (style_map.find(kOverflow) != style_map.end()) {
    SetOverflow(GetFlexOverflow(style_map.find(kOverflow)->second->ToStringChecked()));
  }
  if (style_map.find(kDisplay) != style_map.end()) {
    SetDisplay(GetDisplayType(style_map.find(kDisplay)->second->ToStringChecked()));
  }
  if (style_map.find(kMargin) != style_map.end()) {
    auto dom_value = style_map.find(kMargin)->second;
    SetYGMargin(GetMarginEdge(kMargin), dom_value);
  }
  if (style_map.find(kMarginVertical) != style_map.end()) {
    auto dom_value = style_map.find(kMarginVertical)->second;
    SetYGMargin(GetMarginEdge(kMarginVertical), dom_value);
  }
  if (style_map.find(kMarginHorizontal) != style_map.end()) {
    auto dom_value = style_map.find(kMarginHorizontal)->second;
    SetYGMargin(GetMarginEdge(kMarginHorizontal), dom_value);
  }
  if (style_map.find(kMarginLeft) != style_map.end()) {
    auto dom_value = style_map.find(kMarginLeft)->second;
    SetYGMargin(GetMarginEdge(kMarginLeft), dom_value);
  }
  if (style_map.find(kMarginRight) != style_map.end()) {
    auto dom_value = style_map.find(kMarginRight)->second;
    SetYGMargin(GetMarginEdge(kMarginRight), dom_value);
  }
  if (style_map.find(kMarginTop) != style_map.end()) {
    auto dom_value = style_map.find(kMarginTop)->second;
    SetYGMargin(GetMarginEdge(kMarginTop), dom_value);
  }
  if (style_map.find(kMarginBottom) != style_map.end()) {
    auto dom_value = style_map.find(kMarginBottom)->second;
    SetYGMargin(GetMarginEdge(kMarginBottom), dom_value);
  }
  if (style_map.find(kPadding) != style_map.end()) {
    auto dom_value = style_map.find(kPadding)->second;
    SetYGPadding(GetPaddingEdge(kPadding), dom_value);
  }
  if (style_map.find(kPaddingVertical) != style_map.end()) {
    auto dom_value = style_map.find(kPaddingVertical)->second;
    SetYGPadding(GetPaddingEdge(kPaddingVertical), dom_value);
  }
  if (style_map.find(kPaddingHorizontal) != style_map.end()) {
    auto dom_value = style_map.find(kPaddingHorizontal)->second;
    SetYGPadding(GetPaddingEdge(kPaddingHorizontal), dom_value);
  }
  if (style_map.find(kPaddingLeft) != style_map.end()) {
    auto dom_value = style_map.find(kPaddingLeft)->second;
    SetYGPadding(GetPaddingEdge(kPaddingLeft), dom_value);
  }
  if (style_map.find(kPaddingRight) != style_map.end()) {
    auto dom_value = style_map.find(kPaddingRight)->second;
    SetYGPadding(GetPaddingEdge(kPaddingRight), dom_value);
  }
  if (style_map.find(kPaddingTop) != style_map.end()) {
    auto dom_value = style_map.find(kPaddingTop)->second;
    SetYGPadding(GetPaddingEdge(kPaddingTop), dom_value);
  }
  if (style_map.find(kPaddingBottom) != style_map.end()) {
    auto dom_value = style_map.find(kPaddingBottom)->second;
    SetYGPadding(GetPaddingEdge(kPaddingBottom), dom_value);
  }
  if (style_map.find(kBorderWidth) != style_map.end()) {
    auto dom_value = style_map.find(kBorderWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderWidth), dom_value);
  }
  if (style_map.find(kBorderLeftWidth) != style_map.end()) {
    auto dom_value = style_map.find(kBorderLeftWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderLeftWidth), dom_value);
  }
  if (style_map.find(kBorderTopWidth) != style_map.end()) {
    auto dom_value = style_map.find(kBorderTopWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderTopWidth), dom_value);
  }
  if (style_map.find(kBorderRightWidth) != style_map.end()) {
    auto dom_value = style_map.find(kBorderRightWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderRightWidth), dom_value);
  }
  if (style_map.find(kBorderBottomWidth) != style_map.end()) {
    auto dom_value = style_map.find(kBorderBottomWidth)->second;
    SetYGBorder(GetBorderEdge(kBorderBottomWidth), dom_value);
  }
  if (style_map.find(kLeft) != style_map.end()) {
    auto dom_value = style_map.find(kLeft)->second;
    SetYGPosition(GetPositionEdge(kLeft), dom_value);
  }
  if (style_map.find(kRight) != style_map.end()) {
    auto dom_value = style_map.find(kRight)->second;
    SetYGPosition(GetPositionEdge(kRight), dom_value);
  }
  if (style_map.find(kTop) != style_map.end()) {
    auto dom_value = style_map.find(kTop)->second;
    SetYGPosition(GetPositionEdge(kTop), dom_value);
  }
  if (style_map.find(kBottom) != style_map.end()) {
    auto dom_value = style_map.find(kBottom)->second;
    SetYGPosition(GetPositionEdge(kBottom), dom_value);
  }
  if (style_map.find(kPosition) != style_map.end()) {
    SetPositionType(GetPositionType(style_map.find(kPosition)->second->ToStringChecked()));
  }
  if (style_map.find(kAspectRatio) != style_map.end()) {
    SetAspectRatio(static_cast<float>(style_map.find(kAspectRatio)->second->ToDoubleChecked()));
  }

  // if (style_map.find(kAlignContent) != style_map.end()) {
  //   SetAlignContent(GetFlexAlign(style_map.find(kAlignContent)->second->ToString()));
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
