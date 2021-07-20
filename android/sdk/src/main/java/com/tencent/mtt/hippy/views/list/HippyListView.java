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
package com.tencent.mtt.hippy.views.list;

import android.view.ViewConfiguration;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderView;
import com.tencent.mtt.hippy.views.scroll.HippyScrollViewEventHelper;
import com.tencent.mtt.supportui.views.recyclerview.BaseLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.LinearLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerView;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem;

import android.content.Context;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;

@SuppressWarnings({"deprecation", "unused"})
public class HippyListView extends RecyclerView implements HippyViewBase {

  public final static int REFRESH_STATE_IDLE = 0;
  public final static int REFRESH_STATE_LOADING = 1;

  public static final String EVENT_TYPE_HEADER_RELEASED = "onHeaderReleased";
  public static final String EVENT_TYPE_HEADER_PULLING = "onHeaderPulling";

  public static final String EVENT_TYPE_FOOTER_RELEASED = "onFooterReleased";
  public static final String EVENT_TYPE_FOOTER_PULLING = "onFooterPulling";

  protected int mHeaderRefreshState = REFRESH_STATE_IDLE;
  protected int mFooterRefreshState = REFRESH_STATE_IDLE;
  protected final boolean mEnableRefresh = true;

  private HippyListAdapter mListAdapter;

  private HippyEngineContext mHippyContext;

  private NativeGestureDispatcher mGestureDispatcher;

  protected boolean mScrollBeginDragEventEnable = false;

  protected boolean mScrollEndDragEventEnable = false;

  protected boolean mMomentumScrollBeginEventEnable = false;

  protected boolean mMomentumScrollEndEventEnable = false;

  protected boolean mScrollEventEnable = true;

  protected boolean mScrollEnable = true;

  protected boolean mExposureEventEnable = false;

  boolean enableInterceptHorizontalTouch = false;
  private float touchDownY;
  private float touchDownX;
  private int touchSlop;

  protected int mScrollEventThrottle = 400;  // 400ms最多回调一次
  protected int mLastOffsetX = Integer.MIN_VALUE;
  protected int mLastOffsetY = Integer.MIN_VALUE;
  protected long mLastScrollEventTimeStamp = -1;

  private boolean mHasRemovePreDraw = false;
  private ViewTreeObserver.OnPreDrawListener mPreDrawListener = null;
  private ViewTreeObserver mViewTreeObserver = null;
  private OnInitialListReadyEvent mOnInitialListReadyEvent;

  private OnScrollDragStartedEvent mOnScrollDragStartedEvent;
  private OnScrollDragEndedEvent mOnScrollDragEndedEvent;
  private OnScrollFlingStartedEvent mOnScrollFlingStartedEvent;
  private OnScrollFlingEndedEvent mOnScrollFlingEndedEvent;
  private OnScrollEvent mOnScrollEvent;

  private void init(Context context, int orientation) {
    mHippyContext = ((HippyInstanceContext) context).getEngineContext();
    this.setLayoutManager(new LinearLayoutManager(context, orientation, false));
    setRepeatableSuspensionMode(false);
    mListAdapter = createAdapter(this, mHippyContext);
    setAdapter(mListAdapter);

    final ViewConfiguration configuration = ViewConfiguration.get(context);
    touchSlop = configuration.getScaledTouchSlop();
  }

  public HippyListView(Context context, int orientation) {
    super(context);
    init(context, orientation);
  }

  public HippyListView(Context context) {
    super(context);
    init(context, BaseLayoutManager.VERTICAL);
  }

  protected HippyListAdapter createAdapter(RecyclerView hippyRecyclerView,
      HippyEngineContext hippyEngineContext) {
    return new HippyListAdapter(hippyRecyclerView, hippyEngineContext);
  }

  @Override
  public NativeGestureDispatcher getGestureDispatcher() {
    return mGestureDispatcher;
  }

