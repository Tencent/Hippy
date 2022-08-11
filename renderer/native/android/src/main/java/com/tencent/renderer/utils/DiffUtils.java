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

import android.text.TextUtils;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class DiffUtils {

    private static final String TAG = "DiffUtils";
    private static final String TINT_COLORS = "tintColors";
    private static final String TINT_COLOR = "tintColor";

    @SuppressWarnings({"unchecked", "rawtypes"})
    @Nullable
    private static Map<String, Object> findResetStyles(@Nullable Map<String, Object> fromProps,
            @Nullable Map<String, Object> toProps) {
        Map<String, Object> diffStyles = null;
        Map<String, Object> fromStyle =
                (fromProps != null) ? (Map) fromProps.get(NodeProps.STYLE) : null;
        if (fromStyle == null) {
            return null;
        }
        Map<String, Object> toStyle = (toProps != null) ? (Map) toProps.get(NodeProps.STYLE) : null;
        Set<String> styleKeys = fromStyle.keySet();
        for (String styleKey : styleKeys) {
            if (toStyle == null || !toStyle.containsKey(styleKey)) {
                if (diffStyles == null) {
                    diffStyles = new HashMap<>();
                }
                diffStyles.put(styleKey, null);
            }
        }
        return diffStyles;
    }

    @Nullable
    public static Map<String, Object> findResetProps(@Nullable Map<String, Object> fromProps,
            @Nullable Map<String, Object> toProps) {
        if (fromProps == null) {
            return null;
        }
        Map<String, Object> diffProps = null;
        Map<String, Object> diffStyles;
        Set<String> fromKeys = fromProps.keySet();
        try {
            diffStyles = findResetStyles(fromProps, toProps);
            if (diffStyles != null) {
                diffProps = new HashMap<>();
                diffProps.put(NodeProps.STYLE, diffStyles);
            }
            for (String fromKey : fromKeys) {
                if (fromKey.equals(NodeProps.STYLE)) {
                    continue;
                }
                if (toProps == null || !toProps.containsKey(fromKey)) {
                    if (diffProps == null) {
                        diffProps = new HashMap<>();
                    }
                    diffProps.put(fromKey, null);
                }
            }
        } catch (Exception e) {
            LogUtils.w(TAG, "findDifferent: " + e.getMessage());
        }
        return diffProps;
    }

    private static boolean checkComponentProperty(@NonNull String key,
            @Nullable ControllerManager controllerManager) {
        if (controllerManager != null) {
            return controllerManager.checkComponentProperty(key);
        }
        return false;
    }

    public static boolean diffLayout(@NonNull RenderNode fromNode,
            @NonNull RenderNode toNode) {
        return fromNode.getX() != toNode.getX() || fromNode.getY() != toNode.getY()
                || fromNode.getWidth() != toNode.getWidth()
                || fromNode.getHeight() != toNode.getHeight();
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private static void diffProperty(@NonNull String fromKey, @Nullable Object fromValue,
            @Nullable Object toValue, @NonNull Map<String, Object> updateProps, int diffLevel,
            @Nullable ControllerManager controllerManager,
            @Nullable Map<String, Object> componentProps) {
        if (fromValue instanceof Boolean) {
            if (!(toValue instanceof Boolean) || ((boolean) fromValue != (boolean) toValue)) {
                updateProps.put(fromKey, toValue);
            }
        } else if (fromValue instanceof Number) {
            if (!(toValue instanceof Number)
                    || ((Number) fromValue).doubleValue() != ((Number) toValue).doubleValue()) {
                updateProps.put(fromKey, toValue);
            }
        } else if (fromValue instanceof String) {
            if (toValue == null || !TextUtils.equals(fromValue.toString(), toValue.toString())) {
                updateProps.put(fromKey, toValue);
            }
        } else if (fromValue instanceof ArrayList) {
            if (toValue instanceof ArrayList) {
                boolean hasDifferent = diffArray((ArrayList) fromValue,
                        (ArrayList) toValue, diffLevel + 1, controllerManager, componentProps);
                if (hasDifferent || fromKey.equals(TINT_COLORS) || fromKey.equals(TINT_COLOR)) {
                    updateProps.put(fromKey, toValue);
                }
            } else {
                updateProps.put(fromKey, null);
            }
        } else if (fromValue instanceof Map) {
            Map diffResult = null;
            if (toValue instanceof Map) {
                diffResult = diffMap((Map) fromValue, (Map) toValue,
                        diffLevel + 1, controllerManager, componentProps);
                if (diffResult.isEmpty()) {
                    return;
                }
            } else if (diffLevel == 0 && fromKey.equals(NodeProps.STYLE)) {
                diffResult = diffMap((Map) fromValue, new HashMap<String, Object>(),
                        diffLevel + 1, controllerManager, componentProps);
            }
            updateProps.put(fromKey, diffResult);
        }
    }

    @NonNull
    public static Map<String, Object> diffMap(@NonNull Map<String, Object> fromMap,
            @NonNull Map<String, Object> toMap) {
        return diffMap(fromMap, toMap, 0, null, null);
    }

    @NonNull
    public static Map<String, Object> diffMap(@NonNull Map<String, Object> fromMap,
            @NonNull Map<String, Object> toMap, int diffLevel,
            @Nullable ControllerManager controllerManager,
            @Nullable Map<String, Object> componentProps) {
        Map<String, Object> updateProps = new HashMap<>();
        Set<String> fromKeys = fromMap.keySet();
        for (String fromKey : fromKeys) {
            if (checkComponentProperty(fromKey, controllerManager)) {
                continue;
            }
            Object fromValue = fromMap.get(fromKey);
            Object toValue = toMap.get(fromKey);
            if (fromValue == null) {
                updateProps.put(fromKey, toValue);
            } else {
                diffProperty(fromKey, fromValue, toValue, updateProps, diffLevel, controllerManager,
                        componentProps);
            }
        }
        // Check to map whether there are properties that did not exist in from map.
        Set<String> toKeys = toMap.keySet();
        for (String toKey : toKeys) {
            boolean isComponentProperty = checkComponentProperty(toKey, controllerManager);
            Object toValue = toMap.get(toKey);
            if (isComponentProperty && componentProps != null) {
                componentProps.put(toKey, toValue);
            }
            if (fromMap.get(toKey) != null || isComponentProperty) {
                continue;
            }
            updateProps.put(toKey, toValue);
        }
        return updateProps;
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private static boolean diffArray(@NonNull ArrayList<Object> fromArray,
            @NonNull ArrayList<Object> toArray, int diffLevel,
            @Nullable ControllerManager controllerManager,
            @Nullable Map<String, Object> componentProps) {
        if (fromArray.size() != toArray.size()) {
            return true;
        }
        for (int i = 0; i < fromArray.size(); i++) {
            Object fromValue = fromArray.get(i);
            Object toValue = toArray.get(i);
            if (fromValue instanceof Boolean) {
                if (!(toValue instanceof Boolean) || ((boolean) fromValue != (boolean) toValue)) {
                    return true;
                }
            } else if (fromValue instanceof Number) {
                if (!(toValue instanceof Number)
                        || ((Number) fromValue).doubleValue() != ((Number) toValue).doubleValue()) {
                    return true;
                }
            } else if (fromValue instanceof String) {
                if (!(toValue instanceof String) || !TextUtils
                        .equals((String) fromValue, (String) toValue)) {
                    return true;
                }
            } else if (fromValue instanceof ArrayList && toValue instanceof ArrayList) {
                return diffArray((ArrayList) fromValue, (ArrayList) toValue,
                        diffLevel, controllerManager, componentProps);
            } else if (fromValue instanceof Map && toValue instanceof Map) {
                Map diffResult = diffMap((Map) fromValue,
                        (Map) toValue, diffLevel, controllerManager, componentProps);
                if (!diffResult.isEmpty()) {
                    return true;
                }
            }
        }
        return false;
    }
}
