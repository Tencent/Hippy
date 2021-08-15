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
package com.tencent.mtt.hippy.dom.node;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.flex.*;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.smtt.flexbox.FlexNodeStyle;

import java.util.Locale;

@SuppressWarnings("unused")
public class StyleNode extends DomNode {

  @HippyControllerProps(name = NodeProps.WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setWidth(float width) {
    setStyleWidth(FlexConstants.isUndefined(width) ? width : PixelUtil.dp2px(width));
  }

  @HippyControllerProps(name = NodeProps.MIN_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setMinWidth(float minWidth) {
    setStyleMinWidth(FlexConstants.isUndefined(minWidth) ? minWidth : PixelUtil.dp2px(minWidth));
  }

  @HippyControllerProps(name = NodeProps.MAX_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setMaxWidth(float maxWidth) {
    setStyleMaxWidth(FlexConstants.isUndefined(maxWidth) ? maxWidth : PixelUtil.dp2px(maxWidth));
  }

  @HippyControllerProps(name = NodeProps.HEIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setHeight(float height) {
    setStyleHeight(FlexConstants.isUndefined(height) ? height : PixelUtil.dp2px(height));
  }

  @HippyControllerProps(name = NodeProps.MIN_HEIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setMinHeight(float minHeight) {
    setStyleMinHeight(
        FlexConstants.isUndefined(minHeight) ? minHeight : PixelUtil.dp2px(minHeight));
  }

  @HippyControllerProps(name = NodeProps.MAX_HEIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setMaxHeight(float maxHeight) {
    setStyleMaxHeight(
        FlexConstants.isUndefined(maxHeight) ? maxHeight : PixelUtil.dp2px(maxHeight));
  }

  @HippyControllerProps(name = NodeProps.FLEX, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setFlex(float flex) {
    super.setFlex(flex);
  }

  @HippyControllerProps(name = NodeProps.FLEX_GROW, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setFlexGrow(float flexGrow) {
    super.setFlexGrow(flexGrow);
  }

  @HippyControllerProps(name = NodeProps.FLEX_SHRINK, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setFlexShrink(float flexShrink) {
    super.setFlexShrink(flexShrink);
  }

  @HippyControllerProps(name = NodeProps.FLEX_BASIS, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setFlexBasis(float flexBasis) {
    super.setFlexBasis(flexBasis);
  }

  @HippyControllerProps(name = NodeProps.FLEX_DIRECTION)
  public void setFlexDirection(String flexDirection) {
    setFlexDirection(flexDirection == null ? FlexCSSDirection.COLUMN
        : FlexCSSDirection.valueOf(flexDirection.toUpperCase(Locale.US).replace("-",
            "_")));
  }

  @HippyControllerProps(name = NodeProps.FLEX_WRAP)
  public void setFlexWrap(String flexWrap) {
    setWrap(flexWrap == null ? FlexWrap.NOWRAP : FlexWrap.valueOf(flexWrap.toUpperCase(Locale.US)));
  }

  @HippyControllerProps(name = NodeProps.ALIGN_SELF)
  public void setAlignSelf(String alignSelf) {
    setAlignSelf(alignSelf == null ? FlexAlign.AUTO
        : FlexAlign.valueOf(alignSelf.toUpperCase(Locale.US).replace("-", "_")));
  }

  @HippyControllerProps(name = NodeProps.ALIGN_ITEMS)
  public void setAlignItems(String alignItems) {
    setAlignItems(alignItems == null ? FlexAlign.STRETCH
        : FlexAlign.valueOf(alignItems.toUpperCase(Locale.US).replace("-", "_")));
  }

  @HippyControllerProps(name = NodeProps.JUSTIFY_CONTENT)
  public void setJustifyContent(String justifyContent) {
    setJustifyContent(justifyContent == null ? FlexJustify.FLEX_START
        : FlexJustify.valueOf(justifyContent.toUpperCase(Locale.US).replace("-",
            "_")));
  }

  @HippyControllerProps(name = NodeProps.OVERFLOW)
  public void setOverflow(String overflow) {
    setOverflow(overflow == null ? FlexOverflow.VISIBLE
        : FlexOverflow.valueOf(overflow.toUpperCase(Locale.US).replace("-", "_")));
  }

  @SuppressWarnings("SwitchStatementWithTooFewBranches")
  @HippyControllerProps(name = NodeProps.DISPLAY)
  public void setDisplay(String display) {
    FlexNodeStyle.Display flexDisplay = FlexNodeStyle.Display.DISPLAY_FLEX;
    switch (display) {
      case "none":
        flexDisplay = FlexNodeStyle.Display.DISPLAY_NONE;
        break;
      default:

    }
    setDisplay(flexDisplay);
  }


  @HippyControllerProps(name = NodeProps.MARGIN, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setMargin(float margin) {
    setMargin(FlexSpacing.ALL, PixelUtil.dp2px(margin));
  }

  @HippyControllerProps(name = NodeProps.MARGIN_VERTICAL, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setMarginVertical(float margin) {
    setMargin(FlexSpacing.VERTICAL, PixelUtil.dp2px(margin));
  }

  @HippyControllerProps(name = NodeProps.MARGIN_HORIZONTAL, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setMarginHoriziontal(float margin) {
    setMargin(FlexSpacing.HORIZONTAL, PixelUtil.dp2px(margin));
  }

  @HippyControllerProps(name = NodeProps.MARGIN_LEFT, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setMarginLeft(float margin) {
    setMargin(FlexSpacing.LEFT, PixelUtil.dp2px(margin));
  }

  @HippyControllerProps(name = NodeProps.MARGIN_RIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setMarginRight(float margin) {
    setMargin(FlexSpacing.RIGHT, PixelUtil.dp2px(margin));
  }

  @HippyControllerProps(name = NodeProps.MARGIN_TOP, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setMarginTop(float margin) {
    setMargin(FlexSpacing.TOP, PixelUtil.dp2px(margin));
  }

  @HippyControllerProps(name = NodeProps.MARGIN_BOTTOM, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setMarginBottom(float margin) {
    setMargin(FlexSpacing.BOTTOM, PixelUtil.dp2px(margin));
  }

  @HippyControllerProps(name = NodeProps.PADDING, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPadding(float padding) {
    setPadding(FlexSpacing.ALL,
        FlexConstants.isUndefined(padding) ? padding : PixelUtil.dp2px(padding));
  }

  @HippyControllerProps(name = NodeProps.PADDING_VERTICAL, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPaddingVertical(float padding) {
    setPadding(FlexSpacing.VERTICAL,
        FlexConstants.isUndefined(padding) ? padding : PixelUtil.dp2px(padding));
  }

  @HippyControllerProps(name = NodeProps.PADDING_HORIZONTAL, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPaddingHorizontal(float padding) {
    setPadding(FlexSpacing.HORIZONTAL,
        FlexConstants.isUndefined(padding) ? padding : PixelUtil.dp2px(padding));
  }

  @HippyControllerProps(name = NodeProps.PADDING_LEFT, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPaddingLeft(float padding) {
    setPadding(FlexSpacing.LEFT,
        FlexConstants.isUndefined(padding) ? padding : PixelUtil.dp2px(padding));
  }

  @HippyControllerProps(name = NodeProps.PADDING_RIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPaddingRight(float padding) {
    setPadding(FlexSpacing.RIGHT,
        FlexConstants.isUndefined(padding) ? padding : PixelUtil.dp2px(padding));
  }

  @HippyControllerProps(name = NodeProps.PADDING_TOP, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPaddingTop(float padding) {
    setPadding(FlexSpacing.TOP,
        FlexConstants.isUndefined(padding) ? padding : PixelUtil.dp2px(padding));
  }

  @HippyControllerProps(name = NodeProps.PADDING_BOTTOM, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setPaddingBottom(float padding) {
    setPadding(FlexSpacing.BOTTOM,
        FlexConstants.isUndefined(padding) ? padding : PixelUtil.dp2px(padding));
  }


  @HippyControllerProps(name = NodeProps.BORDER_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setBorderWidths(float borderWidth) {
    setBorder(FlexSpacing.ALL, PixelUtil.dp2px(borderWidth));
  }

  @HippyControllerProps(name = NodeProps.BORDER_LEFT_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setLeftBorderWidths(float borderWidth) {
    setBorder(FlexSpacing.LEFT, PixelUtil.dp2px(borderWidth));
  }

  @HippyControllerProps(name = NodeProps.BORDER_RIGHT_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setRightBorderWidths(float borderWidth) {
    setBorder(FlexSpacing.RIGHT, PixelUtil.dp2px(borderWidth));
  }

  @HippyControllerProps(name = NodeProps.BORDER_TOP_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setTopBorderWidths(float borderWidth) {
    setBorder(FlexSpacing.TOP, PixelUtil.dp2px(borderWidth));
  }

  @HippyControllerProps(name = NodeProps.BORDER_BOTTOM_WIDTH, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
  public void setBottomBorderWidths(float borderWidth) {
    setBorder(FlexSpacing.BOTTOM, PixelUtil.dp2px(borderWidth));
  }

  @HippyControllerProps(name = NodeProps.LEFT, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setLeftPositionValues(float position) {
    setPosition(FlexSpacing.LEFT,
        FlexConstants.isUndefined(position) ? position : PixelUtil.dp2px(position));
  }

  @HippyControllerProps(name = NodeProps.RIGHT, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setRightPositionValues(float position) {
    setPosition(FlexSpacing.RIGHT,
        FlexConstants.isUndefined(position) ? position : PixelUtil.dp2px(position));
  }

  @HippyControllerProps(name = NodeProps.TOP, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setTopPositionValues(float position) {
    setPosition(FlexSpacing.TOP,
        FlexConstants.isUndefined(position) ? position : PixelUtil.dp2px(position));
  }

  @HippyControllerProps(name = NodeProps.BOTTOM, defaultType = HippyControllerProps.NUMBER, defaultNumber = FlexConstants.UNDEFINED)
  public void setBottomPositionValues(float position) {
    setPosition(FlexSpacing.BOTTOM,
        FlexConstants.isUndefined(position) ? position : PixelUtil.dp2px(position));
  }

  @HippyControllerProps(name = NodeProps.POSITION)
  public void setPosition(String position) {
    FlexPositionType positionType = position == null ? FlexPositionType.RELATIVE
        : FlexPositionType.valueOf(position.toUpperCase(Locale.US));
    setPositionType(positionType);
  }

  @HippyControllerProps(name = "onLayout", defaultType = HippyControllerProps.BOOLEAN)
  public void setShouldNotifyOnLayout(boolean mShouldNotifyOnLayout) {
    super.setShouldNotifyOnLayout(mShouldNotifyOnLayout);
  }
}
