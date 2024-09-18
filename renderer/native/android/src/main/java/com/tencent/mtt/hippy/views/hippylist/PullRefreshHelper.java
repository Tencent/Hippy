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
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.recyclerview.widget.RecyclerView.LayoutManager;
import androidx.recyclerview.widget.StaggeredGridLayoutManager;

import com.tencent.mtt.hippy.views.waterfall.HippyWaterfallView;
import com.tencent.renderer.node.PullHeaderRenderNode;
import com.tencent.renderer.node.RenderNode;
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
    protected final HippyRecyclerView mRecyclerView;
    protected final PullRefreshContainer mContainer;
    protected final RenderNode mRenderNode;
    @Nullable
    protected View mItemView;
    @Nullable
    protected ValueAnimator mAnimator;
    protected PullRefreshStatus mRefreshStatus = PullRefreshStatus.PULL_STATUS_FOLDED;

    PullRefreshHelper(@NonNull HippyRecyclerView recyclerView, @NonNull RenderNode node) {
        mRecyclerView = recyclerView;
        mRenderNode = node;
        mContainer = new PullRefreshContainer(recyclerView.getContext(), node instanceof PullHeaderRenderNode);
        mContainer.setId(node.getId());
    }

    protected abstract int handleDrag(int distance);

    protected void endDrag() {
        if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_FOLDED) {
            return;
        }
        int nodeSize = getNodeSize();
        int visibleSize = getVisibleSize();
        if (visibleSize >= nodeSize) { // fully showing
            if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_DRAGGING) {
                mRefreshStatus = PullRefreshStatus.PULL_STATUS_REFRESHING;
                sendReleasedEvent();
            }
            smoothResizeTo(getVisibleSize(), nodeSize, DURATION);
        } else { // only partially showing
            if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_DRAGGING) {
                mRefreshStatus = PullRefreshStatus.PULL_STATUS_FOLDED;
            }
            if (visibleSize > 0) {
                smoothResizeTo(getVisibleSize(), 0, DURATION);
            }
        }
    }

    protected int getNodeSize() {
        return isVertical() ? mRenderNode.getHeight() : mRenderNode.getWidth();
    }

    protected abstract void sendReleasedEvent();

    protected abstract void sendPullingEvent(int offset);

    protected void sendCompatScrollEvent() {
        mRecyclerView.getRecyclerViewEventHelper().checkSendOnScrollEvent();
    }

    public void onDestroy() {
        mItemView = null;
        mContainer.removeAllViews();
        endAnimation();
    }

    public void onRefreshCompleted() {
        if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_REFRESHING) {
            mRefreshStatus = PullRefreshStatus.PULL_STATUS_FOLDED;
            smoothResizeTo(getVisibleSize(), 0, DURATION);
        }
    }

    public abstract void enableRefresh();

    public View getView() {
        return mContainer;
    }

    protected void endAnimation() {
        if (mAnimator != null) {
            mAnimator.removeAllListeners();
            mAnimator.removeAllUpdateListeners();
            mAnimator.end();
            mAnimator = null;
        }
    }

    public void onLayoutOrientationChanged() {
        if (mItemView == null || mContainer == null) {
            return;
        }
        boolean isVertical = isVertical();
        if (isVertical) {
            mContainer.setOrientation(LinearLayout.HORIZONTAL);
        } else {
            mContainer.setOrientation(LinearLayout.VERTICAL);
        }
        ViewGroup.LayoutParams lpChild = mItemView.getLayoutParams();
        if (lpChild instanceof LinearLayout.LayoutParams) {
            lpChild.width = mRenderNode.getWidth();
            lpChild.height = mRenderNode.getHeight();
            if (mItemView instanceof HippyPullHeaderView) {
                ((LinearLayout.LayoutParams) lpChild).gravity = isVertical ? Gravity.BOTTOM : Gravity.RIGHT;
            } else if (mItemView instanceof HippyPullFooterView) {
                ((LinearLayout.LayoutParams) lpChild).gravity = isVertical ? Gravity.TOP : Gravity.LEFT;
            }
        }
        ViewGroup.LayoutParams lpContainer = mContainer.getLayoutParams();
        if (lpContainer != null) {
            lpContainer.width = isVertical ? MATCH_PARENT : 0;
            lpContainer.height = isVertical ? 0 : MATCH_PARENT;
        }
    }

    public void setItemView(View itemView) {
        boolean isVertical = isVertical();
        mItemView = itemView;
        mContainer.removeAllViews();
        if (isVertical) {
            mContainer.setOrientation(LinearLayout.HORIZONTAL);
        } else {
            mContainer.setOrientation(LinearLayout.VERTICAL);
        }
        LinearLayout.LayoutParams lpChild = new LinearLayout.LayoutParams(mRenderNode.getWidth(), mRenderNode.getHeight());
        if (itemView instanceof HippyPullHeaderView) {
            lpChild.gravity = isVertical ? Gravity.BOTTOM : Gravity.RIGHT;
        } else if (itemView instanceof HippyPullFooterView) {
            lpChild.gravity = isVertical ? Gravity.TOP : Gravity.LEFT;
        }
        mContainer.addView(itemView, lpChild);
        int width = isVertical ? MATCH_PARENT : 0;
        int height = isVertical ? 0 : MATCH_PARENT;
        RecyclerView.LayoutParams lpContainer;
        if (mRecyclerView instanceof HippyWaterfallView) {
            lpContainer = new StaggeredGridLayoutManager.LayoutParams(width, height);
            ((StaggeredGridLayoutManager.LayoutParams) lpContainer).setFullSpan(true);
        } else {
            lpContainer = new RecyclerView.LayoutParams(width, height);
        }
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
        sendCompatScrollEvent();
    }

    protected void smoothResizeTo(int fromValue, int toValue, int duration) {
        endAnimation();
        mAnimator = ValueAnimator.ofInt(fromValue, toValue);
        mAnimator.addUpdateListener(animation -> setVisibleSize((int) animation.getAnimatedValue()));
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
}
