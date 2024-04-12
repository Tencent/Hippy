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

import static com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewController.HORIZONTAL;
import static com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewController.SCROLL_TO_CONTENT_OFFSET;
import static com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewController.SCROLL_TO_INDEX;
import static com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewController.SCROLL_TO_TOP;
import static com.tencent.renderer.NativeRenderer.SCREEN_SNAPSHOT_ROOT_ID;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.HippyGridSpacesItemDecoration;
import androidx.recyclerview.widget.HippyStaggeredGridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.ControllerRegistry;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.hippylist.HippyListUtils;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerView;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewWrapper;
import com.tencent.renderer.NativeRenderContext;
import com.tencent.renderer.node.RenderNode;
import com.tencent.renderer.node.WaterfallRenderNode;
import com.tencent.renderer.utils.ArrayUtils;
import com.tencent.renderer.utils.MapUtils;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@HippyController(name = HippyWaterfallViewController.CLASS_NAME, dispatchWithStandardType = true)
public class HippyWaterfallViewController<HRW extends HippyRecyclerViewWrapper> extends HippyViewController<HRW> {

    private static final String TAG = "HippyWaterfallViewController";
    public static final String CLASS_NAME = "WaterfallView";

    @Override
    protected View createViewImpl(Context context) {
        return createViewImpl(context, null);
    }

    @Override
    protected View createViewImpl(@NonNull Context context, @Nullable Map<String, Object> props) {
        return new HippyRecyclerViewWrapper(context, initWaterfallView(context, props));
    }

