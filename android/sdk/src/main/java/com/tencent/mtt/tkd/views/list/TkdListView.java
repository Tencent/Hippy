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
package com.tencent.mtt.tkd.views.list;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.list.HippyListAdapter;
import com.tencent.mtt.hippy.views.list.HippyListView;
import com.tencent.mtt.hippy.views.scroll.HippyScrollViewEventHelper;
import com.tencent.mtt.supportui.views.recyclerview.LinearLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerView;
import android.content.Context;
import android.util.Log;
import android.view.MotionEvent;
import android.view.ViewTreeObserver;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public class TkdListView extends HippyListView
{
	public TkdListView(Context context)
	{
		super(context);
	}

	protected HippyListAdapter createAdapter(RecyclerView hippyRecyclerView, HippyEngineContext hippyEngineContext)
	{
		return new TkdListViewAdapter(hippyRecyclerView, hippyEngineContext);
	}

	@Override
	public void onScrollStateChanged(int oldState, int newState)
	{
		Log.e("maxli", "onScrollStateChanged: oldState=" + oldState + ", newState=" + newState);
		super.onScrollStateChanged(oldState, newState);
		checkExposureForReport(oldState, newState);
	}

	public void checkExposureForReport(int oldState, int newState)
	{
		if (getAdapter() != null) {
			((TkdListViewAdapter)getAdapter()).checkExposureForReport(oldState, newState);
		}
	}

	public void setEnableExposureReport(boolean enableExposureReport)
	{
		if (getAdapter() != null) {
			((TkdListViewAdapter)getAdapter()).setEnableExposureReport(enableExposureReport);
		}
	}

	@Override
	public void scrollToTopAtOnce()
	{
		super.scrollToTopAtOnce();
		checkExposureForReport(SCROLL_STATE_SETTLING, SCROLL_STATE_IDLE);
	}

	@Override
	public void scrollToPosition(int position)
	{
		super.scrollToPosition(position);
		checkExposureForReport(SCROLL_STATE_SETTLING, SCROLL_STATE_IDLE);
	}

	public static class ExposureForReport extends HippyViewEvent
	{
		public int			mStartEdgePos			= 0;
		public int			mEndEdgePos				= 0;
		public int			mFirstVisibleRowIndex	= 0;
		public int			mLastVisibleRowIndex	= 0;
		public int			mVelocity				= 0;
		public int			mScrollState			= 0;
		public HippyArray mVisibleRowFrames		= null;

		public ExposureForReport(int tag, int startEdgePos, int endEdgePos, int firstVisiblePos, int lastVisiblePos, int velocity, int scrollState,
								 HippyArray visibleItemArray)
		{
			super("onExposureReport");
			mStartEdgePos = startEdgePos;
			mEndEdgePos = endEdgePos;
			mFirstVisibleRowIndex = firstVisiblePos;
			mLastVisibleRowIndex = lastVisiblePos;
			mVelocity = velocity;
			mScrollState = scrollState;
			mVisibleRowFrames = visibleItemArray;
		}
	}
}
