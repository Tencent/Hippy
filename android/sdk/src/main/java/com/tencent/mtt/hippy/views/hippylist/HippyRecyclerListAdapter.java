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

import static android.view.ViewGroup.LayoutParams.MATCH_PARENT;

import android.view.MotionEvent;
import android.view.View.OnTouchListener;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.HippyItemTypeHelper;
import androidx.recyclerview.widget.ItemLayoutParams;
import androidx.recyclerview.widget.RecyclerView.Adapter;
import androidx.recyclerview.widget.RecyclerView.LayoutParams;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.recyclerview.widget.RecyclerView.ViewHolder;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.uimanager.DiffUtils;
import com.tencent.mtt.hippy.uimanager.DiffUtils.PatchType;
import com.tencent.mtt.hippy.uimanager.ListItemRenderNode;
import com.tencent.mtt.hippy.uimanager.PullFooterRenderNode;
import com.tencent.mtt.hippy.uimanager.PullHeaderRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.list.IRecycleItemTypeChange;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderView;
import com.tencent.mtt.hippy.views.hippylist.recyclerview.helper.skikcy.IStickyItemsProvider;
import java.util.ArrayList;
import java.util.List;

/**
 * Created on 2020/12/22.
 * Description RecyclerView的子View直接是前端的RenderNode节点，没有之前包装的那层RecyclerViewItem。
 * 对于特殊的renderNode，比如header和sticky的节点，我们进行了不同的处理。
 */
