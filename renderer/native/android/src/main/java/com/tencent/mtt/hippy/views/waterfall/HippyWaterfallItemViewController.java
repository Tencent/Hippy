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

package com.tencent.mtt.hippy.views.waterfall;

import android.content.Context;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.renderer.node.RenderNode;

import com.tencent.renderer.node.WaterfallItemRenderNode;
import java.util.Map;

@HippyController(name = HippyWaterfallItemViewController.CLASS_NAME, isLazyLoad = true, dispatchWithStandardType = true)
public class HippyWaterfallItemViewController extends HippyViewController<HippyWaterfallItemView> {

    private static final String TAG = "HippyWaterfallItemViewController";
    public static final String CLASS_NAME = "WaterfallItem";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyWaterfallItemView(context);
    }

    @Override
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        WaterfallItemRenderNode node = new WaterfallItemRenderNode(rootId, id, props, className, controllerManager, isLazyLoad);
        if (node.checkFullSpanProperty()) {
            node.setFullSpan(true);
        }
        return node;
    }
}
