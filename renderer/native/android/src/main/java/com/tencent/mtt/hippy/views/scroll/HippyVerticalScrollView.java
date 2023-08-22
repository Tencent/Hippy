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
import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import androidx.annotation.NonNull;
import androidx.core.view.ViewCompat;
import androidx.core.widget.NestedScrollView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.HippyNestedScrollTarget2;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollHelper;
import com.tencent.mtt.hippy.views.common.ClipChildrenView;
import com.tencent.renderer.utils.EventUtils;

@SuppressWarnings("deprecation")
public class HippyVerticalScrollView extends NestedScrollView implements HippyViewBase, HippyScrollView,
        ClipChildrenView, HippyNestedScrollTarget2 {

    private NativeGestureDispatcher mGestureDispatcher;

    private boolean mScrollEnabled = true;

    private boolean mDoneFlinging;

    private boolean mDragging;

    private final HippyOnScrollHelper mHippyOnScrollHelper;

    private boolean mFlingEnabled = true;

    private boolean mPagingEnabled = false;

    protected int mScrollEventThrottle = 10;
    private long mLastScrollEventTimeStamp = -1;
    private boolean mHasUnsentScrollEvent;

    protected int mScrollMinOffset = 0;
    private int startScrollY = 0;
    private int mLastY = 0;
    private int initialContentOffset = 0;
    private boolean hasCompleteFirstBatch = false;
    private final Priority[] mNestedScrollPriority = {Priority.SELF, Priority.NOT_SET, Priority.NOT_SET,
            Priority.NOT_SET, Priority.NOT_SET};
    private final Runnable mDoPageScrollRunnable = this::doPageScroll;
    private final Runnable mComputeScrollRunnable = HippyVerticalScrollView.super::computeScroll;

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
        if (!mScrollEnabled) {
            return false;
        }
        int action = event.getAction() & MotionEvent.ACTION_MASK;
        if (action == MotionEvent.ACTION_DOWN && !mDragging) {
            mDragging = true;
            HippyScrollViewEventHelper.emitScrollEvent(this, EventUtils.EVENT_SCROLLER_BEGIN_DRAG);
        } else if ((action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_CANCEL) && mDragging) {
            if (mHasUnsentScrollEvent) {
                sendOnScrollEvent();
            }
            HippyScrollViewEventHelper.emitScrollEvent(this, EventUtils.EVENT_SCROLLER_END_DRAG);
            if (mPagingEnabled) {
                post(mDoPageScrollRunnable);
            }
            mDragging = false;
        }

        boolean result = super.onTouchEvent(event);
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
            // reset state in case child View not calling stopNestedScroll(TYPE_NON_TOUCH)
            onStopNestedScroll(this, ViewCompat.TYPE_NON_TOUCH);
            startScrollY = getScrollY();
        }
        if (super.onInterceptTouchEvent(event)) {
            HippyScrollViewEventHelper.emitScrollEvent(this, EventUtils.EVENT_SCROLLER_BEGIN_DRAG);
            mDragging = true;
            return true;
        }
        return false;
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
            long currTime;
            int offsetY = Math.abs(y - mLastY);
            if (mScrollMinOffset > 0 && offsetY >= mScrollMinOffset) {
                mLastY = y;
                sendOnScrollEvent();
            } else if ((mScrollMinOffset == 0) && ((currTime = SystemClock.elapsedRealtime())
                    - mLastScrollEventTimeStamp >= mScrollEventThrottle)) {
                mLastScrollEventTimeStamp = currTime;
                sendOnScrollEvent();
            } else {
                mHasUnsentScrollEvent = true;
            }
            mDoneFlinging = false;
        }
    }

    private void sendOnScrollEvent() {
        mHasUnsentScrollEvent = false;
        HippyScrollViewEventHelper
                .emitScrollEvent(this, EventUtils.EVENT_SCROLLER_ON_SCROLL);
    }

    private void scheduleScrollEnd() {
        Runnable runnable = new Runnable() {
            @Override
            public void run() {
                if (mDoneFlinging) {
                    if (mHasUnsentScrollEvent) {
                        sendOnScrollEvent();
                    }
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

    protected void doPageScroll() {
        HippyScrollViewEventHelper
                .emitScrollEvent(this, EventUtils.EVENT_SCROLLER_MOMENTUM_BEGIN);
        smoothScrollToPage();
        scheduleScrollEnd();
    }

    @Override
    public void fling(int velocityY) {
        if (!mFlingEnabled || mPagingEnabled) {
            return;
        }
        super.fling(velocityY);
        HippyScrollViewEventHelper
                .emitScrollEvent(this, EventUtils.EVENT_SCROLLER_MOMENTUM_BEGIN);
        scheduleScrollEnd();
    }

    private void smoothScrollToPage() {
        int height = getHeight();
        View view = getChildAt(0);
        if (height <= 0 || view == null) {
            return;
        }
        int maxPage = view.getHeight()/height;
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
    public void updateContentOffset() {
        if (hasCompleteFirstBatch) {
            // When the ScrollView content becomes shorter,
            // scrollTo() can correct the scroll position to the new end
            scrollTo(getScrollX(), getScrollY());
            return;
        }

        if (initialContentOffset > 0) {
            scrollTo(0, initialContentOffset);
        }

        hasCompleteFirstBatch = true;
    }

    @Override
    public void setNestedScrollPriority(int direction, Priority priority) {
        mNestedScrollPriority[direction] = priority;
    }

    @Override
    public Priority getNestedScrollPriority(int direction) {
        Priority result = mNestedScrollPriority[direction];
        if (result == Priority.NOT_SET) {
            result = mNestedScrollPriority[DIRECTION_ALL];
        }
        return result;
    }

    @Override
    public boolean onStartNestedScroll(@NonNull View child, @NonNull View target, int axes, int type) {
        if (!mScrollEnabled) {
            return false;
        }
        return (axes & ViewCompat.SCROLL_AXIS_VERTICAL) != 0;
    }

    @Override
    public void onNestedScroll(View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
        onNestedScrollInternal(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, ViewCompat.TYPE_TOUCH, null);
    }

    @Override
    public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed, int dxUnconsumed,
            int dyUnconsumed, int type) {
        onNestedScrollInternal(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, type, null);
    }

    @Override
    public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed, int dxUnconsumed,
            int dyUnconsumed, int type, @NonNull int[] consumed) {
        onNestedScrollInternal(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, type, consumed);
    }

    void onNestedScrollInternal(@NonNull View target, int dxConsumed, int dyConsumed, int dxUnconsumed,
            int dyUnconsumed, int type, int[] consumed) {
        if (mPagingEnabled && type == ViewCompat.TYPE_NON_TOUCH) {
            // Because the non-touch scrolling of NestedScrollView does not call stopNestedScroll(),
            // we don't respond to non-touch scrolling in paging mode, to avoid not calling doPageScroll()
            // after scrolling ends.
            return;
        }
        int myConsumed = 0;
        // Process the current View first
        if (HippyNestedScrollHelper.priorityOfY(target, dyUnconsumed) == Priority.SELF) {
            final int oldScrollY = getScrollY();
            scrollBy(0, dyUnconsumed);
            myConsumed = getScrollY() - oldScrollY;
            dyConsumed += myConsumed;
            dyUnconsumed -= myConsumed;
            if (consumed != null) {
                consumed[1] += myConsumed;
            }
        }
        // Then dispatch to the parent for processing
        int parentDx = HippyNestedScrollHelper.priorityOfX(this, dxUnconsumed) == Priority.NONE ? 0 : dxUnconsumed;
        int parentDy = HippyNestedScrollHelper.priorityOfY(this, dyUnconsumed) == Priority.NONE ? 0 : dyUnconsumed;
        if (parentDx != 0 || parentDy != 0) {
            if (consumed == null) {
                dispatchNestedScroll(dxConsumed, dyConsumed, parentDx, parentDy, null, type);
            } else {
                int consumedX = consumed[0];
                int consumedY = consumed[1] + myConsumed;
                consumed[0] = 0;
                consumed[1] = 0;
                dispatchNestedScroll(dxConsumed, dyConsumed, parentDx, parentDy, null, type, consumed);
                consumed[0] += consumedX;
                consumed[1] += consumedY;
            }
        }
    }

    @Override
    public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed, int type) {
        if (mPagingEnabled && type == ViewCompat.TYPE_NON_TOUCH) {
            if (HippyNestedScrollHelper.priorityOfY(target, dy) == Priority.PARENT) {
                consumed[1] += dy;
            }
            return;
        }
        // Dispatch to the parent for processing first
        int parentDx = HippyNestedScrollHelper.priorityOfX(this, dx) == Priority.NONE ? 0 : dx;
        int parentDy = HippyNestedScrollHelper.priorityOfY(this, dy) == Priority.NONE ? 0 : dy;
        if (parentDx != 0 || parentDy != 0) {
            // Temporarily store `consumed` to reuse the Array
            int consumedX = consumed[0];
            int consumedY = consumed[1];
            consumed[0] = 0;
            consumed[1] = 0;
            dispatchNestedPreScroll(parentDx, parentDy, consumed, null, type);
            dy -= consumed[1];
            consumed[0] += consumedX;
            consumed[1] += consumedY;
        }
        // Then process the current View
        if (HippyNestedScrollHelper.priorityOfY(target, dy) == Priority.PARENT) {
            final int oldScrollY = getScrollY();
            scrollBy(0, dy);
            final int myConsumed = getScrollY() - oldScrollY;
            consumed[1] += myConsumed;
        }
    }

    @Override
    public void onStopNestedScroll(@NonNull View target, int type) {
        super.onStopNestedScroll(target, type);
        if (mPagingEnabled) {
            post(mDoPageScrollRunnable);
        }
    }

    @Override
    public void computeScroll() {
        // computeScroll() is triggered by the draw method of the ViewParent. If the RecyclerView is in
        // the NestedScrollingParent chain, methods such as onNestedScroll may be called, causing the
        // RecyclerView to removeView and causing NPE, so post execution is required.
        if (hasNestedScrollingParent(ViewCompat.TYPE_NON_TOUCH)) {
            post(mComputeScrollRunnable);
        } else {
            super.computeScroll();
        }
    }

    @Override
    protected void onDetachedFromWindow() {
        super.onDetachedFromWindow();
        /*
         * post task is main thread,but node handle(add or remove) is in js thread，
         * it may lead to use after free bugs in some case,such as inconsistency in recyclerView
         */
        removeCallbacks(mComputeScrollRunnable);
        removeCallbacks(mDoPageScrollRunnable);
        // a hacky way to abort animated scroll
        smoothScrollBy(0, 0);
    }
}
