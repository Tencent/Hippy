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

public class ArrayUtils {

    private static final int DEFAULT_NUMBER_VALUE = 0;

    public static int getIntValue(@NonNull List<?> params, int index) {
        if (index >= params.size()) {
            return DEFAULT_NUMBER_VALUE;
        }
        Object element = params.get(index);
        if (element instanceof Number) {
            return ((Number) element).intValue();
        }
        return DEFAULT_NUMBER_VALUE;
    }

    public static double getDoubleValue(@NonNull List<?> params, int index) {
        if (index >= params.size()) {
            return DEFAULT_NUMBER_VALUE;
        }
        Object element = params.get(index);
        if (element instanceof Number) {
            return ((Number) element).doubleValue();
        }
        return DEFAULT_NUMBER_VALUE;
    }

    @Nullable
    public static String getStringValue(@NonNull List<?> params, int index) {
        if (index >= params.size()) {
            return null;
        }
        Object element = params.get(index);
        if (element instanceof String) {
            return ((String) element);
        }
        return null;
    }

    public static boolean getBooleanValue(@NonNull List<?> params, int index) {
        if (index >= params.size()) {
            return false;
        }
        Object element = params.get(index);
        if (element instanceof String) {
            return ((boolean) element);
        }
        return false;
    }
}
