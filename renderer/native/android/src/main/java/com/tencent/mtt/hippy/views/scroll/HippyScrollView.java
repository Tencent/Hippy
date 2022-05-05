package com.tencent.mtt.hippy.views.scroll;

import com.tencent.mtt.hippy.common.HippyMap;

public interface HippyScrollView {

    void setScrollEnabled(boolean enabled);

    void showScrollIndicator(boolean showScrollIndicator);

    void setFlingEnabled(boolean flag);

    @SuppressWarnings("deprecation")
    void setContentOffset4Reuse(HippyMap offsetMap);

    void setPagingEnabled(boolean pagingEnabled);

    void setScrollEventThrottle(int scrollEventThrottle);

    void callSmoothScrollTo(int x, int y, int duration);

    void setScrollMinOffset(int scrollMinOffset);

    void setInitialContentOffset(int offset);

    void scrollToInitContentOffset();
}
