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

package com.tencent.renderer.component;

import static androidx.annotation.Dimension.DP;

import android.graphics.Color;
import android.text.TextUtils;

import androidx.annotation.ColorInt;
import androidx.annotation.Dimension;
import androidx.annotation.NonNull;

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.component.drawable.BackgroundDrawable.BorderStyle;

import java.util.ArrayList;
import java.util.Map;

public class ComponentController {

    private static final String BORDER_STYLE_NONE = "none";
    private static final String BORDER_STYLE_SOLID = "solid";
    private static final String BORDER_STYLE_DOTTED = "dotted";
    private static final String BORDER_STYLE_DASHED = "dashed";

    @HippyControllerProps(name = NodeProps.BACKGROUND_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.TRANSPARENT)
    public void setBackground(@NonNull Component component, @ColorInt int backgroundColor) {
        component.setBackgroundColor(backgroundColor);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_RADIUS, defaultType = HippyControllerProps.NUMBER)
    public void setBorderRadius(@NonNull Component component, @Dimension(unit = DP) float borderRadius) {
        component.setBorderRadius(PixelUtil.dp2px(borderRadius));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_TOP_LEFT_RADIUS, defaultType = HippyControllerProps.NUMBER)
    public void setTopLeftBorderRadius(@NonNull Component component, @Dimension(unit = DP) float topLeftBorderRadius) {
        component.setTopLeftBorderRadius(PixelUtil.dp2px(topLeftBorderRadius));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_TOP_RIGHT_RADIUS, defaultType = HippyControllerProps.NUMBER)
    public void setTopRightBorderRadius(@NonNull Component component, @Dimension(unit = DP) float topRightBorderRadius) {
        component.setTopRightBorderRadius(PixelUtil.dp2px(topRightBorderRadius));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_BOTTOM_RIGHT_RADIUS, defaultType = HippyControllerProps.NUMBER)
    public void setBottomRightBorderRadius(@NonNull Component component, @Dimension(unit = DP) float bottomRightBorderRadius) {
        component.setBottomRightBorderRadius(PixelUtil.dp2px(bottomRightBorderRadius));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_BOTTOM_LEFT_RADIUS, defaultType = HippyControllerProps.NUMBER)
    public void setBottomLeftBorderRadius(@NonNull Component component, @Dimension(unit = DP) float bottomLeftBorderRadius) {
        component.setBottomLeftBorderRadius(PixelUtil.dp2px(bottomLeftBorderRadius));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setBorderWidth(@NonNull Component component, @Dimension(unit = DP) float borderWidth) {
        component.setBorderWidth(PixelUtil.dp2px(borderWidth));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_STYLES, defaultType = HippyControllerProps.STRING)
    public void setBorderStyle(@NonNull Component component, String style) {
        if (TextUtils.isEmpty(style)) {
            return;
        }
        BorderStyle borderStyle;
        switch (style) {
            case BORDER_STYLE_NONE:
                borderStyle = BorderStyle.NONE;
                break;
            case BORDER_STYLE_DOTTED:
                borderStyle = BorderStyle.DOTTED;
                break;
            case BORDER_STYLE_DASHED:
                borderStyle = BorderStyle.DASHED;
                break;
            case BORDER_STYLE_SOLID:
                // fall through
            default:
                borderStyle = BorderStyle.SOLID;
        }
        component.setBorderStyle(borderStyle);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.LINEAR_GRADIENT, defaultType = HippyControllerProps.MAP)
    public void setLinearGradient(@NonNull Component component, @Nullable HippyMap linearGradient) {
        if (linearGradient != null) {
            String angle = linearGradient.getString("angle");
            HippyArray colorStopList = linearGradient.getArray("colorStopList");
            if (TextUtils.isEmpty(angle) || colorStopList == null || colorStopList.size() == 0) {
                return;
            }
            int size = colorStopList.size();
            ArrayList<Integer> colorsArray = new ArrayList<>();
            ArrayList<Float> positionsArray = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                HippyMap colorStop = colorStopList.getMap(i);
                if (colorStop == null) {
                    continue;
                }
                int color = colorStop.getInt("color");
                colorsArray.add(color);
                float ratio = 0.0f;
                if (colorStop.containsKey("ratio")) {
                    ratio = (float) colorStop.getDouble("ratio");
                } else if (i == (size - 1)) {
                    ratio = 1.0f;
                }
                positionsArray.add(ratio);
            }
            component.setGradientAngleDesc(angle);
            component.setGradientColors(colorsArray);
            component.setGradientPositions(positionsArray);
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.SHADOW_OFFSET, defaultType = HippyControllerProps.MAP)
    public void setShadowOffset(@NonNull Component component, @Nullable HippyMap shadowOffset) {
        float shadowOffsetX = shadowOffset.getInt("x");
        float shadowOffsetY = shadowOffset.getInt("y");
        component.setShadowOffsetX(PixelUtil.dp2px(shadowOffsetX));
        component.setShadowOffsetY(PixelUtil.dp2px(shadowOffsetY));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.SHADOW_OFFSET_X, defaultType = HippyControllerProps.NUMBER)
    public void setShadowOffsetX(@NonNull Component component, @Dimension(unit = DP) float shadowOffsetX) {
        component.setShadowOffsetX(PixelUtil.dp2px(shadowOffsetX));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.SHADOW_OFFSET_Y, defaultType = HippyControllerProps.NUMBER)
    public void setShadowOffsetY(@NonNull Component component, @Dimension(unit = DP) float shadowOffsetY) {
        component.setShadowOffsetY(PixelUtil.dp2px(shadowOffsetY));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.SHADOW_OPACITY, defaultType = HippyControllerProps.NUMBER)
    public void setShadowOpacity(@NonNull Component component, float shadowOpacity) {
        component.setShadowOpacity(shadowOpacity);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.SHADOW_RADIUS, defaultType = HippyControllerProps.NUMBER)
    public void setShadowRadius(@NonNull Component component, @Dimension(unit = DP) float shadowRadius) {
        component.setShadowRadius(PixelUtil.dp2px(shadowRadius));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.SHADOW_COLOR, defaultType = HippyControllerProps.NUMBER)
    public void setShadowColor(@NonNull Component component, @ColorInt int shadowColor) {
        component.setShadowColor(shadowColor);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_LEFT_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setLeftBorderWidth(@NonNull Component component, @Dimension(unit = DP) float borderLeftWidth) {
        component.setLeftBorderWidth(PixelUtil.dp2px(borderLeftWidth));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_TOP_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setTopBorderWidth(@NonNull Component component, @Dimension(unit = DP) float borderTopWidth) {
        component.setTopBorderWidth(PixelUtil.dp2px(borderTopWidth));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_RIGHT_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setRightBorderWidth(@NonNull Component component, @Dimension(unit = DP) float borderRightWidth) {
        component.setRightBorderWidth(PixelUtil.dp2px(borderRightWidth));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_BOTTOM_WIDTH, defaultType = HippyControllerProps.NUMBER)
    public void setBottomBorderWidth(@NonNull Component component, @Dimension(unit = DP) float borderBottomWidth) {
        component.setBottomBorderWidth(PixelUtil.dp2px(borderBottomWidth));
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.BLACK)
    public void setBorderColor(@NonNull Component component, @ColorInt int borderColor) {
        component.setBorderColor(borderColor);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_LEFT_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.BLACK)
    public void setLeftBorderColor(@NonNull Component component, @ColorInt int borderLeftColor) {
        component.setLeftBorderColor(borderLeftColor);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_TOP_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.BLACK)
    public void setTopBorderColor(@NonNull Component component, @ColorInt int borderTopColor) {
        component.setTopBorderColor(borderTopColor);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_RIGHT_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.BLACK)
    public void setRightBorderColor(@NonNull Component component, @ColorInt int borderRightColor) {
        component.setRightBorderColor(borderRightColor);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BORDER_BOTTOM_COLOR, defaultType = HippyControllerProps.NUMBER, defaultNumber = Color.BLACK)
    public void setBottomBorderColor(@NonNull Component component, @ColorInt int borderBottomColor) {
        component.setBottomBorderColor(borderBottomColor);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BACKGROUND_RIPPLE, defaultType = HippyControllerProps.MAP)
    public void setNativeBackground(@NonNull Component component, @Nullable Map params) {
        component.ensureRippleDrawable(params);
    }
}
