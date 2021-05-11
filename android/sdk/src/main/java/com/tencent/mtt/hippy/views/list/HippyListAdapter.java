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
package com.tencent.mtt.hippy.views.list;

import android.view.View;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.uimanager.DiffUtils;
import com.tencent.mtt.hippy.uimanager.HippyViewEvent;
import com.tencent.mtt.hippy.uimanager.ListItemRenderNode;
import com.tencent.mtt.hippy.uimanager.PullFooterRenderNode;
import com.tencent.mtt.hippy.uimanager.PullHeaderRenderNode;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.refresh.HippyPullFooterView;
import com.tencent.mtt.hippy.views.refresh.HippyPullHeaderView;
import com.tencent.mtt.supportui.views.recyclerview.*;

import java.util.ArrayList;

@SuppressWarnings("deprecation")
public class HippyListAdapter extends RecyclerAdapter implements IRecycleItemTypeChange
{

	protected final HippyEngineContext	mHippyContext;
	private RecyclerViewBase.Recycler	mRecycler;
	private HippyViewEvent			    onEndReachedEvent;
	private HippyViewEvent			    onLoadMoreEvent;
	// --Commented out by Inspection (2021/5/4 20:54):private static final String			TAG	= "HippyListAdapter";
	// harryguo: 给hippy sdk提供API：设置提前预加载的条目数量，默认为0
	private int						mPreloadItemNum = 0;

	public HippyListAdapter(RecyclerView recyclerView, HippyEngineContext HippyContext)
	{
		super(recyclerView);
		mHippyContext = HippyContext;
	}

	@Override
	public String getViewHolderReUseKey(int position) {
		if (position < 0 || position > getItemCount()) {
			return null;
		}

		return String.valueOf(position);
	}

	@Override
	public RecyclerView.ViewHolderWrapper onCreateSuspendViewHolderWithPos(RecyclerViewBase parent, int position, int viewType)
	{
		return null;
	}

