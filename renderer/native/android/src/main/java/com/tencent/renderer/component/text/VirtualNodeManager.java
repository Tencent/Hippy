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

package com.tencent.renderer.component.text;

import static com.tencent.mtt.hippy.dom.node.NodeProps.IMAGE_CLASS_NAME;
import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_CLASS_NAME;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_MEASURE_STATE_ERR;

import android.text.Layout;
import android.util.SparseArray;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.utils.FlexUtils;
import com.tencent.renderer.utils.FlexUtils.FlexMeasureMode;
import com.tencent.renderer.utils.PropertyUtils;
import com.tencent.renderer.utils.PropertyUtils.PropertyMethodHolder;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Set;

public class VirtualNodeManager {

    private static final String TAG = "VirtualNodeManager";
    private static final Map<Class<?>, Map<String, PropertyMethodHolder>> sClassPropertyMethod = new HashMap<>();
    private static final String PADDING_LEFT = "paddingLeft";
    private static final String PADDING_TOP = "paddingTop";
    private static final String PADDING_RIGHT = "paddingRight";
    private static final String PADDING_BOTTOM = "paddingBottom";
    private final SparseArray<VirtualNode> mVirtualNodes = new SparseArray<>();
    /**
     * Reserved the node id whose node attribute has been updated.
     */
    @Nullable
    private List<Integer> mUpdateNodes;
    @NonNull
    private final NativeRender mNativeRenderer;

    public VirtualNodeManager(@NonNull NativeRender nativeRenderer) {
        mNativeRenderer = nativeRenderer;
    }

    /**
     * Check whether the specified node has a virtual parent.
     *
     * @return {@code true} if the node has a virtual parent
     */
    public boolean hasVirtualParent(int id) {
        VirtualNode node = mVirtualNodes.get(id);
        return (node != null && node.mParent != null);
    }

    /**
     * Update event listening status of specified node.
     *
     * @param id target node id
     * @param props event listener props of node
     * @return {@code true} the node event listening status have been changed
     *         {@code false} the node event listening status no change
     */
    public boolean updateEventListener(int id, @NonNull Map<String, Object> props) {
        VirtualNode node = mVirtualNodes.get(id);
        if (node == null) {
            return false;
        }
        boolean isChanged = false;
        for (Entry<String, Object> entry : props.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (!(value instanceof Boolean)) {
                continue;
            }
            if ((Boolean) value) {
                node.addGesture(key);
            } else {
                node.removeGesture(key);
            }
            isChanged = true;
        }
        if (isChanged) {
            node.markDirty();
        }
        return true;
    }

    /**
     * Update layout of specified node.
     *
     * @param id target node id
     * @param width the width of layout
     * @param layoutInfo the layout params of node
     * @return {@link TextRenderSupply}
     */
    @Nullable
    public TextRenderSupply updateLayout(int id, float width, Map<String, Object> layoutInfo) {
        VirtualNode node = mVirtualNodes.get(id);
        if (!(node instanceof TextVirtualNode) || node.mParent != null) {
            return null;
        }
        float leftPadding = 0;
        float topPadding = 0;
        float rightPadding = 0;
        float bottomPadding = 0;
        try {
            leftPadding = ((Number) Objects.requireNonNull(layoutInfo.get(PADDING_LEFT)))
                    .floatValue();
            topPadding = ((Number) Objects.requireNonNull(layoutInfo.get(PADDING_TOP)))
                    .floatValue();
            rightPadding = ((Number) Objects.requireNonNull(layoutInfo.get(PADDING_RIGHT)))
                    .floatValue();
            bottomPadding = ((Number) Objects.requireNonNull(layoutInfo.get(PADDING_BOTTOM)))
                    .floatValue();
        } catch (NullPointerException ignored) {
            // Padding is not necessary for layout, if get padding property failed,
            // just ignore this exception
        }
        Layout layout = ((TextVirtualNode) node)
                .createLayout((width - leftPadding - rightPadding), FlexMeasureMode.EXACTLY);
        if (mUpdateNodes != null) {
            mUpdateNodes.remove(Integer.valueOf(id));
        }
        return new TextRenderSupply(layout, leftPadding, topPadding,
                rightPadding, bottomPadding);
    }

