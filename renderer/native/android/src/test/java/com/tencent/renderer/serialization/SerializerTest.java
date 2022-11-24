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
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.renderer.NativeRenderException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

public class SerializerTest {

    private final SafeHeapWriter mSafeHeapWriter = new SafeHeapWriter();
    private final Serializer mSerializer = new Serializer();

    @Before
    public void setUp() throws Exception {
        mSerializer.setWriter(mSafeHeapWriter);
        mSerializer.reset();
        mSerializer.writeHeader();
    }

    @After
    public void tearDown() throws Exception {
    }

    @Test
    public void writeValue() {
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
        assertTrue(mSerializer.writeValue(params));
    }

    @Test(expected = NativeRenderException.class)
    public void writeValueException() {
        HashMap<String, Object> params = new HashMap<>();
        params.put("customObj", ByteBuffer.allocate(10));
        mSerializer.writeValue(params);
    }
}