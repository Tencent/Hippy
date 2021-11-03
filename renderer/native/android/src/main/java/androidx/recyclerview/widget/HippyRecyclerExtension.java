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

import androidx.recyclerview.widget.RecyclerView.Recycler;
import androidx.recyclerview.widget.RecyclerView.ViewHolder;
import android.view.View;
import com.tencent.mtt.hippy.uimanager.ListItemRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewHolder;
import com.tencent.mtt.hippy.views.hippylist.NodePositionHelper;
import com.tencent.renderer.INativeRenderer;
import java.util.ArrayList;

public class HippyRecyclerExtension extends RecyclerView.ViewCacheExtension {

  private final INativeRenderer hpContext;
  private final NodePositionHelper nodePositionHelper;
  private HippyRecyclerViewBase recyclerView;
  private int currentPosition;

  public HippyRecyclerExtension(HippyRecyclerViewBase recyclerView, INativeRenderer hpContext,
      NodePositionHelper nodePositionHelper) {
    this.nodePositionHelper = nodePositionHelper;
    this.recyclerView = recyclerView;
    this.hpContext = hpContext;
  }

  public int getCurrentPosition() {
    return currentPosition;
  }

  @Override
  public View getViewForPositionAndType(Recycler recycler, int position, int type) {
    currentPosition = position;
    View bestView = findInAttachedScrap(recycler, position, type);
    if (bestView == null) {
      bestView = findInCachedScrap(recycler, position, type);
    }
    return bestView;
  }

  private View findInCachedScrap(Recycler recycler, int position, int type) {
    ViewHolder bestHolder = findBestHolder(recycler.mCachedViews, position, type);
    if (bestHolder != null) {
      recycler.mCachedViews.remove(bestHolder);
      return bestHolder.itemView;
    }
    return null;
  }

  protected View findInAttachedScrap(Recycler recycler, int position, int type) {
    ViewHolder bestHolder = findBestHolder(recycler.mAttachedScrap, position, type);
    if (bestHolder != null) {
      bestHolder.unScrap();
      return bestHolder.itemView;
    }
    return null;
  }

  private ViewHolder findBestHolder(ArrayList<ViewHolder> viewHolders, int position,
      int type) {
    int scrapCount = viewHolders.size();
    for (int i = 0; i < scrapCount; i++) {
      final ViewHolder holder = viewHolders.get(i);
      if (isTheBestHolder(position, type, holder)) {
        return holder;
      }
    }
    return null;
  }

  /**
   * 找到对应的bindNode，比对缓存池的holder是否正好是当前position位置对应的Holder
   *
   * @param position    要获取Holder的position
   * @param type        节点类型
   * @param scrapHolder 缓存池的Holder
   * @return
   */
  protected boolean isTheBestHolder(int position, int type, ViewHolder scrapHolder) {
    if (scrapHolder.getAdapterPosition() != position || scrapHolder.isInvalid() || scrapHolder
        .isRemoved() || hpContext == null) {
      return false;
    }
    if (scrapHolder.getItemViewType() == type && scrapHolder instanceof HippyRecyclerViewHolder) {
      RenderNode nodeOfPosition = hpContext.getRenderManager().getRenderNode(recyclerView.getId())
          .getChildAt(nodePositionHelper.getRenderNodePosition(position));
      return isNodeEquals(((HippyRecyclerViewHolder) scrapHolder).bindNode,
          (ListItemRenderNode) nodeOfPosition);
    }
    return false;
  }

  public static boolean isNodeEquals(ListItemRenderNode node1, ListItemRenderNode node2) {
    if (node1 == null || node2 == null) {
      return false;
    }
    return node1.equals(node2);
  }
}
