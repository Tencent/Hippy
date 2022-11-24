package com.tencent.renderer.utils;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.powermock.api.mockito.PowerMockito.when;

import android.text.TextUtils;
import java.util.HashMap;
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
        //System.setProperty("org.mockito.mock.android", "true");
    }

    @After
    public void tearDown() throws Exception {
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
        HashMap<String, Object> diffMap = (HashMap) DiffUtils.diffMap(fromMap, toMap);
        assertEquals(diffMap.containsKey("K3"), true);
        assertEquals(diffMap.containsKey("K2"), true);
        assertEquals(diffMap.containsKey("K1"), true);
        assertEquals(diffMap.containsKey("K4"), true);
        toMap.put("K1", "F1");
        toMap.put("K2", "F2");
        diffMap = (HashMap) DiffUtils.diffMap(fromMap, toMap);
        assertEquals(diffMap.containsKey("K4"), true);
        assertEquals(diffMap.containsKey("K3"), true);
        assertEquals(diffMap.containsKey("K2"), false);
        assertEquals(diffMap.containsKey("K1"), false);
    }
}