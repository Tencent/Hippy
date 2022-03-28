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

package com.tencent.mtt.hippy.views.list;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.ListViewRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.hippypager.HippyPager;
import com.tencent.mtt.supportui.views.recyclerview.BaseLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem;
import com.tencent.renderer.utils.ArrayUtils;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import java.util.List;
import java.util.Map;

@HippyController(name = HippyListViewController.CLASS_NAME, useSystemStandardType = true)
public class HippyListViewController extends HippyViewController<HippyListView> {

    public static final String CLASS_NAME = "ListView";
    private static final String TAG = "HippyListViewController";
    private static final String SCROLL_TO_INDEX = "scrollToIndex";
    private static final String SCROLL_TO_CONTENT_OFFSET = "scrollToContentOffset";
    private static final String SCROLL_TO_TOP = "scrollToTop";

    @Override
    public void onViewDestroy(HippyListView hippyListView) {
        super.onViewDestroy(hippyListView);
        if (hippyListView != null && hippyListView.mListScrollListeners != null) {
            hippyListView.mListScrollListeners.clear();
        }
    }

    @Override
    protected void addView(ViewGroup parentView, View view, int index) {
        //		super.addView(parentView, view, index);
    }

    @Override
    protected void deleteChild(ViewGroup parentView, View childView, int childIndex) {
        // List的childView是RecyclerViewItem类型，不是由Hippy构建的，所以这里需要提前删除RecyclerViewItem的child
        if (childView instanceof RecyclerViewItem) {
            ((RecyclerViewItem) childView).removeAllViews();
        }
        // list里，删掉某个条目后，它后面的条目的位置都要减1
        if (childIndex >= 0 && parentView instanceof HippyListView) {
            HippyListView listView = (HippyListView) parentView;
            listView.getRecycler().updateHolderPositionWhenDelete(childIndex);
        }
    }

    @Override
    public int getChildCount(HippyListView viewGroup) {
        return ((HippyListAdapter) viewGroup.getAdapter()).getRecyclerItemCount();
    }

    @Override
    public View getChildAt(HippyListView viewGroup, int i) {
        return ((HippyListAdapter) viewGroup.getAdapter()).getRecyclerItemView(i);
    }

    @Override
    public void onBatchComplete(@NonNull HippyListView view) {
        super.onBatchComplete(view);
        view.setListData();
    }

    @Override
    protected View createViewImpl(Context context) {
        return new HippyListView(context, BaseLayoutManager.VERTICAL);
    }

    @Override
    protected View createViewImpl(@NonNull Context context, @Nullable Map<String, Object> props) {
        boolean enableScrollEvent = false;
        int orientation = BaseLayoutManager.VERTICAL;
        if (props != null) {
            if (props.get("horizontal") instanceof Boolean && (boolean) props.get("horizontal")) {
                orientation = BaseLayoutManager.HORIZONTAL;
            }
            if (props.get("onScroll") instanceof Boolean) {
                enableScrollEvent = (boolean) props.get("onScroll");
            }
        }
        HippyListView listView = new HippyListView(context, orientation);
        listView.setOnScrollEventEnable(enableScrollEvent);
        return listView;
    }

    @Override
    public RenderNode createRenderNode(int id, @Nullable Map<String, Object> props,
            @NonNull String className,
            @Nullable ViewGroup hippyRootView, @NonNull ControllerManager controllerManager,
            boolean lazy) {
        return new ListViewRenderNode(id, props, className, hippyRootView, controllerManager, lazy);
    }

    @HippyControllerProps(name = "rowShouldSticky")
    public void setRowShouldSticky(HippyListView view, boolean enable) {
        view.setHasSuspentedItem(enable);
    }

    @HippyControllerProps(name = "onScrollBeginDrag", defaultType = HippyControllerProps.BOOLEAN)
    public void setScrollBeginDragEventEnable(HippyListView view, boolean flag) {
        view.setScrollBeginDragEventEnable(flag);
    }

