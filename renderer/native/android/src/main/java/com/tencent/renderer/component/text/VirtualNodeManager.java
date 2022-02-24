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
import com.tencent.mtt.hippy.dom.flex.FlexMeasureMode;
import com.tencent.mtt.hippy.dom.flex.FlexOutput;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Set;

public class VirtualNodeManager {

    private static final String TAG = "VirtualNodeManager";
    private static final Map<Class<?>, Map<String, PropertyMethod>> sClassPropertyMethod = new HashMap<>();
    private final String PADDING_LEFT = "paddingLeft";
    private final String PADDING_TOP = "paddingTop";
    private final String PADDING_RIGHT = "paddingRight";
    private final String PADDING_BOTTOM = "paddingBottom";
    private final SparseArray<VirtualNode> mVirtualNodes = new SparseArray<>();
    @NonNull
    private final NativeRender mNativeRender;

    public VirtualNodeManager(@NonNull NativeRender nativeRenderer) {
        mNativeRender = nativeRenderer;
    }

    /**
     * @return {@code true} if the node has a virtual parent
     */
    public boolean hasVirtualParent(int id) {
        VirtualNode node = mVirtualNodes.get(id);
        return (node != null && node.mParent != null);
    }

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
        return FlexOutput.make(layout.getWidth(), layout.getHeight());
    }

    @SuppressWarnings("rawtypes")
    private void findPropertyMethod(Class nodeClass,
            @NonNull Map<String, PropertyMethod> methodMap) {
        if (nodeClass != VirtualNode.class) {
            findPropertyMethod(nodeClass.getSuperclass(), methodMap);
        }

        Method[] methods = nodeClass.getDeclaredMethods();
        for (Method method : methods) {
            HippyControllerProps controllerProps = method.getAnnotation(HippyControllerProps.class);
            if (controllerProps != null) {
                String style = controllerProps.name();
                PropertyMethod propsMethodHolder = new PropertyMethod();
                propsMethodHolder.defaultNumber = controllerProps.defaultNumber();
                propsMethodHolder.defaultType = controllerProps.defaultType();
                propsMethodHolder.defaultString = controllerProps.defaultString();
                propsMethodHolder.defaultBoolean = controllerProps.defaultBoolean();
                propsMethodHolder.method = method;
                propsMethodHolder.paramTypes = method.getGenericParameterTypes();
                methodMap.put(style, propsMethodHolder);
            }
        }
        sClassPropertyMethod.put(nodeClass, new HashMap<>(methodMap));
    }

    @SuppressWarnings("rawtypes")
    private void invokePropertyMethod(@NonNull VirtualNode node, @NonNull Map props,
            @NonNull String key, @Nullable PropertyMethod methodHolder) {
        if (methodHolder == null) {
            if (key.equals(NodeProps.STYLE) && (props.get(key) instanceof Map)) {
                updateProps(node, (Map) props.get(key));
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
                        methodHolder.method.invoke(node,
                                ArgumentUtils.parseArgument(methodHolder.paramTypes[0],
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
                        ArgumentUtils.parseArgument(methodHolder.paramTypes[0], props.get(key)));
            }
        } catch (Exception exception) {
            mNativeRender.handleRenderException(exception);
        }
    }

    @SuppressWarnings("rawtypes")
    private void updateProps(@NonNull VirtualNode node, @Nullable Map props) {
        if (props == null) {
            return;
        }
        Class nodeClass = node.getClass();
        Map<String, PropertyMethod> methodMap = sClassPropertyMethod.get(nodeClass);
        if (methodMap == null) {
            methodMap = new HashMap<>();
            findPropertyMethod(nodeClass, methodMap);
        }
        Set<String> keySet = props.keySet();
        for (String key : keySet) {
            PropertyMethod methodHolder = methodMap.get(key);
            invokePropertyMethod(node, props, key, methodHolder);
        }
    }

    public void createNode(int id, int pid, int index, @NonNull String className,
            @Nullable Map<String, Object> props) {
        VirtualNode node;
        VirtualNode parent = mVirtualNodes.get(pid);
        if (className.equals(TEXT_CLASS_NAME)) {
            node = new TextVirtualNode(id, pid, index, mNativeRender.getFontAdapter());
        } else if (className.equals(IMAGE_CLASS_NAME) && parent != null) {
            node = new ImageVirtualNode(id, pid, index, mNativeRender);
        } else {
            // Only text or text child need to create virtual node.
            return;
        }
        mVirtualNodes.put(id, node);
        if (parent != null) {
            parent.addChildAt(node, index);
        }
        updateProps(node, props);
    }

    public void updateNode(int id, @Nullable Map<String, Object> props) {
        VirtualNode node = mVirtualNodes.get(id);
        if (node != null) {
            updateProps(node, props);
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

    private static class PropertyMethod {

        public Method method;
        public String defaultType;
        public String defaultString;
        public double defaultNumber;
        public boolean defaultBoolean;
        public Type[] paramTypes;
    }
}
