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
import android.view.MotionEvent;
import android.widget.HorizontalScrollView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.supportui.views.ScrollChecker;
import java.util.HashMap;

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

  protected int mScrollEventThrottle = 400; // 400ms最多回调一次
  private long mLastScrollEventTimeStamp = -1;

  protected int mScrollMinOffset = 0;
  private int mLastX = 0;

  private HashMap<Integer, Integer> scrollOffsetForReuse = new HashMap<>();

  public HippyHorizontalScrollView(Context context) {
    super(context);
    mHippyOnScrollHelper = new HippyOnScrollHelper();
    setHorizontalScrollBarEnabled(false);
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
        } else if ((mScrollMinOffset == 0) && (currTime - mLastScrollEventTimeStamp
            >= mScrollEventThrottle)) {
          mLastScrollEventTimeStamp = currTime;
        } else {
          return;
        }

        HippyScrollViewEventHelper.emitScrollEvent(this);
      }
      mDoneFlinging = false;
    }

  }

  @Override
  public void fling(int velocityX) {
    if (!mFlingEnabled) {
      return;
    }

    if (mPagingEnabled) {
      smoothScrollToPage(velocityX);
    } else {
      super.fling(velocityX);
    }
    if (mMomentumScrollBeginEventEnable) {
      HippyScrollViewEventHelper.emitScrollMomentumBeginEvent(this);
    }
    Runnable runnable = new Runnable() {
      private boolean mSnappingToPage = false;

      @Override
      public void run() {
        if (mDoneFlinging) {
          boolean doneWithAllScrolling = true;
          if (mPagingEnabled && !mSnappingToPage) {
            mSnappingToPage = true;
            smoothScrollToPage(0);
            doneWithAllScrolling = false;
          }

          if (doneWithAllScrolling) {
            if (mMomentumScrollEndEventEnable) {
              HippyScrollViewEventHelper.emitScrollMomentumEndEvent(HippyHorizontalScrollView.this);
            }
          } else {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
              postOnAnimationDelayed(this, HippyScrollViewEventHelper.MOMENTUM_DELAY);
            } else {
              HippyHorizontalScrollView.this.getHandler()
                  .postDelayed(this, 16 + HippyScrollViewEventHelper.MOMENTUM_DELAY);
            }
          }

        } else {
          mDoneFlinging = true;
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            postOnAnimationDelayed(this, HippyScrollViewEventHelper.MOMENTUM_DELAY);
          } else {
            HippyHorizontalScrollView.this.getHandler()
                .postDelayed(this, 16 + HippyScrollViewEventHelper.MOMENTUM_DELAY);
          }
        }
      }
    };
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
      postOnAnimationDelayed(runnable, HippyScrollViewEventHelper.MOMENTUM_DELAY);
    } else {
      this.getHandler().postDelayed(runnable, 16 + HippyScrollViewEventHelper.MOMENTUM_DELAY);
    }
  }

  private void smoothScrollToPage(int velocity) {
    int width = getWidth();
    int currentX = getScrollX();
    int predictedX = currentX + velocity;
    int page = 0;
    if (width != 0) {
      page = currentX / width;
    }

    if (predictedX > page * width + width / 2) {
      page = page + 1;
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
}
