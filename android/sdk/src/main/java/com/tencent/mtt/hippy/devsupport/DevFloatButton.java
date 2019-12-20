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
package com.tencent.mtt.hippy.devsupport;

import android.animation.ObjectAnimator;
import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Color;
import android.graphics.drawable.ShapeDrawable;
import android.graphics.drawable.StateListDrawable;
import android.graphics.drawable.shapes.RoundRectShape;
import android.os.Build;
import android.os.Looper;
import android.os.MessageQueue;
import android.util.DisplayMetrics;
import android.util.TypedValue;
import android.view.MotionEvent;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.utils.LogUtils;

/**
 * @author: edsheng
 * @date: 2017/11/14 20:20
 * @version: V1.0
 */

public class DevFloatButton extends ImageView implements ValueAnimator.AnimatorUpdateListener, ViewTreeObserver.OnGlobalLayoutListener
{

	private int	mParentWidth	= -1;
	private int	mParentHeight	= -1;
	int			mStartX;
	int			mStartY;
	int			mLastLeft		= 0;
	int			mLastRight		= 0;
	int			mLastTop		= 0;
	int			mLastBottom		= 0;

	int			mWidth			= 0;
	final int	SIZE			= 30;
	final int	TOUCH_SLOP		= ViewConfiguration.getTouchSlop();


	/**
	 * 构建背景Drawble
	 */
	private void buildDrawableState()
	{

		int[] mNormalState = new int[] {};
		int[] mFocusedSate = new int[] { android.R.attr.state_focused, android.R.attr.state_enabled };

		//默认文字和背景颜色
		int mBgNormalColor = Color.parseColor("#ddd9d9");
		int mBgFocusedColor = Color.GREEN;
		//创建状态管理器
		StateListDrawable drawable = new StateListDrawable();
		int radius = mWidth / 2;
		float outRect[] = new float[] { radius, radius, radius, radius, radius, radius, radius, radius };
		RoundRectShape rectShape = new RoundRectShape(outRect, null, null);

		/**
		 * 注意StateListDrawable的构造方法我们这里使用的
		 * 是第一参数它是一个float的数组保存的是圆角的半径，它是按照top-left顺时针保存的八个值
		 */
		//创建圆弧形状
		//创建drawable
		ShapeDrawable pressedDrawable = new ShapeDrawable(rectShape);
		//设置我们按钮背景的颜色
		pressedDrawable.getPaint().setColor(mBgFocusedColor);
		//添加到状态管理里面
		drawable.addState(mFocusedSate, pressedDrawable);


		ShapeDrawable normalDrawable = new ShapeDrawable(rectShape);
		normalDrawable.getPaint().setColor(mBgNormalColor);
		drawable.addState(mNormalState, normalDrawable);
		//设置我们的背景，就是xml里面的selector
		setBackgroundDrawable(drawable);

		Looper.getMainLooper().myQueue().addIdleHandler(new MessageQueue.IdleHandler()
		{
			@Override
			public boolean queueIdle()
			{
				boolean result = requestFocusFromTouch();
				LogUtils.d("requestFocus", "requestFocusFromTouch result:" + result);
				if (!result)
				{
					result = requestFocus();
					LogUtils.d("requestFocus", "requestFocus result:" + result);
				}
				return false;
			}
		});
	}

