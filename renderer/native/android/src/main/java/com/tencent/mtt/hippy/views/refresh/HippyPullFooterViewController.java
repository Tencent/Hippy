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

package com.tencent.mtt.hippy.views.refresh;

import android.content.Context;
import android.view.View;

import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.renderer.node.PullFooterRenderNode;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerView;

import java.util.List;
import java.util.Map;

@HippyController(name = HippyPullFooterViewController.CLASS_NAME, isLazyLoad = true, dispatchWithStandardType = true)
public class HippyPullFooterViewController extends HippyViewController<HippyPullFooterView> {

    public static final String CLASS_NAME = "PullFooterView";
    private static final String COLLAPSE_PULL_FOOTER = "collapsePullFooter";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyPullFooterView(context);
    }

    @Override
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        return new PullFooterRenderNode(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    @Override
    public void onViewDestroy(HippyPullFooterView pullFooterView) {
        pullFooterView.onDestroy();
    }

    @HippyControllerProps(name = "sticky", defaultType = HippyControllerProps.BOOLEAN)
    public void setStickEnabled(HippyPullFooterView view, boolean flag) {
        view.setStickEnabled(flag);
    }

    @Override
    public void dispatchFunction(@NonNull HippyPullFooterView pullFooterView,
            @NonNull String functionName, @NonNull HippyArray params) {
        dispatchFunction(pullFooterView, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(@NonNull HippyPullFooterView pullFooterView,
            @NonNull String functionName, @NonNull List params) {
        super.dispatchFunction(pullFooterView, functionName, params);
        View recyclerView = pullFooterView.getRecyclerView();
        if (COLLAPSE_PULL_FOOTER.equals(functionName)) {
            if (recyclerView instanceof HippyRecyclerView) {
                ((HippyRecyclerView) recyclerView).getAdapter().onFooterRefreshCompleted();
            } else if (recyclerView instanceof IFooterContainer) {
                ((IFooterContainer) recyclerView).onFooterRefreshFinish();
            }
        }
    }
}
