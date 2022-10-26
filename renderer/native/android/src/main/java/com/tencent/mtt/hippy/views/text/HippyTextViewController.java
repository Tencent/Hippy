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

package com.tencent.mtt.hippy.views.text;

import android.content.Context;
import android.text.Layout;
import android.text.Spannable;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.component.Component;
import com.tencent.renderer.component.text.TextGestureSpan;
import com.tencent.renderer.component.text.TextRenderSupplier;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.node.TextRenderNode;
import java.util.Map;

@HippyController(name = HippyTextViewController.CLASS_NAME, dispatchWithStandardType = true, supportFlatten = true)
public class HippyTextViewController extends HippyViewController<HippyTextView> {

    public static final String CLASS_NAME = "Text";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyTextView(context);
    }

    @Override
    protected boolean handleGestureBySelf() {
        return true;
    }

    @Override
    protected RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager,
            boolean isLazy) {
        return new TextRenderNode(rootId, id, props, className, controllerManager, isLazy);
    }
}
