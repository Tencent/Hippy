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

import android.view.MotionEvent;
import androidx.annotation.NonNull;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.utils.EventUtils;
import java.util.HashMap;
import java.util.Map;

class PullFooterRefreshHelper extends PullRefreshHelper {

    PullFooterRefreshHelper(@NonNull HippyRecyclerView recyclerView,
            @NonNull RenderNode renderNode) {
        super(recyclerView, renderNode);
    }

    @Override
    protected void sendReleasedEvent() {
        if (mItemView != null) {
            EventUtils.sendComponentEvent(mItemView, EventUtils.EVENT_PULL_FOOTER_RELEASED, null);
        }
    }

    @Override
    protected void sendPullingEvent(int offset) {
        if (mItemView != null) {
            Map<String, Object> params = new HashMap<>();
            params.put("contentOffset", PixelUtil.px2dp(offset));
            EventUtils.sendComponentEvent(mItemView, EventUtils.EVENT_PULL_FOOTER_PULLING, params);
        }
    }

    @Override
    protected void handleTouchMoveEvent(MotionEvent event) {
        boolean isVertical = isVertical();
        if (isVertical && mRecyclerView.canScrollVertically(1)
                && mRefreshStatus == PullRefreshStatus.PULL_STATUS_FOLDED) {
            return;
        }
        if (!isVertical) {
            int offset = mRecyclerView.computeHorizontalScrollOffset();
            int extent = mRecyclerView.computeHorizontalScrollExtent();
            int range = mRecyclerView.computeHorizontalScrollRange();
            if ((offset + extent < range - extent) && mRefreshStatus == PullRefreshStatus.PULL_STATUS_FOLDED) {
                return;
            }
        }
        float current = isVertical ? event.getRawY() : event.getRawX();
        if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_FOLDED) {
            boolean isOnMove = Math.abs(current - mStartPosition - getTouchSlop()) > 0;
            if (!isOnMove) {
                return;
            }
            mRefreshStatus = PullRefreshStatus.PULL_STATUS_DRAGGING;
        }
        endAnimation();
        int nodeSize = isVertical ? mRenderNode.getHeight() : mRenderNode.getWidth();
        int distance = getVisibleSize() - ((int) ((current - mLastPosition) / PULL_RATIO));
        if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_REFRESHING) {
            setVisibleSize(Math.max(distance, nodeSize));
        } else {
            setVisibleSize(distance);
        }
        if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_DRAGGING) {
            sendPullingEvent(Math.max(getVisibleSize(), 0));
        }
        mLastPosition = current;
    }
}
