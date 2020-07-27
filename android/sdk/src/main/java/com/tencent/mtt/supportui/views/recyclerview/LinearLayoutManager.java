package com.tencent.mtt.supportui.views.recyclerview;

import android.content.Context;
import android.util.Log;
import android.util.SparseIntArray;
import android.view.View;

import static com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase.Adapter.LOCATION_BOTTOM;
import static com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase.Adapter.LOCATION_LEFT;
import static com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase.Adapter.LOCATION_RIGHT;
import static com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase.Adapter.LOCATION_TOP;
import static com.tencent.mtt.supportui.views.recyclerview.RecyclerViewBase.LAYOUT_TYPE_LIST;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

/**
 * A
 * {@link LinearLayoutManager}
 * implementation which provides
 * similar functionality to {@link android.widget.ListView}.
 */
public class LinearLayoutManager extends BaseLayoutManager
{
	private static final String TAG = "LinearLayoutManager";

	public LinearLayoutManager(Context context)
	{
		this(context, VERTICAL, false);
	}

	/**
	 * @param context Current context, will be used to access resources.
	 * @param orientation Layout orientation. Should be {@link #HORIZONTAL} or
	 *            {@link #VERTICAL}.
	 * @param reverseLayout When set to true, renders the layout from end to
	 *            start.
	 */
	public LinearLayoutManager(Context context, int orientation, boolean reverseLayout)
	{
		super(context, orientation, false);
	}

	@Override
	public int getLayoutType()
	{
		return LAYOUT_TYPE_LIST;
	}

	/**
	 * The magic functions :). Fills the given layout, defined by the
	 * renderState. This is fairly
	 * independent from the rest of the
	 * {@link LinearLayoutManager} and
	 * with little change, can be made publicly available as a helper class.
	 *
	 * @param recycler Current recycler that is attached to RecyclerView
	 * @param renderState Configuration on how we should fill out the available
	 *            space.
	 * @param state Context passed by the RecyclerView to control scroll steps.
	 * @param stopOnFocusable If true, filling stops in the first focusable new
	 *            child
	 * @return Number of pixels that it added. Useful for scoll functions.
	 */

