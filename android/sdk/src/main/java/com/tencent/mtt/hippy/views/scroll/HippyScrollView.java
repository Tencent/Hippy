package com.tencent.mtt.hippy.views.scroll;

import com.tencent.mtt.hippy.common.HippyMap;

/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2018/8/24 19:28
 * @version: V1.0
 */
public interface HippyScrollView
{
	void setScrollEnabled(boolean enabled);

	void showScrollIndicator(boolean showScrollIndicator);

	void setScrollEventEnable(boolean enable);

	void setScrollBeginDragEventEnable(boolean enable);

	void setScrollEndDragEventEnable(boolean enable);

	void setMomentumScrollBeginEventEnable(boolean enable);

	void setMomentumScrollEndEventEnable(boolean enable);

	void setScrollAnimationEndEventEnable(boolean enable);

	void setFlingEnabled(boolean flag);

	void setContentOffset4Reuse(HippyMap offsetMap);

	void setPagingEnabled(boolean pagingEnabled);

	void setScrollEventThrottle(int scrollEventThrottle);

	void callSmoothScrollTo(int x,int y,int duration);

}
