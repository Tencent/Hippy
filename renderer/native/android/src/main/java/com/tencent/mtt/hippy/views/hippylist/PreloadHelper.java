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

import androidx.recyclerview.widget.RecyclerView;
import android.view.View;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.renderer.utils.EventUtils;

/**
 * Created  on 2021/1/15. Description 预加载的通知
 */
public class PreloadHelper extends RecyclerView.OnScrollListener {

    protected HippyRecyclerView hippyRecyclerView;
    protected int preloadItemNumber;
    protected boolean isPreloading;

    public PreloadHelper(HippyRecyclerView hippyRecyclerView) {
        this.hippyRecyclerView = hippyRecyclerView;
    }

    @Override
    public void onScrolled(RecyclerView recyclerView, int dx, int dy) {
        int itemCount = recyclerView.getAdapter().getItemCount();
        //频控，记录上次预加载的总条目数，相同就不再次触发预加载
        if (isPreloading) {
            return;
        }
        if (hippyRecyclerView.getAdapter().getRenderNodeCount() > 0) {
            View lastChild = recyclerView.getChildAt(recyclerView.getChildCount() - 1);
            int lastPosition = recyclerView.getChildAdapterPosition(lastChild);
            if (lastPosition + preloadItemNumber >= itemCount) {
                isPreloading = true;
                sendReachEndEvent(recyclerView);
            }
        }
    }

    public void sendReachEndEvent(RecyclerView recyclerView) {
        EventUtils.send((View) recyclerView.getParent(), EventUtils.EVENT_RECYCLER_END_REACHED, null);
    }

    /**
     * @param preloadItemNumber 提前多少条Item，通知前端加载下一页数据
     */
    public void setPreloadItemNumber(int preloadItemNumber) {
        this.preloadItemNumber = preloadItemNumber;
        hippyRecyclerView.removeOnScrollListener(this);
        if (preloadItemNumber > 0) {
            hippyRecyclerView.addOnScrollListener(this);
        }
    }

    public void reset() {
        isPreloading = false;
    }
}
