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
package com.tencent.renderer.serialization;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.serialization.exception.DataCloneOutOfRangeException;
import com.tencent.mtt.hippy.exception.UnexpectedException;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.SerializationTag;
import com.tencent.mtt.hippy.serialization.StringLocation;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.string.StringTable;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * Implementation of {@code v8::(internal::)ValueDeserializer}.
 */
@SuppressWarnings("unused")
public class Deserializer extends PrimitiveValueDeserializer {

  public Deserializer(BinaryReader reader) {
    this(reader, null);
  }

  public Deserializer(BinaryReader reader, StringTable stringTable) {
    super(reader, stringTable);
  }

  @Override
  protected Object getHole() {
    return null;
  }

  @Override
  protected Object getUndefined() {
    return null;
  }

  @Override
  protected Object getNull() {
    return null;
  }

  @Override
  protected Object readJSBoolean(boolean value) {
    return assignId(Boolean.valueOf(value));
  }

  @Override
  protected Number readJSNumber() {
    double value = reader.getDouble();
    return assignId(new Double(value));
  }

  @Override
  protected BigInteger readJSBigInt() {
    return assignId(readBigInt());
  }

  @Override
  protected String readJSString(StringLocation location, Object relatedKey) {
    return assignId(readString(location, relatedKey));
  }

  @Override
  protected HippyMap readJSObject() {
    //HashMap<String, Object> map = new HashMap<>();
    HippyMap map = new HippyMap();
    assignId(map);
    int read = readProperties(map);
    int expected = (int)reader.getVarint();
    if (read != expected) {
      throw new UnexpectedException("unexpected number of properties");
    }
    return map;
  }

  private int readProperties(HippyMap map) {
    final StringLocation keyLocation = StringLocation.OBJECT_KEY;
    final StringLocation valueLocation = StringLocation.OBJECT_VALUE;

    SerializationTag tag;
    int count = 0;
    while ((tag = readTag()) != SerializationTag.END_JS_OBJECT) {
      count++;
      Object key = readValue(tag, keyLocation, null);
      if (key instanceof String) {
        Object value = readValue(valueLocation, key);
        map.pushObject((String)key, value);
      } else {
        throw new AssertionError("Object key is not of String");
      }
    }
    return count;
  }

  @Override
  protected HippyMap readJSMap() {
    //HashMap<Object, Object> map = new HashMap<>();
    HippyMap map = new HippyMap();
    assignId(map);
    SerializationTag tag;
    int read = 0;
    while ((tag = readTag()) != SerializationTag.END_JS_MAP) {
      read++;
      Object key = readValue(tag, StringLocation.MAP_KEY, null);
      Object value = readValue(StringLocation.MAP_VALUE, key);
      if (key == null) {
        map.pushObject(null, value);
      } else {
        map.pushObject(key.toString(), value);
      }
    }
    int expected = (int)reader.getVarint();
    if (2 * read != expected) {
      throw new UnexpectedException("unexpected number of entries");
    }
    return map;
  }

  @Override
  protected HippyArray readDenseArray() {
    int length = (int)reader.getVarint();
    if (length < 0) {
      throw new DataCloneOutOfRangeException(length);
    }
    //ArrayList array = new ArrayList(length);
    HippyArray array = new HippyArray();
    assignId(array);
    for (int i = 0; i < length; i++) {
      SerializationTag tag = readTag();
      Object object = readValue(tag, StringLocation.DENSE_ARRAY_ITEM, i);
      array.setObject(i, object);
    }

    int read = (int)reader.getVarint();
    if (length != read) {
      throw new AssertionError("length ambiguity");
    }
    return array;
  }

  @Override
  protected Object readJSRegExp() {
    return null;
  }

  @Override
  protected Object readJSArrayBuffer() {
    return null;
  }

  @Override
  protected Object readJSSet() {
    return null;
  }

  @Override
  protected Object readSparseArray() {
    return null;
  }

  @Override
  protected Object readJSError() {
    return null;
  }

  @Override
  protected Object readHostObject() {
    return null;
  }

  @Override
  protected Object readTransferredJSArrayBuffer() {
    return null;
  }

  @Override
  protected Object readSharedArrayBuffer() {
    return null;
  }

  @Override
  protected Object readTransferredWasmModule() {
    return null;
  }

  @Override
  protected Object readTransferredWasmMemory() {
    return null;
  }
}
