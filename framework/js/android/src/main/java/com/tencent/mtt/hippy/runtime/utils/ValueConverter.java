/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2021 THL A29 Limited, a Tencent company. All rights reserved.
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
package com.tencent.mtt.hippy.runtime.utils;

import android.util.Pair;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.runtime.builtins.JSSet;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;
import com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray;
import com.tencent.mtt.hippy.runtime.builtins.array.JSSparseArray;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSPrimitiveWrapper;

import java.util.Map;

@SuppressWarnings({"deprecation", "unused"})
public final class ValueConverter {

  private ValueConverter() {

  }

  static public Object toHippyValue(Object value) {
    if (JSValue.is(value)) {
      JSValue jsValue = (JSValue) value;
      if (jsValue.isPrimitiveObject()) {
        return ((JSPrimitiveWrapper<?>) value).getValue();
      }
      if (jsValue.isSet()) {
        HippyArray array = new HippyArray();
        for (Object o : ((JSSet) value).getInternalSet()) {
          array.pushObject(toHippyValue(o));
        }
        return array;
      }
      if (jsValue.isArray()) {
        if (jsValue.isDenseArray()) {
          HippyArray array = new HippyArray();
          for (Object o : ((JSDenseArray) value).items()) {
            array.pushObject(toHippyValue(o));
          }
          return array;
        } else if (jsValue.isSparseArray()) {
          HippyMap object = new HippyMap();
          for (Pair<Integer, Object> o : ((JSSparseArray) value).items()) {
            object.pushObject(String.valueOf(o.first), toHippyValue((o.second)));
          }
          return object;
        }
      }
      if (jsValue.isObject()) {
        HippyMap object = new HippyMap();
        for (Pair<String, Object> prop : ((JSObject) jsValue).entries()) {
          object.pushObject(prop.first, toHippyValue(prop.second));
        }
        return object;
      }
    }
    return value;
  }

  static public Object toJSValue(Object value) {
    if (value instanceof HippyArray) {
      HippyArray array = ((HippyArray) value);
      JSDenseArray jsArray = new JSDenseArray(array.size());
      for (int i = 0; i < array.size(); i++) {
        jsArray.push(toJSValue(array.get(i)));
      }
      return jsArray;
    } else if (value instanceof HippyMap) {
      HippyMap object = ((HippyMap) value);
      JSObject jsObject = new JSObject();
      for (Map.Entry<String, Object> entry : object.entrySet()) {
        jsObject.set(entry.getKey(), toJSValue(entry.getValue()));
      }
      return jsObject;
    }
    return value;
  }
}
