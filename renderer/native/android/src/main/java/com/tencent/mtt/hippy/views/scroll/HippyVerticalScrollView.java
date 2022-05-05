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
import android.view.MotionEvent;
import android.widget.ScrollView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.utils.EventUtils;

@SuppressWarnings("deprecation")
public class HippyVerticalScrollView extends ScrollView implements HippyViewBase, HippyScrollView {

    private NativeGestureDispatcher mGestureDispatcher;

    private boolean mScrollEnabled = true;

    private boolean mDoneFlinging;

    private boolean mDragging;

    private final HippyOnScrollHelper mHippyOnScrollHelper;

    private boolean mFlingEnabled = true;

    private boolean mPagingEnabled = false;

    protected int mScrollEventThrottle = 10;
    private long mLastScrollEventTimeStamp = -1;

    protected int mScrollMinOffset = 0;
    private int startScrollY = 0;
    private int mLastY = 0;
    private int initialContentOffset = 0;
    private boolean hasCompleteFirstBatch = false;

    public HippyVerticalScrollView(Context context) {
        super(context);
        mHippyOnScrollHelper = new HippyOnScrollHelper();
        setVerticalScrollBarEnabled(false);
    }

    public void setScrollEnabled(boolean enabled) {
        this.mScrollEnabled = enabled;
    }

    @Override
    public void showScrollIndicator(boolean showScrollIndicator) {
        this.setVerticalScrollBarEnabled(showScrollIndicator);
    }

    public void setScrollEventThrottle(int scrollEventThrottle) {
        mScrollEventThrottle = scrollEventThrottle;
    }

