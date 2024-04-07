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

package androidx.recyclerview.widget;

import android.graphics.Rect;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView.State;
import androidx.recyclerview.widget.RecyclerView.ViewHolder;

import com.tencent.mtt.hippy.views.hippylist.HippyListUtils;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerListAdapter;
import com.tencent.mtt.hippy.views.hippylist.PullRefreshContainer;

public class HippyGridSpacesItemDecoration extends RecyclerView.ItemDecoration {

    private static final String TAG = "HippyGridSpacesItemDecoration";
    private final int mNumberOfColumns;
    private int mColumnSpacing = 0;
    private int mItemSpacing = 0;

    public HippyGridSpacesItemDecoration(int columns) {
        mNumberOfColumns = columns;
    }

    public void setColumnSpacing(int columnSpacing) {
        mColumnSpacing = columnSpacing;
    }

    public void setItemSpacing(int itemSpacing) {
        mItemSpacing = itemSpacing;
    }

    public int getColumnSpacing() {
        return mColumnSpacing;
    }

    public int getItemSpacing() {
        return mItemSpacing;
    }

    @Override
    public void getItemOffsets(@NonNull Rect outRect, @NonNull View view,
            @NonNull RecyclerView parent, @NonNull State state) {
        final StaggeredGridLayoutManager.LayoutParams lp = (StaggeredGridLayoutManager.LayoutParams) view.getLayoutParams();
        if (view instanceof PullRefreshContainer) {
            lp.bottomMargin = 0;
            lp.topMargin = 0;
            lp.rightMargin = 0;
            lp.leftMargin = 0;
            return;
        }
        ViewHolder vh = lp.mViewHolder;
        int margin = mItemSpacing;
        HippyRecyclerListAdapter adapter = (HippyRecyclerListAdapter) parent.getAdapter();
        if (lp.isFullSpan()) {
            margin = 0;
        } else if (vh != null) {
            int headerCount = adapter.hasHeader() ? 1 : 0;
            if (!adapter.hasBannerView() && vh.getLayoutPosition() < (mNumberOfColumns + headerCount)) {
                margin = 0;
            }
        }
        if (HippyListUtils.isVerticalLayout(parent)) {
            lp.bottomMargin = mItemSpacing;
            lp.topMargin = margin;
        } else {
            lp.rightMargin = mItemSpacing;
            lp.leftMargin = margin;
        }
    }
}
