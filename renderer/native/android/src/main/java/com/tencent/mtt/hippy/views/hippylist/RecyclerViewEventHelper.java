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

package com.tencent.mtt.hippy.views.hippylist;

import static androidx.recyclerview.widget.RecyclerView.SCROLL_STATE_DRAGGING;
import static androidx.recyclerview.widget.RecyclerView.SCROLL_STATE_IDLE;
import static androidx.recyclerview.widget.RecyclerView.SCROLL_STATE_SETTLING;

import android.graphics.Rect;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.HippyOverPullHelper;
import androidx.recyclerview.widget.HippyOverPullListener;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.RecyclerView.OnScrollListener;

import android.os.SystemClock;
import android.view.View;
import android.view.View.OnAttachStateChangeListener;
import android.view.View.OnLayoutChangeListener;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.view.ViewTreeObserver.OnPreDrawListener;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.list.HippyListItemView;
import com.tencent.renderer.utils.EventUtils;

/**
 * Created  on 2020/12/24. Description
 * 各种事件的通知，通知前端view的曝光事件，用于前端的统计上报
 */
public class RecyclerViewEventHelper extends OnScrollListener implements OnLayoutChangeListener,
        OnAttachStateChangeListener, HippyOverPullListener {

    protected final HippyRecyclerView hippyRecyclerView;
    private boolean scrollBeginDragEventEnable;
    private boolean scrollEndDragEventEnable;
    private HippyViewEvent onScrollDragEndedEvent;
    private boolean momentumScrollBeginEventEnable;
    private boolean momentumScrollEndEventEnable;
    private HippyViewEvent onScrollFlingStartedEvent;
    private HippyViewEvent onScrollFlingEndedEvent;
    private int currentState;
    protected boolean onScrollEventEnable = true;
    private HippyViewEvent onScrollEvent;
    private long lastScrollEventTimeStamp;
    private int scrollEventThrottle;
    private boolean mHasUnsentScrollEvent;
    private boolean exposureEventEnable;
    private HippyViewEvent onScrollDragStartedEvent;

    //initialListReady event
    private boolean isInitialListReadyNotified = false;
    private ViewTreeObserver viewTreeObserver;
    private OnPreDrawListener preDrawListener;
    private boolean isLastTimeReachEnd;
    private int preloadItemNumber;

    public RecyclerViewEventHelper(HippyRecyclerView recyclerView) {
        this.hippyRecyclerView = recyclerView;
        hippyRecyclerView.addOnScrollListener(this);
        hippyRecyclerView.addOnAttachStateChangeListener(this);
        hippyRecyclerView.addOnLayoutChangeListener(this);
        hippyRecyclerView.setOverPullListener(this);
        preDrawListener = new ViewTreeObserver.OnPreDrawListener() {
            @Override
            public boolean onPreDraw() {
                notifyInitialListReady();
                return true;
            }
        };
    }

    protected void notifyInitialListReady() {
        if (canNotifyInit()) {
            isInitialListReadyNotified = true;
            viewTreeObserver.removeOnPreDrawListener(preDrawListener);
            hippyRecyclerView.post(new Runnable() {
                @Override
                public void run() {
                    EventUtils.sendComponentEvent(getParentView(), EventUtils.EVENT_RECYCLER_LIST_READY, null);
                }
            });
        }
    }

    protected View getParentView() {
        return (View) hippyRecyclerView.getParent();
    }

    /**
     * 是否满足initialListReady的通知条件，需要有真实view上屏才进行通知
     */
    private boolean canNotifyInit() {
        return !isInitialListReadyNotified && hippyRecyclerView.getAdapter().getItemCount() > 0
                && hippyRecyclerView.getChildCount() > 0
                && viewTreeObserver.isAlive();
    }

    public void setScrollBeginDragEventEnable(boolean enable) {
        scrollBeginDragEventEnable = enable;
    }

    public void setScrollEndDragEventEnable(boolean enable) {
        scrollEndDragEventEnable = enable;
    }

    public void setMomentumScrollBeginEventEnable(boolean enable) {
        momentumScrollBeginEventEnable = enable;
    }

    public void setMomentumScrollEndEventEnable(boolean enable) {
        momentumScrollEndEventEnable = enable;
    }

    public void setOnScrollEventEnable(boolean enable) {
        onScrollEventEnable = enable;
    }

    @Override
    public void onLayoutChange(View v, int left, int top, int right, int bottom, int oldLeft, int oldTop, int oldRight,
            int oldBottom) {
        checkSendExposureEvent();
    }

    protected HippyViewEvent getOnScrollDragStartedEvent() {
        if (onScrollDragStartedEvent == null) {
            onScrollDragStartedEvent = new HippyViewEvent(EventUtils.EVENT_SCROLLER_BEGIN_DRAG);
        }
        return onScrollDragStartedEvent;
    }

    // scroll
    protected HippyViewEvent getOnScrollEvent() {
        if (onScrollEvent == null) {
            onScrollEvent = new HippyViewEvent(EventUtils.EVENT_SCROLLER_ON_SCROLL);
        }
        return onScrollEvent;
    }

    // start fling
    protected HippyViewEvent getOnScrollFlingStartedEvent() {
        if (onScrollFlingStartedEvent == null) {
            onScrollFlingStartedEvent = new HippyViewEvent(EventUtils.EVENT_SCROLLER_MOMENTUM_BEGIN);
        }
        return onScrollFlingStartedEvent;
    }

    // end drag event
    protected HippyViewEvent getOnScrollDragEndedEvent() {
        if (onScrollDragEndedEvent == null) {
            onScrollDragEndedEvent = new HippyViewEvent(EventUtils.EVENT_SCROLLER_END_DRAG);
        }
        return onScrollDragEndedEvent;
    }

    @Override
    public void onScrollStateChanged(RecyclerView recyclerView, int newState) {
        int oldState = currentState;
        currentState = newState;
        if (mHasUnsentScrollEvent) {
            sendOnScrollEvent();
        }
        sendDragEvent(newState);
        sendDragEndEvent(oldState, currentState);
        sendFlingEvent(newState);
        sendFlingEndEvent(oldState, currentState);
    }

    @Override
    public void onScrolled(@NonNull final RecyclerView recyclerView, int dx, int dy) {
        if (scrollHappened(dx, dy)) {
            checkSendOnScrollEvent();
        }
        checkSendExposureEvent();
        if (scrollHappened(dx, dy)) {
            checkSendReachEndEvent();
        }
    }

    protected boolean scrollHappened(int dx, int dy) {
        return dx != 0 || dy != 0;
    }

    /**
     * 检查是否已经触底，发生onEndReached事件给前端
     * 如果上次是没有到底，这次滑动底了，需要发事件通知，如果上一次已经是到底了，这次到底不会发事件
     */
    private void checkSendReachEndEvent() {
        boolean isThisTimeReachEnd;
        if (HippyListUtils.isHorizontalLayout(hippyRecyclerView)) {
            isThisTimeReachEnd = isHorizontalReachEnd();
        } else {
            isThisTimeReachEnd = isVerticalReachEnd();
        }
        if (!isLastTimeReachEnd && isThisTimeReachEnd) {
            sendOnReachedEvent();
        }
        isLastTimeReachEnd = isThisTimeReachEnd;
    }

    /**
     * 竖向滑动，内容已经到达最下边
     */
    private boolean isVerticalReachEnd() {
        RecyclerView.LayoutManager manager;
        if (preloadItemNumber > 0 && (manager = hippyRecyclerView.getLayoutManager()) instanceof LinearLayoutManager) {
            return ((LinearLayoutManager) manager).findLastVisibleItemPosition()
                    >= manager.getItemCount() - preloadItemNumber;
        }
        return !hippyRecyclerView.canScrollVertically(1);
    }

    /**
     * 水平滑动，内容已经到达最右边
     */
    private boolean isHorizontalReachEnd() {
        RecyclerView.LayoutManager manager;
        if (preloadItemNumber > 0 && (manager = hippyRecyclerView.getLayoutManager()) instanceof LinearLayoutManager) {
            return ((LinearLayoutManager) manager).findLastVisibleItemPosition()
                    >= manager.getItemCount() - preloadItemNumber;
        }
        return !hippyRecyclerView.canScrollHorizontally(1);
    }

    protected void sendOnReachedEvent() {
        EventUtils.sendComponentEvent(getParentView(), EventUtils.EVENT_RECYCLER_END_REACHED, null);
        EventUtils.sendComponentEvent(getParentView(), EventUtils.EVENT_RECYCLER_LOAD_MORE, null);
    }

    protected void checkSendOnScrollEvent() {
        if (onScrollEventEnable) {
            long currTime = SystemClock.elapsedRealtime();
            if (currTime - lastScrollEventTimeStamp >= scrollEventThrottle) {
                lastScrollEventTimeStamp = currTime;
                sendOnScrollEvent();
            } else {
                mHasUnsentScrollEvent = true;
            }
        }
    }

    public void sendOnScrollEvent() {
        mHasUnsentScrollEvent = false;
        getOnScrollEvent().send(getParentView(), generateScrollEvent());
    }

    private void observePreDraw() {
        if (!isInitialListReadyNotified) {
            if (viewTreeObserver == null) {
                viewTreeObserver = hippyRecyclerView.getViewTreeObserver();
            }
            viewTreeObserver.addOnPreDrawListener(preDrawListener);
        }
    }

    protected void sendFlingEvent(int newState) {
        if (momentumScrollBeginEventEnable && newState == SCROLL_STATE_SETTLING) {
            getOnScrollFlingStartedEvent().send(getParentView(), generateScrollEvent());
        }
    }

    protected void sendDragEndEvent(int oldState, int newState) {
        if (scrollEndDragEventEnable && isReleaseDrag(oldState, newState) && !hippyRecyclerView.isOverPulling()) {
            getOnScrollDragEndedEvent().send(getParentView(), generateScrollEvent());
        }
    }

    private boolean isReleaseDrag(int oldState, int newState) {
        return (oldState == SCROLL_STATE_DRAGGING &&
                (newState == SCROLL_STATE_IDLE || newState == SCROLL_STATE_SETTLING));
    }

    protected void sendFlingEndEvent(int oldState, int newState) {
        if (momentumScrollEndEventEnable && oldState == SCROLL_STATE_SETTLING && newState != SCROLL_STATE_SETTLING) {
            getOnScrollFlingEndedEvent().send(getParentView(), generateScrollEvent());
        }
    }

    protected void sendDragEvent(int newState) {
        if (scrollBeginDragEventEnable && newState == RecyclerView.SCROLL_STATE_DRAGGING) {
            getOnScrollDragStartedEvent().send(getParentView(), generateScrollEvent());
        }
    }

    // end fling
    protected HippyViewEvent getOnScrollFlingEndedEvent() {
        if (onScrollFlingEndedEvent == null) {
            onScrollFlingEndedEvent = new HippyViewEvent(EventUtils.EVENT_SCROLLER_MOMENTUM_END);
        }
        return onScrollFlingEndedEvent;
    }

    public void setScrollEventThrottle(int scrollEventThrottle) {
        this.scrollEventThrottle = scrollEventThrottle;
    }

    public final HippyMap generateScrollEvent() {
        HippyMap contentOffset = new HippyMap();
        contentOffset.pushDouble("x", PixelUtil.px2dp(hippyRecyclerView.getContentOffsetX()));
        contentOffset.pushDouble("y", PixelUtil.px2dp(hippyRecyclerView.getContentOffsetY()));
        HippyMap event = new HippyMap();
        event.pushMap("contentOffset", contentOffset);
        return event;
    }

    public void setExposureEventEnable(boolean enable) {
        exposureEventEnable = enable;
    }

    /**
     * 可视面积小于10%，任务view当前已经不在可视区域
     */
    private boolean isViewVisible(View view) {
        if (view == null) {
            return false;
        }
        Rect rect = new Rect();
        boolean visibility = view.getGlobalVisibleRect(rect);
        if (!visibility) {
            return false;
        } else {
            float visibleArea = rect.height() * rect.width(); //可见区域的面积
            float viewArea = view.getMeasuredWidth() * view.getMeasuredHeight();//当前view的总面积
            return visibleArea > viewArea * 0.1f;
        }
    }

    protected void checkExposureView(View view) {
        if (view instanceof HippyListItemView) {
            HippyListItemView itemView = (HippyListItemView) view;
            if (isViewVisible(view)) {
                if (itemView.getExposureState() != HippyListItemView.EXPOSURE_STATE_APPEAR) {
                    sendExposureEvent(view, EventUtils.EVENT_LIST_ITEM_APPEAR);
                    itemView.setExposureState(HippyListItemView.EXPOSURE_STATE_APPEAR);
                }
            } else {
                if (itemView.getExposureState() != HippyListItemView.EXPOSURE_STATE_DISAPPEAR) {
                    sendExposureEvent(view, EventUtils.EVENT_LIST_ITEM_DISAPPEAR);
                    itemView.setExposureState(HippyListItemView.EXPOSURE_STATE_DISAPPEAR);
                }
            }
        }
    }

    protected void sendExposureEvent(View view, String eventName) {
        if (eventName.equals(EventUtils.EVENT_LIST_ITEM_APPEAR) || eventName
                .equals(EventUtils.EVENT_LIST_ITEM_DISAPPEAR)) {
            new HippyViewEvent(eventName).send(view, null);
        }
    }

    protected void checkSendExposureEvent() {
        if (!exposureEventEnable) {
            return;
        }
        int childCount = hippyRecyclerView.getChildCount();
        for (int i = 0; i < childCount; i++) {
            checkExposureView(findHippyListItemView((ViewGroup) hippyRecyclerView.getChildAt(i)));
        }
    }

    /**
     * 由于挂载到RecyclerView到子View可能不是HippyListItemView，比如对于stickyItem，我们会包一层
     * ViewGroup，所以这里拿HippyListItemView，需要做两层的判断
     */
    private View findHippyListItemView(ViewGroup viewGroup) {
        if (viewGroup instanceof HippyListItemView) {
            return viewGroup;
        }
        if (viewGroup.getChildCount() > 0) {
            View child = viewGroup.getChildAt(0);
            if (child instanceof HippyListItemView) {
                return child;
            }
        }
        return null;
    }

    @Override
    public void onViewAttachedToWindow(View v) {
        observePreDraw();
    }

    @Override
    public void onViewDetachedFromWindow(View v) {
        if (!isInitialListReadyNotified && viewTreeObserver != null) {
            viewTreeObserver.removeOnPreDrawListener(preDrawListener);
        }
    }

    @Override
    public void onOverPullStateChanged(int oldState, int newState, int offset) {
        LogUtils.d("QBRecyclerViewEventHelper", "oldState:" + oldState + ",newState:" + newState);
        if (oldState == HippyOverPullHelper.OVER_PULL_NONE && (isOverPulling(newState)
            || newState == HippyOverPullHelper.OVER_PULL_NORMAL) && scrollBeginDragEventEnable) {
            getOnScrollDragStartedEvent().send(getParentView(), generateScrollEvent());
        }
        if (isOverPulling(oldState) && isOverPulling(newState) && onScrollEventEnable) {
            sendOnScrollEvent();
        }
        if (newState == HippyOverPullHelper.OVER_PULL_SETTLING &&
            oldState != HippyOverPullHelper.OVER_PULL_SETTLING && scrollEndDragEventEnable) {
            getOnScrollDragEndedEvent().send(getParentView(), generateScrollEvent());
        }
    }

    private boolean isOverPulling(int newState) {
        return newState == HippyOverPullHelper.OVER_PULL_DOWN_ING || newState == HippyOverPullHelper.OVER_PULL_UP_ING;
    }

    /**
     * @param preloadItemNumber 提前多少条Item，通知前端加载下一页数据
     */
    public void setPreloadItemNumber(int preloadItemNumber) {
        this.preloadItemNumber = preloadItemNumber;
        checkSendReachEndEvent();
    }
}
