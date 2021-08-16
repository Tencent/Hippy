/* Tencent is pleased to support the open source community by making Hippy
 * available. Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights
 * reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

#ifndef FLEX_H_
#define FLEX_H_

typedef enum { DirectionInherit, DirectionLTR, DirectionRTL } MTTDirection;

// flex-direction : row | row-reverse | column | column-reverse
typedef enum {
  FLexDirectionRow,
  FLexDirectionRowReverse,
  FLexDirectionColumn,
  FLexDirectionColumnReverse
} FlexDirection;

// flex-wrap: nowrap | wrap | wrap-reverse
typedef enum {
  FlexNoWrap,
  FlexWrap,
  FlexWrapReverse,
} FlexWrapMode;

// align-item: flex-start | flex-end | center | baseline | stretch
// align-self: auto | flex-start | flex-end | center | baseline | stretch
// justify-content: flex-start | flex-end | center | space-between |
// space-around | space-evenly

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

// layout size value
typedef struct MTTSize {
  float width;
  float height;
} MTTSize;

// used to get padding's margin and position in main axis or cross axis
typedef enum {
  CSSLeft = 0,
  CSSTop,
  CSSRight,
  CSSBottom,
  CSSStart,
  CSSEnd,
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

typedef enum { NodeTypeDefault, NodeTypeText } NodeType;

typedef struct {
  float position[4];
  float cachedPosition[4];
  float dim[2];
  float margin[4];
  float padding[4];
  float border[4];
  bool hadOverflow;
  MTTDirection direction;
  // used to layout
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
} MTTSizeMode;

// following arrays mapping with axis's direction
static const CSSDirection axisStart[4] = {CSSLeft, CSSRight, CSSTop, CSSBottom};
static const CSSDirection axisEnd[4] = {CSSRight, CSSLeft, CSSBottom, CSSTop};
static const Dimension axisDim[4] = {DimWidth, DimWidth, DimHeight, DimHeight};

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
