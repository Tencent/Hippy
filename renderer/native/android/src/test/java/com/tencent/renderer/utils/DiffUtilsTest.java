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
import static org.mockito.ArgumentMatchers.anyString;
import static org.powermock.api.mockito.PowerMockito.when;

import android.text.TextUtils;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

@RunWith(PowerMockRunner.class)
@PrepareForTest(TextUtils.class)
@PowerMockIgnore({
        "org.mockito.*",
        "org.robolectric.*",
        "androidx.*",
        "android.*",
})
public class DiffUtilsTest {

    @Before
    public void setUp() throws Exception {
        PowerMockito.mockStatic(TextUtils.class);
        when(TextUtils.equals(anyString(), anyString())).thenAnswer(new Answer<Boolean>() {
            @Override
            public Boolean answer(InvocationOnMock invocation) throws Throwable {
                Object[] args = invocation.getArguments();
                if (args == null || args.length < 2) {
                    return false;
                }
                return args[0].toString().equals(args[1].toString());
            }
        });
    }

    @After
    public void tearDown() throws Exception {

    }

    @Test
    public void findResetProps() {
        HashMap<String, Object> fromMap = new HashMap<>();
        HashMap<String, Object> toMap = new HashMap<>();
        fromMap.put("K1", "F1");
        fromMap.put("K2", "F2");
        fromMap.put("K3", "F3");
        toMap.put("K1", "F1");
        toMap.put("K2", "T2");
        HashMap<String, Object> fromStyle = new HashMap<>();
        HashMap<String, Object> toStyle = new HashMap<>();
        fromStyle.put("width", 100);
        fromStyle.put("height", 200);
        toStyle.put("width", 300);
        fromMap.put("style", fromStyle);
        toMap.put("style", toStyle);
        Map<String, Object> diffMap = DiffUtils.findResetProps(fromMap, toMap);
        assertFalse(diffMap.containsKey("K1"));
        assertFalse(diffMap.containsKey("K2"));
        assertTrue(diffMap.containsKey("K3"));
        assertEquals(diffMap.get("K3"), null);
        assertTrue(diffMap.containsKey("style"));
        Map<String, Object> diffStyle = (Map<String, Object>) diffMap.get("style");
        assertEquals(diffStyle.get("height"), null);
    }

    @Test
    public void diffMap() {
        HashMap<String, Object> fromMap = new HashMap<>();
        HashMap<String, Object> toMap = new HashMap<>();
        fromMap.put("K1", "F1");
        fromMap.put("K2", "F2");
        fromMap.put("K3", "F3");
        toMap.put("K1", "T1");
        toMap.put("K2", "T2");
        toMap.put("K4", "T4");
        // Compare the same key with different values.
        HashMap<String, Object> diffMap = (HashMap) DiffUtils.diffMap(fromMap, toMap);
        assertTrue(diffMap.containsKey("K3"));
        assertTrue(diffMap.containsKey("K2"));
        assertTrue(diffMap.containsKey("K1"));
        assertTrue(diffMap.containsKey("K4"));
        assertEquals(diffMap.get("K1"), "T1");
        assertEquals(diffMap.get("K2"), "T2");
        toMap.put("K1", "F1");
        toMap.put("K2", "F2");
        ArrayList<String> fromList = new ArrayList<>();
        ArrayList<String> toList = new ArrayList<>();
        fromList.add("L1");
        fromMap.put("K5", fromList);
        toList.add("L1");
        toMap.put("K5", toList);
        // Compare the same key with same values, and same array size with same array elements.
        diffMap = (HashMap) DiffUtils.diffMap(fromMap, toMap);
        assertTrue(diffMap.containsKey("K4"));
        assertTrue(diffMap.containsKey("K3"));
        assertFalse(diffMap.containsKey("K2"));
        assertFalse(diffMap.containsKey("K1"));
        assertFalse(diffMap.containsKey("K5"));
        toList.clear();
        toList.add("L2");
        // Compare the same array size with different array elements.
        diffMap = (HashMap) DiffUtils.diffMap(fromMap, toMap);
        assertTrue(diffMap.containsKey("K5"));
        assertEquals(diffMap.get("K5"), toList);
    }
}