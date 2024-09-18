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

import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.renderer.node.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.renderer.utils.EventUtils;
import java.util.HashMap;
import java.util.Map;

public class PullHeaderRefreshHelper extends PullRefreshHelper {

    PullHeaderRefreshHelper(HippyRecyclerView recyclerView, RenderNode renderNode) {
        super(recyclerView, renderNode);
    }

    @Override
    protected int handleDrag(int distance) {
        int consumed = 0;
        int size = 0;
        switch (mRefreshStatus) {
            case PULL_STATUS_FOLDED:
                if (distance < 0) { // down towards
                    // make sure edge reached, aka distance + getOffset() < 0
                    int offset = getOffset();
                    consumed = Math.min(0, distance + offset);
                    if (consumed != 0) {
                        mRefreshStatus = PullRefreshStatus.PULL_STATUS_DRAGGING;
                        size = getVisibleSize() - Math.round(consumed / PULL_RATIO);
                        setVisibleSize(size);
                    }
                }
                break;
            case PULL_STATUS_DRAGGING:
            case PULL_STATUS_REFRESHING:
                if (distance < 0) { // down towards
                    // make sure edge reached, aka distance + getOffset() < 0
                    int offset = getOffset();
                    consumed = Math.min(0, distance + offset);
                } else { // up towards
                    // make sure consume no more than header size (converted by PULL_RATIO)
                    consumed = Math.min(Math.round(getVisibleSize() * PULL_RATIO), distance);
                }
                if (consumed != 0) {
                    size = getVisibleSize() - Math.round(consumed / PULL_RATIO);
                    setVisibleSize(size);
                }
                break;
            default:
                break;
        }
        if (consumed != 0) {
            endAnimation();
            sendPullingEvent(size);
            // when header not visible, reduce value of changed size to scroll the header out
            if (mRecyclerView.getFirstChildPosition() > 0) {
                consumed -= Math.round(consumed / PULL_RATIO);
            }
        }
        return consumed;
    }

    @Override
    protected void sendReleasedEvent() {
        if (mItemView != null) {
            EventUtils.sendComponentEvent(mItemView, EventUtils.EVENT_PULL_HEADER_RELEASED, null);
        }
    }

    @Override
    protected void sendPullingEvent(int offset) {
        if (mItemView != null) {
            Map<String, Object> params = new HashMap<>();
            params.put("contentOffset", PixelUtil.px2dp(offset));
            EventUtils.sendComponentEvent(mItemView, EventUtils.EVENT_PULL_HEADER_PULLING, params);
        }
    }

    @Override
    public void enableRefresh() {
        mRefreshStatus = PullRefreshStatus.PULL_STATUS_REFRESHING;
        int nodeSize = isVertical() ? mRenderNode.getHeight() : mRenderNode.getWidth();
        if (mRecyclerView.getFirstChildPosition() > 0) {
            endAnimation();
            setVisibleSize(nodeSize);
            mRecyclerView.smoothScrollToPosition(0);
        } else {
            int visibleSize = getVisibleSize();
            if (visibleSize < nodeSize) {
                smoothResizeTo(visibleSize, nodeSize, DURATION);
            }
        }
    }

    /**
     * scrollable distance from list start, value greater than or equal to 0
     */
    protected int getOffset() {
        return isVertical() ? mRecyclerView.computeVerticalScrollOffset()
            : mRecyclerView.computeHorizontalScrollOffset();
    }

}
