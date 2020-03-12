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
	private boolean	mEnableScrollForReport;
	private boolean	mEnableExposureReport = true;
	private HippyMap mExposureReportResultMap;
	int mScrollEventThrottle = 400;
	int	mScrollForReportThrottle	= 200;

	public TkdListViewAdapter(RecyclerView recyclerView, HippyEngineContext HippyContext)
	{
		super(recyclerView, HippyContext);
	}

	protected void setEnableScrollForReport(boolean enableScrollForReport)
	{
		mEnableScrollForReport = enableScrollForReport;
	}

	protected void setEnableExposureReport(boolean enableExposureReport)
	{
		mEnableExposureReport = enableExposureReport;
	}

	public void setScrollEventThrottle(int scrollEventThrottle)
	{
		mScrollEventThrottle = scrollEventThrottle;
	}

	public void setScrollForReportThrottle(int scrollForReportThrottle)
	{
		mScrollForReportThrottle = scrollForReportThrottle;
	}

	// 检查是否通知前端标准曝光数据
	protected void checkExposureForReport(int oldState, int newState)
	{
		if (!mEnableExposureReport)
			return;

		TkdListView.ExposureForReport exposureForReport = getExposureForReportInner(oldState, newState);
		if (exposureForReport == null)
		{
			return;
		}
		if (checkNeedToReport(exposureForReport.mVelocity, newState))
		{

			if (mExposureReportResultMap == null)
			{
				mExposureReportResultMap = new HippyMap();
			}
			mExposureReportResultMap.clear();
			mExposureReportResultMap.pushInt("startEdgePos", exposureForReport.mStartEdgePos);
			mExposureReportResultMap.pushInt("endEdgePos", exposureForReport.mEndEdgePos);
			mExposureReportResultMap.pushInt("firstVisibleRowIndex", exposureForReport.mFirstVisibleRowIndex);
			mExposureReportResultMap.pushInt("lastVisibleRowIndex", exposureForReport.mLastVisibleRowIndex);
			//			reportData.putInt("velocity", mVelocity);
			mExposureReportResultMap.pushInt("scrollState", exposureForReport.mScrollState);
			mExposureReportResultMap.pushArray("visibleRowFrames", exposureForReport.mVisibleRowFrames);

			exposureForReport.send(mParentRecyclerView, mExposureReportResultMap);
		}
	}

	protected TkdListView.ExposureForReport getExposureForReportInner(int oldState, int newState)
	{
		if (!mEnableExposureReport)
			return null;

		int startEdgePos = (int) PixelUtil.px2dp(mParentRecyclerView.mOffsetY);
		int endEdgePos = (int) PixelUtil.px2dp(mParentRecyclerView.getHeight() + mParentRecyclerView.mOffsetY);
		int firstVisiblePos = ((LinearLayoutManager) mParentRecyclerView.getLayoutManager()).findFirstVisibleItemPosition();
		int lastVisiblePos = ((LinearLayoutManager) mParentRecyclerView.getLayoutManager()).findLastVisibleItemPosition();

		// 传入包含item frames的数组
		HippyArray visibleItemArray = new HippyArray();
		int baseHeight = 0;
		for (int i = 0; i < firstVisiblePos; i++)
		{
			baseHeight += getItemHeight(i);
			baseHeight += getItemMaigin(RecyclerViewBase.Adapter.LOCATION_TOP, i);
			baseHeight += getItemMaigin(RecyclerViewBase.Adapter.LOCATION_BOTTOM, i);
		}
		for (int i = firstVisiblePos; i <= lastVisiblePos; i++)
		{
			HippyMap itemData = new HippyMap();
			itemData.pushInt("x", 0);
			itemData.pushInt("y", (int) PixelUtil.px2dp(baseHeight));
			baseHeight += getItemHeight(i);
			itemData.pushInt("width", (int) PixelUtil.px2dp(getItemWidth(i)));
			itemData.pushInt("height", (int) PixelUtil.px2dp(getItemHeight(i)));

			visibleItemArray.pushMap(itemData);
		}

		float currentVelocity = Math.abs(mParentRecyclerView.mViewFlinger.getScroller().getCurrVelocity());
		return new TkdListView.ExposureForReport(mParentRecyclerView.getId(), startEdgePos, endEdgePos, firstVisiblePos, lastVisiblePos,
				(int) currentVelocity, newState, visibleItemArray);
	}

	protected boolean checkNeedToReport(float velocity, int scrollState)
	{
		return true;
	}

  @Override
  public void notifyEndReached()
  {

  }

  @Override
  public void onPreload()
  {
    // send onEndReached message here
    getOnEndReachedEvent().send(mParentRecyclerView, null);
  }
}
