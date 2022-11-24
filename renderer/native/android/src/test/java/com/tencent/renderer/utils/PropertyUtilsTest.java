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

    @BeforeClass
    public static void setUp() throws Exception {
    }

    @AfterClass
    public static void tearDown() throws Exception {

    }

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