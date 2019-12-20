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
package com.tencent.mtt.hippy.views.view;

import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.IHippyZIndexViewGroup;
import com.tencent.mtt.hippy.uimanager.ViewGroupDrawingOrderHelper;
import com.tencent.mtt.hippy.views.image.HippyImageView;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Path;
import android.graphics.RectF;
import android.os.Build;
import android.text.TextUtils;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;

/**
 * Created by leonardgong on 2017/11/29 0029.
 */

public class HippyViewGroup extends HippyImageView implements IHippyZIndexViewGroup
{

	private static final int					LAYER_TYPE_NOT_SET	= -1;
	private final ViewGroupDrawingOrderHelper	mDrawingOrderHelper;
	float										mDownX				= 0;
	float										mDownY				= 0;
	boolean										isHandlePullUp		= false;
	//	private CommonBackgroundDrawable			mBGDrawable;
	//	private NativeGestureDispatcher				mGestureDispatcher;
	private String								mOverflow;
	private Path								mOverflowPath;
	private RectF								mOverflowRect;
	private int									mOldLayerType;
	private ViewConfiguration					mViewConfiguration;

	public HippyViewGroup(Context context)
	{
		super(context);
		mDrawingOrderHelper = new ViewGroupDrawingOrderHelper(this);
		mOldLayerType = LAYER_TYPE_NOT_SET;
		setScaleType(ScaleType.ORIGIN);
	}

	//	@Override
	//	protected void onLayout(boolean changed, int l, int t, int r, int b)
	//	{
	//
	//	}

	//	@Override
	//	public void requestLayout()
	//	{
	//		//super.requestLayout();
	//	}

