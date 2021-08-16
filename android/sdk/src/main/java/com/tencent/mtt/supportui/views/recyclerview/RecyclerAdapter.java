package com.tencent.mtt.supportui.views.recyclerview;

import static com.tencent.mtt.supportui.views.recyclerview.RecyclerViewItem.ITEM_VIEW_DEFAULT_HEIGHT;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import android.util.Log;
import android.util.SparseIntArray;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public abstract class RecyclerAdapter extends RecyclerViewBase.Adapter<RecyclerView.ViewHolderWrapper> implements View.OnClickListener
{
	/* private */static final String	TAG				= "RecyclerAdapter";
	public View							mDefaultLoadingView;
	public int							mLoadingStatus	= IRecyclerViewFooter.LOADING_STATUS_NONE;
	/* private */ DataHolder			mRoot;
	// edit mode related
	// click related
	protected RecyclerViewItemListener	mRecyclerViewItemListener;

	// data related
	/* private */ ArrayList<DataHolder>	mDataList		= new ArrayList<DataHolder>();
	protected int						mContentHeight	= -1;
	SparseIntArray						mOffsetMap		= null;

	public RecyclerView					mParentRecyclerView;

	//	public ArrayList<Integer> mItemHeightList = null;
	public ArrayList<Integer>			mItemWidthList	= null;

	public boolean isAutoCalculateItemHeight()
	{
		return false;
	}

	public static class DataHolder /* implements Comparable<DataHolder> */
	{
		public int		mItemViewType	= 0;
		public int		mItemHeight		= ITEM_VIEW_DEFAULT_HEIGHT;
		public Object	mData			= null;
		/*
		 * the value of mItemViewStyle is one of the following :
		 * QBViewResourceManager.CARD_ITEM_TYPE_TOP
		 * QBViewResourceManager.CARD_ITEM_TYPE_MIDDLE
		 * QBViewResourceManager.CARD_ITEM_TYPE_BOTTOM
		 * QBViewResourceManager.CARD_ITEM_TYPE_FULL
		 * QBViewResourceManager.DEFAULT_ITEM
		 * 0
		 */
		public int		mItemViewStyle	= 0;
		public int		mTopMargin		= 0;
		public int		mBottomMargin	= 0;
		public int		mLeftMargin		= 0;
		public int		mRightMargin	= 0;
		public boolean	mHasDivider		= true;

		// public int mStartOffset = 0;

		// public int getItemHeight()
		// {
		// return mItemHeight + mTopMargin + mBottomMargin;
		// }
		//
		// public int getEndOffset()
		// {
		// return mStartOffset + getItemHeight();
		// }

		// @Override
		// public int compareTo(DataHolder another)
		// {
		// // TODO Auto-generated method stub
		// if (another == null)
		// {
		// return -1;
		// }
		// int height = getItemHeight();
		// if (mStartOffset > another.mStartOffset)
		// {
		// return 1;
		// }
		// else if (mStartOffset + height < another.mStartOffset)
		// {
		// return -1;
		// }
		// else
		// {
		// return 0;
		// }
	}

	public final void addData(DataHolder newData)
	{

		if (newData != null)
		{
			mDataList.add(newData);
			mContentHeight = -1;
		}
	}

	public int indexOf(DataHolder data)
	{
		int index = -1;
		index = mDataList.indexOf(data);
		return index;
	}

	public final void appendData(ArrayList<DataHolder> newDatas)
	{
		if (newDatas != null && !newDatas.isEmpty())
		{
			mDataList.addAll(newDatas);
			mContentHeight = -1;
		}
	}

	public final void insertData(DataHolder newData, int index)
	{
		if (index >= 0 && newData != null && mDataList.size() >= index)
		{
			mDataList.add(index, newData);
			mContentHeight = -1;
		}
	}

	/* private */int itemRangeCompare(int item, int offset, int target)
	{
		int height = getItemRange(item);
		if (offset > target)
		{
			return 1;
		}
		else if (offset + height < target)
		{
			return -1;
		}
		else
		{
			return 0;
		}
	}

	/* private */int binarySearch(SparseIntArray array, int key)
	{
//		Log.d("leo", "key=" + key);
		if (array == null || array.size() == 0)
		{
			return -1;
		}
		int low = array.keyAt(0);
		int high = array.keyAt(array.size() - 1);// position
		while (low <= high)
		{
			int middle = low + ((high - low) >> 1);
			int middleValue = array.valueAt(middle);
			int res = itemRangeCompare(middle, middleValue, key);
			if (res == 0)
			{
				return middle;
			}
			else if (res > 0)
			{
				high = middle - 1;
			}
			else
			{
				low = middle + 1;
			}
		}
		return -1;
	}

	protected int getItemRange(int pos)
	{
		int dividerH = 0;
		return getItemHeight(pos) + getItemMaigin(LOCATION_TOP, pos) + getItemMaigin(LOCATION_BOTTOM, pos) + dividerH;
	}

	public int[] getBeginPositionWithOffset(int targetOffset)
	{

		int[] result = new int[2];
		int count = getItemCount() + getFooterViewCount();
		int i = 0;
		int headerHeight = 0;
		int headerCount = getHeaderViewCount();
		int totalHeight = mParentRecyclerView.getCachedTotalHeight();
		for (i = 1; i <= headerCount; i++)
		{
			headerHeight += getHeaderViewHeight(i);
		}
//		Log.d("leo", "targetOffset=" + targetOffset + ",headerH=" + headerHeight + ",totalHeight=" + totalHeight);

		if (targetOffset >= totalHeight)
		{
			result[0] = count;
			result[1] = totalHeight - getItemHeight(count) - targetOffset;
		}
		else if (targetOffset < 0)
		{
			result[0] = -headerCount;
			result[1] = -headerHeight - targetOffset;
		}
		else if (targetOffset < headerHeight)
		{
			// Log.e("leo", "header");
			int sum = 0;
			boolean found = false;
			for (int j = -headerCount; j < 0; j++)
			{
				sum += getHeaderViewHeight(-j);
				if (sum > targetOffset)
				{
					result[0] = j;
					found = true;
					result[1] = sum - getHeaderViewHeight(-j) - targetOffset;
					break;
				}
			}
			if (!found)
			{
//				Log.e("leo", "should not happened!");
			}
		}
		else
		{
			// if (mDataList != null && !mDataList.isEmpty())
			// {
			// footer
			calculateOffsetMapIfNeed();
			final int lastPos = /* mDataList.size() - 1 */mOffsetMap.size() - 1;
			// DataHolder lastHolder = mDataList.get(lastPos);
			final int lastOffset = /* lastHolder.getEndOffset() */mOffsetMap.get(lastPos) + getItemRange(lastPos);
			// Log.d("leo", "lastOffset=" + lastOffset);
			if (targetOffset > lastOffset)
			{
				int sum = lastOffset;
				int footerCount = getFooterViewCount();
				boolean found = false;
				if (footerCount > 0)
				{
					int k;
					for (k = 1; k <= footerCount; k++)
					{
						sum += getFooterViewHeight(k);
						if (sum > targetOffset)
						{
							result[0] = lastPos + k;
							found = true;
							result[1] = sum - getFooterViewHeight(k) - targetOffset;
							break;
						}
					}
					if (!found)
					{
						result[0] = lastPos + k;
						result[1] = sum - getFooterViewHeight(k) - targetOffset;
//						Log.e("leo", "should not happened!");
					}
				}
				// Log.d("leo", "footer,result=" + result[0] + "," +
				// result[1]);
				return result;
			}
			// Log.d("TMYBINARY", "normal");
			// targetOffset -= headerHeight;
			// DataHolder key = new DataHolder();
			// key.mStartOffset = targetOffset;
			int hit = binarySearch(mOffsetMap, targetOffset);
			if (targetOffset == 0)
			{
				hit = 0;
			}
			if (hit != -1)
			{
				// DataHolder hitHolder = mDataList.get(hit);
				int hitValue = mOffsetMap.get(hit);
				// if (hitHolder != null)
				// {
				if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_GRID)
				{
					// 向前查找第一个等高条目
					while (--hit >= 0)
					{
						// DataHolder prev = mDataList.get(hit);
						int prev = mOffsetMap.get(hit);
						if (prev != hitValue)
						{
							break;
						}
					}
					result[0] = hit + 1;
				}
				else if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_LIST)
				{
					result[0] = hit;
				}
				else if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_WATERFALL)
				{
					result[0] = hit;
				}
				result[1] = hitValue - targetOffset;
				// }
			}
			// }
		}
		// Log.d("leo", "result=" + result[0] + "," + result[1]);
		return result;
	}

	public int getHeightBefore(int pos)
	{

		int sum = 0;
		// TODO 瀑布流调用 @ 171215-2002 瀑布流直接重载getHeightBefore
		//		if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_WATERFALL)
		//		{
		//			int columnHeights[] = mParentRecyclerView.calculateColumnHeightsBefore(pos, false);
		//			sum = columnHeights[mParentRecyclerView.getShortestColumnIndex(columnHeights)];
		//			return sum;
		//		}

		int count = getHeaderViewCount();
		if (pos < -count)
		{
			throw new IllegalStateException("pos less than header count,should not happened");
		}
		if (pos >= 0)
		{
			calculateOffsetMapIfNeed();
			sum = mOffsetMap.get(pos);
		}
		else
		{
			for (int i = -count; i < pos; i++)
			{
				sum += getHeaderViewHeight(-i);
			}
		}
//		Log.d("leo", "getHeightBefore:pos=" + pos + ",result=" + sum);
		return sum;
	}

	public final void insertData(ArrayList<DataHolder> newDatas, int index, int counts)
	{
		if (index >= 0 && counts > 0 && newDatas != null && !newDatas.isEmpty() && mDataList.size() >= index)
		{
			ArrayList<DataHolder> oldList = mDataList;
			mDataList = new ArrayList<DataHolder>();
			mDataList.addAll(oldList.subList(0, index));
			mDataList.addAll(newDatas);
			mDataList.addAll(oldList.subList(index, oldList.size()));

			mContentHeight = -1;
		}
	}


	public void removeData(int index, int counts)
	{
		if (mDataList.size() >= (index + counts) && index >= 0 && counts > 0)
		{
			mDataList.subList(index, index + counts).clear();
			mContentHeight = -1;
		}
	}

	public void clearData()
	{
		mDataList.clear();
		mContentHeight = -1;
	}

	public void removeDatas(int type)
	{
		ArrayList<DataHolder> removedList = new ArrayList<DataHolder>();
		for (DataHolder data : mDataList)
		{
			if (data.mItemViewType == type)
			{
				removedList.add(data);
			}
		}
		mDataList.removeAll(removedList);
		mContentHeight = -1;
	}

	public ArrayList<DataHolder> getDataHolderList()
	{
		return new ArrayList<DataHolder>(mDataList);
	}

	public final DataHolder getDataHolder(int index)
	{
		try
		{
			if (mDataList.size() > index && index >= 0)
			{
				return mDataList.get(index);
			}
		}
		catch (Exception e)
		{
		}
		return null;
	}

	public int getItemHeight(int index)
	{
		try
		{
			if (mDataList.size() > index && index >= 0)
			{
				return mDataList.get(index).mItemHeight;
			}
			//			if (isAutoCalculateItemHeight() && mItemHeightList != null && mItemHeightList.size() > index && index >= 0)
			//			{
			//				int itemGap = 0;
			//				if (mParentRecyclerView != null)
			//				{
			//					RecyclerViewBase.LayoutManager layoutManager = mParentRecyclerView.getLayoutManager();
			//					if (layoutManager != null)
			//					{
			//						// TODO 瀑布流调用 @171215-2014
			//						//                        if (layoutManager instanceof WaterFallLayoutManager)
			//						//                        {
			//						//                            itemGap = ((WaterFallLayoutManager) layoutManager).getItemGap();
			//						//                        }
			//					}
			//				}
			//
			//				return mItemHeightList.get(index) + itemGap;
			//			}
			return 0;
		}
		catch (Exception e)
		{
			return 0;
		}
	}

	public int getItemWidth(int index)
	{
		try
		{
			if (isAutoCalculateItemHeight() && mItemWidthList != null && mItemWidthList.size() > index && index >= 0)
			{
				return mItemWidthList.get(index);
			}
			return 0;
		}
		catch (Exception e)
		{
			return 0;
		}
	}

	public int getItemOffset(int position)
	{
		if (mOffsetMap != null)
		{
			return mOffsetMap.get(position);
		}
		return -1;
	}

	public void setItemOffset(int index, int value)
	{
		if (mOffsetMap != null)
		{
			mOffsetMap.put(index, value);
		}
	}

	@Override
	public void reset()
	{
		// TODO Auto-generated method stub
		mContentHeight = -1;
		dataChanged();
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
			//			Log.e("leo", "getTotalHeight mContentHeight " + mContentHeight);
			int itemCount = getItemCount();
			mContentHeight = 0;
			// TODO grid流调用
			//            if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_GRID)
			//            {
			//                if (mParentRecyclerView.mLayout instanceof GridLayoutManager)
			//                {
			//                    GridLayoutManager layoutManager = (GridLayoutManager) (mParentRecyclerView.mLayout);
			//                    for (int i = 0; i < itemCount; i++)
			//                    {
			//                        if (i % layoutManager.mColumns == 0)
			//                        {
			//                            int itemTotalHeihgt = getItemHeight(i) + getItemMaigin(LOCATION_TOP, i) + getItemMaigin(LOCATION_BOTTOM, i);
			//                            mContentHeight += itemTotlaHeihgt;
			//                        }
			//                    }
			//                }
			//                else
			//                {
			//                    mContentHeight = 0;
			//                }
			//            }
			if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_LIST)
			{
				for (int i = 0; i < itemCount; i++)
				{
					//					Log.e("leo", "getTotalHeight " + getItemHeight(i) + ", " + i);
					mContentHeight += getItemHeight(i);
					mContentHeight += getItemMaigin(LOCATION_TOP, i);
					mContentHeight += getItemMaigin(LOCATION_BOTTOM, i);

				}
			}
			// TODO 瀑布流调用 @171215-2016
			else if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_WATERFALL)
			{
				//                int columnHeights[] = mParentRecyclerView.calculateColumnHeightsBefore(getItemCount(), false);
				//                int heightestColumnIndex = 0;
				//                for (int j = 0; j < columnHeights.length; j++)
				//                {
				//                    if (columnHeights[heightestColumnIndex] < columnHeights[j])
				//                    {
				//                        heightestColumnIndex = j;
				//                    }
				//                }
				//                mContentHeight = columnHeights[heightestColumnIndex];
				//	... 瀑布流直接重载getTotalHeight
			}
		}
