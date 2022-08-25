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
import com.tencent.mtt.hippy.views.common.HippyNestedScrollComponent.HippyNestedScrollTarget;
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
  private boolean mCaptured = false;

  private void init(Context context, boolean isVertical) {
    setCallPageChangedOnFirstLayout(true);
    setEnableReLayoutOnAttachToWindow(false);

    mPageListener = new ViewPagerPageChangeListener(this);
    setOnPageChangeListener(mPageListener);
    setAdapter(createAdapter(context));
    setLeftDragOutSizeEnabled(false);
    setRightDragOutSizeEnabled(false);
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
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    if (!isScrollEnabled()) {
      return false;
    }

    return super.onInterceptTouchEvent(ev);
  }

  @Override
  public boolean onTouchEvent(MotionEvent ev) {
    if (!isScrollEnabled()) {
      return false;
    }

    return super.onTouchEvent(ev);
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
    requestDisallowInterceptTouchEvent(true);
    beginFakeDrag();
  }

  @Override
  public void onNestedPreScroll(@NonNull View target, int dx, int dy, @NonNull int[] consumed) {
    // viewpager不支持嵌套滚动，不会继续派发事件，但可以响应子节点的嵌套滚动事件
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
    }
  }

  @Override
  public void onNestedScroll(View target, int dxConsumed, int dyConsumed, int dxUnconsumed, int dyUnconsumed) {
    // viewpager不支持嵌套滚动，不会继续派发事件，但可以响应子节点的嵌套滚动事件
    HippyNestedScrollTarget cc = (HippyNestedScrollTarget) target;
    if (mAxes == SCROLL_AXIS_HORIZONTAL && dxUnconsumed != 0) {
      if (HippyNestedScrollHelper.priorityOfX(target, dxUnconsumed) == Priority.SELF) {
        fakeDragBy(-dxUnconsumed);
        mCaptured = true;
      }
    } else if (mAxes == SCROLL_AXIS_VERTICAL && dyUnconsumed != 0) {
      if (HippyNestedScrollHelper.priorityOfY(target, dyUnconsumed) == Priority.SELF) {
        fakeDragBy(-dyUnconsumed);
        mCaptured = true;
      }
    }
  }

  @Override
  public boolean onNestedPreFling(View target, float velocityX, float velocityY) {
    // 消费子节点的fling事件，防止endDrag时子节点同时触发惯性滚动
    return mCaptured;
  }

  @Override
  public void onStopNestedScroll(View child) {
    endFakeDrag();
    mCaptured = false;
  }
}
