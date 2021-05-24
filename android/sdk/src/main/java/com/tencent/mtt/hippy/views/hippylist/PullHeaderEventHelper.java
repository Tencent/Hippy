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

import android.view.Gravity;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.PullHeaderRenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.nxeasy.recyclerview.helper.header.HeaderRefreshHelper;
import com.tencent.mtt.nxeasy.recyclerview.helper.header.IHeaderRefreshListener;
import com.tencent.mtt.nxeasy.recyclerview.helper.header.IHeaderRefreshView;
import com.tencent.mtt.nxeasy.recyclerview.helper.header.ILayoutRequester;

class PullHeaderEventHelper implements IHeaderRefreshListener, IHeaderRefreshView,
    ILayoutRequester {

  public static final String EVENT_TYPE_HEADER_PULLING = "onHeaderPulling";
  public static final String EVENT_TYPE_HEADER_RELEASED = "onHeaderReleased";
  private final PullHeaderRenderNode renderNode;
  private HippyRecyclerView recyclerView;
  private View renderNodeView;
  private LinearLayout headerContainer;
  private LayoutParams contentLayoutParams;
  private HeaderRefreshHelper headerRefreshHelper;

  PullHeaderEventHelper(HippyRecyclerView recyclerView, PullHeaderRenderNode renderNode) {
    this.recyclerView = recyclerView;
    this.renderNode = renderNode;
    headerContainer = new LinearLayout(recyclerView.getContext());
    headerRefreshHelper = new HeaderRefreshHelper();
    headerRefreshHelper.setHeaderRefreshView(this);
    headerRefreshHelper.setHeaderRefreshListener(this);
    headerRefreshHelper.setLayoutRequester(this);
    recyclerView.setOnTouchListener(headerRefreshHelper);
  }

  public void setRenderNodeView(View renderNodeView) {
    if (this.renderNodeView != renderNodeView) {
      this.renderNodeView = renderNodeView;
      headerContainer.removeAllViews();
      contentLayoutParams = new LayoutParams(LayoutParams.MATCH_PARENT, renderNode.getHeight());
      contentLayoutParams.gravity = Gravity.BOTTOM;
      headerContainer.addView(renderNodeView, contentLayoutParams);
    }
  }


  public View getView() {
    return headerContainer;
  }

  @Override
  public void onStartDrag() {

  }

  @Override
  public void onHeaderHeightChanged(int sumOffset) {
    HippyMap params = new HippyMap();
    params.pushDouble("contentOffset", PixelUtil.px2dp(sumOffset));
    sendPullHeaderEvent(EVENT_TYPE_HEADER_PULLING, params);
  }

  @Override
  public void onRefreshing() {

  }

  @Override
  public void onFolded() {

  }

  /**
   * 松手后，触发的刷新回调，需要通知Hippy前端业务进行数据的刷新操作
   */
  @Override
  public void onHeaderRefreshing(int refreshWay) {
    sendPullHeaderEvent(EVENT_TYPE_HEADER_RELEASED, new HippyMap());
  }

  @Override
  public int getContentHeight() {
    return renderNode.getHeight();
  }

  protected void sendPullHeaderEvent(String eventName, HippyMap param) {
    new HippyViewEvent(eventName).send(renderNodeView, param);
  }

  /**
   * Hippy前端业务通知数据已经刷新完毕，这里通知给headerRefreshHelper，进行header的收起功能
   */
  public void onHeaderRefreshFinish() {
    headerRefreshHelper.onRefreshDone();
  }

  /**
   * Hippy前端业务调用主动刷新功能，这款需要通知headerRefreshHelper进行自动下拉刷新
   */
  public void onHeaderRefresh() {
    headerRefreshHelper.triggerRefresh();
  }

  @Override
  public void requestLayout() {
    recyclerView.dispatchLayout();
  }
}