	@Override
	protected void dispatchDraw(Canvas canvas)
	{
		if (mOverflow != null)
		{
			switch (mOverflow)
			{
				case "visible":
					if (mOverflowPath != null)
					{
						mOverflowPath.rewind();
					}
					restoreLayerType();
					break;
				case "hidden":
					/**
					 * 这一部分是做的截断,也就是这个viewgroup的孩子都超过view的部分都截断不可见
					 * */
					if (mBGDrawable != null)
					{
						float left = 0f;
						float top = 0f;
						float right = getWidth();
						float bottom = getHeight();
						float borderWidth = 0f;
						if (mBGDrawable.getBorderWidthArray() != null && mBGDrawable.getBorderWidthArray()[0] != 0f)
						{
							borderWidth = mBGDrawable.getBorderWidthArray()[0];
							left += borderWidth;
							top += borderWidth;
							right -= borderWidth;
							bottom -= borderWidth;
						}
						float radius = mBGDrawable.getBorderRadiusArray() != null ? mBGDrawable.getBorderRadiusArray()[0] : 0f;

						if (radius > 0f)
						{
							if (mOverflowPath == null)
							{
								mOverflowPath = new Path();
							}
							mOverflowPath.rewind();
							if (mOverflowRect == null)
							{
								mOverflowRect = new RectF();
							}
							mOverflowRect.set(left, top, right, bottom);
							mOverflowPath.addRoundRect(mOverflowRect, radius, radius, Path.Direction.CW);
							if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP)
							{
								if (mOldLayerType == LAYER_TYPE_NOT_SET)
								{
									mOldLayerType = this.getLayerType();
								}
								this.setLayerType(LAYER_TYPE_SOFTWARE, null);
							}
							try
							{
								canvas.clipPath(mOverflowPath);
							}
							catch (Throwable throwable)
							{
								restoreLayerType();
							}
						}
					}
					break;
				default:
					restoreLayerType();
					break;
			}
		}
		super.dispatchDraw(canvas);
		//        String testString = "View ID:" + this.getId();
		//        Paint mPaint = new Paint();
		//        mPaint.setStrokeWidth(3);
		//        mPaint.setTextSize(40);
		//        mPaint.setColor(Color.RED);
		//        mPaint.setTextAlign(Paint.Align.LEFT);
		//        Rect bounds = new Rect();
		//        mPaint.getTextBounds(testString, 0, testString.length(), bounds);
		//        Paint.FontMetricsInt fontMetrics = mPaint.getFontMetricsInt();
		//        int baseline = (getMeasuredHeight() - fontMetrics.bottom + fontMetrics.top) / 2 - fontMetrics.top;
		//        canvas.drawText(testString, getMeasuredWidth() / 2 - bounds.width() / 2, baseline, mPaint);
	}

	private void restoreLayerType()
	{
		if (mOldLayerType > LAYER_TYPE_NOT_SET)
		{
			this.setLayerType(mOldLayerType, null);
		}
	}

	//	public void setBorderRadius(float radius, int position)
	//	{
	//		getBackGround().setBorderRadius(radius, position);
	//	}
	//
	//	public void setBorderWidth(float width, int position)
	//	{
	//		getBackGround().setBorderWidth(width, position);
	//	}
	//
	//	public void setBorderColor(int color, int position)
	//	{
	//		getBackGround().setBorderColor(color, position);
	//	}
	//
	//	private CommonBackgroundDrawable getBackGround()
	//	{
	//		if (mBGDrawable == null)
	//		{
	//			mBGDrawable = new CommonBackgroundDrawable();
	//			Drawable currBGDrawable = getBackground();
	//			super.setBackgroundDrawable(null);
	//			if (currBGDrawable == null)
	//			{
	//				super.setBackgroundDrawable(mBGDrawable);
	//			}
	//			else
	//			{
	//				LayerDrawable layerDrawable = new LayerDrawable(new Drawable[] { mBGDrawable, currBGDrawable });
	//				super.setBackgroundDrawable(layerDrawable);
	//			}
	//		}
	//		return mBGDrawable;
	//	}

	public void setOverflow(String overflow)
	{
		mOverflow = overflow;
		//robinsli Android 支持 overflow: visible，超出容器之外的属性节点也可以正常显示
		if(!TextUtils.isEmpty(mOverflow))
		{
			switch (mOverflow)
			{
				case "visible":
					setClipChildren(false); //可以超出父亲区域
					break;
				case "hidden":
				{
					setClipChildren(true); //默认值是false
					break;
				}
			}
		}
		invalidate();
	}

	//	@Override
	//	public void setBackgroundColor(int color)
	//	{
	//		getBackGround().setBackgroundColor(color);
	//	}

	//	@Override
	//	public boolean onTouchEvent(MotionEvent event)
	//	{
	//		boolean result = super.onTouchEvent(event);
	//		if (mGestureDispatcher != null)
	//		{
	//			result |= mGestureDispatcher.handleTouchEvent(event);
	//		}
	//		return result;
	//	}

	@Override
	public boolean onInterceptTouchEvent(MotionEvent ev)
	{
		int action = ev.getAction() & MotionEvent.ACTION_MASK;
		if (action == MotionEvent.ACTION_DOWN)
		{
			mDownX = ev.getX();
			mDownY = ev.getY();
			isHandlePullUp = false;
		}

		boolean result = super.onInterceptTouchEvent(ev);

		if (mGestureDispatcher != null)
		{
			result |= mGestureDispatcher.needHandle(NodeProps.ON_INTERCEPT_TOUCH_EVENT);
		}

		if (!result && mGestureDispatcher != null && mGestureDispatcher.needHandle(NodeProps.ON_INTERCEPT_PULL_UP_EVENT))
		{
			switch (action)
			{
				case MotionEvent.ACTION_MOVE:
				{
					if (isHandlePullUp)
					{
						break;
					}
					if (mViewConfiguration == null)
					{
						mViewConfiguration = new ViewConfiguration();
					}
					float dx = ev.getX() - mDownX;
					float dy = ev.getY() - mDownY;
					if (dy < 0 && Math.abs(dx) < Math.abs(dy) && Math.abs(dy) > mViewConfiguration.getScaledTouchSlop())
					{
						mGestureDispatcher.handle(NodeProps.ON_TOUCH_DOWN, mDownX, mDownY);
						isHandlePullUp = true;
					}
					break;
				}
			}
			result = isHandlePullUp;
		}
		return result;
	}

	//	@Override
	//	public NativeGestureDispatcher getGestureDispatcher()
	//	{
	//		return mGestureDispatcher;
	//	}

	//	@Override
	//	public void setGestureDispatcher(NativeGestureDispatcher dispatcher)
	//	{
	//		mGestureDispatcher = dispatcher;
	//	}

	@Override
	protected int getChildDrawingOrder(int childCount, int index)
	{
		return mDrawingOrderHelper.getChildDrawingOrder(childCount, index);
	}

	@Override
	public int getZIndexMappedChildIndex(int index)
	{
		if (mDrawingOrderHelper.shouldEnableCustomDrawingOrder())
		{
			return mDrawingOrderHelper.getChildDrawingOrder(getChildCount(), index);
		}
		else
		{
			return index;
		}
	}

	@Override
	public void updateDrawingOrder()
	{
		mDrawingOrderHelper.update();
		setChildrenDrawingOrderEnabled(mDrawingOrderHelper.shouldEnableCustomDrawingOrder());
		invalidate();
	}

	@Override
	public void addView(View child, int index)
	{
		super.addView(child, index);
		mDrawingOrderHelper.handleAddView(child);
		setChildrenDrawingOrderEnabled(mDrawingOrderHelper.shouldEnableCustomDrawingOrder());
	}

	@Override
	public void removeView(View view)
	{
		super.removeView(view);
		mDrawingOrderHelper.handleRemoveView(view);
		setChildrenDrawingOrderEnabled(mDrawingOrderHelper.shouldEnableCustomDrawingOrder());
	}

	@Override
	public void resetProps()
	{
		//		HippyViewController.resetTransform(this);

		HippyViewGroupController.removeViewZIndex(this);

		//		mBGDrawable = null;
		//		super.setBackgroundDrawable(null);
		mOverflow = null;
		setClipChildren(true); //默认值是false
		//		setAlpha(1.0f);
	}

	//	@Override
	//	public void clear()
	//	{
	//
	//	}
}
