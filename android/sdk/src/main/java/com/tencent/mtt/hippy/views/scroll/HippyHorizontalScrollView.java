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
import android.widget.HorizontalScrollView;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.HippyNestedScrollTarget;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollHelper;
import com.tencent.mtt.supportui.views.ScrollChecker;

import java.util.HashMap;

@SuppressWarnings("deprecation")
public class HippyHorizontalScrollView extends HorizontalScrollView implements HippyViewBase,
    HippyScrollView, ScrollChecker.IScrollCheck, HippyNestedScrollTarget {

  private NativeGestureDispatcher mGestureDispatcher;

  private boolean mScrollEnabled = true;

  private boolean mDoneFlinging;

  private boolean mDragging;

  private final HippyOnScrollHelper mHippyOnScrollHelper;

  private boolean mScrollEventEnable = true;

  private boolean mScrollBeginDragEventEnable = false;

  private boolean mScrollEndDragEventEnable = false;

  private boolean mMomentumScrollBeginEventEnable = false;

  private boolean mMomentumScrollEndEventEnable = false;

  private boolean mFlingEnabled = true;

  private boolean mPagingEnabled = false;

  protected int mScrollEventThrottle = 10;
  private long mLastScrollEventTimeStamp = -1;
  private boolean mHasUnsentScrollEvent;

  protected int mScrollMinOffset = 0;
  private int startScrollX = 0;
  private int mLastX = 0;
  private int initialContentOffset = 0;
  private boolean hasCompleteFirstBatch = false;
  private final boolean isTvPlatform;
  private HippyHorizontalScrollViewFocusHelper mFocusHelper = null;

  private HashMap<Integer, Integer> scrollOffsetForReuse = new HashMap<>();
  private final Priority[] mNestedScrollPriority = { Priority.SELF, Priority.SELF, Priority.SELF, Priority.SELF };
  private final int[] mScrollConsumed = new int[2];

  public HippyHorizontalScrollView(Context context) {
    super(context);
    mHippyOnScrollHelper = new HippyOnScrollHelper();
    setHorizontalScrollBarEnabled(false);
    setNestedScrollingEnabled(true);

    HippyEngineContext engineContext = ((HippyInstanceContext) context).getEngineContext();
    isTvPlatform = engineContext.isRunningOnTVPlatform();
    if (isTvPlatform) {
      mFocusHelper = new HippyHorizontalScrollViewFocusHelper(this);
      setFocusableInTouchMode(true);
    }

    if (I18nUtil.isRTL()) {
      setRotationY(180f);
    }
  }

  @Override
  public void onViewAdded(View child) {
    if (I18nUtil.isRTL()) {
      child.setRotationY(180f);
    }
    super.onViewAdded(child);
  }

  public void setScrollEnabled(boolean enabled) {
    this.mScrollEnabled = enabled;
  }

  @Override
  public void showScrollIndicator(boolean showScrollIndicator) {
    setHorizontalScrollBarEnabled(showScrollIndicator);
  }

  public void setScrollEventThrottle(int scrollEventThrottle) {
    mScrollEventThrottle = scrollEventThrottle;
  }

  @Override
  public void callSmoothScrollTo(int x, final int y, int duration) {
    if (duration > 0) {
      ValueAnimator realSmoothScrollAnimation =
          ValueAnimator.ofInt(getScrollX(), x);
      realSmoothScrollAnimation.setDuration(duration);
      realSmoothScrollAnimation.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
        @Override
        public void onAnimationUpdate(ValueAnimator animation) {
          int scrollTo = (Integer) animation.getAnimatedValue();
          HippyHorizontalScrollView.this.scrollTo(scrollTo, y);
        }
      });
      realSmoothScrollAnimation.start();
    } else {
      smoothScrollTo(x, y);
    }
  }


  @Override
  protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
    setMeasuredDimension(MeasureSpec.getSize(widthMeasureSpec),
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
    boolean result;
    switch (action) {
      case MotionEvent.ACTION_DOWN:
        if (!mDragging) {
          mDragging = true;
          if (mScrollBeginDragEventEnable) {
            LogUtils.d("HippyHorizontalScrollView", "emitScrollBeginDragEvent");
            HippyScrollViewEventHelper.emitScrollBeginDragEvent(this);
          }
          // 若自己能水平滚动
          if (canScrollHorizontally(-1) || canScrollHorizontally(1)) {
            requestDisallowInterceptTouchEvent(true);
          }
        }
        result = super.onTouchEvent(event);
        if (result) {
          startNestedScroll(SCROLL_AXIS_HORIZONTAL);
        }
        break;
      case MotionEvent.ACTION_CANCEL:
      case MotionEvent.ACTION_UP:
        if (mDragging) {
          if (mHasUnsentScrollEvent) {
            sendOnScrollEvent();
          }
          if (mScrollEndDragEventEnable) {
            LogUtils.d("HippyHorizontalScrollView", "emitScrollEndDragEvent");
            HippyScrollViewEventHelper.emitScrollEndDragEvent(this);
          }

          if(mPagingEnabled) {
            post(new Runnable() {
                   @Override
                   public void run() {
                     doPageScroll();
                   }
                 }
            );
          }

          mDragging = false;
        }
        result = super.onTouchEvent(event);
        stopNestedScroll();
        break;
      default:
        result = super.onTouchEvent(event);
        break;
    }

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
    boolean result;
    switch (action) {
      case MotionEvent.ACTION_DOWN:
        startScrollX = getScrollX();
        result = super.onInterceptTouchEvent(event);
        startNestedScroll(SCROLL_AXIS_HORIZONTAL);
        break;
      case MotionEvent.ACTION_CANCEL:
      case MotionEvent.ACTION_UP:
        result = super.onInterceptTouchEvent(event);
        stopNestedScroll();
        break;
      default:
        result = super.onInterceptTouchEvent(event);
        break;
    }

    if (result && !mDragging) {
      if (mScrollBeginDragEventEnable) {
        LogUtils.d("HippyHorizontalScrollView", "emitScrollBeginDragEvent");
        HippyScrollViewEventHelper.emitScrollBeginDragEvent(this);
      }
      mDragging = true;
      return true;
    }
    return false;
  }

  private int computeHorizontallyScrollDistance(int dx) {
    if (dx < 0) {
      return Math.max(dx, -computeHorizontalScrollOffset());
    }
    if (dx > 0) {
      int avail = computeHorizontalScrollRange() - computeHorizontalScrollExtent() - computeHorizontalScrollOffset() - 1;
      return Math.min(dx, avail);
    }
    return 0;
  }

  @Override
  protected boolean overScrollBy(int deltaX, int deltaY, int scrollX, int scrollY, int scrollRangeX, int scrollRangeY,
                                 int maxOverScrollX, int maxOverScrollY, boolean isTouchEvent) {
    if (!hasNestedScrollingParent() || HippyNestedScrollHelper.priorityOfX(this, deltaX) == Priority.NONE) {
      return super.overScrollBy(deltaX, deltaY, scrollX, scrollY, scrollRangeX, scrollRangeY, maxOverScrollX, maxOverScrollY, isTouchEvent);
    }
    int consumed = 0;
    int unConsumed = deltaX;
    mScrollConsumed[0] = 0;
    mScrollConsumed[1] = 0;
    if (dispatchNestedPreScroll(unConsumed, 0, mScrollConsumed, null)) {
      consumed = mScrollConsumed[0];
      unConsumed -= mScrollConsumed[0];
      if (unConsumed == 0) {
        return false;
      }
    }
    int myDx = unConsumed < 0 ? Math.max(unConsumed, -scrollX) : Math.min(unConsumed, scrollRangeX - scrollX - 1);
    if (myDx != 0) {
      super.overScrollBy(myDx, 0, scrollX, scrollY, scrollRangeX, scrollRangeY, maxOverScrollX, maxOverScrollY, isTouchEvent);
      consumed += myDx;
      unConsumed -= myDx;
    }
    if (unConsumed != 0) {
      dispatchNestedScroll(consumed, 0, unConsumed, 0, null);
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

    Integer id = getId();
    Integer scrollX = getScrollX();
    scrollOffsetForReuse.put(id, scrollX);

    if (mHippyOnScrollHelper.onScrollChanged(x, y)) {
      if (mScrollEventEnable) {
        long currTime;
        int offsetX = Math.abs(x - mLastX);
        if (mScrollMinOffset > 0 && offsetX >= mScrollMinOffset) {
          mLastX = x;
          sendOnScrollEvent();
        } else if ((mScrollMinOffset == 0) && ((currTime = SystemClock.elapsedRealtime()) - mLastScrollEventTimeStamp >= mScrollEventThrottle)) {
          mLastScrollEventTimeStamp = currTime;
          sendOnScrollEvent();
        } else {
          mHasUnsentScrollEvent = true;
        }
      }
      mDoneFlinging = false;
    }
  }

  private void sendOnScrollEvent() {
    mHasUnsentScrollEvent = false;
    HippyScrollViewEventHelper.emitScrollEvent(this);
  }

  private void scheduleScrollEnd() {
    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        if (mDoneFlinging) {
          if (mHasUnsentScrollEvent) {
            sendOnScrollEvent();
          }
          if (mMomentumScrollEndEventEnable) {
            HippyScrollViewEventHelper.emitScrollMomentumEndEvent(HippyHorizontalScrollView.this);
          }
        } else {
          mDoneFlinging = true;
          postOnAnimationDelayed(this, HippyScrollViewEventHelper.MOMENTUM_DELAY);
        }
      }
    };
    postOnAnimationDelayed(runnable, HippyScrollViewEventHelper.MOMENTUM_DELAY);
  }

  protected void doPageScroll() {
    if (mMomentumScrollBeginEventEnable) {
      HippyScrollViewEventHelper.emitScrollMomentumBeginEvent(this);
    }

    smoothScrollToPage();

    scheduleScrollEnd();
  }

  @Override
  public void fling(int velocityX) {
    if (!mFlingEnabled || mPagingEnabled) {
      return;
    }

    super.fling(velocityX);

    if (mMomentumScrollBeginEventEnable) {
      HippyScrollViewEventHelper.emitScrollMomentumBeginEvent(this);
    }
    scheduleScrollEnd();
  }

  private void smoothScrollToPage() {
    int width = getWidth();
    View view = getChildAt(0);
    if (width <= 0 || view == null) {
      return;
    }
    int maxPage = view.getWidth()/width;
    int page = startScrollX / width;
    int offset = getScrollX() - startScrollX;
    if (offset == 0) {
      return;
    }

    if ((page == maxPage - 1) && offset > 0) {
      page = page + 1;
    } else if (Math.abs(offset) > width/5) {
      page = (offset > 0) ? page + 1 : page - 1;
    }

    if (page < 0) {
      page = 0;
    }

    smoothScrollTo(page * width, getScrollY());
  }

  public void setScrollEventEnable(boolean enable) {
    this.mScrollEventEnable = enable;
  }

  public void setScrollBeginDragEventEnable(boolean enable) {
    this.mScrollBeginDragEventEnable = enable;
  }

  public void setScrollEndDragEventEnable(boolean enable) {
    this.mScrollEndDragEventEnable = enable;
  }

  public void setMomentumScrollBeginEventEnable(boolean enable) {
    this.mMomentumScrollBeginEventEnable = enable;
  }

  public void setMomentumScrollEndEventEnable(boolean enable) {
    this.mMomentumScrollEndEventEnable = enable;
  }

  public void setFlingEnabled(boolean flag) {
    this.mFlingEnabled = flag;
  }

  @Override
  public void setContentOffset4Reuse(HippyMap offsetMap) {
    double offset = offsetMap.getDouble("x");
    scrollTo((int) PixelUtil.dp2px(offset), 0);
  }

  public void setContentOffset4Reuse() {
    Integer offset = scrollOffsetForReuse.get(getId());
    if (offset != null) {
      scrollTo(offset, 0);
    } else {
      scrollTo(0, 0);
    }
  }

  public void setPagingEnabled(boolean pagingEnabled) {
    this.mPagingEnabled = pagingEnabled;
  }

  @Override
  public boolean verticalCanScroll(int i) {
    return false;
  }

  @Override
  public boolean horizontalCanScroll(int i) {
    return true;
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
      scrollTo(initialContentOffset, 0);
    }

    hasCompleteFirstBatch = true;
  }

  @Override
  public View focusSearch(View focused, int direction) {
    if (isTvPlatform) {
      return mFocusHelper.focusSearch(focused, direction);
    }
    return super.focusSearch(focused, direction);
  }

  @Override
  public void requestChildFocus(View child, View focused) {
    if (isTvPlatform) {
      mFocusHelper.scrollToFocusChild(focused);
    }
    super.requestChildFocus(child, focused);
  }

  @Override
  public void setNestedScrollPriority(int direction, Priority priority) {
    mNestedScrollPriority[direction] = priority;
  }

  @Override
  public Priority getNestedScrollPriority(int direction) {
    return mNestedScrollPriority[direction];
  }

  @Override
  public boolean onStartNestedScroll(@NonNull View child, @NonNull View target, int axes) {
    if (!mScrollEnabled) {
      return false;
    }
    return (axes & SCROLL_AXIS_HORIZONTAL) != 0;
  }

  @Override
  public void onNestedScrollAccepted(@NonNull View child, @NonNull View target, int axes) {
    super.onNestedScrollAccepted(child, target, axes);
    requestDisallowInterceptTouchEvent(true);
    startNestedScroll(SCROLL_AXIS_HORIZONTAL);
  }

  @Override
  public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
    // 先给当前节点处理
    if (HippyNestedScrollHelper.priorityOfX(target, dxUnconsumed) == Priority.SELF) {
      final int oldScrollX = getScrollX();
      scrollBy(dxUnconsumed, 0);
      final int myConsumed = getScrollX() - oldScrollX;
      dxConsumed += myConsumed;
      dxUnconsumed -= myConsumed;
    }
    // 再分发给父级处理
    int parentDx = HippyNestedScrollHelper.priorityOfX(this, dxUnconsumed) == Priority.NONE ? 0 : dxUnconsumed;
    int parentDy = HippyNestedScrollHelper.priorityOfY(this, dyUnconsumed) == Priority.NONE ? 0 : dyUnconsumed;
    if (parentDx != 0 || parentDy != 0) {
      dispatchNestedScroll(dxConsumed, dyConsumed, parentDx, parentDy, null);
    }
  }

  @Override
  public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed) {
    // 先分发给父级处理
    int parentDx = HippyNestedScrollHelper.priorityOfX(this, dx) == Priority.NONE ? 0 : dx;
    int parentDy = HippyNestedScrollHelper.priorityOfY(this, dy) == Priority.NONE ? 0 : dy;
    if (parentDx != 0 || parentDy != 0) {
      // 把consumed暂存下来，以复用数组
      int consumedX = consumed[0];
      int consumedY = consumed[1];
      consumed[0] = 0;
      consumed[1] = 0;
      dispatchNestedPreScroll(parentDx, parentDy, consumed, null);
      dx -= consumed[0];
      consumed[0] += consumedX;
      consumed[1] += consumedY;
    }
    // 再给当前节点处理
    if (HippyNestedScrollHelper.priorityOfX(target, dx) == Priority.PARENT) {
      final int oldScrollX = getScrollX();
      scrollBy(dx, 0);
      final int myConsumed = getScrollX() - oldScrollX;
      consumed[0] += myConsumed;
    }
  }

  @Override
  public void onStopNestedScroll(View child) {
    super.onStopNestedScroll(child);
    post(new Runnable() {
      @Override
      public void run() {
        doPageScroll();
      }
    });
  }
}
