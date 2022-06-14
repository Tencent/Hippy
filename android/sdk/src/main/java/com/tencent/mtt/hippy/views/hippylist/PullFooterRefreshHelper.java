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
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;

class PullFooterRefreshHelper extends PullRefreshHelper {

    public static final String EVENT_TYPE_FOOTER_RELEASED = "onFooterReleased";
    public static final String EVENT_TYPE_FOOTER_PULLING = "onFooterPulling";
    public static final String EVENT_ON_END_REACHED = "onLoadMore";

    PullFooterRefreshHelper(@NonNull HippyRecyclerView recyclerView,
            @NonNull RenderNode renderNode) {
        super(recyclerView, renderNode);
    }

    @Override
    protected void sendReleasedEvent() {
        new HippyViewEvent(EVENT_TYPE_FOOTER_RELEASED).send(mItemView, null);
    }

    @Override
    protected void sendPullingEvent(int offset) {
        HippyMap params = new HippyMap();
        params.pushDouble("contentOffset", PixelUtil.px2dp(offset));
        new HippyViewEvent(EVENT_TYPE_FOOTER_PULLING).send(mItemView, params);
    }

    @Override
    protected void handleTouchMoveEvent(MotionEvent event) {
        if (((isVertical() && mRecyclerView.canScrollVertically(1)) ||
                (!isVertical() && mRecyclerView.canScrollHorizontally(-1))) &&
                (mRefreshStatus == PullRefreshStatus.PULL_STATUS_FOLDED)) {
            return;
        }
        float current = isVertical() ? event.getRawY() : event.getRawX();
        if (mRefreshStatus == PullRefreshStatus.PULL_STATUS_FOLDED) {
            boolean isOnMove = Math.abs(current - mStartPosition - getTouchSlop()) > 0;
            if (!isOnMove) {
                return;
            }
            mRefreshStatus = PullRefreshStatus.PULL_STATUS_DRAGGING;
        }
        endAnimation();
        int nodeSize = isVertical() ? mRenderNode.getHeight() : mRenderNode.getWidth();
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
