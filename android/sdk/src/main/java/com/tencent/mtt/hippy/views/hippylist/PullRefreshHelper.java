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

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;

import android.animation.Animator;
import android.animation.ValueAnimator;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnTouchListener;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.RecyclerView.LayoutManager;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.AnimatorListenerBase;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderView;

public abstract class PullRefreshHelper {

    public enum PullRefreshStatus {
        PULL_STATUS_FOLDED,
        PULL_STATUS_DRAGGING,
        PULL_STATUS_REFRESHING
    }

    public static final int DURATION = 200;
    public static final float PULL_RATIO = 2.4f;
    protected float mLastPosition = -1;
    protected float mStartPosition = -1;
    protected final HippyRecyclerView mRecyclerView;
    protected final LinearLayout mContainer;
    protected final RenderNode mRenderNode;
    @Nullable
    protected View mItemView;
    @Nullable
    protected ValueAnimator mAnimator;
    protected PullRefreshStatus mRefreshStatus = PullRefreshStatus.PULL_STATUS_FOLDED;

    PullRefreshHelper(@NonNull HippyRecyclerView recyclerView, @NonNull RenderNode footerNode) {
        mRecyclerView = recyclerView;
        mRenderNode = footerNode;
        mContainer = new LinearLayout(recyclerView.getContext());
    }

    protected abstract void handleTouchMoveEvent(MotionEvent event);

    protected abstract void sendReleasedEvent();

    protected abstract void sendPullingEvent(int offset);

    public void onDestroy() {
        mItemView = null;
        mContainer.removeAllViews();
        endAnimation();
    }

    public void onRefreshCompleted() {
        if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_REFRESHING) {
            mRefreshStatus = PullRefreshStatus.PULL_STATUS_FOLDED;
            setVisibleSize(0);
        }
    }

    public void enableRefresh() {
        switch (mRefreshStatus) {
            case PULL_STATUS_FOLDED:
                int nodeSize = isVertical() ? mRenderNode.getHeight() : mRenderNode.getWidth();
                setVisibleSize(nodeSize);
                mRefreshStatus = PullRefreshStatus.PULL_STATUS_REFRESHING;
                break;
            case PULL_STATUS_DRAGGING:
                mRefreshStatus = PullRefreshStatus.PULL_STATUS_REFRESHING;
                break;
            case PULL_STATUS_REFRESHING:
            default:
                break;
        }
    }

    public View getView() {
        return mContainer;
    }

    public void onTouch(View v, MotionEvent event) {
        if (mLastPosition == -1) {
            mLastPosition = isVertical() ? event.getRawY() : event.getRawX();
            mStartPosition = mLastPosition;
        }
        switch (event.getAction()) {
            case MotionEvent.ACTION_DOWN:
                mLastPosition = isVertical() ? event.getRawY() : event.getRawX();
                mStartPosition = mLastPosition;
                break;
            case MotionEvent.ACTION_MOVE:
                handleTouchMoveEvent(event);
                break;
            default:
                mLastPosition = -1;
                mStartPosition = -1;
                int nodeSize = isVertical() ? mRenderNode.getHeight() : mRenderNode.getWidth();
                if (getVisibleSize() >= nodeSize) {
                    if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_DRAGGING) {
                        mRefreshStatus = PullRefreshStatus.PULL_STATUS_REFRESHING;
                        sendReleasedEvent();
                    }
                    smoothScrollTo(getVisibleSize(), nodeSize, DURATION);
                } else if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_DRAGGING) {
                    mRefreshStatus = PullRefreshStatus.PULL_STATUS_FOLDED;
                    if (getVisibleSize() > 0) {
                        smoothScrollTo(getVisibleSize(), 0, DURATION);
                    }
                }
                break;
        }
    }

    protected void endAnimation() {
        if (mAnimator != null) {
            mAnimator.removeAllListeners();
            mAnimator.removeAllUpdateListeners();
            mAnimator.end();
            mAnimator = null;
        }
    }

    public void setItemView(View itemView) {
        mItemView = itemView;
        mContainer.removeAllViews();
        LayoutParams lpChild = new LayoutParams(mRenderNode.getWidth(), mRenderNode.getHeight());
        if (itemView instanceof HippyPullHeaderView) {
            lpChild.gravity = Gravity.BOTTOM;
        } else if (itemView instanceof HippyPullFooterView) {
            lpChild.gravity = Gravity.TOP;
        }
        mContainer.addView(itemView, lpChild);
        int width = isVertical() ? MATCH_PARENT : 0;
        int height = isVertical() ? 0 : MATCH_PARENT;
        ViewGroup.LayoutParams lpContainer = new ViewGroup.LayoutParams(width, height);
        mContainer.setLayoutParams(lpContainer);
    }

    public int getVisibleHeight() {
        ViewGroup.LayoutParams layoutParams = mContainer.getLayoutParams();
        if (layoutParams == null) {
            return 0;
        }
        return layoutParams.height;
    }

    public int getVisibleWidth() {
        ViewGroup.LayoutParams layoutParams = mContainer.getLayoutParams();
        if (layoutParams == null) {
            return 0;
        }
        return layoutParams.width;
    }

    public int getVisibleSize() {
        ViewGroup.LayoutParams layoutParams = mContainer.getLayoutParams();
        if (layoutParams == null) {
            return 0;
        }
        return isVertical() ? layoutParams.height : layoutParams.width;
    }

    protected void setVisibleSize(int size) {
        ViewGroup.LayoutParams layoutParams = mContainer.getLayoutParams();
        if (isVertical()) {
            layoutParams.height = Math.max(size, 0);
        } else {
            layoutParams.width = Math.max(size, 0);
        }
        mContainer.setLayoutParams(layoutParams);
        mRecyclerView.dispatchLayout();
    }

    protected void smoothScrollTo(int fromValue, int toValue, int duration) {
        endAnimation();
        mAnimator = ValueAnimator.ofInt(fromValue, toValue);
        mAnimator.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public void onAnimationUpdate(ValueAnimator animation) {
                setVisibleSize((int) animation.getAnimatedValue());
            }
        });
        mAnimator.addListener(new AnimatorListenerBase() {
            @Override
            public void onAnimationEnd(Animator animation) {

            }
        });
        mAnimator.setDuration(duration).start();
    }

    protected boolean isVertical() {
        int orientation = RecyclerView.VERTICAL;
        LayoutManager layoutManager = mRecyclerView.getLayoutManager();
        if (layoutManager instanceof LinearLayoutManager) {
            orientation = ((LinearLayoutManager) layoutManager).getOrientation();
        }
        return orientation == RecyclerView.VERTICAL;
    }

    protected int getTouchSlop() {
        final ViewConfiguration vc = ViewConfiguration.get(mRecyclerView.getContext());
        return vc.getScaledTouchSlop();
    }
}
