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

import android.view.View;
import com.tencent.mtt.hippy.views.waterfalllist.HippyWaterfallView.HippyWaterfallEvent;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;

/**
 * @author hengyangji
 *   on 2021/8/11
 */
public class WaterfallEndChecker {

  private boolean isVerticalEnd = false;
  public void reset() {
    isVerticalEnd = false;
  }

  public void check(HippyWaterfallView waterfallView) {
    boolean currentVerticalEnd = checkVerticalEnd(waterfallView);
    if (!isVerticalEnd && currentVerticalEnd) {
      new HippyWaterfallEvent("onEndReached").send(waterfallView, null);
    }
    isVerticalEnd = currentVerticalEnd;
  }

  private boolean checkVerticalEnd(HippyWaterfallView waterfallView) {
    HippyWaterfallLayoutManager layoutManager = (HippyWaterfallLayoutManager)waterfallView.getLayoutManager();
    int lastVisibleItemPosition = layoutManager.findLastVisibleItemPosition();
    RecyclerViewBase.Adapter adapter = waterfallView.getAdapter();
    int preloadItemNumber = adapter == null ? 0 : adapter.getPreloadThresholdInItemNumber();
    int endPosition = layoutManager.getItemCount() - 1;
    if (lastVisibleItemPosition > endPosition - preloadItemNumber) {
      return true;
    }
    boolean scrollToLastItem = lastVisibleItemPosition == endPosition;
    if (scrollToLastItem) { //滑到最后一位了
      View lastView = waterfallView.findViewByPosition(lastVisibleItemPosition);
      return lastView.getBottom() <= waterfallView.getBottom();
    }
    return false;
  }
}


