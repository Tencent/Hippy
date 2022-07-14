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

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.PullHeaderRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerListAdapter;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerView;
import com.tencent.mtt.hippy.views.hippylist.PullHeaderRefreshHelper;
import com.tencent.mtt.hippy.views.list.HippyListView;

@SuppressWarnings({"deprecation", "unused"})
@HippyController(name = HippyPullHeaderViewController.CLASS_NAME, isLazyLoad = true)
public class HippyPullHeaderViewController extends HippyViewController<HippyPullHeaderView> {

    private static final String TAG = "HippyPullHeaderViewController";
    public static final String CLASS_NAME = "PullHeaderView";
    public static final String COLLAPSE_PULL_HEADER = "collapsePullHeader";
    public static final String EXPAND_PULL_HEADER = "expandPullHeader";
    public static final String COLLAPSE_PULL_HEADER_WITH_OPTIONS = "collapsePullHeaderWithOptions";

    @Override
    protected View createViewImpl(Context context) {
        return new HippyPullHeaderView(context);
    }

    @Override
    public RenderNode createRenderNode(int id, HippyMap props, String className,
            HippyRootView hippyRootView,
            ControllerManager controllerManager, boolean isLazyLoad) {
        return new PullHeaderRenderNode(id, props, className, hippyRootView, controllerManager,
                isLazyLoad);
    }

    @Override
    public void onViewDestroy(HippyPullHeaderView pullHeaderView) {
        pullHeaderView.onDestroy();
    }

    private void execListViewFunction(final HippyListView listView, String functionName, HippyArray dataArray) {
        switch (functionName) {
            case COLLAPSE_PULL_HEADER: {
                listView.onHeaderRefreshFinish();
                break;
            }
            case EXPAND_PULL_HEADER: {
                listView.onHeaderRefresh();
                break;
            }
            case COLLAPSE_PULL_HEADER_WITH_OPTIONS: {
                HippyMap valueMap = dataArray.getMap(0);
                if (valueMap == null) {
                    return;
                }
                final int time = valueMap.getInt("time");
                if (time > 0) {
                    listView.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            listView.onHeaderRefreshFinish();
                        }
                    }, time);
                } else {
                    listView.onHeaderRefreshFinish();
                }
                break;
            }
            default: {
                LogUtils.w(TAG, "Unknown function name: " + functionName);
            }
        }
    }

    private void execRecyclerViewFunction(HippyRecyclerView recyclerView, String functionName, HippyArray dataArray) {
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
                HippyMap valueMap = dataArray.getMap(0);
                if (valueMap == null) {
                    return;
                }
                final int time = valueMap.getInt("time");
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
                break;
            }
            default: {
                LogUtils.w(TAG, "Unknown function name: " + functionName);
            }
        }
    }

    @Override
    public void dispatchFunction(HippyPullHeaderView view, String functionName,
            HippyArray dataArray) {
        super.dispatchFunction(view, functionName, dataArray);
        View parent = view.getRecyclerView();
        if (parent instanceof HippyListView) {
            execListViewFunction((HippyListView) parent, functionName, dataArray);
        } else if (parent instanceof HippyRecyclerView) {
            execRecyclerViewFunction((HippyRecyclerView) parent, functionName, dataArray);
        }
    }
}
