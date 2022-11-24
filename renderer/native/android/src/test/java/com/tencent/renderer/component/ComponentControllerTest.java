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

package com.tencent.renderer.component;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.when;

import android.graphics.Color;
import android.text.TextUtils;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import java.util.ArrayList;
import java.util.List;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.powermock.api.mockito.PowerMockito;
import org.powermock.core.classloader.annotations.PowerMockIgnore;
import org.powermock.core.classloader.annotations.PrepareForTest;
import org.powermock.modules.junit4.PowerMockRunner;

@RunWith(PowerMockRunner.class)
@PrepareForTest({Component.class, TextUtils.class})
@PowerMockIgnore({
        "org.mockito.*",
        "org.robolectric.*",
        "androidx.*",
        "android.*",
})
public class ComponentControllerTest {

    @Test
    public void setLinearGradient() {
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
        ComponentController controller = new ComponentController();
        Component component = mock(Component.class);
        Mockito.doAnswer(new Answer<Object>() {
            public Boolean answer(InvocationOnMock invocation) {
                Object[] args = invocation.getArguments();
                assertEquals(args.length, 1);
                assertEquals(args[0], "30");
                return null;
            }
        }).when(component).setGradientAngleDesc(anyString());
        Mockito.doAnswer(new Answer<Object>() {
            public Boolean answer(InvocationOnMock invocation) {
                Object[] args = invocation.getArguments();
                assertEquals(args.length, 1);
                ArrayList<Integer> colors = (ArrayList<Integer>) args[0];
                assertEquals(colors.size(), 3);
                assertEquals((int) colors.get(0), Color.RED);
                assertEquals((int) colors.get(1), Color.BLUE);
                assertEquals((int) colors.get(2), Color.GREEN);
                return null;
            }
        }).when(component).setGradientColors(any(List.class));
        Mockito.doAnswer(new Answer<Object>() {
            public Boolean answer(InvocationOnMock invocation) {
                Object[] args = invocation.getArguments();
                assertEquals(args.length, 1);
                ArrayList<Float> ratios = (ArrayList<Float>) args[0];
                assertEquals(ratios.size(), 3);
                assertEquals((float) ratios.get(0), 0.1f, 0.0f);
                assertEquals((float) ratios.get(1), 0.4f, 0.0f);
                assertEquals((float) ratios.get(2), 0.5f, 0.0f);
                return null;
            }
        }).when(component).setGradientPositions(any(List.class));
        HippyMap params = new HippyMap();
        params.pushString("angle", "30");
        HippyArray colorStopList = new HippyArray();
        HippyMap cs1 = new HippyMap();
        cs1.pushInt("color", Color.RED);
        cs1.pushDouble("ratio", 0.1);
        HippyMap cs2 = new HippyMap();
        cs2.pushInt("color", Color.BLUE);
        cs2.pushDouble("ratio", 0.4);
        HippyMap cs3 = new HippyMap();
        cs3.pushInt("color", Color.GREEN);
        cs3.pushDouble("ratio", 0.5);
        colorStopList.pushMap(cs1);
        colorStopList.pushMap(cs2);
        colorStopList.pushMap(cs3);
        params.pushArray("colorStopList", colorStopList);
        controller.setLinearGradient(component, params);
    }
}