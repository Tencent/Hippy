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

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.List;
import java.util.Map;

public class MapUtils {

    public static int getIntValue(@NonNull Map<String, Object> params, String key) {
        Object element = params.get(key);
        if (element instanceof Number) {
            return ((Number) element).intValue();
        }
        return 0;
    }

    public static float getFloatValue(@NonNull Map<String, Object> params, String key) {
        Object element = params.get(key);
        if (element instanceof Number) {
            return ((Number) element).floatValue();
        }
        return 0;
    }

    public static double getDoubleValue(@NonNull Map<String, Object> params, String key) {
        Object element = params.get(key);
        if (element instanceof Number) {
            return ((Number) element).doubleValue();
        }
        return 0;
    }

    @Nullable
    public static String getStringValue(@NonNull Map<String, Object> params, String key) {
        Object element = params.get(key);
        if (element instanceof String) {
            return ((String) element);
        }
        return null;
    }

    public static boolean getBooleanValue(@NonNull Map<String, Object> params, String key) {
        Object element = params.get(key);
        if (element instanceof Boolean) {
            return ((boolean) element);
        }
        return false;
    }
}
