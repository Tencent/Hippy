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
package com.tencent.mtt.hippy.views.viewpager;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.Priority;
import com.tencent.mtt.hippy.views.common.HippyNestedScrollHelper;
import com.tencent.mtt.supportui.views.viewpager.ViewPager;

@SuppressWarnings({"unused"})
public class HippyViewPager extends ViewPager implements HippyViewBase {

  private static final String TAG = "HippyViewPager";

  private final Runnable mMeasureAndLayout = new Runnable() {
    @Override
    public void run() {
      measure(View.MeasureSpec.makeMeasureSpec(getWidth(), View.MeasureSpec.EXACTLY),
          View.MeasureSpec.makeMeasureSpec(getHeight(), View.MeasureSpec.EXACTLY));
      layout(getLeft(), getTop(), getRight(), getBottom());
    }
  };


  private NativeGestureDispatcher mGestureDispatcher;
  private boolean mFirstUpdateChild = true;
  private final boolean mReNotifyOnAttach = false;
  private ViewPagerPageChangeListener mPageListener;
  private final Handler mHandler = new Handler(Looper.getMainLooper());
  private Promise mCallBackPromise;
  private int mAxes;
  /**
   * Captured means scrolling occurs, consume the entire scrolling (or nested scrolling) event and
   * do not dispatch to parent in this state
   */
  private boolean mCaptured = false;
  // Reusable int array to be passed to method calls that mutate it in order to "return" two ints.
  private final int[] mScrollOffsetPair = new int[2];
  private int mNestedScrollOffset = 0;

