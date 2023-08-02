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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.DESERIALIZE_NOT_SUPPORTED_ERR;
import static com.tencent.renderer.NativeRenderException.ExceptionCode.DESERIALIZE_READ_LENGTH_ERR;

import com.tencent.mtt.hippy.exception.UnexpectedException;
import com.tencent.mtt.hippy.serialization.PrimitiveSerializationTag;
import com.tencent.mtt.hippy.serialization.exception.DataCloneOutOfRangeException;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.StringLocation;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.string.StringTable;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.NativeRenderException;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public class Deserializer extends PrimitiveValueDeserializer {

    public static final String TAG = "NativeRenderDeserializer";

    public Deserializer(BinaryReader reader) {
        this(reader, null);
    }

    public Deserializer(BinaryReader reader, StringTable stringTable) {
        super(reader, stringTable);
    }

    @Override
    protected int getSupportedVersion() {
        return -1;
    }

    @Override
    @SuppressWarnings("fallthrough")
    protected Object readValue(byte tag, StringLocation location, Object relatedKey) {
        Object object = super.readValue(tag, location, relatedKey);
        if (object != Nothing) {
            return object;
        }

        switch (tag) {
            case SerializationTag.TRUE_OBJECT:
                return readBooleanObject(true);
            case SerializationTag.FALSE_OBJECT:
                return readBooleanObject(false);
            case SerializationTag.NUMBER_OBJECT:
                return readNumberObject();
            case SerializationTag.BIG_INT_OBJECT:
                return readBigIntObject();
            case SerializationTag.STRING_OBJECT:
                return readStringObject(location, relatedKey);
            case SerializationTag.BEGIN_OBJECT:
                return readObject();
            case SerializationTag.BEGIN_MAP:
                return readMap();
            case SerializationTag.BEGIN_DENSE_ARRAY:
                return readDenseArray();
            case SerializationTag.BEGIN_SPARSE_JS_ARRAY:
                return readSparseArray();
            default:
                throw createUnsupportedTagException(tag);
        }
    }

    private Object readBooleanObject(boolean value) {
        return assignId(value);
    }

    private Number readNumberObject() {
        return assignId(reader.getDouble());
    }

    private BigInteger readBigIntObject() {
        return assignId(readBigInt());
    }

    private String readStringObject(StringLocation location, Object relatedKey) {
        return assignId(readString(location, relatedKey));
    }

    private Map<String, Object> readObject() {
        Map<String, Object> map = new HashMap<>();
        assignId(map);
        int read = readObjectProperties(map);
        int expected = (int) reader.getVarint();
        if (read != expected) {
            throw new NativeRenderException(DESERIALIZE_READ_LENGTH_ERR,
                    TAG + ": readObject: unexpected number of properties");
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

        byte tag;
        int count = 0;
        while ((tag = readTag()) != SerializationTag.END_DENSE_ARRAY) {
            count++;
            Object key = readValue(tag, keyLocation, null);
            Object value = readValue(valueLocation, key);
            LogUtils.d(TAG, "readArrayProperties: key" + key + ", value=" + value);
        }
        return count;
    }

    private int readObjectProperties(Map<String, Object> map) {
        final StringLocation keyLocation = StringLocation.OBJECT_KEY;
        final StringLocation valueLocation = StringLocation.OBJECT_VALUE;

        byte tag;
        int count = 0;
        while ((tag = readTag()) != SerializationTag.END_OBJECT) {
            count++;
            Object key = readValue(tag, keyLocation, null);
            Object value = readValue(valueLocation, key);
            if (key instanceof String || key instanceof Integer) {
                map.put(key.toString(), value);
            } else {
                throw new NativeRenderException(DESERIALIZE_READ_LENGTH_ERR,
                        TAG + ": readObjectProperties: Object key is not of String nor Integer type");
            }
        }
        return count;
    }

    private Map<Object, Object> readMap() {
        Map<Object, Object> map = new HashMap<>();
        assignId(map);
        byte tag;
        int read = 0;
        while ((tag = readTag()) != SerializationTag.END_MAP) {
            read++;
            Object key = readValue(tag, StringLocation.MAP_KEY, null);
            Object value = readValue(StringLocation.MAP_VALUE, key);
            map.put(key, value);
        }
        int expected = (int) reader.getVarint();
        if (2 * read != expected) {
            throw new NativeRenderException(DESERIALIZE_READ_LENGTH_ERR,
                    TAG + ": readMap: unexpected number of entries");
        }
        return map;
    }

    private List<Object> readDenseArray() {
        int totalLength = (int) reader.getVarint();
        if (totalLength < 0) {
            throw new DataCloneOutOfRangeException(totalLength);
        }
        List<Object> array = new ArrayList<>(totalLength);
        assignId(array);
        for (int i = 0; i < totalLength; i++) {
            byte tag = readTag();
            if (tag != PrimitiveSerializationTag.THE_HOLE) {
                array.add(readValue(tag, StringLocation.DENSE_ARRAY_ITEM, i));
            }
        }
        int propsLength = readArrayProperties();
        int expected = (int) reader.getVarint();
        if (propsLength != expected) {
            throw new NativeRenderException(DESERIALIZE_READ_LENGTH_ERR,
                    TAG + ": readDenseArray: unexpected number of properties");
        }
        expected = (int) reader.getVarint();
        if (totalLength != expected) {
            throw new NativeRenderException(DESERIALIZE_READ_LENGTH_ERR,
                    TAG + ": readDenseArray: length ambiguity");
        }
        return array;
    }


    /**
     * Reads Spare Array from buffer.
     *
     * <h2>Note</h2>
     * Sparse arrays will be serialized as an object-like manner. Normally, it should be representable
     * as {@link ArrayList}, but in order to be compatible with the previous serialization implement,
     * we use {@link ArrayList} to express sparse arrays. <br/> When a hole is encountered, null is
     * used to fill it.
     * @return array
     */
    private List<Object> readSparseArray() {
        long length = reader.getVarint();
        List<Object> array = new ArrayList<>();
        assignId(array);
        byte tag;
        int read = 0;
        while ((tag = readTag()) != SerializationTag.END_SPARSE_JS_ARRAY) {
            read++;
            Object key = readValue(tag, StringLocation.SPARSE_ARRAY_KEY, null);
            Object value = readValue(StringLocation.SPARSE_ARRAY_ITEM, key);
            int index = -1;
            if (key instanceof Number) {
                index = ((Number) key).intValue();
            } else if (key instanceof String) {
                try {
                    index = Integer.parseInt((String) key);
                } catch (NumberFormatException ignored) {
                    // ignore not parsable string
                }
            }
            if (index >= 0) {
                int spaceNeeded = (index + 1) - array.size();
                if (spaceNeeded
                        == 1) { // Fast path, item are ordered in general ECMAScript(VM) implementation
                    array.add(value);
                } else {  // Slow path, universal
                    for (int i = 0; i < spaceNeeded; i++) {
                        array.add(null);
                    }
                    array.set(index, value);
                }
            }
        }
        int expected = (int) reader.getVarint();
        if (read != expected) {
            throw new UnexpectedException("unexpected number of properties");
        }
        long length2 = reader.getVarint();
        if (length != length2) {
            throw new AssertionError("length ambiguity");
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

    private NativeRenderException createUnsupportedTagException(byte tag) {
        return new NativeRenderException(DESERIALIZE_NOT_SUPPORTED_ERR,
                String.format(Locale.US, "%s: %d: native renderer not support for this object type", TAG, tag));
    }
}
