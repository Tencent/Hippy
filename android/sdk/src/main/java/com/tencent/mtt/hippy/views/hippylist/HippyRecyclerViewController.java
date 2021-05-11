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

package com.tencent.mtt.hippy.views.hippylist;

import android.content.Context;
import androidx.recyclerview.widget.EasyLinearLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import android.view.View;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.ListViewRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;

@HippyController(name = HippyRecyclerViewController.CLASS_NAME)
public class HippyRecyclerViewController<HRW extends HippyRecyclerViewWrapper> extends HippyViewController<HRW> {

    public static final String CLASS_NAME = "RecyclerView";
    public static final String SCROLL_TO_INDEX = "scrollToIndex";
    public static final String SCROLL_TO_CONTENT_OFFSET = "scrollToContentOffset";
    public static final String SCROLL_TO_TOP = "scrollToTop";
    public static final String COLLAPSE_PULL_HEADER = "collapsePullHeader";
    public static final String EXPAND_PULL_HEADER = "expandPullHeader";

    public HippyRecyclerViewController() {

    }

    @Override
    public int getChildCount(HRW viewGroup) {
        return viewGroup.getChildCountWithCaches();
    }

    @Override
    public View getChildAt(HRW viewGroup, int index) {
        return viewGroup.getChildAtWithCaches(index);
    }

    @Override
    public void onBatchComplete(HRW view) {
        super.onBatchComplete(view);
        view.setListData();
    }

    @Override
    protected View createViewImpl(Context context) {
        return createViewImpl(context, null);
    }

    @Override
    protected View createViewImpl(Context context, HippyMap iniProps) {
        return new HippyRecyclerViewWrapper(context, initDefault(context, iniProps, new HippyRecyclerView(context)));
    }

    public static HippyRecyclerView initDefault(Context context, HippyMap iniProps, HippyRecyclerView recyclerView) {
        LinearLayoutManager layoutManager = new EasyLinearLayoutManager(context);
        recyclerView.setItemAnimator(null);
        if (iniProps != null && iniProps.containsKey("horizontal")) {
            layoutManager.setOrientation(LinearLayoutManager.HORIZONTAL);
        }
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.setHippyEngineContext(((HippyInstanceContext) context).getEngineContext());
        recyclerView.initRecyclerView();
        return recyclerView;
    }

    @Override
    public RenderNode createRenderNode(int id, HippyMap props, String className, HippyRootView hippyRootView,
            ControllerManager controllerManager,
            boolean lazy) {
        return new ListViewRenderNode(id, props, className, hippyRootView, controllerManager, lazy);
    }

    @HippyControllerProps(name = "rowShouldSticky")
    public void setRowShouldSticky(HRW view, boolean enable) {
        view.setRowShouldSticky(enable);
    }

    @HippyControllerProps(name = "onScrollBeginDrag", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setScrollBeginDragEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setScrollBeginDragEventEnable(flag);
    }

    @HippyControllerProps(name = "onScrollEndDrag", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setScrollEndDragEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setScrollEndDragEventEnable(flag);
    }

    @HippyControllerProps(name = "onMomentumScrollBegin", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setMomentumScrollBeginEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setMomentumScrollBeginEventEnable(flag);
    }

    @HippyControllerProps(name = "onMomentumScrollEnd", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setMomentumScrollEndEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setMomentumScrollEndEventEnable(flag);
    }

    @HippyControllerProps(name = "onScrollEnable", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setOnScrollEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setOnScrollEventEnable(flag);
    }

    @HippyControllerProps(name = "exposureEventEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setExposureEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setExposureEventEnable(flag);
    }

    @HippyControllerProps(name = "scrollEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setScrollEnable(HRW view, boolean flag) {
        view.setScrollEnable(flag);
    }

    @HippyControllerProps(name = "scrollEventThrottle", defaultType = HippyControllerProps.NUMBER, defaultNumber = 30.0D)
    public void setscrollEventThrottle(HRW view, int scrollEventThrottle) {
        view.getRecyclerViewEventHelper().setScrollEventThrottle(scrollEventThrottle);
    }

    @HippyControllerProps(name = "preloadItemNumber")
    public void setPreloadItemNumber(HRW view, int preloadItemNumber) {
        getAdapter(view).setPreloadItemNumber(preloadItemNumber);
    }

    @Override
    public void dispatchFunction(HRW view, String functionName, HippyArray dataArray) {
        super.dispatchFunction(view, functionName, dataArray);
        switch (functionName) {
            case SCROLL_TO_INDEX: {
                // list滑动到某个item
                int xIndex = dataArray.getInt(0);
                int yIndex = dataArray.getInt(1);
                boolean animated = dataArray.getBoolean(2);
                int duration = dataArray.getInt(3); //1.2.7 增加滚动时间 ms,animated==true时生效
                view.scrollToIndex(xIndex, yIndex, animated, duration);
                break;
            }
            case SCROLL_TO_CONTENT_OFFSET: {
                // list滑动到某个距离
                double xOffset = dataArray.getDouble(0);
                double yOffset = dataArray.getDouble(1);
                boolean animated = dataArray.getBoolean(2);
                int duration = dataArray.getInt(3); //1.2.7 增加滚动时间 ms,animated==true时生效
                view.scrollToContentOffset(xOffset, yOffset, animated, duration);
                break;
            }
            case SCROLL_TO_TOP: {
                view.scrollToTop();
                break;
            }
            case COLLAPSE_PULL_HEADER: {
                getAdapter(view).getHeaderEventHelper().onHeaderRefreshFinish();
                break;
            }
            case EXPAND_PULL_HEADER: {
                getAdapter(view).getHeaderEventHelper().onHeaderRefresh();
                break;
            }
        }
    }

    private HippyRecyclerListAdapter getAdapter(HRW view) {
        return view.getRecyclerView().getAdapter();
    }
}
