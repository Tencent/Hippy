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
import androidx.recyclerview.widget.RecyclerView;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.ListViewRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.renderer.utils.ArrayUtils;
import com.tencent.renderer.utils.MapUtils;

import java.util.List;
import java.util.Map;

/**
 * Created  on 2020/12/22.
 */

@HippyController(name = HippyRecyclerViewController.CLASS_NAME, useSystemStandardType = true)
public class HippyRecyclerViewController<HRW extends HippyRecyclerViewWrapper> extends HippyViewController<HRW> {

    public static final String CLASS_NAME = "ListView";
    public static final String SCROLL_TO_INDEX = "scrollToIndex";
    public static final String SCROLL_TO_CONTENT_OFFSET = "scrollToContentOffset";
    public static final String SCROLL_TO_TOP = "scrollToTop";
    public static final String COLLAPSE_PULL_HEADER = "collapsePullHeader";
    public static final String COLLAPSE_PULL_HEADER_WITH_OPTIONS = "collapsePullHeaderWithOptions";
    public static final String EXPAND_PULL_HEADER = "expandPullHeader";
    public static final String HORIZONTAL = "horizontal";

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

    /**
     * view 被Hippy的RenderNode 删除了，这样会导致View的child完全是空的，这个view是不能再被recyclerView复用了
     * 否则如果被复用，在adapter的onBindViewHolder的时候，view的实际子view和renderNode的数据不匹配，diff会出现异常
     * 导致item白条，显示不出来，所以被删除的view，需要把viewHolder.setIsRecyclable(false)，刷新list后，这个view就
     * 不会进入缓存。
     */
    @Override
    protected void deleteChild(ViewGroup parentView, View childView) {
        super.deleteChild(parentView, childView);
        ((HRW) parentView).getRecyclerView().disableRecycle(childView);
    }

    @Override
    public void onBatchStart(HRW view) {
        super.onBatchStart(view);
        view.onBatchStart();
    }

    @Override
    public void onBatchComplete(HRW view) {
        super.onBatchComplete(view);
        view.onBatchComplete();
        view.setListData();
    }

    @Override
    protected View createViewImpl(Context context) {
        return createViewImpl(context, null);
    }

    @Override
    protected View createViewImpl(Context context, @Nullable Map<String, Object> props) {
        return new HippyRecyclerViewWrapper(context, initDefault(context, props, new HippyRecyclerView(context)));
    }

    public static HippyRecyclerView initDefault(Context context, @Nullable Map<String, Object> props, HippyRecyclerView recyclerView) {
        LinearLayoutManager layoutManager = new EasyLinearLayoutManager(context);
        recyclerView.setItemAnimator(null);
        boolean enableScrollEvent = false;
        boolean enableOverPull = true;
        if (props != null) {
            if (MapUtils.getBooleanValue(props, HORIZONTAL)) {
                layoutManager.setOrientation(LinearLayoutManager.HORIZONTAL);
            }
            enableScrollEvent = MapUtils.getBooleanValue(props, "onScroll");
            if (props.containsKey(NodeProps.OVER_PULL)) {
                enableOverPull = MapUtils.getBooleanValue(props, NodeProps.OVER_PULL);
            }
        }
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.initRecyclerView();
        recyclerView.getRecyclerViewEventHelper().setOnScrollEventEnable(enableScrollEvent);
        if (HippyListUtils.isVerticalLayout(recyclerView)) {
            recyclerView.setEnableOverPull(enableOverPull);
        }
        return recyclerView;
    }

    @Override
    public RenderNode createRenderNode(int id, @Nullable Map<String, Object> props, @NonNull String className,
            @NonNull ViewGroup hippyRootView, ControllerManager controllerManager, boolean isLazyLoad) {
        return new ListViewRenderNode(id, props, className, hippyRootView, controllerManager, isLazyLoad);
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

    @HippyControllerProps(name = "overScrollEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setOverScrollEnable(HRW viewWrapper, boolean flag) {
        if (flag) {
            viewWrapper.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
        } else {
            viewWrapper.setOverScrollMode(View.OVER_SCROLL_NEVER);
        }
    }

    @HippyControllerProps(name = NodeProps.OVER_PULL, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setBounces(HRW viewWrapper, boolean flag) {
        HippyRecyclerView recyclerView = viewWrapper.getRecyclerView();
        if (recyclerView != null && HippyListUtils.isVerticalLayout(recyclerView)) {
            recyclerView.setEnableOverPull(flag);
        }
    }

    @HippyControllerProps(name = "scrollEventThrottle", defaultType = HippyControllerProps.NUMBER, defaultNumber = 30.0D)
    public void setScrollEventThrottle(HRW view, int scrollEventThrottle) {
        view.getRecyclerViewEventHelper().setScrollEventThrottle(scrollEventThrottle);
    }

    @HippyControllerProps(name = "preloadItemNumber")
    public void setPreloadItemNumber(HRW view, int preloadItemNumber) {
        getAdapter(view).setPreloadItemNumber(preloadItemNumber);
    }

    @HippyControllerProps(name = "suspendViewListener", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setSuspendViewListener(final HRW viewWrapper, int open) {
        viewWrapper.getRecyclerView().enableStickEvent(open == 1);
    }

    @Override
    public void onAfterUpdateProps(HRW viewWrapper) {
        super.onAfterUpdateProps(viewWrapper);
        viewWrapper.getRecyclerView().onAfterUpdateProps();
    }

    @Override
    public void dispatchFunction(HRW view, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(view, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(HRW view, @NonNull String functionName,
            @NonNull List params) {
        super.dispatchFunction(view, functionName, params);
        switch (functionName) {
            case SCROLL_TO_INDEX: {
                // list滑动到某个item
                int xIndex = ArrayUtils.getIntValue(params, 0);
                int yIndex = ArrayUtils.getIntValue(params, 1);
                boolean animated = ArrayUtils.getBooleanValue(params, 2);
                int duration = ArrayUtils.getIntValue(params, 3); //1.2.7 增加滚动时间 ms,animated==true时生效
                view.scrollToIndex(xIndex, yIndex, animated, duration);
                break;
            }
            case SCROLL_TO_CONTENT_OFFSET: {
                // list滑动到某个距离
                double xOffset = ArrayUtils.getDoubleValue(params, 0);
                double yOffset = ArrayUtils.getDoubleValue(params, 1);
                boolean animated = ArrayUtils.getBooleanValue(params, 2);
                int duration = ArrayUtils.getIntValue(params, 3); //1.2.7 增加滚动时间 ms,animated==true时生效
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
            case COLLAPSE_PULL_HEADER_WITH_OPTIONS: {
                Map<String, Object> valueMap = ArrayUtils.getMapValue(params, 0);
                if (valueMap == null) {
                    return;
                }
                final int time = MapUtils.getIntValue(valueMap, "time");
                final HippyRecyclerListAdapter adapter = getAdapter(view);
                if (adapter == null) {
                    return;
                }
                if (time > 0) {
                    view.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            PullHeaderEventHelper helper = adapter.getHeaderEventHelper();
                            if (helper != null) {
                                helper.onHeaderRefreshFinish();
                            }
                        }
                    }, time);
                } else {
                    adapter.getHeaderEventHelper().onHeaderRefreshFinish();
                }
            }
            case EXPAND_PULL_HEADER: {
                getAdapter(view).getHeaderEventHelper().onHeaderRefresh();
                break;
            }
            default:
                break;
        }
    }

    private HippyRecyclerListAdapter getAdapter(HRW view) {
        return view.getRecyclerView().getAdapter();
    }
}
