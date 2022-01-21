#include "dom/taitank_layout_node.h"

#include <map>
#include <mutex>

#include "base/logging.h"
#include "dom/node_props.h"

namespace hippy {
inline namespace dom {

static std::atomic<int64_t> global_measure_function_key{0};
static std::map<int64_t, MeasureFunction> measure_function_map;
static std::mutex mutex;

const std::map<std::string, OverflowType> kOverflowMap = {{"visible", OverflowType::OverflowVisible},
                                                          {"hidden", OverflowType::OverflowHidden},
                                                          {"scroll", OverflowType::OverflowScroll}};

const std::map<std::string, FlexDirection> kFlexDirectionMap = {
    {"row", FlexDirection::FLexDirectionRow},
    {"row-reverse", FlexDirection::FLexDirectionRowReverse},
    {"column", FlexDirection::FLexDirectionColumn},
    {"column-reverse", FlexDirection::FLexDirectionColumnReverse}};

const std::map<std::string, FlexWrapMode> kWrapModeMap = {{"nowrap", FlexWrapMode::FlexNoWrap},
                                                          {"wrap", FlexWrapMode::FlexWrap},
                                                          {"wrap-reverse", FlexWrapMode::FlexWrapReverse}};

const std::map<std::string, FlexAlign> kJustifyMap = {{"flex-start", FlexAlign::FlexAlignStart},
                                                      {"center", FlexAlign::FlexAlignCenter},
                                                      {"flex-end", FlexAlign::FlexAlignEnd},
                                                      {"space-between", FlexAlign::FlexAlignSpaceBetween},
                                                      {"space-around", FlexAlign::FlexAlignSpaceAround},
                                                      {"space-evenly", FlexAlign::FlexAlignSpaceEvenly}};

const std::map<std::string, FlexAlign> kAlignMap = {{"auto", FlexAlign::FlexAlignAuto},
                                                    {"flex-start", FlexAlign::FlexAlignStart},
                                                    {"center", FlexAlign::FlexAlignCenter},
                                                    {"flex-end", FlexAlign::FlexAlignEnd},
                                                    {"stretch", FlexAlign::FlexAlignStretch},
                                                    {"baseline", FlexAlign::FlexAlignBaseline},
                                                    {"space-between", FlexAlign::FlexAlignSpaceBetween},
                                                    {"space-around", FlexAlign::FlexAlignSpaceAround}};

const std::map<std::string, CSSDirection> kMarginMap = {{kMargin, CSSDirection::CSSAll},
                                                        {kMarginVertical, CSSDirection::CSSVertical},
                                                        {kMarginHorizontal, CSSDirection::CSSHorizontal},
                                                        {kMarginLeft, CSSDirection::CSSLeft},
                                                        {kMarginRight, CSSDirection::CSSRight},
                                                        {kMarginTop, CSSDirection::CSSTop},
                                                        {kMarginBottom, CSSDirection::CSSBottom}};

const std::map<std::string, CSSDirection> kPaddingMap = {{kPadding, CSSDirection::CSSAll},
                                                         {kPaddingVertical, CSSDirection::CSSVertical},
                                                         {kPaddingHorizontal, CSSDirection::CSSHorizontal},
                                                         {kPaddingLeft, CSSDirection::CSSLeft},
                                                         {kPaddingRight, CSSDirection::CSSRight},
                                                         {kPaddingTop, CSSDirection::CSSTop},
                                                         {kPaddingBottom, CSSDirection::CSSBottom}};

const std::map<std::string, CSSDirection> kPositionMap = {{kLeft, CSSDirection::CSSLeft},
                                                          {kRight, CSSDirection::CSSRight},
                                                          {kTop, CSSDirection::CSSTop},
                                                          {kBottom, CSSDirection::CSSBottom}};

const std::map<std::string, CSSDirection> kBorderMap = {{kBorderWidth, CSSDirection::CSSAll},
                                                        {kBorderLeftWidth, CSSDirection::CSSLeft},
                                                        {kBorderTopWidth, CSSDirection::CSSTop},
                                                        {kBorderRightWidth, CSSDirection::CSSRight},
                                                        {kBorderBottomWidth, CSSDirection::CSSBottom}};

const std::map<std::string, PositionType> kPositionTypeMap = {{"relative", PositionType::PositionTypeRelative},
                                                              {"absolute", PositionType::PositionTypeAbsolute}};

const std::map<std::string, DisplayType> kDisplayTypeMap = {{"none", DisplayType::DisplayTypeNone}};

const std::map<std::string, HPDirection> kDirectionMap = {
    {"inherit", DirectionInherit}, {"ltr", DirectionLTR}, {"rtl", DirectionRTL}};

#define TAITANK_GET_STYLE_DECL(NAME, TYPE, DEFAULT)      \
  static TYPE GetStyle##NAME(const std::string& key) {   \
    auto iter = k##NAME##Map.find(key);                  \
    if (iter != k##NAME##Map.end()) return iter->second; \
    return DEFAULT;                                      \
  }

TAITANK_GET_STYLE_DECL(Overflow, OverflowType, OverflowType::OverflowVisible)

TAITANK_GET_STYLE_DECL(FlexDirection, FlexDirection, FlexDirection::FLexDirectionColumn)

TAITANK_GET_STYLE_DECL(WrapMode, FlexWrapMode, FlexWrapMode::FlexNoWrap)

TAITANK_GET_STYLE_DECL(Justify, FlexAlign, FlexAlign::FlexAlignStart)

TAITANK_GET_STYLE_DECL(Align, FlexAlign, FlexAlign::FlexAlignStretch)

TAITANK_GET_STYLE_DECL(Margin, CSSDirection, CSSDirection::CSSNONE)

TAITANK_GET_STYLE_DECL(Padding, CSSDirection, CSSDirection::CSSNONE)

TAITANK_GET_STYLE_DECL(Border, CSSDirection, CSSDirection::CSSNONE)

TAITANK_GET_STYLE_DECL(Position, CSSDirection, CSSDirection::CSSNONE)

TAITANK_GET_STYLE_DECL(PositionType, PositionType, PositionType::PositionTypeRelative)

TAITANK_GET_STYLE_DECL(DisplayType, DisplayType, DisplayType::DisplayTypeFlex)

TAITANK_GET_STYLE_DECL(Direction, HPDirection, HPDirection::DirectionLTR)

#define SET_STYLE_VALUE(NAME, DEFAULT)                                          \
  auto dom_value = style_map.find(k##NAME)->second;                             \
  CheckValueType(dom_value->GetType());                                         \
  float value = DEFAULT;                                                        \
  if (dom_value->IsNumber()) value = static_cast<float>(dom_value->ToDouble()); \
  Set##NAME(value);

#define SET_STYLE_VALUES(NAME, STYLENAME, DEFAULT)                              \
  auto dom_value = style_map.find(k##STYLENAME)->second;                        \
  CheckValueType(dom_value->GetType());                                         \
  float value = DEFAULT;                                                        \
  if (dom_value->IsNumber()) value = static_cast<float>(dom_value->ToDouble()); \
  Set##NAME(GetStyle##NAME(k##STYLENAME), value);

static void CheckValueType(tdf::base::DomValue::Type type) {
  TDF_BASE_DCHECK(type == tdf::base::DomValue::Type::kNumber || type == tdf::base::DomValue::Type::kObject);
}

static LayoutMeasureMode ToLayoutMeasureMode(MeasureMode measure_mode) {
  if (measure_mode == MeasureMode::MeasureModeUndefined) {
    return LayoutMeasureMode::Undefined;
  }
  if (measure_mode == MeasureMode::MeasureModeExactly) {
    return LayoutMeasureMode::Exactly;
  }
  if (measure_mode == MeasureMode::MeasureModeAtMost) {
    return LayoutMeasureMode::AtMost;
  }
  TDF_BASE_NOTREACHED();
}

static CSSDirection GetCSSDirectionFromEdge(Edge edge) {
  if (Edge::EdgeLeft == edge) {
    return CSSDirection::CSSLeft;
  } else if (Edge::EdgeTop == edge) {
    return CSSDirection::CSSTop;
  } else if (Edge::EdgeRight == edge) {
    return CSSDirection::CSSRight;
  } else if (Edge::EdgeBottom == edge) {
    return CSSDirection::CSSBottom;
  } else {
    TDF_BASE_NOTREACHED();
  }
}

TaitankLayoutNode::TaitankLayoutNode() : key_(global_measure_function_key.fetch_add(1)) { Allocate(); }

TaitankLayoutNode::TaitankLayoutNode(HPNodeRef engine_node_)
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
  HPDirection taitank_direction;
  if (direction == Direction::Inherit) {
    taitank_direction = HPDirection::DirectionInherit;
  } else if (direction == Direction::LTR) {
    taitank_direction = HPDirection::DirectionLTR;
  } else if (direction == Direction::RTL) {
    taitank_direction = HPDirection::DirectionRTL;
  } else {
    TDF_BASE_NOTREACHED();
  }
  engine_node_->layout(parent_width, parent_height, engine_node_->GetConfig(), taitank_direction, layout_context);
}

void TaitankLayoutNode::SetLayoutStyles(
    std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) {
  Parser(style_map);
}

void TaitankLayoutNode::Parser(std::unordered_map<std::string, std::shared_ptr<tdf::base::DomValue>>& style_map) {
  if (style_map.find(kWidth) != style_map.end()) {
    SET_STYLE_VALUE(Width, 0)
  }
  if (style_map.find(kMinWidth) != style_map.end()) {
    SET_STYLE_VALUE(MinWidth, 0)
  }
  if (style_map.find(kMaxWidth) != style_map.end()) {
    SET_STYLE_VALUE(MaxWidth, 0)
  }
  if (style_map.find(kHeight) != style_map.end()) {
    SET_STYLE_VALUE(Height, 0)
  }
  if (style_map.find(kMinHeight) != style_map.end()) {
    SET_STYLE_VALUE(MinHeight, 0)
  }
  if (style_map.find(kMaxHeight) != style_map.end()) {
    SET_STYLE_VALUE(MaxHeight, 0)
  }
  if (style_map.find(kFlex) != style_map.end()) {
    SetFlex(static_cast<float>(style_map.find(kFlex)->second->ToDouble()));
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
  if (style_map.find(kDirection) != style_map.end()) {
    SetDirection(GetStyleDirection(style_map.find(kDirection)->second->ToString()));
  }
  if (style_map.find(kFlexDirection) != style_map.end()) {
    SetFlexDirection(GetStyleFlexDirection(style_map.find(kFlexDirection)->second->ToString()));
  }
  if (style_map.find(kFlexWrap) != style_map.end()) {
    SetFlexWrap(GetStyleWrapMode(style_map.find(kFlexWrap)->second->ToString()));
  }
  if (style_map.find(kAilgnSelf) != style_map.end()) {
    SetAlignSelf(GetStyleAlign(style_map.find(kAilgnSelf)->second->ToString()));
  }
  if (style_map.find(kAlignItems) != style_map.end()) {
    SetAlignItems(GetStyleAlign(style_map.find(kAlignItems)->second->ToString()));
  }
  if (style_map.find(kJustifyContent) != style_map.end()) {
    SetJustifyContent(GetStyleJustify(style_map.find(kJustifyContent)->second->ToString()));
  }
  if (style_map.find(kOverflow) != style_map.end()) {
    SetOverflow(GetStyleOverflow(style_map.find(kOverflow)->second->ToString()));
  }
  if (style_map.find(kDisplay) != style_map.end()) {
    SetDisplay(GetStyleDisplayType(style_map.find(kDisplay)->second->ToString()));
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
    SET_STYLE_VALUES(Position, Left, 0)
  }
  if (style_map.find(kRight) != style_map.end()) {
    SET_STYLE_VALUES(Position, Right, 0)
  }
  if (style_map.find(kTop) != style_map.end()) {
    SET_STYLE_VALUES(Position, Top, 0)
  }
  if (style_map.find(kBottom) != style_map.end()) {
    SET_STYLE_VALUES(Position, Bottom, 0)
  }
  if (style_map.find(kPosition) != style_map.end()) {
    SetPositionType(GetStylePositionType(style_map.find(kPosition)->second->ToString()));
  }
}

static HPSize TaitankMeasureFunction(HPNodeRef node, float width, MeasureMode width_measrue_mode, float height,
                                     MeasureMode height_measure_mode, void* context) {
  auto taitank_node = reinterpret_cast<TaitankLayoutNode*>(node->getContext());
  int64_t key = taitank_node->GetKey();
  auto iter = measure_function_map.find(key);
  if (iter != measure_function_map.end()) {
    auto size = iter->second(width, ToLayoutMeasureMode(width_measrue_mode), height,
                             ToLayoutMeasureMode(height_measure_mode), context);
    HPSize result;
    result.width = size.width;
    result.height = size.height;
    return result;
  }
  return HPSize{0, 0};
}

void TaitankLayoutNode::SetMeasureFunction(MeasureFunction measure_function) {
  assert(engine_node_ != nullptr);
  measure_function_map[key_] = measure_function;
  engine_node_->setContext(reinterpret_cast<void*>(this));
  engine_node_->setMeasureFunc(TaitankMeasureFunction);
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

float TaitankLayoutNode::GetMargin(Edge edge) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  return engine_node_->result.margin[css_direction];
}

float TaitankLayoutNode::GetPadding(Edge edge) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  return engine_node_->result.padding[css_direction];
}

float TaitankLayoutNode::GetBorder(Edge edge) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  return engine_node_->result.border[css_direction];
}

bool TaitankLayoutNode::LayoutHadOverflow() {
  assert(engine_node_ != nullptr);
  return engine_node_->result.hadOverflow;
}

void TaitankLayoutNode::InsertChild(std::shared_ptr<LayoutNode> child, uint32_t index) {
  assert(engine_node_ != nullptr);
  if (engine_node_->measure != nullptr) return;
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

void TaitankLayoutNode::SetPosition(Edge edge, float position) {
  assert(engine_node_ != nullptr);
  CSSDirection css_direction = GetCSSDirectionFromEdge(edge);
  if (FloatIsEqual(engine_node_->style.position[css_direction], position)) return;
  if (engine_node_->style.setPosition(css_direction, position)) {
    engine_node_->markAsDirty();
  }
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

std::shared_ptr<LayoutNode> CreateLayoutNode() { return std::make_shared<TaitankLayoutNode>(); }

}  // namespace dom
}  // namespace hippy
