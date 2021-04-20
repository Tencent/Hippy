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
package com.tencent.mtt.hippy.dom.flex;

import com.tencent.smtt.flexbox.FlexNodeStyle;

@SuppressWarnings("unused")
public interface FlexNodeAPI<FlexNodeType extends FlexNodeAPI> {

  interface MeasureFunction {
    long measure(
            FlexNodeAPI node,
            float width,
            FlexMeasureMode widthMode,
            float height,
            FlexMeasureMode heightMode);
  }
  int getChildCount();
  FlexNodeType getChildAt(int i);
  void addChildAt(FlexNodeType child, int i);
  FlexNodeType removeChildAt(int i);
  FlexNodeType getParent();
  int indexOf(FlexNodeType child);
  void setMeasureFunction(MeasureFunction measureFunction);
  boolean isMeasureDefined();
  void calculateLayout();
  boolean isDirty();
  boolean hasNewLayout();
  void dirty();
  void markLayoutSeen();
  boolean valuesEqual(float f1, float f2);
  FlexDirection getStyleDirection();
  void setDirection(FlexDirection direction);
  FlexCSSDirection getFlexDirection();
  void setFlexDirection(FlexCSSDirection flexDirection);
  FlexJustify getJustifyContent();
  void setJustifyContent(FlexJustify justifyContent);
  FlexAlign getAlignItems();
  void setAlignItems(FlexAlign alignItems);
  FlexAlign getAlignSelf();
  void setAlignSelf(FlexAlign alignSelf);
  FlexAlign getAlignContent();
  void setAlignContent(FlexAlign alignContent);
  FlexPositionType getPositionType();
  void setPositionType(FlexPositionType positionType);
  void setWrap(FlexWrap flexWrap);
  void setFlex(float flex);
  void setDisplay(FlexNodeStyle.Display  display);
  float getFlexGrow();
  void setFlexGrow(float flexGrow);
  float getFlexShrink();
  void setFlexShrink(float flexShrink);
  float getFlexBasis();
  void setFlexBasis(float flexBasis);
  float getMargin(int spacingType);
  void setMargin(int spacingType, float margin);
  float getPadding(int spacingType);
  void setPadding(int spacingType, float padding);
  float getBorder(int spacingType);
  void setBorder(int spacingType, float border);
  float getPosition(int spacingType);
  void setPosition(int spacingType, float position);
  float getStyleWidth();
  void setStyleWidth(float width);
  float getStyleHeight();
  void setStyleHeight(float height);
  float getStyleMaxWidth();
  void setStyleMaxWidth(float maxWidth);
  float getStyleMinWidth();
  void setStyleMinWidth(float minWidth);
  float getStyleMaxHeight();
  void setStyleMaxHeight(float maxHeight);
  float getStyleMinHeight();
  void setStyleMinHeight(float minHeight);
  float getLayoutX();
  float getLayoutY();
  float getLayoutWidth();
  float getLayoutHeight();
  FlexDirection getLayoutDirection();
  FlexOverflow getOverflow();
  void setOverflow(FlexOverflow overflow);
  void setData(Object data);
  Object getData();
  void reset();
}
