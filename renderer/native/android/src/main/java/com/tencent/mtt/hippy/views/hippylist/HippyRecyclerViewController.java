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
import static com.tencent.renderer.NativeRenderer.SCREEN_SNAPSHOT_ROOT_ID;

import android.content.Context;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.HippyLinearLayoutManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView.LayoutManager;

import android.view.View;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.ControllerRegistry;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.node.ListViewRenderNode;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.utils.MapUtils;
import java.util.Map;

/**
 * Created  on 2020/12/22.
 */

@HippyController(name = HippyRecyclerViewController.CLASS_NAME, names = {
        HippyRecyclerViewController.EXTRA_CLASS_NAME})
public class HippyRecyclerViewController<HRW extends HippyRecyclerViewWrapper> extends
        HippyViewController<HRW> {

    private static final String TAG = "HippyRecyclerViewController";
    public static final String CLASS_NAME = "ListView";
    public static final String EXTRA_CLASS_NAME = "RecyclerView";
    public static final String SCROLL_TO_INDEX = "scrollToIndex";
    public static final String SCROLL_TO_CONTENT_OFFSET = "scrollToContentOffset";
    public static final String SCROLL_TO_TOP = "scrollToTop";
    public static final String HORIZONTAL = "horizontal";

    @Override
    public void onViewDestroy(HRW viewGroup) {
        ((HRW) viewGroup).onDestroy();
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
     * 导致item白条，显示不出来，所以被删除的view，需要把viewHolder.setIsRecyclable(false)，刷新list后，这个view就 不会进入缓存。
     */
    @Override
    protected void deleteChild(ViewGroup parentView, View childView) {
        ((HRW) parentView).getRecyclerView().deleteChild(childView);
    }

    @Override
    public void onBatchStart(@NonNull HRW view) {
        super.onBatchStart(view);
        view.onBatchStart();
    }

    @Override
    public void onBatchComplete(@NonNull HRW view) {
        super.onBatchComplete(view);
        view.onBatchComplete();
        view.setListData();
    }

    @Override
    public boolean isRecyclable() {
        return false;
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

    protected HippyRecyclerView initDefault(@NonNull Context context,
            @Nullable Map<String, Object> props, HippyRecyclerView recyclerView) {
        LinearLayoutManager layoutManager = new HippyLinearLayoutManager(context);
        layoutManager.setItemPrefetchEnabled(false);
        recyclerView.setItemAnimator(null);
        boolean enableOverPull = true;
        boolean hasStableIds = true;
        if (props != null) {
            if (MapUtils.getBooleanValue(props, HORIZONTAL)) {
                layoutManager.setOrientation(LinearLayoutManager.HORIZONTAL);
            }
            enableOverPull = MapUtils.getBooleanValue(props, NodeProps.OVER_PULL, true);
            hasStableIds = MapUtils.getBooleanValue(props, NodeProps.HAS_STABLE_IDS, true);
        }
        recyclerView.setLayoutManager(layoutManager);
        recyclerView.initRecyclerView(hasStableIds);
        if (HippyListUtils.isVerticalLayout(recyclerView)) {
            recyclerView.setEnableOverPull(enableOverPull);
        }
        if (context instanceof NativeRenderContext) {
            int rootId = ((NativeRenderContext) context).getRootId();
            if (rootId == SCREEN_SNAPSHOT_ROOT_ID) {
                recyclerView.setScrollEnable(false);
            }
        }
        return recyclerView;
    }

    @Override
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        return new ListViewRenderNode(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    @Override
    public void updateLayout(int rootId, int id, int x, int y, int width, int height,
            ControllerRegistry componentHolder) {
        super.updateLayout(rootId, id, x, y, width, height, componentHolder);
        // nested list may not receive onBatchComplete, so we have to call dispatchLayout here
        View view = componentHolder.getView(rootId, id);
        if (view instanceof HippyRecyclerViewWrapper) {
            ((HippyRecyclerViewWrapper<?>) view).getRecyclerView().dispatchLayout();
        }
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

    @HippyControllerProps(name = "scrollbegindrag", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setScrollBeginDragEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setScrollBeginDragEventEnable(flag);
    }

    @HippyControllerProps(name = "scrollenddrag", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setScrollEndDragEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setScrollEndDragEventEnable(flag);
    }

    @HippyControllerProps(name = "momentumscrollbegin", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setMomentumScrollBeginEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setMomentumScrollBeginEventEnable(flag);
    }

    @HippyControllerProps(name = "momentumscrollend", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setMomentumScrollEndEventEnable(HRW view, boolean flag) {
        view.getRecyclerViewEventHelper().setMomentumScrollEndEventEnable(flag);
    }

    @HippyControllerProps(name = "scroll", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
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
        setBounces(viewWrapper, flag);
    }

    @HippyControllerProps(name = OVER_PULL, defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setBounces(HRW viewWrapper, boolean flag) {
        HippyRecyclerView<?> recyclerView = viewWrapper.getRecyclerView();
        if (recyclerView != null) {
            recyclerView.setOverScrollMode(flag ? View.OVER_SCROLL_ALWAYS : View.OVER_SCROLL_NEVER);
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

    @HippyControllerProps(name = "enableScrollDirectionFix", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
    public void setFixScrollDirection(HRW viewWrapper, boolean flag) {
        HippyRecyclerView<?> recyclerView = viewWrapper.getRecyclerView();
        if (recyclerView != null) {
            recyclerView.setFixScrollDirection(flag);
        }
    }

    @Override
    public void onAfterUpdateProps(@NonNull HRW viewWrapper) {
        super.onAfterUpdateProps(viewWrapper);
        viewWrapper.getRecyclerView().onAfterUpdateProps();
    }

    @Override
    public void dispatchFunction(@NonNull HRW view, @NonNull String functionName, @NonNull HippyArray dataArray) {
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
            default: {
                LogUtils.w(TAG, "Unknown function name: " + functionName);
            }
        }
    }
}
