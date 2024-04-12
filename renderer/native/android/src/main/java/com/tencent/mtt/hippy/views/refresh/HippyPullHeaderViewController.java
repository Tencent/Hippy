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
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.renderer.node.PullHeaderRenderNode;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerListAdapter;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerView;

import com.tencent.renderer.utils.ArrayUtils;
import com.tencent.renderer.utils.MapUtils;
import java.util.List;
import java.util.Map;

@HippyController(name = HippyPullHeaderViewController.CLASS_NAME, isLazyLoad = true, dispatchWithStandardType = true)
public class HippyPullHeaderViewController extends HippyViewController<HippyPullHeaderView> {

    private static final String TAG = "HippyPullHeaderViewController";
    public static final String CLASS_NAME = "PullHeaderView";
    private static final String COLLAPSE_PULL_HEADER = "collapsePullHeader";
    private static final String EXPAND_PULL_HEADER = "expandPullHeader";
    private static final String COLLAPSE_PULL_HEADER_WITH_OPTIONS = "collapsePullHeaderWithOptions";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyPullHeaderView(context);
    }

    @Override
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        return new PullHeaderRenderNode(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    @Override
    public void onViewDestroy(HippyPullHeaderView pullHeaderView) {
        pullHeaderView.onDestroy();
    }

    private void execRecyclerViewFunction(@NonNull HippyRecyclerView recyclerView,
            @NonNull String functionName, @NonNull List params) {
        switch (functionName) {
            case COLLAPSE_PULL_HEADER: {
                recyclerView.getAdapter().onHeaderRefreshCompleted();
                break;
            }
            case EXPAND_PULL_HEADER: {
                recyclerView.getAdapter().enableHeaderRefresh();
                break;
            }
            case COLLAPSE_PULL_HEADER_WITH_OPTIONS: {
                Map element = ArrayUtils.getMapValue(params, 0);
                if (element == null) {
                    return;
                }
                final int time = MapUtils.getIntValue(element, "time");
                final HippyRecyclerListAdapter adapter = recyclerView.getAdapter();
                if (adapter == null) {
                    return;
                }
                if (time > 0) {
                    recyclerView.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            adapter.onHeaderRefreshCompleted();
                        }
                    }, time);
                } else {
                    adapter.onHeaderRefreshCompleted();
                }
            }
            default: {
                LogUtils.w(TAG, "Unknown function name: " + functionName);
            }
        }
    }

    @Override
    public void dispatchFunction(@NonNull HippyPullHeaderView pullHeaderView,
            @NonNull String functionName, @NonNull HippyArray params) {
        dispatchFunction(pullHeaderView, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(@NonNull HippyPullHeaderView pullHeaderView,
            @NonNull String functionName, @NonNull List params) {
        super.dispatchFunction(pullHeaderView, functionName, params);
        View parent = pullHeaderView.getRecyclerView();
        if (parent instanceof HippyRecyclerView) {
            execRecyclerViewFunction((HippyRecyclerView) parent, functionName, params);
        }
    }
}
