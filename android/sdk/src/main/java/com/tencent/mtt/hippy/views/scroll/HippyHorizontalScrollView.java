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
import android.os.Build;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.HorizontalScrollView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.supportui.views.ScrollChecker;
import java.util.HashMap;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;

@SuppressWarnings("deprecation")
public class HippyHorizontalScrollView extends HorizontalScrollView implements HippyViewBase,
    HippyScrollView, ScrollChecker.IScrollCheck {

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

  protected int mScrollMinOffset = 0;
  private int startScrollX = 0;
  private int mLastX = 0;
  private int initialContentOffset = 0;
  private boolean hasCompleteFirstBatch = false;
  private boolean isTvPlatform = false;
  private HippyHorizontalScrollViewFocusHelper mFocusHelper = null;

  private HashMap<Integer, Integer> scrollOffsetForReuse = new HashMap<>();

  public HippyHorizontalScrollView(Context context) {
    super(context);
    mHippyOnScrollHelper = new HippyOnScrollHelper();
    setHorizontalScrollBarEnabled(false);

    HippyEngineContext engineContext = ((HippyInstanceContext) context).getEngineContext();
    isTvPlatform = engineContext.getGlobalConfigs().getHippyPlatformAdapter().isTvPlatform();
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
    int action = event.getAction() & MotionEvent.ACTION_MASK;
    if (action == MotionEvent.ACTION_DOWN && !mDragging) {
      mDragging = true;
      if (mScrollBeginDragEventEnable) {
        LogUtils.d("HippyHorizontalScrollView", "emitScrollBeginDragEvent");
        HippyScrollViewEventHelper.emitScrollBeginDragEvent(this);
      }
    } else if (action == MotionEvent.ACTION_UP && mDragging) {
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
      startScrollX = getScrollX();
    }

    if (super.onInterceptTouchEvent(event)) {
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
        long currTime = System.currentTimeMillis();
        int offsetX = Math.abs(x - mLastX);
        if (mScrollMinOffset > 0 && offsetX >= mScrollMinOffset) {
          mLastX = x;
          HippyScrollViewEventHelper.emitScrollEvent(this);
        } else if ((mScrollMinOffset == 0) && (currTime - mLastScrollEventTimeStamp
            >= mScrollEventThrottle)) {
          mLastScrollEventTimeStamp = currTime;
          HippyScrollViewEventHelper.emitScrollEvent(this);
        }
      }
      mDoneFlinging = false;
    }
  }

  protected void doPageScroll() {
    if (mMomentumScrollBeginEventEnable) {
      HippyScrollViewEventHelper.emitScrollMomentumBeginEvent(this);
    }

    smoothScrollToPage();

    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        if (mDoneFlinging) {
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

  @Override
  public void fling(int velocityX) {
    if (!mFlingEnabled || mPagingEnabled) {
      return;
    }

    super.fling(velocityX);

    if (mMomentumScrollBeginEventEnable) {
      HippyScrollViewEventHelper.emitScrollMomentumBeginEvent(this);
    }
    Runnable runnable = new Runnable() {
      @Override
      public void run() {
        if (mDoneFlinging) {
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

  private void smoothScrollToPage() {
    int width = getWidth();
    if (width <= 0) {
      return;
    }
    int maxPage = getChildAt(0).getWidth()/width;
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
    } else {
      return super.focusSearch(focused, direction);
    }
  }

  @Override
  public void requestChildFocus(View child, View focused) {
    if (isTvPlatform) {
      mFocusHelper.scrollToFocusChild(focused);
    }
    super.requestChildFocus(child, focused);
  }
}
