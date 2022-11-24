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
        assertEquals(MapUtils.getBooleanValue(mTestMap, "boolean"), true);
        assertEquals(MapUtils.getBooleanValue(mTestMap, "string"), false);
        assertEquals(MapUtils.getBooleanValue(mTestMap, "int"), false);
    }
}