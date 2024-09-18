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
package com.tencent.mtt.hippy.utils;

import android.os.Bundle;
import android.os.Parcelable;
import android.text.TextUtils;

import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyTurboObj;
import com.tencent.mtt.hippy.annotation.HippyTurboProp;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Set;

@SuppressWarnings("deprecation")
public class ArgumentUtils {

  private static final String TAG = "ArgumentUtils";

  private static HashMap<Class, String> sMethodSigMap = new HashMap<>();

  public static HippyArray parseToArray(String json) {
    HippyArray array = new HippyArray();
    if (TextUtils.isEmpty(json)) {
      return array;
    }

    try {
      JSONArray jsonArray = new JSONArray(json);
      int length = jsonArray.length();
      Object obj;
      for (int i = 0; i < length; i++) {
        obj = jsonArray.get(i);
        parseObjectGotoArray(array, obj);
      }

      return array;
    } catch (Throwable e) {
      return array;
    }
  }

  public static HippyArray fromJavaArgs(Object[] args) {
    HippyArray array = new HippyArray();
    if (args == null || args.length <= 0) {
      return array;
    }

    try {
      for (Object argument : args) {
        if (argument == null) {
          array.pushNull();
          continue;
        }
        parseObjectGotoArray(array, argument);
      }
    } catch (Throwable e) {
      LogUtils.d("ArgumentUtils", "fromJavaArgs: " + e.getMessage());
    }
    return array;
  }

  @SuppressWarnings("unused")
  public static HippyMap parseToMap(String json) {
    HippyMap map = new HippyMap();
    if (TextUtils.isEmpty(json)) {
      return map;
    }

    try {
      JSONObject jsonObj = new JSONObject(json);
      Iterator<String> keys = jsonObj.keys();
      while (keys.hasNext()) {
        String key = keys.next();
        parseObjectGotoMap(map, key, jsonObj.get(key));
      }
      return map;
    } catch (Throwable e) {
      return map;
    }
  }

  @SuppressWarnings("ConstantConditions")
  private static void parseObjectGotoArray(HippyArray array, Object obj) throws JSONException {
    if (obj == null || obj == JSONObject.NULL) {
      array.pushNull();
      return;
    }

    Class<?> cls = obj.getClass();
    if (obj instanceof String) {
      array.pushString((String) obj);
    } else if (cls == int.class || cls == Integer.class) {
      array.pushInt((Integer) obj);
    } else if (cls == double.class || cls == Double.class) {
      array.pushDouble((Double) obj);
    } else if (cls == long.class || cls == Long.class) {
      array.pushLong((Long) obj);
    } else if (cls == boolean.class || cls == Boolean.class) {
      array.pushBoolean((Boolean) obj);
    } else if (cls == HippyArray.class) {
      array.pushArray((HippyArray) obj);
    } else if (cls == ArrayList.class || cls == List.class) {
      array.pushArray(new HippyArray((List) obj));
    } else if (cls == HippyMap.class) {
      array.pushMap((HippyMap) obj);
    } else if (cls == HashMap.class || cls == Map.class) {
      array.pushMap(new HippyMap((Map) obj));
    } else if (cls == JSONArray.class) {
      HippyArray arr = new HippyArray();
      JSONArray jsonArr = (JSONArray) obj;
      int length = jsonArr.length();
      for (int i = 0; i < length; i++) {
        parseObjectGotoArray(arr, jsonArr.get(i));
      }
      array.pushArray(arr);
    } else if (cls == JSONObject.class) {
      HippyMap map = new HippyMap();
      JSONObject jsonObj = (JSONObject) obj;
      Iterator<String> keys = jsonObj.keys();
      while (keys.hasNext()) {
        String key = keys.next();
        parseObjectGotoMap(map, key, jsonObj.get(key));
      }
      array.pushMap(map);
    }
  }

  @SuppressWarnings("ConstantConditions")
  private static void parseObjectGotoMap(HippyMap map, String key, Object obj)
      throws JSONException {
    if (obj == null || obj == JSONObject.NULL) {
      map.pushNull(key);
      return;
    }

    Class<?> cls = obj.getClass();
    if (obj instanceof String) {
      map.pushString(key, (String) obj);
    } else if (cls == int.class || cls == Integer.class) {
      map.pushInt(key, (Integer) obj);
    } else if (cls == double.class || cls == Double.class) {
      map.pushDouble(key, (Double) obj);
    } else if (cls == long.class || cls == Long.class) {
      map.pushLong(key, (Long) obj);
    } else if (cls == boolean.class || cls == Boolean.class) {
      map.pushBoolean(key, (Boolean) obj);
    } else if (cls == JSONArray.class) {
      HippyArray arr = new HippyArray();
      map.pushArray(key, arr);
      JSONArray jsonArr = (JSONArray) obj;
      int length = jsonArr.length();
      for (int i = 0; i < length; i++) {
        parseObjectGotoArray(arr, jsonArr.get(i));
      }
    } else if (cls == JSONObject.class) {
      HippyMap hippyMap = new HippyMap();
      map.pushMap(key, hippyMap);
      JSONObject jsonObj = (JSONObject) obj;
      Iterator<String> keys = jsonObj.keys();
      while (keys.hasNext()) {
        String keyStr = keys.next();
        parseObjectGotoMap(hippyMap, keyStr, jsonObj.get(keyStr));
      }
    }
  }

