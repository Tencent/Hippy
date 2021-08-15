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

package com.tencent.mtt.hippy.dom;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.dom.node.StyleNode;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@SuppressWarnings({"deprecation", "unused", "rawtypes"})
public class DomUpdateManager<T> {

  static final Map<Class, Map<String, StyleMethod>> CLASS_STYLE_METHOD = new HashMap<>();

  public void updateStyle(T t, HippyMap hippyMap) {
    if (hippyMap == null) {
      return;
    }
    Class cla = t.getClass();

    Map<String, StyleMethod> methods = CLASS_STYLE_METHOD.get(cla);
    if (methods == null) {
      methods = findStyleMethod(cla);
    }
    Set<String> styles = hippyMap.keySet();
    for (String style : styles) {
      StyleMethod styleMethodHolder = methods.get(style);
      if (styleMethodHolder != null) {
        {
          try {
            if (hippyMap.get(style) == null) {
              switch (styleMethodHolder.mDefaultType) {
                case HippyControllerProps.BOOLEAN:
                  styleMethodHolder.mMethod.invoke(t, styleMethodHolder.mDefaultBoolean);
                  break;
                case HippyControllerProps.NUMBER:
                  styleMethodHolder.mMethod.invoke(t,
                      ArgumentUtils.parseArgument(styleMethodHolder.mParamTypes[0],
                          styleMethodHolder.mDefaultNumber));
                  break;
                case HippyControllerProps.STRING:
                  styleMethodHolder.mMethod.invoke(t, styleMethodHolder.mDefaultString);
                  break;
                default:
                  Object o = null;
                  //noinspection ConstantConditions
                  styleMethodHolder.mMethod.invoke(t, o);
                  break;
              }
            } else {
              styleMethodHolder.mMethod.invoke(t,
                  ArgumentUtils.parseArgument(styleMethodHolder.mParamTypes[0], hippyMap, style));
            }
          } catch (Throwable e) {
            LogUtils.e("ControllerUpdateManager", e.getMessage(), e);
            e.printStackTrace();
          }
        }
      } else {
        if (hippyMap.get(style) instanceof HippyMap && style.equals(NodeProps.STYLE)) {
          updateStyle(t, (HippyMap) hippyMap.get(style));
        }
      }
    }
  }

  private void findStyleMethod(Class cls, Map<String, StyleMethod> hashMap) {
    if (cls != StyleNode.class) {
      // find parent methods first
      findStyleMethod(cls.getSuperclass(), hashMap);
    }
    Map<String, StyleMethod> methodHolder = CLASS_STYLE_METHOD.get(cls);
    if (methodHolder == null) {
      Method[] methods = cls.getDeclaredMethods();
      for (Method method : methods) {
        HippyControllerProps controllerProps = method.getAnnotation(HippyControllerProps.class);
        if (controllerProps != null) {
          String style = controllerProps.name();
          StyleMethod propsMethodHolder = new StyleMethod();
          propsMethodHolder.mDefaultNumber = controllerProps.defaultNumber();
          propsMethodHolder.mDefaultType = controllerProps.defaultType();
          propsMethodHolder.mDefaultString = controllerProps.defaultString();
          propsMethodHolder.mDefaultBoolean = controllerProps.defaultBoolean();
          propsMethodHolder.mMethod = method;
          propsMethodHolder.mParamTypes = method.getGenericParameterTypes();
          hashMap.put(style, propsMethodHolder);
        }
      }
      // put to CLASS_PROPS_METHOD
      CLASS_STYLE_METHOD.put(cls, new HashMap<>(hashMap));
    } else {
      hashMap.putAll(methodHolder);
    }

  }

  private Map<String, StyleMethod> findStyleMethod(Class cla) {
    Map<String, StyleMethod> hashMap = new HashMap<>();
    findStyleMethod(cla, hashMap);
    return hashMap;
  }

  public static class StyleMethod {

    Method mMethod;
    String mDefaultType;
    String mDefaultString;
    double mDefaultNumber;
    boolean mDefaultBoolean;
    Type[] mParamTypes;
  }
}
