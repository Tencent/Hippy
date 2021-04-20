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
package com.tencent.mtt.hippy.views.viewpager;

import android.view.View;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageItemExposureEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageScrollEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageScrollStateChangedEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageSelectedEvent;
import com.tencent.mtt.supportui.views.viewpager.ViewPager;

/**
 * Created by ceasoncai on 2017/12/18.
 */

public class ViewPagerPageChangeListener implements ViewPager.OnPageChangeListener
{
	private final HippyPageScrollEvent mPageScrollEmitter;
	private final HippyPageScrollStateChangedEvent mPageScrollStateChangeEmitter;
	private final HippyPageSelectedEvent mPageSelectedEmitter;
	private int mLastPageIndex;
	private int mCurrPageIndex;
	private final HippyViewPager mPager;

	public ViewPagerPageChangeListener(HippyViewPager pager)
	{
    mPager = pager;
		mPageScrollEmitter = new HippyPageScrollEvent(pager);
		mPageScrollStateChangeEmitter = new HippyPageScrollStateChangedEvent(pager);
		mPageSelectedEmitter = new HippyPageSelectedEvent(pager);
    mLastPageIndex = 0;
    mCurrPageIndex = 0;
	}

	@Override
	public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels)
	{
		mPageScrollEmitter.send(position, positionOffset);
	}

	@Override
	public void onPageSelected(int position)
	{
    mCurrPageIndex = position;
		mPageSelectedEmitter.send(position);
    if (mPager != null) {
      View currView = mPager.getViewFromAdapter(mCurrPageIndex);
      HippyPageItemExposureEvent eventWillAppear = new HippyPageItemExposureEvent(HippyPageItemExposureEvent.EVENT_PAGER_ITEM_WILL_APPEAR);
      eventWillAppear.send(currView, mCurrPageIndex);

      View lastView = mPager.getViewFromAdapter(mLastPageIndex);
      HippyPageItemExposureEvent eventWillDisAppear = new HippyPageItemExposureEvent(HippyPageItemExposureEvent.EVENT_PAGER_ITEM_WILL_DISAPPEAR);
      eventWillDisAppear.send(lastView, mLastPageIndex);
    }
	}

	private void onScrollStateChangeToIdle() {
    if (mPager != null && mCurrPageIndex != mLastPageIndex) {
      Promise promise = mPager.getCallBackPromise();
      if (promise != null) {
        String msg = "on set index successful!";
        HippyMap resultMap = new HippyMap();
        resultMap.pushString("msg", msg);
        promise.resolve(resultMap);
        mPager.setCallBackPromise(null);
      }

      View currView = mPager.getViewFromAdapter(mCurrPageIndex);
      HippyPageItemExposureEvent eventWillAppear = new HippyPageItemExposureEvent(HippyPageItemExposureEvent.EVENT_PAGER_ITEM_DID_APPEAR);
      eventWillAppear.send(currView, mCurrPageIndex);

      View lastView = mPager.getViewFromAdapter(mLastPageIndex);
      HippyPageItemExposureEvent eventWillDisAppear = new HippyPageItemExposureEvent(HippyPageItemExposureEvent.EVENT_PAGER_ITEM_DID_DISAPPEAR);
      eventWillDisAppear.send(lastView, mLastPageIndex);

      mLastPageIndex = mCurrPageIndex;
    }
  }

	@Override
	public void onPageScrollStateChanged(int oldState, int newState)
	{
		String pageScrollState;
		switch (newState)
		{
			case ViewPager.SCROLL_STATE_IDLE:
				pageScrollState = "idle";
        onScrollStateChangeToIdle();
				break;
			case ViewPager.SCROLL_STATE_DRAGGING:
				pageScrollState = "dragging";
				break;
			case ViewPager.SCROLL_STATE_SETTLING:
				pageScrollState = "settling";
				break;
			default:
				throw new IllegalStateException("Unsupported pageScrollState");
		}

		mPageScrollStateChangeEmitter.send(pageScrollState);
	}
}
