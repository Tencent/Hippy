/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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

#include <string.h>
#include <iostream>
#include "HPStyle.h"

namespace flexbox {

typedef float CSSValue[CSS_PROPS_COUNT];
typedef CSSDirection CSSFrom[CSS_PROPS_COUNT];

const char flex_direction_str[][20] = { "row", "row-reverse", "column",
    "column-reverse" };

const char flex_wrap[][20] { "nowrap", "wrap", "wrap-reverse", };

//	flex-start | flex-end | center | baseline | stretch
const char FlexAlignString[][40] = { "Auto", "flex-start", "center", "flex-end",
    "stretch", "baseline", "space-between", "space-around ", "space-evenly" };

const char PositionTypeString[][20] = { "relative", "absolute" };

/*
 const char OverflowTypeString[][20] {
 "visible",
 "hidden",
 "scroll"
 };*/

HPStyle::HPStyle() {
  nodeType = NodeTypeDefault;
  direction = DirectionInherit;
  flexDirection = FLexDirectionColumn;  //but web initial value: FLexDirectionRow
  alignSelf = FlexAlignAuto;
  alignItems = FlexAlignStretch;  //initial value: stretch
  alignContent = FlexAlignStart;  //but web initial value: stretch
  justifyContent = FlexAlignStart;
  positionType = PositionTypeRelative;
  displayType = DisplayTypeFlex;
  overflowType = OverflowVisible;

  dim[DimWidth] = VALUE_UNDEFINED;  //initial value :	auto
  dim[DimHeight] = VALUE_UNDEFINED;
  minDim[DimWidth] = VALUE_UNDEFINED;
  minDim[DimHeight] = VALUE_UNDEFINED;
  maxDim[DimWidth] = VALUE_UNDEFINED;
  maxDim[DimHeight] = VALUE_UNDEFINED;

  position[CSSLeft] = VALUE_AUTO;
  position[CSSRight] = VALUE_AUTO;
  position[CSSTop] = VALUE_AUTO;
  position[CSSBottom] = VALUE_AUTO;
  position[CSSStart] = VALUE_AUTO;
  position[CSSEnd] = VALUE_AUTO;


  //CSS margin default value is 0
  memset((void *) margin, 0, sizeof(float) * CSS_PROPS_COUNT);
  //Why use 0xFF, memset fill byte as 0xFF , then marginForm[0] == CSSNone (-1)
  memset((void *) marginFrom, 0xFF, sizeof(CSSDirection) * CSS_PROPS_COUNT);
  ASSERT(marginFrom[0] == CSSNONE);
  memset((void *) padding, 0, sizeof(float) * CSS_PROPS_COUNT);
  memset((void *) paddingFrom, 0xFF, sizeof(CSSDirection) * CSS_PROPS_COUNT);
  memset((void *) border, 0, sizeof(float) * CSS_PROPS_COUNT);
  memset((void *) borderFrom, 0xFF, sizeof(CSSDirection) * CSS_PROPS_COUNT);

  flexWrap = FlexNoWrap;
  flexGrow = 0;   //no grow
  flexShrink = 0;  //no shrink, but web initial value 1
  flex = VALUE_UNDEFINED;
  flexBasis = VALUE_AUTO;  //initial auto
  itemSpace = 0;
  lineSpace = 0;
}

HPStyle::~HPStyle() {
  // TODO Auto-generated destructor stub
}

std::string edge2String(int type, CSSValue& edges, CSSFrom& edgesFrom) {

  std::string prefix = "";
  if (type == 0) {  // margin
    prefix = "margin";
  } else if (type == 1) {
    prefix = "padding";
  } else if (type == 2) {
    prefix = "border";
  }

  std::string styles;
  char str[60] = { 0 };
  bool hasHorizontal = false;
  bool hasVertical = false;
  bool hasCSSAll = false;
  for (int i = CSSLeft; i <= CSSEnd; i++) {
    memset(str, 0, sizeof(str));
    if (i == CSSStart && edgesFrom[i] == CSSStart) {
      snprintf(str, 50, "-start:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      continue;
    }

    if (i == CSSEnd && edgesFrom[i] == CSSEnd) {
      snprintf(str, 50, "-end:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      continue;
    }

    if (edgesFrom[i] == CSSLeft && !hasHorizontal) {
      snprintf(str, 50, "-left:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSSRight && !hasHorizontal) {
      snprintf(str, 50, "-right:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSSTop && !hasVertical) {
      snprintf(str, 50, "-top:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSSBottom && !hasVertical) {
      snprintf(str, 50, "-bottom:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
    }

    if (edgesFrom[i] == CSSHorizontal && !hasHorizontal) {
      snprintf(str, 50, "-horizontal:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      hasHorizontal = true;
    }

    if (edgesFrom[i] == CSSVertical && !hasVertical) {
      snprintf(str, 50, "-vertical:%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      hasVertical = true;
    }

    if (edgesFrom[i] == CSSAll && !hasCSSAll) {
      snprintf(str, 50, ":%0.f; ", edges[i]);
      styles += prefix;
      styles += str;
      hasCSSAll = true;
    }
  }

  return styles;
}

std::string HPStyle::toString() {
  std::string styles;
  char str[60] = { 0 };
  if (flexDirection != FLexDirectionColumn) {
    snprintf(str, 50, "flex-direction:%s; ", flex_direction_str[flexDirection]);
    styles += str;
  }

  //flexWrap
  memset(str, 0, sizeof(str));
  if (flexWrap != FlexNoWrap) {
    snprintf(str, 50, "flex-wrap:%s; ", flex_wrap[flexWrap]);
    styles += str;
  }

  //flexBasis
  memset(str, 0, sizeof(str));
  if (isDefined(flexBasis)) {
    snprintf(str, 50, "flex-basis:%0.f; ", flexBasis);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (flexGrow != 0) {
    snprintf(str, 50, "flex-grow %0.f; ", flexGrow);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (flexShrink != 0) {
    snprintf(str, 50, "flex-shrink %0.f; ", flexShrink);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (positionType != PositionTypeRelative) {
    snprintf(str, 50, "position:%s; ", PositionTypeString[positionType]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position[CSSStart])) {
    snprintf(str, 50, "position-start:%0.f; ", position[CSSStart]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position[CSSEnd])) {
    snprintf(str, 50, "position-end:%0.f; ", position[CSSEnd]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position[CSSLeft])) {
    snprintf(str, 50, "left:%0.f; ", position[CSSLeft]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position[CSSTop])) {
    snprintf(str, 50, "top:%0.f; ", position[CSSTop]);
    styles += str;
  }
  memset(str, 0, sizeof(str));
  if (isDefined(position[CSSRight])) {
    snprintf(str, 50, "right:%0.f; ", position[CSSRight]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(position[CSSBottom])) {
    snprintf(str, 50, "bottom:%0.f; ", position[CSSBottom]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(dim[DimWidth])) {
    snprintf(str, 50, "width:%0.f; ", dim[DimWidth]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(dim[DimHeight])) {
    snprintf(str, 50, "height:%0.f; ", dim[DimHeight]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(minDim[DimWidth])) {
    snprintf(str, 50, "min-width:%0.f; ", minDim[DimWidth]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(minDim[DimHeight])) {
    snprintf(str, 50, "min-height:%0.f; ", minDim[DimHeight]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(maxDim[DimWidth])) {
    snprintf(str, 50, "max-width:%0.f; ", maxDim[DimWidth]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (isDefined(maxDim[DimHeight])) {
    snprintf(str, 50, "max-height:%0.f; ", maxDim[DimHeight]);
    styles += str;
  }

  styles += edge2String(0, margin, marginFrom);
  styles += edge2String(1, padding, paddingFrom);
  styles += edge2String(2, border, borderFrom);

  memset(str, 0, sizeof(str));
  if (alignSelf != FlexAlignAuto /*&& alignSelf != FlexAlignStretch*/) {
    snprintf(str, 50, "align-self:%s; ", FlexAlignString[alignSelf]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (alignItems != FlexAlignStretch) {
    snprintf(str, 50, "align-items:%s; ", FlexAlignString[alignItems]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (alignContent != FlexAlignStart) {
    snprintf(str, 50, "align-content:%s; ", FlexAlignString[alignContent]);
    styles += str;
  }

  memset(str, 0, sizeof(str));
  if (justifyContent != FlexAlignStart) {
    snprintf(str, 50, "justify-content:%s; ", FlexAlignString[justifyContent]);
    styles += str;
  }

  if (nodeType == NodeTypeText) {
    styles += "nodeType:text;";
  }

  return styles;
}

/*
 * priority:
 *[CSSStart, CSSEnd]
 *[CSSTop,CSSLeft,CSSBottom,CSSRight] > [CSSHorizontal, CSSVertical] > CSSAll > CSSNONE
 */
bool setEdges(CSSDirection dir, float value, CSSValue& edges,
              CSSFrom& edgesFrom) {
  bool hasSet = false;
  if (dir == CSSStart || dir == CSSEnd) {
    if (!FloatIsEqual(edges[dir], value)) {
      edges[dir] = value;
      edgesFrom[dir] = dir;
      hasSet = true;
    }
  } else if (dir >= CSSLeft && dir <= CSSBottom) {
    edgesFrom[dir] = dir;
    if (!FloatIsEqual(edges[dir], value)) {
      edges[dir] = value;
      hasSet = true;
    }

  } else if (dir == CSSHorizontal) {
    if (edgesFrom[CSSLeft] != CSSLeft) {
      edgesFrom[CSSLeft] = CSSHorizontal;
      if (!FloatIsEqual(edges[CSSLeft], value)) {
        edges[CSSLeft] = value;
        hasSet = true;
      }
    }

    if (edgesFrom[CSSRight] != CSSRight) {
      edgesFrom[CSSRight] = CSSHorizontal;
      if (!FloatIsEqual(edges[CSSRight], value)) {
        edges[CSSRight] = value;
        hasSet = true;
      }
    }

  } else if (dir == CSSVertical) {
    if (edgesFrom[CSSTop] != CSSTop) {
      edgesFrom[CSSTop] = CSSVertical;
      if (!FloatIsEqual(edges[CSSTop], value)) {
        edges[CSSTop] = value;
        hasSet = true;
      }
    }
    if (edgesFrom[CSSBottom] != CSSBottom) {
      edgesFrom[CSSBottom] = CSSVertical;
      if (!FloatIsEqual(edges[CSSBottom], value)) {
        edges[CSSBottom] = value;
        hasSet = true;
      }
    }
  } else if (dir == CSSAll) {
    for (int i = CSSLeft; i <= CSSBottom; i++) {
      if (edgesFrom[i] == CSSNONE) {
        edges[i] = value;
        edgesFrom[i] = CSSAll;
        hasSet = true;
      } else if (edgesFrom[i] == CSSAll && !FloatIsEqual(edges[i], value)) {
        edges[i] = value;
        hasSet = true;
      }
    }
  }

  return hasSet;
}

//Allow set value as auto (VALUE_AUTO), is NAN.
//then margin is calculated in layout follow W3C regulars
bool HPStyle::setMargin(CSSDirection dir, float value) {
  return setEdges(dir, value, margin, marginFrom);
}

bool HPStyle::setPadding(CSSDirection dir, float value) {
  return setEdges(dir, value, padding, paddingFrom);
}

bool HPStyle::setBorder(CSSDirection dir, float value) {
  return setEdges(dir, value, border, borderFrom);
}

bool HPStyle::setPosition(CSSDirection dir, float value) {
  if (dir > CSSEnd) {
    return false;
  }

  if (!FloatIsEqual(position[dir], value)) {
    position[dir] = value;
    return true;
  }
  return false;
}

float HPStyle::getStartPosition(FlexDirection axis) {
  if (isRowDirection(axis) && isDefined(position[CSSStart])) {
    return position[CSSStart];
  } else if (isDefined(position[axisStart[axis]])) {
    return position[axisStart[axis]];
  }
  return VALUE_AUTO;
}

float HPStyle::getEndPosition(FlexDirection axis) {
  if (isRowDirection(axis) && isDefined(position[CSSEnd])) {
    return position[CSSEnd];
  } else if (isDefined(position[axisEnd[axis]])) {
    return position[axisEnd[axis]];
  }
  return VALUE_AUTO;
}

void HPStyle::setDim(Dimension dimension, float value) {
  dim[dimension] = value;
}

float HPStyle::getDim(Dimension dimension) {
  return dim[dimension];
}

void HPStyle::setDim(FlexDirection axis, float value) {
  setDim(axisDim[axis], value);
}

float HPStyle::getDim(FlexDirection axis) {
  return dim[axisDim[axis]];
}

bool HPStyle::isDimensionAuto(FlexDirection axis) {
  return isUndefined(dim[axisDim[axis]]);
}


//axis must be get from resolveMainAxis or resolveCrossAxis in HPNode
float HPStyle::getStartBorder(FlexDirection axis) {
  if (isRowDirection(axis)
      && isDefined(border[CSSStart])
      && borderFrom[CSSStart] != CSSNONE) {
    return border[CSSStart];
  }
  if (isDefined(border[axisStart[axis]])) {
    return border[axisStart[axis]];
  }
  return 0.0f;
}

float HPStyle::getEndBorder(FlexDirection axis) {
  if (isRowDirection(axis)
      && isDefined(border[CSSEnd])
      && borderFrom[CSSEnd] != CSSNONE) {
    return border[CSSEnd];
  }
  if (isDefined(border[axisEnd[axis]])) {
    return border[axisEnd[axis]];
  }
  return 0.0f;
}

float HPStyle::getStartPadding(FlexDirection axis) {
  if (isRowDirection(axis)
      && isDefined(padding[CSSStart])
      && paddingFrom[CSSStart] != CSSNONE) {
    return padding[CSSStart];
  } else if (isDefined(padding[axisStart[axis]])) {
    return padding[axisStart[axis]];
  }
  return 0.0f;
}

float HPStyle::getEndPadding(FlexDirection axis) {
  if (isRowDirection(axis)
      && isDefined(padding[CSSEnd])
      && paddingFrom[CSSEnd] != CSSNONE) {
    return padding[CSSEnd];
  } else if (isDefined(padding[axisEnd[axis]])) {
    return padding[axisEnd[axis]];
  }
  return 0.0f;
}

//auto margins are treated as zero
float HPStyle::getStartMargin(FlexDirection axis) {
  if (isRowDirection(axis)
      && isDefined(margin[CSSStart])
      && marginFrom[CSSStart] != CSSNONE) {
    return margin[CSSStart];
  }
  if (isDefined(margin[axisStart[axis]])) {
    return margin[axisStart[axis]];
  }
  return 0.0f;
}

//auto margins are treated as zero
float HPStyle::getEndMargin(FlexDirection axis) {
  if (isRowDirection(axis)
      && isDefined(margin[CSSEnd])
      && marginFrom[CSSEnd] != CSSNONE) {
    return margin[CSSEnd];
  }
  if (isDefined(margin[axisEnd[axis]])) {
    return margin[axisEnd[axis]];
  }
  return 0.0f;
}

float HPStyle::getMargin(FlexDirection axis) {
  return getStartMargin(axis) + getEndMargin(axis);
}

bool HPStyle::isAutoStartMargin(FlexDirection axis) {
  if (isRowDirection(axis) && marginFrom[CSSStart] != CSSNONE) {
    return isUndefined(margin[CSSStart]);
  }
  return isUndefined(margin[axisStart[axis]]);
}

bool HPStyle::isAutoEndMargin(FlexDirection axis) {
  if (isRowDirection(axis) && marginFrom[CSSEnd] != CSSNONE) {
    return isUndefined(margin[CSSEnd]);
  }
  return isUndefined(margin[axisEnd[axis]]);
}

bool HPStyle::hasAutoMargin(FlexDirection axis) {
  return isAutoStartMargin(axis) || isAutoEndMargin(axis);
}

bool HPStyle::isOverflowScroll() {
  return overflowType == OverflowScroll;
}

float HPStyle::getFlexBasis() {
  if (isDefined(flexBasis)) {
    return flexBasis;
  } else if (isDefined(flex) && flex > 0.0f) {
    return 0.0f;
  }

  return VALUE_AUTO;
}
}