	float dip2px(Context context, int dip)
	{
		DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
		return TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, dip, displayMetrics);
	}

	public DevFloatButton(Context context)
	{
		super(context);
		mWidth = (int) dip2px(context, SIZE);
		buildBackground();

		setFocusable(true);
	}

	private void buildBackground()
	{
		buildDrawableState();
	}

	@Override
	protected void onDetachedFromWindow()
	{
		super.onDetachedFromWindow();
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN)
		{
			getViewTreeObserver().removeOnGlobalLayoutListener(this);
		}
		else
		{
			getViewTreeObserver().removeGlobalOnLayoutListener(this);
		}
	}

	@Override
	protected void onAttachedToWindow()
	{
		setLayoutParams(getMarginLayoutParams());
		getViewTreeObserver().addOnGlobalLayoutListener(this);
		super.onAttachedToWindow();

		ViewParent parent = getParent();
		// 如果本button是临时add到HippyRootView上的，那么就要摘到RootView上去
		if (parent instanceof HippyRootView)
		{
			ViewGroup rootView = (ViewGroup) getRootView();
			// 如果HippyRootView已经是RootView了，那就不改变了
			if (rootView != parent)
			{
				((HippyRootView) parent).removeView(this);
				rootView.addView(this);
			}
		}
	}

	@Override
	public boolean onTouchEvent(MotionEvent event)
	{
		int action = event.getAction();
		switch (action)
		{
			case MotionEvent.ACTION_DOWN:
				getParent().requestDisallowInterceptTouchEvent(true);
				mStartX = (int) event.getRawX();
				mStartY = (int) event.getRawY();
				mLastLeft = getLeft();
				mLastRight = getRight();
				mLastTop = getTop();
				mLastBottom = getBottom();
				break;
			case MotionEvent.ACTION_MOVE:
				int dx = (int) event.getRawX() - mStartX;
				int dy = (int) event.getRawY() - mStartY;

				int left = mLastLeft + dx;
				int top = mLastTop + dy;
				int right = mLastRight + dx;
				int bottom = mLastBottom + dy;
				if (left < 0)
				{
					left = 0;
					right = left + this.getWidth();
				}
				if (right > mParentWidth)
				{
					right = mParentWidth;
					left = right - this.getWidth();
				}
				if (top < 0)
				{
					top = 0;
					bottom = top + this.getHeight();
				}
				if (bottom > mParentHeight)
				{
					bottom = mParentHeight;
					top = bottom - this.getHeight();
				}
				this.layout(left, top, right, bottom);
				break;
			case MotionEvent.ACTION_UP:
			case MotionEvent.ACTION_CANCEL:
				getParent().requestDisallowInterceptTouchEvent(false);
				if (getLeft() > mParentWidth / 2)
				{
					//往右边靠
					ValueAnimator objectAnimator = ObjectAnimator.ofInt(getLeft(), mParentWidth - getWidth());
					objectAnimator.addUpdateListener(this);
					objectAnimator.start();
				}
				else
				{
					ValueAnimator objectAnimator = ObjectAnimator.ofInt(getLeft(), 0);
					objectAnimator.addUpdateListener(this);
					objectAnimator.start();
					//往 左边靠
				}
				int endX = (int) event.getRawX();
				int endY = (int) event.getRawY();
				if (Math.abs(mStartX - endX) > TOUCH_SLOP || Math.abs(mStartY - endY) > TOUCH_SLOP)
				{
					//click
					return true;
				}

				break;
		}
		return super.onTouchEvent(event);
	}


	private ViewGroup.MarginLayoutParams getMarginLayoutParams()
	{
		if (getParent() != null)
		{
			ViewGroup.LayoutParams layoutParams = getLayoutParams();
			if (layoutParams instanceof FrameLayout.LayoutParams)
			{
				FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(mWidth, mWidth);
				params.topMargin = mWidth;
				return params;
			}
			else if (layoutParams instanceof LinearLayout.LayoutParams)
			{
				LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(mWidth, mWidth);
				params.topMargin = mWidth;
				return params;
			}
			else if (layoutParams instanceof RelativeLayout.LayoutParams)
			{
				RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(mWidth, mWidth);
				params.topMargin = mWidth;
				return params;
			}
			else
			{
				ViewGroup.MarginLayoutParams params = new ViewGroup.MarginLayoutParams(mWidth, mWidth);
				params.topMargin = mWidth;
				return params;
			}
		}
		else
		{
			ViewGroup.MarginLayoutParams params = new ViewGroup.MarginLayoutParams(mWidth, mWidth);
			params.topMargin = mWidth;
			return params;
		}
	}

	@Override
	public void onAnimationUpdate(ValueAnimator animation)
	{
		Object valueObject = animation.getAnimatedValue();

		if (valueObject != null && valueObject instanceof Number)
		{
			int value = ((Number) valueObject).intValue();
			this.layout(value, getTop(), value + getWidth(), getBottom());
		}
	}

	@Override
	public void onGlobalLayout()
	{
		mParentWidth = ((ViewGroup) getParent()).getWidth();
		mParentHeight = ((ViewGroup) getParent()).getHeight();
	}
}
