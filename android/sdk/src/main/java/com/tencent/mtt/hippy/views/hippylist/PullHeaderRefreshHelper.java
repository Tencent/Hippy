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

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.PixelUtil;

public class PullHeaderRefreshHelper extends PullRefreshHelper {

    public static final String EVENT_TYPE_HEADER_PULLING = "onHeaderPulling";
    public static final String EVENT_TYPE_HEADER_RELEASED = "onHeaderReleased";

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
                    consumed = Math.min(0, distance + getOffset());
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
                    consumed = Math.min(0, distance + getOffset());
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
        new HippyViewEvent(EVENT_TYPE_HEADER_RELEASED).send(mItemView, null);
    }

    @Override
    protected void sendPullingEvent(int offset) {
        HippyMap params = new HippyMap();
        params.pushDouble("contentOffset", PixelUtil.px2dp(offset));
        new HippyViewEvent(EVENT_TYPE_HEADER_PULLING).send(mItemView, params);
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
