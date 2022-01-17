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
package com.tencent.mtt.hippy.utils;

import android.content.Context;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.Display;
import android.view.WindowManager;

public class PixelUtil {

    private static DisplayMetrics sDisplayMetrics = null;

    public static void initDisplayMetrics(Context appContext) {
        if (appContext == null) {
            return;
        }

        if (sDisplayMetrics == null) {
            sDisplayMetrics = new DisplayMetrics();
            WindowManager windowManager = (WindowManager) appContext
                    .getSystemService(Context.WINDOW_SERVICE);
            Display defaultDisplay = windowManager.getDefaultDisplay();
            defaultDisplay.getRealMetrics(sDisplayMetrics);
        }
    }

    /**
     * Set display metrics, call by host app
     */
    @SuppressWarnings("unused")
    public static void setDisplayMetrics(DisplayMetrics metrics) {
        sDisplayMetrics = metrics;
    }

    /**
     * Convert from dp to px impl
     */
    public static float dp2px(float value) {
        if (sDisplayMetrics == null) {
            return value;
        }
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, value, sDisplayMetrics);
    }

    /**
     * Convert from dp to px
     */
    public static float dp2px(double value) {
        return dp2px((float) value);
    }

    /**
     * Convert from px to dp
     */
    public static float px2dp(float value) {
        return value / getDensity();
    }

    public static float getDensity() {
        if (sDisplayMetrics == null) {
            return 1.0f;
        }
        return sDisplayMetrics.density;
    }
}
