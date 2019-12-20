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
package com.tencent.mtt.hippy.views.scroll;

import android.animation.ValueAnimator;
import android.content.Context;
import android.os.Build;
import android.view.MotionEvent;
import android.widget.ScrollView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.PixelUtil;

public class HippyVerticalScrollView extends ScrollView implements HippyViewBase,HippyScrollView
{

	private NativeGestureDispatcher	mGestureDispatcher;

	private boolean					mScrollEnabled = true;

	private boolean					mDoneFlinging;

	private boolean					mDragging;

	private HippyOnScrollHelper		mHippyOnScrollHelper;

	private boolean					mScrollEventEnable				= true;

	private boolean					mScrollBeginDragEventEnable		= false;

	private boolean					mScrollEndDragEventEnable		= false;

	private boolean					mMomentumScrollBeginEventEnable	= false;

	private boolean					mMomentumScrollEndEventEnable	= false;

	private boolean					mScrollAnimationEndEventEnable	= false;

	private boolean					mFlingEnabled					= true;

	protected int					mScrollEventThrottle			= 400; // 400ms最多回调一次
	private long					mLastScrollEventTimeStamp		= -1;

	public HippyVerticalScrollView(Context context)
	{
		super(context);
		mHippyOnScrollHelper = new HippyOnScrollHelper();
		setVerticalScrollBarEnabled(false);
	}

	public void setScrollEnabled(boolean enabled)
	{
		this.mScrollEnabled = enabled;
	}

	@Override
	public void showScrollIndicator(boolean showScrollIndicator) {
		this.setVerticalScrollBarEnabled(showScrollIndicator);
	}

	public void setScrollEventThrottle(int scrollEventThrottle)
	{
		mScrollEventThrottle = scrollEventThrottle;
	}

	@Override
	public void callSmoothScrollTo(final int x, final int y,int duration) {
		if(duration > 0 )
		{
			ValueAnimator realSmoothScrollAnimation =
					ValueAnimator.ofInt(getScrollY(), y);
			realSmoothScrollAnimation.setDuration(duration);
			realSmoothScrollAnimation.addUpdateListener(new ValueAnimator.AnimatorUpdateListener()
			{
				@Override
				public void onAnimationUpdate(ValueAnimator animation)
				{
					int scrollTo = (Integer) animation.getAnimatedValue();
					HippyVerticalScrollView.this.scrollTo(x, scrollTo);
				}
			});
			realSmoothScrollAnimation.start();
		}
		else
		{
		smoothScrollTo(x,y);
		}
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
		setMeasuredDimension(
				MeasureSpec.getSize(widthMeasureSpec),
				MeasureSpec.getSize(heightMeasureSpec));
	}

	@Override
	protected void onLayout(boolean changed, int l, int t, int r, int b) {
		// Call with the present values in order to re-layout if necessary
		scrollTo(getScrollX(), getScrollY());
	}

	@Override
	public boolean onTouchEvent(MotionEvent event)
	{
		int action = event.getAction() & MotionEvent.ACTION_MASK;
		if(action == MotionEvent.ACTION_DOWN && !mDragging)
		{
			mDragging = true;
			if (mScrollBeginDragEventEnable)
			{
				HippyScrollViewEventHelper.emitScrollBeginDragEvent(this);
			}
			// 当手指触摸listview时，让父控件交出ontouch权限,不能滚动
			setParentScrollableIfNeed(false);
		}
		else if (action == MotionEvent.ACTION_UP && mDragging)
		{
			if (mScrollEndDragEventEnable)
			{
				HippyScrollViewEventHelper.emitScrollEndDragEvent(this);
			}
			// 当手指松开时，让父控件重新获取onTouch权限
			setParentScrollableIfNeed(true);
			mDragging = false;
		}

		boolean result = mScrollEnabled ? super.onTouchEvent(event) : false;
		if (mGestureDispatcher != null)
		{
			result |= mGestureDispatcher.handleTouchEvent(event);
		}
		return result;
	}

