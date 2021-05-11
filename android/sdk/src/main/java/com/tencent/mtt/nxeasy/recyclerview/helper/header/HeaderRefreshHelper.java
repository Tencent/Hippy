/* Tencent is pleased to support the open source community by making easy-recyclerview-helper available.
 * Copyright (C) 2020 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.mtt.nxeasy.recyclerview.helper.header;

import android.animation.Animator;
import android.animation.ValueAnimator;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;
import android.view.ViewConfiguration;
import android.view.ViewGroup.LayoutParams;
import com.tencent.mtt.nxeasy.recyclerview.helper.AnimatorListenerBase;

public class HeaderRefreshHelper implements OnTouchListener {

    public static final int DURATION = 200;
    protected View headerView;
    protected IHeaderRefreshView headerRefreshView;
    protected float lastRawY = -1;
    protected float downRawY = -1;
    protected boolean enable = true;
    /// header 被下拉过程中显示出来
    private boolean isHeaderDragShowing;
    private int refreshStatus = -1;
    private IHeaderRefreshListener headerRefreshListener;
    private ValueAnimator animator;
    private ILayoutRequester layoutRequester;
    private IHeaderStatusListener headerStatusListener;

    public void setEnable(boolean enable) {
        this.enable = enable;
    }

    public void setHeaderRefreshListener(IHeaderRefreshListener headerRefreshListener) {
        this.headerRefreshListener = headerRefreshListener;
    }

    public void setHeaderStatusListener(IHeaderStatusListener headerStatusListener) {
        this.headerStatusListener = headerStatusListener;
    }

    public void setLayoutRequester(ILayoutRequester layoutRequester) {
        this.layoutRequester = layoutRequester;
    }

    public void setHeaderRefreshView(IHeaderRefreshView headerLoadingView) {
        this.headerRefreshView = headerLoadingView;
        headerView = this.headerRefreshView.getView();
        setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_FOLDED);
    }

    public void onRefreshDone() {
        if (refreshStatus == IHeaderRefreshView.HEADER_STATUS_REFRESHING) {
            setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_TO_FOLD);
            smoothScrollTo(getVisibleHeight(), 0);
        }
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        if (!enable) {
            return false;
        }
        if (lastRawY == -1) {
            lastRawY = event.getRawY();
        }
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                lastRawY = event.getRawY();
                downRawY = event.getRawY();
                break;
            case MotionEvent.ACTION_MOVE:
                //下拉的时候除以2，放慢拉动的速度，调节拉动的手感
                int deltaY = (int) (event.getRawY() - lastRawY) / 2;
                lastRawY = event.getRawY();
                if (isStartMove(event) && canHandleTouchEvent()) {
                    endAnimation();
                    setVisibleHeight(deltaY + getVisibleHeight());
                    isHeaderDragShowing = isHeaderDragShowing || getVisibleHeight() > 0;
                    if (isHeaderDragShowing) {
                        onMove();
                    }
                }
                break;
            default:
                isHeaderDragShowing = false;
                lastRawY = -1;
                downRawY = -1;
                if (canHandleTouchEvent()) {
                    onRelease();
                }
                break;
        }
        return isHeaderDragShowing && getVisibleHeight() > 0;
    }

    private boolean isStartMove(MotionEvent event) {
        return Math.abs(event.getRawY() - downRawY - getTouchSlop()) > 0;
    }

    private int getTouchSlop() {
        final ViewConfiguration vc = ViewConfiguration.get(headerView.getContext());
        return vc.getScaledTouchSlop();
    }

    /**
     * 松口手后，需要回弹，可能进行两个状态的流转
     */
    private void onRelease() {
        if (refreshStatus == IHeaderRefreshView.HEADER_STATUS_DRAGGING) {
            if (isViewExposure(headerView)) {
                setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_DRAG_TO_REFRESH);
            } else {
                setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_TO_FOLD);
            }
        }
        if (isViewExposure(headerView)) {
            smoothScrollTo(getVisibleHeight(), headerRefreshView.getContentHeight());
        } else {
            smoothScrollTo(getVisibleHeight(), 0);
        }
    }

    private void setRefreshStatus(int newStatus) {
        if (headerStatusListener != null) {
            headerStatusListener.onHeaderStatusChanged(refreshStatus, newStatus);
        }
        this.refreshStatus = newStatus;
    }

    private void onMove() {
        setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_DRAGGING);
        headerRefreshView.onStartDrag();
    }

    /**
     * 下拉之后，当正在刷新的时候，将位置从下拉到的位置恢复规定的位置的动画
     *
     * @param destHeight 规定的高度
     */
    private void smoothScrollTo(int fromHeight, int destHeight) {
        endAnimation();
        animator = ValueAnimator.ofInt(fromHeight, destHeight);
        animator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
                setVisibleHeight((int) animation.getAnimatedValue());
            }
        });
        animator.addListener(new AnimatorListenerBase() {
            @Override
            public void onAnimationEnd(Animator animation) {
                if (isGoingToRefresh()) {
                    gotoRefresh();
                }
                if (refreshStatus == IHeaderRefreshView.HEADER_STATUS_TO_FOLD) {
                    setFolded();
                }
            }
        });
        animator.setDuration(DURATION).start();
    }

    void gotoRefresh() {
        headerRefreshListener.onHeaderRefreshing(refreshStatus);
        setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_REFRESHING);
        headerRefreshView.onRefreshing();
    }

    private void setFolded() {
        setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_FOLDED);
        headerRefreshView.onFolded();
    }


    /**
     * 返回当前的可视高度
     */
    public int getVisibleHeight() {
        if (!enable) {
            return 0;
        }
        LayoutParams layoutParams = headerView.getLayoutParams();
        if (layoutParams == null) {
            return 0;
        }
        return layoutParams.height;
    }

    private void setVisibleHeight(int height) {
        LayoutParams layoutParams = headerView.getLayoutParams();
        layoutParams.height = Math.max(height, 0);
        headerView.setLayoutParams(layoutParams);
        if (layoutRequester != null) {
            layoutRequester.requestLayout();
        }
        headerRefreshView.onHeaderHeightChanged(Math.max(getVisibleHeight(), 0));
    }

    private boolean canHandleTouchEvent() {
        return headerView.isShown();
    }

    /**
     * 判断View是否已经完全显示出来
     */
    private boolean isViewExposure(View view) {
        return view.getHeight() >= headerRefreshView.getContentHeight();
    }

    /**
     * 触发刷新
     */
    public void triggerRefresh() {
        if (refreshStatus == IHeaderRefreshView.HEADER_STATUS_FOLDED) {
            setRefreshStatus(IHeaderRefreshView.HEADER_STATUS_CLICK_TO_REFRESH);
            smoothScrollTo(0, headerRefreshView.getContentHeight());
        }
    }

    public void triggerRefresh(boolean hasAnimation) {
        if (hasAnimation) {
            triggerRefresh();
        } else {
            setVisibleHeight(headerRefreshView.getContentHeight());
            gotoRefresh();
        }
    }

    /**
     * 是否处于手动的拖动过程中
     *
     * @return
     */
    public boolean isDragging() {
        return refreshStatus == IHeaderRefreshView.HEADER_STATUS_DRAGGING;
    }

    public boolean isGoingToRefresh() {
        return refreshStatus == IHeaderRefreshView.HEADER_STATUS_DRAG_TO_REFRESH ||
                refreshStatus == IHeaderRefreshView.HEADER_STATUS_CLICK_TO_REFRESH;
    }

    /**
     * 改变header的高度
     *
     * @param dy dy>0 header的高度变小，反之变大
     */
    public void rollBackHeaderHeight(int dy) {
        setVisibleHeight(getVisibleHeight() - dy);
    }

    /**
     * 收起header，将状态置为folded状态
     */
    public void reset() {
        endAnimation();
        setVisibleHeight(0);
        setFolded();
    }

    private void endAnimation() {
        if (animator != null) {
            animator.removeAllListeners();
            animator.removeAllUpdateListeners();
            animator.end();
            animator = null;
        }
    }
}
