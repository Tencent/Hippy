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


import android.content.Context;
import android.util.AttributeSet;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

/**
 * Created on 2020/10/14.
 *
 * 由于Hippy的特殊需求，需要看到更多的RecyclerVew的方法和成员，这里创建和系统RecyclerView同包名。
 */

public class HippyRecyclerViewBase extends RecyclerViewBase {

    private boolean isBatching;

    public HippyRecyclerViewBase(@NonNull Context context) {
        super(context);
    }

    public HippyRecyclerViewBase(@NonNull Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
    }

    public HippyRecyclerViewBase(@NonNull Context context, @Nullable AttributeSet attrs,
            int defStyle) {
        super(context, attrs, defStyle);
    }

    /**
     * @param position 从哪一个数据位置开始排版,将position的item置顶
     * @param offset 相对于RecyclerView底部的offset，offset>0：内容下移，offset<0：内容上移
     */
    public void scrollToPositionWithOffset(int position, int offset) {
        if (mLayoutSuppressed) {
            return;
        }
        stopScroll();
        if (this.mLayout == null) {
            android.util.Log.e("RecyclerView",
                    "Cannot scroll to position a LayoutManager set. Call setLayoutManager with a non-null argument.");
        } else {
            LayoutManager layoutManager = getLayoutManager();
            if (layoutManager instanceof LinearLayoutManager) {
                ((LinearLayoutManager) layoutManager).scrollToPositionWithOffset(position, offset);
            } else if (layoutManager instanceof StaggeredGridLayoutManager) {
                ((StaggeredGridLayoutManager) layoutManager).scrollToPositionWithOffset(position, offset);
            } else {
                this.mLayout.scrollToPosition(position);
            }
            this.awakenScrollBars();
        }
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        //这里不调用super.onLayout，因为HippyListView的RenderNode的update会走onLayout，导致多余的排版
        //HippyListView的dispatchLayout统一走setListData函数
    }

    @Override
    public void dispatchLayout() {
        if (!isBatching) {
            LayoutManager layoutManager = getLayoutManager();
            if (layoutManager instanceof HippyLinearLayoutManager) {
                ((HippyLinearLayoutManager) layoutManager).resetCache();
            } else if (layoutManager instanceof HippyStaggeredGridLayoutManager) {
                ((HippyStaggeredGridLayoutManager) layoutManager).resetCache();
            }
            super.dispatchLayout();
        }
        //由于上面屏蔽了super.onLayout,这里需要对齐框架的代码，把mFirstLayoutComplete该为true
        this.mFirstLayoutComplete = true;
    }

    @Override
    String exceptionLabel() {
        return super.exceptionLabel() + ",state:" + getStateInfo();
    }

    public String getStateInfo() {
        if (mState != null) {
            return mState.toString();
        }
        return null;
    }

    public void onBatchStart() {
        isBatching = true;
    }

    public void onBatchComplete() {
        isBatching = false;
    }

    /**
     * view 被Hippy的RenderNode 删除了，这样会导致View的child完全是空的，这个view是不能再被recyclerView复用了
     * 否则如果被复用，在adapter的onBindViewHolder的时候，view的实际子view和renderNode的数据不匹配，diff会出现异常
     * 导致item白条，显示不出来，所以被删除的view，需要把viewHolder.setIsRecyclable(false)，刷新list后，这个view就
     * 不会进入缓存。
     */
    public void disableRecycle(View childView) {
        ViewGroup.LayoutParams layoutParams = childView.getLayoutParams();
        if (layoutParams instanceof LayoutParams) {
            ViewHolder viewHolder = ((LayoutParams) layoutParams).mViewHolder;
            if (viewHolder != null) {
                viewHolder.setIsRecyclable(false);
            }
        }
    }
}