  private void init(Context context, boolean isVertical) {
    setCallPageChangedOnFirstLayout(true);
    setEnableReLayoutOnAttachToWindow(false);

    mPageListener = new ViewPagerPageChangeListener(this);
    setOnPageChangeListener(mPageListener);
    setAdapter(createAdapter(context));
    setLeftDragOutSizeEnabled(false);
    setRightDragOutSizeEnabled(false);
    // enable nested scrolling
    setNestedScrollingEnabled(true);
    mAxes = isVertical ? SCROLL_AXIS_VERTICAL : SCROLL_AXIS_HORIZONTAL;

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

  public HippyViewPager(Context context, boolean isVertical) {
    super(context, isVertical);
    init(context, isVertical);
  }

  public HippyViewPager(Context context) {
    super(context);
    init(context, false);
  }

  public void setCallBackPromise(Promise promise) {
    mCallBackPromise = promise;
  }

  public Promise getCallBackPromise() {
    return mCallBackPromise;
  }

  protected HippyViewPagerAdapter createAdapter(Context context) {
    return new HippyViewPagerAdapter((HippyInstanceContext) context, this);
  }

  public void setInitialPageIndex(int index) {
    getAdapter().setInitPageIndex(index);
  }


  public void setChildCountAndUpdate(final int childCount) {
    LogUtils.d(TAG, "doUpdateInternal: " + hashCode() + ", childCount=" + childCount);
    if (mFirstUpdateChild) {
      setFirstLayoutParameter(true);
      mFirstUpdateChild = false;
    }
    getAdapter().setChildSize(childCount);
    //getWindowToken() == null执行这个操作，onAttachToWindow就不需要了。
    getAdapter().notifyDataSetChanged();
    triggerRequestLayout();
  }

  protected void addViewToAdapter(HippyViewPagerItem view, int postion) {
    HippyViewPagerAdapter adapter = getAdapter();
    if (adapter != null) {
      adapter.addView(view, postion);
    }
  }

  protected int getAdapterViewSize() {
    HippyViewPagerAdapter adapter = getAdapter();
    if (adapter != null) {
      return adapter.getItemViewSize();
    }
    return 0;
  }

  protected void removeViewFromAdapter(HippyViewPagerItem view) {
    HippyViewPagerAdapter adapter = getAdapter();
    if (adapter != null) {
      adapter.removeView(view);
    }
  }

  public View getViewFromAdapter(int currentItem) {
    HippyViewPagerAdapter adapter = getAdapter();
    if (adapter != null) {
      return adapter.getViewAt(currentItem);
    }
    return null;
  }

  @Override
  public HippyViewPagerAdapter getAdapter() {
    return (HippyViewPagerAdapter) super.getAdapter();
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
    if (hasNestedScrollingParent() && mNestedScrollOffset != 0) {
      // After the nested scroll occurs, the current View position has changed. The coordinate
      // origin of ev.getX() and mLastMotionX/Y is different, and the ev offset needs to be
      // corrected.
      MotionEvent transformEv = MotionEvent.obtain(ev);
      if (mAxes == SCROLL_AXIS_HORIZONTAL) {
          transformEv.offsetLocation(mNestedScrollOffset, 0);
      } else {
          transformEv.offsetLocation(0, mNestedScrollOffset);
      }
      boolean result = super.dispatchTouchEvent(transformEv);
      transformEv.recycle();
      return result;
    }
    return super.dispatchTouchEvent(ev);
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    if (!isScrollEnabled() || getNestedScrollAxes() != SCROLL_AXIS_NONE) {
      return false;
    }
    boolean result = super.onInterceptTouchEvent(ev);
    switch (ev.getAction() & MotionEvent.ACTION_MASK) {
        case MotionEvent.ACTION_DOWN:
            mNestedScrollOffset = 0;
            startNestedScroll(mAxes);
            break;
        case MotionEvent.ACTION_CANCEL:
        case MotionEvent.ACTION_UP:
            stopNestedScroll();
            break;
        default:
            break;
    }
    return result;
  }

  @Override
  public boolean onTouchEvent(MotionEvent ev) {
    if (!isScrollEnabled()) {
      return false;
    }
    boolean result = super.onTouchEvent(ev);
    if (result) {
      switch (ev.getAction() & MotionEvent.ACTION_MASK) {
        case MotionEvent.ACTION_DOWN:
          mNestedScrollOffset = 0;
          startNestedScroll(mAxes);
          break;
        case MotionEvent.ACTION_CANCEL:
        case MotionEvent.ACTION_UP:
          mCaptured = false;
          stopNestedScroll();
          break;
        default:
          break;
      }
    }
    return result;
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    LogUtils.d(TAG, "onAttachedToWindow: " + hashCode() + ", childCount=" + getChildCount()
        + ", repopulate=" + mNeedRepopulate
        + ", renotifyOnAttach=" + mReNotifyOnAttach);

    /*
     * hippy 在setChildCountAndUpdate打开，执行了
     * if (mReNotifyOnAttach)
     * {
     * getAdapter().notifyDataSetChanged();
     * mReNotifyOnAttach = false;
     * }
     */
    // 9.6在supportui已经把windowToken的检查过滤去掉了，所以这里应该关掉
    /*
     * if (mNeedRepopulate) //这个是是在supportUI工程里面poplate的时候设置的。再没有上树的情况下
     * {
     * mNeedRepopulate = false;
     * triggerRequestLayout();
     * postInvalidate();
     * }
     */
  }

  @Override
  protected void onDetachedFromWindow() {
    super.onDetachedFromWindow();
    LogUtils.d(TAG, "onDetachedFromWindow: " + hashCode() + ", childCount=" + getChildCount()
        + ", repopulate=" + mNeedRepopulate
        + ", renotifyOnAttach=" + mReNotifyOnAttach);
  }

  public void switchToPage(int item, boolean animated) {
    LogUtils.d(TAG,
        "switchToPage: " + hashCode() + ", item=" + item + ", animated=" + animated);
    if (getAdapter().getCount() == 0) // viewpager的children没有初始化好的时候，直接设置mInitialPageIndex
    {
      LogUtils.d(TAG, "switchToPage: getAdapter().getCount() == 0");
    } else {
      if (getCurrentItem() != item) // 如果和当前位置一样，就不进行switch
      {
        if (isSettling()) {
          // 如果仍然在滑动中，重置一下状态
          setScrollingCacheEnabled(false);
          mScroller.abortAnimation();
          int oldX = getScrollX();
          int oldY = getScrollY();
          int x = mScroller.getCurrX();
          int y = mScroller.getCurrY();
          if (oldX != x || oldY != y) {
            scrollTo(x, y);
          }
          setScrollState(SCROLL_STATE_IDLE);
        }
        setCurrentItem(item, animated);
      } else if (!isFirstLayout()) {
        mPageListener.onPageSelected(item);
      }
    }
  }

  @Override
  public NativeGestureDispatcher getGestureDispatcher() {
    return mGestureDispatcher;
  }

  @Override
  public void setGestureDispatcher(NativeGestureDispatcher nativeGestureDispatcher) {
    mGestureDispatcher = nativeGestureDispatcher;
  }

  public void triggerRequestLayout() {
    mHandler.post(mMeasureAndLayout);
  }

  @Override
  public boolean onStartNestedScroll(@NonNull View child, @NonNull View target, int axes) {
    if (!isScrollEnabled()) {
      return false;
    }
    return (axes & mAxes) != 0;
  }

  @Override
  public void onNestedScrollAccepted(@NonNull View child, @NonNull View target, int axes) {
    super.onNestedScrollAccepted(child, target, axes);
    startNestedScroll(axes);
  }

  @Override
  public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed) {
    // viewpager does not support nested scrolling, only when it cannot scroll, will the event from
    // child be passed to the ancestor
    if (!mCaptured) {
      if (mAxes == SCROLL_AXIS_HORIZONTAL && dx != 0) {
        if (HippyNestedScrollHelper.priorityOfX(target, dx) == Priority.PARENT) {
          mCaptured = canScrollHorizontally(dx);
        }
      } else if (mAxes == SCROLL_AXIS_VERTICAL && dy != 0) {
        if (HippyNestedScrollHelper.priorityOfY(target, dy) == Priority.PARENT) {
          mCaptured = canScrollVertically(dy);
        }
      }
    }
    if (mCaptured) {
      if (mAxes == SCROLL_AXIS_HORIZONTAL) {
        fakeDragBy(-dx);
        consumed[0] += dx;
      } else {
        fakeDragBy(-dy);
        consumed[1] += dy;
      }
    } else if (dx != 0 || dy != 0) {
      dispatchNestedPreScroll(dx, dy, consumed, null);
    }
  }

