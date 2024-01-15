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

package com.tencent.renderer.node;

import static com.tencent.mtt.hippy.dom.node.NodeProps.IMAGE_CLASS_NAME;
import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_BOTTOM;
import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_LEFT;
import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_RIGHT;
import static com.tencent.mtt.hippy.dom.node.NodeProps.PADDING_TOP;
import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_CLASS_NAME;
import static com.tencent.mtt.hippy.dom.node.NodeProps.TEXT_INPUT_CLASS_NAME;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_MEASURE_STATE_ERR;
import static com.tencent.renderer.NativeRenderer.NODE_ID;
import static com.tencent.renderer.NativeRenderer.NODE_INDEX;

import android.text.Layout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.component.text.TextRenderSupplier;
import com.tencent.renderer.utils.FlexUtils;
import com.tencent.renderer.utils.FlexUtils.FlexMeasureMode;
import com.tencent.renderer.utils.PropertyUtils;
import com.tencent.renderer.utils.PropertyUtils.PropertyMethodHolder;

import java.lang.ref.WeakReference;
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
    /**
     * Reserved the node id whose node attribute has been updated.
     */
    private final Map<Integer, List<VirtualNode>> mUpdateNodes = new HashMap<>();
    @NonNull
    private final WeakReference<NativeRender> mNativeRendererRef;

    public VirtualNodeManager(@NonNull NativeRender nativeRenderer) {
        mNativeRendererRef = new WeakReference<>(nativeRenderer);
    }

    /**
     * Check whether the specified node has a virtual parent.
     *
     * @return {@code true} if the node has a virtual parent
     */
    public boolean hasVirtualParent(int rootId, int nodeId) {
        VirtualNode node = getVirtualNode(rootId, nodeId);
        return (node != null && node.mParent != null);
    }

    @Nullable
    public VirtualNode checkVirtualParent(int rootId, int nodeId) {
        VirtualNode node = getVirtualNode(rootId, nodeId);
        VirtualNode parent = null;
        if (node != null) {
            while (node.mParent != null) {
                parent = node.mParent;
                node = node.mParent;
            }
        }
        return parent;
    }

    /**
     * Update event listening status of specified node.
     *
     * @param rootId root node id
     * @param nodeId target node id
     * @param props event listener props of node
     * @return {@code true} the node event listening status have been changed {@code false} the node
     * event listening status no change
     */
    public boolean updateEventListener(int rootId, int nodeId, @NonNull Map<String, Object> props) {
        VirtualNode node = getVirtualNode(rootId, nodeId);
        if (node == null || node instanceof TextInputVirtualNode) {
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
                node.addEventType(key);
            } else {
                node.removeEventType(key);
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
     * @param rootId the root node id
     * @param nodeId the target node id
     * @param width the width of layout
     * @param layoutInfo the layout params of node
     * @return {@link TextRenderSupplier}
     */
    @Nullable
    public TextRenderSupplier updateLayout(int rootId, int nodeId, float width,
            Map<String, Object> layoutInfo) {
        VirtualNode node = getVirtualNode(rootId, nodeId);
        if (!(node instanceof TextVirtualNode || node instanceof TextInputVirtualNode) || node.mParent != null) {
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
        } catch (NullPointerException e) {
            // Padding is not necessary for layout, if get padding property failed,
            // just ignore this exception
            LogUtils.w(TAG, "VirtualNode updateLayout get padding exception: " + e.getMessage());
        }
        final Layout layout;
        if (node instanceof TextVirtualNode) {
            layout = ((TextVirtualNode) node)
                    .createLayout((width - leftPadding - rightPadding), FlexMeasureMode.EXACTLY);
            // Layout has update here, not need to rebuild in end batch, so remove node ref from mUpdateNodes.
            List<VirtualNode> updateNodes = mUpdateNodes.get(rootId);
            if (updateNodes != null) {
                updateNodes.remove(node);
            }
        } else {
            layout = null;
        }
        return new TextRenderSupplier(layout, leftPadding, topPadding,
                rightPadding, bottomPadding);
    }

    public long measure(int rootId, int nodeId, float width, FlexMeasureMode widthMode,
            float height, FlexMeasureMode heightMode)
            throws NativeRenderException {
        VirtualNode node = getVirtualNode(rootId, nodeId);
        if (node instanceof TextInputVirtualNode) {
            return ((TextInputVirtualNode) node).measure(width, widthMode, height, heightMode);
        }
        if (!(node instanceof TextVirtualNode) || node.mParent != null) {
            throw new NativeRenderException(INVALID_MEASURE_STATE_ERR,
                    TAG + ": measure: encounter wrong state when check node, "
                            + "only text node and parent==null need do measure");
        }
        TextVirtualNode textNode = (TextVirtualNode) node;
        Layout layout = textNode.createLayout(width, widthMode);
        return FlexUtils.makeSizeToLong(layout.getWidth(), layout.getHeight());
    }

    public VirtualNode getVirtualNode(int rootId, int nodeId) {
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootNode != null) {
            return rootNode.getVirtualNode(nodeId);
        }
        return null;
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
            @NonNull String key, @NonNull PropertyMethodHolder methodHolder) {
        try {
            Object value = props.get(key);
            if (value == null) {
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
                        PropertyUtils.convertProperty(methodHolder.paramTypes[0], value));
            }
        } catch (Exception exception) {
            if (mNativeRendererRef.get() != null) {
                mNativeRendererRef.get().handleRenderException(
                        PropertyUtils
                                .makePropertyConvertException(exception, key, methodHolder.method));
            }
        }
    }

    @SuppressWarnings("rawtypes")
    private void updateProps(@NonNull VirtualNode node, @Nullable Map<String, Object> props) {
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
            if (methodHolder != null) {
                invokePropertyMethod(node, props, key, methodHolder);
            }
        }
    }

    @Nullable
    private VirtualNode createVirtualNode(int rootId, int id, int pid, int index,
            @NonNull String className, @Nullable Map<String, Object> props) {
        NativeRender nativeRender = mNativeRendererRef.get();
        if (nativeRender == null) {
            return null;
        }
        VirtualNode node = nativeRender.createVirtualNode(rootId, id, pid, index, className,
                props);
        VirtualNode parent = getVirtualNode(rootId, pid);
        // Only text、text child and text input need to create virtual node.
        if (className.equals(TEXT_CLASS_NAME)) {
            if (!(node instanceof TextVirtualNode)) {
                node = new TextVirtualNode(rootId, id, pid, index, nativeRender);
            }
        } else if (className.equals(IMAGE_CLASS_NAME) && parent != null) {
            if (!(node instanceof ImageVirtualNode)) {
                node = new ImageVirtualNode(rootId, id, pid, index, nativeRender);
            }
        } else if (className.equals(TEXT_INPUT_CLASS_NAME)) {
            if (!(node instanceof TextInputVirtualNode)) {
                node = new TextInputVirtualNode(rootId, id, pid, index);
            }
        }
        return node;
    }

    public void createNode(int rootId, int id, int pid, int index, @NonNull String className,
            @Nullable Map<String, Object> props) {
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootNode == null) {
            return;
        }
        VirtualNode node = createVirtualNode(rootId, id, pid, index, className, props);
        if (node == null) {
            return;
        }
        VirtualNode parent = rootNode.getVirtualNode(pid);
        rootNode.addVirtualNode(node);
        if (parent != null) {
            parent.addChildAt(node, index);
        }
        updateProps(node, props);
    }

    public void updateNode(int rootId, int id, @Nullable Map<String, Object> diffProps,
            @Nullable List<Object> delProps) {
        VirtualNode node = getVirtualNode(rootId, id);
        if (node == null) {
            return;
        }
        Map<String, Object> propsToUpdate = null;
        if (diffProps != null) {
            propsToUpdate = diffProps;
        }
        if (delProps != null) {
            if (propsToUpdate == null) {
                propsToUpdate = new HashMap<>();
            }
            for (Object key : delProps) {
                propsToUpdate.put(key.toString(), null);
            }
        }
        updateProps(node, propsToUpdate);
        // The text input node is only used for measurement purposes and does not
        // require any layout updates
        if (node instanceof TextInputVirtualNode) {
            return;
        }
        // add the top VirtualNode to mUpdateNodes
        while (node.mParent != null) {
            node = node.mParent;
        }
        List<VirtualNode> updateNodes = mUpdateNodes.get(rootId);
        if (updateNodes == null) {
            updateNodes = new ArrayList<>();
            updateNodes.add(node);
            mUpdateNodes.put(rootId, updateNodes);
        } else if (!updateNodes.contains(node)) {
            updateNodes.add(node);
        }
    }

    private void deleteNode(@NonNull RootRenderNode rootNode, int nodeId) {
        VirtualNode node = rootNode.getVirtualNode(nodeId);
        if (node == null) {
            return;
        }
        if (node.mParent != null) {
            node.mParent.removeChild(node);
            node.mParent = null;
        }
        if (node.mChildren != null) {
            for (int i = node.getChildCount() - 1; i >= 0; --i) {
                VirtualNode child = node.getChildAt(i);
                if (child != null) {
                    deleteNode(rootNode, child.mId);
                }
            }
            node.mChildren.clear();
        }
        rootNode.removeVirtualNode(nodeId);
    }

    public void deleteNode(int rootId, int nodeId) {
        RootRenderNode rootNode = NativeRendererManager.getRootNode(rootId);
        if (rootNode != null) {
            deleteNode(rootNode, nodeId);
        }
    }

    public void moveNode(int rootId, @NonNull VirtualNode parent, @NonNull List<Object> list) {
        for (int i = 0; i < list.size(); i++) {
            try {
                final Map node = (Map) list.get(i);
                int nodeId = ((Number) Objects.requireNonNull(node.get(NODE_ID))).intValue();
                int index = ((Number) Objects.requireNonNull(node.get(NODE_INDEX))).intValue();
                VirtualNode child = getVirtualNode(rootId, nodeId);
                if (child != null) {
                    parent.resetChildIndex(child, index);
                    child.markDirty();
                }
            } catch (NullPointerException e) {
                LogUtils.w(TAG, "moveNode: " + e.getMessage());
            }
        }
        List<VirtualNode> updateNodes = mUpdateNodes.get(rootId);
        if (updateNodes == null) {
            updateNodes = new ArrayList<>();
            updateNodes.add(parent);
            mUpdateNodes.put(rootId, updateNodes);
        } else if (!updateNodes.contains(parent)) {
            updateNodes.add(parent);
        }
    }

    /**
     * On end batch, check the node has been updated and renew layout of text node if needed.
     *
     * @return the layout map need update to render node
     */
    @Nullable
    public Map<Integer, Layout> endBatch(int rootId) {
        List<VirtualNode> updateNodes = mUpdateNodes.get(rootId);
        if (updateNodes == null || updateNodes.isEmpty()) {
            return null;
        }
        Map<Integer, Layout> layoutToUpdate = null;
        for (VirtualNode node : updateNodes) {
            if (node instanceof TextVirtualNode) {
                // If the node has been updated, but there is no updateLayout call from native(C++)
                // render manager, we should renew the layout on end batch and update to render node.
                Layout layout = ((TextVirtualNode) node).createLayout();
                if (layoutToUpdate == null) {
                    layoutToUpdate = new HashMap<>();
                }
                layoutToUpdate.put(node.getId(), layout);
            }
        }
        updateNodes.clear();
        return layoutToUpdate;
    }

    public boolean checkRegisteredEvent(int rootId, int nodeId, String eventName) {
        VirtualNode node = getVirtualNode(rootId, nodeId);
        return node != null && node.hasEventType(eventName);
    }
}
