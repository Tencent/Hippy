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
package com.tencent.mtt.tkd.views.list;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyInstanceContext;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.HippyTag;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.list.HippyListAdapter;
import com.tencent.mtt.hippy.views.list.HippyListView;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderView;
import com.tencent.mtt.hippy.views.scroll.HippyScrollViewEventHelper;
import com.tencent.mtt.supportui.views.recyclerview.BaseLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.LinearLayoutManager;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerView;
import com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem;

import android.content.Context;
import android.os.Handler;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;

public class TkdListView extends HippyListView implements RecyclerView.OnListScrollListener
{
  public static final String	EVENT_TYPE_DRAG_END		= "onDragEnd";
  public static final String	EVENT_TYPE_SCROLL_END		= "onScrollEnd";

  private int mPreloadDistance     = 0;
  protected int	mScrollMinOffset	 = 0;
  private boolean mIsLoading       = false;
  private Promise mPromise         = null;

	public TkdListView(Context context) {
		super(context);
		addOnListScrollListener(this);
	}

  public TkdListView(Context context, int orientation) {
    super(context, orientation);
    addOnListScrollListener(this);
  }

	protected HippyListAdapter createAdapter(RecyclerView hippyRecyclerView, HippyEngineContext hippyEngineContext)
	{
		return new TkdListViewAdapter(hippyRecyclerView, hippyEngineContext);
	}

  public void onStartDrag() {

  }

  public void onScroll(int dx, int dy) {

  }

  public void onScrollEnd() {
    new OnScrollEvent(EVENT_TYPE_SCROLL_END).send(this, null);
    if (mPromise != null) {
      HippyMap resultMap = new HippyMap();
      resultMap.pushString("msg", "on scroll end!");
      mPromise.resolve(resultMap);
      mPromise = null;
    }
  }

  public void onDragEnd() {
    new OnScrollEvent(EVENT_TYPE_DRAG_END).send(this, null);
  }

  public void onStartFling() {

  }

  private void sendExposureEvent(View view, String eventName) {
	  if (HippyTag.isContainTheSpecKey(view, eventName) ||
      ((view instanceof TkdListItemView) && (eventName.equals(TkdListItemView.EXPOSURE_EVENT_APPEAR) || eventName.equals(TkdListItemView.EXPOSURE_EVENT_DISAPPEAR)))) {
      new HippyViewEvent(eventName).send(view, null);
    }
  }

