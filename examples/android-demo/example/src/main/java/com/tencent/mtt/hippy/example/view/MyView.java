package com.tencent.mtt.hippy.example.view;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.view.MotionEvent;
import android.widget.FrameLayout;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;

@SuppressWarnings("deprecation")
public class MyView extends FrameLayout implements HippyViewBase
{

	private NativeGestureDispatcher	mGestureDispatcher;

	String							mText;
	final Paint						mPaint	= new Paint();

	public MyView(Context context)
	{
		super(context);
		mPaint.setTextSize(100);
		setBackgroundColor(Color.GRAY);
	}

	@Override
	protected void onAttachedToWindow() {
		super.onAttachedToWindow();

		//this is show how to send message to js ui
		HippyMap hippyMap = new HippyMap();
		hippyMap.pushString("test","code");
		new HippyViewEvent(" onAttachedToWindow").send(this,hippyMap);
	}

	@Override
	protected void onDraw(Canvas canvas)
	{
		if (mText != null)
		{
			canvas.drawText(mText, 0 ,getHeight()/2.0f, mPaint);
		}
		super.onDraw(canvas);
	}

	/** the Gesture use for the touch event*/
	@SuppressLint("ClickableViewAccessibility")
    @Override
	public boolean onTouchEvent(MotionEvent event)
	{
		boolean result = super.onTouchEvent(event);
		if (mGestureDispatcher != null)
		{
			result |= mGestureDispatcher.handleTouchEvent(event);
		}
		return result;
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

	public void setText(String text)
	{
		this.mText = text;
		invalidate();
	}

	public void setColor(int color)
	{
		mPaint.setColor(color);
		invalidate();
	}
}
