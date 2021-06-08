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

import androidx.recyclerview.widget.RecyclerView.ViewHolder;
import android.view.View;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.views.hippylist.HippyRecyclerViewHolder;
import com.tencent.mtt.hippy.views.hippylist.NodePositionHelper;

public class HippyRecyclerPool extends RecyclerView.RecycledViewPool {

  private final View recyclerView;
  private final HippyRecyclerExtension viewCacheExtension;
  private final HippyEngineContext hpContext;
  private final NodePositionHelper nodePositionHelper;
  private IHippyViewAboundListener viewAboundListener;

  public HippyRecyclerPool(HippyEngineContext hpContext, View recyclerView,
      HippyRecyclerExtension viewCacheExtension, NodePositionHelper nodePositionHelper) {
    this.nodePositionHelper = nodePositionHelper;
    this.hpContext = hpContext;
    this.recyclerView = recyclerView;
    this.viewCacheExtension = viewCacheExtension;
  }

  public void setViewAboundListener(IHippyViewAboundListener viewAboundListener) {
    this.viewAboundListener = viewAboundListener;
  }

  /**
   * 从缓存池里面获取ViewHolder进行复用 1、精确命中相同的renderNode 2、命中相同Type的ViewHolder，并且对应的RenderNode是没有被前端删除的
   * 如果renderNode.isDelete为true,说明前端删除了RenderNode， 此时会调用 RenderManager框架的deleteChild, 所以view也不会存在了。
   * 即使找到了相同type的Holder，也不能复用了。
   */
  @Override
  public ViewHolder getRecycledView(int viewType) {
    ScrapData scrapData = mScrap.get(viewType);
    if (scrapData == null) {
      return null;
    }
    ViewHolder delegateHolder = null;
    for (ViewHolder holder : scrapData.mScrapHeap) {
      if (isTheSameRenderNode((HippyRecyclerViewHolder) holder)) {
        scrapData.mScrapHeap.remove(holder);
        delegateHolder = holder;
        break;
      }
    }
    //没有精确命中，再看看缓存池里面有没有相同类型的viewType
    if (delegateHolder == null) {
      delegateHolder = super.getRecycledView(viewType);
    }
    //检测对应的节点是否被删除
    if (delegateHolder instanceof HippyRecyclerViewHolder
        && ((HippyRecyclerViewHolder) delegateHolder).isRenderDeleted()) {
      return null;
    }
    return delegateHolder;
  }

  /**
   * putRecycledView 可能出现缓存已经超过最大值，会发生ViewHolder被抛弃， 抛弃需要后，需要同步修改 renderManager内部创建对应的view，这样 {@link
   * com.tencent.mtt.hippy.views.hippylist.HippyRecyclerListAdapter#onCreateViewHolder(ViewGroup,
   * int)}，才能通过 {@link RenderNode#createViewRecursive()} 创建新的view, 否则createViewRecursive会返回null。
   *
   * @param scrap
   */
  @Override
  public void putRecycledView(ViewHolder scrap) {
    notifyAboundIfNeed(scrap);
    super.putRecycledView(scrap);
  }

  private void notifyAboundIfNeed(ViewHolder scrap) {
    int viewType = scrap.getItemViewType();
    ScrapData scrapData = this.mScrap.get(viewType);
    if (scrapData != null && scrapData.mScrapHeap.size() >= scrapData.mMaxScrap) {
      viewAboundListener.onViewAbound((HippyRecyclerViewHolder) scrap);
    }
  }

  /**
   * 是否是节点完全相等
   *
   * @param scrapHolder 缓存池里面的Holder
   */
  private boolean isTheSameRenderNode(HippyRecyclerViewHolder scrapHolder) {
    if (scrapHolder.bindNode == null) {
      return false;
    }
    RenderNode nodeForCurrent = hpContext.getRenderManager().getRenderNode(recyclerView.getId())
        .getChildAt(
            nodePositionHelper.getRenderNodePosition(viewCacheExtension.getCurrentPosition()));
    return scrapHolder.bindNode.equals(nodeForCurrent);
  }
}
