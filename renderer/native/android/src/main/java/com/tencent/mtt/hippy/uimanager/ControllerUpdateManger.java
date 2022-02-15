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

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@SuppressWarnings({"deprecation", "unused", "rawtypes"})
public class ControllerUpdateManger<T, G> {

    static final Map<Class, Map<String, PropsMethodHolder>> CLASS_PROPS_METHOD = new HashMap<>();

    public static class PropsMethodHolder {

        Method mMethod;
        String mDefaultType;
        String mDefaultString;
        double mDefaultNumber;
        boolean mDefaultBoolean;
        Type[] mTypes;
    }

    private T customPropsController;

    public void setCustomPropsController(T controller) {
        assert (controller != null);
        customPropsController = controller;
    }

    private void findPropsMethod(Class cls, Map<String, PropsMethodHolder> hashMap) {
        if (cls != HippyViewController.class) {
            // find parent methods first
            findPropsMethod(cls.getSuperclass(), hashMap);
        }

        Map<String, PropsMethodHolder> methodHolder = CLASS_PROPS_METHOD.get(cls);
        if (methodHolder == null) {

            Method[] methods = cls.getMethods();
            for (Method method : methods) {
                HippyControllerProps controllerProps = method
                        .getAnnotation(HippyControllerProps.class);
                if (controllerProps != null) {
                    String style = controllerProps.name();
                    PropsMethodHolder propsMethodHolder = new PropsMethodHolder();
                    propsMethodHolder.mDefaultNumber = controllerProps.defaultNumber();
                    propsMethodHolder.mDefaultType = controllerProps.defaultType();
                    propsMethodHolder.mDefaultString = controllerProps.defaultString();
                    propsMethodHolder.mDefaultBoolean = controllerProps.defaultBoolean();
                    propsMethodHolder.mMethod = method;
                    hashMap.put(style, propsMethodHolder);
                }
            }
            // put to CLASS_PROPS_METHOD
            CLASS_PROPS_METHOD.put(cls, new HashMap<>(hashMap));
        } else {
            hashMap.putAll(methodHolder);
        }

    }

    private Map<String, PropsMethodHolder> findPropsMethod(Class cla) {
        Map<String, PropsMethodHolder> methodHolderMap = new HashMap<>();
        findPropsMethod(cla, methodHolderMap);
        return methodHolderMap;
    }

    private void invokePropMethod(T t, G g, Map<String, Object> props, String key,
            PropsMethodHolder propsMethodHolder) {
        try {
            if (props.get(key) == null) {
                switch (propsMethodHolder.mDefaultType) {
                    case HippyControllerProps.BOOLEAN:
                        propsMethodHolder.mMethod.invoke(t, g, propsMethodHolder.mDefaultBoolean);
                        break;
                    case HippyControllerProps.NUMBER:
                        if (propsMethodHolder.mTypes == null) {
                            propsMethodHolder.mTypes = propsMethodHolder.mMethod
                                    .getGenericParameterTypes();
                        }
                        propsMethodHolder.mMethod.invoke(t, g, ArgumentUtils
                                .parseArgument(propsMethodHolder.mTypes[1],
                                        propsMethodHolder.mDefaultNumber));
                        break;
                    case HippyControllerProps.STRING:
                        propsMethodHolder.mMethod.invoke(t, g, propsMethodHolder.mDefaultString);
                        break;
                    default:
                        propsMethodHolder.mMethod.invoke(t, g, null);
                        break;
                }
            } else {
                Object value = props.get(key);
                if (value instanceof Number) {
                    if (propsMethodHolder.mTypes == null) {
                        propsMethodHolder.mTypes = propsMethodHolder.mMethod
                                .getGenericParameterTypes();
                    }
                    value = ArgumentUtils
                            .parseArgument(propsMethodHolder.mTypes[1], value);
                }
                propsMethodHolder.mMethod.invoke(t, g, value);
            }
        } catch (Throwable e) {
            LogUtils.e("ControllerUpdateManager", e.getMessage(), e);
            e.printStackTrace();
        }
    }

    private void handleCustomProps(T t, G g, @Nullable Map<String, Object> props, String key) {
        boolean hasCustomMethodHolder = false;
        if (!(g instanceof View)) {
            return;
        }
        Object customProps = props.get(key);
        if (customPropsController != null
                && customPropsController instanceof HippyCustomPropsController) {
            Class cla = customPropsController.getClass();
            Map<String, PropsMethodHolder> methodHolder = CLASS_PROPS_METHOD.get(cla);
            if (methodHolder == null) {
                methodHolder = findPropsMethod(cla);
            }
            PropsMethodHolder propsMethodHolder = methodHolder.get(key);
            try {
                if (propsMethodHolder != null) {
                    invokePropMethod(customPropsController, g, props, key, propsMethodHolder);
                    hasCustomMethodHolder = true;
                }
            } catch (Throwable e) {
                LogUtils.e("ControllerUpdateManager", "customProps " + e.getMessage(), e);
                e.printStackTrace();
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
        Map<String, PropsMethodHolder> methodHolder = CLASS_PROPS_METHOD.get(cls);
        if (methodHolder == null) {
            methodHolder = findPropsMethod(cls);
        }
        Set<String> keySet = props.keySet();
        for (String key : keySet) {
            PropsMethodHolder propsMethodHolder = methodHolder.get(key);
            if (propsMethodHolder != null) {
                invokePropMethod(t, g, props, key, propsMethodHolder);
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