  public static String objectToJson(Object obj) {
    if (obj == null) {
      return "";
    }

    StringBuilder buider = new StringBuilder();
    objectToJson(buider, obj);
    return buider.toString();
  }

  public static String objectToJsonOpt(Object obj, StringBuilder builder) {
    if (obj == null) {
      return "";
    }

    objectToJson(builder, obj);
    return builder.toString();
  }

  private static void objectToJson(StringBuilder builder, Object obj) {
    if (obj == null) {
      builder.append("\"\"");
      return;
    }

    if (obj instanceof String) {
      String str = (String) obj;
      if (TextUtils.isEmpty(str)) {
        builder.append("\"\"");
      } else {
        stringFormat(str, builder);
      }
    } else if (obj.getClass().isAssignableFrom(int.class) || obj instanceof Integer) {
      builder.append(obj);
    } else if (obj.getClass().isAssignableFrom(long.class) || obj instanceof Long) {
      builder.append(obj);
    } else if (obj.getClass().isAssignableFrom(double.class) || obj instanceof Double) {
      builder.append(Double.isNaN((double) obj) ? 0 : obj);
    } else if (obj.getClass().isAssignableFrom(boolean.class) || obj instanceof Boolean) {
      builder.append(obj);
    } else if (obj.getClass().isAssignableFrom(float.class) || obj instanceof Float) {
      builder.append(Float.isNaN((float) obj) ? 0 : obj);
    } else if (obj instanceof HippyArray || obj instanceof ArrayList) {
      builder.append("[");
      HippyArray array = (obj instanceof HippyArray) ? (HippyArray) obj : new HippyArray((ArrayList) obj);
      int length = array.size();
      for (int i = 0; i < length; i++) {
        objectToJson(builder, array.getObject(i));
        if (i != length - 1) {
          builder.append(",");
        }
      }
      builder.append("]");
    } else if (obj instanceof HippyMap || obj instanceof HashMap) {
      builder.append("{");
      HippyMap map = (obj instanceof HippyMap) ? (HippyMap) obj : new HippyMap((HashMap) obj);;
      Set<String> keys = map.keySet();
      boolean hasComma = false;
      for (String key : keys) {
        builder.append("\"");
        builder.append(key);
        builder.append("\"");
        builder.append(":");
        objectToJson(builder, map.get(key));
        builder.append(",");
        hasComma = true;
      }
      if (hasComma) {
        builder.deleteCharAt(builder.length() - 1);
      }
      builder.append("}");
    }
  }

  public static Object parseArgument(Type paramCls, HippyArray array, int index) {
    if (paramCls == String.class) {
      return array.getString(index);
    }

    if (paramCls == int.class || paramCls == Integer.class) {
      return array.getInt(index);
    }

    if (paramCls == long.class || paramCls == Long.class) {
      return array.getLong(index);
    }

    if (paramCls == double.class || paramCls == Double.class) {
      return array.getDouble(index);
    }

    if (paramCls == boolean.class || paramCls == Boolean.class) {
      return array.getBoolean(index);
    }

    if (paramCls == float.class || paramCls == Float.class) {
      return (float) array.getDouble(index);
    }

    if (paramCls == HippyArray.class || paramCls == ArrayList.class || paramCls == List.class) {
      return array.getArray(index);
    }

    if (paramCls == HippyMap.class || paramCls == HashMap.class || paramCls == Map.class) {
      return array.getMap(index);
    }

    throw new IllegalArgumentException("parseArgument exception");
  }

  public static Object parseArgument(Type paramCls, HippyMap map, String key) {
    if (paramCls == String.class) {
      return map.getString(key);
    }

    if (paramCls == int.class || paramCls == Integer.class) {
      return map.getInt(key);
    }

    if (paramCls == long.class || paramCls == Long.class) {
      return map.getLong(key);
    }

    if (paramCls == double.class || paramCls == Double.class) {
      return map.getDouble(key);
    }

    if (paramCls == float.class || paramCls == Float.class) {
      return (float) map.getDouble(key);
    }

    if (paramCls == boolean.class || paramCls == Boolean.class) {
      return map.getBoolean(key);
    }

    if (paramCls == HippyArray.class || paramCls == ArrayList.class || paramCls == List.class) {
      return map.getArray(key);
    }

    if (paramCls == HippyMap.class || paramCls == HashMap.class || paramCls == Map.class) {
      return map.getMap(key);
    }

    throw new IllegalArgumentException("parseArgument exception");
  }

