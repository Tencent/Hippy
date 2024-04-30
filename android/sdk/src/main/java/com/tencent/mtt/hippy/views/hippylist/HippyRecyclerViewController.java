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

import static com.tencent.mtt.hippy.dom.node.NodeProps.OVER_PULL;

import android.content.Context;
import android.view.ViewGroup;
import androidx.recyclerview.widget.HippyLinearLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import android.view.View;
import androidx.recyclerview.widget.RecyclerView.LayoutManager;
import com.tencent.mtt.hippy.HippyInstanceContext;
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
import com.tencent.mtt.hippy.utils.PixelUtil;

/**
 * Created  on 2020/12/22.
 */

@HippyController(name = HippyRecyclerViewController.CLASS_NAME, names = {HippyRecyclerViewController.EXTRA_CLASS_NAME})
public class HippyRecyclerViewController<HRW extends HippyRecyclerViewWrapper> extends HippyViewController<HRW> {

    public static final String CLASS_NAME = "ListView";
    public static final String EXTRA_CLASS_NAME = "RecyclerView";
    public static final String SCROLL_TO_INDEX = "scrollToIndex";
    public static final String SCROLL_TO_CONTENT_OFFSET = "scrollToContentOffset";
    public static final String SCROLL_TO_TOP = "scrollToTop";
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

    @Override
    public void onViewDestroy(HRW viewGroup) {
        ((HRW) viewGroup).getRecyclerView().onDestroy();
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
    protected View createViewImpl(Context context, HippyMap iniProps) {
        HippyRecyclerView hippyRecyclerView = initDefault(context, iniProps, new HippyRecyclerView(context));
        boolean overPull = iniProps != null && iniProps.getBoolean(OVER_PULL);
        hippyRecyclerView.setEnableOverPull(HippyListUtils.isVerticalLayout(hippyRecyclerView) && overPull);
        return new HippyRecyclerViewWrapper(context, hippyRecyclerView);
    }

    public static HippyRecyclerView initDefault(Context context, HippyMap iniProps, HippyRecyclerView recyclerView) {
        LinearLayoutManager layoutManager = new HippyLinearLayoutManager(context);
        recyclerView.setItemAnimator(null);
        boolean enableScrollEvent = false;
        if (iniProps != null) {
            if (iniProps.containsKey(HORIZONTAL)) {
                layoutManager.setOrientation(LinearLayoutManager.HORIZONTAL);
            }
            enableScrollEvent = iniProps.getBoolean("onScroll");
        }
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.setHippyEngineContext(((HippyInstanceContext) context).getEngineContext());
        recyclerView.initRecyclerView();
        recyclerView.getRecyclerViewEventHelper().setOnScrollEventEnable(enableScrollEvent);
        return recyclerView;
    }

    @Override
    public RenderNode createRenderNode(int id, HippyMap props, String className, HippyRootView hippyRootView,
            ControllerManager controllerManager,
            boolean lazy) {
        return new ListViewRenderNode(id, props, className, hippyRootView, controllerManager, lazy);
    }

    @HippyControllerProps(name = "horizontal", defaultType = HippyControllerProps.BOOLEAN)
    public void setHorizontalEnable(final HRW viewWrapper, boolean flag) {
        LayoutManager layoutManager = viewWrapper.getRecyclerView().getLayoutManager();
        if (!(layoutManager instanceof LinearLayoutManager)) {
            return;
        }
        int orientation = ((LinearLayoutManager) layoutManager).getOrientation();
        if (flag) {
            if (orientation != LinearLayoutManager.HORIZONTAL) {
                ((LinearLayoutManager) layoutManager).setOrientation(
                        LinearLayoutManager.HORIZONTAL);
                viewWrapper.getRecyclerView().getAdapter().onLayoutOrientationChanged();
            }
        } else {
            if (orientation == LinearLayoutManager.HORIZONTAL) {
                ((LinearLayoutManager) layoutManager).setOrientation(
                        LinearLayoutManager.VERTICAL);
                viewWrapper.getRecyclerView().getAdapter().onLayoutOrientationChanged();
            }
        }
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
        view.getRecyclerViewEventHelper().setPreloadItemNumber(preloadItemNumber);
    }

    @HippyControllerProps(name = "suspendViewListener", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setSuspendViewListener(final HRW viewWrapper, int open) {
        viewWrapper.getRecyclerView().enableStickEvent(open == 1);
    }

    @HippyControllerProps(name = "overScrollEnabled", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setOverScrollEnable(HRW viewWrapper, boolean flag) {
        HippyRecyclerView<?> recyclerView = viewWrapper.getRecyclerView();
        if (recyclerView != null) {
            if (flag) {
                recyclerView.setOverScrollMode(View.OVER_SCROLL_ALWAYS);
            } else {
                recyclerView.setOverScrollMode(View.OVER_SCROLL_NEVER);
            }
        }
        setBounces(viewWrapper, flag);
    }

    @HippyControllerProps(name = OVER_PULL, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setBounces(HRW viewWrapper, boolean flag) {
        HippyRecyclerView recyclerView = viewWrapper.getRecyclerView();
        if (recyclerView != null) {
            recyclerView.setEnableOverPull(flag);
        }
    }

    @HippyControllerProps(name = "initialContentOffset", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setInitialContentOffset(HRW viewWrapper, int offset) {
        viewWrapper.getRecyclerView().setInitialContentOffset((int) PixelUtil.dp2px(offset));
    }

    @HippyControllerProps(name = "itemViewCacheSize", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setItemViewCacheSize(HRW viewWrapper, int size) {
        viewWrapper.getRecyclerView().setItemViewCacheSize(Math.max(size, 2));
    }

    @Override
    public void onAfterUpdateProps(HRW viewWrapper) {
        super.onAfterUpdateProps(viewWrapper);
        viewWrapper.getRecyclerView().onAfterUpdateProps();
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
        }
    }

    private HippyRecyclerListAdapter getAdapter(HRW view) {
        return view.getRecyclerView().getAdapter();
    }
}
