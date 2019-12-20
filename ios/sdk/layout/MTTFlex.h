/**
 * Copyright (c) 2017-present, Tencent, Inc.
 * All rights reserved.
 * Author: ianwang <ianwang@tencent.com>
 * Created on: 2017-12-30
 */

#ifndef FLEX_H_
#define FLEX_H_

//flex-direction : row | row-reverse | column | column-reverse
typedef enum {
	FLexDirectionRow,
	FLexDirectionRowReverse,
	FLexDirectionColumn,
	FLexDirectionColumnReverse
} FlexDirection;



//flex-wrap: nowrap | wrap | wrap-reverse
typedef enum {
    FlexNoWrap,
    FlexWrap,
    FlexWrapReverse,
} FlexWrapMode;

//align-item: flex-start | flex-end | center | baseline | stretch
//align-self:	auto | flex-start | flex-end | center | baseline | stretch
//justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly

typedef enum {
	FlexAlignAuto,
	FlexAlignStart,
	FlexAlignCenter,
	FlexAlignEnd,
	FlexAlignStretch,
	FlexAlignBaseline,
	FlexAlignSpaceBetween,
	FlexAlignSpaceAround,
	FlexAlignSpaceEvenly
} FlexAlign;

//layout size value
typedef struct MTTSize {
  float width;
  float height;
} MTTSize;


//used to get padding's margin and position in main axis or cross axis
typedef enum {
  CSSLeft = 0,
  CSSTop,
  CSSRight,
  CSSBottom,
  CSSStart, // TODO:: reserve for implement
  CSSEnd,   // TODO:: reserve for implement
  CSSHorizontal,
  CSSVertical,
  CSSAll,
  CSSNONE = -1
} CSSDirection;

typedef enum {
  DimWidth = 0,
  DimHeight,
} Dimension;

typedef enum {
  PositionTypeRelative,
  PositionTypeAbsolute,
} PositionType;

typedef enum {
  DisplayTypeFlex,
  DisplayTypeNone,
} DisplayType;

typedef enum {
  OverflowVisible,
  OverflowHidden,
  OverflowScroll,
} OverflowType;

typedef enum {
  NodeTypeDefault,
  NodeTypeText
} NodeType;

typedef struct {
  float position[4];
  float cachedPosition[4];
  float dim[2];
  float margin[4];
  float padding[4];
  float border[4];
  bool  hadOverflow;
  //used to layout
  float flexBaseSize;
  float hypotheticalMainAxisMarginBoxSize;
  float hypotheticalMainAxisSize;
} MTTLayout;

typedef enum {
    LayoutActionMeasureWidth = 1,
	LayoutActionMeasureHeight = 2,
	LayoutActionLayout = 3,
} FlexLayoutAction;

typedef enum {
  MeasureModeUndefined,
  MeasureModeExactly,
  MeasureModeAtMost,
} MeasureMode;

typedef struct {
	MeasureMode widthMeasureMode;
	MeasureMode heightMeasureMode;
}MTTSizeMode;


//following arrays mapping with axis's direction
static const CSSDirection axisStart[4] = {	CSSLeft, CSSRight, CSSTop, CSSBottom };
static const CSSDirection axisEnd[4] = { CSSRight, CSSLeft, CSSBottom, CSSTop };
static const Dimension axisDim[4] = { DimWidth, DimWidth, DimHeight, DimHeight};


bool inline isRowDirection(FlexDirection dir) {
	return dir == FLexDirectionRow || dir == FLexDirectionRowReverse;
}

bool inline isColumnDirection(FlexDirection dir) {
	return dir == FLexDirectionColumn || dir == FLexDirectionColumnReverse;
}

bool inline isReverseDirection(FlexDirection dir) {
	return dir == FLexDirectionColumnReverse || dir == FLexDirectionRowReverse;
}

#endif
