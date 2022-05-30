package com.tencent.mtt.hippy.views.waterfalllist;

import android.view.View;
import com.tencent.renderer.utils.EventUtils;

/**
 * @author hengyangji
 *   on 2021/8/11
 */
public class WaterfallEndChecker {

  private boolean isVerticalEnd = false;
  public void onScroll(HippyWaterfallView waterfallView, int y) {
    boolean currentVerticalEnd = checkVerticalEnd(waterfallView, y);
    if (!isVerticalEnd && currentVerticalEnd) {
      EventUtils.sendComponentEvent(waterfallView, EventUtils.EVENT_WATERFALL_END_REACHED, null);
    }
    isVerticalEnd = currentVerticalEnd;
  }

  private boolean checkVerticalEnd(HippyWaterfallView waterfallView, int y) {
    HippyWaterfallLayoutManager layoutManager = (HippyWaterfallLayoutManager)waterfallView.getLayoutManager();
    int lastVisibleItemPosition = layoutManager.findLastVisibleItemPosition();
    boolean scrollToLastItem = lastVisibleItemPosition == layoutManager.getItemCount() - 1;
    if (scrollToLastItem) { //滑到最后一位了
      View lastView = waterfallView.findViewByPosition(lastVisibleItemPosition);
      return lastView.getBottom() <= waterfallView.getBottom();
    }
    return false;
  }
}


