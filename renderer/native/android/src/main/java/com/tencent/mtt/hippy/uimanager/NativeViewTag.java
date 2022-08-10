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

package com.tencent.mtt.hippy.uimanager;

import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.HashMap;
import java.util.Map;

public class NativeViewTag {

    private static final String TAG_CLASS_NAME = "className";
    private static final String TAG_ROOT_ID = "rootId";

    @NonNull
    public static Map<String, Object> createViewTag(@NonNull String className, int rootId) {
        Map<String, Object> tagMap = new HashMap<>();
        tagMap.put(TAG_CLASS_NAME, className);
        tagMap.put(TAG_ROOT_ID, rootId);
        return tagMap;
    }

    @SuppressWarnings("rawtypes")
    @Nullable
    public static String getClassName(@NonNull View view) {
        Object tagObj = view.getTag();
        if (tagObj instanceof Map) {
            Map<String, Object> tagMap = (Map) tagObj;
            Object value = tagMap.get(TAG_CLASS_NAME);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }

    public static int getRootId(@NonNull View view) {
        Object tagObj = view.getTag();
        if (tagObj instanceof Map) {
            Map<String, Object> tagMap = (Map) tagObj;
            Object value = tagMap.get(TAG_ROOT_ID);
            if (value instanceof Integer) {
                return (Integer) value;
            }
        }
        return -1;
    }
}