  private void checkExposureView(View view, int visibleStart, int visibleEnd,
                                 int parentStart, int parentEnd) {
	  if (view == null || view instanceof HippyPullHeaderView || view instanceof HippyPullFooterView) {
	    return;
    }

    int myStart = (mLayout.canScrollHorizontally()) ? view.getLeft() : view.getTop();
    int myEnd = (mLayout.canScrollHorizontally()) ? view.getRight() : view.getBottom();
    myStart += parentStart;
    myEnd += parentStart;

	  if(view instanceof ViewGroup) {
      ViewGroup parent = (ViewGroup)view;
      int count = parent.getChildCount();
      for (int i = 0; i < count; i++) {
        View child = parent.getChildAt(i);
        checkExposureView(child, visibleStart, visibleEnd, myStart, myEnd);
      }
    }

    int state = HippyTag.getExposureState(view);
	  if (state == -1) {
      state = HippyTag.TAG_EXPOSURE_STATE_DID_DISAPPEAR;
    }
    TkdListItemView cell = null;
    if (view instanceof TkdListItemView) {
      cell = (TkdListItemView)view;
    }

	  //相交
    if ((myStart < visibleStart && myEnd > visibleStart) || (myStart < visibleEnd && myEnd > visibleEnd)) {
      if (state == HippyTag.TAG_EXPOSURE_STATE_DID_APPEAR) {
        sendExposureEvent(view, HippyTag.TAG_PROPS_DID_DISAPPEAR);
        sendExposureEvent(view, HippyTag.TAG_PROPS_WILL_APPEAR);
        HippyTag.setExposureState(view, HippyTag.TAG_EXPOSURE_STATE_WILL_APPEAR);
      }
      else if (state == HippyTag.TAG_EXPOSURE_STATE_DID_DISAPPEAR)
      {
        sendExposureEvent(view, HippyTag.TAG_PROPS_WILL_APPEAR);
        HippyTag.setExposureState(view, HippyTag.TAG_EXPOSURE_STATE_WILL_APPEAR);
      }
      else if (cell != null)
      {
        if (cell.getExposureState() == TkdListItemView.EXPOSURE_STATE_DISAPPEAR) {
          sendExposureEvent(view, TkdListItemView.EXPOSURE_EVENT_APPEAR);
          cell.setExposureState(TkdListItemView.EXPOSURE_STATE_APPEAR);
        }
      }
    }
    else if (myEnd <= visibleStart || myStart >= (visibleEnd - 1))   //离开
    {
      if (state == HippyTag.TAG_EXPOSURE_STATE_WILL_APPEAR) {
        sendExposureEvent(view, HippyTag.TAG_PROPS_DID_APPEAR);
        sendExposureEvent(view, HippyTag.TAG_PROPS_DID_DISAPPEAR);
        HippyTag.setExposureState(view, HippyTag.TAG_EXPOSURE_STATE_DID_DISAPPEAR);
      }
      else if (state == HippyTag.TAG_EXPOSURE_STATE_DID_APPEAR)
      {
        sendExposureEvent(view, HippyTag.TAG_PROPS_DID_DISAPPEAR);
        HippyTag.setExposureState(view, HippyTag.TAG_EXPOSURE_STATE_DID_DISAPPEAR);
      }
      else if (cell != null)
      {
        if (cell.getExposureState() == TkdListItemView.EXPOSURE_STATE_APPEAR) {
          sendExposureEvent(view, TkdListItemView.EXPOSURE_EVENT_DISAPPEAR);
          cell.setExposureState(TkdListItemView.EXPOSURE_STATE_DISAPPEAR);
        }
      }
    }
    else if ((myStart >= visibleStart && myEnd <= visibleEnd) || (myStart <= visibleStart && myEnd > visibleEnd))
    {
      if (state == HippyTag.TAG_EXPOSURE_STATE_WILL_APPEAR) {
        sendExposureEvent(view, HippyTag.TAG_PROPS_DID_APPEAR);
        HippyTag.setExposureState(view, HippyTag.TAG_EXPOSURE_STATE_DID_APPEAR);
      }
      else if (state == HippyTag.TAG_EXPOSURE_STATE_DID_DISAPPEAR)
      {
        sendExposureEvent(view, HippyTag.TAG_PROPS_WILL_APPEAR);
        sendExposureEvent(view, HippyTag.TAG_PROPS_DID_APPEAR);
        HippyTag.setExposureState(view, HippyTag.TAG_EXPOSURE_STATE_DID_APPEAR);
      }
      else if (cell != null)
      {
        if (cell.getExposureState() == TkdListItemView.EXPOSURE_STATE_DISAPPEAR) {
          sendExposureEvent(view, TkdListItemView.EXPOSURE_EVENT_APPEAR);
          cell.setExposureState(TkdListItemView.EXPOSURE_STATE_APPEAR);
        }
      }
    }
  }

  private void dispatchExposureEvent() {
	  if (mLayout instanceof BaseLayoutManager) {
      BaseLayoutManager.OrientationHelper layoutHelper = ((BaseLayoutManager)mLayout).mOrientationHelper;
      int count = getChildCount();
      int fixOffset = (mLayout.canScrollHorizontally()) ? mState.mCustomHeaderWidth : mState.mCustomHeaderHeight;
      int start = layoutHelper.getStartAfterPadding() + fixOffset;
      int end = layoutHelper.getEndAfterPadding() - fixOffset;
      for (int i = 0; i < count; i++) {
        final View child = getChildAt(i);
        final int childStart = layoutHelper.getDecoratedStart(child);
        final int childEnd = layoutHelper.getDecoratedEnd(child);
        if (child instanceof RecyclerViewItem)
        {
          RecyclerViewItem itemView = (RecyclerViewItem)child;
          if (itemView.getChildCount() > 0) {
            checkExposureView(itemView.getChildAt(0), start, end, childStart, childEnd);
          }
        }
      }
    }
  }

  @Override
  protected void onLayout(boolean changed, int l, int t, int r, int b) {
	  super.onLayout(changed, l, t, r, b);
	  if (changed) {
      dispatchExposureEvent();
    }
  }

  @Override
  public void onScrolled(int x, int y)
  {
    super.onScrolled(x, y);
    mAdapter.notifyEndReached();
    dispatchExposureEvent();
  }

