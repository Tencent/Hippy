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

package com.tencent.renderer.component.drawable;

import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.RippleDrawable;
import android.os.Build;

import com.tencent.mtt.hippy.utils.PixelUtil;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import java.util.Map;

public class DrawableFactory {

    private static final String PROPERTY_RIPPLE_COLOR = "color";
    private static final String PROPERTY_RIPPLE_RADIUS = "rippleRadius";
    private static final String PROPERTY_RIPPLE_BORDERLESS = "borderless";

    public enum DrawableType {
        DRAWABLE_TYPE_RIPPLE
    }

    @Nullable
    public static Drawable createDrawable(DrawableType type, @Nullable Map params) {
        Drawable drawable = null;
        switch (type) {
            case DRAWABLE_TYPE_RIPPLE:
                if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    drawable = createRippleDrawable(params);
                }
                break;
            default:
        }

        return drawable;
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @NonNull
    private static Drawable createRippleDrawable(@Nullable Map params) {
        int color = Color.BLUE;
        int radius = 0;
        Drawable mask = null;
        if (params != null) {
            Object value = params.get(PROPERTY_RIPPLE_COLOR);
            if (value instanceof Number) {
                color = ((Number) value).intValue();
            }
            value = params.get(PROPERTY_RIPPLE_RADIUS);
            if (value instanceof Number) {
                double rd = ((Number) value).doubleValue();
                radius = (int) (PixelUtil.dp2px(rd) + 0.5);
            }
            value = params.get(PROPERTY_RIPPLE_BORDERLESS);
            if (value == null || (value instanceof Boolean && !((boolean) value))) {
                mask = new ColorDrawable(Color.WHITE);
            }
        }
        ColorStateList colorStateList =
                new ColorStateList(new int[][]{new int[]{}}, new int[]{color});
        RippleDrawable drawable = new RippleDrawable(colorStateList, null, mask);
        if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && radius > 0) {
            drawable.setRadius(radius);
        }
        return drawable;
    }
}
