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

import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class DiffUtils {

    private static final String TAG = "DiffUtils";
    private static final String TINT_COLORS = "tintColors";
    private static final String TINT_COLOR = "tintColor";

    /**
     * Find the attribute that exists in the from node but does not exist in the to node.
     *
     * <p>
     * When the list scrolls and the view is reused, the reused view must set the attributes
     * that do not exist in the corresponding new node to the default values
     * <p/>
     *
     * @param fromProps the props of from node
     * @param toProps the props of to node
     * @return the diff result {@link HashMap}
     */
    @Nullable
    public static Map<String, Object> findResetProps(@Nullable Map<String, Object> fromProps,
            @Nullable Map<String, Object> toProps) {
        if (fromProps == null) {
            return null;
        }
        Map<String, Object> diffProps = null;
        Set<String> fromKeys = fromProps.keySet();
        try {
            for (String fromKey : fromKeys) {
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

    /**
     * Compare the two nodes whether has same layout size.
     *
     * @param fromNode from node
     * @param toNode to node
     * @return {@code true} if it's equal, {@code false} otherwise
     */
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
            }
            updateProps.put(fromKey, diffResult);
        }
    }

    @NonNull
    public static Map<String, Object> diffMap(@NonNull Map<String, Object> fromMap,
            @NonNull Map<String, Object> toMap) {
        return diffMap(fromMap, toMap, 0, null, null);
    }

    /**
     * Compare different attributes between from node and to node.
     *
     * @param fromMap the props of from node
     * @param toMap the props of to node
     * @param diffLevel nesting depth compared
     * @param controllerManager {@link ControllerManager}
     * @param componentProps used to record attributes belonging to component
     * @return the diff result {@link HashMap}
     */
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
