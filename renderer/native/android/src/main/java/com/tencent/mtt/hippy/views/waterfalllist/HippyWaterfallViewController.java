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

package com.tencent.mtt.hippy.views.waterfalllist;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.viewpager.HippyViewPager;
import com.tencent.mtt.supportui.views.recyclerview.IRecyclerViewFooter;
import com.tencent.renderer.NativeRender;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.NativeRendererManager;
import com.tencent.renderer.utils.ArrayUtils;

import java.util.List;
import java.util.Map;

import static com.tencent.renderer.NativeRenderException.ExceptionCode.HANDLE_CALL_UI_FUNCTION_ERR;

@HippyController(name = WaterFallComponentName.CONTAINER, dispatchWithStandardType = true)
public class HippyWaterfallViewController extends HippyViewController<HippyWaterfallView> {

    private static final String TAG = "HippyWaterfallViewController";
    private static final String FUNC_END_REACHED_COMPLETED = "endReachedCompleted";
    //private static final String FUNC_REFRESH_COMPLETED = "refreshCompleted";
    //private static final String FUNC_START_REFRESH = "startRefresh";
    private static final String FUNC_START_REFRESH_WITH_TYPE = "startRefreshWithType";
    private static final String FUNC_START_LOAD_MORE = "startLoadMore";
    private static final String FUNC_SCROLL_TO_INDEX = "scrollToIndex";
    private static final String FUNC_SCROLL_TO_CONTENT_OFFSET = "scrollToContentOffset";
    private static final String FUNC_CALL_EXPOSURE_REPORT = "callExposureReport";
    private static final String FUNC_SET_REFRESH_PROMPT_INFO = "setRefreshPromptInfo";

    @Override

    protected void addView(ViewGroup parentView, View view, int index) {
    }

    @Override
    public int getChildCount(HippyWaterfallView viewGroup) {
        return ((HippyWaterfallView.HippyWaterfallAdapter) viewGroup.getAdapter())
                .getRecyclerItemCount();
    }

    @Override
    public View getChildAt(HippyWaterfallView viewGroup, int i) {
        return ((HippyWaterfallView.HippyWaterfallAdapter) viewGroup.getAdapter())
                .getRecyclerItemView(i);
    }

    @Override
    protected View createViewImpl(Context context) {
        return new HippyWaterfallView(context);
    }

    @Override
    public RenderNode createRenderNode(int rootId, int id, @Nullable Map<String, Object> props,
            @NonNull String className, @NonNull ControllerManager controllerManager, boolean isLazyLoad) {
        return new HippyWaterfallViewNode(rootId, id, props, className, controllerManager, isLazyLoad);
    }

    @Override
    public void onBatchComplete(@NonNull HippyWaterfallView view) {
        super.onBatchComplete(view);
        view.setListData();
    }

    @HippyControllerProps(name = "containBannerView", defaultType = HippyControllerProps.BOOLEAN)
    public void setContainBannerView(HippyWaterfallView listview, boolean containBannerView) {
        ((HippyWaterfallLayoutManager) listview.getLayoutManager())
                .setContainBannerView(containBannerView);
    }

