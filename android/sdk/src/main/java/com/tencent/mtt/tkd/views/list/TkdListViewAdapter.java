package com.tencent.mtt.tkd.views.list;

import android.util.Log;
import android.view.View;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.UrlUtils;
import com.tencent.mtt.hippy.views.image.HippyImageViewController;
import com.tencent.mtt.hippy.views.list.HippyListAdapter;
import com.tencent.mtt.supportui.views.recyclerview.ContentHolder;
import com.tencent.mtt.supportui.views.recyclerview.IRecyclerViewFooter;
import com.tencent.mtt.supportui.views.recyclerview.LinearLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerView;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase;

/**
 * Created by leonardgong on 2017/12/15 0015.
 */

public class TkdListViewAdapter extends HippyListAdapter
{
	public TkdListViewAdapter(RecyclerView recyclerView, HippyEngineContext HippyContext)
	{
		super(recyclerView, HippyContext);
	}

  @Override
  public void notifyEndReached()
  {
    if (mParentRecyclerView instanceof TkdListView) {
      TkdListView listView = (TkdListView)mParentRecyclerView;
      if (!listView.isLoading() && listView.shouldEmitEndReachedEvent()) {
        getOnEndReachedEvent().send(mParentRecyclerView, null);
        listView.setIsLoading(true);
      }
    }
  }
}
