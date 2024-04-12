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

package com.tencent.mtt.hippy.views.waterfall;

import android.content.Context;
import androidx.recyclerview.widget.HippyGridSpacesItemDecoration;
import androidx.recyclerview.widget.HippyStaggeredGridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.common.ClipChildrenView;
import com.tencent.mtt.hippy.views.hippylist.HippyListUtils;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerView;

public class HippyWaterfallView extends HippyRecyclerView implements ClipChildrenView {

    static final String TAG = "HippyWaterfallView";

    public HippyWaterfallView(Context context) {
        super(context);
        setOnFlingListener(new OnFlingListener() {
            @Override
            public boolean onFling(int velocityX, int velocityY) {
                return isOverPulling();
            }
        });
    }

    public void setColumnSpacing(int columnSpacing) {
        RecyclerView.ItemDecoration decoration = getItemDecorationAt(0);
        if (decoration instanceof HippyGridSpacesItemDecoration) {
            ((HippyGridSpacesItemDecoration) decoration).setColumnSpacing(columnSpacing);
        }
    }

    public void setItemSpacing(int itemSpacing) {
        RecyclerView.ItemDecoration decoration = getItemDecorationAt(0);
        if (decoration instanceof HippyGridSpacesItemDecoration) {
            ((HippyGridSpacesItemDecoration) decoration).setItemSpacing(itemSpacing);
        }
    }

    @Override
    public void scrollToIndex(int xIndex, int yIndex, boolean animated, int duration) {
        boolean isHorizontal = HippyListUtils.isHorizontalLayout(this);
        HippyStaggeredGridLayoutManager layoutManager = (HippyStaggeredGridLayoutManager) getLayoutManager();
        int position = getNodePositionInAdapter(isHorizontal ? xIndex : yIndex);
        if (animated) {
            int deltaX = 0;
            int deltaY = 0;
            if (isHorizontal) {
                deltaX = layoutManager.computeSpanSizeUntilPosition(position) - computeHorizontalScrollOffset();
            } else {
                deltaY = layoutManager.computeSpanSizeUntilPosition(position) - computeVerticalScrollOffset();
            }
            doSmoothScrollBy(deltaX, deltaY, duration);
        } else {
            scrollToPositionWithOffset(position, 0);
            dispatchLayout();
        }
    }
}
