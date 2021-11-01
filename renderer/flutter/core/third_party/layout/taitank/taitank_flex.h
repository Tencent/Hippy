/*
 *
 * Tencent is pleased to support the open source community by making Taitank available. 
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the “License”);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http:// www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed in writing, software
 * distributed under the License is distributed on an “AS IS” BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations
 * under the License.
 *
 */

#ifndef TAITANK_TAITANK_FLEX_H_
#define TAITANK_TAITANK_FLEX_H_

namespace taitank {

enum TaitankDirection {
  DIRECTION_INHERIT,
  DIRECTION_LTR,
  DIRECTION_RTL,
};

// flex-direction : row | row-reverse | column | column-reverse
enum FlexDirection {
  FLEX_DIRECTION_ROW,
  FLEX_DIRECTION_ROW_REVERSE,
  FLEX_DIRECTION_COLUMN,
  FLEX_DIRECTION_COLUNM_REVERSE,
};

// flex-wrap: nowrap | wrap | wrap-reverse
enum FlexWrapMode {
  FLEX_NO_WRAP,
  FLEX_WRAP,
  FLEX_WRAP_REVERSE,
};

// align-item: flex-start | flex-end | center | baseline | stretch
// align-self: auto | flex-start | flex-end | center | baseline | stretch
// justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly
enum FlexAlign {
  FLEX_ALIGN_AUTO,
  FLEX_ALIGN_START,
  FLEX_ALIGN_CENTER,
  FLEX_ALIGN_END,
  FLEX_ALIGN_STRETCH,
  FLEX_ALIGN_BASE_LINE,
  FLEX_ALIGN_SPACE_BETWEEN,
  FLEX_ALIGN_SPACE_AROUND,
  FLEX_ALIGN_SPACE_EVENLY,
};

// layout size value
typedef struct TaitankSize {
  float width;
  float height;
} TaitankSize;

// used to get padding's margin and position in main axis or cross axis
enum CSSDirection {
  CSS_LEFT = 0,
  CSS_TOP,
  CSS_RIGHT,
  CSS_BOTTOM,
  CSS_START,
  CSS_END,
  CSS_HORIZONTAL,
  CSS_VERTICAL,
  CSS_ALL,
  CSS_NONE = -1,
};

enum Dimension {
  DIMENSION_WIDTH = 0,
  DIMENSION_HEIGHT,
};

enum PositionType {
  POSITION_TYPE_RELATIVE,
  POSITION_TYPE_ABSOLUTE,
};

enum DisplayType {
  DISPLAY_TYPE_FLEX,
  DISPLAY_TYPE_NONE,
};

enum OverflowType {
  OVERFLOW_VISIBLE,
  OVERFLOW_HIDDEN,
  OVERFLOW_SCROLL,
};

enum NodeType {
  NODETYPE_DEFAULT,
  NODETYPE_TEXT,
};

struct TaitankLayout {
  float position[4];
  float cached_position[4];
  float dim[2];
  float margin[4];
  float padding[4];
  float border[4];
  bool had_overflow;
  TaitankDirection direction;
  // used to layout
  float flex_base_size;
  float hypothetical_main_axis_margin_boxsize;
  float hypothetical_main_axis_size;
};

enum FlexLayoutAction {
  LAYOUT_ACTION_MEASURE_WIDTH = 1,
  LAYOUT_ACTION_MEASURE_HEIGHT = 2,
  LAYOUT_ACTION_LAYOUT = 3,
};

enum MeasureMode {
  MEASURE_MODE_UNDEFINED,
  MEASURE_MODE_EXACTLY,
  MEASURE_MODE_AT_MOST,
};

struct TaitankSizeMode {
  MeasureMode width_measure_mode;
  MeasureMode height_measure_mode;
};

// following arrays mapping with axis's direction
const CSSDirection kAxisStart[4] = {CSS_LEFT, CSS_RIGHT, CSS_TOP, CSS_BOTTOM};
const CSSDirection kAxisEnd[4] = {CSS_RIGHT, CSS_LEFT, CSS_BOTTOM, CSS_TOP};
const Dimension kAxisDim[4] = {DIMENSION_WIDTH, DIMENSION_WIDTH, DIMENSION_HEIGHT,
                               DIMENSION_HEIGHT};

bool inline is_row_direction(FlexDirection dir) {
  return dir == FLEX_DIRECTION_ROW || dir == FLEX_DIRECTION_ROW_REVERSE;
}

bool inline is_column_direction(FlexDirection dir) {
  return dir == FLEX_DIRECTION_COLUMN || dir == FLEX_DIRECTION_COLUNM_REVERSE;
}

bool inline is_reverse_direction(FlexDirection dir) {
  return dir == FLEX_DIRECTION_COLUNM_REVERSE || dir == FLEX_DIRECTION_ROW_REVERSE;
}

}  // namespace taitank

#endif  // TAITANK_TAITANK_FLEX_H_