    @Override
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        return new WaterfallRenderNode(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    @NonNull
    protected HippyRecyclerView initWaterfallView(@NonNull Context context, @Nullable Map<String, Object> props) {
        HippyWaterfallView waterfallView = new HippyWaterfallView(context);
        waterfallView.setItemAnimator(null);
        int orientation = RecyclerView.VERTICAL;
        boolean enableOverPull = true;
        boolean hasStableIds = true;
        int numberOfColumns = 2;
        if (props != null) {
            if (MapUtils.getBooleanValue(props, HORIZONTAL)) {
                orientation = RecyclerView.HORIZONTAL;
            }
            enableOverPull = MapUtils.getBooleanValue(props, NodeProps.OVER_PULL, false);
            hasStableIds = MapUtils.getBooleanValue(props, NodeProps.HAS_STABLE_IDS, true);
            numberOfColumns = MapUtils.getIntValue(props, NodeProps.NUMBER_OF_COLUMNS, 2);
        }
        HippyGridSpacesItemDecoration itemDecoration = new HippyGridSpacesItemDecoration(numberOfColumns);
        HippyStaggeredGridLayoutManager layoutManager = new HippyStaggeredGridLayoutManager(
                Math.max(numberOfColumns, 2), orientation, itemDecoration);
        waterfallView.setLayoutManager(layoutManager);
        waterfallView.initRecyclerView(hasStableIds);
        waterfallView.addItemDecoration(itemDecoration);
        if (HippyListUtils.isVerticalLayout(waterfallView)) {
            waterfallView.setEnableOverPull(enableOverPull);
        }
        if (context instanceof NativeRenderContext) {
            int rootId = ((NativeRenderContext) context).getRootId();
            if (rootId == SCREEN_SNAPSHOT_ROOT_ID) {
                waterfallView.setScrollEnable(false);
            }
        }
        return waterfallView;
    }

    @Override
    public void onViewDestroy(HRW viewGroup) {
        viewGroup.getRecyclerView().onDestroy();
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
    protected void deleteChild(ViewGroup parentView, View childView) {
        super.deleteChild(parentView, childView);
        ((HRW) parentView).getRecyclerView().disableRecycle(childView);
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
    public void updateLayout(int rootId, int id, int x, int y, int width, int height,
            ControllerRegistry componentHolder) {
        super.updateLayout(rootId, id, x, y, width, height, componentHolder);
        // nested list may not receive onBatchComplete, so we have to call dispatchLayout here
        View view = componentHolder.getView(rootId, id);
        if (view instanceof HippyRecyclerViewWrapper) {
            ((HippyRecyclerViewWrapper<?>) view).getRecyclerView().dispatchLayout();
        }
    }

    @HippyControllerProps(name = "scrollEventThrottle", defaultType = HippyControllerProps.NUMBER, defaultNumber =
            30.0D)
    public void setScrollEventThrottle(HRW recyclerViewWrapper, int scrollEventThrottle) {
        recyclerViewWrapper.getRecyclerViewEventHelper().setScrollEventThrottle(scrollEventThrottle);
    }

    @HippyControllerProps(name = "preloadItemNumber", defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setPreloadItemNumber(HRW recyclerViewWrapper, int preloadItemNumber) {
        recyclerViewWrapper.getRecyclerViewEventHelper().setPreloadItemNumber(preloadItemNumber);
    }

    @HippyControllerProps(name = NodeProps.ITEM_SPACING, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setItemSpacing(HRW recyclerViewWrapper, int itemSpacing) {
        HippyRecyclerView recyclerView = recyclerViewWrapper.getRecyclerView();
        if (recyclerView instanceof HippyWaterfallView) {
            ((HippyWaterfallView) recyclerView).setItemSpacing((int) PixelUtil.dp2px(itemSpacing));
        }
    }

    @HippyControllerProps(name = NodeProps.COLUMN_SPACING, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setColumnSpacing(HRW recyclerViewWrapper, int columnSpacing) {
        HippyRecyclerView recyclerView = recyclerViewWrapper.getRecyclerView();
        if (recyclerView instanceof HippyWaterfallView) {
            ((HippyWaterfallView) recyclerView).setColumnSpacing((int) PixelUtil.dp2px(columnSpacing));
        }
    }

    @HippyControllerProps(name = "contentInset", defaultType = HippyControllerProps.MAP)
    public void setContentInset(HRW recyclerViewWrapper, HashMap insetMap) {
        if (insetMap == null) {
            return;
        }
        int left = 0;
        int top = 0;
        int right = 0;
        int bottom = 0;
        Object value = insetMap.get("left");
        if (value instanceof Number) {
            left = Math.round(PixelUtil.dp2px(((Number) value).doubleValue()));
        }
        value = insetMap.get("top");
        if (value instanceof Number) {
            top = Math.round(PixelUtil.dp2px(((Number) value).doubleValue()));
        }
        value = insetMap.get("right");
        if (value instanceof Number) {
            right = Math.round(PixelUtil.dp2px(((Number) value).doubleValue()));
        }
        value = insetMap.get("bottom");
        if (value instanceof Number) {
            bottom = Math.round(PixelUtil.dp2px(((Number) value).doubleValue()));
        }
        recyclerViewWrapper.getRecyclerView().setPadding(left, top, right, bottom);
    }

    @Override
    public void dispatchFunction(@NonNull HRW view, @NonNull String functionName, @NonNull List params) {
        super.dispatchFunction(view, functionName, params);
        switch (functionName) {
            case SCROLL_TO_INDEX: {
                int xIndex = ArrayUtils.getIntValue(params, 0);
                int yIndex = ArrayUtils.getIntValue(params, 1);
                boolean animated = ArrayUtils.getBooleanValue(params, 2);
                int duration = ArrayUtils.getIntValue(params, 3);
                view.scrollToIndex(xIndex, yIndex, animated, duration);
                break;
            }
            case SCROLL_TO_CONTENT_OFFSET: {
                double xOffset = ArrayUtils.getDoubleValue(params, 0);
                double yOffset = ArrayUtils.getDoubleValue(params, 1);
                boolean animated = ArrayUtils.getBooleanValue(params, 2);
                int duration = ArrayUtils.getIntValue(params, 3);
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
