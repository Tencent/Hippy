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

    public static DisplayMetrics getMetrics() {
        if (sDisplayMetrics == null) {
            sDisplayMetrics = new DisplayMetrics();
            WindowManager windowManager = (WindowManager) ContextHolder.getAppContext()
                    .getSystemService(Context.WINDOW_SERVICE);
            Display defaultDisplay = windowManager.getDefaultDisplay();
            defaultDisplay.getRealMetrics(sDisplayMetrics);
        }
        return sDisplayMetrics;
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
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, value, getMetrics());
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

    public static float sp2px(float value) {
        return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_SP, value, getMetrics());
    }

    public static float px2sp(float value) {
        return value / getMetrics().scaledDensity;
    }

    public static float getDensity() {
        return getMetrics().density;
    }
}
