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

import java.util.Map;

public class MapUtils {

    public static int getIntValue(@NonNull Map<String, Object> params, @NonNull String key) {
        Object element = params.get(key);
        return (element instanceof Number) ? ((Number) element).intValue() : 0;
    }

    public static int getIntValue(@NonNull Map<String, Object> params, @NonNull String key,
            int defaultValue) {
        Object element = params.get(key);
        return (element instanceof Number) ? ((Number) element).intValue() : defaultValue;
    }

    @SuppressWarnings("unused")
    public static float getFloatValue(@NonNull Map<String, Object> params, @NonNull String key) {
        Object element = params.get(key);
        return (element instanceof Number) ? ((Number) element).floatValue() : 0.0f;
    }

    @SuppressWarnings("unused")
    public static float getFloatValue(@NonNull Map<String, Object> params, @NonNull String key,
            float defaultValue) {
        Object element = params.get(key);
        return (element instanceof Number) ? ((Number) element).floatValue() : defaultValue;
    }

    @SuppressWarnings("unused")
    public static double getDoubleValue(@NonNull Map<String, Object> params, @NonNull String key) {
        Object element = params.get(key);
        return (element instanceof Number) ? ((Number) element).doubleValue() : 0;
    }

    @SuppressWarnings("unused")
    public static double getDoubleValue(@NonNull Map<String, Object> params, @NonNull String key,
            double defaultValue) {
        Object element = params.get(key);
        return (element instanceof Number) ? ((Number) element).doubleValue() : defaultValue;
    }

    @SuppressWarnings("unused")
    @Nullable
    public static String getStringValue(@NonNull Map<String, Object> params, @NonNull String key) {
        Object element = params.get(key);
        return (element instanceof String) ? ((String) element) : null;
    }

    @SuppressWarnings("unused")
    @Nullable
    public static String getStringValue(@NonNull Map<String, Object> params, @NonNull String key,
            @Nullable String defaultValue) {
        Object element = params.get(key);
        return (element instanceof String) ? ((String) element) : defaultValue;
    }

    public static boolean getBooleanValue(@NonNull Map<String, Object> params,
            @NonNull String key) {
        Object element = params.get(key);
        return element instanceof Boolean && ((boolean) element);
    }

    public static boolean getBooleanValue(@NonNull Map<String, Object> params, @NonNull String key,
            boolean defaultValue) {
        Object element = params.get(key);
        return (element instanceof Boolean) ? ((boolean) element) : defaultValue;
    }

    @SuppressWarnings("unchecked")
    @Nullable
    public static Map<String, Object> getMapValue(@NonNull Map<String, Object> params,
            @NonNull String key) {
        Object element = params.get(key);
        return (element instanceof Map) ? ((Map<String, Object>) element) : null;
    }
}
