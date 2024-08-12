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

import android.graphics.Color;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;

import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import com.tencent.renderer.Renderer;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.ComponentController;
import com.tencent.renderer.component.FlatViewGroup;
import com.tencent.renderer.component.image.ImageComponentController;
import com.tencent.renderer.component.text.TextComponentController;
import com.tencent.renderer.node.TextRenderNode;
import com.tencent.renderer.node.TextVirtualNode;
import com.tencent.renderer.utils.MapUtils;
import com.tencent.renderer.utils.PropertyUtils;
import com.tencent.renderer.utils.PropertyUtils.PropertyMethodHolder;
import com.tencent.renderer.node.RenderNode;

import java.lang.ref.WeakReference;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ControllerUpdateManger<T> {

    private static final Map<Class<?>, Map<String, PropertyMethodHolder>> sViewPropsMethodMap = new HashMap<>();
    private static final Map<String, PropertyMethodHolder> sComponentPropsMethodMap = new HashMap<>();
    private static final Set<String> sTextPropsSet = new HashSet<>();
    private static final ArrayList<String> sRenderPropsList = new ArrayList<>();
    private static final String[] sLayoutStyleList = {
            NodeProps.WIDTH,
            NodeProps.HEIGHT,
            NodeProps.LEFT,
            NodeProps.TOP,
            NodeProps.VISIBILITY,
            NodeProps.TRANSFORM,
            NodeProps.OPACITY,
            NodeProps.OVERFLOW
    };
    @Nullable
    private final WeakReference<Renderer> mRendererWeakRef;
    @Nullable
    private ComponentController mComponentController;
    @Nullable
    private ImageComponentController mImageComponentController;
    @Nullable
    private TextComponentController mTextComponentController;
    @Nullable
    private T mCustomPropsController;

    static {
        initComponentPropsMap();
    }

    public ControllerUpdateManger(@NonNull Renderer renderer) {
        mRendererWeakRef = new WeakReference<>(renderer);
    }

    void destroy() {

    }

    public void setCustomPropsController(T controller) {
        mCustomPropsController = controller;
    }

    @NonNull
    public ArrayList<String> getPropsRegisterForRender() {
        return sRenderPropsList;
    }

    private static void collectMethodHolder(@NonNull Class<?> cls,
            @NonNull Map<String, PropertyMethodHolder> methodHolderMap) {
        Method[] methods = cls.getMethods();
        for (Method method : methods) {
            HippyControllerProps controllerProps = method
                    .getAnnotation(HippyControllerProps.class);
            if (controllerProps != null) {
                String style = controllerProps.name();
                sRenderPropsList.add(style);
                PropertyMethodHolder propsMethodHolder = new PropertyMethodHolder();
                propsMethodHolder.defaultNumber = controllerProps.defaultNumber();
                propsMethodHolder.defaultType = controllerProps.defaultType();
                propsMethodHolder.defaultString = controllerProps.defaultString();
                propsMethodHolder.defaultBoolean = controllerProps.defaultBoolean();
                propsMethodHolder.method = method;
                propsMethodHolder.hostClass = cls;
                methodHolderMap.put(style, propsMethodHolder);
            }
        }
    }

    public boolean checkComponentProperty(@NonNull String key) {
        return sComponentPropsMethodMap.containsKey(key);
    }

    private static void initComponentPropsMap() {
        collectMethodHolder(ComponentController.class, sComponentPropsMethodMap);
        collectMethodHolder(ImageComponentController.class, sComponentPropsMethodMap);
        collectMethodHolder(TextComponentController.class, sComponentPropsMethodMap);
        Method[] methods = TextVirtualNode.class.getMethods();
        for (Method method : methods) {
            HippyControllerProps controllerProps = method
                    .getAnnotation(HippyControllerProps.class);
            if (controllerProps != null) {
                String name = controllerProps.name();
                if (!isComponentProps(name)) {
                    sTextPropsSet.add(name);
                }
                sRenderPropsList.add(name);
            }
        }
        Collections.addAll(sRenderPropsList, sLayoutStyleList);
    }

    private static boolean isComponentProps(String name) {
        if (sComponentPropsMethodMap.containsKey(name)) {
            return true;
        }
        // Special case: property "opacity" in TextVirtualNode also need to process in HippyViewController
        return NodeProps.OPACITY.equals(name);
    }

    void findViewPropsMethod(Class<?> cls,
            @NonNull Map<String, PropertyMethodHolder> methodHolderMap) {
        if (cls != HippyViewController.class) {
            // find parent methods first
            findViewPropsMethod(cls.getSuperclass(), methodHolderMap);
        }
        Map<String, PropertyMethodHolder> methodHolder = sViewPropsMethodMap.get(cls);
        if (methodHolder == null) {
            collectMethodHolder(cls, methodHolderMap);
            sViewPropsMethodMap.put(cls, new HashMap<>(methodHolderMap));
        } else {
            methodHolderMap.putAll(methodHolder);
        }
    }

    private void invokePropMethod(@NonNull Object obj, @NonNull Object arg1,
            Map<String, Object> props, String key, @NonNull PropertyMethodHolder methodHolder) {
        try {
            Object value = props.get(key);
            if (value == null) {
                switch (methodHolder.defaultType) {
                    case HippyControllerProps.BOOLEAN:
                        methodHolder.method.invoke(obj, arg1, methodHolder.defaultBoolean);
                        break;
                    case HippyControllerProps.NUMBER:
                        if (methodHolder.paramTypes == null) {
                            methodHolder.paramTypes = methodHolder.method
                                    .getGenericParameterTypes();
                        }
                        methodHolder.method.invoke(obj, arg1, PropertyUtils
                                .convertNumber(methodHolder.paramTypes[1],
                                        methodHolder.defaultNumber));
                        break;
                    case HippyControllerProps.STRING:
                        methodHolder.method.invoke(obj, arg1, methodHolder.defaultString);
                        break;
                    default:
                        methodHolder.method.invoke(obj, arg1, null);
                        break;
                }
            } else {
                if (methodHolder.paramTypes == null) {
                    methodHolder.paramTypes = methodHolder.method.getGenericParameterTypes();
                }
                value = PropertyUtils.convertProperty(methodHolder.paramTypes[1], value);
                methodHolder.method.invoke(obj, arg1, value);
            }
        } catch (Exception exception) {
            Renderer renderer = mRendererWeakRef.get();
            if (renderer != null) {
                renderer.handleRenderException(
                        PropertyUtils.makePropertyConvertException(exception, key,
                                methodHolder.method));
            }
        }
    }

    @Nullable
    private PropertyMethodHolder getCustomPropsMethodHolder(@NonNull String key) {
        if (mCustomPropsController != null
                && mCustomPropsController instanceof HippyCustomPropsController) {
            Class<?> cls = mCustomPropsController.getClass();
            Map<String, PropertyMethodHolder> methodHolderMap = sViewPropsMethodMap.get(cls);
            if (methodHolderMap == null) {
                methodHolderMap = new HashMap<>();
                findViewPropsMethod(cls, methodHolderMap);
            }
            return methodHolderMap.get(key);
        }
        return null;
    }

    private void handleCustomProps(T t, @Nullable View view, @NonNull String key,
            @NonNull Map<String, Object> props, @Nullable PropertyMethodHolder methodHolder) {
        if (view != null) {
            Object customProps = props.get(key);
            if (methodHolder != null) {
                invokePropMethod(mCustomPropsController, view, props, key, methodHolder);
            } else if (t instanceof HippyViewController) {
                //noinspection unchecked
                ((HippyViewController) t).setCustomProp(view, key, customProps);
            }
        }
    }

    protected void updateProps(@NonNull RenderNode node, @NonNull T controller, @Nullable View view,
            @Nullable Map<String, Object> props, boolean skipComponentProps) {
        if (props == null || props.isEmpty()) {
            return;
        }
        Class<?> cls = controller.getClass();
        Map<String, PropertyMethodHolder> methodHolderMap = sViewPropsMethodMap.get(cls);
        if (methodHolderMap == null) {
            methodHolderMap = new HashMap<>();
            findViewPropsMethod(cls, methodHolderMap);
        }
        Set<String> keySet = props.keySet();
        for (String key : keySet) {
            if (node instanceof TextRenderNode && sTextPropsSet.contains(key)) {
                // The text related attributes have been processed in the build layout,
                // so the following process no longer needs to be executed.
                continue;
            }
            PropertyMethodHolder methodHolder = methodHolderMap.get(key);
            if (methodHolder != null) {
                if (view == null) {
                    view = node.createView(true);
                }
                if (view != null) {
                    invokePropMethod(controller, view, props, key, methodHolder);
                }
            } else {
                // Background color is a property supported by both view and component, if the
                // host view of a node has already been created, we need to set this property
                // separately on the view, otherwise the background color setting for non
                // flattened elements will not take effect.
                if (key.equals(NodeProps.BACKGROUND_COLOR) && view != null
                        && !(view instanceof FlatViewGroup)) {
                    view.setBackgroundColor(
                            MapUtils.getIntValue(props, NodeProps.BACKGROUND_COLOR,
                                    Color.TRANSPARENT));
                } else if (!handleComponentProps(node, key, props, skipComponentProps)) {
                    PropertyMethodHolder customMethodHolder = getCustomPropsMethodHolder(key);
                    if (customMethodHolder != null && view == null) {
                        // If the host has a custom attribute that needs to be processed, this element cannot be
                        // flattened, otherwise, if the view is empty, custom attributes will not be passed through
                        // to custom props controller.
                        view = node.createView(true);
                    }
                    handleCustomProps(controller, view, key, props, customMethodHolder);
                }
            }
        }
    }

    @Nullable
    private Object getComponentController(Class<?> cls) {
        if (cls == ComponentController.class) {
            if (mComponentController == null) {
                mComponentController = new ComponentController();
            }
            return mComponentController;
        }
        if (cls == ImageComponentController.class) {
            if (mImageComponentController == null) {
                mImageComponentController = new ImageComponentController();
            }
            return mImageComponentController;
        }
        if (cls == TextComponentController.class) {
            if (mTextComponentController == null) {
                mTextComponentController = new TextComponentController();
            }
            return mTextComponentController;
        }
        return null;
    }

    private boolean handleComponentProps(@NonNull RenderNode node, @NonNull String key,
            @NonNull Map<String, Object> props, boolean skipComponentProps) {
        PropertyMethodHolder methodHolder = sComponentPropsMethodMap.get(key);
        if (methodHolder != null) {
            if (!skipComponentProps) {
                Object controller = getComponentController(methodHolder.hostClass);
                Component component = node.ensureComponentIfNeeded(methodHolder.hostClass);
                if (controller == null || component == null) {
                    return false;
                }
                invokePropMethod(controller, component, props, key, methodHolder);
            }
            return true;
        }
        return false;
    }
}
