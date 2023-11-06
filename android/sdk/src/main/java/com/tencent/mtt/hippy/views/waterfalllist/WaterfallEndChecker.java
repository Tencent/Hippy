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


