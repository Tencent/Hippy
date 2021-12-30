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
import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_VIRTUAL_NODE_TYPE_ERR;

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
;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

public class VirtualNodeManager {

    private static final String TAG = "VirtualNodeManager";
    private final String PADDING_LEFT = "paddingLeft";
    private final String PADDING_TOP = "paddingTop";
    private final String PADDING_RIGHT = "paddingRight";
    private final String PADDING_BOTTOM = "paddingBottom";
    private static final Map<Class, Map<String, PropertyMethod>> sClassPropertyMethod = new HashMap<>();
    private final SparseArray<VirtualNode> mVirtualNodes = new SparseArray<>();
    private @NonNull final NativeRender mNativeRender;

    public VirtualNodeManager(@NonNull NativeRender nativeRenderer) {
        mNativeRender = nativeRenderer;
    }

    /**
     * Returns the visibility of node, if a virtual node has parent,
     * it's invisible for render manager, therefore should not create and update render node.
     *
     * @param id node id
     * @return {@code true} if this node is invisible
     *         {@code false} otherwise.
     */
    public boolean isInvisibleNode(int id) {
        VirtualNode node = mVirtualNodes.get(id);
        if (node != null && node.mParent != null) {
            return true;
        }
        return false;
    }

    public boolean updateEventListener(int id, @NonNull HashMap<String, Object> props) {
        VirtualNode node = mVirtualNodes.get(id);
        if (node == null) {
            return false;
        }
        for (Entry<String, Object> entry : props.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (!(value instanceof Boolean)) {
                continue;
            }
            if (((Boolean) value).booleanValue()) {
                node.addGesture(key);
            } else {
                node.removeGesture(key);
            }
        }
        return true;
    }

    public @Nullable
    TextRenderSupply updateLayout(int id, int width, HashMap<String, Object> layoutInfo) {
        VirtualNode node = mVirtualNodes.get(id);
        if (!(node instanceof TextVirtualNode) || node.mParent != null) {
            return null;
        }
        float leftPadding = 0;
        float topPadding = 0;
        float rightPadding = 0;
        float bottomPadding = 0;
        if (layoutInfo.containsKey(PADDING_LEFT)) {
            leftPadding = ((Number) layoutInfo.get(PADDING_LEFT)).floatValue();
        }
        if (layoutInfo.containsKey(PADDING_TOP)) {
            topPadding = ((Number) layoutInfo.get(PADDING_TOP)).floatValue();
        }
        if (layoutInfo.containsKey(PADDING_RIGHT)) {
            rightPadding = ((Number) layoutInfo.get(PADDING_RIGHT)).floatValue();
        }
        if (layoutInfo.containsKey(PADDING_BOTTOM)) {
            bottomPadding = ((Number) layoutInfo.get(PADDING_BOTTOM)).floatValue();
        }
        Layout layout = ((TextVirtualNode) node)
                .createLayout((width - leftPadding - rightPadding), FlexMeasureMode.EXACTLY);
        return new TextRenderSupply(layout, leftPadding, topPadding,
                rightPadding, bottomPadding);
    }

    public long measure(int id, float width, FlexMeasureMode widthMode) throws IllegalStateException {
        VirtualNode node = mVirtualNodes.get(id);
        if (!(node instanceof TextVirtualNode) || node.mParent != null) {
            throw new IllegalStateException(
                    TAG + ": measure: Encounter wrong state when check node, "
                            + "only text node and parent==null need do measure");
        }
        TextVirtualNode textNode = (TextVirtualNode) node;
        Layout layout = textNode.createLayout(width, widthMode);
        return FlexOutput.make(layout.getWidth(), layout.getHeight());
    }

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

    private void invokePropertyMethod(@NonNull VirtualNode node, @NonNull HashMap propsMap,
            @NonNull String key,
            @Nullable PropertyMethod methodHolder) {
        if (methodHolder == null) {
            if ((propsMap.get(key) instanceof HashMap) && propsMap
                    .equals(NodeProps.STYLE)) {
                updateProps(node, (HashMap) propsMap.get(key));
            }
            return;
        }

        try {
            if (propsMap.get(key) == null) {
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
                        ArgumentUtils.parseArgument(methodHolder.paramTypes[0], propsMap.get(key)));
            }
        } catch (Exception exception) {
            mNativeRender.handleRenderException(exception);
        }
    }

    private void updateProps(@NonNull VirtualNode node, @Nullable HashMap propsMap) {
        if (propsMap == null) {
            return;
        }
        Class nodeClass = node.getClass();
        Map<String, PropertyMethod> methodMap = sClassPropertyMethod.get(nodeClass);
        if (methodMap == null) {
            methodMap = new HashMap<>();
            findPropertyMethod(nodeClass, methodMap);
        }
        Set<String> keySet = propsMap.keySet();
        for (String key : keySet) {
            PropertyMethod methodHolder = methodMap.get(key);
            invokePropertyMethod(node, propsMap, key, methodHolder);
        }
    }

    public void createVirtualNode(int id, int pid, int index, String className,
            @Nullable HashMap<String, Object> props) throws NativeRenderException {
        VirtualNode node;
        VirtualNode parent = mVirtualNodes.get(pid);
        if (className.equals(TEXT_CLASS_NAME)) {
            node = new TextVirtualNode(id, pid, index, mNativeRender.getFontAdapter());
        } else if (className.equals(IMAGE_CLASS_NAME)) {
            node = new ImageVirtualNode(id, pid, index, mNativeRender.getImageLoaderAdapter());
        } else {
            throw new NativeRenderException(INVALID_VIRTUAL_NODE_TYPE_ERR,
                    TAG + ": createVirtualNode: not recognized className=" + className
                            + " for virtual node");
        }
        mVirtualNodes.put(id, node);
        if (parent != null) {
            parent.addChildAt(node, index);
        }
        updateProps(node, props);
    }

    public @Nullable
    VirtualNode getVirtualNode(int id) {
        return mVirtualNodes.get(id);
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