  @Override
  public void onNestedScroll(View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
    // viewpager does not support nested scrolling, only when it cannot scroll, will the event from
    // child be passed to the ancestor
    if (!mCaptured) {
      if (mAxes == SCROLL_AXIS_HORIZONTAL && dxUnconsumed != 0) {
        if (HippyNestedScrollHelper.priorityOfX(target, dxUnconsumed) == Priority.SELF) {
          mCaptured = canScrollHorizontally(dxUnconsumed);
        }
      } else if (mAxes == SCROLL_AXIS_VERTICAL && dyUnconsumed != 0) {
        if (HippyNestedScrollHelper.priorityOfY(target, dyUnconsumed) == Priority.SELF) {
          mCaptured = canScrollVertically(dyUnconsumed);
        }
      }
    }
    if (mCaptured) {
      if (mAxes == SCROLL_AXIS_HORIZONTAL) {
        fakeDragBy(-dxUnconsumed);
      } else {
        fakeDragBy(-dyUnconsumed);
      }
    } else if (dxUnconsumed != 0 || dyUnconsumed != 0) {
      dispatchNestedScroll(dxConsumed, dyConsumed, dxUnconsumed, dyUnconsumed, null);
    }
  }

  @Override
  public boolean onNestedPreFling(View target, float velocityX, float velocityY) {
    // Consume any fling event from child to prevent the child View from triggering non-touch
    // scrolling at the same time when endFakeDrag()
    return mCaptured;
  }

  @Override
  public void onStopNestedScroll(View child) {
    // Nested scrolling API may trigger out of order, check fake dragging state to prevent
    // ViewPager from throwing IllegalStateException
    if (isFakeDragging()) {
      endFakeDrag();
    }
    mCaptured = false;
    stopNestedScroll();
  }

  @Override
  public void fakeDragBy(float offset) {
    // Nested scrolling API may trigger out of order, check fake dragging state to prevent
    // ViewPager from throwing IllegalStateException
    if (isFakeDragging() || beginFakeDrag()) {
      super.fakeDragBy(offset);
    }
  }

  @Override
  protected boolean onStartDrag(boolean start) {
    if (super.onStartDrag(start)) {
      mCaptured = true;
      return true;
    }
    return hasNestedScrollingParent();
  }

  @Override
  protected boolean performDrag(float x) {
    // Dispatch nested scrolling event only when it cannot scroll
    if (!mCaptured) {
      int dx = 0;
      int dy = 0;
      boolean horizontal = mAxes == SCROLL_AXIS_HORIZONTAL;
      if (horizontal) {
        dx = Math.round(mLastMotionX - x);
      } else {
        dy = Math.round(mLastMotionY - x);
      }
      if (dx == 0 && dy == 0) {
        return false;
      }
      if (dispatchNestedPreScroll(dx, dy ,null, mScrollOffsetPair)) {
        if (horizontal) {
          mNestedScrollOffset += mScrollOffsetPair[0];
          mLastMotionX = x;
        } else {
          mNestedScrollOffset += mScrollOffsetPair[1];
          mLastMotionY = x;
        }
        return false;
      }
      mCaptured = horizontal ? horizontalCanScroll(dx) : verticalCanScroll(dy);
      if (!mCaptured) {
        if (dispatchNestedScroll(0, 0, dx, dy, mScrollOffsetPair)) {
          if (horizontal) {
            mNestedScrollOffset += mScrollOffsetPair[0];
            mLastMotionX = x;
          } else {
            mNestedScrollOffset += mScrollOffsetPair[1];
            mLastMotionY = x;
          }
        }
        return false;
      }
    }
    return super.performDrag(x);
  }
}
