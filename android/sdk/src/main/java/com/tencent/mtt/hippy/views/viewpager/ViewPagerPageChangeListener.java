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

import com.tencent.mtt.hippy.views.viewpager.event.HippyPageScrollEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageScrollStateChangedEvent;
import com.tencent.mtt.hippy.views.viewpager.event.HippyPageSelectedEvent;
import com.tencent.mtt.supportui.views.viewpager.ViewPager;

/**
 * Created by ceasoncai on 2017/12/18.
 */

public class ViewPagerPageChangeListener implements ViewPager.OnPageChangeListener
{
	private HippyPageScrollEvent mPageScrollEmitter;
	private HippyPageScrollStateChangedEvent mPageScrollStateChangeEmitter;
	private HippyPageSelectedEvent mPageSelectedEmitter;

	public ViewPagerPageChangeListener(HippyViewPager pager)
	{
		mPageScrollEmitter = new HippyPageScrollEvent(pager);
		mPageScrollStateChangeEmitter = new HippyPageScrollStateChangedEvent(pager);
		mPageSelectedEmitter = new HippyPageSelectedEvent(pager);
	}

	@Override
	public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels)
	{
		mPageScrollEmitter.send(position, positionOffset);
	}

	@Override
	public void onPageSelected(int position)
	{
		mPageSelectedEmitter.send(position);
	}

	@Override
	public void onPageScrollStateChanged(int oldState, int newState)
	{
		String pageScrollState;
		switch (newState)
		{
			case ViewPager.SCROLL_STATE_IDLE:
				pageScrollState = "idle";
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
