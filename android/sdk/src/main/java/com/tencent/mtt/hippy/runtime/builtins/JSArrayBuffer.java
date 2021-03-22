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

import org.json.JSONArray;
import org.json.JSONException;

import java.nio.ByteBuffer;

public class JSArrayBuffer extends JSValue {
  static final short MAX_DUMP_LENGTH = 1024;

  private ByteBuffer buffer;

  public static JSArrayBuffer allocateDirect(int capacity) {
    return new JSArrayBuffer(ByteBuffer.allocateDirect(capacity));
  }
  public JSArrayBuffer(ByteBuffer buffer) {
    this.buffer = buffer;
  }

  public ByteBuffer getBuffer() {
    return buffer;
  }

  @Override
  public JSArrayBuffer clone() throws CloneNotSupportedException {
    JSArrayBuffer clonedObject = (JSArrayBuffer) super.clone();
    clonedObject.buffer = buffer.duplicate();
    return clonedObject;
  }

  @Override
  public Object dump() throws JSONException {
    JSONArray json = new JSONArray();
    ByteBuffer dupBuffer = buffer.duplicate();
    for (short i = 0; i < dupBuffer.capacity() && i < MAX_DUMP_LENGTH; i++) {
      json.put(dupBuffer.get());
    }
    return json;
  }
}