//		Log.e("leo", hashCode() + "getTotalHeight,height=" + mContentHeight + ",from=");
		//		Log.e("leo", "getTotalHeight mContentHeight after " + mContentHeight);
		// Log.d("leo", DebugUtils.printStackTrack(500));
		return mContentHeight;
	}

	@Override
	public int getItemMaigin(int location, int position)
	{
		int margin = 0;
		// int cardType = getCardItemViewType(position);
		if (position < mDataList.size() && position >= 0)
		{
			try
			{
				DataHolder data = mDataList.get(position);
				switch (location)
				{
					case LOCATION_LEFT:
						margin = data.mLeftMargin;
						break;
					case LOCATION_TOP:
						// if (cardType ==
						// QBViewResourceManager.CARD_ITEM_TYPE_TOP
						// || cardType ==
						// QBViewResourceManager.CARD_ITEM_TYPE_FULL)
						// {
						// data.mTopMargin = 50;
						// }
						margin = data.mTopMargin;
						break;
					case LOCATION_RIGHT:
						margin = data.mRightMargin;
						break;
					case LOCATION_BOTTOM:
						// if (cardType ==
						// QBViewResourceManager.CARD_ITEM_TYPE_BOTTOM ||
						// cardType
						// == QBViewResourceManager.CARD_ITEM_TYPE_FULL)
						// {
						// margin = 50;
						// }
						margin = data.mBottomMargin;
						break;
				}
			}
			catch (Exception e)
			{

			}
		}
		return margin;
	}

	@Override
	public int getItemCount()
	{
		return mDataList.size();
	}

	public final boolean hasData()
	{
		return !mDataList.isEmpty();
	}

	@Override
	public int getItemViewType(int index)
	{
		try
		{
			if (mDataList.size() > index && index >= 0)
			{
				return mDataList.get(index).mItemViewType;
			}
			return super.getItemViewType(index);
		}
		catch (Exception e)
		{
			return 0;
		}
	}

	@Override
	public int getCardItemViewType(int index)
	{
		try
		{
			if (mDataList.size() > index && index >= 0)
			{
				return mDataList.get(index).mItemViewStyle;
			}
			return super.getCardItemViewType(index);
		}
		catch (Exception e)
		{
			return 0;
		}
	}

	public RecyclerAdapter(RecyclerView recyclerView)
	{
		mParentRecyclerView = recyclerView;
	}

	public void setParentRecyclerView(RecyclerView recyclerView)
	{
		mParentRecyclerView = recyclerView;
	}

	public void setItemClickListener(RecyclerViewItemListener qBItemClickListener)
	{
		mRecyclerViewItemListener = qBItemClickListener;
	}

	public RecyclerViewItemListener getItemClickListener()
	{
		return mRecyclerViewItemListener;
	}

	public void onEnterModeStart(int mode)
	{

	}

	protected RecyclerViewItem getViewItem(RecyclerViewBase parent)
	{
		return mParentRecyclerView.createViewItem();
		// the layout type of recycler view is list
		// else the layout type of recycler view is grid or waterfall
		//		if (mParentRecyclerView.mLayoutType == RecyclerView.LAYOUT_TYPE_LIST)
		//		{
		//			v = new QBListViewItem(parent.getContext(), (QBRecyclerView) parent, parent.mQBViewResourceManager.mSupportSkin);
		//		}
		//		else if (mParentRecyclerView.mLayoutType == RecyclerView.LAYOUT_TYPE_GRID
		//				|| mParentRecyclerView.mLayoutType == RecyclerView.LAYOUT_TYPE_WATERFALL)
		//		{
		//			v = new QBGridViewItem(parent.getContext(), (QBRecyclerView) parent);
		//		}

//		return v;
	}

	protected RecyclerViewItem getViewItemWithPos(RecyclerViewBase parent, int position)
	{
		return getViewItem(parent);
	}

	@Override
	public RecyclerView.ViewHolderWrapper onCreateViewHolderWithPos(RecyclerViewBase parent, int position, int viewType)
	{
		RecyclerViewItem v = getViewItemWithPos(parent, position);

		ContentHolder contentHolder = onCreateContentViewWithPos(v, position, viewType);
		if (contentHolder == null)
			return null;
		if (v != null)
		{
			v.addContentView(contentHolder.mContentView, false);
			v.setPadding(contentHolder.mItemPaddingLeft, 0, contentHolder.mItemPaddingRight, 0);
		}
		RecyclerView.ViewHolderWrapper h = new RecyclerView.ViewHolderWrapper(v, parent);
		h.setContentHolder(contentHolder);
		return h;
	}

	@Override
	public RecyclerView.ViewHolderWrapper onCreateSuspendViewHolderWithPos(RecyclerViewBase parent, int position, int viewType)
	{
		return null;
	}

	@Override
	public RecyclerView.ViewHolderWrapper onCreateViewHolder(RecyclerViewBase parent, int viewType)
	{
		RecyclerViewItem v = null;
		// the layout type of recycler view is list
		// else the layout type of recycler view is grid or waterfall
		//		if (mParentRecyclerView.mLayoutType == RecyclerView.LAYOUT_TYPE_LIST)
		//		{
		//			v = new QBListViewItem(parent.getContext(), (QBRecyclerView) parent, parent.mQBViewResourceManager.mSupportSkin);
		//		}
		//		else if (mParentRecyclerView.mLayoutType == RecyclerView.LAYOUT_TYPE_GRID
		//				|| mParentRecyclerView.mLayoutType == RecyclerView.LAYOUT_TYPE_WATERFALL)
		//		{
		//			v = new QBGridViewItem(parent.getContext(), (QBRecyclerView) parent);
		//		}
		v = getViewItem(parent);

		ContentHolder contentHolder = onCreateContentView(v, viewType);
		if (contentHolder == null)
		{
			return null;
		}
		if (v != null)
		{
			v.addContentView(contentHolder.mContentView, false);
			v.setPadding(contentHolder.mItemPaddingLeft, 0, contentHolder.mItemPaddingRight, 0);
		}
		RecyclerView.ViewHolderWrapper h = new RecyclerView.ViewHolderWrapper(v, parent);
		h.setContentHolder(contentHolder);
		contentHolder.mParentViewHolder = h;
		return h;
	}


	public ContentHolder onCreateContentView(ViewGroup parent, int viewType)
	{
		return null;
	}

	public ContentHolder onCreateContentViewWithPos(ViewGroup parent, int position, int viewType)
	{
		return null;
	}

	public View onCreateCustomerView(ViewGroup parent, int viewType)
	{
		return null;
	}

	@Override
	public void onBindViewHolder(final RecyclerView.ViewHolderWrapper holder, int position, int layoutType, int cardType)
	{
		if (holder == null || holder.itemView == null || holder.mContentHolder == null)
		{
			return;
		}
		holder.itemView.setPressed(false);
		holder.itemView.setSelected(false);

		onBindContentView(holder.mContentHolder, position, layoutType);
		positionContentView(holder.mContentHolder, position, layoutType, false);
		onBindCustomerView(holder, position, layoutType);
		// Log.d("TMYDIVIDER", "onBindDivider,position=" + position +
		// ",dividerH=" + dividerH + ",itemH=" +
		// getDataHolder(position).mItemHeight);
		RecyclerViewBase.LayoutParams params;
		// TODO 瀑布流调用 @171218-0919
		if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_WATERFALL)
		{
			//		            ViewGroup.LayoutParams lp = holder.itemView.getLayoutParams();
			//		            params = new QBWaterFallView.LayoutParams(lp != null ? lp.width : ViewGroup.LayoutParams.MATCH_PARENT,
			//		                    getItemHeight(position) + dividerH);
			params = mParentRecyclerView.mLayout.onCreateItemLayoutParams(holder, position, layoutType, cardType);
		}
		else
		{
			if (mParentRecyclerView.mLayout.canScrollHorizontally())
			{
				params = new RecyclerViewBase.LayoutParams(getItemWidth(position), ViewGroup.LayoutParams.MATCH_PARENT);
			}
			else
			{
				params = new RecyclerViewBase.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, getItemHeight(position));
			}
		}
		params.mViewHolder = holder;
		params.topMargin = getItemMaigin(LOCATION_TOP, position);
		params.bottomMargin = getItemMaigin(LOCATION_BOTTOM, position);
		params.leftMargin = getItemMaigin(LOCATION_LEFT, position);
		params.rightMargin = getItemMaigin(LOCATION_RIGHT, position);
		holder.itemView.setLayoutParams(params);


		((RecyclerViewItem) holder.itemView).mHolder = holder;
		holder.mForceBind = holder.mContentHolder.mForceBind;
		holder.itemView.setFocusable(holder.mContentHolder.mFocusable);
		holder.itemView.setOnClickListener(new View.OnClickListener()
		{
			@Override
			public void onClick(View v)
			{
				if (v instanceof RecyclerViewItem)
				{
					if (mRecyclerViewItemListener != null)
					{
						mRecyclerViewItemListener.onItemClick(holder.itemView, holder.mPosition, holder.mContentHolder);
					}
				}
			}
		});
	}

	public void deSelecteItem(int position)
	{
		View view = mParentRecyclerView.findViewByPosition(position);
		if (view != null)
		{
			view.setSelected(false);
		}
	}

	public void deleteItem(int position)
	{
		onItemDeleted(position);
		if (mParentRecyclerView != null && doDeleteItem())
		{
			mParentRecyclerView.postAdapterUpdate(mParentRecyclerView.obtainUpdateOp(RecyclerViewBase.UpdateOp.REMOVE, position, 1));
		}
	}

	protected void onShowContextMenu(float x, float y, int position)
	{

	}

	public void positionContentView(ContentHolder holder, int position, int layoutType, boolean hasCustomView)
	{
		if (layoutType == RecyclerViewBase.LAYOUT_TYPE_GRID || layoutType == RecyclerViewBase.LAYOUT_TYPE_WATERFALL)
		{

		}
		else if (layoutType == RecyclerViewBase.LAYOUT_TYPE_LIST)
		{
			if (holder == null || holder.mContentView == null)
			{
				return;
			}
			FrameLayout.LayoutParams params = (FrameLayout.LayoutParams) holder.mContentView.getLayoutParams();
			params.gravity = Gravity.RIGHT;
			{
				params.leftMargin = 0;
				params.rightMargin = 0;
			}
		}
	}

	public void onBindContentView(ContentHolder holder, int position, int layoutType)
	{

	}

	public boolean notifyOrderChanged(int fromPosition, int toPosition)
	{
		return true;
	}

	@Override
	protected void onViewRecycled(RecyclerView.ViewHolderWrapper holder)
	{
		onViewRecycled(holder.mContentHolder, holder.mPosition);
	}

	public void onViewRecycled(ContentHolder holder, int position)
	{

	}

	@Override
	protected void onViewAbandon(RecyclerView.ViewHolderWrapper viewHolder)
	{

	}

	public void onBindCustomerView(RecyclerView.ViewHolderWrapper holder, int position, int layoutType)
	{
	}


	//	public void removeIndex(int position)
	//	{
	//	}


	public interface RecyclerViewItemListener
	{
		void onItemClickInEditMode(View view, int position, ContentHolder contentHolder);

		void onItemClick(View view, int position, ContentHolder contentHolder);

		void onCheckedChanged(View view, int position, boolean isChecked);

		boolean onItemLongClick(View view, int position);
	}

	@Override
	public int getCustomHeaderViewWidth()
	{
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int getCustomFooterViewWidth()
	{
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int getCustomHeaderViewHeight()
	{
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int getCustomFooterViewHeight()
	{
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int getHeaderViewHeight(int position)
	{
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public int getHeaderViewCount()
	{
		// TODO Auto-generated method stub
		return 0;
	}

	@Override
	public View getHeaderView(int position)
	{
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public int getFooterViewHeight(int position)
	{
		if (mLoadingStatus != IRecyclerViewFooter.LOADING_STATUS_NONE)
		{
			if (position == getFooterViewCount())
			{
				return getDefaultFooterHeight();
			}
			else
			{
				return getCustomFooterViewHeight(position);
			}
		}
		else
		{
			return getCustomFooterViewHeight(position);
		}
	}

	@Override
	public int getFooterViewCount()
	{
		if (mLoadingStatus != IRecyclerViewFooter.LOADING_STATUS_NONE)
		{
			return getCustomFooterViewCount() + 1;
		}
		else
		{
			return getCustomFooterViewCount();
		}
	}

	@Override
	public View getFooterView(int position)
	{
//		Log.d("QBRefreshHeader", "getFooterView");
		if (mLoadingStatus != IRecyclerViewFooter.LOADING_STATUS_NONE)
		{
			if (position == getFooterViewCount())
			{
				if (mDefaultLoadingView == null)
				{
//					Log.d("QBRefreshHeader", "getFooterView-->createFooterView");
					mDefaultLoadingView = mParentRecyclerView.createFooterView(mParentRecyclerView.getContext());
					//if (mDefaultLoadingView != null && mDefaultLoadingView instanceof IRecyclerViewFooter)
					//{
					//						((IRecyclerViewFooter) mDefaultLoadingView).setPullToRefreshListener(this);
					//}
				}
				if (mDefaultLoadingView != null)
				{
					mDefaultLoadingView.setOnClickListener(this);
				}
				if (mDefaultLoadingView != null && mDefaultLoadingView instanceof IRecyclerViewFooter)
				{
					((IRecyclerViewFooter) mDefaultLoadingView).setLoadingStatus(mLoadingStatus);
				}
				return mDefaultLoadingView;
			}
			else
			{
				return getCustomFooterView(position);
			}
		}
		else
		{
			return getCustomFooterView(position);
		}
	}

	public int getDefaultFooterHeight()
	{
		return 108;
	}

	// 用户上拉触发了加载，footer开始转圈，业务开始拉去数据
	@Override
	public void notifyLastFooterAppeared()
	{
		super.notifyLastFooterAppeared();
	}

	public void setLoadingStatus(int status)
	{
		setLoadingStatus(status, -1);
	}

	public void setLoadingStatus(int status, int number)
	{
//		Log.d("QBRefreshHeader", "recycleradapter:setLoadingStatus");
		mLoadingStatus = status;
		if (mDefaultLoadingView != null && mDefaultLoadingView instanceof IRecyclerViewFooter)
		{
			((IRecyclerViewFooter) mDefaultLoadingView).setLoadingStatus(status);
		}
	}

	public int getCustomFooterViewHeight(int position)
	{
		return 0;
	}

	public int getCustomFooterViewCount()
	{
		return 0;
	}

	@Override
	public int getListTotalHeight()
	{
		return super.getListTotalHeight() + mParentRecyclerView.getPaddingTop() + mParentRecyclerView.getPaddingBottom();
//		return height;
	}

	public void forceUpdateOffsetMap()
	{
		mDataChanged = true;
		calculateOffsetMapIfNeed();
	}

	/* private */void calculateOffsetMapIfNeed()
	{
		if (mOffsetMap == null)
		{
			mOffsetMap = new SparseIntArray();
		}
		if (mDataChanged)
		{
			mOffsetMap.clear();
			int itemCount = getItemCount();

			int headerHeight = 0;
			int headerCount = getHeaderViewCount();
			for (int i = 1; i <= headerCount; i++)
			{
				headerHeight += getHeaderViewHeight(i);
			}
			int currOffset = headerHeight;
			//			if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_GRID)
			//			{
			//				GridLayoutManager layoutManager = (GridLayoutManager) (mParentRecyclerView.mLayout);
			//				for (int i = 0; i < itemCount; i++)
			//				{
			//					if (i % layoutManager.mColumns == 0)
			//					{
			//						int itemTotlaHeihgt = getItemHeight(i) + getItemMaigin(LOCATION_TOP, i) + getItemMaigin(LOCATION_BOTTOM, i)
			//								+ getDividerHeight(i);
			//						if (i != 0)
			//						{
			//							currOffset += itemTotlaHeihgt;
			//						}
			//					}
			//					mOffsetMap.append(i, currOffset);
			//				}
			//			}
			//			if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_LIST)
			//			{
			//				for (int i = 0; i < itemCount; i++)
			//				{
			//					mOffsetMap.append(i, currOffset);
			//					currOffset += getItemHeight(i);
			//					currOffset += getItemMaigin(LOCATION_TOP, i);
			//					currOffset += getItemMaigin(LOCATION_BOTTOM, i);
			//				}
			//			}
			//			else if (mParentRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_WATERFALL)
			//			{
			//				//				int columnHeights[] = mParentRecyclerView.calculateColumnHeightsBefore(mDataList.size(), true);
			//				//				int heightestColumnIndex = 0;
			//				//				for (int j = 0; j < columnHeights.length; j++)
			//				//				{
			//				//					if (columnHeights[heightestColumnIndex] < columnHeights[j])
			//				//					{
			//				//						heightestColumnIndex = j;
			//				//					}
			//				//				}
			//				//				currOffset = columnHeights[heightestColumnIndex];
			//				mParentRecyclerView.getLayoutManager().calculateOffsetMap(mOffsetMap, currOffset);
			//			}
			// 调用对应的layoutManager进行计算
			mParentRecyclerView.mLayout.calculateOffsetMap(mOffsetMap, currOffset);

			mDataChanged = false;
		}
	}

	public View getCustomFooterView(int position)
	{
		return null;
	}

	@Override
	public void onClick(View v)
	{
		// TODO Auto-generated method stub
		if (mLoadingStatus == IRecyclerViewFooter.LOADING_STATUS_ERROR_RETRY
				|| mLoadingStatus == IRecyclerViewFooter.LOADING_STATUS_ERROR_NETWORK_DISCONNECTED
				|| mLoadingStatus == IRecyclerViewFooter.LOADING_STATUS_ERROR_NETWORK_ERROR)
		{
			onClickRetry();
		}
		else if (mLoadingStatus == IRecyclerViewFooter.LOADING_STATUS_NOMORE_CLICKBACKWARDS)
		{
			onClickBackward();
		}
	}

	protected void onClickRetry()
	{
	}

	protected void onClickBackward()
	{
		mParentRecyclerView.smoothScrollBy(0, -mParentRecyclerView.mOffsetY);
	}

	/* private */ List<Integer> mSuspentedPos;

	/* private */void initSuspentedPosIfNeed()
	{
		if (mSuspentedPos == null)
		{
			mSuspentedPos = new ArrayList<Integer>();
			fillSuspentedPos();
		}
		if (mSuspentionDataChanged)
		{
			mSuspentedPos.clear();
			fillSuspentedPos();
			mSuspentionDataChanged = false;
		}
	}

	@Override
	protected void onViewAttached()
	{
		//		if (mTextLayoutCache != null)
		//		{
		//			mTextLayoutCache.start();
		//		}
		super.onViewAttached();
	}

	@Override
	protected void onViewDetached()
	{
		//		if (mTextLayoutCache != null)
		//		{
		//			mTextLayoutCache.stop();
		//		}
		super.onViewDetached();
	}

	@Override
	public void dataChanged()
	{
		super.dataChanged();
		//		if (mTextLayoutCache != null)
		//		{
		//			mTextLayoutCache.waitForTasksComplete();
		//		}
	}

	/* private */void fillSuspentedPos()
	{
		int count = getItemCount();
		for (int i = 0; i < count; i++)
		{
			if (isSuspentedItem(i))
			{
				addSuspentedPos(i);
			}
		}
		Collections.sort(mSuspentedPos);
	}

	@Override
	public int findPrevSuspentedPos(int pos)
	{
		initSuspentedPosIfNeed();

		if (mSuspentedPos == null || mSuspentedPos.isEmpty())
		{
			return -1;
		}
		// Log.d("leo", "findPrev:sus=" +
		// Arrays.toString(mSuspentedPos.toArray()));
		int size = mSuspentedPos.size();
		for (int i = 0; i < size; i++)
		{
			int value = mSuspentedPos.get(i);
			if (mSuspentedPos.get(i) >= pos)
			{
				if (value == pos)
				{
					return value;
				}
				if (i == 0)
				{
					return -1;
				}
				return mSuspentedPos.get(i - 1);
			}
		}
		return mSuspentedPos.get(size - 1);
	}


	public int findNextSuspentedPos(int pos)
	{
		if (mSuspentedPos == null || mSuspentedPos.isEmpty())
		{
			return -1;
		}
		int last = findPrevSuspentedPos(pos);
		int lastIndex = mSuspentedPos.indexOf(last);
		if (last == -1 || lastIndex + 1 >= mSuspentedPos.size())
		{
			return -1;
		}
		return mSuspentedPos.get(lastIndex + 1);
	}

	public void addSuspentedPos(int pos)
	{
		if (!mParentRecyclerView.hasSuspentedItem())
		{
			return;
		}
		if (mSuspentedPos == null)
		{
			mSuspentedPos = new ArrayList<Integer>();
		}
		if (!mSuspentedPos.contains(pos))
		{
			mSuspentedPos.add(pos);
		}
	}


	@Override
	public void notifyItemChanged(int position)
	{
		mContentHeight = -1;
		super.notifyItemChanged(position);
	}

	public void notifyItemRangeChanged(int positionStart, int itemCount)
	{
		mContentHeight = -1;
		super.notifyItemRangeChanged(positionStart, itemCount);
	}

	@Override
	public void notifyDataSetChanged()
	{
		mContentHeight = -1;
		//		if (isAutoCalculateItemHeight() && mItemHeightList != null)
		//		{
		//			mAutoCalcItemHeightFinish = false;
		//		}
		super.notifyDataSetChanged();
	}

	@Override
	public void notifyItemInserted(int position)
	{
		mContentHeight = -1;
		super.notifyItemInserted(position);
	}

	@Override
	public void notifyItemRangeInserted(int positionStart, int itemCount)
	{
		mContentHeight = -1;
		super.notifyItemRangeInserted(positionStart, itemCount);
	}

	public void notifyItemRangeRemoved(int positionStart, int itemCount)
	{
		mContentHeight = -1;
		super.notifyItemRangeRemoved(positionStart, itemCount);
	}

	@Override
	public void notifyItemRemoved(int position)
	{
		mContentHeight = -1;
		super.notifyItemRemoved(position);
	}

	@Override
	public boolean getFooterViewInBottomMode()
	{
		return false;
	}
	
	public void notifyItemsRemoved(ArrayList<Integer> positions)
	{
		mContentHeight = -1;
		super.notifyItemsRemoved(positions);
	}

}
