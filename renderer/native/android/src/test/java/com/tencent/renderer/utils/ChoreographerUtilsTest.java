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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;

import android.view.Choreographer;
import java.util.ArrayList;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;
import org.powermock.reflect.Whitebox;

@RunWith(PowerMockRunner.class)
@PrepareForTest({ChoreographerUtils.class, EventUtils.class, Choreographer.class})
@PowerMockIgnore({
        "org.mockito.*",
        "org.robolectric.*",
        "androidx.*",
        "android.*",
})
public class ChoreographerUtilsTest {

    private Choreographer mMockObject;
    private final ArrayList<Integer> mRendererIds = new ArrayList<>();
    private final ArrayList<Integer> mRootIds = new ArrayList<>();

    @Before
    public void setUp() throws Exception {
        PowerMockito.mockStatic(Choreographer.class);
        mMockObject = PowerMockito.mock(Choreographer.class);
        PowerMockito.doAnswer(new Answer<Choreographer>() {
            @Override
            public Choreographer answer(InvocationOnMock invocation) {
                return mMockObject;
            }
        }).when(Choreographer.class, "getInstance");
        PowerMockito.spy(ChoreographerUtils.class);
        PowerMockito.mockStatic(EventUtils.class);
    }

    @After
    public void tearDown() {
        mRendererIds.clear();
        mRootIds.clear();
    }

    @Test
    public void registerAndUnregisterDoFrameListener() {
        try {
            PowerMockito.doAnswer(new Answer<Void>() {
                @Override
                public Void answer(InvocationOnMock invocation) {
                    Object[] args = invocation.getArguments();
                    mRendererIds.add((Integer) args[0]);
                    mRootIds.add((Integer) args[1]);
                    return null;
                }
            }).when(EventUtils.class, "sendRootEvent", anyInt(), anyInt(), anyString(), any());
            ChoreographerUtils.registerDoFrameListener(1, 10);
            ChoreographerUtils.registerDoFrameListener(2, 20);
            ChoreographerUtils.registerDoFrameListener(3, 30);
            ChoreographerUtils.registerDoFrameListener(4, 40);
            ChoreographerUtils.unregisterDoFrameListener(2, 20);
            ChoreographerUtils.unregisterDoFrameListener(4, 40);
            Whitebox.invokeMethod(ChoreographerUtils.class, "handleDoFrameCallback");
            assertEquals(mRendererIds.size(), 2);
            assertEquals(mRootIds.size(), 2);
            assertEquals((int) mRendererIds.get(0), 1);
            assertEquals((int) mRendererIds.get(1), 3);
            assertEquals((int) mRootIds.get(0), 10);
            assertEquals((int) mRootIds.get(1), 30);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}