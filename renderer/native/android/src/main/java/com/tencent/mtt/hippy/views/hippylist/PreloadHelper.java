package com.tencent.mtt.hippy.views.hippylist;

import static com.tencent.mtt.hippy.views.hippylist.PullFooterEventHelper.EVENT_ON_END_REACHED;

import androidx.recyclerview.widget.RecyclerView;
import android.view.View;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;

public class PreloadHelper extends RecyclerView.OnScrollListener {

  protected HippyRecyclerView hippyRecyclerView;
  protected int preloadItemNumber;
  protected boolean isPreloading;

  public PreloadHelper(HippyRecyclerView hippyRecyclerView) {
    this.hippyRecyclerView = hippyRecyclerView;
  }

  @Override
  public void onScrolled(RecyclerView recyclerView, int dx, int dy) {
    int itemCount = recyclerView.getAdapter().getItemCount();
    //频控，记录上次预加载的总条目数，相同就不再次触发预加载
    if (isPreloading) {
      return;
    }
    if (hippyRecyclerView.getAdapter().getRenderNodeCount() > 0) {
      View lastChild = recyclerView.getChildAt(recyclerView.getChildCount() - 1);
      int lastPosition = recyclerView.getChildAdapterPosition(lastChild);
      if (lastPosition + preloadItemNumber >= itemCount) {
        isPreloading = true;
        sendReachEndEvent(recyclerView);
      }
    }
  }

  public void sendReachEndEvent(RecyclerView recyclerView) {
    new HippyViewEvent(EVENT_ON_END_REACHED).send((View) recyclerView.getParent(), null);
  }

  /**
   * @param preloadItemNumber 提前多少条Item，通知前端加载下一页数据
   */
  public void setPreloadItemNumber(int preloadItemNumber) {
    this.preloadItemNumber = preloadItemNumber;
    hippyRecyclerView.removeOnScrollListener(this);
    if (preloadItemNumber > 0) {
      hippyRecyclerView.addOnScrollListener(this);
    }
  }

  public void reset() {
    isPreloading = false;
  }
}
