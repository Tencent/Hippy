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
import android.util.Pair;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.AbstractSet;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

@SuppressWarnings({"unused"})
public class JSObject extends JSValue {

  private final HashMap<String, Object> props;
  private Set<Pair<String, Object>> entrySet;

  public JSObject() {
    this.props = new HashMap<>();
  }

  // region op
  public Object get(String key) {
    return props.get(key);
  }

  public static Object get(JSObject object, String key) {
    return object.props.get(key);
  }

  public Object set(String key, Object value) {
    return props.put(key, value);
  }

  public static Object set(JSObject object, String key, Object value) {
    return object.props.put(key, value);
  }

  public boolean has(String key) {
    return props.containsKey(key);
  }

  public static boolean has(JSObject object, String key) {
    return object.props.containsKey(key);
  }

  public int size() {
    return props.size();
  }

  public static int size(JSObject object) {
    return object.props.size();
  }

  public Object delete(String key) {
    return props.remove(key);
  }

  public static Object delete(JSObject object, String key) {
    return object.props.remove(key);
  }
  // endregion

  // region keys
  public Set<String> keys() {
    return props.keySet();
  }

  public static Set<String> keys(JSObject object) {
    return object.props.keySet();
  }
  // endregion

  // region values
  public Collection<Object> values() {
    return props.values();
  }

  public static Collection<Object> values(JSObject object) {
    return object.props.values();
  }
  // endregion

  // region entries
  public Set<Pair<String, Object>> entries() {
    Set<Pair<String, Object>> es;
    return (es = entrySet) == null ? (entrySet = new EntrySet(this)) : es;
  }

  public static Set<Pair<String, Object>> entries(JSObject object) {
    return new EntrySet(object);
  }

  private final static class EntryIterator implements Iterator<Pair<String, Object>> {

    private final Iterator<Map.Entry<String, Object>> iterator;

    EntryIterator(Iterator<Map.Entry<String, Object>> iterator) {
      this.iterator = iterator;
    }

    @Override
    public boolean hasNext() {
      return iterator.hasNext();
    }

    @Override
    public Pair<String, Object> next() {
      Map.Entry<String, Object> next = iterator.next();
      return new Pair<>(next.getKey(), next.getValue());
    }
  }

  private final static class EntrySet extends AbstractSet<Pair<String, Object>> {

    private final JSObject object;

    EntrySet(JSObject object) {
      this.object = object;
    }

    @Override
    public Iterator<Pair<String, Object>> iterator() {
      return new EntryIterator(object.props.entrySet().iterator());
    }

    @Override
    public int size() {
      return object.size();
    }
  }
  // endregion

  // region json
  public static JSObject load(JSONObject json) throws JSONException {
    JSObject object = new JSObject();
    Iterator<String> it = json.keys();
    while (it.hasNext()) {
      String key = it.next();
      object.set(key, JSValue.load(json.get(key)));
    }
    return object;
  }

  @Override
  public Object dump() throws JSONException {
    JSONObject json = new JSONObject();
    for (Map.Entry<String, Object> entry : props.entrySet()) {
      json.put(entry.getKey(), JSValue.dump(entry.getValue()));
    }
    return json;
  }
  // endregion

  @SuppressWarnings("NullableProblems")
  @NonNull
  @Override
  public JSObject clone() throws CloneNotSupportedException {
    JSObject clonedObject = (JSObject) super.clone();
    for (Pair<String, Object> entry : entries()) {
      clonedObject.set(entry.first, JSValue.clone(entry.second));
    }
    return clonedObject;
  }
}