	protected int fill(RecyclerViewBase.Recycler recycler, RenderState renderState, RecyclerViewBase.State state, boolean stopOnFocusable)
	{
		// max offset we should set is mFastScroll + available
		final int start = renderState.mAvailable;
		if (renderState.mScrollingOffset != RenderState.SCOLLING_OFFSET_NaN)
		{
			// TODO ugly bug fix. should not happen
			if (renderState.mAvailable < 0)
			{
				renderState.mScrollingOffset += renderState.mAvailable;
			}
			recycleByRenderState(recycler, renderState);
		}
		int remainingSpace = renderState.mAvailable + renderState.mExtra;
		while (remainingSpace > 0)
		{
			if (renderState.hasMore(state) == RenderState.FILL_TYPE_NOMORE)
			{
				int res = start - renderState.mAvailable + remainingSpace;
				if (DEBUG)
				{
//					Log.d("leo", "nomore!!" + ",remainspace=" + remainingSpace + ",res=" + res);
				}
				if (!renderState.overscroll)
				{
					break;
				}
				if (renderState.mItemDirection > 0 && !mEndReached)
				{
					mEndReached = true;
					if (mRecyclerView.getAdapter() != null)
					{
						mRecyclerView.getAdapter().notifyEndReached();
					}
				}
				return res;
			}
			mEndReached = false;
			int index = renderState.mCurrentPosition;
			//			int currentRenderState = renderState.hasMore(state);
			View view = getNextView(recycler, renderState, state);
			if (view == null)
			{
				if (false && renderState.mScrapList == null)
				{
					throw new RuntimeException("received null view when unexpected");
				}
				// if we are laying out views in scrap, this may return null
				// which means there is
				// no more items to layout.
				break;
			}
			RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
			if (!params.isItemRemoved() && mRenderState.mScrapList == null)
			{
				if (mShouldReverseLayout == (renderState.mLayoutDirection == RenderState.LAYOUT_START))
				{
					addView(view);
				}
				else
				{
					addView(view, 0);
				}
			}

			//			int viewType = params.mViewHolder.mViewType;
			//			if (viewType == RecyclerView.ViewHolder.TYPE_FOOTER || viewType == RecyclerView.ViewHolder.TYPE_HEADERE)
			//			{
			//				if (view instanceof QBViewInterface)
			//				{
			//					((QBViewInterface) view).switchSkin();
			//				}
			//			}

			measureChildWithMargins(view, 0, 0);
			if (mRecyclerView.getAdapter() instanceof RecyclerAdapter && ((RecyclerAdapter) mRecyclerView.getAdapter()).isAutoCalculateItemHeight())
			{
				if (view instanceof RecyclerViewItem)
				{
					if (((RecyclerViewItem) view).getChildCount() > 0)
					{
						recordItemSize(index, ((RecyclerViewItem) view).getChildAt(0));
						((RecyclerAdapter) mRecyclerView.getAdapter()).forceUpdateOffsetMap();
					}
				}
				if (renderState.hasMore(state) == RenderState.FILL_TYPE_NOMORE)
				{
					//                    Log.e("leo", "FILL_TYPE_NOMORE " + state.mTotalHeight);
					mRecyclerView.getAdapter().getTotalHeight();
//					((RecyclerAdapter) mRecyclerView.getAdapter()).mAutoCalcItemHeightFinish = true;
				}
				else
				{
					//					Log.e("leo", "other FILL_TYPE " + state.mTotalHeight + " still autoCalcItemHeight");
//					((RecyclerAdapter) mRecyclerView.getAdapter()).mAutoCalcItemHeightFinish = false;
					// 在NotifyDataSetChange的时候置为false
				}
			}

			int consumed = mOrientationHelper.getDecoratedMeasurement(view);
			int left, top, right, bottom;
			if (getOrientation() == VERTICAL)
			{
				if (isLayoutRTL())
				{
					right = getWidth() - getPaddingRight();
					left = right - mOrientationHelper.getDecoratedMeasurementInOther(view);
				}
				else
				{
					left = getPaddingLeft();
					right = left + mOrientationHelper.getDecoratedMeasurementInOther(view);
				}
				if (renderState.mLayoutDirection == RenderState.LAYOUT_START)
				{
					bottom = renderState.mOffset;
					top = renderState.mOffset - consumed;
				}
				else
				{
					top = renderState.mOffset;
					bottom = renderState.mOffset + consumed;
				}
			}
			else
			{
				top = getPaddingTop();
				bottom = top + mOrientationHelper.getDecoratedMeasurementInOther(view);

				if (renderState.mLayoutDirection == RenderState.LAYOUT_START)
				{
					right = renderState.mOffset;
					left = renderState.mOffset - consumed;
				}
				else
				{
					left = renderState.mOffset;
					right = renderState.mOffset + consumed;
				}
			}
			// We calculate everything with View's bounding box (which includes
			// decor and margins)
			// To calculate correct layout position, we subtract margins.
			layoutDecorated(view, left + params.leftMargin, top + params.topMargin, right - params.rightMargin, bottom - params.bottomMargin);
			if (DEBUG)
			{
//				Log.d("RecyclerView", "laid out child at position " + getPosition(view) + ", with l:" + (left + params.leftMargin) + ", t:"
//						+ (view.getTop()) + ", r:" + (right - params.rightMargin) + ", b:" + (bottom - params.bottomMargin));
			}
			renderState.mOffset += consumed * renderState.mLayoutDirection;

			if (!params.isItemRemoved())
			{
				renderState.mAvailable -= consumed;
				// we keep a separate remaining space because mAvailable is
				// important for recycling
				remainingSpace -= consumed;
			}
			//Log.e("RecyclerView", "before recycle!");
			if (renderState.mScrollingOffset != RenderState.SCOLLING_OFFSET_NaN)
			{
				renderState.mScrollingOffset += consumed;
				if (renderState.mAvailable < 0)
				{
					renderState.mScrollingOffset += renderState.mAvailable;
				}
				recycleByRenderState(recycler, renderState);
			}
			if (stopOnFocusable && view.isFocusable())
			{
				break;
			}

			if (state != null && state.getTargetScrollPosition() == getPosition(view))
			{
				break;
			}
		}
		if (DEBUG)
		{
			// validateChildOrder();
		}
		return start - renderState.mAvailable;
	}

	@Override
	protected void handleRecordItemHeightChange(int index, int oldItemHeight, int newItemHeight)
	{
		if (mRecyclerView != null && mRecyclerView.getFirstVisibleItemPos() >= index && mRecyclerView.mOffsetY > 0)
		{
			mRecyclerView.mOffsetY -= oldItemHeight;
			mRecyclerView.mOffsetY += newItemHeight;
		}
	}

	@Override
	public void calculateOffsetMap(SparseIntArray offsetMap, int startOffset)
	{
		if (mRecyclerView.mLayoutType == RecyclerViewBase.LAYOUT_TYPE_LIST)
		{
			int currOffset = startOffset;
			int itemCount = getItemCount();
			for (int i = 0; i < itemCount; i++)
			{
				offsetMap.append(i, currOffset);
				if (mRecyclerView.mLayout.canScrollHorizontally())
				{
					currOffset += ((RecyclerAdapter)mRecyclerView.getAdapter()).getItemWidth(i);
					currOffset += mRecyclerView.getAdapter().getItemMaigin(LOCATION_LEFT, i);
					currOffset += mRecyclerView.getAdapter().getItemMaigin(LOCATION_RIGHT, i);
				}
				else
				{
					currOffset += ((RecyclerAdapter)mRecyclerView.getAdapter()).getItemHeight(i);
					currOffset += mRecyclerView.getAdapter().getItemMaigin(LOCATION_TOP, i);
					currOffset += mRecyclerView.getAdapter().getItemMaigin(LOCATION_BOTTOM, i);
				}
			}
		}
	}
}
