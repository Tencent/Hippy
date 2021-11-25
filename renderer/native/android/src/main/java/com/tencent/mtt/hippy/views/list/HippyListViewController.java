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
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.HippyViewController;
import com.tencent.mtt.hippy.uimanager.ListViewRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.supportui.views.recyclerview.BaseLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem;

import android.content.Context;
import android.view.View;
import android.view.ViewGroup;

@SuppressWarnings({"deprecation", "unused"})
@HippyController(name = HippyListViewController.CLASS_NAME)
public class HippyListViewController extends HippyViewController<HippyListView> {

  public static final String CLASS_NAME = "ListView";

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
  public void onBatchComplete(HippyListView view) {
    super.onBatchComplete(view);
    view.setListData();
  }

  @Override
  protected View createViewImpl(Context context) {
    return new HippyListView(context, BaseLayoutManager.VERTICAL);
  }

  @Override
  protected View createViewImpl(Context context, HippyMap iniProps) {
    boolean enableScrollEvent = false;
    int orientation = BaseLayoutManager.VERTICAL;
    if (iniProps != null) {
      if (iniProps.getBoolean("horizontal")) {
        orientation = BaseLayoutManager.HORIZONTAL;
      }
      enableScrollEvent = iniProps.getBoolean("onScroll");
    }
    HippyListView listView = new HippyListView(context, orientation);
    listView.setOnScrollEventEnable(enableScrollEvent);
    return listView;
  }

  @Override
  public RenderNode createRenderNode(int id, HippyMap props, String className,
          ViewGroup hippyRootView, ControllerManager controllerManager,
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
    view.setInitialContentOffset((int)PixelUtil.dp2px(offset));
  }

  @Override
  public void dispatchFunction(HippyListView view, String functionName, HippyArray dataArray) {
    super.dispatchFunction(view, functionName, dataArray);
    switch (functionName) {
      case "scrollToIndex": {
        // list滑动到某个item
        int xIndex = dataArray.getInt(0);
        int yIndex = dataArray.getInt(1);
        boolean animated = dataArray.getBoolean(2);
        int duration = dataArray.getInt(3); //1.2.7 增加滚动时间 ms,animated==true时生效
        view.scrollToIndex(xIndex, yIndex, animated, duration);
        break;
      }
      case "scrollToContentOffset": {
        // list滑动到某个距离
        double xOffset = dataArray.getDouble(0);
        double yOffset = dataArray.getDouble(1);
        boolean animated = dataArray.getBoolean(2);
        int duration = dataArray.getInt(3);  //1.2.7 增加滚动时间 ms,animated==true时生效
        view.scrollToContentOffset(xOffset, yOffset, animated, duration);
        break;
      }
      case "scrollToTop": {
        view.scrollToTop(null);
        break;
      }
    }
  }
}