  @Override
  public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
    this.mGestureDispatcher = dispatcher;
  }

  @Override
  public boolean onTouchEvent(MotionEvent motionEvent) {
    if (!mScrollEnable) {
      return false;
    }
    return super.onTouchEvent(motionEvent);
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent motionEvent) {
    if (!mScrollEnable) {
      return false;
    }

    if (enableInterceptHorizontalTouch) {
      int action = motionEvent.getAction();
      float y = motionEvent.getY();
      float x = motionEvent.getX();
      switch (action) {
        case MotionEvent.ACTION_DOWN: {
          touchDownY = y;
          touchDownX = x;
          break;
        }
        case MotionEvent.ACTION_MOVE: {
          if (Math.abs(x - touchDownX) / Math.abs(y - touchDownY) > 1 && Math.abs(x - touchDownX) > touchSlop) {
            return false;
          }
          break;
        }
      }
    }

    return super.onInterceptTouchEvent(motionEvent);
  }


  public void setListData() {
    LogUtils.d("hippylistview", "setListData");
    mListAdapter.notifyDataSetChanged();

    int beforeCount = getChildCount();
    dispatchLayout();
    int afterCount = getChildCount();

    if (beforeCount == 0 && (afterCount > beforeCount) && mExposureEventEnable) {
      dispatchExposureEvent();
    }
  }

  void setEnableInterceptHorizontalTouch(boolean enable) {
    enableInterceptHorizontalTouch = enable;
  }

  public void setScrollBeginDragEventEnable(boolean enable) {
    mScrollBeginDragEventEnable = enable;
  }

  public void setScrollEndDragEventEnable(boolean enable) {
    mScrollEndDragEventEnable = enable;
  }

  public void setMomentumScrollBeginEventEnable(boolean enable) {
    mMomentumScrollBeginEventEnable = enable;
  }

  public void setMomentumScrollEndEventEnable(boolean enable) {
    mMomentumScrollEndEventEnable = enable;
  }

  public void setOnScrollEventEnable(boolean enable) {
    mScrollEventEnable = enable;
  }

  protected HippyMap generateScrollEvent() {
    float value;
    HippyMap contentOffset = new HippyMap();
    if (mLayout.canScrollHorizontally()) {
      value = (mOffsetX - mState.mCustomHeaderWidth)/PixelUtil.getDensity();
      contentOffset.pushDouble("x", value);
      contentOffset.pushDouble("y", 0.0f);
    } else {
      value = (mOffsetY - mState.mCustomHeaderHeight)/PixelUtil.getDensity();
      contentOffset.pushDouble("x", 0.0f);
      contentOffset.pushDouble("y", value);
    }

    HippyMap event = new HippyMap();
    event.pushMap("contentOffset", contentOffset);
    return event;
  }

  public void setScrollEnable(boolean enable) {
    mScrollEnable = enable;
  }

  public void setExposureEventEnable(boolean enable) {
    mExposureEventEnable = enable;
  }

  public void setScrollEventThrottle(int scrollEventThrottle) {
    mScrollEventThrottle = scrollEventThrottle;
  }

  public View getCustomHeaderView() {
    if (getChildCount() > 0) {
      View firstChild = getChildAt(0);
      final ViewHolder holder = getChildViewHolderInt(firstChild);
      if (holder != null) {
        return holder.mContent;
      }
    }

    return null;
  }

  public View getCustomFooterView() {
    if (getChildCount() > 0) {
      View lastChild = getChildAt(getChildCount() - 1);
      final ViewHolder holder = getChildViewHolderInt(lastChild);
      if (holder != null) {
        return holder.mContent;
      }
    }

    return null;
  }

  public void onHeaderRefreshFinish() {
    if (mHeaderRefreshState == REFRESH_STATE_LOADING) {
      if (mLayout.canScrollHorizontally()) {
        if (mOffsetX < mState.mCustomHeaderWidth) {
          smoothScrollBy(-mOffsetX + mState.mCustomHeaderWidth, 0, false, true);
        }
      } else {
        if (mOffsetY < mState.mCustomHeaderHeight) {
          smoothScrollBy(0, -mOffsetY + mState.mCustomHeaderHeight, false, true);
        }
      }

      mHeaderRefreshState = REFRESH_STATE_IDLE;
    }
  }

  public void onFooterRefreshFinish() {
    if (mFooterRefreshState == REFRESH_STATE_LOADING) {
      if (mLayout.canScrollHorizontally()) {
        int contentOffsetX = getTotalHeight() - getWidth();
        if (mOffsetX > contentOffsetX) {
          smoothScrollBy(contentOffsetX - mOffsetX, 0, false, true);
        }
      } else {
        int contentOffsetY = getTotalHeight() - getHeight();
        if (mOffsetY > contentOffsetY) {
          smoothScrollBy(0, contentOffsetY - mOffsetY, false, true);
        }
      }
      mFooterRefreshState = REFRESH_STATE_IDLE;
    }
  }

  public void onHeaderRefresh() {
    if (mHeaderRefreshState == REFRESH_STATE_IDLE) {
      if (mLayout.canScrollHorizontally()) {
        smoothScrollBy(-mOffsetX, 0, false, true);
      } else {
        smoothScrollBy(0, -mOffsetY, false, true);
      }
    }
  }

  protected void onTouchMove(int x, int y) {
    int totalHeight = mAdapter.getTotalHeight();
    HippyMap param = new HippyMap();
    float contentOffset = 0;
    String eventName = "";

    if (mLayout.canScrollHorizontally()) {
      if (mOffsetX < mState.mCustomHeaderWidth) {
        contentOffset = Math.abs((mOffsetX - mState.mCustomHeaderWidth));
        eventName = EVENT_TYPE_HEADER_PULLING;
      } else if (mOffsetX > totalHeight - getWidth()) {
        contentOffset = Math.abs((mOffsetX - totalHeight - getWidth()));
        eventName = EVENT_TYPE_FOOTER_PULLING;
      }
    } else {
      if (getOffsetY() < mState.mCustomHeaderHeight) {
        contentOffset = Math.abs((getOffsetY() - mState.mCustomHeaderHeight));
        eventName = EVENT_TYPE_HEADER_PULLING;
      } else if (getOffsetY() > totalHeight - getHeight()) {
        contentOffset = Math.abs((getOffsetY() - totalHeight - getHeight()));
        eventName = EVENT_TYPE_FOOTER_PULLING;
      }
    }

    param.pushDouble("contentOffset", PixelUtil.px2dp(contentOffset));
    switch (eventName) {
      case EVENT_TYPE_HEADER_PULLING:
        sendPullHeaderEvent(eventName, param);
        break;
      case EVENT_TYPE_FOOTER_PULLING:
        sendPullFooterEvent(eventName, param);
        break;
    }
  }

  private boolean shouldStopReleaseGlowsForHorizontal(boolean fromTouch) {
    int totalHeight = mAdapter.getTotalHeight();
    if (mOffsetX <= 0 || getWidth() > (totalHeight - mState.mCustomHeaderWidth)) {
      if (mHeaderRefreshState == REFRESH_STATE_IDLE && fromTouch) {
        sendPullHeaderEvent(EVENT_TYPE_HEADER_RELEASED, new HippyMap());
        mHeaderRefreshState = REFRESH_STATE_LOADING;
      }

      if (mOffsetX < 0) {
        smoothScrollBy(-mOffsetX, 0, false, true);
      }
      return true;
    } else {
      int refreshEnableOffsetX = totalHeight - getWidth() + mState.mCustomFooterWidth;
      if ((totalHeight - mState.mCustomHeaderWidth) < getWidth()
          || mOffsetX >= refreshEnableOffsetX) {
        if (mFooterRefreshState == REFRESH_STATE_IDLE) {
          sendPullFooterEvent(EVENT_TYPE_FOOTER_RELEASED, new HippyMap());
          mFooterRefreshState = REFRESH_STATE_LOADING;
        }

        View footerView = getCustomFooterView();
        if (footerView instanceof HippyPullFooterView) {
          boolean stickEnabled = ((HippyPullFooterView) footerView).getStickEnabled();
          if (stickEnabled) {
            smoothScrollBy(refreshEnableOffsetX - mOffsetX, 0, false, true);
            return true;
          }
        }
      }
    }

    return false;
  }

  private boolean shouldStopReleaseGlowsForVertical(boolean fromTouch) {
    int totalHeight = mAdapter.getTotalHeight();
    if (getOffsetY() <= 0 || getHeight() > (totalHeight - mState.mCustomHeaderHeight)) {
      if (mHeaderRefreshState == REFRESH_STATE_IDLE && fromTouch) {
        sendPullHeaderEvent(EVENT_TYPE_HEADER_RELEASED, new HippyMap());
        mHeaderRefreshState = REFRESH_STATE_LOADING;
      }
      if (getOffsetY() < 0) {
        smoothScrollBy(0, -mOffsetY, false, true);
      }
      return true;
    } else {
      int refreshEnableOffsetY = totalHeight - getHeight() + mState.mCustomFooterHeight;
      if ((totalHeight - mState.mCustomHeaderHeight) < getHeight()
          || getOffsetY() >= refreshEnableOffsetY) {
        if (mFooterRefreshState == REFRESH_STATE_IDLE) {
          sendPullFooterEvent(EVENT_TYPE_FOOTER_RELEASED, new HippyMap());
          mFooterRefreshState = REFRESH_STATE_LOADING;
        }

        View footerView = getCustomFooterView();
        if (footerView instanceof HippyPullFooterView) {
          boolean stickEnabled = ((HippyPullFooterView) footerView).getStickEnabled();
          if (stickEnabled) {
            smoothScrollBy(0, refreshEnableOffsetY - mOffsetY, false, true);
            return true;
          }
        }
      }
    }

    return false;
  }

  @Override
  protected boolean shouldStopReleaseGlows(boolean canGoRefresh, boolean fromTouch) {
    if (mEnableRefresh) {
//      Scroller scroller = mViewFlinger.getScroller();
//      if (scroller.isFinished() && scroller.isFling() && getOffsetY() < 0) {
//        canGoRefresh = true;
//      }

      if (!canGoRefresh) {
        return false;
      }

      if (mLayout.canScrollHorizontally()) {
        return shouldStopReleaseGlowsForHorizontal(fromTouch);
      } else {
        return shouldStopReleaseGlowsForVertical(fromTouch);
      }
    }

    return false;
  }

  @Override
  protected void onScrollDragStarted() {
    if (mScrollBeginDragEventEnable) {
      getOnScrollDragStartedEvent().send(this, generateScrollEvent());
    }
  }

  @Override
  protected void onScrollDragEnded() {
    if (mScrollEndDragEventEnable) {
      getOnScrollDragEndedEvent().send(this, generateScrollEvent());
    }
  }

  @Override
  protected void onScrollFlingStarted() {
    if (mMomentumScrollBeginEventEnable) {
      getOnScrollFlingStartedEvent().send(this, generateScrollEvent());
    }
  }

  @Override
  protected void onScrollFlingEnded() {
    if (mMomentumScrollEndEventEnable) {
      getOnScrollFlingEndedEvent().send(this, generateScrollEvent());
    }
  }

  @Override
  protected void onLayout(boolean changed, int l, int t, int r, int b) {
    super.onLayout(changed, l, t, r, b);
    if (changed && mExposureEventEnable) {
      dispatchExposureEvent();
    }
  }

  @Override
  public void onScrolled(int x, int y) {
    super.onScrolled(x, y);
    sendOnScrollEvent();
    if (mExposureEventEnable) {
      dispatchExposureEvent();
    }
  }

  protected void sendExposureEvent(View view, String eventName, HippyMap props) {
    if (props.containsKey(eventName)) {
      new HippyViewEvent(eventName).send(view, null);
    }
  }

  private HippyMap getItemViewProps(int id) {
    if (mHippyContext == null) {
      return null;
    }
    RenderNode node = mHippyContext.getRenderManager().getRenderNode(id);
    if (node == null) {
      return null;
    }

    return node.getProps();
  }

  protected void checkExposureView(View view, int visibleStart, int visibleEnd, int parentStart,
      int parentEnd) {
    if (!(view instanceof HippyListItemView)) {
      return;
    }

    int myStart = (mLayout.canScrollHorizontally()) ? view.getLeft() : view.getTop();
    int myEnd = (mLayout.canScrollHorizontally()) ? view.getRight() : view.getBottom();
    myStart += parentStart;
    myEnd += parentStart;

    HippyListItemView itemView = (HippyListItemView) view;
    HippyMap props = getItemViewProps(itemView.getId());
    if (props == null) {
      return;
    }

    int currentExposureState = itemView.getExposureState();
    int viewSize = (mLayout.canScrollHorizontally()) ? view.getWidth() : view.getHeight();
    int correctingValueForDisappear = (int) Math.ceil(viewSize * 0.1f);

    if (myEnd <= (visibleStart + correctingValueForDisappear) || myStart >= (visibleEnd
        - correctingValueForDisappear)) {
      if (itemView.getExposureState() != HippyListItemView.EXPOSURE_STATE_DISAPPEAR) {
        if (itemView.getExposureState() == HippyListItemView.EXPOSURE_STATE_APPEAR) {
          sendExposureEvent(view, HippyListItemView.EXPOSURE_EVENT_WILL_DISAPPEAR, props);
        }
        sendExposureEvent(view, HippyListItemView.EXPOSURE_EVENT_DISAPPEAR, props);
        itemView.setExposureState(HippyListItemView.EXPOSURE_STATE_DISAPPEAR);
      }
    } else if ((myStart < visibleStart && myEnd > visibleStart) || (myStart < visibleEnd
        && myEnd > visibleEnd)) {
      if (currentExposureState == HippyListItemView.EXPOSURE_STATE_APPEAR) {
        sendExposureEvent(view, HippyListItemView.EXPOSURE_EVENT_WILL_DISAPPEAR, props);
        itemView.setExposureState(HippyListItemView.EXPOSURE_STATE_WILL_DISAPPEAR);
      } else if (currentExposureState == HippyListItemView.EXPOSURE_STATE_DISAPPEAR) {
        sendExposureEvent(view, HippyListItemView.EXPOSURE_EVENT_WILL_APPEAR, props);
        itemView.setExposureState(HippyListItemView.EXPOSURE_STATE_WILL_APPEAR);
      }
    } else if ((myStart >= visibleStart && myEnd <= visibleEnd) || (myStart <= visibleStart
        && myEnd > visibleEnd)) {
      if (itemView.getExposureState() != HippyListItemView.EXPOSURE_STATE_APPEAR) {
        if (itemView.getExposureState() == HippyListItemView.EXPOSURE_STATE_DISAPPEAR) {
          sendExposureEvent(view, HippyListItemView.EXPOSURE_EVENT_WILL_APPEAR, props);
        }
        sendExposureEvent(view, HippyListItemView.EXPOSURE_EVENT_APPEAR, props);
        itemView.setExposureState(HippyListItemView.EXPOSURE_STATE_APPEAR);
      }
    }
  }

  private void dispatchExposureEvent() {
    if (mLayout instanceof BaseLayoutManager) {
      BaseLayoutManager.OrientationHelper layoutHelper = ((BaseLayoutManager) mLayout).mOrientationHelper;
      int count = getChildCount();
      int fixOffset = (mLayout.canScrollHorizontally()) ? mState.mCustomHeaderWidth
          : mState.mCustomHeaderHeight;
      int start = layoutHelper.getStartAfterPadding() + fixOffset;
      int end = layoutHelper.getEndAfterPadding() - fixOffset;
      for (int i = 0; i < count; i++) {
        final View child = getChildAt(i);
        final int childStart = layoutHelper.getDecoratedStart(child);
        final int childEnd = layoutHelper.getDecoratedEnd(child);
        if (child instanceof RecyclerViewItem) {
          RecyclerViewItem itemView = (RecyclerViewItem) child;
          if (itemView.getChildCount() > 0) {
            checkExposureView(itemView.getChildAt(0), start, end, childStart, childEnd);
          }
        }
      }
    }
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    if (!mHasRemovePreDraw) {
      mViewTreeObserver = getViewTreeObserver();
      if (mPreDrawListener == null) {
        mPreDrawListener = new ViewTreeObserver.OnPreDrawListener() {
          @Override
          public boolean onPreDraw() {
            if (mAdapter.getItemCount() > 0 && HippyListView.this.getChildCount() > 0) {
              mViewTreeObserver.removeOnPreDrawListener(this);
              mHasRemovePreDraw = true;

              post(new Runnable() {
                @Override
                public void run() {
                  HippyListView.this.onInitialListReady();
                  getOnInitialListReadyEvent().send(HippyListView.this, null);
                }
              });

            }
            return true;
          }
        };
      }
      mViewTreeObserver.removeOnPreDrawListener(mPreDrawListener);
      mViewTreeObserver.addOnPreDrawListener(mPreDrawListener);

    }
  }

  @Override
  protected void onDetachedFromWindow() {
    if (mPreDrawListener != null && mViewTreeObserver != null) {
      mViewTreeObserver.removeOnPreDrawListener(mPreDrawListener);
    }
    super.onDetachedFromWindow();
  }

  public void scrollToIndex(int xIndex, int yIndex, boolean animated, int duration) {
    if (animated) {
      int scrollToYPos = getHeightBefore(yIndex) - getOffsetY();
      if (duration != 0) //如果用户设置了duration
      {
        if (scrollToYPos != 0) {
          if (!mState.didStructureChange()) {
            mViewFlinger.smoothScrollBy(0, scrollToYPos, duration, true);
          }
        }
      } else {
        smoothScrollBy(0, scrollToYPos);
      }
    } else {
      scrollToPosition(yIndex, 0);
      post(new Runnable() {
        @Override
        public void run() {
          dispatchLayout();
        }
      });
    }
  }

  public void scrollToContentOffset(double xOffset, double yOffset, boolean animated,
      int duration) {
    int scrollToYPos = (int)PixelUtil.dp2px(yOffset) - mOffsetY;
    int scrollToXPos = (int)PixelUtil.dp2px(xOffset) - mOffsetX;
    if (animated) {
      if (duration != 0){
        if ((scrollToYPos != 0 || scrollToXPos != 0) && !mState.didStructureChange()) {
          mViewFlinger.smoothScrollBy(scrollToXPos, scrollToYPos, duration, true);
        }
      } else {
        smoothScrollBy(scrollToXPos, scrollToYPos);
      }
    } else {
      scrollBy(scrollToXPos, scrollToYPos);
      post(new Runnable() {
        @Override
        public void run() {
          dispatchLayout();
        }
      });
    }
  }

  protected void sendOnScrollEvent() {
    if (mScrollEventEnable) {
      long currTime = System.currentTimeMillis();
      if (currTime - mLastScrollEventTimeStamp < mScrollEventThrottle) {
        return;
      }

      mLastScrollEventTimeStamp = currTime;
      getOnScrollEvent().send(this, generateScrollEvent());
    }
  }

  // start drag event
  protected OnScrollDragStartedEvent getOnScrollDragStartedEvent() {
    if (mOnScrollDragStartedEvent == null) {
      mOnScrollDragStartedEvent = new OnScrollDragStartedEvent(
          HippyScrollViewEventHelper.EVENT_TYPE_BEGIN_DRAG);
    }
    return mOnScrollDragStartedEvent;
  }

  protected static class OnScrollDragStartedEvent extends HippyViewEvent {

    public OnScrollDragStartedEvent(String eventName) {
      super(eventName);
    }
  }

  // end drag event
  protected OnScrollDragEndedEvent getOnScrollDragEndedEvent() {
    if (mOnScrollDragEndedEvent == null) {
      mOnScrollDragEndedEvent = new OnScrollDragEndedEvent(
          HippyScrollViewEventHelper.EVENT_TYPE_END_DRAG);
    }
    return mOnScrollDragEndedEvent;
  }

  protected static class OnScrollDragEndedEvent extends HippyViewEvent {

    public OnScrollDragEndedEvent(String eventName) {
      super(eventName);
    }
  }

  // start fling
  protected OnScrollFlingStartedEvent getOnScrollFlingStartedEvent() {
    if (mOnScrollFlingStartedEvent == null) {
      mOnScrollFlingStartedEvent = new OnScrollFlingStartedEvent(
          HippyScrollViewEventHelper.EVENT_TYPE_MOMENTUM_BEGIN);
    }
    return mOnScrollFlingStartedEvent;
  }

  protected static class OnScrollFlingStartedEvent extends HippyViewEvent {

    public OnScrollFlingStartedEvent(String eventName) {
      super(eventName);
    }
  }

  // end fling
  protected OnScrollFlingEndedEvent getOnScrollFlingEndedEvent() {
    if (mOnScrollFlingEndedEvent == null) {
      mOnScrollFlingEndedEvent = new OnScrollFlingEndedEvent(
          HippyScrollViewEventHelper.EVENT_TYPE_MOMENTUM_END);
    }
    return mOnScrollFlingEndedEvent;
  }

  protected static class OnScrollFlingEndedEvent extends HippyViewEvent {

    public OnScrollFlingEndedEvent(String eventName) {
      super(eventName);
    }
  }

  // scroll
  protected OnScrollEvent getOnScrollEvent() {
    if (mOnScrollEvent == null) {
      mOnScrollEvent = new OnScrollEvent(HippyScrollViewEventHelper.EVENT_TYPE_SCROLL);
    }
    return mOnScrollEvent;
  }

  protected static class OnScrollEvent extends HippyViewEvent {

    public OnScrollEvent(String eventName) {
      super(eventName);
    }
  }

  private OnInitialListReadyEvent getOnInitialListReadyEvent() {
    if (mOnInitialListReadyEvent == null) {
      mOnInitialListReadyEvent = new OnInitialListReadyEvent("initialListReady");
    }
    return mOnInitialListReadyEvent;
  }

  private static class OnInitialListReadyEvent extends HippyViewEvent {

    public OnInitialListReadyEvent(String eventName) {
      super(eventName);
    }
  }

  @SuppressWarnings("EmptyMethod")
  protected void onInitialListReady() {

  }

  protected static class PullElementEvent extends HippyViewEvent {

    public PullElementEvent(String eventName) {
      super(eventName);
    }
  }

  protected void sendPullHeaderEvent(String eventName, HippyMap param) {
    PullElementEvent event = new PullElementEvent(eventName);
    View headerView = getCustomHeaderView();
    if (headerView instanceof HippyPullHeaderView) {
      event.send(headerView, param);
    }
  }

  protected void sendPullFooterEvent(String eventName, HippyMap param) {
    PullElementEvent event = new PullElementEvent(eventName);
    View footerView = getCustomFooterView();
    if (footerView instanceof HippyPullFooterView) {
      event.send(footerView, param);
    }
  }
}
