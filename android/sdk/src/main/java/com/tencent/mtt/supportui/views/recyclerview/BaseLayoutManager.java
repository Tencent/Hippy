package com.tencent.mtt.supportui.views.recyclerview;

import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import android.graphics.PointF;
import android.os.Parcel;
import android.os.Parcelable;
import android.util.Log;
import android.view.FocusFinder;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public abstract class BaseLayoutManager extends RecyclerViewBase.LayoutManager
{

	private static final String		TAG						= "LinearLayoutManager";

	protected static final boolean	DEBUG					= false;

	public static final int			HORIZONTAL				= LinearLayout.HORIZONTAL;

	public static final int			VERTICAL				= LinearLayout.VERTICAL;

	private static final float		SUSPEND_ITEM_ALPHA		= .8f;
	protected int					mSuspentedAreaSize		= 0;

	/**
	 * While trying to find next view to focus, LinearLayoutManager will not try
	 * to scroll more than this factor times the total space of the list. If
	 * layout is vertical, total space is the height minus padding, if layout is
	 * horizontal, total space is the width minus padding.
	 */
	private static final float		MAX_SCROLL_FACTOR		= 0.33f;
	// private Stack<SuspentionInfo> mSuspentions;

	/**
	 * Current orientation. Either {@link #HORIZONTAL} or {@link #VERTICAL}
	 */
	private int						mOrientation;

	/**
	 * Helper class that keeps temporary rendering state. It does not keep state
	 * after rendering is complete but we still keep a reference to re-use the
	 * same object.
	 */
	public RenderState				mRenderState;

	/**
	 * Many calculations are made depending on orientation. To keep it clean,
	 * this interface helps {@link BaseLayoutManager} make those decisions.
	 * Based on {@link #mOrientation}, an implementation is lazily created in
	 * {@link #ensureRenderState} method.
	 */
	public OrientationHelper		mOrientationHelper;

	/**
	 * We need to track this so that we can ignore current position when it
	 * changes.
	 */
	private boolean					mLastStackFromEnd;

	/**
	 * Defines if layout should be calculated from end to start.
	 *
	 * @see #mShouldReverseLayout
	 */
	private boolean					mReverseLayout			= false;

	/**
	 * This keeps the final value for how LayoutManager should start laying out
	 * views. It is calculated by checking {@link #getReverseLayout()} and
	 * View's layout direction.
	 * {@link #onLayoutChildren(RecyclerViewBase.Recycler, RecyclerViewBase.State)}
	 * is run.
	 */
	protected boolean				mShouldReverseLayout	= false;

	/**
	 * Works the same way as
	 * {@link android.widget.AbsListView#setStackFromBottom(boolean)} and it
	 * supports both orientations. see
	 * {@link android.widget.AbsListView#setStackFromBottom(boolean)}
	 */
	private boolean					mStackFromEnd			= false;

	private SavedState				mPendingSavedState		= null;

	private View					mCurrentSuspentionView	= null;
	private int						mCurrentSuspentionPos	= RecyclerViewBase.NO_POSITION;


	private int						mPendingGravity			= Gravity.NO_GRAVITY;

	private int						mPendingScrollPositionItemHeight;

	protected boolean				mEndReached				= false;

	/**
	 * Creates a vertical LinearLayoutManager
	 *
	 * @param context
	 *            Current context, will be used to access resources.
	 */
	public BaseLayoutManager(Context context)
	{
		this(context, VERTICAL, false);
	}

	/**
	 * @param context
	 *            Current context, will be used to access resources.
	 * @param orientation
	 *            Layout orientation. Should be {@link #HORIZONTAL} or
	 *            {@link #VERTICAL}.
	 * @param reverseLayout
	 *            When set to true, renders the layout from end to start.
	 */
	public BaseLayoutManager(Context context, int orientation, boolean reverseLayout)
	{
		setOrientation(orientation);
		setReverseLayout(reverseLayout);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public RecyclerViewBase.LayoutParams generateDefaultLayoutParams()
	{
		return new RecyclerViewBase.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
	}

	@Override
	public Parcelable onSaveInstanceState()
	{
		if (mPendingSavedState != null)
		{
			return new SavedState(mPendingSavedState);
		}
		SavedState state = new SavedState();
		if (getChildCount() > 0)
		{
			boolean didLayoutFromEnd = mLastStackFromEnd ^ mShouldReverseLayout;
			state.mAnchorLayoutFromEnd = didLayoutFromEnd;
			if (didLayoutFromEnd)
			{
				// final View refChild = getChildClosestToEndInVisual();
				state.mAnchorOffset = mOrientationHelper.getEndAfterPadding() - mOrientationHelper.getDecoratedEnd(getChildClosestToEndInScreen());
				state.mAnchorPosition = getPosition(getChildClosestToEndByOrder());
			}
			else
			{
				// final View refChild = getChildClosestToStartInVisual();
				state.mAnchorPosition = getPosition(getChildClosestToStartByOrder());
				state.mAnchorOffset = mOrientationHelper.getDecoratedStart(getChildClosestToStartInScreen())
						- mOrientationHelper.getStartAfterPadding();
			}
		}
		else
		{
			state.mAnchorPosition = 0;
			state.mAnchorOffset = 0;
		}
		state.mStackFromEnd = mStackFromEnd;
		state.mReverseLayout = mReverseLayout;
		state.mOrientation = mOrientation;
		return state;
	}

	@Override
	public void onRestoreInstanceState(Parcelable state)
	{
		if (state instanceof SavedState)
		{
			mPendingSavedState = (SavedState) state;
			requestLayout();
			if (DEBUG)
			{
//				Log.d(TAG, "loaded saved state");
			}
		}
		else if (DEBUG)
		{
//			Log.d(TAG, "invalid saved state class");
		}
	}

	/**
	 * @return true if {@link #getOrientation()} is {@link #HORIZONTAL}
	 */
	@Override
	public boolean canScrollHorizontally()
	{
		return mOrientation == HORIZONTAL;
	}

	/**
	 * @return true if {@link #getOrientation()} is {@link #VERTICAL}
	 */
	@Override
	public boolean canScrollVertically()
	{
		return mOrientation == VERTICAL;
	}

	/**
	 * Compatibility support for
	 * {@link android.widget.AbsListView#setStackFromBottom(boolean)}
	 */
	public void setStackFromEnd(boolean stackFromEnd)
	{
		if (mPendingSavedState != null && mPendingSavedState.mStackFromEnd != stackFromEnd)
		{
			// override pending state
			mPendingSavedState.mStackFromEnd = stackFromEnd;
		}
		if (mStackFromEnd == stackFromEnd)
		{
			return;
		}
		mStackFromEnd = stackFromEnd;
		requestLayout();
	}

	public boolean getStackFromEnd()
	{
		return mStackFromEnd;
	}

	/**
	 * Returns the current orientaion of the layout.
	 *
	 * @return Current orientation.
	 * @see #mOrientation
	 * @see #setOrientation(int)
	 */
	public int getOrientation()
	{
		return mOrientation;
	}

	/**
	 * Sets the orientation of the layout.
	 * {@link LinearLayoutManager}
	 * will do its best to keep scroll position.
	 *
	 * @param orientation
	 *            {@link #HORIZONTAL} or {@link #VERTICAL}
	 */
	public void setOrientation(int orientation)
	{
		if (orientation != HORIZONTAL && orientation != VERTICAL)
		{
			throw new IllegalArgumentException("invalid orientation.");
		}
		if (mPendingSavedState != null && mPendingSavedState.mOrientation != orientation)
		{
			// override pending state
			mPendingSavedState.mOrientation = orientation;
		}
		if (orientation == mOrientation)
		{
			return;
		}
		mOrientation = orientation;
		mOrientationHelper = null;
		requestLayout();
	}

	/**
	 * Calculates the view layout order. (e.g. from end to start or start to
	 * end) RTL layout support is applied automatically. So if layout is RTL and
	 * {@link #getReverseLayout()} is {@code true}, elements will be laid out
	 * starting from left.
	 */
	private void resolveShouldLayoutReverse()
	{
		// A == B is the same result, but we rather keep it readable
		if (mOrientation == VERTICAL || !isLayoutRTL())
		{
			mShouldReverseLayout = mReverseLayout;
		}
		else
		{
			mShouldReverseLayout = !mReverseLayout;
		}
	}

	/**
	 * Returns if views are laid out from the opposite direction of the layout.
	 *
	 * @return If layout is reversed or not.
	 * @see {@link #setReverseLayout(boolean)}
	 */
	public boolean getReverseLayout()
	{
		return mReverseLayout;
	}

	/**
	 * Used to reverse item traversal and layout order. This behaves similar to
	 * the layout change for RTL views. When set to true, first item is rendered
	 * at the end of the UI, second item is render before it etc.
	 * <p/>
	 * For horizontal layouts, it depends on the layout direction. When set to
	 * true, If {@link RecyclerViewBase}
	 * is LTR, than it will render from RTL, if
	 * {@link RecyclerViewBase} is RTL, it
	 * will render from LTR.
	 * <p/>
	 * If you are looking for the exact same behavior of
	 * {@link android.widget.AbsListView#setStackFromBottom(boolean)}, use
	 * {@link #setStackFromEnd(boolean)}
	 */
	public void setReverseLayout(boolean reverseLayout)
	{
		if (mPendingSavedState != null && mPendingSavedState.mReverseLayout != reverseLayout)
		{
			// override pending state
			mPendingSavedState.mReverseLayout = reverseLayout;
		}
		if (reverseLayout == mReverseLayout)
		{
			return;
		}
		mReverseLayout = reverseLayout;
		requestLayout();
	}

	@Override
	public View findViewByPosition(int position)
	{
		final int childCount = getChildCount();
		if (childCount == 0)
		{
			return null;
		}
		final int firstChild = getPosition(getChildAt(0));
		final int viewPosition = position - firstChild;
		if (viewPosition >= 0 && viewPosition < childCount)
		{
			return getChildAt(viewPosition);
		}
		return null;
	}

	/**
	 * <p>
	 * Returns the amount of extra space that should be rendered by
	 * LinearLayoutManager. By default,
	 * {@link LinearLayoutManager}
	 * lays out 1 extra page of items while smooth scrolling and 0 otherwise.
	 * You can override this method to implement your custom layout pre-cache
	 * logic.
	 * </p>
	 * <p>
	 * Laying out invisible elements will eventually come with performance cost.
	 * On the other hand, in places like smooth scrolling to an unknown
	 * location, this extra content helps LayoutManager to calculate a much
	 * smoother scrolling; which improves user experience.
	 * </p>
	 * <p>
	 * You can also use this if you are trying to pre-render your upcoming
	 * views.
	 * </p>
	 *
	 * @return The extra space that should be laid out (in pixels).
	 */
	protected int getExtraLayoutSpace(RecyclerViewBase.State state)
	{
		return (mRecyclerView.shouldPrebindItem() || state.hasTargetScrollPosition()) ? mOrientationHelper.getTotalSpace() : 0;
	}

	@Override
	public void smoothScrollToPosition(RecyclerViewBase recyclerView, RecyclerViewBase.State state, int position)
	{
		LinearSmoothScroller linearSmoothScroller = new LinearSmoothScroller(recyclerView.getContext())
		{
			@Override
			public PointF computeScrollVectorForPosition(int targetPosition)
			{
				return BaseLayoutManager.this.computeScrollVectorForPosition(targetPosition);
			}
		};
		linearSmoothScroller.setTargetPosition(position);
		startSmoothScroll(linearSmoothScroller);
	}

	public PointF computeScrollVectorForPosition(int targetPosition)
	{
		if (getChildCount() == 0)
		{
			return null;
		}
		final int firstChildPos = getPosition(getChildAt(0));
		final int direction = targetPosition < firstChildPos != mShouldReverseLayout ? -1 : 1;
		if (mOrientation == HORIZONTAL)
		{
			return new PointF(direction, 0);
		}
		else
		{
			return new PointF(0, direction);
		}
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void onLayoutChildren(RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state)
	{
		// layout algorithm:
		// 1) by checking children and other variables, find an anchor
		// coordinate and an anchor
		// item position.
		// 2) fill towards start, stacking from bottom
		// 3) fill towards end, stacking from top
		// 4) scroll to fulfill requirements like stack from bottom.
		// create render state
		if (DEBUG)
		{
//			Log.d(TAG, "is pre layout:" + state.isPreLayout());
//			Log.d("RecyclerView", "start layout!!");
		}
//		Log.d("leo", "onlayoutchildren");
		if (mPendingSavedState != null)
		{
			setOrientation(mPendingSavedState.mOrientation);
			setReverseLayout(mPendingSavedState.mReverseLayout);
			setStackFromEnd(mPendingSavedState.mStackFromEnd);
			mPendingScrollPosition = mPendingSavedState.mAnchorPosition;
		}

		ensureRenderState();
		// Log.d("LinearLayoutManager#RenderState",
		// "onlayoutchildren started!");
		// mRenderState.log();
		// resolve layout direction
		resolveShouldLayoutReverse();

		// validate scroll position if exists
		if (mPendingScrollPosition != RecyclerViewBase.NO_POSITION)
		{
			// validate it
//			Log.d("RecyclerView", "baselayoutmanager mPendingScrollPosition=" + mPendingScrollPosition);
			if (mPendingScrollPosition < -state.mHeaderCount || (mPendingScrollPosition >= state.getItemCount()))
			{
				if (mPendingScrollPosition != 0 || state.getItemCount() != 0)
				{
					mPendingScrollPosition = RecyclerViewBase.NO_POSITION;
					mPendingScrollPositionOffset = INVALID_OFFSET;
					if (DEBUG)
					{
//						Log.e(TAG, "ignoring invalid scroll position " + mPendingScrollPosition);
					}
				}

			}
		}
		// this value might be updated if there is a target scroll position
		// without an offset
		boolean layoutFromEnd = mShouldReverseLayout ^ mStackFromEnd;

		final boolean stackFromEndChanged = mLastStackFromEnd != mStackFromEnd;

		int anchorCoordinate, anchorItemPosition;
		if (mPendingScrollPosition != RecyclerViewBase.NO_POSITION)
		{
			// if child is visible, try to make it a reference child and ensure
			// it is fully visible.
			// if child is not visible, align it depending on its virtual
			// position.
			anchorItemPosition = mPendingScrollPosition;
			if (mPendingGravity != Gravity.NO_GRAVITY)
			{
				final int verticalGravity = mPendingGravity & Gravity.VERTICAL_GRAVITY_MASK;
				switch (verticalGravity)
				{
					case Gravity.TOP:
						mPendingScrollPositionOffset = mOrientationHelper.getStartAfterPadding();
						break;
					case Gravity.CENTER_VERTICAL:
						mPendingScrollPositionOffset = (mRecyclerView.getMeasuredHeight() - mPendingScrollPositionItemHeight) / 2
								- mPendingScrollPositionItemHeight;
						break;
					case Gravity.BOTTOM:
						mPendingScrollPositionOffset = mRecyclerView.getMeasuredHeight() - mPendingScrollPositionItemHeight;
						break;
					default:
				}
			}
			if (mPendingSavedState != null)
			{
				// Anchor offset depends on how that child was laid out. Here,
				// we update it
				// according to our current view bounds
				layoutFromEnd = mPendingSavedState.mAnchorLayoutFromEnd;
				if (layoutFromEnd)
				{
					anchorCoordinate = mOrientationHelper.getEndAfterPadding() - mPendingSavedState.mAnchorOffset;
				}
				else
				{
					anchorCoordinate = mOrientationHelper.getStartAfterPadding() + mPendingSavedState.mAnchorOffset;
				}
			}
			else if (mPendingScrollPositionOffset == INVALID_OFFSET)
			{
				View child = findViewByPosition(mPendingScrollPosition);
				if (child != null)
				{
					final int startGap = mOrientationHelper.getDecoratedStart(child) - mOrientationHelper.getStartAfterPadding();
					final int endGap = mOrientationHelper.getEndAfterPadding() - mOrientationHelper.getDecoratedEnd(child);
					final int childSize = mOrientationHelper.getDecoratedMeasurement(child);
					if (childSize > mOrientationHelper.getTotalSpace())
					{
						// item does not fit. fix depending on layout direction
						anchorCoordinate = layoutFromEnd ? mOrientationHelper.getEndAfterPadding() : mOrientationHelper.getStartAfterPadding();
					}
					else if (startGap < 0)
					{
						anchorCoordinate = mOrientationHelper.getStartAfterPadding();
						layoutFromEnd = false;
					}
					else if (endGap < 0)
					{
						anchorCoordinate = mOrientationHelper.getEndAfterPadding();
						layoutFromEnd = true;
					}
					else
					{
						anchorCoordinate = layoutFromEnd ? mOrientationHelper.getDecoratedEnd(child) : mOrientationHelper.getDecoratedStart(child);
					}
				}
				else
				{ // item is not visible.
					if (getChildCount() > 0)
					{
						// get position of any child, does not matter
						int pos = getPosition(getChildAt(0));
						if (mPendingScrollPosition < pos == mShouldReverseLayout)
						{
							anchorCoordinate = mOrientationHelper.getEndAfterPadding();
							layoutFromEnd = true;
						}
						else
						{
							anchorCoordinate = mOrientationHelper.getStartAfterPadding();
							layoutFromEnd = false;
						}
					}
					else
					{
						anchorCoordinate = layoutFromEnd ? mOrientationHelper.getEndAfterPadding() : mOrientationHelper.getStartAfterPadding();
					}
				}
			}
			else
			{
				// override layout from end values for consistency
				if (mShouldReverseLayout)
				{
					anchorCoordinate = mOrientationHelper.getEndAfterPadding() - mPendingScrollPositionOffset;
					layoutFromEnd = true;
				}
				else
				{
					anchorCoordinate = mOrientationHelper.getStartAfterPadding() + mPendingScrollPositionOffset;
					layoutFromEnd = false;
				}
			}
		}
		else if (getChildCount() > 0 && !stackFromEndChanged)
		{
			if (layoutFromEnd)
			{
				// View referenceChild = getChildClosestToEndInLogic();
				anchorCoordinate = mOrientationHelper.getDecoratedEnd(getChildClosestToEndInScreen());
				anchorItemPosition = getPosition(getChildClosestToEndByOrder());
			}
			else
			{
				// View referenceChild = getChildClosestToStartInLogic();
				// View firstValidView=getFirstValidChild();
				// if (firstValidView ==null)
				// {
				// anchorCoordinate = mOrientationHelper.getStartAfterPadding();
				// anchorItemPosition =
				// -mRecyclerView.mAdapter.getHeaderViewCount();
				// }
				// else
				// {
				View firstValidView = getChildClosestToStartByOrder();
				// View firstValidView = getChildClosestToStartInScreen();
				anchorCoordinate = mOrientationHelper.getDecoratedStart(firstValidView);
				anchorItemPosition = getPosition(firstValidView);
				// }
				// FIXME:ugly bug
				// fix,gridlayout在横竖屏切换之后，选取的anchor不能被column整出，排版异常。
				// if (mRecyclerView.mLayoutType ==
				// RecyclerView.LAYOUT_TYPE_GRID)
				// {
				// int remain = anchorItemPosition % ((GridLayoutManager)
				// this).mColumns;
				// if (remain != 0)
				// {
				// anchorItemPosition = anchorItemPosition +
				// ((GridLayoutManager) this).mColumns - remain;
				// }
				// }

			}
		}
		else
		{
			anchorCoordinate = layoutFromEnd ? mOrientationHelper.getEndAfterPadding() : mOrientationHelper.getStartAfterPadding();
			anchorItemPosition = mStackFromEnd ? state.getItemCount() - 1 + mRecyclerView.mAdapter.getFooterViewCount()
					: -mRecyclerView.mAdapter.getHeaderViewCount();
		}
		anchorItemPosition = mRecyclerView.validateAnchorItemPosition(anchorItemPosition);
		detachAndScrapAttachedViews(recycler);
		if (state.mDataChanged)
		{
			state.mDataChanged = false;
			// set current suspension View recyclable here
			if (mCurrentSuspentionView != null && !mRecyclerView.isRepeatableSuspensionMode())
			{
				RecyclerViewBase.ViewHolder suspensionViewHolder = mRecyclerView.getChildViewHolder(mCurrentSuspentionView);
				if (suspensionViewHolder != null)
				{
					suspensionViewHolder.setIsRecyclable(true);
				}
			}
			removeAndRecycleScrapInt(recycler, true, true);
		}
		final int extraForStart;
		final int extraForEnd;
		final int extra = getExtraLayoutSpace(state);
		boolean before = state.getTargetScrollPosition() < anchorItemPosition;
		if (before == mShouldReverseLayout)
		{
			extraForEnd = extra;
			extraForStart = 0;
		}
		else
		{
			extraForStart = extra;
			extraForEnd = 0;
		}
		// first fill towards start
		updateRenderStateToFillStart(anchorItemPosition, anchorCoordinate);
		mRenderState.mExtra = extraForStart;
		if (!layoutFromEnd)
		{
			mRenderState.mCurrentPosition += mRenderState.mItemDirection;
		}
		fill(recycler, mRenderState, state, false);
		int currPos = mRenderState.mCurrentPosition - mRenderState.mItemDirection;
		// Log.d("Scrollbar", "currPos=" + currPos);
		int startOffset = mRenderState.mOffset;
		if (mOrientation == VERTICAL)
		{
			//			Log.e("leo", "after fill mOffsetY " + mRecyclerView.mOffsetY);
			mRecyclerView.mOffsetY = getHeightBefore(currPos) - startOffset;
			//			Log.e("leo", "after fill == mOffsetY " + mRecyclerView.mOffsetY);
			//			Log.d("leo", "in onLayout offset=" + mRecyclerView.mOffsetY);
		}
		else if (mOrientation == HORIZONTAL)
		{

			mRecyclerView.mOffsetX = getHeightBefore(currPos) - startOffset;
			//			Log.d("leo", "in onLayout offset=" + mRecyclerView.mOffsetY);
		}
		// fill towards end
		updateRenderStateToFillEnd(anchorItemPosition, anchorCoordinate);
		mRenderState.mExtra = extraForEnd;
		if (layoutFromEnd)
		{
			mRenderState.mCurrentPosition += mRenderState.mItemDirection;
		}
		fill(recycler, mRenderState, state, false);
		int endOffset = mRenderState.mOffset;
		mRecyclerView.onItemsFill(endOffset);
		mRecyclerView.checkNotifyFooterAppearWithFewChild(endOffset);
		//		checkChildNotMuch(endOffset);
		// changes may cause gaps on the UI, try to fix them.
		if (getChildCount() > 0 && !mPreventFixGap && mRecyclerView.mState.mCustomHeaderHeight == 0)
		{
			// because layout from end may be changed by scroll to position
			// we re-calculate it.
			// find which side we should check for gaps.
			// if (mShouldReverseLayout ^ mStackFromEnd)
			// {
			// int fixOffset = fixLayoutEndGap(endOffset, recycler, state,
			// true);
			// startOffset += fixOffset;
			// endOffset += fixOffset;
			// fixOffset = fixLayoutStartGap(startOffset, recycler, state,
			// false);
			// startOffset += fixOffset;
			// endOffset += fixOffset;
			// }
			// else
			// {
			if (getHeight() <= mRecyclerView.mAdapter.getListTotalHeight())
			{
				int fixOffset = fixLayoutStartGap(startOffset, recycler, state, true);
				startOffset += fixOffset;
				// TODO:这里注释掉了，可以解决问题，但不知道会不会引起其他问题。
				// if (getHeight() <= mRecyclerView.mAdapter.getTotalHeight())
				// {
				endOffset += fixOffset;
				// }
				fixOffset = fixLayoutEndGap(endOffset, recycler, state, false);
				startOffset += fixOffset;
				endOffset += fixOffset;
			}
			else
			{
				//niuniuyang:如果内容小于屏幕高度了，如果mOffset不是原点，必须把list的offset重新回到原点
				int gap = mRecyclerView.mOffsetY - mOrientationHelper.getStartAfterPadding();
				if (gap != 0)
				{
					if (!doNotCheckAgain)
					{
						doNotCheckAgain = true;
						int firstPosition = -mRecyclerView.mAdapter.getHeaderViewCount();
						scrollToPositionWidthOffsetInLayout(firstPosition, mOrientationHelper.getStartAfterPadding());
					}
					else
					{
						doNotCheckAgain = false;
					}
				}
				else if (doNotCheckAgain)
				{
					doNotCheckAgain = false;
				}

			}
			// }
		}

		// If there are scrap children that we did not layout, we need to find
		// where they did go
		// and layout them accordingly so that animations can work as expected.
		// This case may happen if new views are added or an existing view
		// expands and pushes
		// another view out of bounds.
		if (getChildCount() > 0 && !state.isPreLayout() && supportsPredictiveItemAnimations())
		{
			// to make the logic simpler, we calculate the size of children and
			// call fill.
			int scrapExtraStart = 0, scrapExtraEnd = 0;
			final List<RecyclerViewBase.ViewHolder> scrapList = recycler.getScrapList();
			final int scrapSize = scrapList.size();
			final int firstChildPos = getPosition(getChildAt(0));
			for (int i = 0; i < scrapSize; i++)
			{
				RecyclerViewBase.ViewHolder scrap = scrapList.get(i);
				final int position = scrap.getPosition();
				final int direction = position < firstChildPos != mShouldReverseLayout ? RenderState.LAYOUT_START : RenderState.LAYOUT_END;
				if (direction == RenderState.LAYOUT_START)
				{
					scrapExtraStart += mOrientationHelper.getDecoratedMeasurement(scrap.itemView);
				}
				else
				{
					scrapExtraEnd += mOrientationHelper.getDecoratedMeasurement(scrap.itemView);
				}
			}

			if (DEBUG)
			{
//				Log.d(TAG, "for unused scrap, decided to add " + scrapExtraStart + " towards start and " + scrapExtraEnd + " towards end");
			}
			mRenderState.mScrapList = scrapList;
			if (scrapExtraStart > 0)
			{
				// View anchor = getChildClosestToStartInScreen();
				updateRenderStateToFillStart(getPosition(getChildClosestToStartByOrder()), startOffset);
				mRenderState.mExtra = scrapExtraStart;
				mRenderState.mAvailable = 0;
				mRenderState.mCurrentPosition += mShouldReverseLayout ? 1 : -1;
				fill(recycler, mRenderState, state, false);
			}

			if (scrapExtraEnd > 0)
			{
				// View anchor = getChildClosestToEndByOrder();
				updateRenderStateToFillEnd(getPosition(getChildClosestToEndByOrder()), endOffset);
				mRenderState.mExtra = scrapExtraEnd;
				mRenderState.mAvailable = 0;
				mRenderState.mCurrentPosition += mShouldReverseLayout ? -1 : 1;
				fill(recycler, mRenderState, state, false);
			}
			mRenderState.mScrapList = null;
		}
		removeSuspentions();
		ensureSuspentionState();
		mPendingScrollPosition = RecyclerViewBase.NO_POSITION;
		mPendingScrollPositionOffset = INVALID_OFFSET;
		mLastStackFromEnd = mStackFromEnd;
		mPendingGravity = Gravity.NO_GRAVITY;
		mPendingSavedState = null; // we don't need this anymore
		if (DEBUG)
		{
			// validateChildOrder();
		}
	}

	public void removeSuspentions()
	{
		if (mCurrentSuspentionView != null && mCurrentSuspentionView.getParent() == mRecyclerView)
		{
			mCurrentSuspentionView.clearAnimation();
			mRecyclerView.removeAnimatingView(mCurrentSuspentionView, true);
			mCurrentSuspentionView = null;
		}
	}

	public View getCurrentSuspentionView()
	{
		return mCurrentSuspentionView;
	}

	public int getCurrentSuspentionPosition()
	{
		return mCurrentSuspentionPos;
	}

	private boolean doNotCheckAgain = false;

	protected int getHeightBefore(int pos)
	{
		if (mRecyclerView != null)
		{
			return mRecyclerView.getHeightBefore(pos);
		}
		return 0;
	}

	/**
	 * @return The final offset amount for children
	 */
	private int fixLayoutEndGap(int endOffset, RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state, boolean canOffsetChildren)
	{
		// 下拉刷新的时候，刷新的位置距离顶部是有距离的，但是这个距离是主动调用了smoothScrollBy来消除的，所以这里不需要fixGap了，anyuanzhao
		if (mRecyclerView.isRefreshing() || mRecyclerView.mState.mCustomHeaderHeight > 0)
		{
			return 0;
		}
		int gap = mOrientationHelper.getEndAfterPadding() - endOffset;
		int fixOffset = 0;
		if (gap > 0)
		{
			state.overscroll = false;
			fixOffset = -scrollBy(-gap, recycler, state);
		}
		else
		{
			return 0; // nothing to fix
		}
		// move offset according to scroll amount
		endOffset += fixOffset;
		if (canOffsetChildren)
		{
			// re-calculate gap, see if we could fix it
			gap = mOrientationHelper.getEndAfterPadding() - endOffset;
			if (gap > 0)
			{
				mOrientationHelper.offsetChildren(gap);
				return gap + fixOffset;
			}
		}
		return fixOffset;
	}

	// private int fixLayoutEndGap(int endOffset, RecyclerView.Recycler
	// recycler, RecyclerView.State state, boolean canOffsetChildren)
	// {
	// int gap = mOrientationHelper.getEndAfterPadding() - endOffset;
	// int fixOffset = 0;
	// if (gap > 0)
	// {
	// // fixOffset = -scrollBy(-gap, recycler, state);
	// View view = getChildClosestToEndInVisual();
	// if (view != null && view instanceof DefaultFooterView)
	// {
	// Adapter adapter = mRecyclerView.getAdapter();
	// if (adapter != null && adapter instanceof QBRecyclerAdapter)
	// {
	// ((QBRecyclerAdapter) adapter).notifyLastFooterAppeared();
	// }
	// }
	// }
	// else
	// {
	// return 0; // nothing to fix
	// }
	// // // move offset according to scroll amount
	// // endOffset += fixOffset;
	// // if (canOffsetChildren)
	// // {
	// // // re-calculate gap, see if we could fix it
	// // gap = mOrientationHelper.getEndAfterPadding() - endOffset;
	// // if (gap > 0)
	// // {
	// // mOrientationHelper.offsetChildren(gap);
	// // return gap + fixOffset;
	// // }
	// // }
	// return fixOffset;
	// }

	/**
	 * @return The final offset amount for children
	 */
	private int fixLayoutStartGap(int startOffset, RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state, boolean canOffsetChildren)
	{
		// 下拉刷新的时候，刷新的位置距离顶部是有距离的，但是这个距离是主动调用了smoothScrollBy来消除的，所以这里不需要fixGap了，anyuanzhao
		if (mRecyclerView.isRefreshing())
		{
			return 0;
		}
		int gap = startOffset - mOrientationHelper.getStartAfterPadding();
		/*- ((mRecyclerView.mEnableRefresh && mRecyclerView.mMode != RecyclerView.MODE_EDIT) ? mRecyclerView.mQBRefreshHeader.mContentheight*/
		// : 0);
		int fixOffset = 0;
		if (gap > 0)
		{
			// check if we should fix this gap.
			state.overscroll = false;
			fixOffset = -scrollBy(gap, recycler, state);
		}
		else
		{
			return 0; // nothing to fix
		}
		startOffset += fixOffset;
		if (canOffsetChildren)
		{
			// re-calculate gap, see if we could fix it
			gap = startOffset - mOrientationHelper.getStartAfterPadding();
			// - ((mRecyclerView.mEnableRefresh && mRecyclerView.mMode !=
			// RecyclerView.MODE_EDIT) ?
			// mRecyclerView.mQBRefreshHeader.mContentheight
			// : 0);
			if (gap > 0)
			{
				mOrientationHelper.offsetChildren(-gap);
				return fixOffset - gap;
			}
		}
		return fixOffset;
	}

	protected void updateRenderStateToFillEnd(int itemPosition, int offset)
	{
		mRenderState.mAvailable = mOrientationHelper.getEndAfterPadding() - offset;
		mRenderState.mItemDirection = mShouldReverseLayout ? RenderState.ITEM_DIRECTION_HEAD : RenderState.ITEM_DIRECTION_TAIL;
		mRenderState.mCurrentPosition = itemPosition;
		mRenderState.mLayoutDirection = RenderState.LAYOUT_END;
		mRenderState.mOffset = offset;
		mRenderState.mScrollingOffset = RenderState.SCOLLING_OFFSET_NaN;
		if (DEBUG)
			mRenderState.log("updateRenderStateToFillEnd(" + itemPosition + "," + offset + ") ");
	}

	protected void updateRenderStateToFillStart(int itemPosition, int offset)
	{
		mRenderState.mAvailable = offset - mOrientationHelper.getStartAfterPadding();
		mRenderState.mCurrentPosition = itemPosition;
		mRenderState.mItemDirection = mShouldReverseLayout ? RenderState.ITEM_DIRECTION_TAIL : RenderState.ITEM_DIRECTION_HEAD;
		mRenderState.mLayoutDirection = RenderState.LAYOUT_START;
		mRenderState.mOffset = offset;
		mRenderState.mScrollingOffset = RenderState.SCOLLING_OFFSET_NaN;
		if (DEBUG)
			mRenderState.log("updateRenderStateToFillStart(" + itemPosition + "," + offset + ") ");
	}

	protected boolean isLayoutRTL()
	{
		return false;
	}


	protected void ensureRenderState()
	{
		if (mRenderState == null)
		{
			mRenderState = new RenderState();
		}
		if (mOrientationHelper == null)
		{
			mOrientationHelper = mOrientation == HORIZONTAL ? createHorizontalOrientationHelper() : createVerticalOrientationHelper();
		}
	}

	/**
	 * <p>
	 * Scroll the RecyclerView to make the position visible.
	 * </p>
	 * <p/>
	 * <p>
	 * RecyclerView will scroll the minimum amount that is necessary to make the
	 * target position visible. If you are looking for a similar behavior to
	 * {@link android.widget.ListView#setSelection(int)} or
	 * {@link android.widget.ListView#setSelectionFromTop(int, int)}, use
	 * {@link #scrollToPositionWithOffset(int, int)}.
	 * </p>
	 * <p/>
	 * <p>
	 * Note that scroll position change will not be reflected until the next
	 * layout call.
	 * </p>
	 *
	 * @param position
	 *            Scroll to this adapter position
	 * @see #scrollToPositionWithOffset(int, int)
	 */
	@Override
	public void scrollToPosition(int position)
	{
		mPendingScrollPosition = position;
		mPendingScrollPositionOffset = INVALID_OFFSET;
		requestLayout();
	}

	public int getPendingOffset()
	{
		return mPendingScrollPositionOffset;
	}

	@Override
	public void scrollToPositionWidthGravity(int position, int gravity, int itemHeight)
	{
		// TODO Auto-generated method stub
		mPendingScrollPosition = position;
		mPendingGravity = gravity;
		mPendingScrollPositionOffset = INVALID_OFFSET;
		mPendingScrollPositionItemHeight = itemHeight;
		requestLayout();
	}

	/**
	 * <p>
	 * Scroll to the specified adapter position with the given offset from
	 * layout start.
	 * </p>
	 * <p/>
	 * <p>
	 * Note that scroll position change will not be reflected until the next
	 * layout call.
	 * </p>
	 * <p/>
	 * <p>
	 * If you are just trying to make a position visible, use
	 * {@link #scrollToPosition(int)}.
	 * </p>
	 *
	 * @param position
	 *            Index (starting at 0) of the reference item.
	 * @param offset
	 *            The distance (in pixels) between the start edge of the item
	 *            view and start edge of the RecyclerView.
	 * @see #setReverseLayout(boolean)
	 * @see #scrollToPosition(int)
	 */
	public void scrollToPositionWithOffset(int position, int offset)
	{
		mPendingScrollPosition = position;
		mPendingScrollPositionOffset = offset;
		requestLayout();
	}

	public void scrollToPositionWidthOffsetInLayout(int position, int offset)
	{
		mPendingGravity = Gravity.NO_GRAVITY;
		mPendingScrollPosition = position;
		mPendingScrollPositionOffset = offset;
		mRecyclerView.dispatchLayout();
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public int scrollHorizontallyBy(int dx, RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state)
	{
		if (mOrientation == VERTICAL)
		{
			return 0;
		}
		state.overscroll = true;
		return scrollBy(dx, recycler, state);
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public int scrollVerticallyBy(int dy, RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state)
	{
		if (mOrientation == HORIZONTAL)
		{
			return 0;
		}
		if (Math.abs(dy) > getHeight() * 1.5f)
		{
			int newDy = dy;
			if (mRecyclerView.mOffsetY + dy < -mRecyclerView.getSpringBackMaxDistance())
			{
				newDy = -mRecyclerView.getSpringBackMaxDistance() - mRecyclerView.mOffsetY;
			}
			else if (mRecyclerView.mOffsetY + dy > mRecyclerView.mAdapter.getListTotalHeight() + mRecyclerView.getSpringBackMaxDistance())
			{
				newDy = mRecyclerView.mAdapter.getListTotalHeight() + mRecyclerView.getSpringBackMaxDistance() - mRecyclerView.mOffsetY;
			}
			int newOffsetY = mRecyclerView.mOffsetY + newDy;
			int[] target = mRecyclerView.mAdapter.getBeginPositionWithOffset(newOffsetY);
			mRecyclerView.mLayout.mPendingScrollPosition = target[0];
			mRecyclerView.mLayout.mPendingScrollPositionOffset = target[1];
			mRecyclerView.dispatchLayout();
			return Math.abs(newDy);
		}
		else
		{
			state.overscroll = true;
			return scrollBy(dy, recycler, state);
		}
	}

	@Override
	public int computeHorizontalScrollOffset(RecyclerViewBase.State state)
	{
		if (getChildCount() == 0)
		{
			return 0;
		}
		final int topPosition = getPosition(getChildClosestToStartByOrder());
		return mShouldReverseLayout ? state.getItemCount() - 1 - topPosition : topPosition;
	}

	@Override
	public int computeVerticalScrollOffset(RecyclerViewBase.State state)
	{
		if (getChildCount() == 0)
		{
			return 0;
		}
		final int topPosition = getPosition(getChildClosestToStartByOrder());
		return mShouldReverseLayout ? state.getItemCount() - 1 - topPosition : topPosition;
	}

	@Override
	public int computeHorizontalScrollExtent(RecyclerViewBase.State state)
	{
		return getChildCount();
	}

	@Override
	public int computeVerticalScrollExtent(RecyclerViewBase.State state)
	{
		return getChildCount();
	}

	@Override
	public int computeHorizontalScrollRange(RecyclerViewBase.State state)
	{
		return state.getItemCount();
	}

	@Override
	public int computeVerticalScrollRange(RecyclerViewBase.State state)
	{
		return state.getItemCount();
	}

	protected void updateRenderState(int layoutDirection, int requiredSpace, boolean canUseExistingSpace, RecyclerViewBase.State state)
	{
		mRenderState.mExtra = getExtraLayoutSpace(state);
		mRenderState.mLayoutDirection = layoutDirection;
		int fastScrollSpace;
		if (layoutDirection == RenderState.LAYOUT_END)
		{
			// get the first child in the direction we are going
			// final View child = getChildClosestToEndInVisual();
			if (DEBUG)
			{
				// Log.d(TAG, "child close to end=" + getPosition(child));
			}

			// the direction in which we are traversing children
			mRenderState.mItemDirection = mShouldReverseLayout ? RenderState.ITEM_DIRECTION_HEAD : RenderState.ITEM_DIRECTION_TAIL;
			mRenderState.mCurrentPosition = getPosition(getChildClosestToEndByOrder()) + mRenderState.mItemDirection;
			// Log.d(TAG, "currPos=" + mRenderState.mCurrentPosition +
			// ",itemCount=" + state.mItemCount);
			mRenderState.mOffset = mOrientationHelper.getDecoratedEnd(getChildClosestToEndInScreen());
			// calculate how much we can scroll without adding new children
			// (independent of layout)
			fastScrollSpace = mOrientationHelper.getDecoratedEnd(getChildClosestToEndInScreen()) - mOrientationHelper.getEndAfterPadding();

		}
		else
		{
			// final View child = getChildClosestToStartInVisual();
			mRenderState.mItemDirection = mShouldReverseLayout ? RenderState.ITEM_DIRECTION_TAIL : RenderState.ITEM_DIRECTION_HEAD;
			mRenderState.mCurrentPosition = getPosition(getChildClosestToStartByOrder()) + mRenderState.mItemDirection;
			// getDecoratedStart是child的top
			mRenderState.mOffset = mOrientationHelper.getDecoratedStart(getChildClosestToStartInScreen());
			// getStartAfterPadding是recyclerview的top
			fastScrollSpace = -mOrientationHelper.getDecoratedStart(getChildClosestToStartInScreen()) + mOrientationHelper.getStartAfterPadding();
		}
//		if (DEBUG)
//			Log.d(TAG, "updateRenderState layoutDirection=" + layoutDirection + " mRenderState.mOffset=" + mRenderState.mOffset);
		mRenderState.mAvailable = requiredSpace;
		if (canUseExistingSpace)
		{
			mRenderState.mAvailable -= fastScrollSpace;
		}
		mRenderState.overscroll = state.overscroll;
		mRenderState.mScrollingOffset = fastScrollSpace;
	}

	long time = 0;

	private int scrollBy(int dy, RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state)
	{

		time = System.currentTimeMillis();
		if (getChildCount() == 0 || dy == 0)
		{
			return 0;
		}
		ensureRenderState();
		final int layoutDirection = dy > 0 ? RenderState.LAYOUT_END : RenderState.LAYOUT_START;
		final int absDy = Math.abs(dy);
		// if (DEBUG)
		// {
		// if (mCurrentSuspension != -1)
		// Log.d(TAG, "before scroll!," + "mCurrentPos=" + mCurrentSuspension +
		// ",offset=" + mSuspensionOffset + "v.getTop="
		// + mRecyclerView.getAnimatingView(mCurrentSuspension,
		// RecyclerView.INVALID_TYPE).getTop());
		// }
		// ensureSuspensionState(layoutDirection);
		updateRenderState(layoutDirection, absDy, true, state);
		final int freeScroll = mRenderState.mScrollingOffset;
		//Log.e("RecyclerView", "start scroll---------------------dy=" + dy);
		final int consumed = freeScroll + fill(recycler, mRenderState, state, false);
		if (consumed < 0)
		{
			if (DEBUG)
			{
//				Log.d(TAG, "Don't have any more elements to scroll");
			}
			return 0;

		}
		final int scrolled = absDy > consumed ? layoutDirection * consumed : dy;
		mOrientationHelper.offsetChildren(-scrolled);
		if (DEBUG)
		{
//			Log.d("leo", "scroll req: " + dy + " scrolled: " + scrolled);
		}
		ensureSuspentionState();
		if (DEBUG)
		{
			// if (mCurrentSuspension != -1)
			// Log.d(TAG, "after scroll!," + "mCurrentPos=" + mCurrentSuspension
			// + ",offset=" + mSuspensionOffset + "v.getTop="
			// + mRecyclerView.getAnimatingView(mCurrentSuspension,
			// RecyclerView.INVALID_TYPE).getTop());
		}
		final int preloadThresholdInPixel = mRecyclerView.mAdapter.getPreloadThresholdInPixels();
		final int preloadThresholdInItemNumber = mRecyclerView.mAdapter.getPreloadThresholdInItemNumber();
		if (preloadThresholdInPixel > 0 && mRecyclerView.getHeight() < state.mTotalHeight) // 根据离end的距离，触发预加载
		{
			if (mRecyclerView.mOffsetY + preloadThresholdInPixel + mRecyclerView.getHeight() < state.mTotalHeight
					&& mRecyclerView.mOffsetY + preloadThresholdInPixel + scrolled + mRecyclerView.getHeight() >= state.mTotalHeight)
			{
				mRecyclerView.mAdapter.onPreload();
			}
		}
		else if (preloadThresholdInItemNumber > 0 && mRecyclerView.getHeight() < state.mTotalHeight) // 根据离end的item个数，触发预加载
		{
			int currentPosHeight = mRecyclerView.mAdapter.getHeightBefore(mRenderState.mCurrentPosition - mRenderState.mItemDirection);
			if (mRenderState.mCurrentPosition == getItemCount() - preloadThresholdInItemNumber
					&& mRecyclerView.mOffsetY + mRecyclerView.getHeight() < currentPosHeight
					&& mRecyclerView.mOffsetY + scrolled + mRecyclerView.getHeight() >= currentPosHeight)
			{
				mRecyclerView.mAdapter.onPreload();
			}
		}
		if (mOrientation == HORIZONTAL)
		{
			mRecyclerView.mOffsetX += scrolled;
		}
		else
		{
			//			Log.e("leo", "scrollBy mOffsetY " + mRecyclerView.mOffsetY);
			mRecyclerView.mOffsetY += scrolled;
			//			Log.e("leo", "scrollBy ===mOffsetY " + mRecyclerView.mOffsetY);
		}
		//		Log.d("leo", "scrollBy offset=" + mRecyclerView.mOffsetY);
		mPreventFixGap = mRecyclerView.isInOverScrollArea();
		// Log.d(TAG, "scrollY=" + mRecyclerView.mOffsetY + "height=" +
		// getHeight());
		return scrolled;
	}


	private void ensureSuspentionState()
	{
		if (!mRecyclerView.hasSuspentedItem())
		{
			return;
		}

		final int count = getChildCount();
		if (count == 0)
		{
			return;
		}
//		Log.d("leo", "ensureSuspensionState,count=" + count);
		// Log.d("leo", "--------------------------------");
		View startView = getChildClosestToStartByOrder();
		int startPos = getPosition(startView);
		if (startView.getTop() > 0)
		{
			showCurrentSuspention(RecyclerViewBase.NO_POSITION);
			return;
		}
		// int top = getDecoratedStart(startView);
		int lastSuspentedPos = mRecyclerView.findPrevSuspentedPos(startPos);
		if (lastSuspentedPos != -1)
		{
			showCurrentSuspention(lastSuspentedPos);
		}
		// Log.d("TMYSUS", "start=" + startPos + ",last=" + lastSuspendedPos);
		if (mCurrentSuspentionView != null && mCurrentSuspentionView.getParent() == mRecyclerView)
		{
			int currentHeight = mCurrentSuspentionView.getMeasuredHeight();
			int nextSuspendedPos = mRecyclerView.findNextSuspentedPos(startPos);
			View nextSuspentedView = null;
			if (nextSuspendedPos != -1)
			{
				nextSuspentedView = findViewByPosition(nextSuspendedPos);
			}
			int nextTop = nextSuspentedView == null ? Integer.MAX_VALUE : nextSuspentedView.getTop();
			if (nextTop < currentHeight)
			{
				mCurrentSuspentionView.offsetTopAndBottom(nextTop - currentHeight);
			}
			// Log.d("TMYSUS", "next=" + nextSuspendedPos + ",nextTop=" +
			// nextTop + ",currHeight=" + currentHeight);
		}


	}


	// private void ensureSuspentionState(int layoutDirection)
	// {
	// if (!mRecyclerView.hasSuspentedItem())
	// {
	// return;
	// }
	// final int count = getChildCount();
	// if (count == 0)
	// {
	// return;
	// }
	// int startPos = getPosition(getChildClosestToStartByOrder());
	// if (layoutDirection == RenderState.LAYOUT_NO_DIRECTION)
	// {
	// mCurrentSuspentionView = -1;
	// if (mSuspentions != null)
	// {
	// mSuspentions.clear();
	// mSuspentions = null;
	// }
	// mSuspentedAreaSize = 0;
	// adjustfillPos(startPos);
	// mSuspentionOffset = 0;
	// if (mCurrentSuspentionView != -1 && mSuspentedAreaSize != 0)
	// {
	// for (int i = 0; i < count; i++)
	// {
	// View suspentionCandidate = getChildAt(i);
	// if (suspentionCandidate instanceof QBRecyclerViewItem)
	// {
	// QBRecyclerViewItem suspention = (QBRecyclerViewItem) suspentionCandidate;
	// if (suspention.mHolder != null && mRecyclerView.getAdapter() != null)
	// {
	// boolean isSuspention = suspention.mHolder.isSuspentedItem();
	// if (isSuspention)
	// {
	// mSuspentionOffset = Math.max(Math.min(suspention.getTop(),
	// mSuspentedAreaSize), 0);
	// break;
	// }
	// }
	// }
	// }
	// }
	// applyChildOffset();
	// return;
	// }
	//
	// int i = 0;
	// for (i = 0; i < count; i++)
	// {
	// View suspentionCandidate = getChildAt(i);
	// if (suspentionCandidate instanceof QBRecyclerViewItem)
	// {
	// QBRecyclerViewItem suspention = (QBRecyclerViewItem) suspentionCandidate;
	// if (suspention.mHolder != null && mRecyclerView.getAdapter() != null)
	// {
	// boolean isSuspention = suspention.mHolder.isSuspentedItem();
	// int baseLine = mOrientationHelper.getDecoratedStart(suspentionCandidate);
	// if (isSuspention)
	// {
	// // 上滑
	// if (layoutDirection == RenderState.LAYOUT_END)
	// {
	// // 推上去
	// if (0 < baseLine && baseLine < mSuspentedAreaSize &&
	// mCurrentSuspentionView != suspention.mHolder.mPosition)
	// {
	// int suspentionOffset = baseLine - mSuspentedAreaSize;
	// adjustfillPos(suspention.mHolder.mPosition - 1);
	// setSuspentionOffset(suspentionOffset);
	// break;
	// }
	// // 换悬浮条目
	// if (mCurrentSuspentionView < suspention.mHolder.mPosition && baseLine <=
	// 0)
	// {
	// setSuspentionOffset(0);
	// adjustfillPos(suspention.mHolder.mPosition);
	// break;
	// }
	// }
	// // 下滑
	// else if (layoutDirection == RenderState.LAYOUT_START)
	// {
	// View sus = findViewByPosition(suspention.mHolder.mPosition);
	// if (sus != null)
	// {
	// int start = mOrientationHelper.getDecoratedStart(sus);
	// if (start >= 0)
	// {
	// if (start >= mOldSuspentedAreaSize)
	// {
	// start = mOldSuspentedAreaSize;
	// }
	// setSuspentionOffset(start - mOldSuspentedAreaSize);
	// adjustRemovePos(suspention.mHolder.mPosition - 1);
	// break;
	// }
	// }
	// }
	// }
	// }
	// }
	// }
	// if (i == count)
	// {
	// if (layoutDirection == RenderState.LAYOUT_END)
	// {
	// adjustfillPos(startPos - 1);
	// }
	// else
	// {
	// setSuspentionOffset(0);
	// adjustRemovePos(startPos);
	// }
	// }
	// applyChildOffset();
	// }
	//
	// private void adjustRemovePos(int pos)
	// {
	// mCurrentSuspentionView = showOldSuspentedChild(pos);
	// mOldSuspentedAreaSize = mSuspentedAreaSize;
	// mSuspentedAreaSize = getCurrentSuspentionChildHeight();
	// }
	//
	// private void adjustfillPos(int pos)
	// {
	// if (pos < mCurrentSuspentionView)
	// {
	// return;
	// }
	// fillBetween(mCurrentSuspentionView, pos);
	// mCurrentSuspentionView = showCurrentSuspention();
	// mOldSuspentedAreaSize = mSuspentedAreaSize;
	// mSuspentedAreaSize = getCurrentSuspentionChildHeight();
	// }

	// private void applyChildOffset()
	// {
	// if (DEBUG)
	// {
	// Log.d("TMYSUS", "after ensuresuspen! " + "mCurrentSus=" +
	// mCurrentSuspentionView);
	// }
	// // TODO Auto-generated method stub
	// if (mCurrentSuspentionView != -1)
	// {
	// View v = mRecyclerView.getAnimatingView(mCurrentSuspentionView,
	// RecyclerView.INVALID_TYPE);
	// if (v != null && v.getParent() == mRecyclerView)
	// {
	// v.offsetTopAndBottom(mSuspentionOffset - v.getTop());
	// // Log.d(TAG, "after ensuresuspen! " + "v.getTop=" +
	// // v.getTop());
	// }
	// }
	// }
	//
	// private void fillBetween(int start, int end)
	// {
	// Adapter<ViewHolder> adapter = mRecyclerView.getAdapter();
	// if (adapter != null)
	// {
	// for (int i = start + 1; i <= end; i++)
	// {
	// if (isSuspentedItem(i))
	// {
	// addSuspentions(i);
	// }
	// }
	// }
	// }

	// public static class SuspentionInfo
	// {
	// public int mSuspentionPos;
	// public ViewHolder vh;
	//
	// public SuspentionInfo(int s, ViewHolder holder)
	// {
	// vh = holder;
	// mSuspentionPos = s;
	// }
	//
	// @Override
	// public String toString()
	// {
	// // TODO Auto-generated method stub
	// return "mPos=" + mSuspentionPos;
	// }
	// }
	//
	// public int getCurrentSuspentionChildHeight()
	// {
	// if (mSuspentions != null && mSuspentions.size() != 0 &&
	// mSuspentions.lastElement() != null)
	// {
	// SuspentionInfo sii = mSuspentions.lastElement();
	// if (sii.vh != null)
	// {
	// return sii.vh.itemView.getHeight();
	// }
	// }
	// return 0;
	// }

	// public int showOldSuspentedChild(int endPos)
	// {
	// removeSuspentions(endPos);
	// return showCurrentSuspention();
	// }

	// public void setSuspentionOffset(int offset)
	// {
	// mSuspentionOffset = offset;
	// }
	//
	// public void addSuspentions(int i)
	// {
	// if (mSuspentions == null)
	// {
	// mSuspentions = new Stack<SuspentionInfo>();
	// mSuspentions.push(new SuspentionInfo(-1, null));
	// }
	// mSuspentions.push(new SuspentionInfo(i, null));
	// if (DEBUG)
	// {
	// Log.d("TMYSUS", "after add " + Arrays.toString(mSuspentions.toArray()));
	// }
	// }
	//
	// public void removeSuspentions(int endPos)
	// {
	// while (mSuspentions != null && !mSuspentions.empty())
	// {
	// SuspentionInfo si = mSuspentions.lastElement();
	// if (si.mSuspentionPos > endPos)
	// {
	// SuspentionInfo poped = mSuspentions.pop();
	// if (poped.vh != null)
	// {
	// poped.vh.setIsRecyclable(true);
	// mRecyclerView.removeAnimatingView(poped.vh.itemView);
	// }
	// if (DEBUG)
	// {
	// Log.d("TMYSUS", "after pop " + Arrays.toString(mSuspentions.toArray()));
	// }
	// }
	// else
	// {
	// break;
	// }
	// }
	// }

	protected void handleRecordItemHeightChange(int index, int oldItemHeight, int newItemHeight)
	{

	}

	protected void recordItemSize(int index, View itemView)
	{
		if (mRecyclerView != null && mRecyclerView.getAdapter() != null)
		{
			if (mRecyclerView.getAdapter() instanceof RecyclerAdapter)
			{
				RecyclerAdapter adapter = (RecyclerAdapter) mRecyclerView.getAdapter();
				if (adapter.isAutoCalculateItemHeight())
				{
					//					// Height
					//					int itemHeight = itemView.getMeasuredHeight();
					//					if (adapter.mItemHeightList == null)
					//					{
					//						adapter.mItemHeightList = new ArrayList<>(adapter.getItemCount());
					//					}
					//					if (adapter.mItemHeightList.size() > index)
					//					{
					//						//						Log.e("leo", "set itemHeight " + adapter.mItemHeightList.get(index) + ", " + itemHeight + ", " + index);
					//						int oldItemHeight = adapter.mItemHeightList.get(index);
					//						mRecyclerView.mState.mTotalHeight -= oldItemHeight;
					//						adapter.mItemHeightList.set(index, itemHeight);
					//						mRecyclerView.mState.mTotalHeight += itemHeight;
					//						Log.e("leolistnew", "replace index " + index + " old " + oldItemHeight + " new " + itemHeight);
					//						handleRecordItemHeightChange(index, oldItemHeight, itemHeight);
					//						//						Log.e("leo", "mTotalHeight " + mRecyclerView.mState.mTotalHeight);
					//					}
					//					else if (adapter.mItemHeightList.size() == index)
					//					{
					//						//						Log.e("leo", "add itemHeight " + itemHeight + ", " + index);
					//						adapter.mItemHeightList.add(itemHeight);
					//						mRecyclerView.mState.mTotalHeight += itemHeight;
					//						Log.e("leolistnew", "new index " + index + " new " + itemHeight);
					//						//						Log.e("leo", "mTotalHeight " + mRecyclerView.mState.mTotalHeight);
					//					}
					//					else
					//					{
					//						Log.e("leolistnew", "recordItemSize with wrong index " + index + ", itemHeight " + itemHeight + ", listSize "
					//								+ adapter.mItemHeightList.size());
					//						LogUtils.e(TAG, "recordItemSize with wrong index " + index + ", itemHeight " + itemHeight + ", listSize "
					//								+ adapter.mItemHeightList.size());
					//					}

					// Width
					int itemWidth = itemView.getMeasuredWidth();
					if (adapter.mItemWidthList == null)
					{
						adapter.mItemWidthList = new ArrayList<>(adapter.getItemCount());
					}
					if (adapter.mItemWidthList.size() > index)
					{
						//						Log.e("leo", "set itemWidth " + adapter.mItemWidthList.get(index) + ", " + itemWidth + ", " + index);
						adapter.mItemWidthList.set(index, itemWidth);
					}
					else if (adapter.mItemWidthList.size() == index)
					{
						//						Log.e("leo", "add itemWidth " + itemWidth + ", " + index);
						adapter.mItemWidthList.add(itemWidth);
					}
					else
						Log.e(TAG, "recordItemSize with wrong index " + index + ", itemWidth " + itemWidth + ", listSize "
								+ adapter.mItemWidthList.size());

				}
			}
		}
	}

	public void showCurrentSuspention(int position)
	{
		// TODO Auto-generated method stub
		Log.d("TMYHIS", "showCurrentSuspention=");
		mRecyclerView.mAnimatingViewPrevPos = mRecyclerView.mAnimatingViewPos;
		mRecyclerView.mAnimatingViewPos = position;
		mCurrentSuspentionPos = position;
		removeSuspentions();
		if (position == RecyclerViewBase.NO_POSITION || mRecyclerView.mRecycler == null)
		{
			mCurrentSuspentionView = null;
			return;
		}
		View v;
		if (mRecyclerView.isRepeatableSuspensionMode())
		{
			v = mRecyclerView.mRecycler.getViewForPosition(position);
		}
		else
		{
			v = mRecyclerView.mRecycler.getSuspendViewForPosition(position);
		}
		if (v == null)
		{
			return;
		}
		measureChildWithMargins(v, 0, 0);
		layoutDecorated(v, 0, 0, v.getMeasuredWidth(), v.getMeasuredHeight());
		// addView(v);
		mRecyclerView.addAnimatingView(v, true);
		mCurrentSuspentionView = v;
		// ViewCompat.setAlpha(v, SUSPEND_ITEM_ALPHA);
		RecyclerViewBase.ViewHolder vh = mRecyclerView.getChildViewHolder(v);
		if (vh.isRecyclable())
		{
			vh.setIsRecyclable(false);
		}
	}

	/**
	 * Recycles children between given indices.
	 *
	 * @param startIndex
	 *            inclusive
	 * @param endIndex
	 *            exclusive
	 */
	private void recycleChildren(RecyclerViewBase.Recycler recycler, int startIndex, int endIndex)
	{
		if (startIndex == endIndex)
		{
			return;
		}
		if (DEBUG)
		{
			Log.d("RecyclerView", "Recycling " + Math.abs(startIndex - endIndex) + " items" + ",from " + startIndex + " to " + (endIndex - 1));
		}
		if (endIndex > startIndex)
		{
			for (int i = endIndex - 1; i >= startIndex; i--)
			{
				removeAndRecycleViewAt(i, recycler);
			}
		}
		else
		{
			for (int i = startIndex; i > endIndex; i--)
			{
				removeAndRecycleViewAt(i, recycler);
			}
		}
	}

	/**
	 * Recycles views that went out of bounds after scrolling towards the end of
	 * the layout.
	 *
	 * @param recycler
	 *            Recycler instance of
	 *            {@link RecyclerViewBase}
	 * @param dt
	 *            This can be used to add additional padding to the visible
	 *            area. This is used to detect children that will go out of
	 *            bounds after scrolling, without actually moving them.
	 */
	private void recycleViewsFromStart(RecyclerViewBase.Recycler recycler, int dt)
	{
		if (dt < 0)
		{
			if (DEBUG)
			{
				Log.d(TAG, "Called recycle from start with a negative value. This might happen" + " during layout changes but may be sign of a bug");
			}
			// return;
			dt = 0;
		}
		final int limit = mOrientationHelper.getStartAfterPadding() + dt;
		final int childCount = getChildCount();
		if (mShouldReverseLayout)
		{
			for (int i = childCount - 1; i >= 0; i--)
			{
				View child = getChildAt(i);
				if (mOrientationHelper.getDecoratedEnd(child) > limit)
				{// stop
					// here
					recycleChildren(recycler, childCount - 1, i);
					return;
				}
			}
		}
		else
		{
			for (int i = 0; i < childCount; i++)
			{
				View child = getChildAt(i);
				if (mOrientationHelper.getDecoratedEnd(child) > limit)
				{// stop
					// here
					recycleChildren(recycler, 0, i);
					return;
				}
			}
		}
	}

	/**
	 * Recycles views that went out of bounds after scrolling towards the start
	 * of the layout.
	 *
	 * @param recycler
	 *            Recycler instance of
	 *            {@link RecyclerViewBase}
	 * @param dt
	 *            This can be used to add additional padding to the visible
	 *            area. This is used to detect children that will go out of
	 *            bounds after scrolling, without actually moving them.
	 */
	private void recycleViewsFromEnd(RecyclerViewBase.Recycler recycler, int dt)
	{
		final int childCount = getChildCount();
		if (dt < 0)
		{
			if (DEBUG)
			{
				Log.d(TAG, "Called recycle from end with a negative value. This might happen" + " during layout changes but may be sign of a bug");
			}
			// return;
			dt = 0;
		}
		final int limit = mOrientationHelper.getEndAfterPadding() - dt;
		if (mShouldReverseLayout)
		{
			for (int i = 0; i < childCount; i++)
			{
				View child = getChildAt(i);
				if (mOrientationHelper.getDecoratedStart(child) < limit)
				{// stop
					// here
					recycleChildren(recycler, 0, i);
					return;
				}
			}
		}
		else
		{
			for (int i = childCount - 1; i >= 0; i--)
			{
				View child = getChildAt(i);
				if (mOrientationHelper.getDecoratedStart(child) < limit)
				{// stop
					// here
					recycleChildren(recycler, childCount - 1, i);
					return;
				}
			}
		}

	}

	/**
	 * Helper method to call appropriate recycle method depending on current
	 * render layout direction
	 *
	 * @param recycler
	 *            Current recycler that is attached to RecyclerView
	 * @param renderState
	 *            Current render state. Right now, this object does not change
	 *            but we may consider moving it out of this view so passing
	 *            around as a parameter for now, rather than accessing
	 *            {@link #mRenderState}
	 * @see #recycleViewsFromStart(RecyclerViewBase.Recycler,
	 *      int)
	 * @see #recycleViewsFromEnd(RecyclerViewBase.Recycler,
	 *      int)
	 * @see LinearLayoutManager.RenderState#mLayoutDirection
	 */
	protected void recycleByRenderState(RecyclerViewBase.Recycler recycler, RenderState renderState)
	{
		//Log.e("RecyclerView", "recycleByRenderState");
		if (renderState.mLayoutDirection == RenderState.LAYOUT_START)
		{
			recycleViewsFromEnd(recycler, renderState.mScrollingOffset);
		}
		else
		{
			recycleViewsFromStart(recycler, renderState.mScrollingOffset);
		}
	}

	/**
	 * The magic functions :). Fills the given layout, defined by the
	 * renderState. This is fairly independent from the rest of the
	 * {@link LinearLayoutManager} and
	 * with little change, can be made publicly available as a helper class.
	 *
	 * @param recycler
	 *            Current recycler that is attached to RecyclerView
	 * @param renderState
	 *            Configuration on how we should fill out the available space.
	 * @param state
	 *            Context passed by the RecyclerView to control scroll steps.
	 * @param stopOnFocusable
	 *            If true, filling stops in the first focusable new child
	 * @return Number of pixels that it added. Useful for scoll functions.
	 */
	protected abstract int fill(RecyclerViewBase.Recycler recycler, RenderState renderState, RecyclerViewBase.State state, boolean stopOnFocusable);

	/**
	 * Converts a focusDirection to orientation.
	 *
	 * @param focusDirection
	 *            One of {@link View#FOCUS_UP},
	 *            {@link View#FOCUS_DOWN},
	 *            {@link View#FOCUS_LEFT},
	 *            {@link View#FOCUS_RIGHT},
	 *            {@link View#FOCUS_BACKWARD},
	 *            {@link View#FOCUS_FORWARD} or 0 for not
	 *            applicable
	 * @return {@link RenderState#LAYOUT_START} or
	 *         {@link RenderState#LAYOUT_END} if focus direction is applicable
	 *         to current state, {@link RenderState#INVALID_LAYOUT} otherwise.
	 */
	private int convertFocusDirectionToLayoutDirection(int focusDirection)
	{
		switch (focusDirection)
		{
			case View.FOCUS_BACKWARD:
				return RenderState.LAYOUT_START;
			case View.FOCUS_FORWARD:
				return RenderState.LAYOUT_END;
			case View.FOCUS_UP:
				return mOrientation == VERTICAL ? RenderState.LAYOUT_START : RenderState.INVALID_LAYOUT;
			case View.FOCUS_DOWN:
				return mOrientation == VERTICAL ? RenderState.LAYOUT_END : RenderState.INVALID_LAYOUT;
			case View.FOCUS_LEFT:
				return mOrientation == HORIZONTAL ? RenderState.LAYOUT_START : RenderState.INVALID_LAYOUT;
			case View.FOCUS_RIGHT:
				return mOrientation == HORIZONTAL ? RenderState.LAYOUT_END : RenderState.INVALID_LAYOUT;
			default:
				if (DEBUG)
				{
					Log.d(TAG, "Unknown focus request:" + focusDirection);
				}
				return RenderState.INVALID_LAYOUT;
		}

	}

	/**
	 * Convenience method to find the child closes to start. Caller should check
	 * it has enough children.
	 *
	 * @return The child closes to start of the layout from user's perspective.
	 */
	public View getChildClosestToStartInScreen()
	{
		return getChildAt(mShouldReverseLayout ? getChildCount() - 1 : 0);
	}

	public View getChildClosestToStartByOrder()
	{
		return getChildAt(mShouldReverseLayout ? getChildCount() - 1 : 0);
	}

	/**
	 * Convenience method to find the child closes to end. Caller should check
	 * it has enough children.
	 *
	 * @return The child closes to end of the layout from user's perspective.
	 */
	public View getChildClosestToEndInScreen()
	{
		return getChildAt(mShouldReverseLayout ? 0 : getChildCount() - 1);
	}

	public View getChildClosestToEndByOrder()
	{
		return getChildAt(mShouldReverseLayout ? 0 : getChildCount() - 1);
	}

	/**
	 * Returns the adapter position of the first visible view.
	 * <p/>
	 * Note that, this value is not affected by layout orientation or item order
	 * traversal. ({@link #setReverseLayout(boolean)}). Views are sorted by
	 * their positions in the adapter, not in the layout.
	 * <p/>
	 * If RecyclerView has item decorators, they will be considered in
	 * calculations as well.
	 * <p/>
	 * LinearLayoutManager may pre-cache some views that are not necessarily
	 * visible. Those views are ignored in this method.
	 *
	 * @return The adapter position of the first visible item or
	 *         {@link RecyclerViewBase#NO_POSITION}
	 *         if there aren't any visible items.
	 * @see #findFirstCompletelyVisibleItemPosition()
	 * @see #findLastVisibleItemPosition()
	 */
	public int findFirstVisibleItemPosition()
	{
		return findOneVisibleChild(0, getChildCount(), false);
	}

	/**
	 * Returns the adapter position of the first fully visible view.
	 * <p/>
	 * Note that bounds check is only performed in the current orientation. That
	 * means, if LinearLayoutManager is horizontal, it will only check the
	 * view's left and right edges.
	 *
	 * @return The adapter position of the first fully visible item or
	 *         {@link RecyclerViewBase#NO_POSITION}
	 *         if there aren't any visible items.
	 * @see #findFirstVisibleItemPosition()
	 * @see #findLastCompletelyVisibleItemPosition()
	 */
	public int findFirstCompletelyVisibleItemPosition()
	{
		return findOneVisibleChild(0, getChildCount(), true);
	}

	/**
	 * Returns the adapter position of the last visible view.
	 * <p/>
	 * Note that, this value is not affected by layout orientation or item order
	 * traversal. ({@link #setReverseLayout(boolean)}). Views are sorted by
	 * their positions in the adapter, not in the layout.
	 * <p/>
	 * If RecyclerView has item decorators, they will be considered in
	 * calculations as well.
	 * <p/>
	 * LinearLayoutManager may pre-cache some views that are not necessarily
	 * visible. Those views are ignored in this method.
	 *
	 * @return The adapter position of the last visible view or
	 *         {@link RecyclerViewBase#NO_POSITION}
	 *         if there aren't any visible items.
	 * @see #findLastCompletelyVisibleItemPosition()
	 * @see #findFirstVisibleItemPosition()
	 */
	public int findLastVisibleItemPosition()
	{
		return findOneVisibleChild(getChildCount() - 1, -1, false);
	}

	/**
	 * Returns the adapter position of the last fully visible view.
	 * <p/>
	 * Note that bounds check is only performed in the current orientation. That
	 * means, if LinearLayoutManager is horizontal, it will only check the
	 * view's left and right edges.
	 *
	 * @return The adapter position of the last fully visible view or
	 *         {@link RecyclerViewBase#NO_POSITION}
	 *         if there aren't any visible items.
	 * @see #findLastVisibleItemPosition()
	 * @see #findFirstCompletelyVisibleItemPosition()
	 */
	public int findLastCompletelyVisibleItemPosition()
	{
		return findOneVisibleChild(getChildCount() - 1, -1, true);
	}

	int findOneVisibleChild(int fromIndex, int toIndex, boolean completelyVisible)
	{
		if (mOrientationHelper == null) // 异常情况返回-1
			return -1;
		final int start = mOrientationHelper.getStartAfterPadding();
		final int end = mOrientationHelper.getEndAfterPadding();
		final int next = toIndex > fromIndex ? 1 : -1;
		for (int i = fromIndex; i != toIndex; i += next)
		{
			final View child = getChildAt(i);
			final int childStart = mOrientationHelper.getDecoratedStart(child);
			final int childEnd = mOrientationHelper.getDecoratedEnd(child);
			if (childStart < end && childEnd > start)
			{
				if (completelyVisible)
				{
					if (childStart >= start && childEnd <= end)
					{
						return getPosition(child);
					}
				}
				else
				{
					return getPosition(child);
				}
			}
		}
		return RecyclerViewBase.NO_POSITION;
	}

	@Override
	public View onFocusSearchFailed(View focused, int focusDirection, RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state)
	{
		resolveShouldLayoutReverse();
		if (getChildCount() == 0)
		{
			return null;
		}

		final int layoutDir = convertFocusDirectionToLayoutDirection(focusDirection);
		if (layoutDir == RenderState.INVALID_LAYOUT)
		{
			return null;
		}
		final View referenceChild;
		if (layoutDir == RenderState.LAYOUT_START)
		{
			referenceChild = getChildClosestToStartInScreen();
		}
		else
		{
			referenceChild = getChildClosestToEndInScreen();
		}
		ensureRenderState();
		final int maxScroll = (int) (MAX_SCROLL_FACTOR * (mOrientationHelper.getEndAfterPadding() - mOrientationHelper.getStartAfterPadding()));
		updateRenderState(layoutDir, maxScroll, false, state);
		mRenderState.mScrollingOffset = RenderState.SCOLLING_OFFSET_NaN;
		mRecyclerView.filterCheckNotifyFooterAppeared = true;
		fill(recycler, mRenderState, state, true);
		View nextFocus = null;
		// if (layoutDir == RenderState.LAYOUT_START)
		// {
		final FocusFinder ff = FocusFinder.getInstance();
		try
		{
			nextFocus = ff.findNextFocus(mRecyclerView, focused, focusDirection);
		}
		catch (Exception e)
		{

		}
		// }
		// else
		// {
		// nextFocus = getChildClosestToEndInScreen();
		// }
		if (nextFocus == null || nextFocus == referenceChild || !nextFocus.isFocusable())
		{
			return null;
		}
		return nextFocus;
		// return super.onFocusSearchFailed(focused, focusDirection, recycler,
		// state);
	}

	/**
	 * Used for debugging. Logs the internal representation of children to
	 * default logger.
	 */
	private void logChildren()
	{
		Log.d(TAG, "internal representation of views on the screen");
		for (int i = 0; i < getChildCount(); i++)
		{
			View child = getChildAt(i);
			Log.d(TAG, "item " + getPosition(child) + ", coord:" + mOrientationHelper.getDecoratedStart(child));
		}
		Log.d(TAG, "==============");
	}

	public int getDecoratedStart(View child)
	{
		return mOrientationHelper.getDecoratedStart(child);
	}

	public int getDecoratedEnd(View child)
	{
		return mOrientationHelper.getDecoratedEnd(child);
	}

	/**
	 * Used for debugging. Validates that child views are laid out in correct
	 * order. This is important because rest of the algorithm relies on this
	 * constraint.
	 * <p/>
	 * In default layout, child 0 should be closest to screen position 0 and
	 * last child should be closest to position WIDTH or HEIGHT. In reverse
	 * layout, last child should be closes to screen position 0 and first child
	 * should be closest to position WIDTH or HEIGHT
	 */
	protected void validateChildOrder()
	{
		Log.d(TAG, "validating child count " + getChildCount());
		if (getChildCount() < 1)
		{
			return;
		}
		int lastPos = getPosition(getChildAt(0));
		int lastScreenLoc = mOrientationHelper.getDecoratedStart(getChildAt(0));
		if (mShouldReverseLayout)
		{
			for (int i = 1; i < getChildCount(); i++)
			{
				View child = getChildAt(i);
				int pos = getPosition(child);
				int screenLoc = mOrientationHelper.getDecoratedStart(child);
				if (pos < lastPos)
				{
					logChildren();
					throw new RuntimeException("detected invalid position. loc invalid? " + (screenLoc < lastScreenLoc));
				}
				if (screenLoc > lastScreenLoc)
				{
					logChildren();
					throw new RuntimeException("detected invalid location");
				}
			}
		}
		else
		{
			for (int i = 1; i < getChildCount(); i++)
			{
				View child = getChildAt(i);
				int pos = getPosition(child);
				int screenLoc = mOrientationHelper.getDecoratedStart(child);
				if (pos < lastPos)
				{
					logChildren();
					throw new RuntimeException("detected invalid position. loc invalid? " + (screenLoc < lastScreenLoc));
				}
				if (screenLoc < lastScreenLoc)
				{
					logChildren();
					throw new RuntimeException("detected invalid location");
				}
			}
		}
	}

	@Override
	public boolean supportsPredictiveItemAnimations()
	{
		return false;
	}

	/**
	 * Helper class that keeps temporary state while {LayoutManager} is filling
	 * out the empty space.
	 */
	protected static class RenderState
	{
		public final static int						FILL_TYPE_NOMORE	= 1;
		public final static int						FILL_TYPE_HEADER	= 2;
		public final static int						FILL_TYPE_NORMAL	= 3;
		public final static int						FILL_TYPE_FOOTER	= 4;

		final static String							TAG					= "TMYGRID";

		public final static int						LAYOUT_START		= -1;

		public final static int						LAYOUT_END			= 1;

		public static final int						LAYOUT_NO_DIRECTION	= Integer.MAX_VALUE;

		public final static int						INVALID_LAYOUT		= Integer.MIN_VALUE;

		public final static int						ITEM_DIRECTION_HEAD	= -1;

		public final static int						ITEM_DIRECTION_TAIL	= 1;

		public final static int						SCOLLING_OFFSET_NaN	= Integer.MIN_VALUE;
		public boolean								overscroll			= false;
		/**
		 * Pixel offset where rendering should start
		 */
		public int									mOffset;

		/**
		 * Number of pixels that we should fill, in the layout direction.
		 */
		public int									mAvailable;

		/**
		 * Current position on the adapter to get the next item.
		 */
		public int									mCurrentPosition;

		/**
		 * Defines the direction in which the data adapter is traversed. Should
		 * be {@link #ITEM_DIRECTION_HEAD} or {@link #ITEM_DIRECTION_TAIL}
		 */
		public int									mItemDirection;

		/**
		 * Defines the direction in which the layout is filled. Should be
		 * {@link #LAYOUT_START} or {@link #LAYOUT_END}
		 */
		public int									mLayoutDirection;

		/**
		 * Used when RenderState is constructed in a scrolling state. It should
		 * be set the amount of scrolling we can make without creating a new
		 * view. Settings this is required for efficient view recycling.
		 */
		public int									mScrollingOffset;

		/**
		 * Used if you want to pre-layout items that are not yet visible. The
		 * difference with {@link #mAvailable} is that, when recycling, distance
		 * rendered for {@link #mExtra} is not considered to avoid recycling
		 * visible children.
		 */
		public int									mExtra				= 0;

		/**
		 * When LLM needs to layout particular views, it sets this list in which
		 * case, RenderState will only return views from this list and return
		 * null if it cannot find an item.
		 */
		public List<RecyclerViewBase.ViewHolder>	mScrapList			= null;

		/**
		 * @return true if there are more items in the data adapter
		 */
		public int hasMore(RecyclerViewBase.State state)
		{
			if (mCurrentPosition < 0)
			{
				if (Math.abs(mCurrentPosition) <= state.mHeaderCount)
				{
					return FILL_TYPE_HEADER;
				}
				else
				{
					return FILL_TYPE_NOMORE;
				}
			}
			else if (mCurrentPosition >= state.getItemCount())
			{
				// Log.d(TAG, "currPos=" + mCurrentPosition + ",itemcount=" +
				// state.getItemCount());
				if (Math.abs(mCurrentPosition) - state.getItemCount() < state.mFooterCount)
				{
					return FILL_TYPE_FOOTER;
				}
				else
				{
					return FILL_TYPE_NOMORE;
				}
			}
			else
			{
				return FILL_TYPE_NORMAL;
			}
		}

		/**
		 * Gets the view for the next element that we should render. Also
		 * updates current item index to the next item, based on
		 * {@link #mItemDirection}
		 *
		 * @return The next element that we should render.
		 */
		public View next(RecyclerViewBase.Recycler recycler)
		{
			if (mScrapList != null)
			{
				return nextFromLimitedList();
			}
			final View view = recycler.getViewForPosition(mCurrentPosition);
			mCurrentPosition += mItemDirection;
			return view;
		}

		/**
		 * Gets the view for the next Header that we should render. Also updates
		 * current item index to the next item, based on {@link #mItemDirection}
		 *
		 * @return The next Header that we should render.
		 */
		public View nextHeader(RecyclerViewBase.Recycler recycler)
		{
			final View view = recycler.getHeaderForPosition(Math.abs(mCurrentPosition));
			mCurrentPosition += mItemDirection;
			return view;
		}

		/**
		 * Gets the view for the next Footer that we should render. Also updates
		 * current item index to the next item, based on {@link #mItemDirection}
		 *
		 * @return The next Footer that we should render.
		 */
		public View nextFooter(RecyclerViewBase.Recycler recycler, RecyclerViewBase.State state)
		{
			final View view = recycler.getFooterForPosition(Math.abs(mCurrentPosition) - state.getItemCount() + 1);
			mCurrentPosition += mItemDirection;
			return view;
		}

		/**
		 * Returns next item from limited list.
		 * <p/>
		 * Upon finding a valid VH, sets current item position to
		 * VH.itemPosition + mItemDirection
		 *
		 * @return View if an item in the current position or direction exists
		 *         if not null.
		 */
		private View nextFromLimitedList()
		{
			int size = mScrapList.size();
			RecyclerViewBase.ViewHolder closest = null;
			int closestDistance = Integer.MAX_VALUE;
			for (int i = 0; i < size; i++)
			{
				RecyclerViewBase.ViewHolder viewHolder = mScrapList.get(i);
				final int distance = (viewHolder.getPosition() - mCurrentPosition) * mItemDirection;
				if (distance < 0)
				{
					continue; // item is not in current direction
				}
				if (distance < closestDistance)
				{
					closest = viewHolder;
					closestDistance = distance;
					if (distance == 0)
					{
						break;
					}
				}
			}
			if (DEBUG)
			{
				Log.d(TAG, "layout from scrap. found view:?" + (closest != null));
			}
			if (closest != null)
			{
				mCurrentPosition = closest.getPosition() + mItemDirection;
				return closest.itemView;
			}
			return null;
		}

		public void log()
		{
			log("");
		}

		public void log(String prefix)
		{
			Log.d(TAG, prefix + "avail:" + mAvailable + ", ind:" + mCurrentPosition + ", dir:" + mItemDirection + ", offset:" + mOffset
					+ ", layoutDir:" + mLayoutDirection + ", scrollOffset:" + mScrollingOffset);
		}
	}

	OrientationHelper createVerticalOrientationHelper()
	{
		return new OrientationHelper()
		{
			@Override
			public int getEndAfterPadding()
			{
				return getHeight() - getPaddingBottom() + mRecyclerView.mState.mCustomHeaderHeight;
			}

			@Override
			public void offsetChildren(int amount)
			{
				offsetChildrenVertical(amount);
			}

			@Override
			public int getStartAfterPadding()
			{
				return getPaddingTop() - mRecyclerView.mState.mCustomHeaderHeight;
			}

			@Override
			public int getDecoratedMeasurement(View view)
			{
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedMeasuredHeight(view) + params.topMargin + params.bottomMargin;
			}

			@Override
			public int getDecoratedMeasurementInOther(View view)
			{
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedMeasuredWidth(view) + params.leftMargin + params.rightMargin;
			}

			@Override
			public int getDecoratedEnd(View view)
			{
				if (view == null)
				{
					return 0;
				}
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedBottom(view) + params.bottomMargin;
			}

			@Override
			public int getDecoratedStart(View view)
			{
				if (view == null)
				{
					return 0;
				}
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedTop(view) - params.topMargin;
			}

			@Override
			public int getTotalSpace()
			{
				return getHeight() - getPaddingTop() - getPaddingBottom();
			}
		};
	}

	OrientationHelper createHorizontalOrientationHelper()
	{
		return new OrientationHelper()
		{
			@Override
			public int getEndAfterPadding()
			{
				return getWidth() - getPaddingRight() + mRecyclerView.mState.mCustomHeaderWidth;
			}

			@Override
			public void offsetChildren(int amount)
			{
				offsetChildrenHorizontal(amount);
			}

			@Override
			public int getStartAfterPadding()
			{
				return getPaddingLeft() - mRecyclerView.mState.mCustomHeaderWidth;
			}

			@Override
			public int getDecoratedMeasurement(View view)
			{
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedMeasuredWidth(view) + params.leftMargin + params.rightMargin;
			}

			@Override
			public int getDecoratedMeasurementInOther(View view)
			{
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedMeasuredHeight(view) + params.topMargin + params.bottomMargin;
			}

			@Override
			public int getDecoratedEnd(View view)
			{
				if (view == null)
				{
					return 0;
				}
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedRight(view) + params.rightMargin;
			}

			@Override
			public int getDecoratedStart(View view)
			{
				if (view == null)
				{
					return 0;
				}
				final RecyclerViewBase.LayoutParams params = (RecyclerViewBase.LayoutParams) view.getLayoutParams();
				return getDecoratedLeft(view) - params.leftMargin;
			}

			@Override
			public int getTotalSpace()
			{
				return getWidth() - getPaddingLeft() - getPaddingRight();
			}
		};
	}

	/**
	 * Helper interface to offload orientation based decisions
	 */
	public interface OrientationHelper
	{

		/**
		 * @param view
		 *            The view element to check
		 * @return The first pixel of the element
		 * @see #getDecoratedEnd(View)
		 */

		int getDecoratedStart(View view);

		/**
		 * @param view
		 *            The view element to check
		 * @return The last pixel of the element
		 * @see #getDecoratedStart(View)
		 */
		int getDecoratedEnd(View view);

		/**
		 * @param view
		 *            The view element to check
		 * @return Total space occupied by this view
		 */
		int getDecoratedMeasurement(View view);

		/**
		 * @param view
		 *            The view element to check
		 * @return Total space occupied by this view in the perpendicular
		 *         orientation to current one
		 */
		int getDecoratedMeasurementInOther(View view);

		/**
		 * @return The very first pixel we can draw.
		 */
		int getStartAfterPadding();

		/**
		 * @return The last pixel we can draw
		 */
		int getEndAfterPadding();

		/**
		 * Offsets all children's positions by the given amount
		 *
		 * @param amount
		 *            Value to add to each child's layout parameters
		 */
		void offsetChildren(int amount);

		/**
		 * Returns the total space to layout.
		 *
		 * @return Total space to layout children
		 */
		int getTotalSpace();
	}

	static class SavedState implements Parcelable
	{

		int		mOrientation;

		int		mAnchorPosition;

		int		mAnchorOffset;

		boolean	mReverseLayout;

		boolean	mStackFromEnd;

		boolean	mAnchorLayoutFromEnd;

		public SavedState()
		{

		}

		SavedState(Parcel in)
		{
			mOrientation = in.readInt();
			mAnchorPosition = in.readInt();
			mAnchorOffset = in.readInt();
			mReverseLayout = in.readInt() == 1;
			mStackFromEnd = in.readInt() == 1;
			mAnchorLayoutFromEnd = in.readInt() == 1;
		}

		public SavedState(SavedState other)
		{
			mOrientation = other.mOrientation;
			mAnchorPosition = other.mAnchorPosition;
			mAnchorOffset = other.mAnchorOffset;
			mReverseLayout = other.mReverseLayout;
			mStackFromEnd = other.mStackFromEnd;
			mAnchorLayoutFromEnd = other.mAnchorLayoutFromEnd;
		}

		@Override
		public int describeContents()
		{
			return 0;
		}

		@Override
		public void writeToParcel(Parcel dest, int flags)
		{
			dest.writeInt(mOrientation);
			dest.writeInt(mAnchorPosition);
			dest.writeInt(mAnchorOffset);
			dest.writeInt(mReverseLayout ? 1 : 0);
			dest.writeInt(mStackFromEnd ? 1 : 0);
			dest.writeInt(mAnchorLayoutFromEnd ? 1 : 0);
		}

		public static final Creator<SavedState> CREATOR = new Creator<SavedState>()
		{
			@Override
			public SavedState createFromParcel(Parcel in)
			{
				return new SavedState(in);
			}

			@Override
			public SavedState[] newArray(int size)
			{
				return new SavedState[size];
			}
		};
	}

	protected View getNextView(RecyclerViewBase.Recycler recycler, RenderState renderState, RecyclerViewBase.State state)
	{
		View view = null;
		if (renderState.hasMore(state) == RenderState.FILL_TYPE_HEADER)
		{
			view = renderState.nextHeader(recycler);
			if (view != null)
			{
				ViewGroup.LayoutParams lp = view.getLayoutParams();
				RecyclerViewBase.LayoutParams params = null;
				if (lp instanceof ViewGroup.MarginLayoutParams)
				{
					params = new RecyclerViewBase.LayoutParams((ViewGroup.MarginLayoutParams) lp);
				}
				else
				{
					params = new RecyclerViewBase.LayoutParams(lp);
				}

				params.mViewHolder = mRecyclerView.createViewHolder(view, mRecyclerView);
				params.mViewHolder.mViewType = RecyclerViewBase.ViewHolder.TYPE_HEADERE;
				params.mViewHolder.mPosition = renderState.mCurrentPosition - renderState.mItemDirection;
				view.setLayoutParams(params);
				state.mHeaderCountInScreen++;
			}
		}
		else if (renderState.hasMore(state) == RenderState.FILL_TYPE_FOOTER)
		{

			view = renderState.nextFooter(recycler, state);
			if (view != null)
			{
				RecyclerViewBase.LayoutParams params = new RecyclerViewBase.LayoutParams(view.getLayoutParams());
				params.mViewHolder = mRecyclerView.createViewHolder(view, mRecyclerView);
				params.mViewHolder.mViewType = RecyclerViewBase.ViewHolder.TYPE_FOOTER;
				params.mViewHolder.mPosition = renderState.mCurrentPosition - renderState.mItemDirection;
				if (mRecyclerView.getAdapter().getFooterViewInBottomMode())
				{
					int incrementFooterViewHeight = mRecyclerView.getHeight() - mRecyclerView.getAdapter().getListTotalHeight();
					int originFooterViewHeight = mRecyclerView.getAdapter().getFooterViewHeight(mRecyclerView.getAdapter().getFooterViewCount());
					if (incrementFooterViewHeight > 0)
					{
						params.height = incrementFooterViewHeight + originFooterViewHeight;
						view.setPadding(view.getPaddingLeft(), incrementFooterViewHeight, view.getPaddingRight(), view.getPaddingBottom());
					}
					else
					{
						params.height = originFooterViewHeight;
						view.setPadding(view.getPaddingLeft(), 0, view.getPaddingRight(), view.getPaddingBottom());
					}
				}
				view.setLayoutParams(params);
				state.mFooterCountInScreen++;
				// Log.d(TAG, "holder pos=" + params.mViewHolder.mPosition +
				// ",state itemcount=" + state.getItemCount() +
				// ",state.mFooterCount="
				// + state.mFooterCount);
				if (params.mViewHolder.mPosition - state.getItemCount() + 1 == state.mFooterCount
						&& (mRenderState.mScrollingOffset != RenderState.SCOLLING_OFFSET_NaN || mRecyclerView.filterCheckNotifyFooterAppeared))
				{
					// Log.d(TAG, "needNotify getFooter");
					if (mRecyclerView.filterCheckNotifyFooterAppeared)
					{
						mRecyclerView.filterCheckNotifyFooterAppeared = false;
					}
					mRecyclerView.needNotifyFooter = true;
				}
			}
		}
		else
		{
			view = renderState.next(recycler);
		}
		return view;
	}

	public int getPendingPosition()
	{
		return mPendingScrollPosition;
	}

	public View getFirstItemAfterOffset(int offset)
	{
		return super.getFirstItemAfterOffset(offset + mOrientationHelper.getStartAfterPadding());
	}

	public View getFirstItemBeforeOffset(int offset)
	{
		return super.getFirstItemBeforeOffset(offset + mOrientationHelper.getStartAfterPadding());
	}
}