  public static Object parseArgument(Type paramCls, Object value) {
    if (paramCls == String.class) {
      return String.valueOf(value);
    }

    if (paramCls == int.class || paramCls == Integer.class) {
      return ((Number) value).intValue();
    }

    if (paramCls == long.class || paramCls == Long.class) {
      return ((Number) value).longValue();
    }

    if (paramCls == double.class || paramCls == Double.class) {
      return ((Number) value).doubleValue();
    }

    if (paramCls == float.class || paramCls == Float.class) {
      return ((Number) value).floatValue();
    }

    if (paramCls == boolean.class || paramCls == Boolean.class || paramCls == HippyArray.class
        || paramCls == HippyMap.class || paramCls == HashMap.class || paramCls == ArrayList.class) {
      return value;
    }

    throw new IllegalArgumentException("parseArgument exception");
  }

  public static HippyArray fromArray(Object array) {
    HippyArray catalystArray = new HippyArray();
    int length;
    int index;

    if (array instanceof String[]) {
      String[] strs = (String[]) array;
      length = strs.length;

      for (index = 0; index < length; ++index) {
        String str = strs[index];
        catalystArray.pushString(str);
      }
    } else if (array instanceof Parcelable[]) {
      Parcelable[] parcelables = (Parcelable[]) array;
      length = parcelables.length;

      for (index = 0; index < length; ++index) {
        Parcelable parcelable = parcelables[index];
        if (parcelable instanceof Bundle) {
          catalystArray.pushMap(fromBundle((Bundle) parcelable));
        }
      }
    } else if (array instanceof int[]) {
      int[] ints = (int[]) array;
      length = ints.length;

      for (index = 0; index < length; ++index) {
        int value = ints[index];
        catalystArray.pushInt(value);
      }
    } else if (array instanceof float[]) {
      float[] values = (float[]) array;
      length = values.length;

      for (index = 0; index < length; ++index) {
        float value = values[index];
        catalystArray.pushDouble(value);
      }
    } else if (array instanceof double[]) {
      double[] values = (double[]) array;
      length = values.length;

      for (index = 0; index < length; ++index) {
        double value = values[index];
        catalystArray.pushDouble(value);
      }
    } else {
      if (!(array instanceof boolean[])) {
        throw new IllegalArgumentException("Unknown array type " + array.getClass());
      }

      boolean[] values = (boolean[]) array;
      length = values.length;

      for (index = 0; index < length; ++index) {
        boolean value = values[index];
        catalystArray.pushBoolean(value);
      }
    }

    return catalystArray;
  }

  @SuppressWarnings("unused")
  public static HippyMap fromBundle(Bundle bundle) {
    HippyMap map = new HippyMap();

    for (String key : bundle.keySet()) {
      Object value = bundle.get(key);
      if (value == null) {
        map.pushNull(key);
      } else if (value.getClass().isArray()) {
        map.pushArray(key, fromArray(value));
      } else if (value instanceof String) {
        map.pushString(key, (String) value);
      } else if (value instanceof Number) {
        if (value instanceof Integer) {
          map.pushInt(key, (Integer) value);
        } else {
          map.pushDouble(key, ((Number) value).doubleValue());
        }
      } else if (value instanceof Boolean) {
        map.pushBoolean(key, (Boolean) value);
      } else {
        if (!(value instanceof Bundle)) {
          throw new IllegalArgumentException("Could not convert " + value.getClass());
        }

        map.pushMap(key, fromBundle((Bundle) value));
      }
    }

    return map;
  }

  @SuppressWarnings("unused")
  public static Bundle toBundle(HippyMap hippyMap) {
    Bundle b = new Bundle(9);
    if (hippyMap != null) {
      for (String key : hippyMap.keySet()) {
        Object value = hippyMap.get(key);
        if (value == null) {
          b.putString(key, null);
        } else if (value instanceof String) {
          b.putString(key, (String) value);
        } else if (value.getClass().isAssignableFrom(int.class) || value instanceof Integer) {
          b.putInt(key, (Integer) value);
        } else if (value.getClass().isAssignableFrom(long.class) || value instanceof Long) {
          b.putLong(key, (Long) value);
        } else if (value.getClass().isAssignableFrom(double.class) || value instanceof Double) {
          b.putDouble(key, (Double) value);
        } else if (value.getClass().isAssignableFrom(boolean.class) || value instanceof Boolean) {
          b.putBoolean(key, (Boolean) value);
        } else if (value instanceof HippyMap) {
          b.putBundle(key, toBundle((HippyMap) value));
        } else if (value instanceof HippyArray) {
          throw new UnsupportedOperationException("Arrays aren't supported yet.");
        } else {
          throw new IllegalArgumentException("Could not convert object with key: " + key + ".");
        }
      }
    }
    return b;
  }

