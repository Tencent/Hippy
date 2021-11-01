//
// Created by longquan on 2020/9/2.
//

#ifndef ANDROID_DEMO_LAYOUT_FFI_FLEXNODESTYLEFFIBRIDGE_H_
#define ANDROID_DEMO_LAYOUT_FFI_FLEXNODESTYLEFFIBRIDGE_H_

#include <cstdint>
#include "FlexNodeFfiUtil.h"
#include "FlexStyle.h"

#ifdef __cplusplus
extern "C" {
#endif

int64_t FlexNodeStyleFfiNew();

FLEX_EXPORT FLEX_USED int64_t nativeFlexNodeStyleNew();

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleFree(int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeSetFlexNode(int64_t nativeFlexNodeStyle, int64_t node);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetDirection(int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetDirection(
    int64_t nativeFlexNodeStyle,
    int32_t direction);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetFlexDirection(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetFlexDirection(
    int64_t nativeFlexNodeStyle,
    int32_t flexDirection);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetJustifyContent(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetJustifyContent(
    int64_t nativeFlexNodeStyle,
    int32_t justifyContent);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetAlignItems(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetAlignItems(
    int64_t nativeFlexNodeStyle,
    int32_t alignItems);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetAlignSelf(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetAlignSelf(
    int64_t nativeFlexNodeStyle,
    int32_t alignSelf);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetAlignContent(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void _nativeFlexNodeStyleSetAlignContent(
    int64_t nativeFlexNodeStyle,
    int32_t alignContent);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetPositionType(int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetPositionType(
    int64_t nativeFlexNodeStyle,
    int32_t positionType);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetFlexWrap(
    int64_t nativeFlexNodeStyle,
    int32_t wrapType);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetFlexWrap(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetOverflow(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void nativeFlexNodeStyleSetOverflow(
    int64_t nativeFlexNodeStyle,
    int32_t overflow);

FLEX_EXPORT FLEX_USED int32_t nativeFlexNodeStyleGetDisplay(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetDisplay(
    int64_t nativeFlexNodeStyle,
    int32_t display);

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetFlex(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlex(
    int64_t nativeFlexNodeStyle,
    float flex);

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetFlexGrow(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexGrow(
    int64_t nativeFlexNodeStyle,
    float flexGrow);

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetFlexShrink(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexShrink(
    int64_t nativeFlexNodeStyle,
    float flexShrink);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetFlexBasis(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexBasis(
    int64_t nativeFlexNodeStyle,
    float flexBasis);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexBasisPercent(
    int64_t nativeFlexNodeStyle,
    float percent);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetFlexBasisAuto(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMargin(
    int64_t nativeFlexNodeStyle,
    int32_t edge);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMargin(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float margin);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMarginPercent(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float percent);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMarginAuto(
    int64_t nativeFlexNodeStyle,
    int32_t edge);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetPadding(
    int64_t nativeFlexNodeStyle,
    int32_t edge);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPadding(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float padding);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPaddingPercent(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float percent);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetBorder(
    int64_t nativeFlexNodeStyle,
    int32_t edge);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetBorder(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float border);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetPosition(
    int64_t nativeFlexNodeStyle,
    int32_t edge);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPosition(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float position);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetPositionPercent(
    int64_t nativeFlexNodeStyle,
    int32_t edge,
    float percent);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetWidth(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetWidth(
    int64_t nativeFlexNodeStyle,
    float width);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetWidthPercent(
    int64_t nativeFlexNodeStyle,
    float percent);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetWidthAuto(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetHeight(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetHeight(
    int64_t nativeFlexNodeStyle,
    float height);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetHeightPercent(
    int64_t nativeFlexNodeStyle,
    float percent);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetHeightAuto(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMinWidth(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinWidth(
    int64_t nativeFlexNodeStyle,
    float minWidth);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinWidthPercent(
    int64_t nativeFlexNodeStyle,
    float percent);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMinHeight(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinHeight(
    int64_t nativeFlexNodeStyle,
    float minHeight);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMinHeightPercent(
    int64_t nativeFlexNodeStyle,
    float percent);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMaxWidth(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxWidth(
    int64_t nativeFlexNodeStyle,
    float maxWidth);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxWidthPercent(
    int64_t nativeFlexNodeStyle,
    float percent);

FLEX_EXPORT FLEX_USED FlexValue *
nativeFlexNodeStyleGetMaxHeight(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxHeight(
    int64_t nativeFlexNodeStyle,
    float maxheight);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetMaxHeightPercent(
    int64_t nativeFlexNodeStyle,
    float percent);

FLEX_EXPORT FLEX_USED float
nativeFlexNodeStyleGetAspectRatio(
    int64_t nativeFlexNodeStyle);

FLEX_EXPORT FLEX_USED void
nativeFlexNodeStyleSetAspectRatio(
    int64_t nativeFlexNodeStyle,
    float aspectRatio);


#ifdef __cplusplus
}
#endif

#endif //ANDROID_DEMO_LAYOUT_FFI_FLEXNODESTYLEFFIBRIDGE_H_
