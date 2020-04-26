package com.tencent.mtt.supportui.views;

import android.view.View;
import android.view.ViewGroup;

/**
 * Created by leonardgong on 2018/4/19 0007.
 */

public class ScrollChecker
{
	public static boolean canScroll(View v, boolean checkV, boolean vertically, int delta, int touchX, int touchY)
	{
		if (v instanceof ViewGroup)
		{
			final ViewGroup group = (ViewGroup) v;
			final int scrollX = (int) (v.getScrollX() + v.getTranslationX() + .5f);
			final int scrollY = (int) (v.getScrollY() + v.getTranslationX() + .5f);
			final int count = group.getChildCount();
			for (int i = count - 1; i >= 0; i--)
			{
				// TODO: Add versioned support here for transformed views.
				// This will not work for transformed views in Honeycomb+
				final View child = group.getChildAt(i);
				if (child.getVisibility() == View.VISIBLE)
				{
					if (touchX + scrollX >= child.getLeft() && touchX + scrollX < child.getRight() && touchY + scrollY >= child.getTop()
							&& touchY + scrollY < child.getBottom()
							&& canScroll(child, true, vertically, delta, touchX + scrollX - child.getLeft(), touchY + scrollY - child.getTop()))
					{
						return true;
					}
				}
			}
		}
		if (v instanceof IScrollCheck)
		{
			IScrollCheck scroller = (IScrollCheck) v;
			return checkV && (vertically ? scroller.verticalCanScroll(-delta) : scroller.horizontalCanScroll(-delta));
		}
		else
		{
			return false;
		}

	}

	public interface IScrollCheck
	{
		/*
		 * 向左滑动为正
		 */
		boolean verticalCanScroll(int dis);

		/*
		 * 向上滑动为正
		 */
		boolean horizontalCanScroll(int dis);
	}
}
