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

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.thoughtworks.xstream.mapper.Mapper.Null;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class PropertyUtilsTest {

    @Test
    public void convertProperty() {
        assertEquals(PropertyUtils.convertProperty(int.class, 6), 6);
        assertEquals(PropertyUtils.convertProperty(HippyMap.class, new HashMap<>()).getClass(),
                HippyMap.class);
        assertEquals(PropertyUtils.convertProperty(HippyArray.class, new ArrayList<>()).getClass(),
                HippyArray.class);
        HashMap<String, Object> testMap = new HashMap<>();
        ArrayList<Object> testList = new ArrayList<>();
        assertSame(PropertyUtils.convertProperty(HashMap.class, testMap), testMap);
        assertSame(PropertyUtils.convertProperty(Map.class, testMap), testMap);
        assertSame(PropertyUtils.convertProperty(Boolean.class, true), true);
        assertSame(PropertyUtils.convertProperty(ArrayList.class, testList), testList);
        assertSame(PropertyUtils.convertProperty(List.class, testList), testList);
    }

    @Test(expected = IllegalArgumentException.class)
    public void convertPropertyException() {
        PropertyUtils.convertProperty(LinkedList.class, new LinkedList<>());
    }

    @Test
    public void convertNumber() {
        assertEquals(PropertyUtils.convertNumber(int.class, 6), 6);
        assertEquals(PropertyUtils.convertNumber(Integer.class, 6), 6);
        assertEquals(PropertyUtils.convertNumber(int.class, "6"), 6);
        assertEquals(PropertyUtils.convertNumber(String.class, "6"), null);
        assertEquals(PropertyUtils.convertNumber(float.class, 5.0f), 5.0f);
        assertEquals(PropertyUtils.convertNumber(Float.class, 5.0f), 5.0f);
        assertEquals(PropertyUtils.convertNumber(float.class, "5.0"), 5.0f);
        assertEquals(PropertyUtils.convertNumber(double.class, 5.0), 5.0);
        assertEquals(PropertyUtils.convertNumber(Double.class, 5.0), 5.0);
        assertEquals(PropertyUtils.convertNumber(double.class, "5.0"), 5.0);
    }

    @Test(expected = IllegalArgumentException.class)
    public void convertNumberException() {
        PropertyUtils.convertNumber(int.class, new HashMap<>());
    }
}