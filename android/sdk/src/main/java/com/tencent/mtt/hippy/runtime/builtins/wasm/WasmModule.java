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
package com.tencent.mtt.hippy.runtime.builtins.wasm;

import com.tencent.mtt.hippy.runtime.builtins.JSValue;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

@SuppressWarnings({"unused"})
public class WasmModule extends JSValue {
  static final short MAX_DUMP_LENGTH = 1024;

  private final byte[] buffer;
  private final String sourceUrl;
  private final byte wireBytes;

  public WasmModule(byte[] buffer, String sourceUrl, byte wireBytes) {
    super();
    this.buffer = buffer;
    this.sourceUrl = sourceUrl;
    this.wireBytes = wireBytes;
  }

  public byte[] getBuffer() {
    return buffer;
  }

  public byte getWireBytes() {
    return wireBytes;
  }

  public String getSourceUrl() {
    return sourceUrl;
  }

  @Override
  public Object dump() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("wireBytes", wireBytes);
    json.put("sourceUrl", sourceUrl);
    JSONArray bufferView = new JSONArray();
    for (short i = 0; i < buffer.length && i < MAX_DUMP_LENGTH; i++) {
      bufferView.put(buffer[i]);
    }
    json.put("buffer", bufferView);
    return json;
  }
}
