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
import static com.tencent.renderer.NativeRenderException.ExceptionCode.INVALID_NODE_DATA_ERR;
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
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.INativeRender;
import com.tencent.renderer.NativeRenderException;

import com.tencent.renderer.NativeRenderProvider.MeasureParams;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class VirtualNodeManager {

    private static final String TAG = "VirtualNodeManager";
    private static final Map<Class, Map<String, PropertyMethod>> sClassPropertyMethod = new HashMap<>();
    private final SparseArray<VirtualNode> mVirtualNodes = new SparseArray<>();
    private @NonNull
    final INativeRender mNativeRender;

    public VirtualNodeManager(@NonNull INativeRender nativeRenderer) {
        mNativeRender = nativeRenderer;
    }

    public boolean updateLayoutIfNeeded(int id, int width) {
        VirtualNode node = mVirtualNodes.get(id);
        if (node != null) {
            if (node.mParent != null || !(node instanceof TextVirtualNode)) {
                return false;
            }
            ((TextVirtualNode)node).updateLayout(width);
        }
        return true;
    }

    public long measure(MeasureParams params) throws Exception {
        VirtualNode node = mVirtualNodes.get(params.id);
        if (node == null || !(node instanceof TextVirtualNode) || node.mParent != null) {
            throw new IllegalStateException(
                    TAG + ": measure: Encounter wrong state when check node, "
                            + "only text node and parent==null need do measure");
        }
        TextVirtualNode textNode = (TextVirtualNode) node;
        textNode.setPadding(params.leftPadding, params.topPadding, params.rightPadding,
                params.bottomPadding);
        try {
            Layout layout = textNode.createLayout(params.width, params.widthMode);
            return FlexOutput.make(layout.getWidth(), layout.getHeight());
        } catch (Exception exception) {
            throw exception;
        }
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

    private void updateProps(VirtualNode node, @NonNull HashMap propsMap) {
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
            HashMap<String, Object> props) {
        VirtualNode node;
        VirtualNode parent = mVirtualNodes.get(pid);
        if (className.equals(TEXT_CLASS_NAME)) {
            node = new TextVirtualNode(id, pid, index, mNativeRender.getFontScaleAdapter());
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

        Method method;
        String defaultType;
        String defaultString;
        double defaultNumber;
        boolean defaultBoolean;
        Type[] paramTypes;
    }
}
