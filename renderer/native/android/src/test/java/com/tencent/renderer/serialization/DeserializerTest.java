/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
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

import static org.junit.Assert.*;

import android.graphics.Color;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import org.junit.Test;

public class DeserializerTest {

    private final SafeHeapWriter mSafeHeapWriter = new SafeHeapWriter();
    private final Serializer mSerializer = new Serializer();
    private final Deserializer mDeserializer = new Deserializer(null, new InternalizedStringTable());
    private final BinaryReader mSafeHeapReader = new SafeHeapReader();

    private ByteBuffer generateTestBuffer() {
        mSerializer.setWriter(mSafeHeapWriter);
        mSerializer.reset();
        mSerializer.writeHeader();
        HashMap<String, Object> params = new HashMap<>();
        params.put("id", 1);
        params.put("pid", 0);
        params.put("name", "text");
        params.put("class", null);
        HashMap<String, Object> style = new HashMap<>();
        style.put("width", 100);
        style.put("height", 100);
        ArrayList<Integer> colorList = new ArrayList<>();
        colorList.add(Color.BLUE);
        colorList.add(Color.RED);
        colorList.add(Color.BLACK);
        style.put("colors", colorList);
        params.put("style", style);
        mSerializer.writeValue(params);
        return mSafeHeapWriter.chunked();
    }

    @Test
    public void readValue() {
        ByteBuffer buffer = generateTestBuffer();
        mSafeHeapReader.reset(buffer);
        mDeserializer.setReader(mSafeHeapReader);
        mDeserializer.reset();
        mDeserializer.readHeader();
        Object paramsObj = mDeserializer.readValue();
        assertTrue(paramsObj instanceof HashMap);
        HashMap<String, Object> params = (HashMap<String, Object>) paramsObj;
        assertEquals(params.get("id"), 1);
        assertEquals(params.get("name"), "text");
        assertEquals(params.get("class"), null);
        assertTrue(params.get("style") instanceof HashMap);
        HashMap<String, Object> style = (HashMap<String, Object>) params.get("style");
        assertEquals(style.get("width"), 100);
        assertTrue(style.get("colors") instanceof ArrayList);
        ArrayList<Integer> colorList = (ArrayList<Integer>) style.get("colors");
        assertEquals(colorList.size(), 3);
        assertEquals((int) colorList.get(0), Color.BLUE);
        assertEquals((int) colorList.get(1), Color.RED);
        assertEquals((int) colorList.get(2), Color.BLACK);
    }
}