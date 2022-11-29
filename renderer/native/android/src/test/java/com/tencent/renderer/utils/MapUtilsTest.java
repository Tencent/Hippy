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

package com.tencent.renderer.utils;

import static org.junit.Assert.*;

import android.util.Log;
import java.util.HashMap;
import java.util.Map;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class MapUtilsTest {

    private Map<String, Object> mTestMap;

    @Before
    public void setUp() throws Exception {
        if (mTestMap == null) {
            mTestMap = new HashMap<>();
            mTestMap.put("int", 5);
            mTestMap.put("float", 5.0f);
            mTestMap.put("string", "test");
            mTestMap.put("boolean", true);
        }
    }

    @After
    public void tearDown() throws Exception {

    }

    @Test
    public void getIntValue() {
        assertEquals(MapUtils.getIntValue(mTestMap, "int"), 5);
        assertEquals(MapUtils.getIntValue(mTestMap, "string"), 0);
        assertEquals(MapUtils.getIntValue(mTestMap, "empty"), 0);
    }

    @Test
    public void getFloatValue() {
        assertEquals(MapUtils.getFloatValue(mTestMap, "float"), 5.0f, 0.0f);
        assertEquals(MapUtils.getFloatValue(mTestMap, "string"), 0.0f, 0.0f);
        assertEquals(MapUtils.getFloatValue(mTestMap, "int"), 5.0f, 0.0f);
    }

    @Test
    public void getDoubleValue() {
        assertEquals(MapUtils.getDoubleValue(mTestMap, "float"), 5.0f, 0.0f);
        assertEquals(MapUtils.getDoubleValue(mTestMap, "string"), 0.0f, 0.0f);
        assertEquals(MapUtils.getDoubleValue(mTestMap, "int"), 5.0f, 0.0f);
    }

    @Test
    public void getStringValue() {
        assertEquals(MapUtils.getStringValue(mTestMap, "string"), "test");
        assertNull("Non string type should return NULL", MapUtils.getStringValue(mTestMap, "float"));
    }

    @Test
    public void getBooleanValue() {
        assertTrue(MapUtils.getBooleanValue(mTestMap, "boolean"));
        assertFalse(MapUtils.getBooleanValue(mTestMap, "string"));
        assertFalse(MapUtils.getBooleanValue(mTestMap, "int"));
    }
}