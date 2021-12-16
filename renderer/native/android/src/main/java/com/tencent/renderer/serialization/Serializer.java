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
import com.tencent.mtt.hippy.exception.UnreachableCodeException;
import com.tencent.mtt.hippy.serialization.PrimitiveValueSerializer;
import com.tencent.mtt.hippy.serialization.SerializationTag;
import com.tencent.mtt.hippy.serialization.nio.writer.BinaryWriter;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@SuppressWarnings({"unused"})
public class Serializer extends PrimitiveValueSerializer {

    public Serializer() {
        this(null);
    }

    public Serializer(BinaryWriter writer) {
        super(writer);
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
    public boolean writeValue(Object object) {
        if (object instanceof HippyMap) {
            HashMap<String, Object> map = ((HippyMap) object).getInternalMap();
            writeValue(map);
            return true;
        }

        if (object instanceof HippyArray) {
            ArrayList array = ((HippyArray) object).getInternalArray();
            writeValue(array);
            return true;
        }

        if (super.writeValue(object)) {
            return true;
        }

        if (object instanceof Map) {
            assignId(object);
            for (Object key : ((Map) object).keySet()) {
                if (key instanceof String) {
                    writeJSObject((Map) object);
                } else {
                    writeJSMap((Map) object);
                }
                break;
            }
        } else if (object instanceof Collection) {
            assignId(object);
            writeCollection((Collection) object);
        } else {
            throw new UnreachableCodeException();
        }

        return true;
    }

    private void writeJSMap(Map map) {
        writeTag(SerializationTag.BEGIN_JS_MAP);
        int count = 0;
        Iterator iterator = map.keySet().iterator();
        while (iterator.hasNext()) {
            count++;
            Object key = iterator.next();
            writeValue(key);
            writeValue(map.get(key));
        }
        writeTag(SerializationTag.END_JS_MAP);
        writer.putVarint(2 * count);
    }

    private void writeJSObject(Map map) {
        writeTag(SerializationTag.BEGIN_JS_OBJECT);
        Iterator iterator = map.keySet().iterator();
        while (iterator.hasNext()) {
            Object key = iterator.next();
            if (key == null) {
                writeString("null");
            } else {
                writeString(key.toString());
            }

            writeValue(map.get(key));
        }
        writeTag(SerializationTag.END_JS_OBJECT);
        writer.putVarint(map.size());
    }

    private void writeCollection(Collection collection) {
        writeTag(SerializationTag.BEGIN_DENSE_JS_ARRAY);
        writer.putVarint(collection.size());
        Iterator iterator = collection.iterator();
        while (iterator.hasNext()) {
            Object value = iterator.next();
            writeValue(value);
        }
        writeTag(SerializationTag.END_DENSE_JS_ARRAY);
    }

}
