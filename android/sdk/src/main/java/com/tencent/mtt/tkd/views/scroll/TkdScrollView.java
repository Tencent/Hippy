package com.tencent.mtt.tkd.views.scroll;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.views.scroll.HippyScrollView;

/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2018/8/24 19:28
 * @version: V1.0
 */
public interface TkdScrollView extends HippyScrollView
{
	void setPreloadDistance(int preloadDistance);

	void callLoadMoreFinish();

	void callScrollToTop(boolean isSmoothScroll);

	void callScrollToPosition(int distance, int duration, Promise promise);
}