	@Override
	public boolean onInterceptTouchEvent(MotionEvent event)
	{
		if (!mScrollEnabled)
		{
			return false;
		}
		if (super.onInterceptTouchEvent(event))
		{
			if (mScrollBeginDragEventEnable)
			{
				HippyScrollViewEventHelper.emitScrollBeginDragEvent(this);
			}
			mDragging = true;
			return true;
		}
		return false;
	}

	// 设置父控件是否可以获取到触摸处理权限
	private void setParentScrollableIfNeed(boolean flag) {
		// 若自己能上下滚动
		if (canScrollVertically(-1) || canScrollVertically(1))
			getParent().requestDisallowInterceptTouchEvent(!flag);
	}

	@Override
	public NativeGestureDispatcher getGestureDispatcher()
	{
		return mGestureDispatcher;
	}

	@Override
	public void setGestureDispatcher(NativeGestureDispatcher dispatcher)
	{
		mGestureDispatcher = dispatcher;
	}

	@Override
	protected void onScrollChanged(int x, int y, int oldX, int oldY)
	{
		super.onScrollChanged(x, y, oldX, oldY);
		if (mHippyOnScrollHelper.onScrollChanged(x, y))
		{
			if (mScrollEventEnable)
			{
				long currTime = System.currentTimeMillis();
				if (currTime - mLastScrollEventTimeStamp < mScrollEventThrottle)
				{
					return;
				}

				mLastScrollEventTimeStamp = currTime;
				HippyScrollViewEventHelper.emitScrollEvent(this);
			}

			mDoneFlinging = false;
		}

	}

	@Override
	public void fling(int velocityY)
	{
		if(!mFlingEnabled)
		{
			return;
		}

		super.fling(velocityY);
		if (mMomentumScrollBeginEventEnable)
		{
			HippyScrollViewEventHelper.emitScrollMomentumBeginEvent(this);
		}
		Runnable runnable = new Runnable()
		{
			@Override
			public void run()
			{
				if (mDoneFlinging)
				{
					if (mMomentumScrollEndEventEnable)
					{
						HippyScrollViewEventHelper.emitScrollMomentumEndEvent(HippyVerticalScrollView.this);
					}
				}
				else
				{
					mDoneFlinging = true;
					if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN)
					{
						postOnAnimationDelayed(this, HippyScrollViewEventHelper.MOMENTUM_DELAY);
					}
					else
					{
						HippyVerticalScrollView.this.getHandler().postDelayed(this, HippyScrollViewEventHelper.MOMENTUM_DELAY);
					}
				}
			}
		};
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN)
		{
			postOnAnimationDelayed(runnable, HippyScrollViewEventHelper.MOMENTUM_DELAY);
		}
		else
		{
			this.getHandler().postDelayed(runnable, HippyScrollViewEventHelper.MOMENTUM_DELAY);
		}
	}

	@Override
	public void computeScroll()
	{
		super.computeScroll();
	}

	public void setScrollEventEnable(boolean enable)
	{
		this.mScrollEventEnable = enable;
	}

	public void setScrollBeginDragEventEnable(boolean enable)
	{
		this.mScrollBeginDragEventEnable = enable;
	}

	public void setScrollEndDragEventEnable(boolean enable)
	{
		this.mScrollEndDragEventEnable = enable;
	}

	public void setMomentumScrollBeginEventEnable(boolean enable)
	{
		this.mMomentumScrollBeginEventEnable = enable;
	}

	public void setMomentumScrollEndEventEnable(boolean enable)
	{
		this.mMomentumScrollEndEventEnable = enable;
	}

	public void setScrollAnimationEndEventEnable(boolean enable)
	{
		this.mScrollAnimationEndEventEnable = enable;
	}

	public void setFlingEnabled(boolean flag)
	{
		this.mFlingEnabled = flag;
	}

	@Override
	public void setContentOffset4Reuse(HippyMap offsetMap) {
		double offset = offsetMap.getDouble("y");
		scrollTo(0, (int) PixelUtil.dp2px(offset));
	}

	@Override
	public void setPagingEnabled(boolean pagingEnabled) {

	}
}
