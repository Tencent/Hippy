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

package com.tencent.renderer.utils;

import android.content.Context;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.WindowManager;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.utils.ContextHolder;

public class DisplayUtils {

    @Nullable
    public static DisplayMetrics getMetrics(boolean isReal) {
        Context applicationContext = ContextHolder.getAppContext();
        if (applicationContext == null) {
            return null;
        }
        DisplayMetrics metrics = new DisplayMetrics();
        WindowManager windowManager = (WindowManager) applicationContext
                .getSystemService(Context.WINDOW_SERVICE);
        Display defaultDisplay = windowManager.getDefaultDisplay();
        if (isReal) {
            defaultDisplay.getRealMetrics(metrics);
        } else {
            defaultDisplay.getMetrics(metrics);
        }
        return metrics;
    }

    public static int getScreenHeight() {
        DisplayMetrics metrics = getMetrics(true);
        if (metrics == null) {
            return 0;
        }
        return metrics.heightPixels;
    }

    public static int getScreenWidth() {
        DisplayMetrics metrics = getMetrics(true);
        if (metrics == null) {
            return 0;
        }
        return metrics.widthPixels;
    }
}
