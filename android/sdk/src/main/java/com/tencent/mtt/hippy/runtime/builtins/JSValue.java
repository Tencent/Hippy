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
package com.tencent.mtt.hippy.runtime.builtins;

import com.tencent.mtt.hippy.runtime.builtins.array.JSAbstractArray;
import com.tencent.mtt.hippy.runtime.builtins.array.JSDenseArray;
import com.tencent.mtt.hippy.runtime.builtins.array.JSSparseArray;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSBigintObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSBooleanObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSNumberObject;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSPrimitiveWrapper;
import com.tencent.mtt.hippy.runtime.builtins.objects.JSStringObject;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmMemory;
import com.tencent.mtt.hippy.runtime.builtins.wasm.WasmModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public abstract class JSValue implements Cloneable, JSONDump {
  // region is-op
  public static boolean is(Object value) {
    return value instanceof JSValue;
  }

  public boolean isOddball() {
    return this instanceof JSOddball;
  }

  public boolean isUndefined() {
    return isOddball() && ((JSOddball) this).isUndefined();
  }

  public boolean isNull() {
    return isOddball() && ((JSOddball) this).isNull();
  }

  public boolean isHole() {
    return isOddball() && ((JSOddball) this).isHole();
  }

  public boolean isArray() {
    return this instanceof JSAbstractArray;
  }

  public boolean isDenseArray() {
    return this instanceof JSDenseArray;
  }

  public boolean isSparseArray() {
    return this instanceof JSSparseArray;
  }

  public boolean isObject() {
    return this instanceof JSObject;
  }

  public boolean isError() {
    return this instanceof JSError;
  }

  public boolean isRegExp() {
    return this instanceof JSRegExp;
  }

  public boolean isMap() {
    return this instanceof JSMap;
  }

  public boolean isSet() {
    return this instanceof JSSet;
  }

  public boolean isDataView() {
    return this instanceof JSDataView;
  }

  public boolean isSharedArrayBuffer() {
    return this instanceof JSSharedArrayBuffer;
  }

  public boolean isArrayBuffer() {
    return this instanceof JSArrayBuffer;
  }

  public boolean isPrimitiveObject() {
    return this instanceof JSPrimitiveWrapper;
  }

  public boolean isBooleanObject() {
    return this instanceof JSBooleanObject;
  }

  public boolean isTrueObject() {
    return isBooleanObject() && ((JSBooleanObject) this).isTrue();
  }

  public boolean isFalseObject() {
    return isBooleanObject() && ((JSBooleanObject) this).isFalse();
  }

  public boolean isStringObject() {
    return this instanceof JSStringObject;
  }

  public boolean isBigIntObject() {
    return this instanceof JSBigintObject;
  }

  public boolean isNumberObject() {
    return this instanceof JSNumberObject;
  }

  public boolean isWasmModule() {
    return this instanceof WasmModule;
  }

  public boolean isWasmMemory() {
    return this instanceof WasmMemory;
  }
  // endregion

  // region json
  @Override
  public abstract Object dump() throws JSONException;

  public static Object dump(Object value) throws JSONException {
    return value instanceof JSValue ? ((JSValue) value).dump() : value;
  }

  public static Object load(Object value) {
    if (value instanceof JSONObject) {
      return JSObject.load(value);
    } else if (value instanceof JSONArray) {
      return JSDenseArray.load(value);
    } else {
      return value;
    }
  }
  // endregion

  public static Object clone(Object value) throws CloneNotSupportedException {
    return value instanceof JSValue ? ((JSValue) value).clone() : value;
  }

  // region to-op
  public static String toString(Object value) {
    if (value instanceof JSValue && ((JSValue) value).isStringObject()) {
      value = ((JSStringObject) value).getValue();
    }
    return value == null ? null : value.toString();
  }

  public static boolean toBoolean(Object value) {
    if (value instanceof JSValue && ((JSValue) value).isBooleanObject()) {
      value = ((JSBooleanObject) value).getValue();
    }
    return value != null && (boolean) value;
  }

  public static Number toNumber(Object value) {
    if (value instanceof JSValue && ((JSValue) value).isNumberObject()) {
      value = ((JSNumberObject) value).getValue();
    }
    return value instanceof Number ? ((Number) value) : 0;
  }

  public static JSObject toObject(Object value) {
    return value instanceof JSObject ? (JSObject) value : null;
  }

  public static JSAbstractArray toArray(Object value) {
    return value instanceof JSAbstractArray ? (JSAbstractArray) value : null;
  }

  public static JSDenseArray toDenseArray(Object value) {
    return value instanceof JSDenseArray ? (JSDenseArray) value : null;
  }

  public static JSSparseArray toSparseArray(Object value) {
    return value instanceof JSSparseArray ? (JSSparseArray) value : null;
  }
  // endregion
}
