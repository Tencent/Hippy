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
import android.view.ViewGroup;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.supportui.views.viewpager.ViewPager;
import com.tencent.mtt.supportui.views.viewpager.ViewPagerAdapter;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by ceasoncai on 2017/12/15.
 */

public class HippyViewPagerAdapter extends ViewPagerAdapter
{
	private static final String		TAG				= "HippyViewPagerAdapter";
	private static final int MIN_LOOP_SIZE = 4;
  private static final int LOOP_COUNT_FACTOR = 1000;
  private static final int INIT_ITEM_FACTOR = 100;

	protected List<View>			mViews			= new ArrayList<View>();

	private int						mChildSize		= 0;

	private int						mInitPageIndex	= 0;
	private HippyInstanceContext	mEngineContext;

	protected HippyViewPager		mViewPager;

	private boolean mLoop;


	public HippyViewPagerAdapter(HippyInstanceContext context, HippyViewPager viewPager)
	{
		mEngineContext = context;
		mViewPager = viewPager;
	}

  protected void setLoop(boolean loop) {
    mLoop = loop;
  }

  private boolean enableLoop() {
    return mLoop && getItemViewSize() >= MIN_LOOP_SIZE;
  }

	public void setChildSize(int size)
	{
		mChildSize = size;
	}

	public void setInitPageIndex(int index)
	{
		mInitPageIndex = index;
	}

	protected void addView(HippyViewPagerItem view, int position)
	{
		if (view != null && position >= 0)
		{
			if (position >= mViews.size())
			{
				mViews.add(view);
			}
			else
			{
				mViews.add(position, view);
			}
		}
	}

	protected void removeViewAtIndex(int postion)
	{
		if (postion >= 0 && postion < mViews.size())
		{
			mViews.remove(postion);
		}
	}

	protected void removeView(View view)
	{
		int size = mViews.size();
		int index = -1;
		for (int i = 0; i < size; i++)
		{
			View curr = getViewAt(i);
			if (curr == view)
			{
				index = i;
				break;
			}
		}

		if (index >= 0)
		{
			mViews.remove(index);
		}
	}

	protected View getViewAt(int index)
	{
		if (mViews == null || index < 0 || index >= mViews.size())
		{
			return null;
		}
		return mViews.get(index);
	}

	protected int getItemViewSize()
	{
		return mViews == null ? 0 : mViews.size();
	}

  @Override
  public int getCount() {
    if (enableLoop()) {
      return mChildSize * LOOP_COUNT_FACTOR;
    }
    return mChildSize;
  }

	@Override
	public int getItemPosition(Object object)
	{
		if (mViews == null || mViews.isEmpty())
		{
			return POSITION_NONE;
		}
		int index = mViews.indexOf(object);
		if (index < 0)
		{
			return POSITION_NONE;
		}
		return index;
	}

	@Override
	public Object instantiateItem(ViewGroup container, int position)
	{
	  position = tryToUpdatePos(position);

		View viewWrapper = null;
		if (mViews != null && position < mViews.size())
		{
			viewWrapper = mViews.get(position);
		}

		if (viewWrapper != null && viewWrapper.getParent() == null)
		{
			container.addView(viewWrapper, new ViewPager.LayoutParams());
			mViewPager.triggerRequestLayout();
		}
		else
		{
			viewWrapper = null;
		}

		return viewWrapper;
	}

  private int tryToUpdatePos(int position) {
    if (enableLoop()) {
      return position % getItemViewSize();
    }
    return position;
  }

  @Override
  public int getInitialItemIndex() {
    if (enableLoop()) {
      return mInitPageIndex + getItemViewSize() * INIT_ITEM_FACTOR;
    }
    return mInitPageIndex;
  }

	@Override
	public void destroyItem(ViewGroup container, int position, Object object)
	{
		if (object instanceof View)
		{
			View view = (View) object;
			if (view != null)
			{
				view.layout(0, 0, 0, 0);
				container.removeView(view);
			}
		}

	}

	@Override
	public boolean isViewFromObject(View view, Object object)
	{
		return view == object;
	}
}
