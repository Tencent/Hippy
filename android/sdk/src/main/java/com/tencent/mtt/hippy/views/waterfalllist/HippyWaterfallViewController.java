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
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.supportui.views.recyclerview.IRecyclerViewFooter;

@HippyController(name = WaterFallComponentName.CONTAINER)
public class HippyWaterfallViewController extends HippyViewController<HippyWaterfallView> {

  static final String TAG = WaterFallComponentName.CONTAINER;

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
  public RenderNode createRenderNode(int id, HippyMap props, String className,
    HippyRootView hippyRootView, ControllerManager controllerManager,
    boolean lazy) {
    return new HippyWaterfallViewNode(id, props, className, hippyRootView, controllerManager,
      lazy);
  }

  @Override
  public void onBatchComplete(HippyWaterfallView view) {
    Log.d(TAG, "onBatchComplete #" + view.getId());
    super.onBatchComplete(view);
    view.setListData();
  }

  @HippyControllerProps(name = "containBannerView", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
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

  @HippyControllerProps(name = "bannerViewMatch", defaultType = HippyControllerProps.BOOLEAN, defaultBoolean = false)
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

  // #lizard forgives
  @Override
  public void dispatchFunction(HippyWaterfallView listView, String functionName,
    HippyArray dataArray) {
    Log.e(TAG, "dispatchFunction " + functionName + dataArray.toString());
    super.dispatchFunction(listView, functionName, dataArray);

    int status;
    String text;
    int refreshResult;
    switch (functionName) {
      case "endReachedCompleted": { // 加载更多完成
        status = dataArray.getInt(0);
        text = dataArray.getString(1);
        refreshResult = 1;
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

        listView.setLoadingStatus(refreshResult, text);
        break;
      }
      case "refreshCompleted": {
        handleRefreshCompleted(listView, dataArray);
        break;
      }
      case "startRefresh": {
        Log.e("leo", "startRefresh");
//                listView.startRefresh(DEFAULT_REFRESH_TYPE);
        break;
      }
      case "startRefreshWithType": {
        int type = dataArray.getInt(0);
        listView.startRefresh(type);
        break;
      }
      case "startLoadMore": {
        listView.startLoadMore();
        break;
      }
      case "scrollToIndex": {
        int xIndex = dataArray.getInt(0);
        int yIndex = dataArray.getInt(1);
        boolean animated = dataArray.getBoolean(2);
        listView.scrollToIndex(xIndex, yIndex, animated);
        break;
      }
      case "scrollToContentOffset": {
        double xOffset = dataArray.getDouble(0);
        double yOffset = dataArray.getDouble(1);
        boolean animated = dataArray.getBoolean(2);
        listView.scrollToContentOffset(xOffset, yOffset, animated);
        break;
      }
      case "callExposureReport": {
        listView.onScrollStateChanged(listView.getScrollState(), listView.getScrollState());
        break;
      }
      case "setRefreshPromptInfo": {
        String descriptionText = dataArray.getString(0);
        int descriptionTextColor = dataArray.getInt(1);
        int descriptionTextFontSize = dataArray.getInt(2);
        String imgUrl = dataArray.getString(3);
        int imgWidth = dataArray.getInt(4);
        int imgHeight = dataArray.getInt(5);
        listView.setRefreshPromptInfo(descriptionText, descriptionTextColor,
          descriptionTextFontSize, imgUrl, imgWidth, imgHeight);
        break;
      }
      default:
        break;
    }
  }

  private void handleRefreshCompleted(HippyWaterfallView listView, HippyArray dataArray) {
  }
}
