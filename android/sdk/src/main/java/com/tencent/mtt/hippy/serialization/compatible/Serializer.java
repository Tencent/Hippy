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
package com.tencent.mtt.hippy.serialization.compatible;

import com.tencent.mtt.hippy.common.ConstantValue;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.serialization.PrimitiveValueSerializer;
import com.tencent.mtt.hippy.serialization.SerializationTag;
import com.tencent.mtt.hippy.serialization.memory.buffer.Allocator;

import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;

/**
 * Implementation of {@code v8::(internal::)ValueSerializer}.
 */
@SuppressWarnings("deprecation")
public class Serializer extends PrimitiveValueSerializer {
  /** Maps a transferred object to its transfer ID. */
  private final Map<Object, Integer> transferMap = new IdentityHashMap<>();

  public Serializer() {
    super(null);
  }

  public Serializer(Allocator<ByteBuffer> allocator) {
    super(allocator);
  }

  @Override
  protected Object getUndefined() {
    return ConstantValue.Undefined;
  }

  @Override
  protected Object getNull() {
    return ConstantValue.Null;
  }

  @Override
  protected Object getHole() {
    return ConstantValue.Hole;
  }

  @Override
  protected void writeCustomObjectValue(Object object) {
    if (object instanceof HippyArray) {
      writeJSArray((HippyArray) object);
    } else if (object instanceof HippyMap) {
      writeJSObject((HippyMap) object);
    } else {
      writeJSObject(new HippyMap());
    }
  }

  private void writeJSObject(HippyMap value) {
    writeTag(SerializationTag.BEGIN_JS_OBJECT);
    List<String> names = new ArrayList<>(value.keySet());
    writeJSObjectProperties(value, names);
    writeTag(SerializationTag.END_JS_OBJECT);
    writeVarint(names.size());
  }

  private void writeJSObjectProperties(HippyMap object, List<String> keys) {
    for (String key : keys) {
      writeString(key);
      Object value = object.get(key);
      writeValue(value);
    }
  }

  private void writeJSArray(HippyArray value) {
    long length = value.size();
    writeTag(SerializationTag.BEGIN_DENSE_JS_ARRAY);
    writeVarint(length);
    for (int i = 0; i < value.size(); i++) {
      writeValue(value.get(i));
    }
    writeTag(SerializationTag.END_DENSE_JS_ARRAY);
    writeVarint(0);
    writeVarint(length);
  }
}