  public boolean shouldEmitEndReachedEvent() {
    if (mLayout.canScrollHorizontally()){
      int pdx = mState.mTotalHeight - mOffsetX - getWidth();
      if (pdx <= mPreloadDistance) {
        return true;
      }
    } else {
      int pdy = mState.mTotalHeight - mOffsetY - getHeight();
      if (pdy <= mPreloadDistance) {
        return true;
      }
    }

    return false;
  }

  public boolean isLoading() {
	  return mIsLoading;
  }

  public void setIsLoading(boolean isLoading) {
    mIsLoading = isLoading;
  }

  public void setScrollMinOffset(int scrollMinOffset)
  {
    scrollMinOffset = Math.max(200, scrollMinOffset);
    mScrollMinOffset = (int)PixelUtil.dp2px(scrollMinOffset);
  }

  protected void sendOnScrollEvent()
  {
    if (mScrollEventEnable)
    {
      long currTime = System.currentTimeMillis();

      if (mScrollMinOffset > 0) {
        if (mLayout.canScrollHorizontally()) {
          if (mLastOffsetX == Integer.MIN_VALUE) {
            mLastOffsetX = mState.mCustomHeaderWidth;
          }

          if (mOffsetX - mLastOffsetX >= mScrollMinOffset){
            mLastOffsetX = mOffsetX;
            getOnScrollEvent().send(this, generateScrollEvent());
          }
        } else {
          if (mLastOffsetY == Integer.MIN_VALUE) {
            mLastOffsetY = mState.mCustomHeaderHeight;
          }

          if (mOffsetY - mLastOffsetY >= mScrollMinOffset){
            mLastOffsetY = mOffsetY;
            getOnScrollEvent().send(this, generateScrollEvent());
          }
        }
      } else if ((mScrollMinOffset == 0) && (currTime - mLastScrollEventTimeStamp >= mScrollEventThrottle)) {
        mLastScrollEventTimeStamp = currTime;
        getOnScrollEvent().send(this, generateScrollEvent());
      }
    }
  }

  protected HippyMap generateScrollEvent()
  {
    HippyMap contentOffset = new HippyMap();
    HippyMap contentSize = new HippyMap();
    HippyMap frame = new HippyMap();
    if (mLayout.canScrollHorizontally()) {
      contentOffset.pushInt("x", (int)PixelUtil.px2dp(mOffsetX - mState.mCustomHeaderWidth));
      contentOffset.pushInt("y", (int)PixelUtil.px2dp(0));

      contentSize.pushInt("width", (int)PixelUtil.px2dp(mState.mTotalHeight));
      contentSize.pushInt("height", (int)PixelUtil.px2dp(getHeight()));

      frame.pushInt("x", (int)PixelUtil.px2dp(getX()));
      frame.pushInt("y", (int)PixelUtil.px2dp(getY()));
      frame.pushInt("width", (int)PixelUtil.px2dp(getWidth()));
      frame.pushInt("height", (int)PixelUtil.px2dp(getHeight()));
    } else {
      contentOffset.pushInt("x", (int)PixelUtil.px2dp(0));
      contentOffset.pushInt("y", (int)PixelUtil.px2dp(mOffsetY - mState.mCustomHeaderHeight));

      contentSize.pushInt("width", (int)PixelUtil.px2dp(getWidth()));
      contentSize.pushInt("height", (int)PixelUtil.px2dp(mState.mTotalHeight));

      frame.pushInt("x", (int)PixelUtil.px2dp(getX()));
      frame.pushInt("y", (int)PixelUtil.px2dp(getY()));
      frame.pushInt("width", (int)PixelUtil.px2dp(getWidth()));
      frame.pushInt("height", (int)PixelUtil.px2dp(getHeight()));
    }

    HippyMap event = new HippyMap();
    event.pushMap("contentOffset", contentOffset);
    event.pushMap("contentSize", contentSize);
    event.pushMap("frame", frame);

    return event;
  }

  public void scrollWithDistance(int distance, int duration, final Promise promise)
  {
    if (!mState.didStructureChange()) {
      if (mLayout.canScrollHorizontally()) {
        mViewFlinger.smoothScrollBy(distance, 0, duration,true);
      } else {
        mViewFlinger.smoothScrollBy(0, distance, duration,true);
      }

      mPromise = promise;
    }
  }

  public void setPreloadDistance(int preloadDistance)
  {
    preloadDistance = Math.max(0, preloadDistance);
    mPreloadDistance = (int)PixelUtil.dp2px(preloadDistance);
  }
}
