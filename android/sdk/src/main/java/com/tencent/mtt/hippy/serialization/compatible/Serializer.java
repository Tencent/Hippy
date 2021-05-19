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
import com.tencent.mtt.hippy.serialization.nio.writer.BinaryWriter;

import java.util.Set;

/**
 * Implementation of {@code v8::(internal::)ValueSerializer}.
 */
@SuppressWarnings({"deprecation", "unused"})
public class Serializer extends PrimitiveValueSerializer {

  public Serializer() {
    super(null);
  }

  public Serializer(BinaryWriter writer) {
    super(writer);
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
  public boolean writeValue(Object object) {
    if (super.writeValue(object)) {
      return true;
    }
    if (object instanceof HippyArray) {
      assignId(object);
      writeJSArray((HippyArray) object);
    } else if (object instanceof HippyMap) {
      assignId(object);
      writeJSObject((HippyMap) object);
    } else {
      return false;
    }
    return true;
  }

  private void writeJSObject(HippyMap value) {
    writeTag(SerializationTag.BEGIN_JS_OBJECT);
    Set<String> keys = value.keySet();
    for (String key : keys) {
      if (key == Null) {
        writeString("null");
      } else {
        writeString(key);
      }
      writeValue(value.get(key));
    }
    writeTag(SerializationTag.END_JS_OBJECT);
    writer.putVarint(keys.size());
  }

  private void writeJSArray(HippyArray value) {
    long length = value.size();
    writeTag(SerializationTag.BEGIN_DENSE_JS_ARRAY);
    writer.putVarint(length);
    for (int i = 0; i < value.size(); i++) {
      writeValue(value.get(i));
    }
    writeTag(SerializationTag.END_DENSE_JS_ARRAY);
    writer.putVarint(0);
    writer.putVarint(length);
  }
}