public class HippyRecyclerListAdapter<HRCV extends HippyRecyclerView> extends Adapter<HippyRecyclerViewHolder>
        implements IRecycleItemTypeChange, IStickyItemsProvider, ItemLayoutParams, OnTouchListener {

    private static final int STICK_ITEM_VIEW_TYPE_BASE = -100000;
    protected final HippyEngineContext hpContext;
    protected final HRCV hippyRecyclerView;
    protected final HippyItemTypeHelper hippyItemTypeHelper;
    protected int positionToCreateHolder;
    protected PullFooterRefreshHelper footerRefreshHelper;
    protected PullHeaderRefreshHelper headerRefreshHelper;
    protected PreloadHelper preloadHelper;

    public HippyRecyclerListAdapter(HRCV hippyRecyclerView, HippyEngineContext hpContext) {
        this.hpContext = hpContext;
        this.hippyRecyclerView = hippyRecyclerView;
        hippyItemTypeHelper = new HippyItemTypeHelper(hippyRecyclerView);
        preloadHelper = new PreloadHelper(hippyRecyclerView);
    }

    /**
     * 对于吸顶到RenderNode需要特殊处理
     * 吸顶的View需要包一层ViewGroup，吸顶的时候，从ViewGroup把RenderNode的View取出来挂载到顶部
     * 当RenderNode的View已经挂载到Header位置上面，如果重新触发创建ViewHolder，renderView会创建失败，
     * 此时就只返回一个空到renderViewContainer上去，等viewHolder需要显示到时候，再把header上面的View还原到这个
     * ViewHolder上面。
     */
    @NonNull
    @Override
    public HippyRecyclerViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        ListItemRenderNode renderNode = getChildNodeByAdapterPosition(positionToCreateHolder);
        boolean isViewExist = renderNode.isViewExist();
        boolean needsDelete = renderNode.needDeleteExistRenderView();
        View renderView = createRenderView(renderNode);
        if (isPullHeader(positionToCreateHolder)) {
            ((HippyPullHeaderView) renderView).setRecyclerView(hippyRecyclerView);
            initHeaderRefreshHelper(renderView, renderNode);
            return new HippyRecyclerViewHolder(headerRefreshHelper.getView(), renderNode);
        } else if (renderView instanceof HippyPullFooterView) {
            ((HippyPullFooterView) renderView).setRecyclerView(hippyRecyclerView);
            initFooterRefreshHelper(renderView, renderNode);
            return new HippyRecyclerViewHolder(footerRefreshHelper.getView(), renderNode);
        } else if (isStickyPosition(positionToCreateHolder)) {
            return new HippyRecyclerViewHolder(getStickyContainer(parent, renderView), renderNode);
        } else {
            if (renderView == null) {
                throw new IllegalArgumentException("createRenderView error!"
                        + ",isDelete:" + renderNode.isDelete()
                        + ",isViewExist:" + isViewExist
                        + ",needsDelete:" + needsDelete
                        + ",className:" + renderNode.getClassName()
                        + ",isLazy :" + renderNode.isIsLazyLoad()
                        + ",itemCount :" + getItemCount()
                        + ",getNodeCount:" + getRenderNodeCount()
                        + ",notifyCount:" + hippyRecyclerView.renderNodeCount
                        + "curPos:" + positionToCreateHolder
                        + ",rootView:" + renderNode.hasRootView()
                        + ",parentNode:" + (renderNode.getParent() != null)
                        + ",offset:" + hippyRecyclerView.computeVerticalScrollOffset()
                        + ",range:" + hippyRecyclerView.computeVerticalScrollRange()
                        + ",extent:" + hippyRecyclerView.computeVerticalScrollExtent()
                        + ",viewType:" + viewType
                        + ",id:" + renderNode.getId()
                        + ",attachedIds:" + getAttachedIds()
                        + ",nodeOffset:" + hippyRecyclerView.getNodePositionHelper().getNodeOffset()
                        + ",view:" + hippyRecyclerView
                );
            }
            return new HippyRecyclerViewHolder(renderView, renderNode);
        }
    }

    String getAttachedIds() {
        StringBuilder attachedIds = new StringBuilder();
        int childCount = hippyRecyclerView.getChildCount();
        for (int i = 0; i < childCount; ++i) {
            View attachedView = hippyRecyclerView.getChildAt(i);
            attachedIds.append("|p_" + hippyRecyclerView.getChildAdapterPosition(attachedView));
            attachedIds.append("_i_" + attachedView.getId());
        }
        return attachedIds.toString();
    }


    /**
     * deleteExistRenderView 是异常情况，正常情况应该不会走这个逻辑，
     * 本来在{@link HippyRecyclerView#onViewAbound(HippyRecyclerViewHolder)}
     * 的地方应该已经调用了deleteExistRenderView,deleteExistRenderView这里不应该可能走到
     * 如果是吸顶的View，shouldSticky为true的情况下，是本身就存在的，不应该去调用deleteExistRenderView
     *
     * @param renderNode
     * @return
     */
    protected View createRenderView(ListItemRenderNode renderNode) {
        if (renderNode.needDeleteExistRenderView() && !renderNode.shouldSticky()) {
            deleteExistRenderView(renderNode);
        }
        renderNode.setLazy(false);
        View view = renderNode.createViewRecursive();
        renderNode.updateViewRecursive();
        return view;
    }

    public void deleteExistRenderView(ListItemRenderNode renderNode) {
        renderNode.setLazy(true);
        RenderNode parentNode = getParentNode();
        if (parentNode != null) {
            hpContext.getRenderManager().getControllerManager()
                    .deleteChild(parentNode.getId(), renderNode.getId());
        } else {
            hpContext.getRenderManager().getControllerManager().removeViewFromRegistry(renderNode.getId());
        }
        renderNode.setRecycleItemTypeChangeListener(null);
    }

    private FrameLayout getStickyContainer(ViewGroup parent, View renderView) {
        FrameLayout container = new FrameLayout(parent.getContext());
        if (renderView != null) {
            container.addView(renderView, new FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT));
        }
        return container;
    }

    @Override
    public String toString() {
        return "HippyRecyclerAdapter: itemCount:" + getItemCount();
    }

    /**
     * 绑定数据 对于全新的viewHolder，isCreated 为true，调用updateViewRecursive进行物理树的创建，以及数据的绑定
     * 对于非全新创建的viewHolder，进行view树的diff，然后在把数据绑定到view树上面
     *
     * @param hippyRecyclerViewHolder position当前的viewHolder
     * @param position 绑定数据的节点位置
     */
    @Override
    public void onBindViewHolder(HippyRecyclerViewHolder hippyRecyclerViewHolder, int position) {
        setLayoutParams(hippyRecyclerViewHolder.itemView, position);
        RenderNode oldNode = hippyRecyclerViewHolder.bindNode;
        ListItemRenderNode newNode = getChildNodeByAdapterPosition(position);
        oldNode.setLazy(true);
        newNode.setLazy(false);
        if (oldNode != newNode) {
            //step 1: diff
            ArrayList<PatchType> patchTypes = DiffUtils.diff(oldNode, newNode);
            //step:2 delete unUseful views
            DiffUtils.deleteViews(hpContext.getRenderManager().getControllerManager(), patchTypes);
            //step:3 replace id
            DiffUtils.replaceIds(hpContext.getRenderManager().getControllerManager(), patchTypes);
            //step:4 create view is do not  reUse
            DiffUtils.createView(patchTypes);
            //step:5 patch the dif result
            DiffUtils.doPatch(hpContext.getRenderManager().getControllerManager(), patchTypes);
        }
        newNode.setRecycleItemTypeChangeListener(this);
        hippyRecyclerViewHolder.bindNode = newNode;
    }

    public void onFooterRefreshCompleted() {
        if (footerRefreshHelper != null) {
            footerRefreshHelper.onRefreshCompleted();
        }
    }

    public void onFooterDestroy() {
        if (footerRefreshHelper != null) {
            footerRefreshHelper.onDestroy();
            footerRefreshHelper = null;
        }
    }

    public void onHeaderRefreshCompleted() {
        if (headerRefreshHelper != null) {
            headerRefreshHelper.onRefreshCompleted();
        }
    }

    public void onHeaderDestroy() {
        if (headerRefreshHelper != null) {
            headerRefreshHelper.onDestroy();
            headerRefreshHelper = null;
        }
    }

    public void enableHeaderRefresh() {
        if (headerRefreshHelper != null) {
            headerRefreshHelper.enableRefresh();
        }
    }

    private void initHeaderRefreshHelper(View itemView, RenderNode node) {
        if (headerRefreshHelper == null) {
            headerRefreshHelper = new PullHeaderRefreshHelper(hippyRecyclerView, node);
        }
        headerRefreshHelper.setItemView(itemView);
    }

    /**
     * 检测最后一个item是否是footer，如果是，需要对这个itemView设置监控，footer显示就通知前端加载下一页
     */
    private void initFooterRefreshHelper(View itemView, RenderNode node) {
        if (footerRefreshHelper == null) {
            footerRefreshHelper = new PullFooterRefreshHelper(hippyRecyclerView, node);
        }
        footerRefreshHelper.setItemView(itemView);
    }

    /**
     * 设置View的LayoutParams排版属性，宽高由render节点提供
     * 对于LinearLayout的排版，竖向排版，宽度强行顶满，横向排版，高度强行顶满
     */
    protected void setLayoutParams(View itemView, int position) {
        LayoutParams childLp = getLayoutParams(itemView);
        RenderNode childNode = getChildNodeByAdapterPosition(position);
        if (childNode instanceof PullFooterRenderNode || childNode instanceof PullHeaderRenderNode) {
            return;
        }
        if (HippyListUtils.isLinearLayout(hippyRecyclerView)) {
            boolean isVertical = HippyListUtils.isVerticalLayout(hippyRecyclerView);
            childLp.height = isVertical ? childNode.getHeight() : MATCH_PARENT;
            childLp.width = isVertical ? MATCH_PARENT : childNode.getWidth();
        } else {
            childLp.height = childNode.getHeight();
            childLp.width = childNode.getWidth();
        }
        itemView.setLayoutParams(childLp);
    }


    protected LayoutParams getLayoutParams(View itemView) {
        ViewGroup.LayoutParams params = itemView.getLayoutParams();
        LayoutParams childLp = null;
        if (params instanceof LayoutParams) {
            childLp = (LayoutParams) params;
        }
        if (childLp == null) {
            childLp = new LayoutParams(MATCH_PARENT, 0);
        }
        return childLp;
    }

    @Override
    public int getItemViewType(int position) {
        //在调用onCreateViewHolder之前，必然会调用getItemViewType，所以这里把position记下来
        //用在onCreateViewHolder的时候来创建View，不然onCreateViewHolder是无法创建RenderNode到View的
        setPositionToCreate(position);
        ListItemRenderNode node = getChildNodeByAdapterPosition(position);
        if (node == null) {
            return 0;
        }
        if (node.shouldSticky()) {
            return STICK_ITEM_VIEW_TYPE_BASE - position;
        }
        return node.getItemViewType();
    }

    protected void setPositionToCreate(int position) {
        positionToCreateHolder = position;
    }

    /**
     * 获取子节点，理论上面是不会返回空的，否则就是某个流程出了问题
     *
     * @param position adapter实际的item位置
     */
    public ListItemRenderNode getChildNodeByAdapterPosition(int position) {
        return getChildNode(hippyRecyclerView.getNodePositionHelper().getRenderNodePosition(position));
    }

    /**
     * 获取前端的renderNode的子节点
     *
     * @param position 前端的子节点的位置
     */
    public ListItemRenderNode getChildNode(int position) {
        RenderNode parentNode = getParentNode();
        if (parentNode != null && position < parentNode.getChildCount() && position >= 0) {
            return (ListItemRenderNode) parentNode.getChildAt(position);
        }
        return null;
    }

    /**
     * listItemView的数量
     */
    @Override
    public int getItemCount() {
        return getRenderNodeCount();
    }

    /**
     * 返回前端的list的内容Item数目
     *
     * @return
     */
    public int getRenderNodeCount() {
        RenderNode listNode = getParentNode();
        if (listNode != null) {
            return listNode.getChildCount();
        }
        return 0;
    }

    /**
     * 前端展示的内容的高度
     *
     * @return
     */
    public int getRenderNodeTotalHeight() {
        int renderCount = getRenderNodeCount();
        int renderNodeTotalHeight = 0;
        for (int i = 0; i < renderCount; i++) {
            renderNodeTotalHeight += getRenderNodeHeight(i);
        }
        return renderNodeTotalHeight;
    }

    public int getItemHeight(int position) {
        Integer itemHeight = getRenderNodeHeight(position);
        if (itemHeight != null) {
            return itemHeight;
        }
        return 0;
    }

    public int getRenderNodeHeight(int position) {
        ListItemRenderNode childNode = getChildNode(position);
        if (childNode != null) {
            if (childNode.isPullHeader()) {
                if (headerRefreshHelper != null) {
                    return headerRefreshHelper.getVisibleHeight();
                }

                return 0;
            }
            if (childNode.isPullFooter()) {
                if (footerRefreshHelper != null) {
                    return footerRefreshHelper.getVisibleHeight();
                }

                return 0;
            }
            return childNode.getHeight();
        }
        return 0;
    }

    public int getItemWidth(int position) {
        Integer renderNodeWidth = getRenderNodeWidth(position);
        if (renderNodeWidth != null) {
            return renderNodeWidth;
        }
        return 0;
    }

    public int getRenderNodeWidth(int position) {
        ListItemRenderNode childNode = getChildNode(position);
        if (childNode != null) {
            if (childNode.isPullHeader()) {
                if (headerRefreshHelper != null) {
                    return headerRefreshHelper.getVisibleWidth();
                }

                return 0;
            }
            if (childNode.isPullFooter()) {
                if (footerRefreshHelper != null) {
                    return footerRefreshHelper.getVisibleWidth();
                }

                return 0;
            }
            return childNode.getWidth();
        }
        return 0;
    }

    protected RenderNode getParentNode() {
        return hpContext.getRenderManager().getRenderNode(getHippyListViewId());
    }

    private int getHippyListViewId() {
        return ((View) hippyRecyclerView.getParent()).getId();
    }

    @Override
    public void onRecycleItemTypeChanged(int oldType, int newType, ListItemRenderNode listItemNode) {
        hippyItemTypeHelper.updateItemType(oldType, newType, listItemNode);
    }

    @Override
    public long getItemId(int position) {
        return getChildNodeByAdapterPosition(position).getId();
    }

    /**
     * 该position对于的renderNode是否是吸顶的属性
     */
    @Override
    public boolean isStickyPosition(int position) {
        if (position >= 0 && position < getItemCount()) {
            return getChildNodeByAdapterPosition(position).shouldSticky();
        }
        return false;
    }

    /**
     * 该position对于的renderNode是否是Header属性，值判断第一个节点
     */
    private boolean isPullHeader(int position) {
        if (position == 0) {
            return getChildNodeByAdapterPosition(0).isPullHeader();
        }
        return false;
    }

    public PreloadHelper getPreloadHelper() {
        return preloadHelper;
    }

    public void setPreloadItemNumber(int preloadItemNumber) {
        preloadHelper.setPreloadItemNumber(preloadItemNumber);
    }

    @Override
    public void getItemLayoutParams(int position, LayoutParams lp) {
        if (lp == null) {
            return;
        }
        lp.height = getItemHeight(position);
    }

    @Override
    public boolean onTouch(View v, MotionEvent event) {
        if (headerRefreshHelper != null) {
            headerRefreshHelper.onTouch(v, event);
        }
        if (footerRefreshHelper != null) {
            footerRefreshHelper.onTouch(v, event);
        }
        return false;
    }
}
