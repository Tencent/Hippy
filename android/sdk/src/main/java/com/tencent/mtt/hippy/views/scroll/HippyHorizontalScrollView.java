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
import androidx.core.view.NestedScrollingChildHelper;
import androidx.core.view.NestedScrollingParent2;
import androidx.core.view.ViewCompat;
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
    HippyScrollView, ScrollChecker.IScrollCheck, HippyNestedScrollTarget, NestedScrollingParent2 {

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
  private int mScrollRange = 0;
  protected int mScrollMinOffset = 0;
  private int startScrollX = 0;
  private int mLastX = 0;
  private int initialContentOffset = 0;
  private boolean hasCompleteFirstBatch = false;
  private final boolean isTvPlatform;
  private HippyHorizontalScrollViewFocusHelper mFocusHelper = null;

  private HashMap<Integer, Integer> scrollOffsetForReuse = new HashMap<>();
  private final Priority[] mNestedScrollPriority = { Priority.SELF, Priority.NOT_SET, Priority.NOT_SET, Priority.NOT_SET, Priority.NOT_SET };
  private final int[] mScrollConsumedPair = new int[2];
  private final int[] mScrollOffsetPair = new int[2];
  private final NestedScrollingChildHelper mChildHelper = new NestedScrollingChildHelper(this);
  private int mNestedXOffset;
  private int mNestedScrollAxesNonTouch;

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
  public boolean dispatchTouchEvent(MotionEvent ev) {
    if (hasNestedScrollingParent() && mNestedXOffset != 0) {
      // After the nested scroll occurs, the current View position has changed. The coordinate
      // origin of ev.getX() and mLastTouchDownX is different, and the ev offset needs to be
      // corrected.
      MotionEvent transformEv = MotionEvent.obtain(ev);
      transformEv.offsetLocation(mNestedXOffset, 0);
      boolean result = super.dispatchTouchEvent(transformEv);
      transformEv.recycle();
      return result;
    }
    return super.dispatchTouchEvent(ev);
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
        }
        result = super.onTouchEvent(event);
        if (result) {
          mNestedXOffset = 0;
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
    // noinspection WrongConstant
    if (!mScrollEnabled || getNestedScrollAxes() != SCROLL_AXIS_NONE) {
      return false;
    }

    int action = event.getAction() & MotionEvent.ACTION_MASK;
    boolean result;
    try {
      result = super.onInterceptTouchEvent(event);
    } catch (Exception e) {
      result = false;
    }
    switch (action) {
      case MotionEvent.ACTION_DOWN:
        startScrollX = getScrollX();
        mNestedXOffset = 0;
        startNestedScroll(SCROLL_AXIS_HORIZONTAL);
        break;
      case MotionEvent.ACTION_CANCEL:
      case MotionEvent.ACTION_UP:
        stopNestedScroll();
        break;
      default:
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

  @Override
  protected boolean overScrollBy(int deltaX, int deltaY, int scrollX, int scrollY, int scrollRangeX,
      int scrollRangeY, int maxOverScrollX, int maxOverScrollY, boolean isTouchEvent) {
    if (!isTouchEvent || !hasNestedScrollingParent()
        || HippyNestedScrollHelper.priorityOfX(this, deltaX) == Priority.NONE) {
      // without nested scrolling
      return super.overScrollBy(deltaX, deltaY, scrollX, scrollY, scrollRangeX, scrollRangeY,
          maxOverScrollX, maxOverScrollY, isTouchEvent);
    }
    int consumed = 0;
    int unConsumed = deltaX;
    mScrollConsumedPair[0] = 0;
    mScrollConsumedPair[1] = 0;
    if (dispatchNestedPreScroll(unConsumed, 0, mScrollConsumedPair, mScrollOffsetPair)) {
      consumed = mScrollConsumedPair[0];
      unConsumed -= mScrollConsumedPair[0];
      mNestedXOffset += mScrollOffsetPair[0];
      if (unConsumed == 0) {
        return false;
      }
    }
    int myDx = unConsumed < 0 ? Math.max(unConsumed, -scrollX)
        : Math.min(unConsumed, scrollRangeX - scrollX - 1);
    if (myDx != 0) {
      super.overScrollBy(myDx, 0, scrollX, scrollY, scrollRangeX, scrollRangeY, maxOverScrollX,
          maxOverScrollY, true);
      consumed += myDx;
      unConsumed -= myDx;
    }
    if (unConsumed != 0) {
      dispatchNestedScroll(consumed, 0, unConsumed, 0, mScrollOffsetPair);
      mNestedXOffset += mScrollOffsetPair[0];
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
        } else if ((mScrollMinOffset == 0) && ((currTime = SystemClock.elapsedRealtime())
            - mLastScrollEventTimeStamp >= mScrollEventThrottle)) {
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
    int scrollRange = mScrollRange;
    View firstChild = getChildAt(0);
    if (firstChild != null) {
      mScrollRange = firstChild.getWidth();
    }
    if (hasCompleteFirstBatch) {
      if (mScrollRange < scrollRange) {
        scrollTo(getScrollX(), getScrollY());
      }
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
    Priority result = mNestedScrollPriority[direction];
    if (result == Priority.NOT_SET) {
      result = mNestedScrollPriority[DIRECTION_ALL];
    }
    return result;
  }

  @Override
  public boolean onStartNestedScroll(@NonNull View child, @NonNull View target, int axes) {
    return onStartNestedScroll(child, target, axes, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public boolean onStartNestedScroll(@NonNull View child, @NonNull View target, int axes, int type) {
    if (!mScrollEnabled) {
      return false;
    }
    return (axes & SCROLL_AXIS_HORIZONTAL) != 0;
  }

  @Override
  public void onNestedScrollAccepted(@NonNull View child, @NonNull View target, int axes) {
    super.onNestedScrollAccepted(child, target, axes);
    startNestedScroll(SCROLL_AXIS_HORIZONTAL);
  }

  @Override
  public void onNestedScrollAccepted(@NonNull View child, @NonNull View target, int axes, int type) {
    if (type == ViewCompat.TYPE_TOUCH) {
      super.onNestedScrollAccepted(child, target, axes);
      startNestedScroll(SCROLL_AXIS_HORIZONTAL);
    } else {
      mNestedScrollAxesNonTouch = axes;
      mChildHelper.startNestedScroll(ViewCompat.SCROLL_AXIS_HORIZONTAL, type);
    }
  }

  @Override
  public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
    onNestedScroll(target, dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public void onNestedScroll(@NonNull View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed, int type) {
    if (mPagingEnabled && type == ViewCompat.TYPE_NON_TOUCH) {
      return;
    }
    // Process the current View first
    if (HippyNestedScrollHelper.priorityOfX(target, dxUnconsumed) == Priority.SELF) {
      final int oldScrollX = getScrollX();
      scrollBy(dxUnconsumed, 0);
      final int myConsumed = getScrollX() - oldScrollX;
      dxConsumed += myConsumed;
      dxUnconsumed -= myConsumed;
    }
    // Then dispatch to the parent for processing
    int parentDx = HippyNestedScrollHelper.priorityOfX(this, dxUnconsumed) == Priority.NONE ? 0 : dxUnconsumed;
    int parentDy = HippyNestedScrollHelper.priorityOfY(this, dyUnconsumed) == Priority.NONE ? 0 : dyUnconsumed;
    if (parentDx != 0 || parentDy != 0) {
      if (type == ViewCompat.TYPE_TOUCH) {
        dispatchNestedScroll(dxConsumed, dyConsumed, parentDx, parentDy, null);
      } else {
        mChildHelper.dispatchNestedScroll(dxConsumed, dyConsumed, parentDx, parentDy, null, type);
      }
    }
  }

  @Override
  public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed) {
    onNestedPreScroll(target, dx, dy, consumed, ViewCompat.TYPE_TOUCH);
  }

  @Override
  public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed, int type) {
    if (mPagingEnabled && type == ViewCompat.TYPE_NON_TOUCH) {
      if (HippyNestedScrollHelper.priorityOfY(target, dy) == Priority.PARENT) {
        consumed[0] += dx;
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
      if (type == ViewCompat.TYPE_TOUCH) {
        dispatchNestedPreScroll(parentDx, parentDy, consumed, null);
      } else {
        mChildHelper.dispatchNestedPreScroll(parentDx, parentDy, consumed, null, type);
      }
      dx -= consumed[0];
      consumed[0] += consumedX;
      consumed[1] += consumedY;
    }
    // Then process the current View
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
    if(mPagingEnabled) {
      post(new Runnable() {
        @Override
        public void run() {
          doPageScroll();
        }
      });
    }
  }

  @Override
  public void onStopNestedScroll(@NonNull View target, int type) {
    if (type == ViewCompat.TYPE_TOUCH) {
      onStopNestedScroll(target);
    } else {
      mChildHelper.stopNestedScroll(type);
      mNestedScrollAxesNonTouch = SCROLL_AXIS_NONE;
    }
  }

  @Override
  public int getNestedScrollAxes() {
    return super.getNestedScrollAxes() | mNestedScrollAxesNonTouch;
  }
}
