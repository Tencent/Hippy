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
import com.tencent.link_supplier.proxy.renderer.Renderer;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import com.tencent.renderer.utils.PropertyUtils;
import com.tencent.renderer.utils.PropertyUtils.PropertyMethodHolder;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@SuppressWarnings({"unused", "rawtypes"})
public class ControllerUpdateManger<T, G> {

    private static final Map<Class, Map<String, PropertyMethodHolder>> CLASS_PROPS_METHOD = new HashMap<>();
    @NonNull
    private final Renderer mRenderer;
    private T customPropsController;

    public ControllerUpdateManger(@NonNull Renderer renderer) {
        mRenderer = renderer;
    }

    public void setCustomPropsController(T controller) {
        assert (controller != null);
        customPropsController = controller;
    }

    private void findPropsMethod(Class cls, Map<String, PropertyMethodHolder> hashMap) {
        if (cls != HippyViewController.class) {
            // find parent methods first
            findPropsMethod(cls.getSuperclass(), hashMap);
        }
        Map<String, PropertyMethodHolder> methodHolder = CLASS_PROPS_METHOD.get(cls);
        if (methodHolder == null) {
            Method[] methods = cls.getMethods();
            for (Method method : methods) {
                HippyControllerProps controllerProps = method
                        .getAnnotation(HippyControllerProps.class);
                if (controllerProps != null) {
                    String style = controllerProps.name();
                    PropertyMethodHolder propsMethodHolder = new PropertyMethodHolder();
                    propsMethodHolder.defaultNumber = controllerProps.defaultNumber();
                    propsMethodHolder.defaultType = controllerProps.defaultType();
                    propsMethodHolder.defaultString = controllerProps.defaultString();
                    propsMethodHolder.defaultBoolean = controllerProps.defaultBoolean();
                    propsMethodHolder.method = method;
                    hashMap.put(style, propsMethodHolder);
                }
            }
            CLASS_PROPS_METHOD.put(cls, new HashMap<>(hashMap));
        } else {
            hashMap.putAll(methodHolder);
        }
    }

    private Map<String, PropertyMethodHolder> findPropsMethod(Class cla) {
        Map<String, PropertyMethodHolder> methodHolderMap = new HashMap<>();
        findPropsMethod(cla, methodHolderMap);
        return methodHolderMap;
    }

    private void invokePropMethod(T t, G g, Map<String, Object> props, String key,
            PropertyMethodHolder methodHolder) {
        try {
            if (props.get(key) == null) {
                switch (methodHolder.defaultType) {
                    case HippyControllerProps.BOOLEAN:
                        methodHolder.method.invoke(t, g, methodHolder.defaultBoolean);
                        break;
                    case HippyControllerProps.NUMBER:
                        if (methodHolder.paramTypes == null) {
                            methodHolder.paramTypes = methodHolder.method
                                    .getGenericParameterTypes();
                        }
                        methodHolder.method.invoke(t, g, PropertyUtils
                                .convertNumber(methodHolder.paramTypes[1],
                                        methodHolder.defaultNumber));
                        break;
                    case HippyControllerProps.STRING:
                        methodHolder.method.invoke(t, g, methodHolder.defaultString);
                        break;
                    default:
                        methodHolder.method.invoke(t, g, null);
                        break;
                }
            } else {
                Object value = props.get(key);
                if (methodHolder.paramTypes == null) {
                    methodHolder.paramTypes = methodHolder.method.getGenericParameterTypes();
                }
                value = PropertyUtils.convertProperty(methodHolder.paramTypes[1], value);
                methodHolder.method.invoke(t, g, value);
            }
        } catch (Exception exception) {
            mRenderer.handleRenderException(
                    PropertyUtils
                            .makePropertyConvertException(exception, key, methodHolder.method));
        }
    }

    private void handleCustomProps(T t, G g, @NonNull Map<String, Object> props, @NonNull String key) {
        boolean hasCustomMethodHolder = false;
        if (!(g instanceof View)) {
            return;
        }
        Object customProps = props.get(key);
        if (customPropsController != null
                && customPropsController instanceof HippyCustomPropsController) {
            Class cla = customPropsController.getClass();
            Map<String, PropertyMethodHolder> methodHolderMap = CLASS_PROPS_METHOD.get(cla);
            if (methodHolderMap == null) {
                methodHolderMap = findPropsMethod(cla);
            }
            PropertyMethodHolder methodHolder = methodHolderMap.get(key);
            if (methodHolder != null) {
                invokePropMethod(customPropsController, g, props, key, methodHolder);
                hasCustomMethodHolder = true;
            }
        }
        if (!hasCustomMethodHolder && t instanceof HippyViewController) {
            //noinspection unchecked
            ((HippyViewController) t).setCustomProp((View) g, key, customProps);
        }
    }

    public void updateProps(T t, G g, @Nullable Map<String, Object> props) {
        if (props == null) {
            return;
        }
        Class cls = t.getClass();
        Map<String, PropertyMethodHolder> methodHolderMap = CLASS_PROPS_METHOD.get(cls);
        if (methodHolderMap == null) {
            methodHolderMap = findPropsMethod(cls);
        }
        Set<String> keySet = props.keySet();
        for (String key : keySet) {
            PropertyMethodHolder methodHolder = methodHolderMap.get(key);
            if (methodHolder != null) {
                invokePropMethod(t, g, props, key, methodHolder);
            } else {
                if (key.equals(NodeProps.STYLE) && props.get(key) instanceof Map) {
                    updateProps(t, g, (Map) props.get(key));
                } else {
                    handleCustomProps(t, g, props, key);
                }
            }
        }
    }
}
