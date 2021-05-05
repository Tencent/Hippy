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

import java.util.HashMap;
import java.util.Map;

@SuppressWarnings({"unused"})
public class JSMap extends JSValue {
  private final HashMap<Object, Object> internalMap;
  public JSMap() {
    internalMap = new HashMap<>();
  }

  public HashMap<Object, Object> getInternalMap() {
    return internalMap;
  }

  @NonNull
  @Override
  public JSMap clone() throws CloneNotSupportedException {
    JSMap clonedObject = (JSMap) super.clone();
    HashMap<Object, Object> destMap = clonedObject.getInternalMap();
    for (Map.Entry<Object, Object> entry : internalMap.entrySet()) {
      destMap.put(entry.getKey(), JSValue.clone(entry.getValue()));
    }
    return clonedObject;
  }

  @Override
  public Object dump() throws JSONException {
    JSONObject json = new JSONObject();
    for (Map.Entry<Object, Object> entry : internalMap.entrySet()) {
      json.put(entry.getKey().toString(), JSValue.dump(entry.getValue()));
    }
    return json;
  }
}
