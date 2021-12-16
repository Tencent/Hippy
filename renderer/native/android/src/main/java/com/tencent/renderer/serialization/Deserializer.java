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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.DESERIALIZE_DATA_ERR;
import static com.tencent.renderer.NativeRenderer.TAG;

import com.tencent.mtt.hippy.serialization.exception.DataCloneOutOfRangeException;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.SerializationTag;
import com.tencent.mtt.hippy.serialization.StringLocation;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.string.StringTable;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRenderException;
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
    protected HashMap readJSObject() {
        HashMap<String, Object> map = new HashMap<>();
        assignId(map);
        int read = readObjectProperties(map);
        int expected = (int) reader.getVarint();
        if (read != expected) {
            throw new NativeRenderException(DESERIALIZE_DATA_ERR,
                    "readJSObject: unexpected number of properties");
        }
        return map;
    }

    /**
     * dense array from dom value not support array properties, but should read value until
     * END_DENSE_JS_ARRAY, otherwise will get unexpected length.
     */
    private int readArrayProperties() {
        final StringLocation keyLocation = StringLocation.DENSE_ARRAY_KEY;
        final StringLocation valueLocation = StringLocation.DENSE_ARRAY_ITEM;

        SerializationTag tag;
        int count = 0;
        while ((tag = readTag()) != SerializationTag.END_DENSE_JS_ARRAY) {
            count++;
            Object key = readValue(tag, keyLocation, null);
            Object value = readValue(valueLocation, key);
            LogUtils.d(TAG, "readArrayProperties: key" + key + ", value=" + value);
        }
        return count;
    }

    private int readObjectProperties(HashMap<String, Object> map) {
        final StringLocation keyLocation = StringLocation.OBJECT_KEY;
        final StringLocation valueLocation = StringLocation.OBJECT_VALUE;

        SerializationTag tag;
        int count = 0;
        while ((tag = readTag()) != SerializationTag.END_JS_OBJECT) {
            count++;
            Object key = readValue(tag, keyLocation, null);
            Object value = readValue(valueLocation, key);
            if (key instanceof String || key instanceof Integer) {
                map.put(key.toString(), value);
            } else {
                throw new NativeRenderException(DESERIALIZE_DATA_ERR,
                        "readObjectProperties: Object key is not of String nor Integer type");
            }
        }
        return count;
    }

    @Override
    protected HashMap readJSMap() {
        HashMap<Object, Object> map = new HashMap<>();
        assignId(map);
        SerializationTag tag;
        int read = 0;
        while ((tag = readTag()) != SerializationTag.END_JS_MAP) {
            read++;
            Object key = readValue(tag, StringLocation.MAP_KEY, null);
            Object value = readValue(StringLocation.MAP_VALUE, key);
            map.put(key, value);
        }
        int expected = (int) reader.getVarint();
        if (2 * read != expected) {
            throw new NativeRenderException(DESERIALIZE_DATA_ERR,
                    "readJSMap: unexpected number of entries");
        }
        return map;
    }

    @Override
    protected ArrayList readDenseArray() {
        int totalLength = (int) reader.getVarint();
        if (totalLength < 0) {
            throw new DataCloneOutOfRangeException(totalLength);
        }
        ArrayList array = new ArrayList(totalLength);
        assignId(array);
        for (int i = 0; i < totalLength; i++) {
            SerializationTag tag = readTag();
            if (tag != SerializationTag.THE_HOLE) {
                array.add(readValue(tag, StringLocation.DENSE_ARRAY_ITEM, i));
            }
        }

        int propsLength = readArrayProperties();
        int expected = (int) reader.getVarint();
        if (propsLength != expected) {
            throw new NativeRenderException(DESERIALIZE_DATA_ERR,
                    "readDenseArray: unexpected number of properties");
        }
        expected = (int) reader.getVarint();
        if (totalLength != expected) {
            throw new NativeRenderException(DESERIALIZE_DATA_ERR,
                    "readDenseArray: length ambiguity");
        }
        return array;
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