	@Override
	public ContentHolder onCreateContentViewWithPos(ViewGroup parent, int position, int viewType)
	{
		NodeHolder contentHolder = new NodeHolder();
		//LogUtils.d("HippyListView", "onCreateContentViewWithPos start position " + position);
		RenderNode contentViewRenderNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()).getChildAt(position);
		contentViewRenderNode.setLazy(false);
		View view = contentViewRenderNode.createViewRecursive();
		contentHolder.mContentView = view;
		if (view instanceof HippyPullHeaderView) {
			((HippyPullHeaderView)view).setParentView(mParentRecyclerView);
		}
		if (view instanceof HippyPullFooterView) {
			((HippyPullFooterView)view).setParentView(mParentRecyclerView);
		}
		contentHolder.mBindNode = contentViewRenderNode;
		contentHolder.isCreated = true;
		//LogUtils.d("HippyListView", "onCreateContentViewWithPos end position " + position);
		//LogUtils.d("HippyListView", "onCreateContentViewWithPos" + contentViewRenderNode);
		return contentHolder;
	}


	@Override
	protected void onViewAbandon(RecyclerView.ViewHolderWrapper viewHolder)
	{
		// set is lazy true the holder is delete so delete view
		NodeHolder nodeHolder = (NodeHolder) viewHolder.mContentHolder;

		if (nodeHolder.mBindNode != null && !nodeHolder.mBindNode.isDelete())
		{
			//LogUtils.d("HippyListView", "onViewAbandon start " + nodeHolder.mBindNode.toString());
			nodeHolder.mBindNode.setLazy(true);
			RenderNode parentNode = nodeHolder.mBindNode.getParent();
			if (parentNode != null)
			{
				mHippyContext.getRenderManager().getControllerManager().deleteChild(parentNode.getId(), nodeHolder.mBindNode.getId());
			}
			//LogUtils.d("HippyListView", "onViewAbandon end " + nodeHolder.mBindNode.toString());
		}
		if (nodeHolder.mBindNode instanceof ListItemRenderNode)
		{
			//LogUtils.d("HippyListView", "onViewAbandon start " + nodeHolder.mBindNode.toString());
			((ListItemRenderNode) nodeHolder.mBindNode).setRecycleItemTypeChangeListener(null);
		}
		super.onViewAbandon(viewHolder);
	}

	@Override
	public void onBindContentView(ContentHolder holder, int position, int layoutType)
	{
		NodeHolder contentHolder = (NodeHolder) holder;
		//LogUtils.d("HippyListView", "onBindContentView : " + position);
		if (contentHolder.isCreated)
		{
			contentHolder.mBindNode.updateViewRecursive();
//			mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG," onBindContentView updateViewRecursive");
			contentHolder.isCreated = false;
		}
		else
		{
			//step 1: diff
			contentHolder.mBindNode.setLazy(true);
			RenderNode toNode = null;
			try
			{
				toNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()).getChildAt(position);
			}
			catch (Throwable e)
			{
				LogUtils.d("HippyListAdapter", "onBindContentView: " + e.getMessage());
			}
			//保护下
			if (toNode == null)
				return;
			toNode.setLazy(false);

			//LogUtils.d("HippyListView", "toNode: " + toNode.toString());
//			mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG, "toNode: " + toNode.toString());
			//LogUtils.d("HippyListView", "fromNode: " + contentHolder.mBindNode.toString());
//			mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG,"fromNode: " + contentHolder.mBindNode.toString());

			ArrayList<DiffUtils.PatchType> patchTypes = DiffUtils.diff(contentHolder.mBindNode, toNode);
			//LogUtils.d("HippyListView", " DiffUtils.diff  position: " + position);

//			for (DiffUtils.PatchType patchType : patchTypes)
//			{
//				LogUtils.d("HippyListView", patchType.mPatch.toString());
////				mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG, patchType.mPatch.toString());
//			}

			//step:2 delete unUseful views
			DiffUtils.deleteViews(mHippyContext.getRenderManager().getControllerManager(), patchTypes);
			//LogUtils.d("HippyListView", " deleteViews  position: " + position);
//			mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG, " deleteViews  position: " + position);
			//step:3 replace id
			DiffUtils.replaceIds(mHippyContext.getRenderManager().getControllerManager(), patchTypes);
			//LogUtils.d("HippyListView", " replaceIds  position: " + position);
//			mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG, " replaceIds  position: " + position);
			//step:4 create view is do not  reUse
			DiffUtils.createView(patchTypes);
			//LogUtils.d("HippyListView", " createView  position: " + position);
//			mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG, " createView  position: " + position);
			//step:5 patch the dif result
			DiffUtils.doPatch(mHippyContext.getRenderManager().getControllerManager(), patchTypes);
			//LogUtils.d("HippyListView", " doPatch  position: " + position);
//			mHippyContext.getGlobalConfigs().getLogAdapter().log(TAG, " doPatch  position: " + position);

			contentHolder.mBindNode = toNode;
		}
		if (contentHolder.mBindNode instanceof ListItemRenderNode)
		{
			((ListItemRenderNode) contentHolder.mBindNode).setRecycleItemTypeChangeListener(this);
		}
	}


	@Override
	public boolean hasCustomRecycler()
	{
		return true;
	}

	RecyclerViewBase.ViewHolder findBestHolderRecursive(int position, int targetType, RecyclerViewBase.Recycler recycler)
	{
		RecyclerViewBase.ViewHolder matchHolder = getScrapViewForPositionInner(position, targetType, recycler);
		if (matchHolder == null)
		{
			matchHolder = recycler.getViewHolderForPosition(position);
		}

		if (matchHolder != null && ((NodeHolder) matchHolder.mContentHolder).mBindNode.isDelete())
		{
			matchHolder = findBestHolderRecursive(position, targetType, recycler);
		}

		return matchHolder;
	}

	ArrayList<RecyclerViewBase.ViewHolder>	mListViewHolder;

	public int getRecyclerItemCount()
	{
		mListViewHolder = new ArrayList<>();

		RecyclerViewBase.Recycler recycler = mParentRecyclerView.getRecycler();

		mListViewHolder.addAll(recycler.mAttachedScrap);

		mListViewHolder.addAll(recycler.mCachedViews);

		for (int i = 0; i < recycler.getRecycledViewPool().mScrap.size(); i++)
		{
			mListViewHolder.addAll(recycler.getRecycledViewPool().mScrap.valueAt(i));
		}
		return mListViewHolder.size() + mParentRecyclerView.getChildCount();
	}

	View getRecyclerItemView(int index)
	{
		if (index < mListViewHolder.size())
		{
			return mListViewHolder.get(index).mContent;
		}
		else
		{
			return mParentRecyclerView.getChildAt(index - mListViewHolder.size());
		}

	}

	@Override
	public RecyclerViewBase.ViewHolder findBestHolderForPosition(int position, RecyclerViewBase.Recycler recycler)
	{
		LogUtils.d("HippyListView", "findBestHolderForPosition start : " + position);
		mRecycler = recycler;
		int targetType = getItemViewType(position);
		RecyclerViewBase.ViewHolder matchHolder = findBestHolderRecursive(position, targetType, recycler);
		LogUtils.d("HippyListView", "findBestHolderForPosition end : " + position);
		return matchHolder;
	}

	@Override
	public RecyclerViewBase.ViewHolder findSuspendHolderForPosition(int position, RecyclerViewBase.Recycler recycler)
	{
		mRecycler = recycler;
		int targetType = getItemViewType(position);
		RecyclerViewBase.ViewHolder matchHolder = getScrapViewForPositionInner(position, targetType, recycler);
		if (matchHolder != null && ((NodeHolder) matchHolder.mContentHolder).mBindNode.isDelete())
		{
			return null;
		}
		return matchHolder;
	}

	private RecyclerViewBase.ViewHolder getScrapViewForPositionInner(int position, int type, RecyclerViewBase.Recycler recycler)
	{
		if (mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()) == null
				|| mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()).getChildCount() <= position)
		{
			return null;
		}
		final int scrapCount = recycler.mAttachedScrap.size();
		// Try first for an exact, non-invalid match from scrap.
		for (int i = 0; i < scrapCount; i++)
		{
			final RecyclerViewBase.ViewHolder holder = recycler.mAttachedScrap.get(i);
			if (holder.getPosition() == position && !holder.isInvalid() && (!holder.isRemoved()))
			{
				if (holder.getItemViewType() == type && holder.mContentHolder instanceof NodeHolder)
				{
					RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
					RenderNode toNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()).getChildAt(position);
					if (holderNode == toNode)
					{
						recycler.mAttachedScrap.remove(i);
						holder.setScrapContainer(null);
						return holder;
					}
				}
			}
		}
		// Search in our first-level recycled view cache.
		final int cacheSize = recycler.mCachedViews.size();
		for (int i = 0; i < cacheSize; i++)
		{
			final RecyclerViewBase.ViewHolder holder = recycler.mCachedViews.get(i);
			if (holder.getPosition() == position && holder.getItemViewType() == type && !holder.isInvalid()
					&& holder.mContentHolder instanceof NodeHolder)
			{
				RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
				RenderNode toNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()).getChildAt(position);
				if (holderNode == toNode)
				{
					recycler.mCachedViews.remove(i);
					return holder;
				}
			}
		}
		// Give up. Head to the shared pool.
		return this.getRecycledViewFromPoolInner(recycler.getRecycledViewPool(), type, position);
	}

	private RecyclerViewBase.ViewHolder getRecycledViewFromPoolInner(RecyclerViewBase.RecycledViewPool pool, int viewType, int position)
	{
		if (pool != null)
		{
			final ArrayList<RecyclerViewBase.ViewHolder> scrapHeap = pool.mScrap.get(viewType);
			if (scrapHeap != null && !scrapHeap.isEmpty())
			{
				// traverse all scrap
				for (RecyclerViewBase.ViewHolder holder : scrapHeap)
				{
					if (holder.getItemViewType() == viewType && holder.mContentHolder instanceof NodeHolder)
					{
						RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
						RenderNode toNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()).getChildAt(position);
						if (holderNode == toNode)
						{
							scrapHeap.remove(holder);
							return holder;
						}
					}
				}
			}
		}
		return null;
	}

	private void checkHolderType(int oldType, int newType, ListItemRenderNode listItemRenderNode)
	{
		//do checkHolderType onScreen
		int count = mParentRecyclerView.getChildCount();
		for (int i = 0; i < count; i++)
		{
			final RecyclerViewBase.ViewHolder holder = mParentRecyclerView.getChildViewHolder(mParentRecyclerView.getChildAt(i));
			if (holder.getItemViewType() == oldType && holder.mContentHolder instanceof NodeHolder)
			{
				RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
				if (holderNode == listItemRenderNode)
				{
					holder.setItemViewType(newType);
					return;
				}
			}
		}

		//do checkHolderType inCache
		final int scrapCount = mRecycler.mAttachedScrap.size();
		// Try first for an exact, non-invalid match from scrap.
		for (int i = 0; i < scrapCount; i++)
		{
			final RecyclerViewBase.ViewHolder holder = mRecycler.mAttachedScrap.get(i);

			if (holder.getItemViewType() == oldType && holder.mContentHolder instanceof NodeHolder)
			{
				RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
				if (holderNode == listItemRenderNode)
				{
					holder.setItemViewType(newType);
					return;
				}
			}
		}

		// Search in our first-level recycled view cache.
		final int cacheSize = mRecycler.mCachedViews.size();
		for (int i = 0; i < cacheSize; i++)
		{
			final RecyclerViewBase.ViewHolder holder = mRecycler.mCachedViews.get(i);
			if (holder.getItemViewType() == oldType && holder.mContentHolder instanceof NodeHolder)
			{
				RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
				if (holderNode == listItemRenderNode)
				{
					holder.setItemViewType(newType);
					return;
				}
			}
		}

		// Give up. Head to the shared pool.
		if (mRecycler.getRecycledViewPool() != null)
		{
			final ArrayList<RecyclerViewBase.ViewHolder> scrapHeap = mRecycler.getRecycledViewPool().mScrap.get(oldType);
			if (scrapHeap != null && !scrapHeap.isEmpty())
			{
				// traverse all scrap
				for (RecyclerViewBase.ViewHolder holder : scrapHeap)
				{
					if (holder.getItemViewType() == oldType && holder.mContentHolder instanceof NodeHolder)
					{
						RenderNode holderNode = ((NodeHolder) holder.mContentHolder).mBindNode;
						if (holderNode == listItemRenderNode)
						{
							holder.setItemViewType(newType);
							scrapHeap.remove(holder);
							mRecycler.getRecycledViewPool().getScrapHeapForType(newType).add(holder);
							return;
						}
					}
				}
			}
		}
	}

	@Override
	public int getCustomHeaderViewWidth()
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null && listNode.getChildCount() > 0) {
			RenderNode listItemNode = listNode.getChildAt(0);
			if (listItemNode instanceof PullHeaderRenderNode) {
				return listItemNode.getWidth();
			}
		}

		return 0;
	}

	@Override
	public int getCustomFooterViewWidth()
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null && listNode.getChildCount() > 0) {
			RenderNode listItemNode = listNode.getChildAt(listNode.getChildCount() - 1);
			if (listItemNode instanceof PullFooterRenderNode) {
				return listItemNode.getWidth();
			}
		}

		return 0;
	}

	@Override
	public int getCustomHeaderViewHeight()
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null && listNode.getChildCount() > 0) {
			RenderNode listItemNode = listNode.getChildAt(0);
			if (listItemNode instanceof PullHeaderRenderNode) {
				return listItemNode.getHeight();
			}
		}

		return 0;
	}

	@Override
	public int getCustomFooterViewHeight()
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null && listNode.getChildCount() > 0) {
			RenderNode listItemNode = listNode.getChildAt(listNode.getChildCount() - 1);
			if (listItemNode instanceof PullFooterRenderNode) {
				return listItemNode.getHeight();
			}
		}

		return 0;
	}

	@Override
	public int getItemHeight(int index)
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null && listNode.getChildCount() > index && index >= 0)
		{
			RenderNode listItemNode = listNode.getChildAt(index);
			if (listItemNode != null)
			{
				return listItemNode.getHeight();
			}
		}
		return 0;
	}

	@Override
	public int getItemWidth(int index)
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null && listNode.getChildCount() > index && index >= 0)
		{
			RenderNode listItemNode = listNode.getChildAt(index);
			if (listItemNode != null)
			{
				return listItemNode.getWidth();
			}
		}
		return 0;
	}

	@Override
	public int getTotalHeight()
	{
		if (isAutoCalculateItemHeight())
		{
			mContentHeight = -1;
		}
		if (mContentHeight == -1)
		{
			int itemCount = getItemCount();
			mContentHeight = 0;

			if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_LIST)
			{
				for (int i = 0; i < itemCount; i++)
				{
					if (mParentRecyclerView.mLayout.canScrollHorizontally()) {
						mContentHeight += getItemWidth(i);
						mContentHeight += getItemMaigin(LOCATION_LEFT, i);
						mContentHeight += getItemMaigin(LOCATION_RIGHT, i);
					} else {
						mContentHeight += getItemHeight(i);
						mContentHeight += getItemMaigin(LOCATION_TOP, i);
						mContentHeight += getItemMaigin(LOCATION_BOTTOM, i);
					}
				}
			}
		}

		int footerViewSize = mParentRecyclerView.mLayout.canScrollHorizontally() ?
				getCustomFooterViewWidth() : getCustomFooterViewHeight();
		return mContentHeight - footerViewSize;
	}

	@Override
	public int getItemCount()
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null)
		{
			return listNode.getChildCount();
		}
		return super.getItemCount();
	}

	@Override
	public int getItemViewType(int index)
	{
		RenderNode listViewNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listViewNode != null && listViewNode.getChildCount() > index)
		{
			RenderNode listItemNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId()).getChildAt(index);
			if (listItemNode != null)
			{
				if (listItemNode instanceof PullFooterRenderNode) {
					return RecyclerViewBase.ViewHolder.TYPE_CUSTOM_FOOTER;
				}

				if (listItemNode instanceof PullHeaderRenderNode) {
					return RecyclerViewBase.ViewHolder.TYPE_CUSTOM_HEADERE;
				}

				if (listItemNode.getProps() != null) {
					HippyMap listItemProps = listItemNode.getProps();
					if (listItemProps.get(ListItemRenderNode.ITEM_VIEW_TYPE) != null)
					{
						return listItemProps.getInt(ListItemRenderNode.ITEM_VIEW_TYPE);
					}
				}
			}
		}
		return super.getItemViewType(index);
	}

	@Override
	public boolean isSuspentedItem(int pos)
	{
		RenderNode listNode = mHippyContext.getRenderManager().getRenderNode(mParentRecyclerView.getId());
		if (listNode != null && listNode.getChildCount() > pos)
		{
			RenderNode listItemNode = listNode.getChildAt(pos);
			if (listItemNode instanceof ListItemRenderNode)
			{
				return ((ListItemRenderNode) listItemNode).shouldSticky();
			}
		}
		return super.isSuspentedItem(pos);
	}

	@Override
	public boolean isAutoCalculateItemHeight()
	{
		return true;
	}

	@Override
	public void onRecycleItemTypeChanged(int oldType, int newType, ListItemRenderNode listItemNode)
	{
		checkHolderType(oldType, newType, listItemNode);
	}

	@Override
	public void notifyEndReached() {
		getOnEndReachedEvent().send(mParentRecyclerView, null);
		getOnLoadMoreEvent().send(mParentRecyclerView, null);
	}

	@Override
	public int getPreloadThresholdInItemNumber()
	{
		return mPreloadItemNum;
	}

	@Override
	public void onPreload() {
		getOnEndReachedEvent().send(mParentRecyclerView, null);
		getOnLoadMoreEvent().send(mParentRecyclerView, null);
	}

	protected void setPreloadItemNumber(int preloadItemNum)
	{
		mPreloadItemNum = preloadItemNum;
	}

	protected HippyViewEvent getOnEndReachedEvent() {
		if (onEndReachedEvent == null) {
			onEndReachedEvent = new HippyViewEvent("onEndReached");
		}
		return onEndReachedEvent;
	}

	protected HippyViewEvent getOnLoadMoreEvent() {
		if (onLoadMoreEvent == null) {
			onLoadMoreEvent = new HippyViewEvent("onLoadMore");
		}
		return onLoadMoreEvent;
	}
}