  private static void stringFormat(String value, StringBuilder builder) {
    builder.append("\"");
    for (int i = 0, length = value.length(); i < length; i++) {
      char c = value.charAt(i);

      switch (c) {
        case '"':
        case '\\':
        case '/': {
          builder.append('\\').append(c);
          break;
        }
        case '\t': {
          builder.append("\\t");
          break;
        }
        case '\b': {
          builder.append("\\b");
          break;
        }
        case '\n': {
          builder.append("\\n");
          break;
        }
        case '\r': {
          builder.append("\\r");
          break;
        }
        case '\f': {
          builder.append("\\f");
          break;
        }
        default: {
          if (c <= 0x1F) {
            builder.append(String.format("\\u%04x", (int) c));
          } else {
            builder.append(c);
          }
          break;
        }
      }
    }
    builder.append("\"");
  }

  private static boolean isSupportedObject(Class clazz) {
    if (clazz == Boolean.class
      || clazz == Integer.class
      || clazz == Double.class
      || clazz == Float.class
      || clazz == Long.class
      || clazz == String.class
      || clazz == HippyArray.class
      || clazz == HippyMap.class
      || clazz == ArrayList.class
      || clazz == HashMap.class
      || clazz == Promise.class
      || clazz.getAnnotation(HippyTurboObj.class) != null) {
      return true;
    }
    return false;
  }

  public static String getSupportSignature(Class clazz) {
    if (clazz == boolean.class) {
      return "Z";
    }

    if (clazz == double.class) {
      return "D";
    }

    if (clazz == int.class) {
      return "I";
    }

    if (clazz == float.class) {
      return "F";
    }

    if (clazz == long.class) {
      return "J";
    }

    if (clazz == void.class) {
      return "V";
    }

    if (isSupportedObject(clazz)) {
      return "L" + clazz.getCanonicalName().replace(".", "/") + ";";
    }

    LogUtils.e(TAG, "getSupportSignature null :" + clazz.getCanonicalName());
    return "Lcom/invalid;";
  }

  public static String getMethodsSignature(Object obj) {
    LogUtils.d(TAG, "enter getMethodsSignature");

    if (obj == null) {
      return null;
    }

    String ret;
    Class clazz = obj.getClass();
    if (sMethodSigMap.containsKey(clazz)) {
      ret = sMethodSigMap.get(clazz);
      LogUtils.d(TAG, "exit getMethodsSignature from cache= " + ret);
      return ret;
    }

    Method[] methods = clazz.getMethods();
    if (methods == null || methods.length == 0) {
      return null;
    }
    HashMap<String, String> resultMap = new HashMap<>();
    for (int i = 0; i < methods.length; i++) {
      HippyTurboProp hippyTurboProp = methods[i].getAnnotation(HippyTurboProp.class);
      HippyMethod hippyMethod = methods[i].getAnnotation(HippyMethod.class);
      if (!canPropExpose(hippyTurboProp, hippyMethod)) {
        continue;
      }
      String sig = buildSignature(methods[i]);
      resultMap.put(methods[i].getName(), sig);
    }
    if (resultMap.size() == 0) {
      ret = null;
    } else {
      ret = resultMap.toString();
    }
    sMethodSigMap.put(clazz, ret);
    LogUtils.d(TAG, "exit getMethodsSignature=" + ret);
    return ret;
  }

  private static String buildSignature(Method method) {
    Class[] paramTypes = method.getParameterTypes();
    if (paramTypes == null) {
      return null;
    }

    int length = paramTypes.length;

    StringBuilder sb = new StringBuilder("(");
    try {
      for (int i = 0; i < length; i++) {
        sb.append(getSupportSignature(paramTypes[i]));
      }
      sb.append(")");
      sb.append(getSupportSignature(method.getReturnType()));
    } catch (Exception e) {
      sb = new StringBuilder();
    }
    String result = sb.toString();
    LogUtils.d("buildSignature", "method " + method.getName() + " sig " + result);
    return result;
  }

  private static boolean canPropExpose(HippyTurboProp hippyTurboProp, HippyMethod hippyMethod) {
    return (hippyTurboProp != null && hippyTurboProp.expose())
      || (hippyMethod != null && hippyMethod.isSync());
  }
}
