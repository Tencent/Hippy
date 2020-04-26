package com.tencent.mtt.supportui.views.recyclerview;

import java.util.ArrayList;
import java.util.List;

import com.tencent.mtt.supportui.views.ScrollChecker;

import android.content.Context;
import android.content.res.Configuration;
import android.view.View;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public class RecyclerView extends RecyclerViewBase implements RecyclerViewBase.OnScrollListener, ScrollChecker.IScrollCheck
{
	public RecyclerAdapter mRecyclerViewAdapter;

	public interface OnListScrollListener
	{
		void onStartDrag();

		void onScroll(int dx, int dy);

		void onScrollEnd();

		void onDragEnd();

		void onStartFling();

	}

	public List<OnListScrollListener> mListScrollListeners = null;

	public void addOnListScrollListener(OnListScrollListener listener)
	{
		if (mListScrollListeners == null)
		{
			mListScrollListeners = new ArrayList<OnListScrollListener>();

		}
		if (!mListScrollListeners.contains(listener))
		{
			mListScrollListeners.add(listener);
		}
	}

	public void removeOnListScrollListener(OnListScrollListener listener)
	{
		if (mListScrollListeners != null && mListScrollListeners.contains(listener))
		{
			mListScrollListeners.remove(listener);
		}
	}

	public RecyclerView(Context context)
	{
		super(context);
		setOverScrollEnabled(true);
		setVerticalScrollBarEnabled(true);
		setHorizontalScrollBarEnabled(false);
		setOnScrollListener(this);
		setAnimationCacheEnabled(false);
	}

	public void reset()
	{
		scrollToPosition(0);
		mOffsetY = 0;
		mInitialTouchY = 0;
		mLastTouchY = 0;
		mScrollState = SCROLL_STATE_IDLE;
		mScrollPointerId = -1;
		mVelocityTracker = null;

	}

	@SuppressWarnings("rawtypes")
	@Override
	public void setAdapter(Adapter adapter)
	{
		super.setAdapter(adapter);
		mRecyclerViewAdapter = (RecyclerAdapter) adapter;
	}

	public int getHeightBefore(int pos)
	{
		if (mRecyclerViewAdapter != null)
		{
			return mRecyclerViewAdapter.getHeightBefore(pos);
		}
		return 0;
	}

	@Override
	protected boolean canTranversal(int purpose, ViewHolder holder)
	{
		return super.canTranversal(purpose, holder);
	}

	public static class ViewHolderWrapper extends ViewHolder
	{
		public ViewHolderWrapper(View itemView, RecyclerViewBase rv)
		{
			super(itemView, rv);
			if (itemView instanceof RecyclerViewItem)
			{
				RecyclerViewItem item = (RecyclerViewItem) itemView;
				mContent = item.mContentView;
			}
		}

		@Override
		public String toString()
		{
			StringBuilder sb = new StringBuilder();
			sb.append("holder:" + Integer.toHexString(hashCode()) + ",pos=" + getPosition() + ",");
			if (mContentHolder != null)
			{
				sb.append(mContentHolder.toString());
			}
			return sb.toString();
		}

		public void setContentHolder(ContentHolder contentHolder)
		{
			mContentHolder = contentHolder;
		}

		@Override
		public void inTraversals(int traversalPurpose)
		{

			if (traversalPurpose == TRAVERSAL_PURPOSE_MODECHANGE || traversalPurpose == TRAVERSAL_PURPOSE_ITEMCHANGE)
			{
				mBindNextTime = true;
				// addFlags(ViewHolder.FLAG_UPDATE | ViewHolder.FLAG_INVALID);
				// mFlags &= ~ViewHolder.FLAG_BOUND;
			}
			else if (mContentHolder != null)
			{
				mContentHolder.inTraversals(traversalPurpose, mPosition, mParent);
			}
		}
	}

	@Override
	public void onScrollStateChanged(int oldState, int newState)
	{
		switch (newState)
		{
			case SCROLL_STATE_IDLE:
				if (oldState == SCROLL_STATE_SETTLING)
				{
					// stop fling
					onScrollFlingEnded();
					if (mListScrollListeners != null)
					{
						for (OnListScrollListener listener : mListScrollListeners)
						{
							listener.onScrollEnd();
						}
					}
				}
				else if (oldState == SCROLL_STATE_DRAGGING)
				{
					// stop drag
					onScrollDragEnded();
					if (mListScrollListeners != null)
					{
						for (OnListScrollListener listener : mListScrollListeners)
						{
							listener.onDragEnd();
						}
					}
				}
				break;
			case SCROLL_STATE_SETTLING:
				if (oldState == SCROLL_STATE_DRAGGING)
				{
					// stop drag and start fling
					onScrollDragEnded();
					onScrollFlingStarted();
					if (mListScrollListeners != null)
					{
						for (OnListScrollListener listener : mListScrollListeners)
						{
							listener.onStartFling();
						}
					}
				}
				break;
			case SCROLL_STATE_DRAGGING:
				if (oldState == SCROLL_STATE_IDLE)
				{
					// start drag here
					onScrollDragStarted();
					if (mListScrollListeners != null)
					{
						for (OnListScrollListener listener : mListScrollListeners)
						{
							listener.onStartDrag();
						}
					}
				}
				else if (oldState == SCROLL_STATE_SETTLING)
				{
					// stop fling and start drag
					onScrollFlingEnded();
					onScrollDragStarted();
				}
				break;
		}
	}

	protected void onScrollDragStarted()
	{

	}

	protected void onScrollDragEnded()
	{

	}

	protected void onScrollFlingStarted()
	{

	}

	protected void onScrollFlingEnded()
	{

	}

	@Override
	public void onScrolled(int dx, int dy)
	{
		if (mListScrollListeners == null || mListScrollListeners.size() == 0)
		{
			return;
		}
		for (OnListScrollListener listener : mListScrollListeners)
		{
			listener.onScroll(dx, dy);
		}
	}

	@Override
	protected void onConfigurationChanged(Configuration newConfig)
	{
		super.onConfigurationChanged(newConfig);
		onOrientationChanged();
	}

	public void onOrientationChanged()
	{
		//		Log.d("RecyclerView", "onOrientationChanged:view");
	}

	@Override
	public int findPrevSuspentedPos(int pos)
	{
		// TODO Auto-generated method stub
		return mAdapter.findPrevSuspentedPos(pos);
	}

	public int findNextSuspentedPos(int pos)
	{
		return mAdapter.findNextSuspentedPos(pos);
	}


	//	protected int getSpringBackMaxDistance()
	//	{
	//		return 120;
	//	}
	//
	//	protected int getAutoScrollVelocity()
	//	{
	//		return 9;
	//	}

	@Override
	public ViewHolder createViewHolder(View itemView, RecyclerViewBase rv)
	{
		return new ViewHolderWrapper(itemView, rv);
	}

	@Override
	public void onItemsFill(int offset)
	{
		super.onItemsFill(offset);
		Adapter adapter = getAdapter();
		if (adapter != null)
		{
			adapter.onItemsFill(offset);
		}
	}

	@Override
	public void checkNotifyFooterAppearWithFewChild(int endOffset)
	{
		Adapter adapter = getAdapter();
		if (adapter != null && (mOffsetY + getHeight() >= adapter.getListTotalHeight() - adapter.getDefaultFooterHeight()))
		{
			View view = getLayoutManager().getChildClosestToEndInScreen();
			if (view != null && view instanceof IRecyclerViewFooter)
			{
				adapter.notifyLastFooterAppeared();
			}
		}
	}

	@Override
	public boolean verticalCanScroll(int direction)
	{
		if (mLayout != null)
		{
			return mVerticalCanScroll && mLayout.canScrollVertically();
		}
		return false;
	}

	@Override
	public boolean horizontalCanScroll(int direction)
	{
		if (mLayout != null)
		{
			return mHorizontalCanScroll && mLayout.canScrollHorizontally();
		}
		return false;
	}


	public RecyclerViewItem createViewItem()
	{
		return new RecyclerViewItem(getContext(), this);
	}

	@Override
	protected boolean needAdvancedStopDetachChildView()
	{
		return false;
	}


	public View createFooterView(Context context)
	{
		return null;
	}
}