    @HippyControllerProps(name = WaterFallComponentName.PROPERTY_CONTENT_INSET, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setContentInset(HippyWaterfallView listview, HippyMap data) {
        int left = dpToPx(data.getInt("left"));
        int top = dpToPx(data.getInt("top"));
        int right = dpToPx(data.getInt("right"));
        int bottom = dpToPx(data.getInt("bottom"));

        listview.setPadding(left, top, right, bottom);
    }

    protected int dpToPx(int dp) {
        return (int) PixelUtil.dp2px(dp);
    }

    @HippyControllerProps(name = WaterFallComponentName.PROPERTY_ITEM_SPACING, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setItemSpacing(HippyWaterfallView listview, int spacing) {
        ((HippyWaterfallLayoutManager) listview.getLayoutManager())
                .setItemGap(dpToPx(spacing));
    }

    @HippyControllerProps(name = WaterFallComponentName.PROPERTY_COLUMN_SPACING, defaultType = HippyControllerProps.NUMBER, defaultNumber = 0)
    public void setColumnSpacing(HippyWaterfallView listview, int spacing) {
        ((HippyWaterfallLayoutManager) listview.getLayoutManager())
                .setColumnSpacing(dpToPx(spacing));
    }

    @HippyControllerProps(name = "paddingStartZero", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = true)
    public void setPaddingStartZero(HippyWaterfallView listview, boolean paddingStartZero) {
        ((HippyWaterfallLayoutManager) listview.getLayoutManager())
                .setPaddingStartZero(paddingStartZero);
    }

    @HippyControllerProps(name = "bannerViewMatch", defaultType = HippyControllerProps.BOOLEAN)
    public void setBannerViewMatch(HippyWaterfallView listview, boolean bannerViewMatch) {
        ((HippyWaterfallLayoutManager) listview.getLayoutManager())
                .setBannerViewMatch(bannerViewMatch);
    }

    @HippyControllerProps(name = WaterFallComponentName.PROPERTY_COLUMNS, defaultType = HippyControllerProps.NUMBER, defaultNumber = 2)
    public void setNumberOfColumns(HippyWaterfallView listview, int number) {
        ((HippyWaterfallLayoutManager) listview.getLayoutManager()).setColumns(number);
    }

    @HippyControllerProps(name = "enableLoadingFooter")
    public void setEnableLoadingFooter(HippyWaterfallView listView, boolean enableFooter) {
        if (enableFooter) {
            listView.mEnableFooter = true;
            listView.setLoadingStatus(IRecyclerViewFooter.LOADING_STATUS_FINISH, "");
        } else {
            listView.setLoadingStatus(IRecyclerViewFooter.LOADING_STATUS_NONE, "");
            listView.mEnableFooter = false;
        }
    }

    @HippyControllerProps(name = "enableRefresh")
    public void setEnableRefresh(HippyWaterfallView listView, boolean enableRefresh) {
        if (enableRefresh && listView.mEnableRefresh) {
            return;
        }
        listView.setRefreshEnabled(enableRefresh);
    }

    @HippyControllerProps(name = "refreshColors")
    public void setRefreshColors(HippyWaterfallView listView, HippyArray refreshColors) {
        listView.setRefreshColors(refreshColors);
    }

    @HippyControllerProps(name = "refreshColor")
    public void setRefreshColor(HippyWaterfallView listView, int color) {
        listView.setCustomRefreshColor(color, 0, 0);
    }

    @HippyControllerProps(name = "preloadItemNumber")
    public void setPreloadItemNumber(HippyWaterfallView listView, int preloadItemNumber) {
        listView.setPreloadItemNumber(preloadItemNumber);
    }

    @HippyControllerProps(name = "enableOnScrollForReport")
    public void setEnableOnScrollForReport(HippyWaterfallView listView, boolean enable) {
        listView.setEnableScrollForReport(enable);
    }

    @HippyControllerProps(name = "enableExposureReport")
    public void setOnExposureReport(HippyWaterfallView listView, boolean enable) {
        listView.setEnableExposureReport(enable);
    }

    @HippyControllerProps(name = "scrollEventThrottle", defaultType = HippyControllerProps.NUMBER, defaultNumber = 30.0)
    public void setScrollEventThrottle(HippyWaterfallView listView, int scrollEventThrottle) {
        listView.setScrollEventThrottle(scrollEventThrottle);
    }

    @Override
    public void dispatchFunction(@NonNull HippyWaterfallView waterfallView, @NonNull String functionName,
            @NonNull HippyArray params) {
        dispatchFunction(waterfallView, functionName, params.getInternalArray());
    }

    @Override
    public void dispatchFunction(@NonNull HippyWaterfallView waterfallView,
            @NonNull String functionName, @NonNull List params) {
        super.dispatchFunction(waterfallView, functionName, params);
        switch (functionName) {
            case FUNC_END_REACHED_COMPLETED: {
                handleEndReachedCompleted(waterfallView, params);
                break;
            }
            case FUNC_START_REFRESH_WITH_TYPE: {
                int type = ArrayUtils.getIntValue(params, 0);
                waterfallView.startRefresh(type);
                break;
            }
            case FUNC_START_LOAD_MORE: {
                waterfallView.startLoadMore();
                break;
            }
            case FUNC_SCROLL_TO_INDEX: {
                handleScrollToIndex(waterfallView, params);
                break;
            }
            case FUNC_SCROLL_TO_CONTENT_OFFSET: {
                handleScrollToContentOffset(waterfallView, params);
                break;
            }
            case FUNC_CALL_EXPOSURE_REPORT: {
                waterfallView.onScrollStateChanged(waterfallView.getScrollState(),
                        waterfallView.getScrollState());
                break;
            }
            case FUNC_SET_REFRESH_PROMPT_INFO: {
                handleSetRefreshPromptInfo(waterfallView, params);
                break;
            }
            default:
                LogUtils.e(TAG, "Unknown function name: " + functionName);
        }
    }

    private void handleSetRefreshPromptInfo(@NonNull HippyWaterfallView waterfallView,
            @NonNull List params) {
        String descriptionText = ArrayUtils.getStringValue(params, 0);
        int descriptionTextColor = ArrayUtils.getIntValue(params, 1);
        int descriptionTextFontSize = ArrayUtils.getIntValue(params, 2);
        String imgUrl = ArrayUtils.getStringValue(params, 3);
        int imgWidth = ArrayUtils.getIntValue(params, 4);
        int imgHeight = ArrayUtils.getIntValue(params, 5);
        waterfallView.setRefreshPromptInfo(descriptionText, descriptionTextColor,
                descriptionTextFontSize, imgUrl, imgWidth, imgHeight);
    }

    private void handleScrollToContentOffset(@NonNull HippyWaterfallView waterfallView,
            @NonNull List params) {
        double xOffset = ArrayUtils.getDoubleValue(params, 0);
        double yOffset = ArrayUtils.getDoubleValue(params, 1);
        boolean animated = ArrayUtils.getBooleanValue(params, 2);
        waterfallView.scrollToContentOffset(xOffset, yOffset, animated);
    }

    private void handleScrollToIndex(@NonNull HippyWaterfallView waterfallView,
            @NonNull List params) {
        int xIndex = ArrayUtils.getIntValue(params, 0);
        int yIndex = ArrayUtils.getIntValue(params, 1);
        boolean animated = ArrayUtils.getBooleanValue(params, 2);
        waterfallView.scrollToIndex(xIndex, yIndex, animated);
    }

    private void handleEndReachedCompleted(@NonNull HippyWaterfallView waterfallView,
            @NonNull List params) {
        int status = ArrayUtils.getIntValue(params, 0);
        String text = ArrayUtils.getStringValue(params, 1);
        int refreshResult = 1;
        switch (status) {
            case 0:
                refreshResult = 2;
                break;
            case 1:
                refreshResult = 4;
                break;
            case 2:
                refreshResult = 6;
                break;
            case 3:
                refreshResult = 100;
                break;
            case 4:
                refreshResult = 0;
        }
        waterfallView.setLoadingStatus(refreshResult, text);
    }
}