    @HippyControllerProps(name = "onScrollEndDrag", defaultType = HippyControllerProps.BOOLEAN)
    public void setScrollEndDragEventEnable(HippyListView view, boolean flag) {
        view.setScrollEndDragEventEnable(flag);
    }

    @HippyControllerProps(name = "onMomentumScrollBegin", defaultType = HippyControllerProps.BOOLEAN)
    public void setMomentumScrollBeginEventEnable(HippyListView view, boolean flag) {
        view.setMomentumScrollBeginEventEnable(flag);
    }

    @HippyControllerProps(name = "onMomentumScrollEnd", defaultType = HippyControllerProps.BOOLEAN)
    public void setMomentumScrollEndEventEnable(HippyListView view, boolean flag) {
        view.setMomentumScrollEndEventEnable(flag);
    }

    @HippyControllerProps(name = "exposureEventEnabled", defaultType = HippyControllerProps.BOOLEAN)
    public void setExposureEventEnable(HippyListView view, boolean flag) {
        view.setExposureEventEnable(flag);
    }

    @HippyControllerProps(name = "scrollEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setScrollEnable(HippyListView view, boolean flag) {
        view.setScrollEnable(flag);
    }

    @HippyControllerProps(name = "scrollEventThrottle", defaultType = HippyControllerProps.NUMBER, defaultNumber = 30.0D)
    public void setscrollEventThrottle(HippyListView view, int scrollEventThrottle) {
        view.setScrollEventThrottle(scrollEventThrottle);
    }

    @HippyControllerProps(name = "preloadItemNumber")
    public void setPreloadItemNumber(HippyListView view, int preloadItemNumber) {
        RecyclerViewBase.Adapter<?> adapter = view.getAdapter();
        if (adapter instanceof HippyListAdapter) {
            ((HippyListAdapter) adapter).setPreloadItemNumber(preloadItemNumber);
        }
    }

    @HippyControllerProps(name = "overScrollEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setOverScrollEnabled(HippyListView view, boolean flag) {
        view.setOverScrollEnabled(flag);
    }

    @HippyControllerProps(name = "initialContentOffset", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setInitialContentOffset(HippyListView view, int offset) {
        view.setInitialContentOffset((int) PixelUtil.dp2px(offset));
    }

    private void handleScrollToIndex(HippyListView listView, @NonNull List<?> params) {
        int xIndex = ArrayUtils.getIntValue(params, 0);
        int yIndex = ArrayUtils.getIntValue(params, 1);
        boolean animated = ArrayUtils.getBooleanValue(params, 2);
        int duration = ArrayUtils.getIntValue(params, 3);
        listView.scrollToIndex(xIndex, yIndex, animated, duration);
    }

    private void handleScrollToContentOffset(HippyListView listView, @NonNull List<?> params) {
        double xOffset = ArrayUtils.getDoubleValue(params, 0);
        double yOffset = ArrayUtils.getDoubleValue(params, 1);
        boolean animated = ArrayUtils.getBooleanValue(params, 2);
        int duration = ArrayUtils.getIntValue(params, 3);
        listView.scrollToContentOffset(xOffset, yOffset, animated, duration);
    }

    @Override
    public void dispatchFunction(@NonNull HippyListView listView, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(listView, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(@NonNull HippyListView listView, @NonNull String functionName,
            @NonNull List params) {
        super.dispatchFunction(listView, functionName, params);
        switch (functionName) {
            case SCROLL_TO_INDEX: {
                handleScrollToIndex(listView, params);
                break;
            }
            case SCROLL_TO_CONTENT_OFFSET: {
                handleScrollToContentOffset(listView, params);
                break;
            }
            case SCROLL_TO_TOP: {
                listView.scrollToTop(null);
                break;
            }
            default:
                LogUtils.e(TAG, "Unknown function name: " + functionName);
        }
    }
}
