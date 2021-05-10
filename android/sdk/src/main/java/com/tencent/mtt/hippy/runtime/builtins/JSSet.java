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

import org.json.JSONArray;
import org.json.JSONException;

import java.util.HashSet;

@SuppressWarnings({"unused"})
public class JSSet extends JSValue {
  private final HashSet<Object> internalSet;

  public JSSet() {
    this.internalSet = new HashSet<>();
  }

  public HashSet<Object> getInternalSet() {
    return internalSet;
  }

  @NonNull
  @Override
  public JSSet clone() throws CloneNotSupportedException {
    JSSet clonedObject = (JSSet) super.clone();
    HashSet<Object> destSet = clonedObject.getInternalSet();
    for (Object o : internalSet) {
      destSet.add(JSValue.clone(o));
    }
    return clonedObject;
  }

  @Override
  public Object dump() throws JSONException {
    JSONArray json = new JSONArray();
    for (Object o : internalSet) {
      json.put(JSValue.dump(o));
    }
    return json;
  }
}
