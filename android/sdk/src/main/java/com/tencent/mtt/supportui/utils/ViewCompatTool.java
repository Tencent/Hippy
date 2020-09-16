package com.tencent.mtt.supportui.utils;

import android.annotation.TargetApi;
import android.os.Build;
import android.view.View;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public class ViewCompatTool
{

	public static int		sdkVersion				= Build.VERSION.SDK_INT;

	public static final int	FAKE_FRAME_TIME			= 16;

	public static final int	LAYOUT_DIRECTION_LTR	= 0;					// added in API level 17

	public static final int	LAYOUT_DIRECTION_RTL	= 1;					// added in API level 17

	@TargetApi(Build.VERSION_CODES.JELLY_BEAN)
	public static void postOnAnimation(View mTarget, Runnable runnable)
	{
		if (sdkVersion >= Build.VERSION_CODES.JELLY_BEAN)
		{
			mTarget.postOnAnimation(runnable);
		}
		else
		{
			mTarget.postDelayed(runnable, FAKE_FRAME_TIME);
		}
	}

	@TargetApi(Build.VERSION_CODES.JELLY_BEAN)
	public static int getMinimumWidth(View view)
	{
		if (sdkVersion >= Build.VERSION_CODES.JELLY_BEAN)
		{
			return view.getMinimumWidth();
		}
		else
		{
			return 0;
		}

	}

	@TargetApi(Build.VERSION_CODES.JELLY_BEAN)
	public static int getMinimumHeight(View view)
	{
		if (sdkVersion >= Build.VERSION_CODES.JELLY_BEAN)
		{
			return view.getMinimumHeight();
		}
		else
		{
			return 0;
		}
	}

	@TargetApi(Build.VERSION_CODES.JELLY_BEAN)
	public static void postInvalidateOnAnimation(View view)
	{
		// TODO Auto-generated method stub
		//IMPL.postInvalidateOnAnimation(view);

		if (sdkVersion >= Build.VERSION_CODES.JELLY_BEAN)
		{
			view.postInvalidateOnAnimation();
		}
		else
		{
			view.postInvalidateDelayed(FAKE_FRAME_TIME);
		}
	}

	public static void setDefaultLayotuDirection(View view)
	{
		setLayoutDirection(view, LAYOUT_DIRECTION_LTR);
	}

	@TargetApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
	public static void setLayoutDirection(View view, int layoutDir)
	{
		//IMPL.setLayoutDirection(view, layoutDir);
		if (sdkVersion >= 17)
		{
			view.setLayoutDirection(layoutDir);
		}
	}
}
