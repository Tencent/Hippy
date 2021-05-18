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

import com.tencent.mtt.hippy.runtime.builtins.JSSharedArrayBuffer;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;

import org.json.JSONException;
import org.json.JSONObject;

@SuppressWarnings({"unused"})
public class WasmMemory extends JSValue {
  private final JSSharedArrayBuffer buffer;
  private final long maximumPages;

  public WasmMemory(long maximumPages, JSSharedArrayBuffer buffer) {
    super();
    this.buffer = buffer;
    this.maximumPages = maximumPages;
  }

  public JSSharedArrayBuffer getMemory() {
    return buffer;
  }

  public long getMaximumPages() {
    return maximumPages;
  }

  @Override
  public Object dump() throws JSONException {
    JSONObject json = new JSONObject();
    json.put("maximumPages", maximumPages);
    json.put("memory", buffer.dump());
    return json;
  }
}