    @Override
    public void callSmoothScrollTo(final int x, final int y, int duration) {
        if (duration > 0) {
            ValueAnimator realSmoothScrollAnimation =
                    ValueAnimator.ofInt(getScrollY(), y);
            realSmoothScrollAnimation.setDuration(duration);
            realSmoothScrollAnimation.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
                @Override
                public void onAnimationUpdate(ValueAnimator animation) {
                    int scrollTo = (Integer) animation.getAnimatedValue();
                    HippyVerticalScrollView.this.scrollTo(x, scrollTo);
                }
            });
            realSmoothScrollAnimation.start();
        } else {
            smoothScrollTo(x, y);
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
    public boolean onTouchEvent(MotionEvent event) {
        int action = event.getAction() & MotionEvent.ACTION_MASK;
        if (action == MotionEvent.ACTION_DOWN && !mDragging) {
            mDragging = true;
            HippyScrollViewEventHelper.emitScrollEvent(this, EventUtils.EVENT_SCROLLER_BEGIN_DRAG);
            setParentScrollableIfNeed(false);
        } else if (action == MotionEvent.ACTION_UP && mDragging) {
            HippyScrollViewEventHelper.emitScrollEvent(this, EventUtils.EVENT_SCROLLER_END_DRAG);
            if (mPagingEnabled) {
                post(new Runnable() {
                         @Override
                         public void run() {
                             doPageScroll();
                         }
                     }
                );
            }
            setParentScrollableIfNeed(true);
            mDragging = false;
        }

        boolean result = mScrollEnabled && super.onTouchEvent(event);
        if (mGestureDispatcher != null) {
            result |= mGestureDispatcher.handleTouchEvent(event);
        }
        return result;
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {
        if (!mScrollEnabled) {
            return false;
        }
        int action = event.getAction() & MotionEvent.ACTION_MASK;
        if (action == MotionEvent.ACTION_DOWN) {
            startScrollY = getScrollY();
        }
        if (super.onInterceptTouchEvent(event)) {
            HippyScrollViewEventHelper.emitScrollEvent(this, EventUtils.EVENT_SCROLLER_BEGIN_DRAG);
            mDragging = true;
            return true;
        }
        return false;
    }

    private void setParentScrollableIfNeed(boolean flag) {
        if (canScrollVertically(-1) || canScrollVertically(1)) {
            getParent().requestDisallowInterceptTouchEvent(!flag);
        }
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return mGestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
        mGestureDispatcher = dispatcher;
    }

    @Override
    protected void onScrollChanged(int x, int y, int oldX, int oldY) {
        super.onScrollChanged(x, y, oldX, oldY);
        if (mHippyOnScrollHelper.onScrollChanged(x, y)) {
            long currTime = System.currentTimeMillis();
            int offsetY = Math.abs(y - mLastY);
            if (mScrollMinOffset > 0 && offsetY >= mScrollMinOffset) {
                mLastY = y;
                HippyScrollViewEventHelper
                        .emitScrollEvent(this, EventUtils.EVENT_SCROLLER_ON_SCROLL);
            } else if ((mScrollMinOffset == 0) && (currTime - mLastScrollEventTimeStamp
                    >= mScrollEventThrottle)) {
                mLastScrollEventTimeStamp = currTime;
                HippyScrollViewEventHelper
                        .emitScrollEvent(this, EventUtils.EVENT_SCROLLER_ON_SCROLL);
            }
            mDoneFlinging = false;
        }
    }

    protected void doPageScroll() {
        HippyScrollViewEventHelper
                .emitScrollEvent(this, EventUtils.EVENT_SCROLLER_MOMENTUM_BEGIN);
        smoothScrollToPage();
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                if (mDoneFlinging) {
                    HippyScrollViewEventHelper.emitScrollEvent(HippyVerticalScrollView.this,
                            EventUtils.EVENT_SCROLLER_MOMENTUM_END);
                } else {
                    mDoneFlinging = true;
                    postOnAnimationDelayed(this, HippyScrollViewEventHelper.MOMENTUM_DELAY);
                }
            }
        };
        postOnAnimationDelayed(runnable, HippyScrollViewEventHelper.MOMENTUM_DELAY);
    }

    @Override
    public void fling(int velocityY) {
        if (!mFlingEnabled || mPagingEnabled) {
            return;
        }
        super.fling(velocityY);
        HippyScrollViewEventHelper
                .emitScrollEvent(this, EventUtils.EVENT_SCROLLER_MOMENTUM_BEGIN);
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                if (mDoneFlinging) {
                    HippyScrollViewEventHelper.emitScrollEvent(HippyVerticalScrollView.this,
                            EventUtils.EVENT_SCROLLER_MOMENTUM_END);
                } else {
                    mDoneFlinging = true;
                    postOnAnimationDelayed(this, HippyScrollViewEventHelper.MOMENTUM_DELAY);
                }
            }
        };
        postOnAnimationDelayed(runnable, HippyScrollViewEventHelper.MOMENTUM_DELAY);
    }

    private void smoothScrollToPage() {
        int height = getHeight();
        if (height <= 0) {
            return;
        }
        int maxPage = getChildAt(0).getHeight() / height;
        int page = startScrollY / height;
        int offset = getScrollY() - startScrollY;
        if (offset == 0) {
            return;
        }

        if ((page == maxPage - 1) && offset > 0) {
            page = page + 1;
        } else if (Math.abs(offset) > height / 5) {
            page = (offset > 0) ? page + 1 : page - 1;
        }

        if (page < 0) {
            page = 0;
        }

        smoothScrollTo(getScrollX(), page * height);
    }

    public void setFlingEnabled(boolean flag) {
        this.mFlingEnabled = flag;
    }

    @Override
    public void setContentOffset4Reuse(HippyMap offsetMap) {
        double offset = offsetMap.getDouble("y");
        scrollTo(0, (int) PixelUtil.dp2px(offset));
    }

    @Override
    public void setPagingEnabled(boolean pagingEnabled) {
        mPagingEnabled = pagingEnabled;
    }

    @Override
    public void setScrollMinOffset(int scrollMinOffset) {
        scrollMinOffset = Math.max(5, scrollMinOffset);
        mScrollMinOffset = (int) PixelUtil.dp2px(scrollMinOffset);
    }

    @Override
    public void setInitialContentOffset(int offset) {
        initialContentOffset = offset;
    }

    @Override
    public void scrollToInitContentOffset() {
        if (hasCompleteFirstBatch) {
            return;
        }

        if (initialContentOffset > 0) {
            scrollTo(0, initialContentOffset);
        }

        hasCompleteFirstBatch = true;
    }
}
