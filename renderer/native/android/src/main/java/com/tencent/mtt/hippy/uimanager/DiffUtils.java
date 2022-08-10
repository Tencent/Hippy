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

import static com.tencent.mtt.hippy.uimanager.RenderNode.FLAG_ALREADY_UPDATED;

import android.text.TextUtils;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.renderer.component.Component;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class DiffUtils {

    private static final String TINT_COLORS = "tintColors";
    private static final String TINT_COLOR = "tintColor";

    private enum PatchType {
        TYPE_DELETE_VIEW,
        TYPE_UPDATE_PROPS,
        TYPE_UPDATE_LAYOUT,
        TYPE_UPDATE_EXTRA,
        TYPE_REPLACE_ID,
        TYPE_CREATE_VIEW
    }

    public static void doDiffAndPatch(@NonNull ControllerManager controllerManager,
            @NonNull RenderNode fromNode, @NonNull RenderNode toNode) {
        if (fromNode.getId() == toNode.getId()) {
            return;
        }
        Map<PatchType, ArrayList<Patch>> patches = new HashMap<>();
        diffFromNode(fromNode, toNode, patches, controllerManager);
        diffToNode(fromNode, toNode, patches);
        handleDeleteViewPatches(controllerManager, patches);
        handleReplaceIdPatches(controllerManager, patches);
        handleCreateViewPatches(patches);
        handleUpdatePropsPatches(controllerManager, patches);
        handleUpdateLayoutPatches(controllerManager, patches);
    }

    private static void addPatch(PatchType type, @NonNull Patch patch,
            @NonNull Map<PatchType, ArrayList<Patch>> patches) {
        ArrayList<Patch> patchArray = patches.get(type);
        if (patchArray == null) {
            patchArray = new ArrayList<>();
            patches.put(type, patchArray);
        }
        patchArray.add(patch);
    }

    private static boolean checkComponentProperty(@NonNull String key,
            @Nullable ControllerManager controllerManager) {
        if (controllerManager != null) {
            return controllerManager.checkComponentProperty(key);
        }
        return false;
    }

    private static void diffToNode(@NonNull RenderNode fromNode, @NonNull RenderNode toNode,
            @NonNull Map<PatchType, ArrayList<Patch>> patches) {
        for (int i = 0; i < toNode.getChildCount(); i++) {
            if (i >= fromNode.getChildCount()) {
                RenderNode toChild = toNode.getChildAt(i);
                addPatch(PatchType.TYPE_CREATE_VIEW, new Patch(toChild), patches);
                addPatch(PatchType.TYPE_UPDATE_LAYOUT, new Patch(toChild), patches);
            } else {
                diffToNode(fromNode.getChildAt(i), toNode.getChildAt(i), patches);
            }
        }
    }

    private static void diffFromNode(@NonNull RenderNode fromNode, @NonNull RenderNode toNode,
            @NonNull Map<PatchType, ArrayList<Patch>> patches,
            @Nullable ControllerManager controllerManager) {
        if (TextUtils.equals(fromNode.getClassName(), toNode.getClassName())) {
            addPatch(PatchType.TYPE_REPLACE_ID, new Patch(toNode, fromNode.getId()), patches);
            Map<String, Object> componentProps = new HashMap<>();
            Map<String, Object> updateProps = diffMapProps(fromNode.getProps(),
                    toNode.getProps(), 0, controllerManager, componentProps);
            if (toNode.getComponent() == null || !toNode.checkNodeFlag(FLAG_ALREADY_UPDATED)) {
                updateProps.putAll(componentProps);
            }
            if (!updateProps.isEmpty()) {
                addPatch(PatchType.TYPE_UPDATE_PROPS, new Patch(toNode, updateProps), patches);
            }
            if (diffLayout(fromNode, toNode)) {
                addPatch(PatchType.TYPE_UPDATE_LAYOUT, new Patch(toNode), patches);
            }
        }

        for (int i = 0; i < fromNode.getChildCount(); i++) {
            RenderNode fromChild = fromNode.getChildAt(i);
            RenderNode toChild = toNode.getChildAt(i);
            if (toChild == null) {
                addPatch(PatchType.TYPE_DELETE_VIEW, new Patch(fromChild), patches);
                continue;
            }
            if (TextUtils.equals(fromChild.getClassName(), toChild.getClassName())) {
                diffFromNode(fromChild, toChild, patches, controllerManager);
            } else {
                addPatch(PatchType.TYPE_CREATE_VIEW, new Patch(toChild), patches);
                addPatch(PatchType.TYPE_UPDATE_LAYOUT, new Patch(toChild), patches);
                addPatch(PatchType.TYPE_DELETE_VIEW, new Patch(fromChild), patches);
            }
        }
    }

    private static boolean diffLayout(@NonNull RenderNode fromNode,
            @NonNull RenderNode toNode) {
        return fromNode.getX() != toNode.getX() || fromNode.getY() != toNode.getY()
                || fromNode.getWidth() != toNode.getWidth()
                || fromNode.getHeight() != toNode.getHeight();
    }

    @SuppressWarnings("rawtypes")
    private static void diffProps(@NonNull String fromKey, @Nullable Object fromValue,
            @Nullable Object toValue, @NonNull Map<String, Object> updateProps, int diffLevel,
            @Nullable ControllerManager controllerManager,
            @NonNull Map<String, Object> componentProps) {
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
                boolean hasDifferent = diffArrayProps((ArrayList) fromValue,
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
                diffResult = diffMapProps((Map) fromValue, (Map) toValue,
                        diffLevel + 1, controllerManager, componentProps);
                if (diffResult.isEmpty()) {
                    return;
                }
            } else if (diffLevel == 0 && fromKey.equals(NodeProps.STYLE)) {
                diffResult = diffMapProps((Map) fromValue, new HashMap<String, Object>(),
                        diffLevel + 1, controllerManager, componentProps);
            }
            updateProps.put(fromKey, diffResult);
        }
    }

    @NonNull
    public static Map<String, Object> diffMapProps(@NonNull Map<String, Object> fromMap,
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
                diffProps(fromKey, fromValue, toValue, updateProps, diffLevel, controllerManager,
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

    @SuppressWarnings("rawtypes")
    private static boolean diffArrayProps(@NonNull ArrayList<Object> fromArray,
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
                return diffArrayProps((ArrayList) fromValue, (ArrayList) toValue,
                        diffLevel, controllerManager, componentProps);
            } else if (fromValue instanceof Map && toValue instanceof Map) {
                Map diffResult = diffMapProps((Map) fromValue,
                        (Map) toValue, diffLevel, controllerManager, componentProps);
                if (!diffResult.isEmpty()) {
                    return true;
                }
            }
        }
        return false;
    }

    private static class Patch {

        public int oldId;
        @NonNull
        public final RenderNode node;
        @Nullable
        public Map<String, Object> updateProps;

        public Patch(@NonNull RenderNode node) {
            this.node = node;
        }

        public Patch(@NonNull RenderNode node, @Nullable Map<String, Object> updateProps) {
            this.node = node;
            this.updateProps = updateProps;
        }

        public Patch(@NonNull RenderNode node, int oldId) {
            this.node = node;
            this.oldId = oldId;
        }
    }

    private static void handleDeleteViewPatches(@NonNull ControllerManager controllerManager,
            @NonNull Map<PatchType, ArrayList<Patch>> patches) {
        ArrayList<Patch> patchArray = patches.get(PatchType.TYPE_DELETE_VIEW);
        if (patchArray == null) {
            return;
        }
        for (Patch patch : patchArray) {
            if (patch.node.getParent() == null) {
                continue;
            }
            int pid = patch.node.getParent().getId();
            controllerManager.deleteChild(patch.node.getRootId(), pid, patch.node.getId());
        }
    }

    private static void handleReplaceIdPatches(@NonNull ControllerManager controllerManager,
            @NonNull Map<PatchType, ArrayList<Patch>> patches) {
        ArrayList<Patch> patchArray = patches.get(PatchType.TYPE_REPLACE_ID);
        if (patchArray == null) {
            return;
        }
        for (Patch patch : patchArray) {
            controllerManager.replaceId(patch.node.getRootId(), patch.oldId, patch.node.getId());
        }
    }

    private static void handleCreateViewPatches(
            @NonNull Map<PatchType, ArrayList<Patch>> patches) {
        ArrayList<Patch> patchArray = patches.get(PatchType.TYPE_CREATE_VIEW);
        if (patchArray == null) {
            return;
        }
        for (Patch patch : patchArray) {
            patch.node.createViewRecursive();
            if (patch.node.getParent() != null) {
                patch.node.getParent().updateView();
            }
            patch.node.updateViewRecursive();
        }
    }

    private static void handleUpdatePropsPatches(@NonNull ControllerManager controllerManager,
            @NonNull Map<PatchType, ArrayList<Patch>> patches) {
        ArrayList<Patch> patchArray = patches.get(PatchType.TYPE_UPDATE_PROPS);
        if (patchArray == null) {
            return;
        }
        for (Patch patch : patchArray) {
            if (patch.updateProps == null) {
                continue;
            }
            controllerManager
                    .updateView(patch.node, patch.updateProps, patch.node.getEvents());
        }
    }

    private static void handleUpdateLayoutPatches(@NonNull ControllerManager controllerManager,
            @NonNull Map<PatchType, ArrayList<Patch>> patches) {
        ArrayList<Patch> patchArray = patches.get(PatchType.TYPE_UPDATE_LAYOUT);
        if (patchArray == null) {
            return;
        }
        for (Patch patch : patchArray) {
            controllerManager
                    .updateLayout(patch.node.getClassName(),
                            patch.node.getRootId(),
                            patch.node.getId(),
                            patch.node.getX(),
                            patch.node.getY(),
                            patch.node.getWidth(),
                            patch.node.getHeight());
        }
    }
}
