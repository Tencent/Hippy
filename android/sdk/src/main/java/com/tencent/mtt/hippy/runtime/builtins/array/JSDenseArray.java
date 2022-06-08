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
package com.tencent.mtt.hippy.runtime.builtins.array;

import androidx.annotation.NonNull;
import android.util.Pair;

import com.tencent.mtt.hippy.runtime.builtins.JSValue;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.AbstractCollection;
import java.util.AbstractSet;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Set;

@SuppressWarnings({"unused"})
public class JSDenseArray extends JSAbstractArray {

  private Set<String> keySet;
  private Collection<Object> valueCollection;
  private List<Object> readonlyList;
  private Set<Pair<String, Object>> entrySet;
  private List<Object> elements;

  public JSDenseArray() {
    this(10);
  }

  public JSDenseArray(int initialSize) {
    elements = new ArrayList<>(initialSize);
  }

  // region op
  @Override
  public Object get(int index) {
    return elements.get(index);
  }

  public static Object get(JSDenseArray array, int index) {
    return array.elements.get(index);
  }

  @Override
  public void push(Object value) {
    elements.add(value);
  }

  public static void push(JSDenseArray array, Object value) {
    array.elements.add(value);
  }

  @Override
  public Object set(int index, Object value) {
    return elements.set(index, value);
  }

  public static Object set(JSDenseArray array, int index, Object value) {
    return array.elements.set(index, value);
  }

  @Override
  public Object delete(int index) {
    return elements.remove(index);
  }

  public static Object delete(JSDenseArray array, int index) {
    return array.elements.remove(index);
  }

  @Override
  public int size() {
    return elements.size();
  }

  public static int size(JSDenseArray array) {
    return array.elements.size();
  }

  public void add(int index, Object value) {
    elements.add(index, value);
  }

  public static void add(JSDenseArray array, int index, Object value) {
    array.elements.add(index, value);
  }

  private int fieldCount() {
    return size() + super.size();
  }
  // endregion

  // region foreach
  @Override
  public Iterator<Object> iterator() {
    return elements.iterator();
  }
  // endregion

  // region keys
  @Override
  public Set<String> keys() {
    Set<String> ks;
    return (ks = keySet) == null ? (keySet = new KeySet()) : ks;
  }

  private final class KeyIterator implements Iterator<String> {

    private int currentIndex = 0;
    private final Iterator<String> objectIterator;

    KeyIterator() {
      objectIterator = JSDenseArray.super.keys().iterator();
    }

    @Override
    public final boolean hasNext() {
      return currentIndex < size() || objectIterator.hasNext();
    }

    @Override
    public final String next() {
      if (currentIndex < size()) {
        return String.valueOf(currentIndex++);
      }
      return objectIterator.next();
    }
  }

  private final class KeySet extends AbstractSet<String> {

    @Override
    public final Iterator<String> iterator() {
      return new KeyIterator();
    }

    @Override
    public final int size() {
      return fieldCount();
    }
  }
  // endregion

  // region values
  @Override
  public Collection<Object> values() {
    Collection<Object> vc;
    return (vc = valueCollection) == null ? (valueCollection = new ValueCollection()) : vc;
  }

  private final class ValueIterator implements Iterator<Object> {

    private final Iterator<Object> objectIterator;
    private final Iterator<Object> elementIterator;

    ValueIterator() {
      objectIterator = JSDenseArray.super.values().iterator();
      elementIterator = elements.listIterator();
    }

    @Override
    public final boolean hasNext() {
      return elementIterator.hasNext() || (objectIterator != null && objectIterator.hasNext());
    }

    @Override
    public final Object next() {
      if (elementIterator.hasNext()) {
        return elementIterator.next();
      } else if (objectIterator != null) {
        return objectIterator.next();
      }
      throw new NoSuchElementException();
    }
  }

  private final class ValueCollection extends AbstractCollection<Object> {

    @Override
    public final Iterator<Object> iterator() {
      return new ValueIterator();
    }

    @Override
    public final int size() {
      return fieldCount();
    }
  }
  // endregion

  // region entries
  @Override
  public Set<Pair<String, Object>> entries() {
    Set<Pair<String, Object>> es;
    return (es = entrySet) == null ? (entrySet = new EntrySet()) : es;
  }

  private final class EntryIterator implements Iterator<Pair<String, Object>> {

    private final Iterator<Pair<String, Object>> objectIterator;
    private int currentIndex = 0;

    EntryIterator() {
      objectIterator = JSDenseArray.super.entries().iterator();
    }

    @Override
    public boolean hasNext() {
      return currentIndex < size() || objectIterator.hasNext();
    }

    @Override
    public Pair<String, Object> next() {
      if (currentIndex < size()) {
        Pair<String, Object> pair = new Pair<>(String.valueOf(currentIndex), get(currentIndex));
        currentIndex++;
        return pair;
      }
      return objectIterator.next();
    }
  }

  private final class EntrySet extends AbstractSet<Pair<String, Object>> {

    @Override
    public Iterator<Pair<String, Object>> iterator() {
      return new EntryIterator();
    }

    @Override
    public int size() {
      return fieldCount();
    }
  }
  // endregion

  // region items
  public List<Object> items() {
    List<Object> v;
    return (v = readonlyList) == null ? (readonlyList = Collections.unmodifiableList(elements)) : v;
  }
  // endregion

  // region json
  public static JSDenseArray load(JSONArray json) throws JSONException {
    JSDenseArray array = new JSDenseArray(json.length());
    for (int i = 0; i < json.length(); i++) {
      array.push(JSValue.load(json.get(i)));
    }
    return array;
  }

  @Override
  public Object dump() throws JSONException {
    JSONArray json = new JSONArray();
    for (Object o : elements) {
      json.put(JSValue.dump(o));
    }
    return json;
  }
  // endregion

  @NonNull
  @Override
  public JSDenseArray clone() throws CloneNotSupportedException {
    JSDenseArray clonedObject = (JSDenseArray) super.clone();
    List<Object> destElements = new ArrayList<>(elements.size());
    for (Object o : elements) {
      destElements.add(JSValue.clone(o));
    }
    clonedObject.elements = destElements;
    return clonedObject;
  }
}
