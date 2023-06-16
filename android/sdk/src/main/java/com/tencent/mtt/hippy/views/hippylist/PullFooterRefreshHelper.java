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

import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;

class PullFooterRefreshHelper extends PullRefreshHelper {

    public static final String EVENT_TYPE_FOOTER_RELEASED = "onFooterReleased";
    public static final String EVENT_TYPE_FOOTER_PULLING = "onFooterPulling";

    PullFooterRefreshHelper(@NonNull HippyRecyclerView recyclerView,
            @NonNull RenderNode renderNode) {
        super(recyclerView, renderNode);
    }

    @Override
    protected int handleDrag(int distance) {
        int consumed = 0;
        int size = 0;
        switch (mRefreshStatus) {
            case PULL_STATUS_FOLDED:
                if (distance > 0) { // down towards
                    // make sure edge reached, aka distance - getOffsetFromEnd() > 0
                    consumed = Math.max(0, distance - getOffsetFromEnd());
                    if (consumed != 0) {
                        mRefreshStatus = PullRefreshStatus.PULL_STATUS_DRAGGING;
                        size = getVisibleSize() + Math.round(consumed / PULL_RATIO);
                        setVisibleSize(size);
                    }
                }
                break;
            case PULL_STATUS_DRAGGING:
            case PULL_STATUS_REFRESHING:
                if (distance > 0) { // down towards
                    // make sure edge reached, aka distance - getOffsetFromEnd() > 0
                    consumed = Math.max(0, distance - getOffsetFromEnd());
                } else {
                    // make sure consume no more than the opposite of footer size (converted by
                    // PULL_RATIO)
                    consumed = Math.max(-Math.round(getVisibleSize() * PULL_RATIO), distance);
                }
                if (consumed != 0) {
                    size = getVisibleSize() + Math.round(consumed / PULL_RATIO);
                    setVisibleSize(size);
                }
                break;
            default:
                break;
        }
        if (consumed != 0) {
            endAnimation();
            sendPullingEvent(size);
        }
        // reduce value of changed size, let the RecyclerView scroll to the correct position
        return consumed - Math.round(consumed / PULL_RATIO);
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

    /**
     * scrollable distance from list end, value greater than or equal to 0
     */
    protected int getOffsetFromEnd() {
        final HippyRecyclerView<?> v = mRecyclerView;
        return isVertical()
            ? v.computeVerticalScrollRange() - v.computeVerticalScrollExtent()
                - v.computeVerticalScrollOffset()
            : v.computeHorizontalScrollRange() - v.computeHorizontalScrollExtent()
                - v.computeHorizontalScrollOffset();
    }

    @Override
    public void enableRefresh() {
        mRefreshStatus = PullRefreshStatus.PULL_STATUS_REFRESHING;
        int nodeSize = isVertical() ? mRenderNode.getHeight() : mRenderNode.getWidth();
        endAnimation();
        int visibleSize = getVisibleSize();
        if (visibleSize < nodeSize) {
            setVisibleSize(nodeSize);
        }
        HippyRecyclerListAdapter<?> adapter = mRecyclerView.getAdapter();
        if (adapter != null) {
            mRecyclerView.smoothScrollToPosition(adapter.getItemCount());
        }
    }
}
