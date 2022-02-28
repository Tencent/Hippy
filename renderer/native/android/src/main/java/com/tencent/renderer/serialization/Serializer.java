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

import static com.tencent.renderer.NativeRenderException.ExceptionCode.SERIALIZER_NOT_SUPPORTED_ERR;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.serialization.PrimitiveValueSerializer;
import com.tencent.mtt.hippy.serialization.SerializationTag;
import com.tencent.mtt.hippy.serialization.nio.writer.BinaryWriter;

import com.tencent.renderer.NativeRenderException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Provide encode ability, all data object should serialize to byte buffer before send to native(C++)
 *
 * only support {@link Number}, {@link String}, {@link Boolean}, {@link Map}, {@link List}
 * for compatible with old versions, temporary support {@link HippyMap} and {@link HippyArray}
 * but will removed in the future
 */
@SuppressWarnings("deprecation")
public class Serializer extends PrimitiveValueSerializer {

    private static final String TAG = "Serializer";

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

    @SuppressWarnings("rawtypes")
    @Override
    public boolean writeValue(@Nullable Object object) throws NativeRenderException {
        if (object == null) {
            throw new NativeRenderException(SERIALIZER_NOT_SUPPORTED_ERR,
                    TAG + ": Cannot write an empty object");
        }
        //Compatible HippyMap with old versions, will be removed in the future.
        if (object instanceof HippyMap) {
            HashMap map = ((HippyMap) object).getInternalMap();
            writeValue(map);
            return true;
        }
        //Compatible HippyArray with old versions, will be removed in the future.
        if (object instanceof HippyArray) {
            List array = ((HippyArray) object).getInternalArray();
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
        } else if (object instanceof List) {
            assignId(object);
            writeList((List) object);
        } else {
            throw new NativeRenderException(SERIALIZER_NOT_SUPPORTED_ERR,
                    TAG + ": Unsupported object data type, object=" + object);
        }
        return true;
    }

    @SuppressWarnings("rawtypes")
    private void writeJSMap(@NonNull Map map) {
        writeTag(SerializationTag.BEGIN_JS_MAP);
        int count = 0;
        for (Object key : map.keySet()) {
            count++;
            writeValue(key);
            writeValue(map.get(key));
        }
        writeTag(SerializationTag.END_JS_MAP);
        writer.putVarint(2L * count);
    }

    @SuppressWarnings("rawtypes")
    private void writeJSObject(@NonNull Map map) {
        writeTag(SerializationTag.BEGIN_JS_OBJECT);
        for (Object key : map.keySet()) {
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

    private void writeList(@NonNull List<?> list) {
        writeTag(SerializationTag.BEGIN_DENSE_JS_ARRAY);
        writer.putVarint(list.size());
        for (Object value : list) {
            writeValue(value);
        }
        writeTag(SerializationTag.END_DENSE_JS_ARRAY);
    }
}
