package com.tencent.mtt.hippy.views.scroll;

import com.tencent.mtt.hippy.common.HippyMap;

@SuppressWarnings("deprecation")
public interface HippyScrollView
{
	void setScrollEnabled(boolean enabled);

	void showScrollIndicator(boolean showScrollIndicator);

	void setScrollEventEnable(boolean enable);

	void setScrollBeginDragEventEnable(boolean enable);

	void setScrollEndDragEventEnable(boolean enable);

	void setMomentumScrollBeginEventEnable(boolean enable);

	void setMomentumScrollEndEventEnable(boolean enable);

	void setFlingEnabled(boolean flag);

	void setContentOffset4Reuse(HippyMap offsetMap);

	void setPagingEnabled(boolean pagingEnabled);

	void setScrollEventThrottle(int scrollEventThrottle);

	void callSmoothScrollTo(int x,int y,int duration);

	void setScrollMinOffset(int scrollMinOffset);
}