    public long measure(int id, float width, FlexMeasureMode widthMode)
            throws NativeRenderException {
        VirtualNode node = mVirtualNodes.get(id);
        if (!(node instanceof TextVirtualNode) || node.mParent != null) {
            throw new NativeRenderException(INVALID_MEASURE_STATE_ERR,
                    TAG + ": measure: encounter wrong state when check node, "
                            + "only text node and parent==null need do measure");
        }
        TextVirtualNode textNode = (TextVirtualNode) node;
        Layout layout = textNode.createLayout(width, widthMode);
        return FlexUtils.makeSizeToLong(layout.getWidth(), layout.getHeight());
    }

    @SuppressWarnings("rawtypes")
    private void findPropertyMethod(Class nodeClass,
            @NonNull Map<String, PropertyMethodHolder> methodMap) {
        if (nodeClass != VirtualNode.class) {
            findPropertyMethod(nodeClass.getSuperclass(), methodMap);
        }
        Method[] methods = nodeClass.getDeclaredMethods();
        for (Method method : methods) {
            HippyControllerProps controllerProps = method.getAnnotation(HippyControllerProps.class);
            if (controllerProps != null) {
                PropertyMethodHolder propsMethodHolder = new PropertyMethodHolder();
                propsMethodHolder.defaultNumber = controllerProps.defaultNumber();
                propsMethodHolder.defaultType = controllerProps.defaultType();
                propsMethodHolder.defaultString = controllerProps.defaultString();
                propsMethodHolder.defaultBoolean = controllerProps.defaultBoolean();
                propsMethodHolder.method = method;
                propsMethodHolder.paramTypes = method.getGenericParameterTypes();
                methodMap.put(controllerProps.name(), propsMethodHolder);
            }
        }
        sClassPropertyMethod.put(nodeClass, new HashMap<>(methodMap));
    }

    @SuppressWarnings("rawtypes")
    private void invokePropertyMethod(@NonNull VirtualNode node, @NonNull Map props,
            @NonNull String key, @Nullable PropertyMethodHolder methodHolder) {
        if (methodHolder == null) {
            if (key.equals(NodeProps.STYLE) && (props.get(key) instanceof Map)) {
                updateProps(node, (Map) props.get(key), false);
            } else if (node instanceof TextVirtualNode) {
                // Some unused attributes are reserved and may be used by render node.
                ((TextVirtualNode) node).addUnusedProps(key, props.get(key));
            }
            return;
        }
        try {
            if (props.get(key) == null) {
                switch (methodHolder.defaultType) {
                    case HippyControllerProps.BOOLEAN:
                        methodHolder.method.invoke(node, methodHolder.defaultBoolean);
                        break;
                    case HippyControllerProps.NUMBER:
                        if (methodHolder.paramTypes == null) {
                            methodHolder.paramTypes = methodHolder.method
                                    .getGenericParameterTypes();
                        }
                        methodHolder.method.invoke(node, PropertyUtils
                                .convertNumber(methodHolder.paramTypes[0],
                                        methodHolder.defaultNumber));
                        break;
                    case HippyControllerProps.STRING:
                        methodHolder.method.invoke(node, methodHolder.defaultString);
                        break;
                    default:
                        Object o = null;
                        //noinspection ConstantConditions
                        methodHolder.method.invoke(node, o);
                        break;
                }
            } else {
                methodHolder.method.invoke(node,
                        PropertyUtils.convertProperty(methodHolder.paramTypes[0], props.get(key)));
            }
        } catch (Exception exception) {
            mNativeRenderer.handleRenderException(
                    PropertyUtils
                            .makePropertyConvertException(exception, key, methodHolder.method));
        }
    }

