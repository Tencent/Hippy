//
// Created by longquan on 2020/9/2.
//
#include "FlexNodeStyleFfiBridge.h"

#ifdef USE_TAITANK
#include "TaitankNodeStyleFfi.h"
#else
#include "FlexNodeStyleFfi.h"
#endif

#ifdef __cplusplus
extern "C" {
#endif

int64_t FlexNodeStyleFfiNew() {
#ifdef USE_TAITANK
  auto *flex_node = new TaitankNodeStyleFfi();
  return reinterpret_cast<intptr_t>(flex_node);
#else
  auto* flex_node = new FlexNodeStyleFfi();
  return reinterpret_cast<intptr_t>(flex_node);
#endif
}

FLEX_EXPORT FLEX_USED int64_t nativeFlexNodeStyleNew() {
  return FlexNodeStyleFfiNew();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleFree(int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleFreeFFI();
}

FLEX_EXPORT FLEX_USED void nativeSetFlexNode(int64_t nativeFlexNodeStyle, int64_t node) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_ffi(node);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetDirection(int64_t nativeFlexNodeStyle) {
  auto native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_direction();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetDirection(
    int64_t nativeFlexNodeStyle,
    int32_t direction) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_direction(direction);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetFlexDirection(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_flex_direction();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetFlexDirection(
    int64_t nativeFlexNodeStyle,
    int32_t flexDirection) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex_direction(flexDirection);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetJustifyContent(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_justify_content();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetJustifyContent(
    int64_t nativeFlexNodeStyle,
    int32_t justifyContent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_justify_content(justifyContent);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetAlignItems(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_align_items();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetAlignItems(
    int64_t nativeFlexNodeStyle,
    int32_t alignItems) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_align_items(alignItems);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetAlignSelf(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_align_self();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetAlignSelf(
    int64_t nativeFlexNodeStyle,
    int32_t alignSelf) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_align_self(alignSelf);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetAlignContent(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_align_content();
}

FLEX_EXPORT FLEX_USED void _nativeFlexNodeStyleSetAlignContent(
    int64_t nativeFlexNodeStyle,
    int32_t alignContent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  native->set_flex_node_style_align_content(alignContent);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetPositionType(int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_position_type();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetPositionType(
    int64_t nativeFlexNodeStyle,
    int32_t positionType) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_position_type(positionType);
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetFlexWrap(
    int64_t nativeFlexNodeStyle,
    int32_t wrapType) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex_wrap(wrapType);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetFlexWrap(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_flex_wrap();
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetOverflow(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_overflow();
}

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetOverflow(
    int64_t nativeFlexNodeStyle,
    int32_t overflow) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_overflow(overflow);
}

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetDisplay(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_display();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetDisplay(
    int64_t nativeFlexNodeStyle,
    int32_t display) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_display(display);
}

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetFlex(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_flex();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlex(
    int64_t nativeFlexNodeStyle,
    float flex) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex(flex);
}

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetFlexGrow(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_flex_grow();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexGrow(
    int64_t nativeFlexNodeStyle,
    float flexGrow) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex_grow(flexGrow);
}

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetFlexShrink(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_flex_shrink();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexShrink(
    int64_t nativeFlexNodeStyle,
    float flexShrink) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex_shrink(flexShrink);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetFlexBasis(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_flex_basis();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexBasis(
    int64_t nativeFlexNodeStyle,
    float flexBasis) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex_basis(flexBasis);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexBasisPercent(
    int64_t nativeFlexNodeStyle,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex_basis_percent(percent);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexBasisAuto(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_flex_basis_auto();
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMargin(
    int64_t nativeFlexNodeStyle,
    int32_t edge) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleGetMargin(edge);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMargin(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float margin) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetMargin(edge, margin);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMarginPercent(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetMarginPercent(edge, percent);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMarginAuto(
    int64_t nativeFlexNodeStyle,
    int32_t edge) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetMarginAuto(edge);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetPadding(
    int64_t nativeFlexNodeStyle,
    int32_t edge) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleGetPadding(edge);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPadding(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float padding) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetPadding(edge, padding);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPaddingPercent(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetPaddingPercent(edge, percent);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetBorder(
    int64_t nativeFlexNodeStyle,
    int32_t edge) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleGetBorder(edge);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetBorder(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float border) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetBorder(edge, border);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetPosition(
    int64_t nativeFlexNodeStyle,
    int32_t edge) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleGetPosition(edge);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPosition(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float position) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetPosition(edge, position);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPositionPercent(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->FlexNodeStyleSetPositionPercent(edge, percent);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetWidth(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_width();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetWidth(
    int64_t nativeFlexNodeStyle,
    float width) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_width(width);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetWidthPercent(
    int64_t nativeFlexNodeStyle,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_width_percent(percent);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetWidthAuto(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_width_auto();
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetHeight(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_height();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetHeight(
    int64_t nativeFlexNodeStyle,
    float height) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_height(height);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetHeightPercent(
    int64_t nativeFlexNodeStyle,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_height_percent(percent);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetHeightAuto(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_height_auto();
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMinWidth(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_min_width();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinWidth(
    int64_t nativeFlexNodeStyle,
    float minWidth) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_min_width(minWidth);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinWidthPercent(
    int64_t nativeFlexNodeStyle,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_min_width_percent(percent);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMinHeight(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_min_height();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinHeight(
    int64_t nativeFlexNodeStyle,
    float minHeight) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_min_height(minHeight);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinHeightPercent(
    int64_t nativeFlexNodeStyle,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_min_height_percent(percent);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMaxWidth(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_max_width();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxWidth(
    int64_t nativeFlexNodeStyle,
    float maxWidth) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_max_width(maxWidth);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxWidthPercent(
    int64_t nativeFlexNodeStyle,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_max_width_percent(percent);
}

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMaxHeight(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_max_height();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxHeight(
    int64_t nativeFlexNodeStyle,
    float maxheight) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_max_height(maxheight);
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxHeightPercent(
    int64_t nativeFlexNodeStyle,
    float percent) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_max_height_percent(percent);
}

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetAspectRatio(
    int64_t nativeFlexNodeStyle) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->get_flex_node_style_aspect_ratio();
}

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetAspectRatio(
    int64_t nativeFlexNodeStyle,
    float aspectRatio) {
  auto *native = reinterpret_cast<FlexStyle *>(nativeFlexNodeStyle);
  return native->set_flex_node_style_aspect_ratio(aspectRatio);
}


#ifdef __cplusplus
}
#endif
