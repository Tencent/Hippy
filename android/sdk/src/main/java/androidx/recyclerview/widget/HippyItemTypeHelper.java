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

import androidx.recyclerview.widget.RecyclerView.RecycledViewPool.ScrapData;
import androidx.recyclerview.widget.RecyclerView.Recycler;
import androidx.recyclerview.widget.RecyclerView.ViewHolder;
import android.util.SparseArray;
import com.tencent.mtt.hippy.uimanager.ListItemRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewHolder;
import java.util.ArrayList;

public class HippyItemTypeHelper {

    HippyRecyclerViewBase recyclerView;
    private Recycler recycler;

    public HippyItemTypeHelper(HippyRecyclerViewBase recyclerView) {
        this.recyclerView = recyclerView;
        this.recycler = recyclerView.mRecycler;
    }

    /**
     * 更新3层缓存的ViewHolder
     *
     * @param oldType 老的type
     * @param newType 新的type
     * @param listItemRenderNode 前端变化type的RenderNode
     */
    public void updateItemType(int oldType, int newType, ListItemRenderNode listItemRenderNode) {
        int count = recyclerView.getChildCount();
        for (int i = 0; i < count; i++) {
            final ViewHolder holder = recyclerView
                    .getChildViewHolder(recyclerView.getChildAt(i));
            if (changeTypeIfNeed(oldType, newType, listItemRenderNode, holder)) {
                return;
            }
        }

        if (updateItemType(oldType, newType, listItemRenderNode, recycler.mAttachedScrap)) {
            return;
        }

        if (updateItemType(oldType, newType, listItemRenderNode, recyclerView.mRecycler.mCachedViews)) {
            return;
        }

        updateTypeForRecyclerPool(oldType, newType, listItemRenderNode);
    }

    private void updateTypeForRecyclerPool(int oldType, int newType, ListItemRenderNode renderNode) {
        if (recycler.getRecycledViewPool() != null) {
            SparseArray<ScrapData> scrap = recycler.getRecycledViewPool().mScrap;
            ScrapData scrapData = scrap.get(oldType);
            if (scrapData != null && !scrapData.mScrapHeap.isEmpty()) {
                for (ViewHolder holder : scrapData.mScrapHeap) {
                    if (changeTypeIfNeed(oldType, newType, renderNode, holder)) {
                        scrapData.mScrapHeap.remove(holder);
                        addNewType(newType, holder);
                        return;
                    }
                }
            }
        }
    }

    /**
     * 重新将viewHolder加入缓存池
     */
    private void addNewType(int newType, ViewHolder holder) {
        holder.mItemViewType = newType;
        SparseArray<ScrapData> scrap = recycler.getRecycledViewPool().mScrap;
        ScrapData newScrapData = scrap.get(newType);
        if (newScrapData == null) {
            newScrapData = new ScrapData();
            scrap.append(newType, newScrapData);
        }
        newScrapData.mScrapHeap.add(holder);
    }

    private boolean updateItemType(int oldType, int newType, ListItemRenderNode listItemRenderNode,
            ArrayList<ViewHolder> viewHolders) {
        final int cacheSize = viewHolders.size();
        for (int i = 0; i < cacheSize; i++) {
            final ViewHolder holder = viewHolders.get(i);
            if (changeTypeIfNeed(oldType, newType, listItemRenderNode, holder)) {
                return true;
            }
        }
        return false;
    }

    private boolean changeTypeIfNeed(int oldType, int newType, ListItemRenderNode listItemRenderNode,
            ViewHolder holder) {
        if (holder.getItemViewType() == oldType && holder instanceof HippyRecyclerViewHolder) {
            RenderNode holderNode = ((HippyRecyclerViewHolder) holder).bindNode;
            if (holderNode == listItemRenderNode) {
                holder.mItemViewType = newType;
                return true;
            }
        }
        return false;
    }
}