    @SuppressWarnings("rawtypes")
    private void updateProps(@NonNull VirtualNode node, @Nullable Map<String, Object> props,
            Boolean needToReset) {
        if (props == null) {
            return;
        }
        Class nodeClass = node.getClass();
        Map<String, PropertyMethodHolder> methodMap = sClassPropertyMethod.get(nodeClass);
        if (methodMap == null) {
            methodMap = new HashMap<>();
            findPropertyMethod(nodeClass, methodMap);
        }
        Set<String> keySet = props.keySet();
        for (String key : keySet) {
            PropertyMethodHolder methodHolder = methodMap.get(key);
            invokePropertyMethod(node, props, key, methodHolder);
        }
        if (needToReset && node instanceof TextVirtualNode) {
            ((TextVirtualNode) node).resetProps(props);
        }
    }

    @Nullable
    private VirtualNode createVirtualNode(int id, int pid, int index, @NonNull String className,
            @Nullable Map<String, Object> props) {
        VirtualNode node = mNativeRenderer.createVirtualNode(id, pid, index, className, props);
        VirtualNode parent = mVirtualNodes.get(pid);
        // Only text or text child need to create virtual node.
        if (className.equals(TEXT_CLASS_NAME)) {
            if (!(node instanceof TextVirtualNode)) {
                node = new TextVirtualNode(id, pid, index, mNativeRenderer);
            }
        } else if (className.equals(IMAGE_CLASS_NAME) && parent != null) {
            if (!(node instanceof ImageVirtualNode)) {
                node = new ImageVirtualNode(id, pid, index, mNativeRenderer);
            }
        }
        return node;
    }

    public void createNode(int id, int pid, int index, @NonNull String className,
            @Nullable Map<String, Object> props) {
        VirtualNode node = createVirtualNode(id, pid, index, className, props);
        if (node == null) {
            return;
        }
        VirtualNode parent = mVirtualNodes.get(pid);
        mVirtualNodes.put(id, node);
        if (parent != null) {
            parent.addChildAt(node, index);
        }
        updateProps(node, props, true);
    }

    public void updateNode(int id, @Nullable Map<String, Object> props) {
        VirtualNode node = mVirtualNodes.get(id);
        if (node != null) {
            updateProps(node, props, true);
            if (node.mParent == null) {
                if (mUpdateNodes == null) {
                    mUpdateNodes = new ArrayList<>();
                }
                mUpdateNodes.add(id);
            }
        }
    }

    public void deleteNode(int id) {
        VirtualNode node = mVirtualNodes.get(id);
        if (node == null) {
            return;
        }
        if (node.mParent != null) {
            node.mParent.removeChild(node);
            node.mParent = null;
        }
        if (node.mChildren != null) {
            for (VirtualNode child : node.mChildren) {
                deleteNode(child.mId);
            }
            node.mChildren.clear();
        }
        mVirtualNodes.delete(id);
    }

    @Nullable
    public Map<Integer, Layout> endBatch() {
        if (mUpdateNodes == null || mUpdateNodes.isEmpty()) {
            return null;
        }
        Map<Integer, Layout> layoutToUpdate = null;
        for (Integer id : mUpdateNodes) {
            VirtualNode node = mVirtualNodes.get(id);
            if (node != null && node instanceof TextVirtualNode) {
                // If the node has been updated, but there is no updateLayout call from native(C++)
                // render manager, we should renew the layout on end batch and update to render node.
                Layout layout = ((TextVirtualNode) node).createLayout();
                if (layoutToUpdate == null) {
                    layoutToUpdate = new HashMap<>();
                }
                layoutToUpdate.put(id, layout);
            }
        }
        mUpdateNodes.clear();
        return layoutToUpdate;
    }
}
