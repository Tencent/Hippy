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

#pragma once

#include <string>

#include "MTTFlex.h"
#include "MTTUtil.h"
// CSSLeft <---> CSSEnd
#define CSS_PROPS_COUNT (6)
class MTTStyle {
 public:
  MTTStyle();
  virtual ~MTTStyle();
  std::string toString();
  void setDirection(MTTDirection direction_) { direction = direction_; }

  bool setMargin(CSSDirection dir, float value);
  bool setPadding(CSSDirection dir, float value);
  bool setBorder(CSSDirection dir, float value);
  bool isDimensionAuto(FlexDirection axis);

  float getStartBorder(FlexDirection axis);
  float getEndBorder(FlexDirection axis);
  float getStartPadding(FlexDirection axis);
  float getEndPadding(FlexDirection axis);
  float getStartMargin(FlexDirection axis);
  float getEndMargin(FlexDirection axis);
  float getMargin(FlexDirection axis);
  bool isAutoStartMargin(FlexDirection axis);
  bool isAutoEndMargin(FlexDirection axis);
  bool hasAutoMargin(FlexDirection axis);

  bool setPosition(CSSDirection dir, float value);
  float getStartPosition(FlexDirection axis);
  float getEndPosition(FlexDirection axis);
  void setDim(FlexDirection axis, float value);
  float getDim(FlexDirection axis);
  void setDim(Dimension dimension, float value);
  float getDim(Dimension dimension);
  bool isOverflowScroll();
  float getFlexBasis();

 public:
  NodeType nodeType;
  MTTDirection direction;
  FlexDirection flexDirection;
  FlexAlign justifyContent;
  FlexAlign alignContent;
  FlexAlign alignItems;
  FlexAlign alignSelf;
  FlexWrapMode flexWrap;
  PositionType positionType;
  DisplayType displayType;
  OverflowType overflowType;

  float flexBasis;
  float flexGrow;
  float flexShrink;
  float flex;

  float margin[CSS_PROPS_COUNT];
  CSSDirection marginFrom[CSS_PROPS_COUNT];
  float padding[CSS_PROPS_COUNT];
  CSSDirection paddingFrom[CSS_PROPS_COUNT];
  float border[CSS_PROPS_COUNT];
  CSSDirection borderFrom[CSS_PROPS_COUNT];
  float position[CSS_PROPS_COUNT];

  float dim[2];
  float minDim[2];
  float maxDim[2];

  float itemSpace;
  float lineSpace;
};
