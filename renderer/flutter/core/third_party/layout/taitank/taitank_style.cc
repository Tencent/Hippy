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



#include <memory.h>

#include <iostream>
#include "taitank_style.h"

namespace taitank {

typedef float CSSValue[kCssPropsCount];
typedef CSSDirection CSSFrom[kCssPropsCount];

const char kFlexDirectionString[][20] = {"row", "row-reverse", "column", "column-reverse"};

const char kFlexWrapString[][20] = {"nowrap", "wrap", "wrap-reverse"};

const char kFlexAlignString[][40] = {"Auto",          "flex-start",    "center",
                                     "flex-end",      "stretch",       "baseline",
                                     "space-between", "space-around ", "space-evenly"};

const char kPositionTypeString[][20] = {"relative", "absolute"};

TaitankStyle::TaitankStyle() {
  node_type_ = NODETYPE_DEFAULT;
  direction_ = DIRECTION_INHERIT;
  flex_direction_ = FLEX_DIRECTION_COLUMN;  // but web initial value: FLexDirectionRow
  align_self_ = FLEX_ALIGN_AUTO;
  align_items_ = FLEX_ALIGN_STRETCH;  // initial value: stretch
  align_content_ = FLEX_ALIGN_START;  // but web initial value: stretch
  justify_content_ = FLEX_ALIGN_START;
  position_type_ = POSITION_TYPE_RELATIVE;
  display_type_ = DISPLAY_TYPE_FLEX;
  overflow_type_ = OVERFLOW_VISIBLE;

  dim_[DIMENSION_WIDTH] = VALUE_UNDEFINED;  // initial value: auto
  dim_[DIMENSION_HEIGHT] = VALUE_UNDEFINED;
  min_dim_[DIMENSION_WIDTH] = VALUE_UNDEFINED;
  min_dim_[DIMENSION_HEIGHT] = VALUE_UNDEFINED;
  max_dim_[DIMENSION_WIDTH] = VALUE_UNDEFINED;
  max_dim_[DIMENSION_HEIGHT] = VALUE_UNDEFINED;

  position_[CSS_LEFT] = VALUE_AUTO;
  position_[CSS_RIGHT] = VALUE_AUTO;
  position_[CSS_TOP] = VALUE_AUTO;
  position_[CSS_BOTTOM] = VALUE_AUTO;
  position_[CSS_START] = VALUE_AUTO;
  position_[CSS_END] = VALUE_AUTO;

  // CSS margin default value is 0
  memset(reinterpret_cast<void *>(margin_), 0, sizeof(float) * kCssPropsCount);
  // Why use 0xFF, memset fill byte as 0xFF , then marginForm[0] == CSSNone (-1)
  memset(reinterpret_cast<void *>(margin_from_), 0xFF, sizeof(CSSDirection) * kCssPropsCount);
  ASSERT(margin_from_[0] == CSS_NONE);
  memset(reinterpret_cast<void *>(padding_), 0, sizeof(float) * kCssPropsCount);
  memset(reinterpret_cast<void *>(padding_from_), 0xFF, sizeof(CSSDirection) * kCssPropsCount);
  memset(reinterpret_cast<void *>(border_), 0, sizeof(float) * kCssPropsCount);
  memset(reinterpret_cast<void *>(border_from_), 0xFF, sizeof(CSSDirection) * kCssPropsCount);

  flex_wrap_ = FLEX_NO_WRAP;
  flex_grow_ = 0;    // no grow
  flex_shrink_ = 0;  // no shrink, but web initial value 1
  flex_ = VALUE_UNDEFINED;
  flex_basis_ = VALUE_AUTO;  // initial auto
  item_space_ = 0;
  line_space_ = 0;
}

TaitankStyle::~TaitankStyle() {
  // TODO Auto-generated destructor stub
}

std::string edge2String(int type, CSSValue &edges, CSSFrom &edgesFrom) {
  std::string prefix = "";
  if (type == 0) {  // margin
    prefix = "margin";
  } else if (type == 1) {
    prefix = "padding";
  } else if (type == 2) {
    prefix = "border";
  }

  std::string styles;
  char str[60] = {0};
  bool hasHorizontal = false;
  bool hasVertical = false;
  bool hasCSSAll = false;
  for (int i = CSS_LEFT; i <= CSS_END; i++) {
    memset(str, 0, sizeof(str));
    if (i == CSS_START && edgesFrom[i] == CSS_START) {
      snprintf(str, 50, "-start:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      continue;
    }

    if (i == CSS_END && edgesFrom[i] == CSS_END) {
      snprintf(str, 50, "-end:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      continue;
    }

    if (edgesFrom[i] == CSS_LEFT && !hasHorizontal) {
      snprintf(str, 50, "-left:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSS_RIGHT && !hasHorizontal) {
      snprintf(str, 50, "-right:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSS_TOP && !hasVertical) {
      snprintf(str, 50, "-top:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSS_BOTTOM && !hasVertical) {
      snprintf(str, 50, "-bottom:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSS_HORIZONTAL && !hasHorizontal) {
      snprintf(str, 50, "-horizontal:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      hasHorizontal = true;
    }

    if (edgesFrom[i] == CSS_VERTICAL && !hasVertical) {
      snprintf(str, 50, "-vertical:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      hasVertical = true;
    }

    if (edgesFrom[i] == CSS_ALL && !hasCSSAll) {
      snprintf(str, 50, ":%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      hasCSSAll = true;
    }
  }

  return styles;
}

std::string TaitankStyle::toString() {
  std::string styles;
  char str[60] = {0};
  if (flex_direction_ != FLEX_DIRECTION_COLUMN) {
    snprintf(str, 50, "flex-direction:%s; ", kFlexDirectionString[flex_direction_]);
    styles += str;
  }

  // flexWrap
  memset(str, 0, sizeof(str));
  if (flex_wrap_ != FLEX_NO_WRAP) {
    snprintf(str, 50, "flex-wrap:%s; ", kFlexWrapString[flex_wrap_]);
    styles += str;
  }

  // flexBasis
  memset(str, 0, sizeof(str));
  if (isDefined(flex_basis_)) {
    snprintf(str, 50, "flex-basis:%0.f; ", flex_basis_);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (flex_grow_ != 0) {
    snprintf(str, 50, "flex-grow %0.f; ", flex_grow_);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (flex_shrink_ != 0) {
    snprintf(str, 50, "flex-shrink %0.f; ", flex_shrink_);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (position_type_ != POSITION_TYPE_RELATIVE) {
    snprintf(str, 50, "position:%s; ", kPositionTypeString[position_type_]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position_[CSS_START])) {
    snprintf(str, 50, "position-start:%0.f; ", position_[CSS_START]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position_[CSS_END])) {
    snprintf(str, 50, "position-end:%0.f; ", position_[CSS_END]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position_[CSS_LEFT])) {
    snprintf(str, 50, "left:%0.f; ", position_[CSS_LEFT]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position_[CSS_TOP])) {
    snprintf(str, 50, "top:%0.f; ", position_[CSS_TOP]);
    styles += str;
  }
  memset(str, 0, sizeof(str));
  if (isDefined(position_[CSS_RIGHT])) {
    snprintf(str, 50, "right:%0.f; ", position_[CSS_RIGHT]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position_[CSS_BOTTOM])) {
    snprintf(str, 50, "bottom:%0.f; ", position_[CSS_BOTTOM]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(dim_[DIMENSION_WIDTH])) {
    snprintf(str, 50, "width:%0.f; ", dim_[DIMENSION_WIDTH]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(dim_[DIMENSION_HEIGHT])) {
    snprintf(str, 50, "height:%0.f; ", dim_[DIMENSION_HEIGHT]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(min_dim_[DIMENSION_WIDTH])) {
    snprintf(str, 50, "min-width:%0.f; ", min_dim_[DIMENSION_WIDTH]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(min_dim_[DIMENSION_HEIGHT])) {
    snprintf(str, 50, "min-height:%0.f; ", min_dim_[DIMENSION_HEIGHT]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(max_dim_[DIMENSION_WIDTH])) {
    snprintf(str, 50, "max-width:%0.f; ", max_dim_[DIMENSION_WIDTH]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(max_dim_[DIMENSION_HEIGHT])) {
    snprintf(str, 50, "max-height:%0.f; ", max_dim_[DIMENSION_HEIGHT]);
    styles += str;
  }

  styles += edge2String(0, margin_, margin_from_);
  styles += edge2String(1, padding_, padding_from_);
  styles += edge2String(2, border_, border_from_);

  memset(str, 0, sizeof(str));
  if (align_self_ != FLEX_ALIGN_AUTO /*&& alignSelf != FlexAlignStretch*/) {
    snprintf(str, 50, "align-self:%s; ", kFlexAlignString[align_self_]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (align_items_ != FLEX_ALIGN_STRETCH) {
    snprintf(str, 50, "align-items:%s; ", kFlexAlignString[align_items_]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (align_content_ != FLEX_ALIGN_START) {
    snprintf(str, 50, "align-content:%s; ", kFlexAlignString[align_content_]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (justify_content_ != FLEX_ALIGN_START) {
    snprintf(str, 50, "justify-content:%s; ", kFlexAlignString[justify_content_]);
    styles += str;
  }

  if (node_type_ == NODETYPE_TEXT) {
    styles += "nodeType:text;";
  }

  return styles;
}

/*
 * priority:
 *[CSSStart, CSSEnd]
 *[CSSTop,CSSLeft,CSSBottom,CSSRight] > [CSSHorizontal, CSSVertical] > CSSAll > CSSNONE
 */
bool setEdges(CSSDirection dir, float value, CSSValue &edges, CSSFrom &edgesFrom) {
  bool hasSet = false;
  if (dir == CSS_START || dir == CSS_END) {
    if (!FloatIsEqual(edges[dir], value)) {
      edges[dir] = value;
      edgesFrom[dir] = dir;
      hasSet = true;
    }
  } else if (dir >= CSS_LEFT && dir <= CSS_BOTTOM) {
    edgesFrom[dir] = dir;
    if (!FloatIsEqual(edges[dir], value)) {
      edges[dir] = value;
      hasSet = true;
    }

  } else if (dir == CSS_HORIZONTAL) {
    if (edgesFrom[CSS_LEFT] != CSS_LEFT) {
      edgesFrom[CSS_LEFT] = CSS_HORIZONTAL;
      if (!FloatIsEqual(edges[CSS_LEFT], value)) {
        edges[CSS_LEFT] = value;
        hasSet = true;
      }
    }

    if (edgesFrom[CSS_RIGHT] != CSS_RIGHT) {
      edgesFrom[CSS_RIGHT] = CSS_HORIZONTAL;
      if (!FloatIsEqual(edges[CSS_RIGHT], value)) {
        edges[CSS_RIGHT] = value;
        hasSet = true;
      }
    }

  } else if (dir == CSS_VERTICAL) {
    if (edgesFrom[CSS_TOP] != CSS_TOP) {
      edgesFrom[CSS_TOP] = CSS_VERTICAL;
      if (!FloatIsEqual(edges[CSS_TOP], value)) {
        edges[CSS_TOP] = value;
        hasSet = true;
      }
    }
    if (edgesFrom[CSS_BOTTOM] != CSS_BOTTOM) {
      edgesFrom[CSS_BOTTOM] = CSS_VERTICAL;
      if (!FloatIsEqual(edges[CSS_BOTTOM], value)) {
        edges[CSS_BOTTOM] = value;
        hasSet = true;
      }
    }
  } else if (dir == CSS_ALL) {
    for (int i = CSS_LEFT; i <= CSS_BOTTOM; i++) {
      if (edgesFrom[i] == CSS_NONE) {
        edges[i] = value;
        edgesFrom[i] = CSS_ALL;
        hasSet = true;
      } else if (edgesFrom[i] == CSS_ALL && !FloatIsEqual(edges[i], value)) {
        edges[i] = value;
        hasSet = true;
      }
    }
  }

  return hasSet;
}

// Allow set value as auto (VALUE_AUTO), is NAN.
// then margin is calculated in layout follow W3C regulars
bool TaitankStyle::set_margin(CSSDirection dir, float value) {
  return setEdges(dir, value, margin_, margin_from_);
}

bool TaitankStyle::set_padding(CSSDirection dir, float value) {
  return setEdges(dir, value, padding_, padding_from_);
}

bool TaitankStyle::set_border(CSSDirection dir, float value) {
  return setEdges(dir, value, border_, border_from_);
}

bool TaitankStyle::set_position(CSSDirection dir, float value) {
  if (dir > CSS_END) {
    return false;
  }

  if (!FloatIsEqual(position_[dir], value)) {
    position_[dir] = value;
    return true;
  }
  return false;
}

float TaitankStyle::get_start_position(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(position_[CSS_START])) {
    return position_[CSS_START];
  } else if (isDefined(position_[kAxisStart[axis]])) {
    return position_[kAxisStart[axis]];
  }
  return VALUE_AUTO;
}

float TaitankStyle::get_end_position(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(position_[CSS_END])) {
    return position_[CSS_END];
  } else if (isDefined(position_[kAxisEnd[axis]])) {
    return position_[kAxisEnd[axis]];
  }
  return VALUE_AUTO;
}

void TaitankStyle::set_dim(Dimension dimension, float value) { dim_[dimension] = value; }

float TaitankStyle::get_dim(Dimension dimension) { return dim_[dimension]; }

void TaitankStyle::set_dim(FlexDirection axis, float value) { set_dim(kAxisDim[axis], value); }

float TaitankStyle::get_dim(FlexDirection axis) { return dim_[kAxisDim[axis]]; }

bool TaitankStyle::is_dimension_auto(FlexDirection axis) {
  return isUndefined(dim_[kAxisDim[axis]]);
}

// axis must be get from resolveMainAxis or resolveCrossAxis in HPNode
float TaitankStyle::get_start_border(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(border_[CSS_START]) &&
      border_from_[CSS_START] != CSS_NONE) {
    return border_[CSS_START];
  }
  if (isDefined(border_[kAxisStart[axis]])) {
    return border_[kAxisStart[axis]];
  }
  return 0.0f;
}

float TaitankStyle::get_end_border(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(border_[CSS_END]) && border_from_[CSS_END] != CSS_NONE) {
    return border_[CSS_END];
  }
  if (isDefined(border_[kAxisEnd[axis]])) {
    return border_[kAxisEnd[axis]];
  }
  return 0.0f;
}

float TaitankStyle::get_start_padding(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(padding_[CSS_START]) &&
      padding_from_[CSS_START] != CSS_NONE) {
    return padding_[CSS_START];
  } else if (isDefined(padding_[kAxisStart[axis]])) {
    return padding_[kAxisStart[axis]];
  }
  return 0.0f;
}

float TaitankStyle::get_end_padding(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(padding_[CSS_END]) &&
      padding_from_[CSS_END] != CSS_NONE) {
    return padding_[CSS_END];
  } else if (isDefined(padding_[kAxisEnd[axis]])) {
    return padding_[kAxisEnd[axis]];
  }
  return 0.0f;
}

// auto margins are treated as zero
float TaitankStyle::get_start_margin(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(margin_[CSS_START]) &&
      margin_from_[CSS_START] != CSS_NONE) {
    return margin_[CSS_START];
  }
  if (isDefined(margin_[kAxisStart[axis]])) {
    return margin_[kAxisStart[axis]];
  }
  return 0.0f;
}

// auto margins are treated as zero
float TaitankStyle::get_end_margin(FlexDirection axis) {
  if (is_row_direction(axis) && isDefined(margin_[CSS_END]) && margin_from_[CSS_END] != CSS_NONE) {
    return margin_[CSS_END];
  }
  if (isDefined(margin_[kAxisEnd[axis]])) {
    return margin_[kAxisEnd[axis]];
  }
  return 0.0f;
}

float TaitankStyle::get_margin(FlexDirection axis) {
  return get_start_margin(axis) + get_end_margin(axis);
}

bool TaitankStyle::is_auto_start_margin(FlexDirection axis) {
  if (is_row_direction(axis) && margin_from_[CSS_START] != CSS_NONE) {
    return isUndefined(margin_[CSS_START]);
  }
  return isUndefined(margin_[kAxisStart[axis]]);
}

bool TaitankStyle::is_auto_end_margin(FlexDirection axis) {
  if (is_row_direction(axis) && margin_from_[CSS_END] != CSS_NONE) {
    return isUndefined(margin_[CSS_END]);
  }
  return isUndefined(margin_[kAxisEnd[axis]]);
}

bool TaitankStyle::has_auto_margin(FlexDirection axis) {
  return is_auto_start_margin(axis) || is_auto_end_margin(axis);
}

bool TaitankStyle::is_overflow_scroll() { return overflow_type_ == OVERFLOW_SCROLL; }

float TaitankStyle::get_flex_basis() {
  if (isDefined(flex_basis_)) {
    return flex_basis_;
  } else if (isDefined(flex_) && flex_ > 0.0f) {
    return 0.0f;
  }

  return VALUE_AUTO;
}

}  // namespace taitank