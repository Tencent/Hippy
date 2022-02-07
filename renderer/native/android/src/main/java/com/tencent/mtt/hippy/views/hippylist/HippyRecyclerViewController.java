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
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.EasyLinearLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;

import android.view.View;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.ListViewRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.list.HippyListView;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.utils.ArrayUtils;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@HippyController(name = HippyRecyclerViewController.CLASS_NAME)
public class HippyRecyclerViewController<HRW extends HippyRecyclerViewWrapper> extends
        HippyViewController<HRW> {

    private static final String TAG = "HippyRecyclerViewController";
    public static final String CLASS_NAME = "RecyclerView";
    private static final String SCROLL_TO_INDEX = "scrollToIndex";
    private static final String SCROLL_TO_CONTENT_OFFSET = "scrollToContentOffset";
    private static final String SCROLL_TO_TOP = "scrollToTop";
    private static final String COLLAPSE_PULL_HEADER = "collapsePullHeader";
    private static final String EXPAND_PULL_HEADER = "expandPullHeader";

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
    protected View createViewImpl(@NonNull Context context, @Nullable Map<String, Object> props) {
        return new HippyRecyclerViewWrapper(context,
                initDefault(context, props, new HippyRecyclerView(context)));
    }

    public static HippyRecyclerView initDefault(@NonNull Context context,
            @Nullable Map<String, Object> props,
            @NonNull HippyRecyclerView recyclerView) {
        LinearLayoutManager layoutManager = new EasyLinearLayoutManager(context);
        recyclerView.setItemAnimator(null);
        if (props != null && props.get("horizontal") instanceof Boolean && (boolean) props
                .get("horizontal")) {
            layoutManager.setOrientation(LinearLayoutManager.HORIZONTAL);
        }
        recyclerView.setLayoutManager(layoutManager);
        if (context instanceof NativeRenderContext) {
            int instanceId = ((NativeRenderContext) context).getInstanceId();
            recyclerView.setNativeRenderer(NativeRendererManager.getNativeRenderer(instanceId));
        }
        recyclerView.initRecyclerView();
        return recyclerView;
    }

    @Override
    public RenderNode createRenderNode(int id, @Nullable Map<String, Object> props,
            @NonNull String className,
            @NonNull ViewGroup hippyRootView, @NonNull ControllerManager controllerManager,
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

    private void handleScrollToIndex(HRW recyclerView, @NonNull List<?> params) {
        int xIndex = ArrayUtils.getIntValue(params, 0);
        int yIndex = ArrayUtils.getIntValue(params, 1);
        boolean animated = ArrayUtils.getBooleanValue(params, 2);
        int duration = ArrayUtils.getIntValue(params, 3);
        recyclerView.scrollToIndex(xIndex, yIndex, animated, duration);
    }

    private void handleScrollToContentOffset(HRW recyclerView, @NonNull List<?> params) {
        double xOffset = ArrayUtils.getDoubleValue(params, 0);
        double yOffset = ArrayUtils.getDoubleValue(params, 1);
        boolean animated = ArrayUtils.getBooleanValue(params, 2);
        int duration = ArrayUtils.getIntValue(params, 3);
        recyclerView.scrollToContentOffset(xOffset, yOffset, animated, duration);
    }

    @Override
    public void dispatchFunction(@NonNull HRW recyclerView, @NonNull String functionName, @NonNull List params) {
        super.dispatchFunction(recyclerView, functionName, params);
        switch (functionName) {
            case SCROLL_TO_INDEX: {
                handleScrollToIndex(recyclerView, params);
                break;
            }
            case SCROLL_TO_CONTENT_OFFSET: {
                handleScrollToContentOffset(recyclerView, params);
                break;
            }
            case SCROLL_TO_TOP: {
                recyclerView.scrollToTop();
                break;
            }
            case COLLAPSE_PULL_HEADER: {
                getAdapter(recyclerView).getHeaderEventHelper().onHeaderRefreshFinish();
                break;
            }
            case EXPAND_PULL_HEADER: {
                getAdapter(recyclerView).getHeaderEventHelper().onHeaderRefresh();
                break;
            }
            default:
                LogUtils.e(TAG, "Unknown function name: " + functionName);
        }
    }

    private HippyRecyclerListAdapter getAdapter(HippyRecyclerViewWrapper view) {
        return view.getRecyclerView().getAdapter();
    }
}
