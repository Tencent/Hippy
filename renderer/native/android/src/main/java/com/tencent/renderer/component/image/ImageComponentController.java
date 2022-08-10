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

package com.tencent.renderer.component.image;

import static androidx.annotation.Dimension.DP;
import static com.tencent.renderer.component.drawable.ContentDrawable.ScaleType;

import android.graphics.Color;

import androidx.annotation.ColorInt;
import androidx.annotation.Dimension;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.component.Component;

public class ImageComponentController {

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "src", defaultType = HippyControllerProps.STRING)
    public void setUrl(@NonNull Component component, String uri) {
        if (component instanceof ImageComponent) {
            ((ImageComponent) component).setSrc(uri);
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "defaultSource", defaultType = HippyControllerProps.STRING)
    public void setDefaultSource(@NonNull Component component, String uri) {
        if (component instanceof ImageComponent) {
            ((ImageComponent) component).setDefaultSource(uri);
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "tintColor", defaultType = HippyControllerProps.NUMBER,
            defaultNumber = Color.TRANSPARENT)
    public void setTintColor(@NonNull Component component, @ColorInt int tintColor) {
        if (component instanceof ImageComponent) {
            ((ImageComponent) component).setTintColor(tintColor);
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "tintColorBlendMode", defaultType = HippyControllerProps.NUMBER)
    public void setTintColorBlendMode(@NonNull Component component,
            @ColorInt int tintColorBlendMode) {
        if (component instanceof ImageComponent) {
            ((ImageComponent) component).setTintColorBlendMode(tintColorBlendMode);
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BACKGROUND_IMAGE, defaultType = HippyControllerProps.STRING)
    public void setBackgroundImage(@NonNull Component component, String uri) {
        if (component instanceof ImageComponent) {
            ((ImageComponent) component).setSrc(uri);
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BACKGROUND_POSITION_X, defaultType = HippyControllerProps.NUMBER)
    public void setBackgroundImagePositionX(@NonNull Component component,
            @Dimension(unit = DP) int positionX) {
        if (component instanceof ImageComponent) {
            ((ImageComponent) component).setImagePositionX((int) PixelUtil.dp2px(positionX));
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BACKGROUND_POSITION_Y, defaultType = HippyControllerProps.NUMBER)
    public void setBackgroundImagePositionY(@NonNull Component component,
            @Dimension(unit = DP) int positionY) {
        if (component instanceof ImageComponent) {
            ((ImageComponent) component).setImagePositionY((int) PixelUtil.dp2px(positionY));
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.BACKGROUND_SIZE, defaultType = HippyControllerProps.STRING,
            defaultString = "origin")
    public void setBackgroundImageSize(@NonNull Component component, String resizeModeValue) {
        setScaleType(component, resizeModeValue, ScaleType.ORIGIN);
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = NodeProps.RESIZE_MODE, defaultType = HippyControllerProps.STRING,
            defaultString = "fitXY")
    public void setResizeMode(@NonNull Component component, String resizeModeValue) {
        setScaleType(component, resizeModeValue, ScaleType.FIT_XY);
    }

    private void setScaleType(@NonNull Component component, @Nullable String resizeModeValue,
            ScaleType scaleType) {
        if (resizeModeValue == null) {
            return;
        }
        if (component instanceof ImageComponent) {
            switch (resizeModeValue) {
                case "contain":
                    ((ImageComponent) component).setScaleType(ScaleType.CENTER_INSIDE);
                    break;
                case "cover":
                    ((ImageComponent) component).setScaleType(ScaleType.CENTER_CROP);
                    break;
                case "center":
                    ((ImageComponent) component).setScaleType(ScaleType.CENTER);
                    break;
                case "origin":
                    ((ImageComponent) component).setScaleType(ScaleType.ORIGIN);
                    break;
                case "repeat":
                    ((ImageComponent) component).setScaleType(ScaleType.REPEAT);
                    break;
                case "fitXY":
                    ((ImageComponent) component).setScaleType(ScaleType.FIT_XY);
                    break;
                default:
                    ((ImageComponent) component).setScaleType(scaleType);
            }
        }
    }

    @SuppressWarnings("unused")
    @HippyControllerProps(name = "capInsets", defaultType = HippyControllerProps.MAP)
    public void setCapInsets(@NonNull Component component, HippyMap capInsets) {
        // TODO: support 9-Patch image draw.
    }
}
