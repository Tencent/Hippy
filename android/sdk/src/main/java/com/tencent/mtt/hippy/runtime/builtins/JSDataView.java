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

import android.support.annotation.NonNull;

import org.json.JSONException;
import org.json.JSONObject;

@SuppressWarnings({"unused"})
public class JSDataView<T extends JSArrayBuffer> extends JSObject {
  public enum DataViewKind {
    INT8_ARRAY, // kInt8Array
    UINT8_ARRAY, // kUint8Array
    UINT8_CLAMPED_ARRAY, // kUint8ClampedArray
    INT16_ARRAY, // kInt16Array
    UINT16_ARRAY, // kUint16Array
    INT32_ARRAY, // kInt32Array
    UINT32_ARRAY, // kUint32Array
    FLOAT32_ARRAY, // kFloat32Array
    FLOAT64_ARRAY, // kFloat64Array
    DATA_VIEW // kDataView
  }

  private T bufferObject;
  private DataViewKind kind;
  private final String BYTE_OFFSET = "byteOffset";
  private final String BYTE_LENGTH = "byteLength";

  public JSDataView(T bufferObject, DataViewKind kind, int byteOffset, int byteLength) {
    this.bufferObject = bufferObject;
    this.kind = kind;
    set(BYTE_OFFSET, byteOffset);
    set(BYTE_LENGTH, byteLength);
  }

  public DataViewKind getKind() {
    return kind;
  }

  public T getBufferObject() {
    return bufferObject;
  }

  public int getByteOffset() {
    Object value = get(BYTE_OFFSET);
    assert(value != null);
    return (int) value;
  }

  public int getByteLength() {
    Object value = get(BYTE_LENGTH);
    assert(value != null);
    return (int) value;
  }

  @NonNull
  @Override
  @SuppressWarnings("unchecked")
  public JSDataView<T> clone() throws CloneNotSupportedException {
    JSDataView<T> dest = (JSDataView<T>) super.clone();
    dest.kind = kind;
    dest.bufferObject = (T) bufferObject.clone();
    return dest;
  }

  @Override
  public Object dump() throws JSONException {
    JSONObject json = (JSONObject) super.dump();
    json.put("kind", kind);
    json.put("buffer", JSValue.dump(bufferObject));
    return json;
  }
}
