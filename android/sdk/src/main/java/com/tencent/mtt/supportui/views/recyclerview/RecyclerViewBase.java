package com.tencent.mtt.supportui.views.recyclerview;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.tencent.mtt.supportui.utils.ViewCompatTool;
import com.tencent.mtt.supportui.utils.struct.ArrayMap;
import com.tencent.mtt.supportui.utils.struct.Pools;

import android.content.Context;
import android.database.Observable;
import android.graphics.Canvas;
import android.graphics.PointF;
import android.graphics.Rect;
import android.os.Build;
import android.os.Parcel;
import android.os.Parcelable;
import android.text.TextUtils;
import android.util.AttributeSet;
import android.util.Log;
import android.util.SparseArray;
import android.util.SparseIntArray;
import android.view.FocusFinder;
import android.view.MotionEvent;
import android.view.VelocityTracker;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.animation.Interpolator;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public abstract class RecyclerViewBase extends ViewGroup
{
	public static final int								TRAVERSAL_PURPOSE_MODECHANGE				= 1991102;
	public static final int								TRAVERSAL_PURPOSE_ITEMCHANGE				= 1991103;
	static final String									TAG											= "RecyclerViewBase";

	public static final boolean							DEBUG										= /*
																										 * BuildConfig
																										 * .
																										 * DEBUG
																										 */false;
	static final boolean								ENABLE_PREDICTIVE_ANIMATIONS				= false;

	public static final int								LAYOUT_TYPE_LIST							= 1;
	public static final int								LAYOUT_TYPE_GRID							= 2;
	public static final int								LAYOUT_TYPE_WATERFALL						= 3;

	/* private */static final boolean					DISPATCH_TEMP_DETACH						= false;
	public static final int								HORIZONTAL									= 0;
	public static final int								VERTICAL									= 1;
	public static final int								NO_POSITION									= Integer.MIN_VALUE;
	public static final long							NO_ID										= -1;
	public static final int								INVALID_TYPE								= -1;

	/* private */static final int						MAX_SCROLL_DURATION							= 2000;

	/* private */final RecyclerViewDataObserver			mObserver									= new RecyclerViewDataObserver();

	protected Recycler									mRecycler									= new Recycler();

	/* private */SavedState								mPendingSavedState;
	public boolean										needNotifyFooter							= false;
	/**
	 * Note: this Runnable is only ever posted if: 1) We've been through first
	 * layout 2) We know we have a fixed size (mHasFixedSize) 3) We're attached
	 */
	/* private */final Runnable							mUpdateChildViewsRunnable					= new Runnable()
																									{
																										public void run()
																										{
																											if (mPendingUpdates.isEmpty())
																											{
																												setRecyclerViewTouchEnabled(true);
																												return;
																											}
																											eatRequestLayout();
																											updateChildViews();
																											traversal(TRAVERSAL_PURPOSE_ITEMCHANGE);
																											resumeRequestLayout(true);
																											if (!mPostedAnimatorRunner)
																											{
																												setRecyclerViewTouchEnabled(true);
																											}
																											//																											if (DeviceUtils.getSdkVersion() < 11)
																											//																											{
																											//																												invalidate();
																											//																											}
																										}
																									};

	/* private */final Rect								mTempRect									= new Rect();

	/* private */final ArrayList<UpdateOp>				mPendingUpdates								= new ArrayList<UpdateOp>();
	/* private */final ArrayList<UpdateOp>				mPendingLayoutUpdates						= new ArrayList<UpdateOp>();
	/* private */Pools.Pool<UpdateOp>					mUpdateOpPool								= new Pools.SimplePool<UpdateOp>(
			UpdateOp.POOL_SIZE);

	public Adapter<ViewHolder>							mAdapter;
	public LayoutManager								mLayout;
	/* private */final ArrayList<ItemDecoration>		mItemDecorations							= new ArrayList<ItemDecoration>();
	/* private */final ArrayList<OnItemTouchListener>	mOnItemTouchListeners						= new ArrayList<OnItemTouchListener>();
	/* private */OnItemTouchListener					mActiveOnItemTouchListener;
	/* private */boolean								mIsAttached;
	/* private */boolean								mHasFixedSize;
	/* private */boolean								mEatRequestLayout;
	/* private */boolean								mLayoutRequestEaten;
	/* private */boolean								mAdapterUpdateDuringMeasure;
	/* private */final boolean							mPostUpdatesOnAnimation;
	public int											mLayoutType;
	public int											mOffsetY									= 0;
	public int											mOffsetX									= 0;

	protected boolean									mBlockScroll								= false;
	/* private */static final int						INVALID_POINTER								= -1;
	public static final int								DIRECTION_UP								= -1;
	public static final int								DIRECTION_DOWN								= 1;
	/**
	 * The RecyclerView is not currently scrolling.
	 *
	 * @see #getScrollState()
	 */
	public static final int								SCROLL_STATE_IDLE							= 0;
	/**
	 * The RecyclerView is currently being dragged by outside input such as user
	 * touch input.
	 *
	 * @see #getScrollState()
	 */
	public static final int								SCROLL_STATE_DRAGGING						= 1;

	/**
	 * The RecyclerView is currently animating to a final position while not
	 * under outside control.
	 *
	 * @see #getScrollState()
	 */
	public static final int								SCROLL_STATE_SETTLING						= 2;

	// Touch/scrolling handling
	public boolean										optimizeHeaderRefresh						= false;
	protected int										mScrollState								= SCROLL_STATE_IDLE;
	protected int										mScrollPointerId							= INVALID_POINTER;
	protected VelocityTracker							mVelocityTracker;
	protected int										mInitialTouchX;
	protected int										mInitialTouchY;
	protected int										mLastTouchX;
	protected int										mLastTouchY;
	protected final int									mTouchSlop;
	/* private */final int								mMinFlingVelocity;
	/* private */final int								mMaxFlingVelocity;
	public final ViewFlinger							mViewFlinger								= new ViewFlinger();
	private boolean										mShouldPrebindItem							= false;
	// protected final SpringBackHandler mSpringBackHandler = new
	// SpringBackHandler();

	public final State									mState										= new State();

	/* private */OnScrollListener						mScrollListener;

	// For use in item animations
	protected boolean									mItemsAddedOrRemoved						= false;
	protected boolean									mItemsChanged								= false;
	int													mAnimatingViewIndex							= -1;
	int													mNumAnimatingViews							= 0;
	int													mAnimatingViewPos							= -1;
	int													mAnimatingViewPrevPos						= -1;
	boolean												mInPreLayout								= false;
	protected boolean									mPostedAnimatorRunner						= false;
	protected Runnable									mItemAnimatorRunner							= new Runnable()
																									{
																										@Override
																										public void run()
																										{
																											forceBlockTouch = true;
																											mPostedAnimatorRunner = false;
																										}
																									};


	/* private */static final Interpolator				sQuinticInterpolator						= new Interpolator()
																									{
																										public float getInterpolation(float t)
																										{
																											t -= 1.0f;
																											return t * t * t * t * t + 1.0f;
																										}
																									};

	protected static final int							AUTO_SCROLL_DELAY_DURATION					= 800;

	protected int										mEnterPos;

	protected int										mExitPos;

	protected boolean									mEnterCalled;

	protected boolean									mExitCalled;

	protected boolean									mExchangeFromBigger;

	protected AutoScrollRunnable						mAutoScrollRunnable;

	protected boolean									mScrollRunnablePosted;

	// /* private */SwipeHelper mSwipeHelper;


	public boolean										checkNotifyFooterOnRelease;
	public boolean										filterCheckNotifyFooterAppeared				= false;

	public int											mNeedStopAtTitleIndex						= -1;
	/* private */boolean								mStopAtTitle								= false;

	protected boolean									mIsChangingMode								= false;
	/* private */boolean								mIsTouching;

	private boolean										mEnableRecyclerViewTouchListener			= false;																																					// 业务是否需要监听recyclerView的touch事件，默认不监听

	public boolean										mAnimatingBlockTouch;
    private IBlockTouchListener                         blockTouchListener;

	protected boolean									forceBlockTouch;
	private boolean										mDisallowParentInterceptTouchEventWhenDrag	= true;
	/* private */boolean								mHasSuspentedItem;
	/* private */boolean								mUseRepeatableSuspensionMode				= true;

	private boolean										mTouchDownWhenSettlingFlag					= false;
	private static final int							TOUCH_DOWN_WHEN_SETTING_CHECK_INTERVAL		= 50;
	private Runnable									mTouchDownWhenSettlingCheckRunnable			= null;
	private int											mTouchEventState							= MotionEvent.ACTION_UP;

	public RecyclerViewBase(Context context)
	{
		super(context);
		final int version = Build.VERSION.SDK_INT;
		mPostUpdatesOnAnimation = version >= 16;
		final ViewConfiguration vc = ViewConfiguration.get(context);
		mTouchSlop = vc.getScaledTouchSlop();
		mMinFlingVelocity = vc.getScaledMinimumFlingVelocity();
		mMaxFlingVelocity = vc.getScaledMaximumFlingVelocity();
		setWillNotDraw(false);
		setHasFixedSize(true);

		mAutoScrollRunnable = new AutoScrollRunnable();

		mTouchDownWhenSettlingCheckRunnable = new Runnable()
		{
			@Override
			public void run()
			{
				if (mTouchDownWhenSettlingFlag)
				{
					mTouchDownWhenSettlingFlag = false;
					if (mTouchEventState == MotionEvent.ACTION_DOWN)
					{
						// only touch down currently, so stopScroll here
						stopScroll();
					}
					else if (mTouchEventState == MotionEvent.ACTION_MOVE)
					{
						if (mVelocityTracker != null)
						{
							mVelocityTracker.computeCurrentVelocity(1000, mMaxFlingVelocity);
							float yVelocity = mVelocityTracker.getYVelocity();
							if (Math.abs(yVelocity) < mMaxFlingVelocity * 2 / 3)
							{
								// drag at slow velocity currently, so stopScroll here
								stopScroll();
							}
						}
					}
				}
			}
		};
	}

	/**
	 * RecyclerView can perform several optimizations if it can know in advance
	 * that changes in adapter content cannot change the size of the
	 * RecyclerView itself. If your use of RecyclerView falls into this
	 * category, set this to true.
	 *
	 * @param hasFixedSize true if adapter changes cannot affect the size of the
	 *            RecyclerView.
	 */
	public void setHasFixedSize(boolean hasFixedSize)
	{
		mHasFixedSize = hasFixedSize;
	}

	public ArrayList<ViewHolder> getCachedViews()
	{
		return mRecycler.mCachedViews;
	}

	/**
	 * @return true if the app has specified that changes in adapter content
	 *         cannot change the size of the RecyclerView itself.
	 */
	public boolean hasFixedSize()
	{
		return mHasFixedSize;
	}

	/**
	 * Set a new adapter to provide child views on demand.
	 *
	 * @param adapter The new adapter to set, or null to set no adapter.
	 */
	public void setAdapter(Adapter adapter)
	{
		if (mAdapter != null)
		{
			mAdapter.unregisterAdapterDataObserver(mObserver);
		}
		// Since animations are ended, mLayout.children should be equal to
		// recyclerView.children.
		// This may not be true if item animator's end does not work as
		// expected. (e.g. not release
		// children instantly). It is safer to use mLayout's child count.
		if (mLayout != null)
		{
			mLayout.removeAndRecycleAllViews(mRecycler);
			mLayout.removeAndRecycleScrapInt(mRecycler, true, true);
		}

		final Adapter oldAdapter = mAdapter;
		mAdapter = adapter;
		if (adapter != null)
		{
			adapter.registerAdapterDataObserver(mObserver);
		}
		if (mLayout != null)
		{
			mLayout.onAdapterChanged(oldAdapter, mAdapter);
		}
		mRecycler.onAdapterChanged(oldAdapter, mAdapter);
		mState.mStructureChanged = true;
		markKnownViewsInvalid();
		requestLayout();
	}

	/**
	 * Retrieves the previously set adapter or null if no adapter is set.
	 *
	 * @return The previously set adapter
	 * @see #setAdapter(Adapter)
	 */
	public Adapter getAdapter()
	{
		return mAdapter;
	}

	public Recycler getRecycler()
	{
		return mRecycler;
	}

	public void setEnableHorizontalDrag(boolean enable)
	{
	}

	/**
	 * Set the {@link LayoutManager} that this RecyclerView will use.
	 * <p/>
	 * <p>
	 * In contrast to other adapter-backed views such as
	 * {@link android.widget.ListView} or {@link android.widget.GridView},
	 * RecyclerView allows client code to provide custom layout arrangements for
	 * child views. These arrangements are controlled by the
	 * {@link LayoutManager}. A LayoutManager must be provided for RecyclerView
	 * to function.
	 * </p>
	 * <p/>
	 * <p>
	 * Several default strategies are provided for common uses such as lists and
	 * grids.
	 * </p>
	 *
	 * @param layout LayoutManager to use
	 */
	public void setLayoutManager(LayoutManager layout)
	{
		mLayoutType = layout.getLayoutType();

		if (layout == mLayout)
		{
			return;
		}
		if (mAdapter != null)
		{
			mAdapter.reset();
		}
		mRecycler.clear();
		removeAllViews();
		if (mLayout != null)
		{
			if (mIsAttached)
			{
				mLayout.onDetachedFromWindow(this);
			}
			mLayout.mRecyclerView = null;
		}
		mLayout = layout;
		if (layout != null)
		{
			if (layout.mRecyclerView != null)
			{
				throw new IllegalArgumentException("LayoutManager " + layout + " is already attached to a RecyclerView: " + layout.mRecyclerView);
			}
			layout.mRecyclerView = this;
			if (mIsAttached)
			{
				mLayout.onAttachedToWindow(this);
			}
		}
		requestLayout();
	}

	@Override
	protected Parcelable onSaveInstanceState()
	{
		SavedState state = new SavedState(super.onSaveInstanceState());
		if (mPendingSavedState != null)
		{
			state.copyFrom(mPendingSavedState);
		}
		else if (mLayout != null)
		{
			state.mLayoutState = mLayout.onSaveInstanceState();
		}
		else
		{
			state.mLayoutState = null;
		}

		return state;
	}

	@Override
	protected void onRestoreInstanceState(Parcelable state)
	{
		mPendingSavedState = (SavedState) state;
		super.onRestoreInstanceState(mPendingSavedState.getSuperState());
		if (mLayout != null && mPendingSavedState.mLayoutState != null)
		{
			mLayout.onRestoreInstanceState(mPendingSavedState.mLayoutState);
		}
	}

	/**
	 * Adds a view to the animatingViews list. mAnimatingViews holds the child
	 * views that are currently being kept around purely for the purpose of
	 * being animated out of view. They are drawn as a regular part of the child
	 * list of the RecyclerView, but they are invisible to the LayoutManager as
	 * they are managed separately from the regular child views.
	 *
	 * @param view The view to be removed
	 */
	public void addAnimatingView(View view, boolean inlayout)
	{
		boolean alreadyAdded = false;
		if (mNumAnimatingViews > 0)
		{
			for (int i = mAnimatingViewIndex; i < getChildCount(); ++i)
			{
				if (getChildAt(i) == view)
				{
					alreadyAdded = true;
					break;
				}
			}
		}
		if (!alreadyAdded)
		{
			// if (mNumAnimatingViews == 0)
			// {
			// }
			++mNumAnimatingViews;
			if (inlayout)
			{
				addViewInLayout(view, -1, view.getLayoutParams(), true);
			}
			else
			{
				addView(view);
			}
			mAnimatingViewIndex = getChildCount() - mNumAnimatingViews;
		}
		if (DEBUG)
		{
			//			Log.d("leo", "after add animatingViews count=" + mNumAnimatingViews);
		}
		mRecycler.unscrapView(getChildViewHolder(view));
	}

	public void addAnimatingView(View view)
	{
		addAnimatingView(view, false);
	}

	/* private */void removeAnimatingViews()
	{
		int count = getChildCount();
		View[] views = new View[count];
		for (int i = 0; i < count; i++)
		{
			views[i] = getChildAt(i);
		}
		for (int j = 0; j < count; j++)
		{
			removeAnimatingView(views[j]);
		}
	}

	/* private */void layoutAnimationViews()
	{
		int count = getChildCount();
		if (mAnimatingViewIndex != -1)
		{
			mAnimatingViewIndex = Math.max(0, Math.min(count, mAnimatingViewIndex));
			View v = getChildAt(mAnimatingViewIndex);
			if (v != null && mLayout != null)
			{
				mLayout.measureChildWithMargins(v, 0, 0);
				mLayout.layoutDecorated(v, 0, 0, v.getMeasuredWidth(), v.getMeasuredHeight());
			}
		}
	}

	/**
	 * Removes a view from the animatingViews list.
	 *
	 * @param view The view to be removed
	 * @see #addAnimatingView(View)
	 */
	public void removeAnimatingView(View view, boolean inlayout)
	{
		if (mNumAnimatingViews > 0)
		{
			for (int i = mAnimatingViewIndex; i < getChildCount(); ++i)
			{
				if (getChildAt(i) == view)
				{
					if (inlayout)
					{
						removeViewInLayout(view);
					}
					else
					{
						if (getAdapter() != null && getAdapter().hasCustomRecycler() && mAnimatingViewPos >= 0
								&& mAnimatingViewPos == mAnimatingViewPrevPos)
						{

						}
						else
						{
							removeViewAt(i);
						}
					}
					--mNumAnimatingViews;
					if (mNumAnimatingViews == 0)
					{
						mAnimatingViewIndex = -1;
					}
					if (DEBUG)
					{
						//						Log.d("leo", "after remove animatingViews count=" + mNumAnimatingViews);
					}
					if (getAdapter() != null && getAdapter().hasCustomRecycler() && mAnimatingViewPos >= 0
							&& mAnimatingViewPos == mAnimatingViewPrevPos && !inlayout)
					{

					}
					else
					{
						mRecycler.recycleView(view);
					}
					return;
				}
			}
		}
	}

	public void removeAnimatingView(View view)
	{
		removeAnimatingView(view, false);
	}

	public View getAnimatingView(int position, int type)
	{
		if (mNumAnimatingViews > 0)
		{
			for (int i = mAnimatingViewIndex; i < getChildCount(); ++i)
			{
				final View view = getChildAt(i);
				ViewHolder holder = getChildViewHolder(view);
				if (holder != null && holder.getPosition() == position && (type == INVALID_TYPE || holder.getItemViewType() == type))
				{
					return view;
				}
			}
		}
		return null;
	}

	/**
	 * Return the {@link LayoutManager} currently responsible for layout policy
	 * for this RecyclerView.
	 *
	 * @return The currently bound LayoutManager
	 */
	public LayoutManager getLayoutManager()
	{
		return mLayout;
	}

	/**
	 * Retrieve this RecyclerView's {@link RecycledViewPool}. This method will
	 * never return null; if no pool is set for this view a new one will be
	 * created. See {@link #setRecycledViewPool(RecycledViewPool)
	 * setRecycledViewPool} for more information.
	 *
	 * @return The pool used to store recycled item views for reuse.
	 * @see #setRecycledViewPool(RecycledViewPool)
	 */
	public RecycledViewPool getRecycledViewPool()
	{
		return mRecycler.getRecycledViewPool();
	}

	/**
	 * Recycled view pools allow multiple RecyclerViews to share a common pool
	 * of scrap views. This can be useful if you have multiple RecyclerViews
	 * with adapters that use the same view types, for example if you have
	 * several data sets with the same kinds of item views displayed by
	 * ViewPager.
	 *
	 * @param pool Pool to set. If this parameter is null a new pool will be
	 *            created and used.
	 */
	public void setRecycledViewPool(RecycledViewPool pool)
	{
		mRecycler.setRecycledViewPool(pool);
	}

	/**
	 * Set the number of offscreen views to retain before adding them to the
	 * potentially shared {@link #getRecycledViewPool() recycled view pool}.
	 * <p/>
	 * <p>
	 * The offscreen view cache stays aware of changes in the attached adapter,
	 * allowing a LayoutManager to reuse those views unmodified without needing
	 * to return to the adapter to rebind them.
	 * </p>
	 *
	 * @param size Number of views to cache offscreen before returning them to
	 *            the general recycled view pool
	 */
	public void setItemViewCacheSize(int size)
	{
		mRecycler.setViewCacheSize(size);
	}

	/**
	 * Return the current scrolling state of the RecyclerView.
	 *
	 * @return {@link #SCROLL_STATE_IDLE}, {@link #SCROLL_STATE_DRAGGING} or
	 *         {@link #SCROLL_STATE_SETTLING}
	 */
	public int getScrollState()
	{
		return mScrollState;
	}

	/* private */void setScrollState(int state)
	{
		if (state == mScrollState)
		{
			return;
		}
		int oldState = mScrollState;
		mScrollState = state;
		if (state != SCROLL_STATE_SETTLING)
		{
			if (!isTouchStopWhenFastFling() && oldState == SCROLL_STATE_SETTLING && state == SCROLL_STATE_DRAGGING)
			{
				mTouchDownWhenSettlingFlag = true;
			}
			else
			{
				stopScroll();
			}
		}
		if (mScrollListener != null)
		{
			mScrollListener.onScrollStateChanged(oldState, state);
		}
	}

	/**
	 * Add an {@link ItemDecoration} to this RecyclerView. Item decorations can
	 * affect both measurement and drawing of individual item views.
	 * <p/>
	 * <p>
	 * Item decorations are ordered. Decorations placed earlier in the list will
	 * be run/queried/drawn first for their effects on item views. Padding added
	 * to views will be nested; a padding added by an earlier decoration will
	 * mean further item decorations in the list will be asked to draw/pad
	 * within the previous decoration's given area.
	 * </p>
	 *
	 * @param decor Decoration to add
	 * @param index Position in the decoration chain to insert this decoration
	 *            at.
	 *            If this value is negative the decoration will be added at the
	 *            end.
	 */
	public void addItemDecoration(ItemDecoration decor, int index)
	{
		if (mItemDecorations.isEmpty())
		{
			setWillNotDraw(false);
		}
		if (index < 0)
		{
			mItemDecorations.add(decor);
		}
		else
		{
			mItemDecorations.add(index, decor);
		}
		markItemDecorInsetsDirty();
		requestLayout();
	}

	/**
	 * Add an {@link ItemDecoration} to this RecyclerView. Item decorations can
	 * affect both measurement and drawing of individual item views.
	 * <p/>
	 * <p>
	 * Item decorations are ordered. Decorations placed earlier in the list will
	 * be run/queried/drawn first for their effects on item views. Padding added
	 * to views will be nested; a padding added by an earlier decoration will
	 * mean further item decorations in the list will be asked to draw/pad
	 * within the previous decoration's given area.
	 * </p>
	 *
	 * @param decor Decoration to add
	 */
	public void addItemDecoration(ItemDecoration decor)
	{
		addItemDecoration(decor, -1);
	}

	/**
	 * Remove an {@link ItemDecoration} from this RecyclerView.
	 * <p/>
	 * <p>
	 * The given decoration will no longer impact the measurement and drawing of
	 * item views.
	 * </p>
	 *
	 * @param decor Decoration to remove
	 * @see #addItemDecoration(ItemDecoration)
	 */
	public void removeItemDecoration(ItemDecoration decor)
	{
		mItemDecorations.remove(decor);
		if (mItemDecorations.isEmpty())
		{
			setWillNotDraw(false);
		}
		markItemDecorInsetsDirty();
		requestLayout();
	}

	/**
	 * Set a listener that will be notified of any changes in scroll state or
	 * position.
	 *
	 * @param listener Listener to set or null to clear
	 */
	public void setOnScrollListener(OnScrollListener listener)
	{
		mScrollListener = listener;
	}

	/**
	 * Convenience method to scroll to a certain position without smoothly or
	 * animation
	 * <p/>
	 * RecyclerView does not implement scrolling logic, rather forwards the call
	 * to {@link #scrollToPosition(int)}
	 *
	 * @param position Scroll to this adapter position
	 * @see #scrollToPosition(int)
	 */
	public void scrollToPosition(int position)
	{
		stopScroll();
		mLayout.scrollToPosition(position);
		if (mScrollListener != null)
		{
			mScrollListener.onScrolled((int) getX(), position);
		}
	}

	/**
	 * Convenience method to scroll to a certain position without smoothly or
	 * animation
	 */
	public void scrollToPosition(int position, int offset)
	{
		stopScroll();
		mLayout.scrollToPositionWithOffset(position, offset);
		if (mScrollListener != null)
		{
			mScrollListener.onScrolled((int) getX(), position);
		}
	}

	public void scrollToPositionWithGravity(int position, int gravity, int itemHeight)
	{
		stopScroll();
		mLayout.scrollToPositionWidthGravity(position, gravity, itemHeight);
	}

	public void smoothScrollToPosition(int position)
	{
		mLayout.smoothScrollToPosition(this, mState, position);
	}

	@Override
	public void scrollTo(int x, int y)
	{
		throw new UnsupportedOperationException("RecyclerView does not support scrolling to an absolute position.");
	}

	@Override
	public void scrollBy(int x, int y)
	{
		if (mLayout == null)
		{
			throw new IllegalStateException("Cannot scroll without a LayoutManager set. " + "Call setLayoutManager with a non-null argument.");
		}
		final boolean canScrollHorizontal = mLayout.canScrollHorizontally();
		final boolean canScrollVertical = mLayout.canScrollVertically();
		if (canScrollHorizontal || canScrollVertical)
		{
			scrollByInternal(canScrollHorizontal ? x : 0, canScrollVertical ? y : 0);
		}
	}

	/**
	 * Helper method reflect data changes to the state.
	 * <p/>
	 * Adapter changes during a scroll may trigger a crash because scroll
	 * assumes no data change but data actually changed.
	 * <p/>
	 * This method consumes all deferred changes to avoid that case.
	 * <p/>
	 * This also ends all pending animations. It will be changed once we can
	 * support animations during scroll.
	 */
	protected void consumePendingUpdateOperations()
	{
		if (mPendingUpdates.size() > 0)
		{
			mUpdateChildViewsRunnable.run();
		}
	}

	int[] tmpResult = new int[2];

	protected int getSpringBackMaxDistance()
	{
		return 120; // UIResourceDimen.dimen.uifw_recycler_springback_max_distance
	}

	protected int getAutoScrollVelocity()
	{
		return 9; // UIResourceDimen.dimen.uifw_recycler_auto_scroll_velocity
	}

	protected boolean changeUpOverScrollEnableOnComputeDxDy(int dx, int dy, boolean careSpringBackMaxDistance, Scroller scroller, boolean isTouch,
			boolean currentUpOverScrollEnabled)
	{
		return currentUpOverScrollEnabled;
	}

	/* private */int[] computeDxDy(int dx, int dy, boolean careSpringBackMaxDistance, Scroller scroller, boolean isTouch)
	{
		int[] result = tmpResult;
		result[0] = dx;
		result[1] = dy;
		//		Log.d("leo", "computeDxDy:total=" + mState.mTotalHeight);
		final int springbackDis = getSpringBackMaxDistance();
		boolean upOverScrollEnabled = mUpOverScrollEnabled;
		boolean downOverScrollEnabled = mDownOverScrollEnabled;
		upOverScrollEnabled = changeUpOverScrollEnableOnComputeDxDy(dx, dy, careSpringBackMaxDistance, scroller, isTouch, mUpOverScrollEnabled);
		if (dx != 0) // 水平方向滑动
		{
			if (mOffsetX + dx < 0)
			{
				if (!upOverScrollEnabled)
				{
					dx = -mOffsetX;
					if (scroller != null)
					{
						scroller.forceFinished(true);
					}
				}
				else
				{
					if (mOffsetX < 0)
					{
						dx = dx > 0 ? dx : (dx / 3 == 0 || !isTouch ? dx : dx / 3);
					}
					if (mOffsetX + dx <= -springbackDis && careSpringBackMaxDistance)
					{
						dx = -mOffsetX - springbackDis;
						if (scroller != null)
						{
							scroller.forceFinished(true);
						}
					}
				}
			}
			else if (mOffsetX + dx > mState.mTotalHeight - getWidth())
			{
				if (!downOverScrollEnabled)
				{
					if (mState.mTotalHeight <= getWidth())
					{
						dx = 0;
					}
					else
					{
						dx = mState.mTotalHeight - getWidth() - mOffsetX;
					}
					if (scroller != null)
					{
						scroller.forceFinished(true);
					}
				}
				else
				{
					if (mOffsetX > mState.mTotalHeight - getWidth())
					{
						dx = dx < 0 ? dx : (dx / 3 == 0 || !isTouch ? dx : dx / 3);
					}
					int d = 0;
					if (mState.mTotalHeight <= getWidth())
					{
						d = 0;
					}
					else
					{
						d = mState.mTotalHeight - getWidth();
					}
					if (mOffsetX + dx >= d + springbackDis && careSpringBackMaxDistance)
					{

						dx = -mOffsetX + d + springbackDis;
						if (scroller != null)
						{
							scroller.forceFinished(true);
						}
					}
				}

			}
		}
		if (dy != 0) // 竖直方向滑动
		{
			if (mOffsetY + dy <= 0)
			{
				if (!upOverScrollEnabled)
				{
					int unConsumedY = dy + mOffsetY;
					dy = -mOffsetY;
					if (scroller != null && scroller.isFling())
					{
						onFlingToTopEdge(scroller.getCurrVelocity(), unConsumedY);
					}
					else if (mIsTouching)
					{
						onScrollToTopEdge();
					}
					if (scroller != null)
					{
						scroller.forceFinished(true);
					}
				}
				else
				{
					if (mOffsetY < 0)
					{
						dy = dy > 0 ? dy : (dy / 3 == 0 || !isTouch ? dy : dy / 3);
					}

					if (mOffsetY + dy <= -springbackDis && careSpringBackMaxDistance)
					{
						dy = -mOffsetY - springbackDis;
						if (scroller != null)
						{
							scroller.forceFinished(true);
						}
					}
				}
			}
			else if (mOffsetY + dy > mState.mTotalHeight - getHeight())
			{
				if (!downOverScrollEnabled) // 不能向下overScroll
				{
					//					if (getAdapter() instanceof RecyclerAdapter && ((RecyclerAdapter) getAdapter()).isAutoCalculateItemHeight()
					//							&& !((RecyclerAdapter) getAdapter()).mAutoCalcItemHeightFinish)
					//					{
					//						// 在总长度还没计算出来时，不修改dy
					//						//						Log.e("leo", "no mTotalHeight pass " + mState.mTotalHeight);
					//					}
					//					else
					{
						if (mState.mTotalHeight <= getHeight())
						{
							//							Log.e("leo", "mState.mTotalHeight <= getHeight() => 0, " + mState.mTotalHeight + ", " + getHeight());
							dy = 0;
						}
						else
						{
							//							Log.e("leo", "dy = mState.mTotalHeight - getHeight() - mOffsetY " +
							//									mState.mTotalHeight + ", " + getHeight() + ", " + mOffsetY);
							dy = mState.mTotalHeight - getHeight() - mOffsetY;
						}
						if (scroller != null)
						{
							//							Log.e("leo", "scroller.forceFinished(true);");
							scroller.forceFinished(true);
						}
					}
				}
				else
				{// 可以向下overScroll
					if (DEBUG)
					{
						//						Log.d("leo", "computedxdy overscroll!!" + "mOffsetY=" + mOffsetY + ",listTotal=" + mState.mTotalHeight);
					}
					//					if (getAdapter() instanceof RecyclerAdapter && ((RecyclerAdapter) getAdapter()).isAutoCalculateItemHeight()
					//							&& !((RecyclerAdapter) getAdapter()).mAutoCalcItemHeightFinish)
					//					{
					//						// 在总长度还没计算出来时，不修改dy
					//						//						Log.e("leo", "no mTotalHeight pass " + mState.mTotalHeight);
					//					}
					//					else
					{
						if (mOffsetY > mState.mTotalHeight - getHeight())
						{
							dy = dy < 0 ? dy : (dy / 3 == 0 || !isTouch ? dy : dy / 3);
						}
						int distance = 0;
						if (mState.mTotalHeight <= getHeight())
						{
							distance = 0;
						}
						else
						{
							distance = mState.mTotalHeight - getHeight();
						}
						if (mOffsetY + dy >= distance + springbackDis && careSpringBackMaxDistance)
						{
							// Log.d("leo", "overscroll!!!!!!!!!!" + "mOffsetY=" +
							// mOffsetY + ",listTotal=" +
							// mAdapter.getListTotalHeight());
							if (DEBUG)
							{
								//								Log.d("leo", "scroll to barrier!!mOffsetY=" + mOffsetY);
							}
							dy = -mOffsetY + distance + springbackDis;
							if (scroller != null)
							{
								scroller.forceFinished(true);
							}
							// }
						}
					}
				}
			}
			else if (mStopAtTitle && mNeedStopAtTitleIndex != -1)
			{
				int distance = getStopPosition();
				if (mOffsetY + dy < distance)
				{
					dy = distance - mOffsetY;
					if (scroller != null)
					{
						scroller.forceFinished(true);
					}
				}
			}

		}
		result[0] = dx;
		result[1] = dy;
		return result;
	}

	protected void onScrollToTopEdge()
	{

	}

	/* private */int getStopPosition()
	{
		int distance = 0;
		int headerCount = mAdapter.getHeaderViewCount();
		for (int i = headerCount; i > mNeedStopAtTitleIndex; i--)
		{
			distance += mAdapter.getHeaderViewHeight(i);
		}
		return distance;
	}

	/* private */void resetStopAtTitle()
	{
		if (mNeedStopAtTitleIndex != -1)
		{
			if (mStopAtTitle)
			{
				if (mOffsetY == getStopPosition())
				{
					mStopAtTitle = false;
				}
			}
			else
			{
				if (mOffsetY >= getStopPosition())
				{
					mStopAtTitle = (getHeight() + getStopPosition()) < mState.mTotalHeight;
				}
			}
		}
	}

	protected void onFlingToTopEdge(float velocity, int unConsumedY)
	{

	}

	protected boolean checkShouldStopScroll()
	{
		return false;
	}

	protected boolean checkShouldConsumePendingUpdates()
	{
		return true;
	}

	protected boolean checkShouldInvalidateInScroll()
	{
		return true;
	}

	/**
	 * Does not perform bounds checking. Used by internal methods that have
	 * already validated input.
	 */
	void scrollByInternal(int x, int y)
	{
		int overscrollX = 0, overscrollY = 0;
		if (checkShouldConsumePendingUpdates())
		{
			consumePendingUpdateOperations();
		}
		if (checkShouldStopScroll())
		{
			return;
		}
		if (mAdapter != null)
		{
			eatRequestLayout();
			if (x != 0)
			{
				x = computeDxDy(x, 0, false, null, true)[0];
				final int hresult = mLayout.scrollHorizontallyBy(x, mRecycler, mState);
				overscrollX = x - hresult;
			}
			if (y != 0)
			{
				y = computeDxDy(0, y, false, null, true)[1];
				final int vresult = mLayout.scrollVerticallyBy(y, mRecycler, mState);
				overscrollY = y - vresult;
			}

			resumeRequestLayout(false);
		}

		if (!mItemDecorations.isEmpty())
		{
			invalidate();
		}
		invalidateRefreshHeader();
		pullGlows(overscrollX, overscrollY);
		if (mScrollListener != null && (x != 0 || y != 0))
		{
			mScrollListener.onScrolled(x, y);
		}
		if (checkShouldInvalidateInScroll())
		{
			invalidate();
		}
		pullGlows(overscrollX, overscrollY);
		if (mScrollListener != null && (x != 0 || y != 0))
		{
			mScrollListener.onScrolled(x, y);
		}
		if (!awakenScrollBars())
		{
			//			invalidate();
		}
	}

	protected void invalidateRefreshHeader()
	{

	}

	@Override
	protected int computeHorizontalScrollOffset()
	{
		return mLayout.canScrollHorizontally() ? mLayout.computeHorizontalScrollOffset(mState) : 0;
	}

	@Override
	protected int computeHorizontalScrollExtent()
	{
		return mLayout.canScrollHorizontally() ? mLayout.computeHorizontalScrollExtent(mState) : 0;
	}

	@Override
	protected int computeHorizontalScrollRange()
	{
		return mLayout.canScrollHorizontally() ? mLayout.computeHorizontalScrollRange(mState) : 0;
	}

	@Override
	protected int computeVerticalScrollOffset()
	{
		return mLayout.canScrollVertically() ? mLayout.computeVerticalScrollOffset(mState) : 0;
	}

	@Override
	protected int computeVerticalScrollExtent()
	{
		return mLayout.canScrollVertically() ? mLayout.computeVerticalScrollExtent(mState) : 0;
	}

	@Override
	protected int computeVerticalScrollRange()
	{
		return mLayout.canScrollVertically() ? mLayout.computeVerticalScrollRange(mState) : 0;
	}

	protected void eatRequestLayout()
	{
		if (!mEatRequestLayout)
		{
			mEatRequestLayout = true;
			mLayoutRequestEaten = false;
		}
	}

	protected void resumeRequestLayout(boolean performLayoutChildren)
	{
		if (mEatRequestLayout)
		{
			if (performLayoutChildren && mLayoutRequestEaten && mLayout != null && mAdapter != null)
			{
				dispatchLayout();
			}
			mEatRequestLayout = false;
			mLayoutRequestEaten = false;
		}
	}

	/**
	 * Animate a scroll by the given amount of pixels along either axis.
	 *
	 * @param dx Pixels to scroll horizontally
	 * @param dy Pixels to scroll vertically
	 */
	public void smoothScrollBy(int dx, int dy)
	{
		smoothScrollBy(dx, dy, true);
	}

	public void smoothScrollBy(int dx, int dy, boolean careSpringBackMaxDistance)
	{
		smoothScrollBy(dx, dy, careSpringBackMaxDistance, false);
	}

	public void smoothScrollBy(int dx, int dy, boolean careSpringBackMaxDistance, boolean forceScroll)
	{
		if (dx != 0 || dy != 0)
		{
			if (!mState.mStructureChanged || forceScroll)
			{
				mViewFlinger.smoothScrollBy(dx, dy, careSpringBackMaxDistance);
			}
		}
	}

	public int getOffsetY()
	{
		return mOffsetY;
	}

	/**
	 * Begin a standard fling with an initial velocity along each axis in pixels
	 * per second. If the velocity given is below the system-defined minimum
	 * this method will return false and no fling will occur.
	 *
	 * @param velocityX Initial horizontal velocity in pixels per second
	 * @param velocityY Initial vertical velocity in pixels per second
	 * @return true if the fling was started, false if the velocity was too low
	 *         to fling
	 */
	public boolean fling(int velocityX, int velocityY)
	{
		if (Math.abs(velocityX) < mMinFlingVelocity)
		{
			velocityX = 0;
		}
		if (Math.abs(velocityY) < mMinFlingVelocity)
		{
			velocityY = 0;
		}
		velocityX = Math.max(-mMaxFlingVelocity, Math.min(velocityX, mMaxFlingVelocity));
		velocityY = Math.max(-mMaxFlingVelocity, Math.min(velocityY, mMaxFlingVelocity));
		if (velocityX != 0 || velocityY != 0)
		{
			mViewFlinger.fling(velocityX, velocityY);
			return true;
		}
		return false;
	}

	/**
	 * Stop any current scroll in progress, such as one started by
	 * {@link #smoothScrollBy(int, int)}, {@link #fling(int, int)} or a
	 * touch-initiated fling.
	 */
	public void stopScroll()
	{
		mViewFlinger.stop();
		mLayout.stopSmoothScroller();
	}

	/**
	 * Apply a pull to relevant overscroll glow effects
	 */
	/* private */void pullGlows(int overscrollX, int overscrollY)
	{
		if (overscrollY > 0)
		{
			// stopScroll();
		}
	}

	protected boolean shouldStopReleaseGlows(boolean canGoRefresh, boolean fromTouch)
	{
		return false;
	}

	protected void onTouchMove(int x, int y) {

  }

  protected void releaseGlowsForHorizontal()
  {
    if (mOffsetX < mState.mCustomHeaderWidth || getWidth() > mState.mTotalHeight)
    {
      scrollToTop(null);
    }
    else if (mOffsetX > mState.mTotalHeight - getWidth())
    {
      smoothScrollBy(mState.mTotalHeight - getWidth() - mOffsetX, 0);
    }
  }

  protected void releaseGlowsForVertical()
  {
    final int totalHeight = mState.mTotalHeight;
    if (mOffsetY < mState.mCustomHeaderHeight || getHeight() > totalHeight)
    {
      scrollToTop(null);
    }
    else if (mOffsetY > totalHeight - getHeight())
    {
      smoothScrollBy(0, totalHeight - getHeight() - mOffsetY);
    }
    else if (mOffsetY >= totalHeight - getHeight() && needNotifyFooter)
    {
      if (this.shouldPrebindItem() && mOffsetY + getHeight() != totalHeight)
      {
        return;
      }
      // Log.d("leo", "onrelease glows neednotify");
      needNotifyFooter = false;
      checkNotifyFooterOnRelease = false;
      mRecycler.notifyLastFooterAppeared();
    }
  }

	protected void releaseGlows(boolean canGoRefresh, boolean fromTouch)
	{
		if (mState.mCustomHeaderHeight != 0 || mState.mCustomFooterHeight != 0 || mOffsetY < 0 || getHeight() > mState.mTotalHeight)
		{
			if (shouldStopReleaseGlows(canGoRefresh, fromTouch))
			{
				return;
			}
		}

		if (mLayout.canScrollHorizontally())
		{
			releaseGlowsForHorizontal();
		}
		else
        {
        	releaseGlowsForVertical();
		}
	}

	// /*private*/ void scrollToInSpringBack(int x, int y)
	// {
	// scrollTo(x, y);
	// }

	public int getTotalHeight()
	{
		return mState.mTotalHeight;
	}

	void absorbGlows(int velocityX, int velocityY)
	{
	}

	// Focus handling

	@Override
	public View focusSearch(View focused, int direction)
	{
		View result = mLayout.onInterceptFocusSearch(focused, direction);
		if (result != null)
		{
			return result;
		}
		final FocusFinder ff = FocusFinder.getInstance();
		result = ff.findNextFocus(this, focused, direction);
		if (result == null && mAdapter != null)
		{
			eatRequestLayout();
			result = mLayout.onFocusSearchFailed(focused, direction, mRecycler, mState);
			resumeRequestLayout(false);
		}
		return result != null ? result : super.focusSearch(focused, direction);
	}

	@Override
	public void requestChildFocus(View child, View focused)
	{
		if (focused != null && mLayout != null && !mLayout.onRequestChildFocus(this, child, focused))
		{
			mTempRect.set(0, 0, focused.getWidth(), focused.getHeight());
			offsetDescendantRectToMyCoords(focused, mTempRect);
			offsetRectIntoDescendantCoords(child, mTempRect);
			// @DenverHan, 这里 不能使用动画来滚屏
			// requestChildRectangleOnScreen(child, mTempRect,
			// !mFirstLayoutComplete);
			requestChildRectangleOnScreen(child, mTempRect, true);
		}
		super.requestChildFocus(child, focused);
		// showFocusChild(focused);
	}

	@Override
	public boolean requestChildRectangleOnScreen(View child, Rect rect, boolean immediate)
	{
		return mLayout.requestChildRectangleOnScreen(this, child, rect, immediate);
	}

	@Override
	public void addFocusables(ArrayList<View> views, int direction, int focusableMode)
	{
		if (!mLayout.onAddFocusables(this, views, direction, focusableMode))
		{
			super.addFocusables(views, direction, focusableMode);
		}
	}

	@Override
	protected void onAttachedToWindow()
	{
		super.onAttachedToWindow();
		mIsAttached = true;
		if (mLayout != null)
		{
			mLayout.onAttachedToWindow(this);
		}
		mPostedAnimatorRunner = false;
		if (mAdapter != null)
		{
			mAdapter.onViewAttached();
		}
	}

	@Override
	protected void onDetachedFromWindow()
	{
		super.onDetachedFromWindow();

		// TODO Mark what our target position was if relevant, then we can jump
		// there
		// on reattach.
		mIsAttached = false;
		if (mLayout != null)
		{
			mLayout.onDetachedFromWindow(this);
		}
		removeCallbacks(mItemAnimatorRunner);
		if (mAdapter != null)
		{
			mAdapter.onViewDetached();
		}
	}

	public void addOnItemTouchListener(OnItemTouchListener listener)
	{
		mOnItemTouchListeners.add(listener);
	}

	public void addOnItemTouchListenerToFront(OnItemTouchListener listener)
	{
		mOnItemTouchListeners.add(0, listener);
	}

	/**
	 * Remove an {@link OnItemTouchListener}. It will no longer be able to
	 * intercept touch events.
	 *
	 * @param listener Listener to remove
	 */
	public void removeOnItemTouchListener(OnItemTouchListener listener)
	{
		mOnItemTouchListeners.remove(listener);
		if (mActiveOnItemTouchListener == listener)
		{
			mActiveOnItemTouchListener = null;
		}
	}

	/* private */boolean dispatchOnItemTouchIntercept(MotionEvent e)
	{
		final int action = e.getAction();
		if (action == MotionEvent.ACTION_CANCEL || action == MotionEvent.ACTION_DOWN)
		{
			mActiveOnItemTouchListener = null;
		}

		final int listenerCount = mOnItemTouchListeners.size();
		for (int i = 0; i < listenerCount; i++)
		{
			final OnItemTouchListener listener = mOnItemTouchListeners.get(i);
			if (listener.onInterceptTouchEvent(this, e) && action != MotionEvent.ACTION_CANCEL)
			{
				mActiveOnItemTouchListener = listener;
				return true;
			}
		}
		return false;
	}

	/* private */boolean dispatchOnItemTouch(MotionEvent e)
	{
		final int action = e.getAction();
		if (mActiveOnItemTouchListener != null)
		{
			if (action == MotionEvent.ACTION_DOWN)
			{
				// Stale state from a previous gesture, we're starting a new
				// one. Clear it.
				mActiveOnItemTouchListener = null;
			}
			else
			{
				mActiveOnItemTouchListener.onTouchEvent(this, e);
				if (action == MotionEvent.ACTION_CANCEL || action == MotionEvent.ACTION_UP)
				{
					// Clean up for the next gesture.
					mActiveOnItemTouchListener = null;
				}
				return true;
			}
		}

		// Listeners will have already received the ACTION_DOWN via
		// dispatchOnItemTouchIntercept
		// as called from onInterceptTouchEvent; skip it.
		if (action != MotionEvent.ACTION_DOWN)
		{
			final int listenerCount = mOnItemTouchListeners.size();
			for (int i = 0; i < listenerCount; i++)
			{
				final OnItemTouchListener listener = mOnItemTouchListeners.get(i);
				if (listener.onInterceptTouchEvent(this, e))
				{
					mActiveOnItemTouchListener = listener;
					return true;
				}
			}
		}
		return false;
	}

	public void setDisallowParentInterceptTouchEventWhenDrag(boolean disallow)
	{
		this.mDisallowParentInterceptTouchEventWhenDrag = disallow;
	}

	public void setBlockScroll(boolean blockScroll)
	{
		mBlockScroll = blockScroll;
	}

	public boolean isBlockScroll()
	{
		return mBlockScroll;
	}

	protected boolean shouldStopOnInterceptTouchEvent(MotionEvent e, int totalHeight, boolean upOverScrollEnabled)
	{
		return false;
	}

	@Override
	public boolean onInterceptTouchEvent(MotionEvent e)
	{
		if (mAnimatingBlockTouch)
		{
			return true;
		}
		final int totalHeight = mState.mTotalHeight;
		boolean interceptDown = false;
		if (shouldStopOnInterceptTouchEvent(e, totalHeight, mUpOverScrollEnabled))
		{
			return true;
		}
		if (mScrollState != SCROLL_STATE_DRAGGING)
		{
			boolean res = dispatchOnItemTouchIntercept(e);
			if (res && e.getAction() != MotionEvent.ACTION_DOWN)
			{
				cancelTouch();
				return true;
			}
			else if (res)
			{
				interceptDown = true;
			}
		}

		final boolean canScrollHorizontally = mLayout.canScrollHorizontally();
		final boolean canScrollVertically = mLayout.canScrollVertically();

		if (mVelocityTracker == null)
		{
			mVelocityTracker = VelocityTracker.obtain();
		}
		mVelocityTracker.addMovement(e);

		final int action = e.getActionMasked();
		final int actionIndex = e.getActionIndex();

		switch (action)
		{
			case MotionEvent.ACTION_DOWN:
				mScrollPointerId = e.getPointerId(0);
				mInitialTouchX = mLastTouchX = (int) (e.getX() + 0.5f);
				mInitialTouchY = mLastTouchY = (int) (e.getY() + 0.5f);
				if (interceptDown)
				{
					return true;
				}
				if (mScrollState == SCROLL_STATE_SETTLING)
				{
					if (mDisallowParentInterceptTouchEventWhenDrag)
					{
						// getParent().requestDisallowInterceptTouchEvent(true);
					}
					setScrollState(SCROLL_STATE_DRAGGING);
					resetStopAtTitle();
				}

				break;

			case MotionEvent.ACTION_POINTER_DOWN:
				mScrollPointerId = e.getPointerId(actionIndex);
				mInitialTouchX = mLastTouchX = (int) (e.getX(actionIndex) + 0.5f);
				mInitialTouchY = mLastTouchY = (int) (e.getY(actionIndex) + 0.5f);
				break;

			case MotionEvent.ACTION_MOVE:
			{
				final int index = e.findPointerIndex(mScrollPointerId);
				if (index < 0)
				{
					// Log.e(TAG,
					// "Error processing scroll; pointer index for id " +
					// mScrollPointerId +
					// " not found. Did any MotionEvents get skipped?");
					return false;
				}

				if (!mBlockScroll)
				{
					final float x = e.getX(index);
					final float y = e.getY(index);
					if (mScrollState != SCROLL_STATE_DRAGGING)
					{
						final float dx = x - mInitialTouchX;
						final float dy = y - mInitialTouchY;
						boolean startScroll = false;
						if (canScrollHorizontally && Math.abs(dx) > mTouchSlop && Math.abs(dx) > Math.abs(dy))
						{
							// 这里加入dy>dx的判断，防止在recyclerview吃掉左右滑动事件，从而能够将左右滑动事件传递给子view
							mLastTouchX = mInitialTouchX + mTouchSlop * (dx < 0 ? -1 : 1);
							startScroll = true;
						}
						if (canScrollVertically && Math.abs(dy) > mTouchSlop && Math.abs(dy) > Math.abs(dx))
						{
							// 这里加入dy>dx的判断，防止在recyclerview吃掉上下滑动事件，从而能够将上下滑动事件传递给子view
							mLastTouchY = mInitialTouchY + mTouchSlop * (dy < 0 ? -1 : 1);
							startScroll = true;
						}
						if (startScroll && onStartScroll((int) Math.abs(dy)))
						{
							if (mDisallowParentInterceptTouchEventWhenDrag)
							{
								getParent().requestDisallowInterceptTouchEvent(true);
							}
							setScrollState(SCROLL_STATE_DRAGGING);
						}
					}
				}
			}
				break;

			case MotionEvent.ACTION_POINTER_UP:
			{
				onPointerUp(e);
			}
				break;

			case MotionEvent.ACTION_UP:
			{
				mVelocityTracker.clear();

				// cancelLift();
			}
				break;

			case MotionEvent.ACTION_CANCEL:
			{
				// cancelTouch();
			}
		}
		return mScrollState == SCROLL_STATE_DRAGGING;
	}

	protected boolean shouldStopOnTouchEvent(MotionEvent e, int totalHeight, boolean upOverScrollEnabled)
	{
		return false;
	}


	@Override
	public boolean onTouchEvent(MotionEvent e)
	{
		final boolean canScrollHorizontally = !mBlockScroll && mLayout.canScrollHorizontally();
		final boolean canScrollVertically = !mBlockScroll && mLayout.canScrollVertically();
		if (mAnimatingBlockTouch)
		{
			return true;
		}
		final int totalHeight = mState.mTotalHeight;
		if (shouldStopOnTouchEvent(e, totalHeight, mUpOverScrollEnabled))
		{
			return true;
		}
		if (mScrollState != SCROLL_STATE_DRAGGING)
		{
			if (dispatchOnItemTouch(e))
			{
				cancelTouch();
				return true;
			}
		}

		if (mVelocityTracker == null)
		{
			mVelocityTracker = VelocityTracker.obtain();
		}
		mVelocityTracker.addMovement(e);

		final int action = e.getActionMasked();
		final int actionIndex = e.getActionIndex();

		switch (action)
		{
			case MotionEvent.ACTION_DOWN:
			{
				mTouchEventState = MotionEvent.ACTION_DOWN;
				mScrollPointerId = e.getPointerId(0);
				mInitialTouchX = mLastTouchX = (int) (e.getX() + 0.5f);
				mInitialTouchY = mLastTouchY = (int) (e.getY() + 0.5f);
				if (!isTouchStopWhenFastFling())
				{
					removeCallbacks(mTouchDownWhenSettlingCheckRunnable);
					postDelayed(mTouchDownWhenSettlingCheckRunnable, TOUCH_DOWN_WHEN_SETTING_CHECK_INTERVAL);
				}
				if (getAdapter() != null)
				{
					getAdapter().onSuddenStop();
				}
			}
				break;

			case MotionEvent.ACTION_POINTER_DOWN:
			{
				mScrollPointerId = e.getPointerId(actionIndex);
				mInitialTouchX = mLastTouchX = (int) (e.getX(actionIndex) + 0.5f);
				mInitialTouchY = mLastTouchY = (int) (e.getY(actionIndex) + 0.5f);
			}
				break;

			case MotionEvent.ACTION_MOVE:
			{
				final int index = e.findPointerIndex(mScrollPointerId);
				if (index < 0)
				{
					return false;
				}
				mTouchEventState = MotionEvent.ACTION_MOVE;
				mIsTouching = true;
				final int x = (int) (e.getX(index) + 0.5f);
				final int y = (int) (e.getY(index) + 0.5f);
				if (mScrollState != SCROLL_STATE_DRAGGING)
				{
					final int dx = x - mInitialTouchX;
					final int dy = y - mInitialTouchY;
					boolean startScroll = false;
					if (canScrollHorizontally && Math.abs(dx) > mTouchSlop)
					{
						mLastTouchX = mInitialTouchX + mTouchSlop * (dx < 0 ? -1 : 1);
						startScroll = true;
					}
					if (canScrollVertically && Math.abs(dy) > mTouchSlop)
					{
						mLastTouchY = mInitialTouchY + mTouchSlop * (dy < 0 ? -1 : 1);
						startScroll = true;
					}
					if (startScroll)
					{
						if (mDisallowParentInterceptTouchEventWhenDrag)
						{
							if (getParent() != null)
							{
								getParent().requestDisallowInterceptTouchEvent(true);
							}
						}
						setScrollState(SCROLL_STATE_DRAGGING);
					}
				}
				if (mScrollState == SCROLL_STATE_DRAGGING)
				{
					final int dx = x - mLastTouchX;
					final int dy = y - mLastTouchY;
					scrollByInternal(canScrollHorizontally ? -dx : 0, canScrollVertically ? -dy : 0);
					if (needNotifyFooter && !checkNotifyFooterOnRelease)
					{
						if (!this.shouldPrebindItem() || mOffsetY + getHeight() >= getTotalHeight())
						{
							needNotifyFooter = false;
							if (mRecycler != null)
							{
								mRecycler.notifyLastFooterAppeared();
							}
						}
					}
				}
				mLastTouchX = x;
				mLastTouchY = y;
			}
				break;

			case MotionEvent.ACTION_POINTER_UP:
			{
				onPointerUp(e);
			}
				break;
			case MotionEvent.ACTION_CANCEL:
			case MotionEvent.ACTION_UP:
			{
				mTouchEventState = MotionEvent.ACTION_UP;
				mVelocityTracker.computeCurrentVelocity(1000, mMaxFlingVelocity);
				final float xvel = canScrollHorizontally ? -mVelocityTracker.getXVelocity(mScrollPointerId) : 0;
				final float yvel = canScrollVertically ? -mVelocityTracker.getYVelocity(mScrollPointerId) : 0;
				if (!((xvel != 0 || yvel != 0) && fling((int) xvel, (int) yvel)))
				{
					resetStopAtTitle();
					setScrollState(SCROLL_STATE_IDLE);
					handleOnTouchUpEventWhenStartFling(xvel, yvel);
				}
				if (mEnableRecyclerViewTouchListener && Math.abs(e.getX() - mInitialTouchX) < mTouchSlop
						&& Math.abs(e.getY() - mInitialTouchY) < mTouchSlop && action == MotionEvent.ACTION_UP)
				{
					notifyRecyclerViewTouchEvent(e);
				}
				handleCustomClickEvent(e);
				mVelocityTracker.clear();
				releaseGlows(true, true);
			}
				break;

		}
		mIsTouching = false;
		return true;
	}

	protected void handleOnTouchUpEventWhenStartFling(float xVel, float yVel)
	{

	}

	public void cancelTouch()
	{
		if (mVelocityTracker != null)
		{
			mVelocityTracker.clear();
		}
		releaseGlows(false, true);
		setScrollState(SCROLL_STATE_IDLE);

	}

	public void forceCancelTouch()
	{
		if (mVelocityTracker != null)
		{
			mVelocityTracker.clear();
		}
		setScrollState(SCROLL_STATE_IDLE);
	}


	/* private */void onPointerUp(MotionEvent e)
	{
		final int actionIndex = e.getActionIndex();
		if (e.getPointerId(actionIndex) == mScrollPointerId)
		{
			// Pick a new pointer to pick up the slack.
			final int newIndex = actionIndex == 0 ? 1 : 0;
			mScrollPointerId = e.getPointerId(newIndex);
			mInitialTouchX = mLastTouchX = (int) (e.getX(newIndex) + 0.5f);
			mInitialTouchY = mLastTouchY = (int) (e.getY(newIndex) + 0.5f);
		}
	}

	@Override
	protected void onMeasure(int widthSpec, int heightSpec)
	{
		if (mAdapterUpdateDuringMeasure)
		{
			eatRequestLayout();
			updateChildViews();
			mAdapterUpdateDuringMeasure = false;
			resumeRequestLayout(false);
		}

		if (mAdapter != null)
		{
			mState.mItemCount = mAdapter.getItemCount();
			mState.mHeaderCount = mAdapter.getHeaderViewCount();
			mState.mFooterCount = mAdapter.getFooterViewCount();
		}

		//		if (mWaterMarkCustomView != null)
		//		{
		//			mWaterMarkCustomView.measure(MeasureSpec.makeMeasureSpec(MeasureSpec.getSize(widthSpec), MeasureSpec.EXACTLY),
		//					MeasureSpec.makeMeasureSpec(MeasureSpec.getSize(heightSpec), MeasureSpec.EXACTLY));
		//			//			if (mNeedWaterMark && (mForceWaterMark || getChildCount() <= 0)) {
		//			//				addView(mWaterMarkCustomView);
		//			//			}
		//		}
		mLayout.onMeasure(mRecycler, mState, widthSpec, heightSpec);

		// getMeasuredWidth();
		// getMeasuredHeight();
	}

	/**
	 * Post a runnable to the next frame to run pending item animations.
	 * Only
	 * the first such request will be posted, governed by the
	 * mPostedAnimatorRunner flag.
	 */
	protected void postAnimationRunner()
	{
		if (!mPostedAnimatorRunner && mIsAttached)
		{
			ViewCompatTool.postOnAnimation(this, mItemAnimatorRunner);
			mPostedAnimatorRunner = true;
		}
	}

	protected boolean predictiveItemAnimationsEnabled()
	{
		return (false && mLayout.supportsPredictiveItemAnimations());
	}

	protected boolean isAnimateChangeSimple(boolean needReCheck, boolean animateChangeSimple)
	{
		if (!needReCheck)
		{
			return false && mItemsAddedOrRemoved && !mItemsChanged;
		}
		else
		{
			return (animateChangeSimple && false);
		}
	}

	protected void dispatchLayout()
	{
		if (mAdapter == null)
		{
			// Log.e(TAG, "No adapter attached; skipping layout");
			return;
		}
		//		Log.e(TAG, "dispatchLayout");
		eatRequestLayout();
		// simple animations are a subset of advanced animations (which will
		// cause a
		// prelayout step)
		if (mItemsAddedOrRemoved || mItemsChanged || mState.mStructureChanged)
		{
			mAdapter.dataChanged();
		}
		boolean animateChangesSimple = isAnimateChangeSimple(false, false);
		final boolean animateChangesAdvanced = ENABLE_PREDICTIVE_ANIMATIONS && animateChangesSimple && predictiveItemAnimationsEnabled();
		mItemsAddedOrRemoved = mItemsChanged = false;
		ArrayMap<View, Rect> appearingViewInitialBounds = null;
		mState.mCustomHeaderHeight = mAdapter.getCustomHeaderViewHeight();
		mState.mCustomFooterHeight = mAdapter.getCustomFooterViewHeight();
		mState.mCustomHeaderWidth  = mAdapter.getCustomHeaderViewWidth();
		mState.mCustomFooterWidth  = mAdapter.getCustomFooterViewWidth();
		mState.mInPreLayout = animateChangesAdvanced;
		mState.mItemCount = mAdapter.getItemCount();
		//		Log.e("leo", "dispatchLayout " + mState.mTotalHeight);
		mState.mTotalHeight = mAdapter.getListTotalHeight();
		// Log.d("leo", "stateItem count=" + mState.mItemCount);
		mState.mHeaderCount = mAdapter.getHeaderViewCount();
		mState.mFooterCount = mAdapter.getFooterViewCount();
		if (animateChangesSimple)
		{
			// Step 0: Find out where all non-removed items are, pre-layout
			mState.mPreLayoutHolderMap.clear();
			mState.mPostLayoutHolderMap.clear();
			int count = getChildCountInItem();
			for (int i = 0; i < count; ++i)
			{
				final ViewHolder holder = getChildViewHolderInt(getChildAtInItem(i));
				final View view = holder.itemView;
				mState.mPreLayoutHolderMap.put(holder,
						new ItemHolderInfo(holder, view.getLeft(), view.getTop(), view.getRight(), view.getBottom(), holder.mPosition));
			}
		}
		//		Log.d("leo", "preholder-------------");
		if (animateChangesAdvanced)
		{

			// Step 1: run prelayout: This will use the old positions of items.
			// The layout manager
			// is expected to layout everything, even removed items (though not
			// to add removed
			// items back to the container). This gives the pre-layout position
			// of APPEARING views
			// which come into existence as part of the real layout.
			mInPreLayout = true;
			final boolean didStructureChange = mState.mStructureChanged;
			mState.mStructureChanged = false;
			// temporarily disable flag because we are asking for previous
			// layout
			mLayout.onLayoutChildren(mRecycler, mState);
			mState.mStructureChanged = didStructureChange;
			mInPreLayout = false;

			appearingViewInitialBounds = new ArrayMap<View, Rect>();
			for (int i = 0; i < getChildCountInItem(); ++i)
			{
				boolean found = false;
				View child = getChildAt(i);
				for (int j = 0; j < mState.mPreLayoutHolderMap.size(); ++j)
				{
					ViewHolder holder = mState.mPreLayoutHolderMap.keyAt(j);
					if (holder.itemView == child)
					{
						found = true;
						continue;
					}
				}
				if (!found)
				{
					appearingViewInitialBounds.put(child, new Rect(child.getLeft(), child.getTop(), child.getRight(), child.getBottom()));
				}
			}
		}
		clearOldPositions();
		dispatchLayoutUpdates();
		mState.mItemCount = mAdapter.getItemCount();

		// Step 2: Run layout
		mState.mHeaderCountInScreen = 0;
		mState.mFooterCountInScreen = 0;
		mState.mInPreLayout = false;
		mLayout.onLayoutChildren(mRecycler, mState);

		mState.mStructureChanged = false;
		mPendingSavedState = null;

		// onLayoutChildren may have caused client code to disable item
		// animations; re-check
		animateChangesSimple = isAnimateChangeSimple(true, animateChangesSimple);

		if (animateChangesSimple)
		{
			// Step 3: Find out where things are now, post-layout
			int count = getChildCountInItem();
			for (int i = 0; i < count; ++i)
			{
				ViewHolder holder = getChildViewHolderInt(getChildAtInItem(i));
				final View view = holder.itemView;
				mState.mPostLayoutHolderMap.put(holder,
						new ItemHolderInfo(holder, view.getLeft(), view.getTop(), view.getRight(), view.getBottom(), holder.mPosition));
			}
			// Step 4: Animate DISAPPEARING and REMOVED items
			int preLayoutCount = mState.mPreLayoutHolderMap.size();
			for (int i = preLayoutCount - 1; i >= 0; i--)
			{
				ViewHolder itemHolder = mState.mPreLayoutHolderMap.keyAt(i);
				if (!mState.mPostLayoutHolderMap.containsKey(itemHolder))
				{
					ItemHolderInfo disappearingItem = mState.mPreLayoutHolderMap.valueAt(i);
					mState.mPreLayoutHolderMap.removeAt(i);

					View disappearingItemView = disappearingItem.holder.itemView;
					removeDetachedView(disappearingItemView, false);
					mRecycler.unscrapView(disappearingItem.holder);

					animateDisappearance(disappearingItem);
				}
			}
			// Step 5: Animate APPEARING and ADDED items
			int postLayoutCount = mState.mPostLayoutHolderMap.size();
			if (postLayoutCount > 0)
			{
				for (int i = postLayoutCount - 1; i >= 0; i--)
				{
					ViewHolder itemHolder = mState.mPostLayoutHolderMap.keyAt(i);
					ItemHolderInfo info = mState.mPostLayoutHolderMap.valueAt(i);
					if ((mState.mPreLayoutHolderMap.isEmpty() || !mState.mPreLayoutHolderMap.containsKey(itemHolder)))
					{
						mState.mPostLayoutHolderMap.removeAt(i);
						Rect initialBounds = (appearingViewInitialBounds != null) ? appearingViewInitialBounds.get(itemHolder.itemView) : null;
						animateAppearance(itemHolder, initialBounds, info.left, info.top);
					}
				}
			}
			// Step 6: Animate PERSISTENT items
			count = mState.mPostLayoutHolderMap.size();
			for (int i = 0; i < count; ++i)
			{
				ViewHolder postHolder = mState.mPostLayoutHolderMap.keyAt(i);
				ItemHolderInfo postInfo = mState.mPostLayoutHolderMap.valueAt(i);
				ItemHolderInfo preInfo = mState.mPreLayoutHolderMap.get(postHolder);
				handleLayoutHolder(postHolder, preInfo, postInfo);
			}
		}
		resumeRequestLayout(false);
		handleDispatchLayoutEnd();
		mLayout.removeAndRecycleScrapInt(mRecycler, !animateChangesAdvanced, true);
		mState.mPreviousLayoutItemCount = mState.mItemCount;
		mState.mDeletedInvisibleItemCountSincePreviousLayout = 0;
		if (!mPostedAnimatorRunner)
		{
			//			Log.d("leo", "dispatchLayout-->!mPostedAnimatorRunner");
			setRecyclerViewTouchEnabled(true);
		}
		// mCount = mAdapter.getItemCount() + mAdapter.getHeaderViewCount() +
		// mAdapter.getFooterViewCount();
		//niuniuyang: 对于itemchanged，选中的item移动到屏幕外时，此时执行删除操作，item是不会做动画的。
		//也就无法通过onAnimationsFinished退出编辑态，这里需要加一个事件，通知出去，退出编辑态
		if (animateChangesSimple && !mPostedAnimatorRunner)
		{
			handleRangeItemsChangedWithNoAnimation();
		}
	}

	/**
	 * 局部的item变化，在没有动画的情况，需要通知变化结束的事件
	 */
	protected void handleRangeItemsChangedWithNoAnimation()
	{


	}

	protected void handleLayoutHolder(ViewHolder postHolder, ItemHolderInfo preInfo, ItemHolderInfo postInfo)
	{
		if (preInfo != null && postInfo != null)
		{
			if (preInfo.left != postInfo.left || preInfo.top != postInfo.top)
			{
				postHolder.setIsRecyclable(false);
				if (DEBUG)
				{
					//					Log.d(TAG, "PERSISTENT: " + postHolder + " with view " + postHolder.itemView);
				}
			}
		}
	}

	protected void handleDispatchLayoutEnd()
	{

	}

	protected int getViewIndex(View view)
	{
		int count = getChildCount();
		for (int i = 0; i < count; i++)
		{
			if (getChildAt(i) == view)
			{
				return i;
			}
		}
		return -1;
	}

	protected void animateAppearance(ViewHolder itemHolder, Rect beforeBounds, int afterLeft, int afterTop)
	{
		View newItemView = itemHolder.itemView;

		if (beforeBounds != null && (beforeBounds.left != afterLeft || beforeBounds.top != afterTop))
		{
			// slide items in if before/after locations differ
			itemHolder.setIsRecyclable(false);
			if (DEBUG)
			{
				//				Log.d(TAG, "APPEARING: " + itemHolder + " with view " + newItemView);
			}
		}
		else
		{
			if (DEBUG)
			{
				//				Log.d(TAG, "ADDED: " + itemHolder + " with view " + newItemView);
			}
			itemHolder.setIsRecyclable(false);
		}
	}

	protected void animateDisappearance(ItemHolderInfo disappearingItem)
	{
		View disappearingItemView = disappearingItem.holder.itemView;
		addAnimatingView(disappearingItemView);
		int oldLeft = disappearingItem.left;
		int oldTop = disappearingItem.top;
		int newLeft = disappearingItemView.getLeft();
		int newTop = disappearingItemView.getTop();
		if (oldLeft != newLeft || oldTop != newTop)
		{
			disappearingItem.holder.setIsRecyclable(false);
			disappearingItemView.layout(newLeft, newTop, newLeft + disappearingItemView.getWidth(), newTop + disappearingItemView.getHeight());
			if (DEBUG)
			{
				//				Log.d(TAG, "DISAPPEARING: " + disappearingItem.holder + " with view " + disappearingItemView);
			}
		}
		else
		{
			if (DEBUG)
			{
				//				Log.d(TAG, "REMOVED: " + disappearingItem.holder + " with view " + disappearingItemView);
			}
			disappearingItem.holder.setIsRecyclable(false);
		}
	}

	protected void handleOnLayoutChange()
	{

	}

	@Override
	protected void onLayout(boolean changed, int l, int t, int r, int b)
	{
		if (changed)
		{
			if (mAdapter != null)
			{
				mAdapter.dataChanged();
			}
			handleOnLayoutChange();
		}
		eatRequestLayout();
		dispatchLayout();
		resumeRequestLayout(false);
		if (changed)
		{
			if (mIsChangingMode)
			{
				mIsChangingMode = false;
				mRecycler.recycleCachedViews();
			}
		}
		mStopAtTitle = false;
	}

	@Override
	public void requestLayout()
	{
		if (!mEatRequestLayout)
		{
			super.requestLayout();
		}
		else
		{
			mLayoutRequestEaten = true;
		}
	}

	void markItemDecorInsetsDirty()
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final View child = getChildAt(i);
			((LayoutParams) child.getLayoutParams()).mInsetsDirty = true;
		}
	}

	@Override
	public void draw(Canvas c)
	{
		super.draw(c);

		final int count = mItemDecorations.size();
		for (int i = 0; i < count; i++)
		{
			mItemDecorations.get(i).onDrawOver(c, this);
		}
	}

	@Override
	public void onDraw(Canvas c)
	{
		try
		{
			super.onDraw(c);

			final int count = mItemDecorations.size();
			for (int i = 0; i < count; i++)
			{
				mItemDecorations.get(i).onDraw(c, this);
			}
		}
		catch (IllegalArgumentException e)
		{
		}
		catch (RuntimeException e)
		{
		}
	}

	@Override
	protected boolean checkLayoutParams(ViewGroup.LayoutParams p)
	{
		return p instanceof LayoutParams && mLayout.checkLayoutParams((LayoutParams) p);
	}

	@Override
	protected ViewGroup.LayoutParams generateDefaultLayoutParams()
	{
		if (mLayout == null)
		{
			throw new IllegalStateException("RecyclerView has no LayoutManager");
		}
		return mLayout.generateDefaultLayoutParams();
	}

	@Override
	public ViewGroup.LayoutParams generateLayoutParams(AttributeSet attrs)
	{
		if (mLayout == null)
		{
			throw new IllegalStateException("RecyclerView has no LayoutManager");
		}
		return mLayout.generateLayoutParams(getContext(), attrs);
	}

	@Override
	protected ViewGroup.LayoutParams generateLayoutParams(ViewGroup.LayoutParams p)
	{
		if (mLayout == null)
		{
			throw new IllegalStateException("RecyclerView has no LayoutManager");
		}
		return mLayout.generateLayoutParams(p);
	}

	/* private */int findPositionOffset(int position)
	{
		int offset = 0;
		int count = mPendingLayoutUpdates.size();
		for (int i = 0; i < count; ++i)
		{
			UpdateOp op = mPendingLayoutUpdates.get(i);
			if (op.positionStart <= position)
			{
				if (op.cmd == UpdateOp.REMOVE)
				{
					offset -= op.itemCount;
				}
				else if (op.cmd == UpdateOp.ADD)
				{
					offset += op.itemCount;
				}
			}
		}
		return position + offset;
	}

	void dispatchLayoutUpdates()
	{
		final int opCount = mPendingLayoutUpdates.size();
		for (int i = 0; i < opCount; i++)
		{
			final UpdateOp op = mPendingLayoutUpdates.get(i);
			switch (op.cmd)
			{
				case UpdateOp.ADD:
					mLayout.onItemsAdded(this, op.positionStart, op.itemCount);
					break;
				case UpdateOp.REMOVE:
					mLayout.onItemsRemoved(this, op.positionStart, op.itemCount);
					break;
				case UpdateOp.UPDATE:
					break;
			}
			recycleUpdateOp(op);
		}
		mPendingLayoutUpdates.clear();
	}

	public void setChildrenEnabled(int start, int end, boolean enabled)
	{
		final int count = getChildCount();
		for (int i = 0; i < count; i++)
		{
			getChildAt(i).setEnabled(enabled);
		}
	}

	void updateChildViews()
	{
		final int opCount = mPendingUpdates.size();
		for (int i = 0; i < opCount; i++)
		{
			final UpdateOp op = mPendingUpdates.get(i);
			switch (op.cmd)
			{
				case UpdateOp.ADD:
					if (DEBUG)
					{
						//						Log.d(TAG, "UpdateOp.ADD start=" + op.positionStart + " count=" + op.itemCount);
					}
					offsetPositionRecordsForInsert(op.positionStart, op.itemCount);
					mItemsAddedOrRemoved = true;
					break;
				case UpdateOp.REMOVE:
					if (DEBUG)
					{
						//						Log.d(TAG, "UpdateOp.REMOVE start=" + op.positionStart + " count=" + op.itemCount);
					}
					if (op.mRemovePositions != null)
					{
						for (Integer position : op.mRemovePositions)
						{
							disableHolderRecyclable(position);
							offsetPositionRecordsForRemove(position, 1, false);
						}
						requestLayout();
					}
					else
					{
						for (int j = 0; j < op.itemCount; ++j)
						{
							disableHolderRecyclable(op.positionStart + j);
						}
						offsetPositionRecordsForRemove(op.positionStart, op.itemCount, true);
					}
					mItemsAddedOrRemoved = true;
					break;
				case UpdateOp.UPDATE:
					if (DEBUG)
					{
						//						Log.d(TAG, "UpdateOp.UPDATE start=" + op.positionStart + " count=" + op.itemCount);
					}

					viewRangeUpdate(op.positionStart, op.itemCount);
					break;

			}
			mPendingLayoutUpdates.add(op);
			// TODO: recycle the op if no animator (also don't bother stashing
			// in pending layout updates?)
		}
		mPendingUpdates.clear();
	}

	private void disableHolderRecyclable(int position)
	{
		ViewHolder holder = findViewHolderForPosition(position, true);
		if (holder != null)
		{
			holder.setIsRecyclable(false);
		}
		else
		{
			mState.mDeletedInvisibleItemCountSincePreviousLayout++;
		}
	}

	void clearOldPositions()
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final ViewHolder holder = getChildViewHolderInt(getChildAt(i));
			if (holder != null)
			{
				holder.clearOldPosition();
			}
		}
		mRecycler.clearOldPositions();
	}

	void offsetPositionRecordsForInsert(int positionStart, int itemCount)
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final ViewHolder holder = getChildViewHolderInt(getChildAt(i));
			if (holder != null && holder.mPosition >= positionStart)
			{
				if (DEBUG)
				{
					//					Log.d(TAG, "offsetPositionRecordsForInsert attached child " + i + " holder " + holder + " now at position "
					//							+ (holder.mPosition + itemCount));
				}
				holder.offsetPosition(itemCount);
				mState.mStructureChanged = true;
				// holder.itemView.setEnabled(false);
			}
		}
		mRecycler.offsetPositionRecordsForInsert(positionStart, itemCount);
		requestLayout();
	}

	protected void offsetPositionRecordsForRemove(int positionStart, int itemCount, boolean layoutRightNow)
	{
		final int positionEnd = positionStart + itemCount;
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final ViewHolder holder = getChildViewHolderInt(getChildAt(i));
			if (holder != null)
			{
				if (holder.mPosition >= positionEnd)
				{
					if (DEBUG)
					{
						//						Log.d(TAG, "offsetPositionRecordsForRemove attached child " + i + " holder " + holder + " now at position "
						//								+ (holder.mPosition - itemCount));
					}
					holder.offsetPosition(-itemCount);
					mState.mStructureChanged = true;
					// holder.itemView.setEnabled(false);
				}
				else if (holder.mPosition >= positionStart)
				{
					if (DEBUG)
					{
						//						Log.d(TAG, "offsetPositionRecordsForRemove attached child " + i + " holder " + holder + " now REMOVED");
					}
					holder.addFlags(ViewHolder.FLAG_REMOVED);
					mState.mStructureChanged = true;
				}

			}
		}
		mRecycler.offsetPositionRecordsForRemove(positionStart, itemCount);
		if (layoutRightNow)
		{
			requestLayout();
		}
	}

	protected boolean canChangeOrder(int pos)
	{
		ViewHolder vh = findViewHolderForPosition(pos, true);
		if (vh != null)
		{
			//			QBViewHolder qbvh = (QBViewHolder) vh;
			//			return qbvh.canChangeOrder();
			return vh.canChangeOrder();
		}
		return false;
	}

	/**
	 * Rebind existing views for the given range, or create as needed.
	 *
	 * @param positionStart Adapter position to start at
	 * @param itemCount Number of views that must explicitly be rebound
	 */
	protected void viewRangeUpdate(int positionStart, int itemCount)
	{
		final int childCount = getChildCount();
		final int positionEnd = positionStart + itemCount;

		for (int i = 0; i < childCount; i++)
		{
			final ViewHolder holder = getChildViewHolderInt(getChildAt(i));
			if (holder == null)
			{
				continue;
			}
			int position = holder.mPosition;
			if (position >= positionStart && position < positionEnd)
			{
				handleViewRangeUpdate(holder, positionStart, positionEnd, position, itemCount);
				// holder.itemView.setEnabled(false);
			}
		}
		mRecycler.viewRangeUpdate(positionStart, itemCount);
	}

	protected void handleViewRangeUpdate(ViewHolder holder, int positionStart, int positionEnd, int position, int itemCount)
	{
		// Binding an attached view will request a layout if needed.
		mAdapter.bindViewHolder(holder, holder.getPosition(), true, mLayoutType, mAdapter.getCardItemViewType(holder.getPosition()));
		mItemsChanged = true;
	}

	/**
	 * Mark all known views as invalid. Used in response to a,
	 * "the whole world might have changed" data change event.
	 */
	protected void markKnownViewsInvalid()
	{
		final int childCount = getChildCountInItem();

		for (int i = 0; i < childCount; i++)
		{
			final ViewHolder holder = getChildViewHolderInt(getChildAtInItem(i));
			if (holder != null)
			{
				holder.addFlags(ViewHolder.FLAG_UPDATE | ViewHolder.FLAG_INVALID);
			}
		}
		mRecycler.markKnownViewsInvalid();
	}

	/**
	 * Schedule an updateStyle of data from the adapter to occur on the next
	 * frame.
	 * On newer platform versions this happens via the postOnAnimation mechanism
	 * and RecyclerView attempts to avoid relayouts if possible. On older
	 * platform versions the RecyclerView requests a layout the same way
	 * ListView does.
	 */
	public void postAdapterUpdate(UpdateOp op)
	{
		mPendingUpdates.add(op);
		if (mPendingUpdates.size() == 1)
		{
			setRecyclerViewTouchEnabled(false);
			if (mPostUpdatesOnAnimation && mHasFixedSize && mIsAttached)
			{
				ViewCompatTool.postOnAnimation(this, mUpdateChildViewsRunnable);
			}
			else
			{
				mAdapterUpdateDuringMeasure = true;
				requestLayout();
			}
		}
	}

	/**
	 * Retrieve the {@link ViewHolder} for the given child view.
	 *
	 * @param child Child of this RecyclerView to query for its ViewHolder
	 * @return The child view's ViewHolder
	 */
	public ViewHolder getChildViewHolder(View child)
	{
		final ViewParent parent = child.getParent();
		if (parent != null && parent != this)
		{
			throw new IllegalArgumentException("View " + child + " is not a direct child of " + this);
		}
		return getChildViewHolderInt(child);
	}

	protected static ViewHolder getChildViewHolderInt(View child)
	{
		if (child == null)
		{
			return null;
		}
		return ((LayoutParams) child.getLayoutParams()).mViewHolder;
	}

	/**
	 * Return the adapter position that the given child view corresponds to.
	 *
	 * @param child Child View to query
	 * @return Adapter position corresponding to the given view or
	 *         {@link #NO_POSITION}
	 */
	public int getChildPosition(View child)
	{
		final ViewHolder holder = getChildViewHolderInt(child);
		return holder != null ? holder.getPosition() : NO_POSITION;
	}

	/**
	 * Return the stable item id that the given child view corresponds to.
	 *
	 * @param child Child View to query
	 * @return Item id corresponding to the given view or {@link #NO_ID}
	 */
	public long getChildItemId(View child)
	{
		if (mAdapter == null || !mAdapter.hasStableIds())
		{
			return NO_ID;
		}
		final ViewHolder holder = getChildViewHolderInt(child);
		return holder != null ? holder.getItemId() : NO_ID;
	}

	/**
	 * Return the ViewHolder for the item in the given position of the data set.
	 *
	 * @param position The position of the item in the data set of the adapter
	 * @return The ViewHolder at <code>position</code>
	 */
	public ViewHolder findViewHolderForPosition(int position)
	{
		return findViewHolderForPosition(position, false);
	}

	ViewHolder findViewHolderForPosition(int position, boolean checkNewPosition)
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final ViewHolder holder = getChildViewHolderInt(getChildAt(i));
			if (holder != null)
			{
				if (checkNewPosition)
				{
					if (holder.mPosition == position)
					{
						return holder;
					}
				}
				else if (holder.getPosition() == position)
				{
					return holder;
				}
			}
		}
		return mRecycler.findViewHolderForPosition(position);
	}

	/**
	 * Return the ViewHolder for the item with the given id. The RecyclerView
	 * must use an Adapter with {@link Adapter#setHasStableIds(boolean)
	 * stableIds} to return a non-null value.
	 *
	 * @param id The id for the requested item
	 * @return The ViewHolder with the given <code>id</code>, of null if there
	 *         is no such item.
	 */
	public ViewHolder findViewHolderForItemId(long id)
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final ViewHolder holder = getChildViewHolderInt(getChildAt(i));
			if (holder != null && holder.getItemId() == id)
			{
				return holder;
			}
		}
		return mRecycler.findViewHolderForItemId(id);
	}

	/**
	 * Find the topmost view under the given point.
	 *
	 * @param x Horizontal position in pixels to search
	 * @param y Vertical position in pixels to search
	 * @return The child view under (x, y) or null if no matching child is found
	 */
	public View findChildViewUnder(float x, float y)
	{
		final int count = getChildCount();
		for (int i = count - 1; i >= 0; i--)
		{
			final View child = getChildAt(i);
			final float translationX = child.getTranslationX();
			final float translationY = child.getTranslationY();
			if (x >= child.getLeft() + translationX && x <= child.getRight() + translationX && y >= child.getTop() + translationY
					&& y <= child.getBottom() + translationY)
			{
				return child;
			}
		}
		return null;
	}

	/**
	 * Offset the bounds of all child views by <code>dy</code> pixels. Useful
	 * for implementing simple scrolling in {@link LayoutManager LayoutManagers}
	 * .
	 *
	 * @param dy Vertical pixel offset to apply to the bounds of all child
	 *            views
	 */
	public void offsetChildrenVertical(int dy)
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			getChildAt(i).offsetTopAndBottom(dy);
		}
	}

	/**
	 * Called when an item view is attached to this RecyclerView.
	 * <p/>
	 * <p>
	 * Subclasses of RecyclerView may want to perform extra bookkeeping or
	 * modifications of child views as they become attached. This will be called
	 * before a {@link LayoutManager} measures or lays out the view and is a
	 * good time to perform these changes.
	 * </p>
	 *
	 * @param child Child view that is now attached to this RecyclerView and its
	 *            associated window
	 */
	public void onChildAttachedToWindow(View child)
	{
	}

	/**
	 * Called when an item view is detached from this RecyclerView.
	 * <p/>
	 * <p>
	 * Subclasses of RecyclerView may want to perform extra bookkeeping or
	 * modifications of child views as they become detached. This will be called
	 * as a {@link LayoutManager} fully detaches the child view from the parent
	 * and its window.
	 * </p>
	 *
	 * @param child Child view that is now detached from this RecyclerView and
	 *            its
	 *            associated window
	 */
	public void onChildDetachedFromWindow(View child)
	{
	}

	/**
	 * Offset the bounds of all child views by <code>dx</code> pixels. Useful
	 * for implementing simple scrolling in {@link LayoutManager LayoutManagers}
	 * .
	 *
	 * @param dx Horizontal pixel offset to apply to the bounds of all child
	 *            views
	 */
	public void offsetChildrenHorizontal(int dx)
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			getChildAt(i).offsetLeftAndRight(dx);
		}
	}

	public Rect getItemDecorInsetsForChild(View child)
	{
		final LayoutParams lp = (LayoutParams) child.getLayoutParams();
		if (!lp.mInsetsDirty)
		{
			return lp.mDecorInsets;
		}

		final Rect insets = lp.mDecorInsets;
		insets.set(0, 0, 0, 0);
		final int decorCount = mItemDecorations.size();
		for (int i = 0; i < decorCount; i++)
		{
			mTempRect.set(0, 0, 0, 0);
			mItemDecorations.get(i).getItemOffsets(mTempRect, lp.getViewPosition(), this);
			insets.left += mTempRect.left;
			insets.top += mTempRect.top;
			insets.right += mTempRect.right;
			insets.bottom += mTempRect.bottom;
		}
		lp.mInsetsDirty = false;
		return insets;
	}


	public class ViewFlinger implements Runnable
	{
		/* private */int			mLastFlingX;
		/* private */int			mLastFlingY;
		/* private */Scroller		mScroller;
		/* private */Interpolator	mInterpolator						= sQuinticInterpolator;
		/* private */boolean		mCareSpringBackMaxDistance			= false;

		// When set to true, postOnAnimation callbacks are delayed until the run
		// method completes
		/* private */boolean		mEatRunOnAnimationRequest			= false;

		// Tracks if postAnimationCallback should be re-attached when it is done
		/* private */boolean		mReSchedulePostAnimationCallback	= false;

		public ViewFlinger()
		{
			mScroller = new Scroller(getContext());
		}

		public OnScrollFinishListener	mScrollFinishListener;
		public int						mTargetPosition	= Integer.MAX_VALUE;

		public Scroller getScroller()
		{
			return mScroller;
		}

		@Override
		public void run()
		{
			// disableRunOnAnimationRequests();
			consumePendingUpdateOperations();
			// keep a local reference so that if it is changed during
			// onAnimation method, it wont cause
			// unexpected behaviors
			final Scroller scroller = mScroller;
			final SmoothScroller smoothScroller = mLayout.mSmoothScroller;
			//Log.e("leo", "run");
			if (scroller.computeScrollOffset())
			{
				final int x = scroller.getCurrX();
				final int y = scroller.getCurrY();
				int dx = x - mLastFlingX;
				int dy = y - mLastFlingY;
				mLastFlingX = x;
				mLastFlingY = y;
				if (DEBUG)
				{
					//					Log.d("leo", "fling runnable is running,dy=" + dy + ",currVelocity=" + scroller.getCurrVelocity());
				}
				int overscrollX = 0, overscrollY = 0;
				if (mAdapter != null)
				{
					eatRequestLayout();
					if (dx != 0)
					{
						dx = computeDxDy(dx, 0, mCareSpringBackMaxDistance, scroller, false)[0];
						final int hresult = mLayout.scrollHorizontallyBy(dx, mRecycler, mState);
						overscrollX = dx - hresult;
					}
					if (dy != 0)
					{
						dy = computeDxDy(0, dy, mCareSpringBackMaxDistance, scroller, false)[1];
						//						Log.d("leo", "scrollby caused by fling");
						final int vresult = mLayout.scrollVerticallyBy(dy, mRecycler, mState);
						overscrollY = dy - vresult;
					}

					if (smoothScroller != null && !smoothScroller.isPendingInitialRun() && smoothScroller.isRunning())
					{
						smoothScroller.onAnimation(dx - overscrollX, dy - overscrollY);
					}
					resumeRequestLayout(false);
				}
				if (!mItemDecorations.isEmpty())
				{
					invalidate();
				}
				checkRefreshHeadOnFlingRun();

				if (mScrollListener != null && (x != 0 || y != 0))
				{
					mScrollListener.onScrolled(dx, dy);
				}
				invalidate();

			}
			// call this after the onAnimation is complete not to have
			// inconsistent callbacks etc.
			if (smoothScroller != null && smoothScroller.isPendingInitialRun())
			{
				smoothScroller.onAnimation(0, 0);
			}
			// enableRunOnAnimationRequests();
			//Log.e("leo", "before scroller.isFinished()");
			if (scroller.isFinished())
			{
				//Log.e("leo", "scroller.isFinished()");
				reportFinishState();
				handleRefreshHeadOnFlingRunEnd();
				setScrollState(SCROLL_STATE_IDLE);
				releaseGlows(!mScroller.isFling(), false);
				resetStopAtTitle();
				// if (needNotifyFooter)
				// {
				// needNotifyFooter = false;
				// mRecycler.notifyLastFooterAppeared();
				// }
			}
			else
			{
				postOnAnimation();
			}
		}

		/* private */void disableRunOnAnimationRequests()
		{
			mReSchedulePostAnimationCallback = false;
			mEatRunOnAnimationRequest = true;
			//			Log.d("leo", "disableRunOnAnimationRequests: eat animation request = true");
		}

		/* private */void enableRunOnAnimationRequests()
		{
			mEatRunOnAnimationRequest = false;
			if (mReSchedulePostAnimationCallback)
			{
				postOnAnimation();
			}
		}

		public void postOnAnimation()
		{
			if (mEatRunOnAnimationRequest)
			{
				//				Log.d("leo", "postOnAnimation: eat animation request");
				mReSchedulePostAnimationCallback = true;
			}
			else
			{
				ViewCompatTool.postOnAnimation(RecyclerViewBase.this, this);
			}
		}

		public void fling(int velocityX, int velocityY)
		{
			mCareSpringBackMaxDistance = true;
			setScrollState(SCROLL_STATE_SETTLING);
			mLastFlingX = mLastFlingY = 0;
			mScroller.fling(0, 0, velocityX, velocityY, Integer.MIN_VALUE, Integer.MAX_VALUE, Integer.MIN_VALUE, Integer.MAX_VALUE);
			postOnAnimation();
		}

		public void smoothScrollBy(int dx, int dy, boolean careSpringBackMaxDistance)
		{
			smoothScrollBy(dx, dy, 0, 0, careSpringBackMaxDistance);
		}

		public void smoothScrollBy(int dx, int dy, int vx, int vy, boolean careSpringBackMaxDistance)
		{
			smoothScrollBy(dx, dy, computeScrollDuration(dx, dy, vx, vy), careSpringBackMaxDistance);
		}

		/* private */float distanceInfluenceForSnapDuration(float f)
		{
			f -= 0.5f; // center the values about 0.
			f *= 0.3f * Math.PI / 2.0f;
			return (float) Math.sin(f);
		}

		/* private */int computeScrollDuration(int dx, int dy, int vx, int vy)
		{
			final int absDx = Math.abs(dx);
			final int absDy = Math.abs(dy);
			final boolean horizontal = absDx > absDy;
			final int velocity = (int) Math.sqrt(vx * vx + vy * vy);
			final int delta = (int) Math.sqrt(dx * dx + dy * dy);
			final int containerSize = horizontal ? getWidth() : getHeight();
			final int halfContainerSize = containerSize / 2;
			float distanceRatio = 1.f;
			if (containerSize != 0)
			{
				distanceRatio = Math.min(1.f, 1.f * delta / containerSize);
			}
			final float distance = halfContainerSize + halfContainerSize * distanceInfluenceForSnapDuration(distanceRatio);

			int duration;
			if (velocity > 0)
			{
				duration = 4 * Math.round(1000 * Math.abs(distance / velocity));
			}
			else
			{
				float absDelta = (float) (horizontal ? absDx : absDy);
				duration = 300;
				if (containerSize != 0)
				{
					duration = (int) (((absDelta / containerSize) + 1) * 300);
				}
			}
			return Math.min(duration, MAX_SCROLL_DURATION);
		}

		public void smoothScrollBy(int dx, int dy, int duration, boolean careSpringBackMaxDistance)
		{
			smoothScrollBy(dx, dy, duration, sQuinticInterpolator, careSpringBackMaxDistance);
		}

		public void smoothScrollBy(int dx, int dy, int duration, Interpolator interpolator, boolean careSpringBackMaxDistance)
		{
			if (mInterpolator != interpolator)
			{
				mInterpolator = interpolator;
				mScroller = new Scroller(getContext());
			}
			mCareSpringBackMaxDistance = careSpringBackMaxDistance;
			setScrollState(SCROLL_STATE_SETTLING);
			mLastFlingX = mLastFlingY = 0;
			mScroller.startScroll(0, 0, dx, dy, duration);
			postOnAnimation();
		}

		private void reportFinishState()
		{
			//			Log.d(TAG, "reportFinishState:mTargetPosition=" + mTargetPosition + ",y=" + mScroller.getCurrY());
			if (mScrollFinishListener != null)
			{
				//Log.e("leo", "reportFinishState:mTargetPosition=" + mTargetPosition + ",y=" + mScroller.getCurrY());
				if (checkShouldCallScrollFinish(mScroller, mTargetPosition))
				{
					//Log.e("leo", "onScrollFinished");
					mScrollFinishListener.onScrollFinished();
				}
				mScrollFinishListener = null;
				mTargetPosition = Integer.MAX_VALUE;
			}
		}

		public void stop()
		{
			mScroller.abortAnimation(); // 放到最前面来执行
			reportFinishState();
			removeCallbacks(this);

		}

	}

	protected void checkRefreshHeadOnFlingRun()
	{

	}

	protected void handleRefreshHeadOnFlingRunEnd()
	{

	}

	protected boolean checkShouldCallScrollFinish(Scroller scroller, int targetPosition)
	{
		return scroller.getCurrY() == targetPosition;
	}

	public View getChildAtInItem(int index)
	{
		if (index < getChildCount())
		{
			return super.getChildAt(index + mState.mHeaderCountInScreen);
		}
		return null;
	}

	public int getChildCountInItem()
	{
		return super.getChildCount() - mState.mHeaderCountInScreen - mState.mFooterCountInScreen;
	}


	/* private */class RecyclerViewDataObserver extends AdapterDataObserver
	{
		@Override
		public void onChanged()
		{

			markKnownViewsInvalid();
			removeAnimatingViews();
			mState.mDataChanged = true;
			mState.mStructureChanged = true;
			View first = mLayout.getChildClosestToStartByOrder();
			if (first != null)
			{
				int pendingPosition = mLayout.getPendingPosition();
				int pendingOffset = mLayout.getPendingOffset();
				//				Log.d(TAG, "pendingPosition=" + pendingPosition);
				if (pendingPosition == NO_POSITION)
				{
					pendingPosition = mLayout.getPosition(first);
					//					Log.d(TAG, "first position=" + pendingPosition);
					if (pendingOffset == BaseLayoutManager.INVALID_OFFSET)
					{
						pendingOffset = mLayout.getDecoratedStart(first);
						pendingOffset = mLayout.canScrollHorizontally() ?
								pendingOffset + mState.mCustomHeaderWidth : pendingOffset + mState.mCustomHeaderHeight;
					}
				}
				pendingPosition = validateAnchorItemPosition(pendingPosition);
				//				Log.d(TAG, "first position=" + pendingPosition);
				scrollToPositionWithOffset(pendingPosition, pendingOffset);
			}
			else
			{
				requestLayout();
			}

		}

		@Override
		public void onItemRangeChanged(int positionStart, int itemCount)
		{
			postAdapterUpdate(obtainUpdateOp(UpdateOp.UPDATE, positionStart, itemCount));
		}

		//		@Override
		//		public void onItemRangeChanged(int positionStart, int itemCount, Object payload)
		//		{
		//			// 暂时不处理payload，视为全量更新
		//			postAdapterUpdate(obtainUpdateOp(UpdateOp.UPDATE, positionStart, itemCount));
		//		}

		@Override
		public void onItemRangeInserted(int positionStart, int itemCount)
		{
			postAdapterUpdate(obtainUpdateOp(UpdateOp.ADD, positionStart, itemCount));
		}

		@Override
		public void onItemRangeRemoved(int positionStart, int itemCount)
		{
			postAdapterUpdate(obtainUpdateOp(UpdateOp.REMOVE, positionStart, itemCount));
		}

		@Override
		public void onItemsRemoved(ArrayList<Integer> removeItemPositions)
		{
			UpdateOp op = obtainUpdateOp(UpdateOp.REMOVE, -1, -1);
			op.mRemovePositions = removeItemPositions;
			postAdapterUpdate(op);
		}
	}

	public static class ViewHolderArrayList extends ArrayList<ViewHolder>
	{
		@Override
		public String toString()
		{
			return Arrays.toString(this.toArray());
		}
	}

	public static class RecycledViewPool
	{
		public SparseArray<ViewHolderArrayList>	mScrap				= new SparseArray<ViewHolderArrayList>();
		protected SparseIntArray				mMaxScrap			= new SparseIntArray();
		/* private */int						mAttachCount		= 0;

		/* private */public int					DEFAULT_MAX_SCRAP	= 7;

		public void clear()
		{
			mScrap.clear();
		}

		/**
		 * use @setMaxRecycledViews instead for better performance by timo
		 *
		 * @param maxScrapNum
		 */
		@Deprecated
		public void setMaxScrapNum(int maxScrapNum)
		{
			if (maxScrapNum <= DEFAULT_MAX_SCRAP)
			{
				return;
			}
			DEFAULT_MAX_SCRAP = maxScrapNum;
		}

		public String dump()
		{
			if (DEBUG)
			{
				StringBuilder sb = new StringBuilder();
				sb.append("start dump recyclerViewPool!\n");
				sb.append("mMaxScrap=" + mMaxScrap.toString() + "\n");
				sb.append(mScrap + "\n");
				return sb.toString();
			}
			else
			{
				return "";
			}

		}

		// TODO:这个地方要用起来，不同viewtype可能需要的缓存池不一样大。
		public void setMaxRecycledViews(int viewType, int max, Adapter adapter)
		{
			mMaxScrap.put(viewType, max);
			final ArrayList<ViewHolder> scrapHeap = mScrap.get(viewType);
			if (scrapHeap != null)
			{
				while (scrapHeap.size() > max)
				{
					ViewHolder vh = scrapHeap.remove(scrapHeap.size() - 1);
					if (adapter != null)
					{
						adapter.onViewAbandon(vh);
					}
				}
			}
		}

		//		public ViewHolder getRecycledView(int viewType)
		//		{
		//			if (DEBUG)
		//			{
		////				Log.d(TAG, "getRecycledViewFromRecycler-->" + "type=" + viewType);
		//			}
		//			final ArrayList<ViewHolder> scrapHeap = mScrap.get(viewType);
		//			if (scrapHeap != null && !scrapHeap.isEmpty())
		//			{
		//				final int index = scrapHeap.size() - 1;
		//				final ViewHolder scrap = scrapHeap.get(index);
		//				scrapHeap.remove(index);
		//				return scrap;
		//			}
		//			return null;
		//		}

		public ViewHolder getRecycledView(int viewType, String itemReuseKey)
		{
			if (DEBUG)
			{
				Log.d(TAG, "getRecycledViewFromRecycler-->" + "type=" + viewType);
			}
			final ArrayList<ViewHolder> scrapHeap = mScrap.get(viewType);

			if (scrapHeap != null && !scrapHeap.isEmpty())
			{
				Log.d(TAG, "getRecycledView-->" + " scrapHeap.size : " + scrapHeap.size());
				ViewHolder viewHolderReuse = scrapHeap.get(scrapHeap.size() - 1);
				if (!TextUtils.isEmpty(itemReuseKey))
				{
					for (int i = 0; i < scrapHeap.size(); i++)
					{
						ViewHolder scrapHeapItem = scrapHeap.get(i);
						//尽量能找到之前的那个viewHolder，这样这个holder的数据还是Postion对应的数据，
						//不会导致UI的问题,主要用于拉取下一批数据回来后，会重新刷UI，减少View重新bindData
						if (TextUtils.equals(itemReuseKey, scrapHeapItem.mHolderReuseKey))
						{
							viewHolderReuse = scrapHeapItem;
							Log.d(TAG, "getRecycledView-->" + "reqReuseKey: " + itemReuseKey + ",found key:" + scrapHeapItem.mHolderReuseKey);
							break;
						}
					}
				}
				viewHolderReuse.mHolderReuseKey = itemReuseKey;
				scrapHeap.remove(viewHolderReuse);
				return viewHolderReuse;
			}
			return null;
		}

		public void putRecycledView(ViewHolder scrap, Adapter adapter)
		{
			final int viewType = scrap.getItemViewType();
			final ArrayList scrapHeap = getScrapHeapForType(viewType);
			if (mMaxScrap.get(viewType) <= scrapHeap.size())
			{
				// 如果scrapHeap已经满了，就不再向里面添加，此时这个viewHolder就被废弃，需要通知出去给adapter
				if (adapter != null)
				{
					adapter.onViewAbandon(scrap);
				}
				return;
			}
			if (DEBUG)
			{
				//				Log.e(TAG, "putRecycledView...." + scrap);
			}
			scrap.mPosition = NO_POSITION;
			scrap.mOldPosition = NO_POSITION;
			scrap.mItemId = NO_ID;
			scrap.clearFlagsForSharedPool();
			scrapHeap.add(scrap);
		}

		void attach(Adapter adapter)
		{
			mAttachCount++;
		}

		void detach()
		{
			mAttachCount--;
		}

		void onAdapterChanged(Adapter oldAdapter, Adapter newAdapter)
		{
			if (mAttachCount == 1)
			{
				clear();
			}
		}

		/* private */
		public ArrayList<ViewHolder> getScrapHeapForType(int viewType)
		{
			ViewHolderArrayList scrap = mScrap.get(viewType);
			if (scrap == null)
			{
				scrap = new ViewHolderArrayList();
				mScrap.put(viewType, scrap);
				if (mMaxScrap.indexOfKey(viewType) < 0)
				{
					mMaxScrap.put(viewType, DEFAULT_MAX_SCRAP);
				}
			}
			return scrap;
		}
	}

	/**
	 * A Recycler is responsible for managing scrapped or detached item views
	 * for reuse.
	 * <p/>
	 * <p>
	 * A "scrapped" view is a view that is still attached to its parent
	 * RecyclerView but that has been marked for removal or reuse.
	 * </p>
	 * <p/>
	 * <p>
	 * Typical use of a Recycler by a {@link LayoutManager} will be to obtain
	 * views for an adapter's data set representing the data at a given position
	 * or item ID. If the view to be reused is considered "dirty" the adapter
	 * will be asked to rebind it. If not, the view can be quickly reused by the
	 * LayoutManager with no further work. Clean views that have not
	 * {@link View#isLayoutRequested() requested layout} may be
	 * repositioned by a LayoutManager without remeasurement.
	 * </p>
	 */
	public class Recycler
	{
		/* private */public final ArrayList<ViewHolder>	mAttachedScrap				= new ArrayList<ViewHolder>();

		/* private */public final ArrayList<ViewHolder>	mCachedViews				= new ArrayList<ViewHolder>();

		/* private */final List<ViewHolder>				mUnmodifiableAttachedScrap	= Collections.unmodifiableList(mAttachedScrap);

		/* private */int								mViewCacheMax				= DEFAULT_CACHE_SIZE;

		/* private */public RecycledViewPool			mRecyclerPool;

		/* private */static final int					DEFAULT_CACHE_SIZE			= 2;

		/**
		 * Clear scrap views out of this recycler. Detached views contained
		 * within a recycled view pool will remain.
		 */
		public void clear()
		{
			mAttachedScrap.clear();
			recycleCachedViews();
		}

		public String dump()
		{
			if (DEBUG)
			{
				StringBuilder sb = new StringBuilder();
				sb.append("start dump recycler!\n");
				sb.append("mAttached has size of " + mAttachedScrap.size() + "\n");
				sb.append(Arrays.toString(mAttachedScrap.toArray()) + "\n");
				sb.append("mCachedViews has size of " + mCachedViews.size() + "\n");
				for (ViewHolder vh : mCachedViews)
				{
					sb.append(vh + "\n");
				}
				sb.append(mRecyclerPool.dump());
				return sb.toString();
			}
			else
			{
				return "";
			}
		}

		/**
		 * Set the maximum number of detached, valid views we should retain for
		 * later use.
		 *
		 * @param viewCount Number of views to keep before sending views to the
		 *            shared
		 *            pool
		 */
		public void setViewCacheSize(int viewCount)
		{
			mViewCacheMax = viewCount;
			while (mCachedViews.size() > viewCount)
			{
				mCachedViews.remove(mCachedViews.size() - 1);
			}
		}

		/**
		 * Returns an unmodifiable list of ViewHolders that are currently in the
		 * scrap list.
		 *
		 * @return List of ViewHolders in the scrap list.
		 */
		public List<ViewHolder> getScrapList()
		{
			return mUnmodifiableAttachedScrap;
		}

		/**
		 * Helper method for getViewForPosition.
		 * <p/>
		 * Checks whether a given view holder can be used for the provided
		 * position.
		 *
		 * @param holder ViewHolder
		 * @param offsetPosition The position which is updated by UPDATE_OP
		 *            changes on the
		 *            adapter
		 * @return true if ViewHolder matches the provided position, false
		 *         otherwise
		 */
		boolean validateViewHolderForOffsetPosition(ViewHolder holder, int offsetPosition)
		{
			// if it is a removed holder, nothing to verify since we cannot ask
			// adapter anymore
			// if it is not removed, verify the type and id.
			if (holder.isRemoved())
			{
				return true;
			}
			if (offsetPosition < 0 || offsetPosition >= mAdapter.getItemCount())
			{
				if (DEBUG)
				{
					//					Log.d(TAG, "validateViewHolderForOffsetPosition: invalid position, returning " + "false");
				}
				return false;
			}
			final int type = mAdapter.getItemViewType(offsetPosition);
			if (type != holder.getItemViewType())
			{
				return false;
			}
			if (mAdapter.hasStableIds())
			{
				return holder.getItemId() == mAdapter.getItemId(offsetPosition);
			}
			return true;
		}

		public View getHeaderForPosition(int position)
		{
			return mAdapter.getHeaderView(position);
		}

		public View getFooterForPosition(int position)
		{
			View view = getScrapFooterView(position - 1);
			if (view != null)
			{
				return view;
			}
			return mAdapter.getFooterView(position);
		}

		public void notifyLastFooterAppeared()
		{
			if (mAdapter != null)
			{
				//				Log.d("leo", "notifyLastFooterAppeared,isReachedEnd=" + (mOffsetY + getHeight() >= getTotalHeight()));
				mAdapter.notifyLastFooterAppeared();
			}
		}

		/**
		 * get exact same suspend view for index from recycler
		 *
		 * @param position
		 * @return
		 */
		public View getSuspendViewForPosition(int position)
		{
			if (mAdapter == null)
			{
				return null;
			}
			if (DEBUG)
			{
				//				Log.e(TAG, "getViewFroPosition-->" + position + "-------------------------------------");
				// Log.d(TAG, mRecycler.dump());
			}
			ViewHolder holder = null;
			final int offsetPosition = findPositionOffset(position);
			if (mAdapter.hasCustomRecycler())
			{
				holder = mAdapter.findSuspendHolderForPosition(offsetPosition, this);
			}
			if (holder == null)
			{
				if (offsetPosition < 0 || offsetPosition >= mAdapter.getItemCount())
				{
					return null;
				}
				else
				{
					holder = mAdapter.createSuspendViewHolderWithPos(RecyclerViewBase.this, offsetPosition, mAdapter.getItemViewType(offsetPosition));
				}
			}
			if (holder != null)
			{
				if (holder.mBindNextTime || holder.mForceBind || !holder.isRemoved() && (!holder.isBound() || holder.needsUpdate()))
				{
					holder.mBindNextTime = false;
					if (DEBUG)
					{
						//						Log.d(TAG, "getViewForPosition unbound holder or needs updateStyle; updating...");
					}

					mAdapter.bindViewHolder(holder, offsetPosition, !holder.isBound(), mLayoutType, mAdapter.getCardItemViewType(offsetPosition));

				}
				ViewGroup.LayoutParams lp = holder.itemView.getLayoutParams();
				if (lp == null)
				{
					lp = generateDefaultLayoutParams();
					holder.itemView.setLayoutParams(lp);
				}
				else if (!checkLayoutParams(lp))
				{
					lp = generateLayoutParams(lp);
					holder.itemView.setLayoutParams(lp);
				}
				((LayoutParams) lp).mViewHolder = holder;
				if (DEBUG)
				{
					//					Log.e(TAG, "getViewFroPosition-->" + position + "--------------END-----------------------");
				}
				if (holder.mContentHolder != null)
				{
					dispatchViewStateChange(holder.mContentHolder.mContentView, IViewRecycleStateListener.NOTIFY_ON_USE);
				}
				return holder.itemView;
			}
			return null;
		}

		/**
		 * Obtain a view initialized for the given position.
		 * <p/>
		 * <p>
		 * This method should be used by {@link LayoutManager} implementations
		 * to obtain views to represent data from an {@link Adapter}.
		 * </p>
		 * <p/>
		 * <p>
		 * The Recycler may reuse a scrap or detached view from a shared pool if
		 * one is available for the correct view type. If the adapter has not
		 * indicated that the data at the given position has changed, the
		 * Recycler will attempt to hand back a scrap view that was previously
		 * initialized for that data without rebinding.
		 * </p>
		 *
		 * @param position Position to obtain a view for
		 * @return A view representing the data at <code>position</code> from
		 *         <code>adapter</code>
		 */
		public View getViewForPosition(int position)
		{
			if (mAdapter == null)
			{
				return null;
			}
			if (DEBUG)
			{
				//				Log.e(TAG, "getViewFroPosition-->" + position + "-------------------------------------");
				// Log.d(TAG, mRecycler.dump());
			}
			ViewHolder holder;
			final int offsetPosition = findPositionOffset(position);
			// if there is suspentionView(sticky = true), remove suspentionView first
			if (getLayoutManager() instanceof BaseLayoutManager && !isRepeatableSuspensionMode())
			{
				View currentSuspentionView = ((BaseLayoutManager) getLayoutManager()).getCurrentSuspentionView();
				if (currentSuspentionView != null && offsetPosition == ((BaseLayoutManager) getLayoutManager()).getCurrentSuspentionPosition())
				{
					// set current suspentionView recycleable here
					if (currentSuspentionView != null)
					{
						RecyclerViewBase.ViewHolder suspentionViewHolder = getChildViewHolder(currentSuspentionView);
						if (suspentionViewHolder != null)
						{
							suspentionViewHolder.setIsRecyclable(true);
						}
					}
					((BaseLayoutManager) getLayoutManager()).removeSuspentions();
				}
			}
			if (mAdapter.hasCustomRecycler())
			{
				holder = mAdapter.findBestHolderForPosition(offsetPosition, this);
			}
			else
			{
				holder = getViewHolderForPosition(offsetPosition);
			}
			if (holder == null)
			{
				if (offsetPosition < 0 || offsetPosition >= mAdapter.getItemCount())
				{
					return null;
				}
				else
				{
					// 优先走createViewHolderWithPos，如果为空走createViewHolder
					holder = mAdapter.createViewHolderWithPos(RecyclerViewBase.this, offsetPosition, mAdapter.getItemViewType(offsetPosition));
					if (holder == null)
					{
						holder = mAdapter.createViewHolder(RecyclerViewBase.this, mAdapter.getItemViewType(offsetPosition));
					}
					if (holder == null)
					{
						throw new RuntimeException("Must implement onCreateContentView or onCreateContentViewWithPos in your adapter");
					}
					holder.mHolderReuseKey = mAdapter.getViewHolderReUseKey(offsetPosition);
					if (DEBUG)
					{
						//						Log.e(TAG, "getViewForPosition created new ViewHolder!!!");
					}
				}
			}
			if (DEBUG)
			{
				//				Log.d(TAG, "binding holder pos=" + offsetPosition + ",holder.mBindNextTime=" + holder.mBindNextTime);
			}
			handleBindViewHolderInGetView(holder, offsetPosition);
			ViewGroup.LayoutParams lp = holder.itemView.getLayoutParams();
			if (lp == null)
			{
				lp = generateDefaultLayoutParams();
				holder.itemView.setLayoutParams(lp);
			}
			else if (!checkLayoutParams(lp))
			{
				lp = generateLayoutParams(lp);
				holder.itemView.setLayoutParams(lp);
			}
			((LayoutParams) lp).mViewHolder = holder;
			if (DEBUG)
			{
				//				Log.e(TAG, "getViewFroPosition-->" + position + "--------------END-----------------------");
			}
			if (holder.mContentHolder != null)
			{
				dispatchViewStateChange(holder.mContentHolder.mContentView, IViewRecycleStateListener.NOTIFY_ON_USE);
			}
			return holder.itemView;
		}

		protected void handleBindViewHolderInGetView(ViewHolder holder, int offsetPosition)
		{
			if (holder.mBindNextTime || holder.mForceBind || !holder.isRemoved() && (!holder.isBound() || holder.needsUpdate()))
			{
				holder.mBindNextTime = false;
				if (DEBUG)
				{
					//					Log.d(TAG, "getViewForPosition unbound holder or needs updateStyle; updating...");
				}
				mAdapter.bindViewHolder(holder, offsetPosition, true, mLayoutType, mAdapter.getCardItemViewType(offsetPosition));
			}
		}

		protected boolean checkShouldValidateViewHolder()
		{
			return true;
		}

		public ViewHolder getViewHolderForPosition(int offsetPosition)
		{
			ViewHolder holder = getScrapViewForPosition(offsetPosition, INVALID_TYPE);

			if (DEBUG)
			{
				// Log.d(TAG, "offsetPosition-->" + offsetPosition);
			}
			if (holder != null)
			{
				if (checkShouldValidateViewHolder() && !validateViewHolderForOffsetPosition(holder, offsetPosition))
				{
					// recycle this scrap
					removeDetachedView(holder.itemView, false);
					quickRecycleScrapView(holder.itemView);

					// if validate fails, we can query scrap again w/ type. that
					// may return a
					// different view holder from cache.
					final int type = mAdapter.getItemViewType(offsetPosition);
					if (mAdapter.hasStableIds())
					{
						final long id = mAdapter.getItemId(offsetPosition);
						holder = getScrapViewForId(id, type);
					}
					else
					{
						holder = getScrapViewForPosition(offsetPosition, type);
					}
				}
			}
			else
			{
				// try recycler.

				//				if (DEBUG)
				//				{
				//					Log.d(TAG, "getViewForPosition-->try recycler");
				//					Log.d(TAG, mRecycler.dump());
				//				}

				holder = getRecycledViewPool().getRecycledView(mAdapter.getItemViewType(offsetPosition),
						mAdapter.getViewHolderReUseKey(offsetPosition));
			}
			return holder;
		}

		/**
		 * Recycle a detached view. The specified view will be added to a pool
		 * of views for later rebinding and reuse.
		 * <p/>
		 * <p>
		 * A view must be fully detached before it may be recycled.
		 * </p>
		 *
		 * @param view Removed view for recycling
		 */
		public void recycleView(View view)
		{
			recycleViewHolder(getChildViewHolderInt(view));
		}

		void recycleCachedViews()
		{
			final int count = mCachedViews.size();
			for (int i = count - 1; i >= 0; i--)
			{
				final ViewHolder cachedView = mCachedViews.get(i);
				if (cachedView.isRecyclable())
				{
					dispatchViewRecycled(cachedView);
					getRecycledViewPool().putRecycledView(cachedView, mAdapter);
				}
				mCachedViews.remove(i);
			}
		}

		void recycleViewHolder(ViewHolder holder)
		{
			//Log.e(TAG, "start recycleViewHolder--1-->" + holder);
			if (holder == null)
			{
				return;
			}
			//			if (((QBViewHolder) holder).mViewType != QBViewHolder.TYPE_NORMAL && holder instanceof QBViewHolder)
			if (holder.mViewType != ViewHolder.TYPE_NORMAL)
			{
				return;
			}

			if (holder.isScrap() || holder.itemView.getParent() != null)
			{
				throw new IllegalArgumentException("Scrapped or attached views may not be recycled.");
			}
			//			Log.e(TAG, "start recycleViewHolder--2-->" + holder);
			boolean cached = false;
			if (!holder.isInvalid() && (mInPreLayout || !holder.isRemoved()))
			{
				// Retire oldest cached views first
				if (mCachedViews.size() == mViewCacheMax && !mCachedViews.isEmpty())
				{
					for (int i = 0; i < mCachedViews.size(); i++)
					{
						final ViewHolder cachedView = mCachedViews.get(i);
						if (cachedView.isRecyclable())
						{
							mCachedViews.remove(i);
							dispatchViewRecycled(cachedView);
							getRecycledViewPool().putRecycledView(cachedView, mAdapter);
							break;
						}
					}
				}
				if (mCachedViews.size() < mViewCacheMax)
				{
					mCachedViews.add(holder);
					cached = true;
				}
			}
			if (!cached && holder.isRecyclable())
			{
				dispatchViewRecycled(holder);
				getRecycledViewPool().putRecycledView(holder, mAdapter);
			}
			// Remove from pre/post maps that are used to animate items; a
			// recycled holder
			// should not be animated
			mState.mPreLayoutHolderMap.remove(holder);
			mState.mPostLayoutHolderMap.remove(holder);
		}

		/**
		 * Used as a fast path for unscrapping and recycling a view during a
		 * bulk operation. The caller must call {@link #clearScrap()} when it's
		 * done to updateStyle the recycler's internal bookkeeping.
		 */
		void quickRecycleScrapView(View view)
		{
			final ViewHolder holder = getChildViewHolderInt(view);
			holder.mScrapContainer = null;
			recycleViewHolder(holder);
		}

		/**
		 * Mark an attached view as scrap.
		 * <p/>
		 * <p>
		 * "Scrap" views are still attached to their parent RecyclerView but are
		 * eligible for rebinding and reuse. Requests for a view for a given
		 * position may return a reused or rebound scrap view instance.
		 * </p>
		 *
		 * @param view View to scrap
		 */
		void scrapView(View view)
		{
			final ViewHolder holder = getChildViewHolderInt(view);
			if (holder != null)
			{
				holder.setScrapContainer(this);
				mAttachedScrap.add(holder);
			}
		}

		/**
		 * Remove a previously scrapped view from the pool of eligible scrap.
		 * <p/>
		 * <p>
		 * This view will no longer be eligible for reuse until re-scrapped or
		 * until it is explicitly removed and recycled.
		 * </p>
		 */
		void unscrapView(ViewHolder holder)
		{
			mAttachedScrap.remove(holder);
			holder.mScrapContainer = null;
		}

		int getScrapCount()
		{
			return mAttachedScrap.size();
		}

		View getScrapViewAt(int index)
		{
			return mAttachedScrap.get(index).itemView;
		}

		void clearScrap()
		{
			mAttachedScrap.clear();
		}

		public View getScrapFooterView(int position)
		{
			final int scrapCount = mAttachedScrap.size();

			// Try first for an exact, non-invalid match from scrap.
			for (int i = 0; i < scrapCount; i++)
			{
				ViewHolder holder = mAttachedScrap.get(i);
				if (holder != null && holder.mPosition == position && holder.itemView instanceof IRecyclerViewFooter)
				{
					mAttachedScrap.remove(i);
					return holder.itemView;
				}
			}
			return null;

		}

		/**
		 * Returns a scrap view for the position. If type is not INVALID_TYPE,
		 * it also checks if ViewHolder's type matches the provided type.
		 *
		 * @param position Item position
		 * @param type View type
		 * @return a ViewHolder that can be re-used for this position.
		 */
		ViewHolder getScrapViewForPosition(int position, int type)
		{
			if (DEBUG)
			{
				//				Log.d(TAG, "getScrapViewForPosition-->" + position + ",type=" + type);
			}
			final int scrapCount = mAttachedScrap.size();
			// Try first for an exact, non-invalid match from scrap.
			if (DEBUG)
			{
				//				Log.d(TAG, "getScrapViewForPosition-->Try first for an exact, non-invalid match from scrap");
			}
			for (int i = 0; i < scrapCount; i++)
			{
				final ViewHolder holder = mAttachedScrap.get(i);
				if (holder.getPosition() == position && !holder.isInvalid() && (mInPreLayout || !holder.isRemoved()))
				{
					if (type != INVALID_TYPE && holder.getItemViewType() != type)
					{
						if (DEBUG)
						{
							//							Log.e(TAG, "Scrap view for position " + position + " isn't dirty but has" + " wrong view type! (found "
							//									+ holder.getItemViewType() + " but expected " + type + ")");
						}
						break;
					}
					mAttachedScrap.remove(i);
					holder.setScrapContainer(null);
					if (DEBUG)
					{
						//						Log.d(TAG, "getScrapViewForPosition(" + position + ", " + type + ") found exact match in scrap: " + holder);
					}
					return holder;
				}
			}

			if (mNumAnimatingViews != 0)
			{
				View view = getAnimatingView(position, type);
				handleAnimatingViewInGetScrapView(view);
			}
			if (DEBUG)
			{
				//				Log.d(TAG, "getScrapViewForPosition-->Search in our first-level recycled view cache.");
				// Log.d(TAG, mRecycler.dump());
			}
			// Search in our first-level recycled view cache.
			final int cacheSize = mCachedViews.size();
			for (int i = 0; i < cacheSize; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder.getPosition() == position)
				{
					mCachedViews.remove(i);
					if (holder.isInvalid() || (type != INVALID_TYPE && holder.getItemViewType() != type))
					{
						// Can't use it. We don't know where it's been.
						if (DEBUG)
						{
							//							Log.d(TAG, "getScrapViewForPosition(" + position + ", " + type
							//									+ ") found position match, but holder is invalid with type " + holder.getItemViewType());
						}
						dispatchViewRecycled(holder);
						if (holder.isRecyclable())
						{
							getRecycledViewPool().putRecycledView(holder, mAdapter);
						}
						// Even if the holder wasn't officially recycleable,
						// dispatch that it
						// was recycled anyway in case there are resources to
						// unbind.


						// Drop out of the cache search and try something else
						// instead,
						// we won't find another match here.
						break;
					}
					if (DEBUG)
					{
						//						Log.d(TAG, "getScrapViewForPosition(" + position + ", " + type + ") found match in cache: " + holder);
					}
					return holder;
				}
			}

			// Give up. Head to the shared pool.
			if (DEBUG)
			{
				//				Log.d(TAG, "getScrapViewForPosition(" + position + ", " + type + ") fetching from shared pool");
			}
			return type == INVALID_TYPE ? null : getRecycledViewPool().getRecycledView(type, mAdapter.getViewHolderReUseKey(position));
		}

		protected void handleAnimatingViewInGetScrapView(View view)
		{

		}

		ViewHolder getScrapViewForId(long id, int type)
		{
			// Look in our attached views first
			final int count = mAttachedScrap.size();
			for (int i = 0; i < count; i++)
			{
				final ViewHolder holder = mAttachedScrap.get(i);
				if (holder.getItemId() == id)
				{
					if (type == holder.getItemViewType())
					{
						mAttachedScrap.remove(i);
						holder.setScrapContainer(null);
						return holder;
					}
					else
					{
						break;
					}
				}
			}

			// Search the first-level cache
			final int cacheSize = mCachedViews.size();
			for (int i = 0; i < cacheSize; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder.getItemId() == id)
				{
					mCachedViews.remove(i);
					return holder;
				}
			}

			// That didn't work, look for an unordered view of the right type
			// instead.
			// The holder's position won't match so the calling code will need
			// to have
			// the adapter rebind it.
			return getRecycledViewPool().getRecycledView(type, null);
		}

		public void dispatchViewRecycled(ViewHolder holder)
		{
			// notify view to be recycled
			if (mAdapter != null)
			{
				mAdapter.onViewRecycled(holder);
			}
			if (DEBUG)
			{
				//				Log.d(TAG, "dispatchViewRecycled: " + holder);
			}
			dispatchViewStateChange(holder.mContentHolder.mContentView, IViewRecycleStateListener.NOTIFY_ON_RECYCLE);
		}

		private void dispatchViewStateChange(View view, int state)
		{
			if (view instanceof IViewRecycleStateListener)
			{
				switch (state)
				{
					case IViewRecycleStateListener.NOTIFY_ON_USE:
						((IViewRecycleStateListener) view).onUse();
						break;
					case IViewRecycleStateListener.NOTIFY_ON_RECYCLE:
						((IViewRecycleStateListener) view).onRecycle();
						break;
					default:
						break;
				}
			}
			if (view instanceof ViewGroup)
			{
				int childCount = ((ViewGroup) view).getChildCount();
				for (int index = 0; index < childCount; index++)
				{
					dispatchViewStateChange(((ViewGroup) view).getChildAt(index), state);
				}
			}
		}

		void onAdapterChanged(Adapter oldAdapter, Adapter newAdapter)
		{
			clear();
			getRecycledViewPool().onAdapterChanged(oldAdapter, newAdapter);
		}

		protected void offsetPositionRecordsForInsert(int insertedAt, int count)
		{
			final int cachedCount = mCachedViews.size();
			for (int i = 0; i < cachedCount; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder != null && holder.getPosition() >= insertedAt)
				{
					if (DEBUG)
					{
						//						Log.d(TAG, "offsetPositionRecordsForInsert cached " + i + " holder " + holder + " now at position "
						//								+ (holder.mPosition + count));
					}
					holder.offsetPosition(count);
				}
			}
		}

		protected void offsetPositionRecordsForRemove(int removedFrom, int count)
		{
			final int removedEnd = removedFrom + count;
			final int cachedCount = mCachedViews.size();
			for (int i = cachedCount - 1; i >= 0; i--)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder != null)
				{
					if (holder.getPosition() >= removedEnd)
					{
						if (DEBUG)
						{
							//							Log.d(TAG, "offsetPositionRecordsForRemove cached " + i + " holder " + holder + " now at position "
							//									+ (holder.mPosition - count));
						}
						holder.offsetPosition(-count);
					}
					else if (holder.getPosition() >= removedFrom)
					{
						// Item for this view was removed. Dump it from the
						// cache.
						if (DEBUG)
						{
							//							Log.d(TAG, "offsetPositionRecordsForRemove cached " + i + " holder " + holder + " now placed in pool");
						}
						mCachedViews.remove(i);
						dispatchViewRecycled(holder);
						getRecycledViewPool().putRecycledView(holder, mAdapter);
					}
				}
			}
		}

		void setRecycledViewPool(RecycledViewPool pool)
		{
			if (mRecyclerPool != null)
			{
				mRecyclerPool.detach();
			}
			mRecyclerPool = pool;
			if (pool != null)
			{
				mRecyclerPool.attach(getAdapter());
			}
		}

		public RecycledViewPool getRecycledViewPool()
		{
			if (mRecyclerPool == null)
			{
				mRecyclerPool = new RecycledViewPool();
			}
			return mRecyclerPool;
		}

		ViewHolder findViewHolderForPosition(int position)
		{
			final int cachedCount = mCachedViews.size();
			for (int i = 0; i < cachedCount; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder != null && holder.getPosition() == position)
				{
					mCachedViews.remove(i);
					return holder;
				}
			}
			return null;
		}

		ViewHolder findViewHolderForItemId(long id)
		{
			if (!mAdapter.hasStableIds())
			{
				return null;
			}

			final int cachedCount = mCachedViews.size();
			for (int i = 0; i < cachedCount; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder != null && holder.getItemId() == id)
				{
					mCachedViews.remove(i);
					return holder;
				}
			}
			return null;
		}

		void viewRangeUpdate(int positionStart, int itemCount)
		{
			final int positionEnd = positionStart + itemCount;
			final int cachedCount = mCachedViews.size();
			for (int i = 0; i < cachedCount; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder == null)
				{
					continue;
				}

				final int pos = holder.getPosition();
				if (pos >= positionStart && pos < positionEnd)
				{
					holder.addFlags(ViewHolder.FLAG_UPDATE);
				}
			}
		}

		void markKnownViewsInvalid()
		{
			final int cachedCount = mCachedViews.size();
			for (int i = 0; i < cachedCount; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				if (holder != null)
				{
					holder.addFlags(ViewHolder.FLAG_UPDATE | ViewHolder.FLAG_INVALID);
				}
			}
			recycleCachedViews();
		}

		void clearOldPositions()
		{
			final int cachedCount = mCachedViews.size();
			for (int i = 0; i < cachedCount; i++)
			{
				final ViewHolder holder = mCachedViews.get(i);
				holder.clearOldPosition();
			}
		}

		/**
		 * harryguo: 当@param index这个位置的条目被删除后，更新缓存中的holder信息
		 */
		public void updateHolderPositionWhenDelete(int index)
		{
			// list里，删掉某个条目后，它后面的条目的位置都要减1（所以要遍历所有缓存中的holder）
			if (index >= 0)
			{
				// 1. mCachedViews缓存
				final int cacheSize = mCachedViews.size();
				for (int i = 0; i < cacheSize; i++)
				{
					final RecyclerViewBase.ViewHolder holder = mCachedViews.get(i);
					if (holder.mPosition > index)
						holder.mPosition--;
				}

				// 2. mAttachedScrap缓存
				final int scrapCount = mAttachedScrap.size();
				// Try first for an exact, non-invalid match from scrap.
				for (int i = 0; i < scrapCount; i++)
				{
					final RecyclerViewBase.ViewHolder holder = mAttachedScrap.get(i);
					if (holder.mPosition > index)
						holder.mPosition--;
				}

				// 3. mScrap缓存
				int viewType = getAdapter().getItemViewType(index);
				final ArrayList<RecyclerViewBase.ViewHolder> scrapHeap = getRecycledViewPool().mScrap.get(viewType);
				if (scrapHeap != null && !scrapHeap.isEmpty())
				{
					// traverse all scrap
					for (RecyclerViewBase.ViewHolder holder : scrapHeap)
					{
						if (holder.getItemViewType() == viewType)
						{
							if (holder.mPosition > index)
								holder.mPosition--;
						}
					}
				}
			}
		}
	}

	public static abstract class Adapter<VH extends ViewHolder>
	{
		public static final int						LOCATION_LEFT			= 0;
		public static final int						LOCATION_TOP			= 1;
		public static final int						LOCATION_RIGHT			= 2;
		public static final int						LOCATION_BOTTOM			= 3;
		protected boolean							mDataChanged			= true;
		/* private */final AdapterDataObservable	mObservable				= new AdapterDataObservable();
		/* private */boolean						mHasStableIds			= false;
		protected boolean							mSuspentionDataChanged	= false;


		public abstract VH onCreateViewHolder(RecyclerViewBase parent, int viewType);

		public VH onCreateViewHolderWithPos(RecyclerViewBase parent, int position, int viewType)
		{
			return null;
		}

		public VH onCreateSuspendViewHolderWithPos(RecyclerViewBase parent, int position, int viewType)
		{
			return null;
		}

		public abstract void onBindViewHolder(VH holder, int position, int layoutType, int cardType);

		public final VH createViewHolder(RecyclerViewBase parent, int viewType)
		{
			final VH holder = onCreateViewHolder(parent, viewType);
			if (holder == null)
				return null;
			holder.mItemViewType = viewType;
			return holder;
		}

		public final VH createViewHolderWithPos(RecyclerViewBase parent, int position, int viewType)
		{
			final VH holder = onCreateViewHolderWithPos(parent, position, viewType);
			if (holder == null)
				return null;
			holder.mItemViewType = viewType;
			return holder;
		}

		public final VH createSuspendViewHolderWithPos(RecyclerViewBase parent, int position, int viewType)
		{
			final VH holder = onCreateSuspendViewHolderWithPos(parent, position, viewType);
			if (holder == null)
				return null;
			holder.mItemViewType = viewType;
			return holder;
		}

		protected void onViewAttached()
		{

		}

		protected void onViewDetached()
		{

		}

		// 当viewHolder被废弃时
		protected void onViewAbandon(VH viewHolder)
		{

		}

		public boolean doDeleteItem()
		{
			return true;
		}

		public void dataChanged()
		{
			mDataChanged = true;
			mSuspentionDataChanged = true;
		}

		public void onSuddenStop()
		{

		}

		// 提前多少像素进行预加载
		public int getPreloadThresholdInPixels()
		{
			return 0;
		}

		// 提前多少item进行预加载
		public int getPreloadThresholdInItemNumber()
		{
			return 0;
		}

		public int calcPreloadThresholdWithItemNumber()
		{
			return 0;
		}

		public abstract int getHeightBefore(int pos);


		public void onPreload()
		{
			//			Log.d(TAG, "onPreload:" + ",currY=" + mParentRecyclerView.mOffsetY + ",threshold=" + getPreloadThresholdInPixels() + ",total="
			//					+ getTotalHeight() + ",height=" + mParentRecyclerView.getHeight());
		}

		public void startRefreshData()
		{

		}

		public void onItemDeleted(int pos)
		{

		}

		public boolean headerMayChange()
		{
			return false;
		}

		public final void bindViewHolder(VH holder, int position, boolean doBind, int layoutType, int cardType)
		{
			holder.mPosition = position;
			if (hasStableIds())
			{
				holder.mItemId = getItemId(position);
			}
			if (doBind)
			{
				if (DEBUG)
				{
					//					Log.e(TAG, "getViewForPosition dobind-->" + position);
				}
				onBindViewHolder(holder, position, layoutType, cardType);
			}
			holder.setFlags(ViewHolder.FLAG_BOUND, ViewHolder.FLAG_BOUND | ViewHolder.FLAG_UPDATE | ViewHolder.FLAG_INVALID);
		}

		public boolean notifyOrderChanged(int fromPosition, int toPosition)
		{
			return true;
		}

		/**
		 * Return the view type of the item at <code>position</code> for the
		 * purposes of view recycling.
		 * <p/>
		 * <p/>
		 * The default implementation of this method returns 0, making the
		 * assumption of a single view type for the adapter. Unlike ListView
		 * adapters, types need not be contiguous. Consider using id resources
		 * to uniquely identify item view types.
		 *
		 * @param position position to query
		 * @return integer value identifying the type of the view needed to
		 *         represent the item at <code>position</code>. Type codes need
		 *         not be contiguous.
		 */
		public int getItemViewType(int position)
		{
			return 0;
		}

		public int getCardItemViewType(int position)
		{
			return 0;
		}

		public void setHasStableIds(boolean hasStableIds)
		{
			if (hasObservers())
			{
				throw new IllegalStateException("Cannot change whether this adapter has " + "stable IDs while the adapter has registered observers.");
			}
			mHasStableIds = hasStableIds;
		}

		public void reset()
		{

		}

		/**
		 * Return the stable ID for the item at <code>position</code>. If
		 * {@link #hasStableIds()} would return false this method should return
		 * {@link #NO_ID}. The default implementation of this method returns
		 * {@link #NO_ID}.
		 *
		 * @param position Adapter position to query
		 * @return the stable ID of the item at position
		 */
		public long getItemId(int position)
		{
			return NO_ID;
		}

		public abstract int getItemCount();

		public int getMarginCloseToParentH(int location, int position)
		{
			return 0;
		}

		public int getMarginCloseToParentV(int location, int position)
		{
			return 0;
		}

		public int getMarginBetweenItem(int location, int position)
		{
			return 0;
		}

		public abstract int getItemHeight(int position);

		//		public QBRecyclerView mParentRecyclerView;

		public abstract int getItemMaigin(int location, int position);

		public abstract int getTotalHeight();

		public int getListTotalHeight()
		{
			int height = 0;
			if (getHeaderViewCount() > 0)
			{
				int headerCount = getHeaderViewCount();
				for (int i = 1; i <= headerCount; i++)
				{
					height += getHeaderViewHeight(i);
				}
			}
			//			Log.e("leo", "getListTotalHeight getHeader " + height);
			if (getFooterViewCount() > 0)
			{
				int footerCount = getFooterViewCount();
				for (int i = 1; i <= footerCount; i++)
				{
					height += getFooterViewHeight(i);
				}
			}
			//			Log.e("leo", "getListTotalHeight getHeader + getFooter " + height + ", " + this.toString());
			return getTotalHeight() + height;
		}

		public abstract int getCustomHeaderViewHeight();

		public abstract int getCustomFooterViewHeight();

		public abstract int getCustomHeaderViewWidth();

		public abstract int getCustomFooterViewWidth();

		public abstract int getHeaderViewHeight(int position);

		public abstract int getHeaderViewCount();

		public abstract View getHeaderView(int position);

		public abstract int getFooterViewHeight(int position);

		public abstract boolean getFooterViewInBottomMode();

		public abstract int getFooterViewCount();

		public abstract View getFooterView(int position);

		public abstract int[] getBeginPositionWithOffset(int targetOffset);

		public int getDefaultFooterHeight()
		{
			return 0;
		}

		public void onItemsFill(int offset)
		{

		}

		public void notifyLastFooterAppeared()
		{
		}

		public void notifyEndReached()
		{
		}

		/**
		 * Returns true if this adapter publishes a unique <code>long</code>
		 * value that can act as a key for the item at a given position in the
		 * data set. If that item is relocated in the data set, the ID returned
		 * for that item should be the same.
		 *
		 * @return true if this adapter's items have stable IDs
		 */
		public final boolean hasStableIds()
		{
			return mHasStableIds;
		}

		protected void onViewRecycled(VH holder)
		{
		}

		public void onViewAttachedToWindow(VH holder)
		{
		}

		/**
		 * Called when a view created by this adapter has been detached from its
		 * window.
		 * <p/>
		 * <p>
		 * Becoming detached from the window is not necessarily a permanent
		 * condition; the consumer of an Adapter's views may choose to cache
		 * views offscreen while they are not visible, attaching an detaching
		 * them as appropriate.
		 * </p>
		 *
		 * @param holder Holder of the view being detached
		 */
		public void onViewDetachedFromWindow(VH holder)
		{
			// mParentRecyclerView.notifyChildDetached(holder);
		}

		/**
		 * Returns true if one or more observers are attached to this adapter.
		 *
		 * @return true if this adapter has observers
		 */
		public final boolean hasObservers()
		{
			return mObservable.hasObservers();
		}

		/**
		 * Register a new observer to listen for data changes.
		 * <p/>
		 * <p>
		 * The adapter may publish a variety of events describing specific
		 * changes. Not all adapters may support all change types and some may
		 * fall back to a generic {@link AdapterDataObserver#onChanged()
		 * "something changed"} event if more specific data is not available.
		 * </p>
		 * <p/>
		 * <p>
		 * Components registering observers with an adapter are responsible for
		 * {@link #unregisterAdapterDataObserver(AdapterDataObserver)
		 * unregistering} those observers when finished.
		 * </p>
		 *
		 * @param observer Observer to register
		 * @see #unregisterAdapterDataObserver(AdapterDataObserver)
		 */
		public void registerAdapterDataObserver(AdapterDataObserver observer)
		{
			mObservable.registerObserver(observer);
		}

		/**
		 * Unregister an observer currently listening for data changes.
		 * <p/>
		 * <p>
		 * The unregistered observer will no longer receive events about changes
		 * to the adapter.
		 * </p>
		 *
		 * @param observer Observer to unregister
		 * @see #registerAdapterDataObserver(AdapterDataObserver)
		 */
		public void unregisterAdapterDataObserver(AdapterDataObserver observer)
		{
			mObservable.unregisterObserver(observer);
		}

		/**
		 * Notify any registered observers that the data set has changed.
		 * <p/>
		 * <p>
		 * There are two different classes of data change events, item changes
		 * and structural changes. Item changes are when a single item has its
		 * data updated but no positional changes have occurred. Structural
		 * changes are when items are inserted, removed or moved within the data
		 * set.
		 * </p>
		 * <p/>
		 * <p>
		 * This event does not specify what about the data set has changed,
		 * forcing any observers to assume that all existing items and structure
		 * may no longer be valid. LayoutManagers will be forced to fully rebind
		 * and relayout all visible views.
		 * </p>
		 * <p/>
		 * <p>
		 * <code>RecyclerView</code> will attempt to synthesize visible
		 * structural change events for adapters that report that they have
		 * {@link #hasStableIds() stable IDs} when this method is used. This can
		 * help for the purposes of animation and visual object persistence but
		 * individual item views will still need to be rebound and relaid out.
		 * </p>
		 * <p/>
		 * <p>
		 * If you are writing an adapter it will always be more efficient to use
		 * the more specific change events if you can. Rely on
		 * <code>notifyDataSetChanged()</code> as a last resort.
		 * </p>
		 *
		 * @see #notifyItemChanged(int)
		 * @see #notifyItemInserted(int)
		 * @see #notifyItemRemoved(int)
		 * @see #notifyItemRangeChanged(int, int)
		 * @see #notifyItemRangeInserted(int, int)
		 * @see #notifyItemRangeRemoved(int, int)
		 */
		public void notifyDataSetChanged()
		{
			//			Log.d("ForwardingDrawable", "notifyDatasetChanged!");
			mObservable.notifyChanged();
		}

		/**
		 * Notify any registered observers that the item at
		 * <code>position</code> has changed.
		 * <p/>
		 * <p>
		 * This is an item change event, not a structural change event. It
		 * indicates that any reflection of the data at <code>position</code> is
		 * out of date and should be updated. The item at <code>position</code>
		 * retains the same identity.
		 * </p>
		 *
		 * @param position Position of the item that has changed
		 * @see #notifyItemRangeChanged(int, int)
		 */
		public void notifyItemChanged(int position)
		{
			mObservable.notifyItemRangeChanged(position, 1);
		}

		/**
		 * Notify any registered observers that the <code>itemCount</code> items
		 * starting at position <code>positionStart</code> have changed.
		 * <p/>
		 * <p>
		 * This is an item change event, not a structural change event. It
		 * indicates that any reflection of the data in the given position range
		 * is out of date and should be updated. The items in the given range
		 * retain the same identity.
		 * </p>
		 *
		 * @param positionStart Position of the first item that has changed
		 * @param itemCount Number of items that have changed
		 * @see #notifyItemChanged(int)
		 */
		public void notifyItemRangeChanged(int positionStart, int itemCount)
		{
			mObservable.notifyItemRangeChanged(positionStart, itemCount);
		}

		//		/**
		//		 * Notify any registered observers that the <code>itemCount</code> items starting at
		//		 * position <code>positionStart</code> have changed. An optional payload can be
		//		 * passed to each changed item.
		//		 *
		//		 * <p>This is an item change event, not a structural change event. It indicates that any
		//		 * reflection of the data in the given position range is out of date and should be updated.
		//		 * The items in the given range retain the same identity.
		//		 * </p>
		//		 *
		//		 * <p>
		//		 * Client can optionally pass a payload for partial change. These payloads will be merged
		//		 * and may be passed to adapter's {@link #onBindViewHolder(ViewHolder, int, List)} if the
		//		 * item is already represented by a ViewHolder and it will be rebound to the same
		//		 * ViewHolder. A notifyItemRangeChanged() with null payload will clear all existing
		//		 * payloads on that item and prevent future payload until
		//		 * {@link #onBindViewHolder(ViewHolder, int, List)} is called. Adapter should not assume
		//		 * that the payload will always be passed to onBindViewHolder(), e.g. when the view is not
		//		 * attached, the payload will be simply dropped.
		//		 *
		//		 * @param positionStart Position of the first item that has changed
		//		 * @param itemCount Number of items that have changed
		//		 * @param payload  Optional parameter, use null to identify a "full" updateStyle
		//		 *
		//		 * @see #notifyItemChanged(int)
		//		 */
		//		public void notifyItemRangeChanged(int positionStart, int itemCount, Object payload) {
		//			mObservable.notifyItemRangeChanged(positionStart, itemCount, payload);
		//		}

		/**
		 * Notify any registered observers that the item reflected at
		 * <code>position</code> has been newly inserted. The item previously at
		 * <code>position</code> is now at position <code>position + 1</code>.
		 * <p/>
		 * <p>
		 * This is a structural change event. Representations of other existing
		 * items in the data set are still considered up to date and will not be
		 * rebound, though their positions may be altered.
		 * </p>
		 *
		 * @param position Position of the newly inserted item in the data set
		 * @see #notifyItemRangeInserted(int, int)
		 */
		public void notifyItemInserted(int position)
		{
			mObservable.notifyItemRangeInserted(position, 1);
		}

		/**
		 * Notify any registered observers that the currently reflected
		 * <code>itemCount</code> items starting at <code>positionStart</code>
		 * have been newly inserted. The items previously located at
		 * <code>positionStart</code> and beyond can now be found starting at
		 * position <code>positionStart + itemCount</code>.
		 * <p/>
		 * <p>
		 * This is a structural change event. Representations of other existing
		 * items in the data set are still considered up to date and will not be
		 * rebound, though their positions may be altered.
		 * </p>
		 *
		 * @param positionStart Position of the first item that was inserted
		 * @param itemCount Number of items inserted
		 * @see #notifyItemInserted(int)
		 */
		public void notifyItemRangeInserted(int positionStart, int itemCount)
		{
			mObservable.notifyItemRangeInserted(positionStart, itemCount);
		}

		/**
		 * Notify any registered observers that the item previously located at
		 * <code>position</code> has been removed from the data set. The items
		 * previously located at and after <code>position</code> may now be
		 * found at <code>oldPosition - 1</code>.
		 * <p/>
		 * <p>
		 * This is a structural change event. Representations of other existing
		 * items in the data set are still considered up to date and will not be
		 * rebound, though their positions may be altered.
		 * </p>
		 *
		 * @param position Position of the item that has now been removed
		 * @see #notifyItemRangeRemoved(int, int)
		 */
		public void notifyItemRemoved(int position)
		{
			mObservable.notifyItemRangeRemoved(position, 1);
		}

		/**
		 * Notify any registered observers that the <code>itemCount</code> items
		 * previously located at <code>positionStart</code> have been removed
		 * from the data set. The items previously located at and after
		 * <code>positionStart + itemCount</code> may now be found at
		 * <code>oldPosition - itemCount</code>.
		 * <p/>
		 * <p>
		 * This is a structural change event. Representations of other existing
		 * items in the data set are still considered up to date and will not be
		 * rebound, though their positions may be altered.
		 * </p>
		 *
		 * @param positionStart Previous position of the first item that was
		 *            removed
		 * @param itemCount Number of items removed from the data set
		 */
		public void notifyItemRangeRemoved(int positionStart, int itemCount)
		{
			mObservable.notifyItemRangeRemoved(positionStart, itemCount);
		}

		public void notifyItemsRemoved(ArrayList<Integer> positions)
		{
			mObservable.notifyItemsRemoved(positions);
		}


		public boolean isDividerItem(int mCurrentPosition)
		{
			return false;
		}

		public int findPrevSuspentedPos(int pos)
		{
			// TODO Auto-generated method stub
			return -1;
		}

		public boolean isSuspentedItem(int pos)
		{
			// TODO Auto-generated method stub
			return false;
		}

		public int findNextSuspentedPos(int pos)
		{
			// TODO Auto-generated method stub
			return -1;
		}

		public boolean hasCustomRecycler()
		{
			return false;
		}

		public ViewHolder findBestHolderForPosition(int offsetPosition, Recycler recycler)
		{
			return null;
		}

		public ViewHolder findSuspendHolderForPosition(int offsetPosition, Recycler recycler)
		{
			return null;
		}

		public String getViewHolderReUseKey(int position)
		{
			return null;
		}
	}

	/**
	 * A <code>LayoutManager</code> is responsible for measuring and positioning
	 * item views within a <code>RecyclerView</code> as well as determining the
	 * policy for when to recycle item views that are no longer visible to the
	 * user. By changing the <code>LayoutManager</code> a
	 * <code>RecyclerView</code> can be used to implement a standard vertically
	 * scrolling list, a uniform grid, staggered grids, horizontally scrolling
	 * collections and more. Several stock layout managers are provided for
	 * general use.
	 */
	public static abstract class LayoutManager
	{
		public RecyclerViewBase	mRecyclerView;
		public SmoothScroller	mSmoothScroller;
		public boolean			mPreventFixGap					= false;
		public static final int	INVALID_OFFSET					= Integer.MIN_VALUE;
		/**
		 * When LayoutManager needs to scroll to a position, it sets this
		 * variable
		 * and requests a layout which will check this variable and re-layout
		 * accordingly.
		 */
		public int				mPendingScrollPosition			= RecyclerViewBase.NO_POSITION;

		/**
		 * Used to keep the offset value when
		 * {@link #scrollToPositionWithOffset(int, int)} is called.
		 */
		protected int			mPendingScrollPositionOffset	= INVALID_OFFSET;

		/**
		 * Calls {@code RecyclerView#requestLayout} on the underlying
		 * RecyclerView
		 */
		public void requestLayout()
		{
			if (mRecyclerView != null)
			{
				mRecyclerView.requestLayout();
			}
		}

		public void scrollToPositionWidthGravity(int position, int gravity, int itemHeight)
		{

		}

		public View getChildClosestToStartInScreen()
		{
			return null;
		}

		public View getChildClosestToEndInScreen()
		{
			return null;
		}

		public int getDecoratedStart(View child)
		{
			return 0;
		}

		public int getDecoratedEnd(View child)
		{
			return 0;
		}

		public View getChildClosestToEndByOrder()
		{
			return null;
		}

		public View getChildClosestToStartByOrder()
		{
			return null;
		}

		public boolean supportsPredictiveItemAnimations()
		{
			return false;
		}

		/**
		 * Called when this LayoutManager is both attached to a RecyclerView and
		 * that RecyclerView is attached to a window.
		 * <p/>
		 * <p>
		 * Subclass implementations should always call through to the superclass
		 * implementation.
		 * </p>
		 *
		 * @param view The RecyclerView this LayoutManager is bound to
		 */
		public void onAttachedToWindow(RecyclerViewBase view)
		{
		}

		/**
		 * Called when this LayoutManager is detached from its parent
		 * RecyclerView or when its parent RecyclerView is detached from its
		 * window.
		 * <p/>
		 * <p>
		 * Subclass implementations should always call through to the superclass
		 * implementation.
		 * </p>
		 *
		 * @param view The RecyclerView this LayoutManager is bound to
		 */
		public void onDetachedFromWindow(RecyclerViewBase view)
		{
		}

		public void onLayoutChildren(Recycler recycler, State state)
		{
			//			Log.e(TAG, "You must override onLayoutChildren(Recycler recycler, State state) ");
		}

		public abstract LayoutParams generateDefaultLayoutParams();

		/**
		 * Determines the validity of the supplied LayoutParams object.
		 * <p/>
		 * <p>
		 * This should check to make sure that the object is of the correct type
		 * and all values are within acceptable ranges. The default
		 * implementation returns <code>true</code> for non-null params.
		 * </p>
		 *
		 * @param lp LayoutParams object to check
		 * @return true if this LayoutParams object is valid, false otherwise
		 */
		public boolean checkLayoutParams(LayoutParams lp)
		{
			return lp != null;
		}

		public View getFirstItemAfterOffset(int offset)
		{
			final int count = getChildCount();
			for (int i = 0; i < count; i++)
			{
				View v = getChildAt(i);
				if (getDecoratedStart(v) > offset)
				{
					return v;
				}
			}
			return null;
		}

		/**
		 * Create a LayoutParams object suitable for this LayoutManager, copying
		 * relevant values from the supplied LayoutParams object if possible.
		 * <p/>
		 * <p>
		 * <em>Important:</em> if you use your own custom
		 * <code>LayoutParams</code> type you must also override
		 * {@link #checkLayoutParams(LayoutParams)},
		 * {@link #generateLayoutParams(ViewGroup.LayoutParams)}
		 * and
		 * {@link #generateLayoutParams(Context, AttributeSet)}
		 * .
		 * </p>
		 *
		 * @param lp Source LayoutParams object to copy values from
		 * @return a new LayoutParams object
		 */
		public LayoutParams generateLayoutParams(ViewGroup.LayoutParams lp)
		{
			if (lp instanceof LayoutParams)
			{
				return new LayoutParams((LayoutParams) lp);
			}
			else if (lp instanceof MarginLayoutParams)
			{
				return new LayoutParams((MarginLayoutParams) lp);
			}
			else
			{
				return new LayoutParams(lp);
			}
		}

		/**
		 * Create a LayoutParams object suitable for this LayoutManager from an
		 * inflated layout resource.
		 * <p/>
		 * <p>
		 * <em>Important:</em> if you use your own custom
		 * <code>LayoutParams</code> type you must also override
		 * {@link #checkLayoutParams(LayoutParams)},
		 * {@link #generateLayoutParams(ViewGroup.LayoutParams)}
		 * and
		 * {@link #generateLayoutParams(Context, AttributeSet)}
		 * .
		 * </p>
		 *
		 * @param c Context for obtaining styled attributes
		 * @param attrs AttributeSet describing the supplied arguments
		 * @return a new LayoutParams object
		 */
		public LayoutParams generateLayoutParams(Context c, AttributeSet attrs)
		{
			return new LayoutParams(c, attrs);
		}

		/**
		 * Scroll horizontally by dx pixels in screen coordinates and return the
		 * distance traveled. The default implementation does nothing and
		 * returns 0.
		 *
		 * @param dx distance to scroll by in pixels. X increases as scroll
		 *            position approaches the right.
		 * @param recycler Recycler to use for fetching potentially cached views
		 *            for
		 *            a position
		 * @param state Transient state of RecyclerView
		 * @return The actual distance scrolled. The return value will be
		 *         negative if dx was negative and scrolling proceeeded in that
		 *         direction. <code>Math.abs(result)</code> may be less than dx
		 *         if a boundary was reached.
		 */
		public int scrollHorizontallyBy(int dx, Recycler recycler, State state)
		{
			return 0;
		}

		/**
		 * Scroll vertically by dy pixels in screen coordinates and return the
		 * distance traveled. The default implementation does nothing and
		 * returns 0.
		 *
		 * @param dy distance to scroll in pixels. Y increases as scroll
		 *            position approaches the bottom.
		 * @param recycler Recycler to use for fetching potentially cached views
		 *            for
		 *            a position
		 * @param state Transient state of RecyclerView
		 * @return The actual distance scrolled. The return value will be
		 *         negative if dy was negative and scrolling proceeeded in that
		 *         direction. <code>Math.abs(result)</code> may be less than dy
		 *         if a boundary was reached.
		 */
		public int scrollVerticallyBy(int dy, Recycler recycler, State state)
		{
			return 0;
		}

		/**
		 * Query if horizontal scrolling is currently supported. The default
		 * implementation returns false.
		 *
		 * @return True if this LayoutManager can scroll the current contents
		 *         horizontally
		 */
		public boolean canScrollHorizontally()
		{
			return false;
		}

		/**
		 * Query if vertical scrolling is currently supported. The default
		 * implementation returns false.
		 *
		 * @return True if this LayoutManager can scroll the current contents
		 *         vertically
		 */
		public boolean canScrollVertically()
		{
			return false;
		}

		/**
		 * Scroll to the specified adapter position.
		 * <p/>
		 * Actual position of the item on the screen depends on the
		 * LayoutManager implementation.
		 *
		 * @param position Scroll to this adapter position.
		 */
		public void scrollToPosition(int position)
		{
			if (DEBUG)
			{
				//				Log.e(TAG, "You MUST implement scrollToPosition. It will soon become abstract");
			}
		}

		public int getPendingOffset()
		{
			return 0;
		}

		public int getPendingPosition()
		{
			return 0;
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
		 * @param position Index (starting at 0) of the reference item.
		 * @param offset The distance (in pixels) between the start edge of the
		 *            item view and start edge of the RecyclerView.
		 * @see #scrollToPosition(int)
		 */
		public abstract void scrollToPositionWithOffset(int position, int offset);

		/**
		 * <p>
		 * Smooth scroll to the specified adapter position.
		 * </p>
		 * <p>
		 * To support smooth scrolling, override this method, create your
		 * {@link SmoothScroller} instance and call
		 * {@link #startSmoothScroll(SmoothScroller)}.
		 * </p>
		 *
		 * @param recyclerView The RecyclerView to which this layout manager is
		 *            attached
		 * @param state Current State of RecyclerView
		 * @param position Scroll to this adapter position.
		 */
		public void smoothScrollToPosition(RecyclerViewBase recyclerView, State state, int position)
		{
			// Log.e(TAG,
			// "You must override smoothScrollToPosition to support smooth scrolling");
		}

		/**
		 * <p>
		 * Starts a smooth scroll using the provided SmoothScroller.
		 * </p>
		 * <p>
		 * Calling this method will cancel any previous smooth scroll request.
		 * </p>
		 *
		 * @param smoothScroller Unstance which defines how smooth scroll should
		 *            be
		 *            animated
		 */
		public void startSmoothScroll(SmoothScroller smoothScroller)
		{
			if (mSmoothScroller != null && smoothScroller != mSmoothScroller && mSmoothScroller.isRunning())
			{
				mSmoothScroller.stop();
			}
			mSmoothScroller = smoothScroller;
			mSmoothScroller.start(mRecyclerView, this);
		}

		/**
		 * @return true if RecycylerView is currently in the state of smooth
		 *         scrolling.
		 */
		public boolean isSmoothScrolling()
		{
			return mSmoothScroller != null && mSmoothScroller.isRunning();
		}

		/**
		 * Add a view to the currently attached RecyclerView if needed.
		 * LayoutManagers should use this method to add views obtained from a
		 * {@link Recycler} using {@link Recycler#getViewForPosition(int)}.
		 *
		 * @param child View to add
		 * @param index Index to add child at
		 */
		public void addView(View child, int index)
		{
			if (mRecyclerView == null)
			{
				return;
			}
			if (mRecyclerView.mAnimatingViewIndex >= 0)
			{
				if (index > mRecyclerView.mAnimatingViewIndex)
				{
					throw new IndexOutOfBoundsException("index=" + index + " count=" + mRecyclerView.mAnimatingViewIndex);
				}
				mRecyclerView.mAnimatingViewIndex++;
			}
			final ViewHolder holder = getChildViewHolderInt(child);
			if (holder.isScrap())
			{
				holder.unScrap();
				mRecyclerView.attachViewToParent(child, index, child.getLayoutParams());
				if (DISPATCH_TEMP_DETACH)
				{
					// ViewCompat.dispatchFinishTemporaryDetach(child);
				}
			}
			else
			{
				mRecyclerView.addView(child, index);
				final LayoutParams lp = (LayoutParams) child.getLayoutParams();
				lp.mInsetsDirty = true;
				final Adapter adapter = mRecyclerView.getAdapter();
				if (adapter != null)
				{
					adapter.onViewAttachedToWindow(getChildViewHolderInt(child));
				}
				mRecyclerView.onChildAttachedToWindow(child);
				if (mSmoothScroller != null && mSmoothScroller.isRunning())
				{
					mSmoothScroller.onChildAttachedToWindow(child);
				}
			}
		}

		/**
		 * Add a view to the currently attached RecyclerView if needed.
		 * LayoutManagers should use this method to add views obtained from a
		 * {@link Recycler} using {@link Recycler#getViewForPosition(int)}.
		 *
		 * @param child View to add
		 */
		public void addView(View child)
		{
			if (child.getParent() != null)
			{
				((ViewGroup) child.getParent()).removeView(child);
			}
			if (mRecyclerView.mAnimatingViewIndex >= 0)
			{
				addView(child, mRecyclerView.mAnimatingViewIndex);
			}
			else
			{
				addView(child, -1);
			}
		}

		/**
		 * Remove a view from the currently attached RecyclerView if needed.
		 * LayoutManagers should use this method to completely remove a child
		 * view that is no longer needed. LayoutManagers should strongly
		 * consider recycling removed views using
		 * {@link Recycler#recycleView(View)}.
		 *
		 * @param child View to remove
		 */
		public void removeView(View child)
		{
			final Adapter adapter = mRecyclerView.getAdapter();
			if (adapter != null)
			{
				adapter.onViewDetachedFromWindow(getChildViewHolderInt(child));
			}
			mRecyclerView.onChildDetachedFromWindow(child);
			mRecyclerView.removeView(child);
			if (mRecyclerView.mAnimatingViewIndex >= 0)
			{
				mRecyclerView.mAnimatingViewIndex--;
			}
		}

		/**
		 * Remove a view from the currently attached RecyclerView if needed.
		 * LayoutManagers should use this method to completely remove a child
		 * view that is no longer needed. LayoutManagers should strongly
		 * consider recycling removed views using
		 * {@link Recycler#recycleView(View)}.
		 *
		 * @param index Index of the child view to remove
		 */
		public void removeViewAt(int index)
		{
			final View child = mRecyclerView.getChildAt(index);
			if (child != null)
			{
				ViewGroup.LayoutParams lp = child.getLayoutParams();
				if (lp != null && lp instanceof RecyclerViewBase.LayoutParams)
				{
					RecyclerViewBase.LayoutParams rvLp = (RecyclerViewBase.LayoutParams) lp;
					if (rvLp.mViewHolder != null)
					{
						ViewHolder vh = rvLp.mViewHolder;
						if (vh.mViewType == ViewHolder.TYPE_FOOTER)
						{
							mRecyclerView.mState.mFooterCountInScreen--;
						}
						if (vh.mViewType == ViewHolder.TYPE_HEADERE)
						{
							mRecyclerView.mState.mHeaderCountInScreen--;
						}
					}
				}
				final Adapter adapter = mRecyclerView.getAdapter();
				if (adapter != null)
				{
					adapter.onViewDetachedFromWindow(getChildViewHolderInt(child));
				}
				mRecyclerView.onChildDetachedFromWindow(child);
				mRecyclerView.removeViewAt(index);
				if (mRecyclerView.mAnimatingViewIndex >= 0)
				{
					mRecyclerView.mAnimatingViewIndex--;
				}
			}
		}

		/**
		 * Remove all views from the currently attached RecyclerView. This will
		 * not recycle any of the affected views; the LayoutManager is
		 * responsible for doing so if desired.
		 */
		public void removeAllViews()
		{
			final Adapter adapter = mRecyclerView.getAdapter();
			// Only remove non-animating views
			final int childCount = mRecyclerView.getChildCount() - mRecyclerView.mNumAnimatingViews;

			for (int i = 0; i < childCount; i++)
			{
				final View child = mRecyclerView.getChildAt(i);
				if (adapter != null)
				{
					adapter.onViewDetachedFromWindow(getChildViewHolderInt(child));
				}
				mRecyclerView.onChildDetachedFromWindow(child);
			}

			for (int i = childCount - 1; i >= 0; i--)
			{
				mRecyclerView.removeViewAt(i);
				if (mRecyclerView.mAnimatingViewIndex >= 0)
				{
					mRecyclerView.mAnimatingViewIndex--;
				}
			}
		}

		/**
		 * Returns the adapter position of the item represented by the given
		 * View.
		 *
		 * @param view The view to query
		 * @return The adapter position of the item which is rendered by this
		 *         View.
		 */
		public int getPosition(View view)
		{
			if (view == null || view.getLayoutParams() == null)
			{
				return NO_POSITION;
			}
			return ((RecyclerViewBase.LayoutParams) view.getLayoutParams()).getViewPosition();
		}

		/**
		 * <p>
		 * Finds the view which represents the given adapter position.
		 * </p>
		 * <p>
		 * This method traverses each child since it has no information about
		 * child order. Override this method to improve performance if your
		 * LayoutManager keeps data about child views.
		 * </p>
		 *
		 * @param position Position of the item in adapter
		 * @return The child view that represents the given position or null if
		 *         the position is not visible
		 */
		public View findViewByPosition(int position)
		{
			final int childCount = getChildCount();
			for (int i = 0; i < childCount; i++)
			{
				View child = getChildAt(i);
				if (getPosition(child) == position)
				{
					return child;
				}
			}
			return null;
		}

		public void detachView(View child)
		{
			if (DISPATCH_TEMP_DETACH)
			{
				// ViewCompat.dispatchStartTemporaryDetach(child);
			}
			if (child == null)
			{
				return;
			}
			if (child == mRecyclerView.findFocus())
			{
				mRecyclerView.clearChildFocus(child);
			}
			if (child.hasFocus())
			{
				child.clearFocus();
			}
			mRecyclerView.detachViewFromParent(child);
		}

		public void detachViewAt(int index)
		{
			if (DISPATCH_TEMP_DETACH)
			{
				// ViewCompat.dispatchStartTemporaryDetach(mRecyclerView.getChildAt(index));
			}
			View child = mRecyclerView.getChildAt(index);
			if (child == null)
			{
				return;
			}
			if (child == mRecyclerView.findFocus())
			{
				mRecyclerView.clearChildFocus(child);
			}
			if (child instanceof IRecyclerViewFooter)
			{
				mRecyclerView.removeView(child);
			}
			else
			{
				mRecyclerView.detachViewFromParent(index);
			}
			if (mRecyclerView.mAnimatingViewIndex >= 0)
			{
				--mRecyclerView.mAnimatingViewIndex;
			}
		}

		public void attachView(View child, int index, LayoutParams lp)
		{
			mRecyclerView.attachViewToParent(child, index, lp);
			if (mRecyclerView.mAnimatingViewIndex >= 0)
			{
				++mRecyclerView.mAnimatingViewIndex;
			}
			if (DISPATCH_TEMP_DETACH)
			{
				// ViewCompat.dispatchFinishTemporaryDetach(child);
			}
		}

		public void attachView(View child, int index)
		{
			attachView(child, index, (LayoutParams) child.getLayoutParams());
		}

		public void attachView(View child)
		{
			attachView(child, -1);
		}

		/**
		 * Finish removing a view that was previously temporarily
		 * {@link #detachView(View) detached}.
		 *
		 * @param child Detached child to remove
		 */
		public void removeDetachedView(View child)
		{
			mRecyclerView.removeDetachedView(child, false);
		}

		/**
		 * Detach a child view and add it to a {@link Recycler Recycler's} scrap
		 * heap.
		 * <p/>
		 * <p>
		 * Scrapping a view allows it to be rebound and reused to show updated
		 * or different data.
		 * </p>
		 *
		 * @param child Child to detach and scrap
		 * @param recycler Recycler to deposit the new scrap view into
		 */
		public void detachAndScrapView(View child, Recycler recycler)
		{
			detachView(child);
			recycler.scrapView(child);
		}

		/**
		 * Detach a child view and add it to a {@link Recycler Recycler's} scrap
		 * heap.
		 * <p/>
		 * <p>
		 * Scrapping a view allows it to be rebound and reused to show updated
		 * or different data.
		 * </p>
		 *
		 * @param index Index of child to detach and scrap
		 * @param recycler Recycler to deposit the new scrap view into
		 */
		public void detachAndScrapViewAt(int index, Recycler recycler)
		{
			final View child = getChildAt(index);
			detachViewAt(index);
			recycler.scrapView(child);
		}

		/**
		 * Remove a child view and recycle it using the given Recycler.
		 *
		 * @param child Child to remove and recycle
		 * @param recycler Recycler to use to recycle child
		 */
		public void removeAndRecycleView(View child, Recycler recycler)
		{
			removeView(child);
			recycler.recycleView(child);
		}

		/**
		 * Remove a child view and recycle it using the given Recycler.
		 *
		 * @param index Index of child to remove and recycle
		 * @param recycler Recycler to use to recycle child
		 */
		public void removeAndRecycleViewAt(int index, Recycler recycler)
		{
			final View view = getChildAt(index);
			removeViewAt(index);
			recycler.recycleView(view);
		}

		/**
		 * Return the current number of child views attached to the parent
		 * RecyclerView. This does not include child views that were temporarily
		 * detached and/or scrapped.
		 *
		 * @return Number of attached children
		 */
		public int getChildCount()
		{
			return mRecyclerView != null ? mRecyclerView.getChildCount() - mRecyclerView.mNumAnimatingViews : 0;
		}

		/**
		 * Return the child view at the given index
		 *
		 * @param index Index of child to return
		 * @return Child view at index
		 */
		public View getChildAt(int index)
		{
			return mRecyclerView != null ? mRecyclerView.getChildAt(index) : null;
		}

		/**
		 * Return the width of the parent RecyclerView
		 *
		 * @return Width in pixels
		 */
		public int getWidth()
		{
			return mRecyclerView != null ? mRecyclerView.getWidth() : 0;
		}

		/**
		 * Return the height of the parent RecyclerView
		 *
		 * @return Height in pixels
		 */
		public int getHeight()
		{
			return mRecyclerView != null ? mRecyclerView.getHeight() : 0;
		}

		/**
		 * Return the left padding of the parent RecyclerView
		 *
		 * @return Padding in pixels
		 */
		public int getPaddingLeft()
		{
			return mRecyclerView != null ? mRecyclerView.getPaddingLeft() : 0;
		}

		/**
		 * Return the top padding of the parent RecyclerView
		 *
		 * @return Padding in pixels
		 */
		public int getPaddingTop()
		{
			return mRecyclerView != null ? mRecyclerView.getPaddingTop() : 0;
		}

		/**
		 * Return the right padding of the parent RecyclerView
		 *
		 * @return Padding in pixels
		 */
		public int getPaddingRight()
		{
			return mRecyclerView != null ? mRecyclerView.getPaddingRight() : 0;
		}

		/**
		 * Return the bottom padding of the parent RecyclerView
		 *
		 * @return Padding in pixels
		 */
		public int getPaddingBottom()
		{
			return mRecyclerView != null ? mRecyclerView.getPaddingBottom() : 0;
		}

		/**
		 * Return the start padding of the parent RecyclerView
		 *
		 * @return Padding in pixels
		 */
		// public int getPaddingStart()
		// {
		// return mRecyclerView != null ?
		// ViewCompat.getPaddingStart(mRecyclerView) : 0;
		// }

		/**
		 * Return the end padding of the parent RecyclerView
		 *
		 * @return Padding in pixels
		 */
		// public int getPaddingEnd()
		// {
		// return mRecyclerView != null ?
		// ViewCompat.getPaddingEnd(mRecyclerView) : 0;
		// }

		/**
		 * Returns true if the RecyclerView this LayoutManager is bound to has
		 * focus.
		 *
		 * @return True if the RecyclerView has focus, false otherwise.
		 * @see View#isFocused()
		 */
		public boolean isFocused()
		{
			return mRecyclerView != null && mRecyclerView.isFocused();
		}

		/**
		 * Returns true if the RecyclerView this LayoutManager is bound to has
		 * or contains focus.
		 *
		 * @return true if the RecyclerView has or contains focus
		 * @see View#hasFocus()
		 */
		public boolean hasFocus()
		{
			return mRecyclerView != null && mRecyclerView.hasFocus();
		}

		/**
		 * Return the number of items in the adapter bound to the parent
		 * RecyclerView
		 *
		 * @return Items in the bound adapter
		 */
		public int getItemCount()
		{
			final Adapter a = mRecyclerView != null ? mRecyclerView.getAdapter() : null;
			return a != null ? a.getItemCount() : 0;
		}

		/**
		 * Offset all child views attached to the parent RecyclerView by dx
		 * pixels along the horizontal axis.
		 *
		 * @param dx Pixels to offset by
		 */
		public void offsetChildrenHorizontal(int dx)
		{
			if (mRecyclerView != null)
			{
				mRecyclerView.offsetChildrenHorizontal(dx);
			}
		}

		/**
		 * Offset all child views attached to the parent RecyclerView by dy
		 * pixels along the vertical axis.
		 *
		 * @param dy Pixels to offset by
		 */
		public void offsetChildrenVertical(int dy)
		{
			if (mRecyclerView != null)
			{
				mRecyclerView.offsetChildrenVertical(dy);
			}
		}

		/**
		 * Temporarily detach and scrap all currently attached child views.
		 * Views will be scrapped into the given Recycler. The Recycler may
		 * prefer to reuse scrap views before other views that were previously
		 * recycled.
		 *
		 * @param recycler Recycler to scrap views into
		 */
		public void detachAndScrapAttachedViews(Recycler recycler)
		{
			if (mRecyclerView != null && mRecyclerView.needAdvancedStopDetachChildView())
				return;
			//			// 只有水印view时，不进行view摘除
			//			if (mRecyclerView.mWaterMarkCustomView != null && mRecyclerView.mNeedWaterMark
			//					&& (mRecyclerView.mForceWaterMark || mRecyclerView.mAdapter.getItemCount() <= 0))
			//			{
			//				if (getChildCount() == 1 && getChildAt(0) == mRecyclerView.mWaterMarkCustomView)
			//				{
			//					return;
			//				}
			//			}
			final int childCount = getChildCount();
			for (int i = childCount - 1; i >= 0; i--)
			{
				final View v = getChildAt(i);
				detachViewAt(i);
				if (v instanceof RecyclerViewItem)
				{
					recycler.scrapView(v);
				}
			}
		}

		/**
		 * Recycles the scrapped views.
		 * <p/>
		 * When a view is detached and removed, it does not trigger a ViewGroup
		 * invalidate. This is the expected behavior if scrapped views are used
		 * for animations. Otherwise, we need to call remove and invalidate
		 * RecyclerView to ensure UI updateStyle.
		 *
		 * @param recycler Recycler
		 * @param remove Whether scrapped views should be removed from ViewGroup
		 *            or
		 *            not. This method will invalidate RecyclerView if it
		 *            removes any scrapped child.
		 */
		protected void removeAndRecycleScrapInt(Recycler recycler, boolean remove, boolean recycle)
		{
			final int scrapCount = recycler.getScrapCount();
			for (int i = 0; i < scrapCount; i++)
			{
				final View scrap = recycler.getScrapViewAt(i);
				if (scrap instanceof RecyclerViewItem)
				{
					if (remove)
					{
						mRecyclerView.removeDetachedView(scrap, false);
					}
					if (recycle)
					{
						recycler.quickRecycleScrapView(scrap);
					}
				}
			}
			recycler.clearScrap();
			if (remove && scrapCount > 0)
			{
				mRecyclerView.invalidate();
			}
		}

		/**
		 * Measure a child view using standard measurement policy, taking the
		 * padding of the parent RecyclerView and any added item decorations
		 * into account.
		 * <p/>
		 * <p>
		 * If the RecyclerView can be scrolled in either dimension the caller
		 * may pass 0 as the widthUsed or heightUsed parameters as they will be
		 * irrelevant.
		 * </p>
		 *
		 * @param child Child view to measure
		 * @param widthUsed Width in pixels currently consumed by other views,
		 *            if
		 *            relevant
		 * @param heightUsed Height in pixels currently consumed by other views,
		 *            if
		 *            relevant
		 */
		public void measureChild(View child, int widthUsed, int heightUsed)
		{
			final LayoutParams lp = (LayoutParams) child.getLayoutParams();

			final Rect insets = mRecyclerView.getItemDecorInsetsForChild(child);
			widthUsed += insets.left + insets.right;
			heightUsed += insets.top + insets.bottom;

			final int widthSpec = getChildMeasureSpec(getWidth(), getPaddingLeft() + getPaddingRight() + widthUsed, lp.width,
					canScrollHorizontally());
			final int heightSpec = getChildMeasureSpec(getHeight(), getPaddingTop() + getPaddingBottom() + heightUsed, lp.height,
					canScrollVertically());
			child.measure(widthSpec, heightSpec);
		}

		/**
		 * Measure a child view using standard measurement policy, taking the
		 * padding of the parent RecyclerView, any added item decorations and
		 * the child margins into account.
		 * <p/>
		 * <p>
		 * If the RecyclerView can be scrolled in either dimension the caller
		 * may pass 0 as the widthUsed or heightUsed parameters as they will be
		 * irrelevant.
		 * </p>
		 *
		 * @param child Child view to measure
		 * @param widthUsed Width in pixels currently consumed by other views,
		 *            if
		 *            relevant
		 * @param heightUsed Height in pixels currently consumed by other views,
		 *            if
		 *            relevant
		 */
		public void measureChildWithMargins(View child, int widthUsed, int heightUsed)
		{
			LayoutParams lp = null;
			if (child == null)
			{
				return;
			}
			if (child.getLayoutParams() != null)
			{
				lp = (LayoutParams) child.getLayoutParams();
			}
			else
			{
				lp = generateDefaultLayoutParams();
			}
			final Rect insets = mRecyclerView.getItemDecorInsetsForChild(child);
			widthUsed += insets.left + insets.right;
			heightUsed += insets.top + insets.bottom;

			int childWidth = lp.width;
			int childHeight = lp.height;
			//			if (mRecyclerView.getAdapter() instanceof RecyclerAdapter)
			//			{
			//				boolean enableAutoItemHeight = ((RecyclerAdapter) mRecyclerView.getAdapter()).isAutoCalculateItemHeight();
			//				if (enableAutoItemHeight && child instanceof RecyclerViewItem)
			//				{
			//					if (((RecyclerViewItem) child).getChildCount() > 0)
			//					{
			//						View contentView = ((RecyclerViewItem) child).getChildAt(0);
			//						childWidth = contentView.getMeasuredWidth();
			//						childHeight = contentView.getMeasuredHeight();
			//					}
			//				}
			//			}

			final int widthSpec = getChildMeasureSpec(getWidth(), getPaddingLeft() + getPaddingRight() + lp.leftMargin + lp.rightMargin + widthUsed,
					childWidth, canScrollHorizontally());
			final int heightSpec = getChildMeasureSpec(getHeight(),
					getPaddingTop() + getPaddingBottom() + lp.topMargin + lp.bottomMargin + heightUsed, childHeight, canScrollVertically());

			child.measure(widthSpec, heightSpec);
		}

		/**
		 * Calculate a MeasureSpec value for measuring a child view in one
		 * dimension.
		 *
		 * @param parentSize Size of the parent view where the child will be
		 *            placed
		 * @param padding Total space currently consumed by other elements of
		 *            parent
		 * @param childDimension Desired size of the child view, or
		 *            MATCH_PARENT/WRAP_CONTENT. Generally obtained from the
		 *            child view's LayoutParams
		 * @param canScroll true if the parent RecyclerView can scroll in this
		 *            dimension
		 * @return a MeasureSpec value for the child view
		 */
		public static int getChildMeasureSpec(int parentSize, int padding, int childDimension, boolean canScroll)
		{
			int size = Math.max(0, parentSize - padding);
			int resultSize = 0;
			int resultMode = MeasureSpec.UNSPECIFIED;

			if (canScroll)
			{
				if (childDimension >= 0)
				{
					resultSize = childDimension;
					resultMode = MeasureSpec.EXACTLY;
				}
				else
				{
					// MATCH_PARENT can't be applied since we can scroll in this
					// dimension, wrap
					// instead using UNSPECIFIED.
					resultSize = 0;
					resultMode = MeasureSpec.UNSPECIFIED;
				}
			}
			else
			{
				if (childDimension >= 0)
				{
					resultSize = childDimension;
					resultMode = MeasureSpec.EXACTLY;
				}
				else if (childDimension == LayoutParams.FILL_PARENT)
				{
					resultSize = size;
					resultMode = MeasureSpec.EXACTLY;
				}
				else if (childDimension == LayoutParams.WRAP_CONTENT)
				{
					resultSize = size;
					resultMode = MeasureSpec.AT_MOST;
				}
			}
			return MeasureSpec.makeMeasureSpec(resultSize, resultMode);
		}

		/**
		 * Returns the measured width of the given child, plus the additional
		 * size of any insets applied by {@link ItemDecoration ItemDecorations}.
		 *
		 * @param child Child view to query
		 * @return child's measured width plus <code>ItemDecoration</code>
		 *         insets
		 * @see View#getMeasuredWidth()
		 */
		public int getDecoratedMeasuredWidth(View child)
		{
			final Rect insets = ((LayoutParams) child.getLayoutParams()).mDecorInsets;
			return child.getMeasuredWidth() + insets.left + insets.right;
		}

		/**
		 * Returns the measured height of the given child, plus the additional
		 * size of any insets applied by {@link ItemDecoration ItemDecorations}.
		 *
		 * @param child Child view to query
		 * @return child's measured height plus <code>ItemDecoration</code>
		 *         insets
		 * @see View#getMeasuredHeight()
		 */
		public int getDecoratedMeasuredHeight(View child)
		{
			final Rect insets = ((LayoutParams) child.getLayoutParams()).mDecorInsets;
			return child.getMeasuredHeight() + insets.top + insets.bottom;
		}

		/**
		 * Lay out the given child view within the RecyclerView using
		 * coordinates that include any current {@link ItemDecoration
		 * ItemDecorations}.
		 * <p/>
		 * <p>
		 * LayoutManagers should prefer working in sizes and coordinates that
		 * include item decoration insets whenever possible. This allows the
		 * LayoutManager to effectively ignore decoration insets within
		 * measurement and layout code. See the following methods:
		 * </p>
		 * <ul>
		 * <li>{@link #measureChild(View, int, int)}</li>
		 * <li>{@link #measureChildWithMargins(View, int, int)}</li>
		 * <li>{@link #getDecoratedLeft(View)}</li>
		 * <li>{@link #getDecoratedTop(View)}</li>
		 * <li>{@link #getDecoratedRight(View)}</li>
		 * <li>{@link #getDecoratedBottom(View)}</li>
		 * <li>{@link #getDecoratedMeasuredWidth(View)}</li>
		 * <li>{@link #getDecoratedMeasuredHeight(View)}</li>
		 * </ul>
		 *
		 * @param child Child to lay out
		 * @param left Left edge, with item decoration insets included
		 * @param top Top edge, with item decoration insets included
		 * @param right Right edge, with item decoration insets included
		 * @param bottom Bottom edge, with item decoration insets included
		 * @see View#layout(int, int, int, int)
		 */
		public void layoutDecorated(View child, int left, int top, int right, int bottom)
		{
			final Rect insets = ((LayoutParams) child.getLayoutParams()).mDecorInsets;
			child.layout(left + insets.left, top + insets.top, right - insets.right, bottom - insets.bottom);
		}

		/**
		 * Returns the left edge of the given child view within its parent,
		 * offset by any applied {@link ItemDecoration ItemDecorations}.
		 *
		 * @param child Child to query
		 * @return Child left edge with offsets applied
		 */
		public int getDecoratedLeft(View child)
		{
			final Rect insets = ((LayoutParams) child.getLayoutParams()).mDecorInsets;
			return child.getLeft() - insets.left;
		}

		/**
		 * Returns the top edge of the given child view within its parent,
		 * offset by any applied {@link ItemDecoration ItemDecorations}.
		 *
		 * @param child Child to query
		 * @return Child top edge with offsets applied
		 */
		public int getDecoratedTop(View child)
		{
			final Rect insets = ((LayoutParams) child.getLayoutParams()).mDecorInsets;
			return child.getTop() - insets.top;
		}

		/**
		 * Returns the right edge of the given child view within its parent,
		 * offset by any applied {@link ItemDecoration ItemDecorations}.
		 *
		 * @param child Child to query
		 * @return Child right edge with offsets applied
		 */
		public int getDecoratedRight(View child)
		{
			final Rect insets = ((LayoutParams) child.getLayoutParams()).mDecorInsets;
			return child.getRight() + insets.right;
		}

		/**
		 * Returns the bottom edge of the given child view within its parent,
		 * offset by any applied {@link ItemDecoration ItemDecorations}.
		 *
		 * @param child Child to query
		 * @return Child bottom edge with offsets applied
		 */
		public int getDecoratedBottom(View child)
		{
			final Rect insets = ((LayoutParams) child.getLayoutParams()).mDecorInsets;
			return child.getBottom() + insets.bottom;
		}

		/**
		 * Called when searching for a focusable view in the given direction has
		 * failed for the current content of the RecyclerView.
		 * <p/>
		 * <p>
		 * This is the LayoutManager's opportunity to populate views in the
		 * given direction to fulfill the request if it can. The LayoutManager
		 * should attach and return the view to be focused. The default
		 * implementation returns null.
		 * </p>
		 *
		 * @param focused The currently focused view
		 * @param direction One of {@link View#FOCUS_UP},
		 *            {@link View#FOCUS_DOWN}, {@link View#FOCUS_LEFT},
		 *            {@link View#FOCUS_RIGHT}, {@link View#FOCUS_BACKWARD},
		 *            {@link View#FOCUS_FORWARD} or
		 *            0 for not applicable
		 * @param recycler The recycler to use for obtaining views for currently
		 *            offscreen items
		 * @param state Transient state of RecyclerView
		 * @return The chosen view to be focused
		 */
		public View onFocusSearchFailed(View focused, int direction, Recycler recycler, State state)
		{
			return null;
		}

		public View onInterceptFocusSearch(View focused, int direction)
		{
			return null;
		}

		/**
		 * Called when a child of the RecyclerView wants a particular rectangle
		 * to be positioned onto the screen. See
		 * {@link ViewParent#requestChildRectangleOnScreen(View, Rect, boolean)}
		 * for more details.
		 * <p/>
		 * <p>
		 * The base implementation will attempt to perform a standard
		 * programmatic scroll to bring the given rect into view, within the
		 * padded area of the RecyclerView.
		 * </p>
		 *
		 * @param child The direct child making the request.
		 * @param rect The rectangle in the child's coordinates the child wishes
		 *            to be on the screen.
		 * @param immediate True to forbid animated or delayed scrolling, false
		 *            otherwise
		 * @return Whether the group scrolled to handle the operation
		 */
		public boolean requestChildRectangleOnScreen(RecyclerViewBase parent, View child, Rect rect, boolean immediate)
		{
			try
			{
				final int parentLeft = getPaddingLeft();
				final int parentTop = getPaddingTop();
				final int parentRight = getWidth() - getPaddingRight();
				final int parentBottom = getHeight() - getPaddingBottom();
				final int childLeft = child.getLeft() + rect.left;
				final int childTop = child.getTop() + rect.top;
				final int childRight = childLeft + rect.right;
				final int childBottom = childTop + rect.bottom;

				final int offScreenLeft = Math.min(0, childLeft - parentLeft);
				final int offScreenTop = Math.min(0, childTop - parentTop);
				final int offScreenRight = Math.max(0, childRight - parentRight);
				final int offScreenBottom = Math.max(0, childBottom - parentBottom);

				// Favor the "start" layout direction over the end when bringing
				// one
				// side or the other
				// of a large rect into view.
				final int dx;
				{
					dx = offScreenLeft != 0 ? offScreenLeft : offScreenRight;
				}

				// Favor bringing the top into view over the bottom
				final int dy = offScreenTop != 0 ? offScreenTop : offScreenBottom;

				if (dx != 0 || dy != 0)
				{
					if (immediate)
					{
						parent.scrollBy(dx, dy);
					}
					else
					{
						parent.smoothScrollBy(dx, dy, false);
					}
					if (parent.needNotifyFooter && !parent.checkNotifyFooterOnRelease)
					{
						// Log.d("leo", "ontouchevent needNotify" + ",offsetY="
						// + mOffsetY + "mTotalLength-height="
						// + (mAdapter.getListTotalHeight() - getHeight()));
						parent.needNotifyFooter = false;
						parent.mRecycler.notifyLastFooterAppeared();
					}
					return true;
				}
				return false;
			}
			catch (StackOverflowError e)
			{
				return false;
			}
		}

		/**
		 * Called when a descendant view of the RecyclerView requests focus.
		 * <p/>
		 * <p>
		 * A LayoutManager wishing to keep focused views aligned in a specific
		 * portion of the view may implement that behavior in an override of
		 * this method.
		 * </p>
		 * <p/>
		 * <p>
		 * If the LayoutManager executes different behavior that should override
		 * the default behavior of scrolling the focused child on screen instead
		 * of running alongside it, this method should return true.
		 * </p>
		 *
		 * @param parent The RecyclerView hosting this LayoutManager
		 * @param child Direct child of the RecyclerView containing the newly
		 *            focused view
		 * @param focused The newly focused view. This may be the same view as
		 *            child
		 * @return true if the default scroll behavior should be suppressed
		 */
		public boolean onRequestChildFocus(RecyclerViewBase parent, View child, View focused)
		{
			return false;
		}

		public void onAdapterChanged(Adapter oldAdapter, Adapter newAdapter)
		{
		}

		/**
		 * Called to populate focusable views within the RecyclerView.
		 * <p/>
		 * <p>
		 * The LayoutManager implementation should return <code>true</code> if
		 * the default behavior of
		 * {@link ViewGroup#addFocusables(ArrayList, int)} should be
		 * suppressed.
		 * </p>
		 * <p/>
		 * <p>
		 * The default implementation returns <code>false</code> to trigger
		 * RecyclerView to fall back to the default ViewGroup behavior.
		 * </p>
		 *
		 * @param recyclerView The RecyclerView hosting this LayoutManager
		 * @param views List of output views. This method should add valid
		 *            focusable views to this list.
		 * @param direction One of {@link View#FOCUS_UP},
		 *            {@link View#FOCUS_DOWN}, {@link View#FOCUS_LEFT},
		 *            {@link View#FOCUS_RIGHT}, {@link View#FOCUS_BACKWARD},
		 *            {@link View#FOCUS_FORWARD}
		 * @param focusableMode The type of focusables to be added.
		 * @return true to suppress the default behavior, false to add default
		 *         focusables after this method returns.
		 * @see #FOCUSABLES_ALL
		 * @see #FOCUSABLES_TOUCH_MODE
		 */
		public boolean onAddFocusables(RecyclerViewBase recyclerView, ArrayList<View> views, int direction, int focusableMode)
		{
			return false;
		}

		/**
		 * Called when items have been added to the adapter. The LayoutManager
		 * may choose to requestLayout if the inserted items would require
		 * refreshing the currently visible set of child views. (e.g. currently
		 * empty space would be filled by appended items, etc.)
		 *
		 * @param recyclerView
		 * @param positionStart
		 * @param itemCount
		 */
		public void onItemsAdded(RecyclerViewBase recyclerView, int positionStart, int itemCount)
		{
		}

		/**
		 * Called when items have been removed from the adapter.
		 *
		 * @param recyclerView
		 * @param positionStart
		 * @param itemCount
		 */
		public void onItemsRemoved(RecyclerViewBase recyclerView, int positionStart, int itemCount)
		{
		}

		public int computeHorizontalScrollExtent(State state)
		{
			return 0;
		}

		public int computeHorizontalScrollOffset(State state)
		{
			return 0;
		}

		public int computeHorizontalScrollRange(State state)
		{
			return 0;
		}

		public int computeVerticalScrollExtent(State state)
		{
			return 0;
		}

		public int computeVerticalScrollOffset(State state)
		{
			return 0;
		}

		public int computeVerticalScrollRange(State state)
		{
			return 0;
		}

		/**
		 * Measure the attached RecyclerView. Implementations must call
		 * {@link #setMeasuredDimension(int, int)} before returning.
		 * <p/>
		 * <p>
		 * The default implementation will handle EXACTLY measurements and
		 * respect the minimum width and height properties of the host
		 * RecyclerView if measured as UNSPECIFIED. AT_MOST measurements will be
		 * treated as EXACTLY and the RecyclerView will consume all available
		 * space.
		 * </p>
		 *
		 * @param recycler Recycler
		 * @param state Transient state of RecyclerView
		 * @param widthSpec Width {@link MeasureSpec}
		 * @param heightSpec Height {@link MeasureSpec}
		 */
		public void onMeasure(Recycler recycler, State state, int widthSpec, int heightSpec)
		{
			final int widthMode = MeasureSpec.getMode(widthSpec);
			final int heightMode = MeasureSpec.getMode(heightSpec);
			final int widthSize = MeasureSpec.getSize(widthSpec);
			final int heightSize = MeasureSpec.getSize(heightSpec);

			int width = 0;
			int height = 0;

			switch (widthMode)
			{
				case MeasureSpec.EXACTLY:
				case MeasureSpec.AT_MOST:
					width = widthSize;
					break;
				case MeasureSpec.UNSPECIFIED:
				default:
					width = getMinimumWidth();
					break;
			}

			switch (heightMode)
			{
				case MeasureSpec.EXACTLY:
				case MeasureSpec.AT_MOST:
					height = heightSize;
					break;
				case MeasureSpec.UNSPECIFIED:
				default:
					height = getMinimumHeight();
					break;
			}

			setMeasuredDimension(width, height);
		}

		/**
		 * {@link View#setMeasuredDimension(int, int) Set the measured
		 * dimensions} of the host RecyclerView.
		 *
		 * @param widthSize Measured width
		 * @param heightSize Measured height
		 */
		public void setMeasuredDimension(int widthSize, int heightSize)
		{
			mRecyclerView.setMeasuredDimension(widthSize, heightSize);
		}

		/**
		 * @return The host RecyclerView's {@link View#getMinimumWidth()}
		 */
		public int getMinimumWidth()
		{
			return ViewCompatTool.getMinimumWidth(mRecyclerView);
		}

		/**
		 * @return The host RecyclerView's {@link View#getMinimumHeight()}
		 */
		public int getMinimumHeight()
		{
			return ViewCompatTool.getMinimumHeight(mRecyclerView);
		}

		/**
		 * <p>
		 * Called when the LayoutManager should save its state. This is a good
		 * time to save your scroll position, configuration and anything else
		 * that may be required to restore the same layout state if the
		 * LayoutManager is recreated.
		 * </p>
		 * <p>
		 * RecyclerView does NOT verify if the LayoutManager has changed between
		 * state save and restore. This will let you share information between
		 * your LayoutManagers but it is also your responsibility to make sure
		 * they use the same parcelable class.
		 * </p>
		 *
		 * @return Necessary information for LayoutManager to be able to restore
		 *         its state
		 */
		public Parcelable onSaveInstanceState()
		{
			return null;
		}

		public void onRestoreInstanceState(Parcelable state)
		{

		}

		void stopSmoothScroller()
		{
			if (mSmoothScroller != null)
			{
				mSmoothScroller.stop();
			}
		}

		/* private */void onSmoothScrollerStopped(SmoothScroller smoothScroller)
		{
			if (mSmoothScroller == smoothScroller)
			{
				mSmoothScroller = null;
			}
		}

		void removeAndRecycleAllViews(Recycler recycler)
		{
			for (int i = getChildCount() - 1; i >= 0; i--)
			{
				removeAndRecycleViewAt(i, recycler);
			}
		}

		public View getFirstItemBeforeOffset(int offset)
		{
			final int count = getChildCount();
			for (int i = 0; i < count; i++)
			{
				View v = getChildAt(i);
				if (getDecoratedStart(v) < offset)
				{
					return v;
				}
			}
			return null;
		}

		public void calculateOffsetMap(SparseIntArray offsetMap, int startOffset)
		{
		}

		public int getLayoutType()
		{
			return LAYOUT_TYPE_LIST;
		}

		public RecyclerViewBase.LayoutParams onCreateItemLayoutParams(RecyclerView.ViewHolderWrapper holder, int position, int layoutType,
				int cardType)
		{
			return new RecyclerViewBase.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
		}

		public void clear()
		{

		}

		public int getTotalHeight()
		{
			return Integer.MIN_VALUE;
		}
	}

	public static abstract class ItemDecoration
	{
		/**
		 * Draw any appropriate decorations into the Canvas supplied to the
		 * RecyclerView. Any content drawn by this method will be drawn before
		 * the item views are drawn, and will thus appear underneath the views.
		 *
		 * @param c Canvas to draw into
		 * @param parent RecyclerView this ItemDecoration is drawing into
		 */
		public void onDraw(Canvas c, RecyclerViewBase parent)
		{
		}

		/**
		 * Draw any appropriate decorations into the Canvas supplied to the
		 * RecyclerView. Any content drawn by this method will be drawn after
		 * the item views are drawn and will thus appear over the views.
		 *
		 * @param c Canvas to draw into
		 * @param parent RecyclerView this ItemDecoration is drawing into
		 */
		public void onDrawOver(Canvas c, RecyclerViewBase parent)
		{
		}

		/**
		 * Retrieve any offsets for the given item. Each field of
		 * <code>outRect</code> specifies the number of pixels that the item
		 * view should be inset by, similar to padding or margin. The default
		 * implementation sets the bounds of outRect to 0 and returns.
		 * <p/>
		 * <p>
		 * If this ItemDecoration does not affect the positioning of item views
		 * it should set all four fields of <code>outRect</code> (left, top,
		 * right, bottom) to zero before returning.
		 * </p>
		 *
		 * @param outRect Rect to receive the output.
		 * @param itemPosition Adapter position of the item to offset
		 * @param parent RecyclerView this ItemDecoration is decorating
		 */
		public void getItemOffsets(Rect outRect, int itemPosition, RecyclerViewBase parent)
		{
			outRect.set(0, 0, 0, 0);
		}
	}

	/**
	 * An OnItemTouchListener allows the application to intercept touch events
	 * in progress at the view hierarchy level of the RecyclerView before those
	 * touch events are considered for RecyclerView's own scrolling behavior.
	 * <p/>
	 * <p>
	 * This can be useful for applications that wish to implement various forms
	 * of gestural manipulation of item views within the RecyclerView.
	 * OnItemTouchListeners may intercept a touch interaction already in
	 * progress even if the RecyclerView is already handling that gesture stream
	 * itself for the purposes of scrolling.
	 * </p>
	 */
	public interface OnItemTouchListener
	{
		/**
		 * Silently observe and/or take over touch events sent to the
		 * RecyclerView before they are handled by either the RecyclerView
		 * itself or its child views.
		 * <p/>
		 * <p>
		 * The onInterceptTouchEvent methods of each attached
		 * OnItemTouchListener will be run in the order in which each listener
		 * was added, before any other touch processing by the RecyclerView
		 * itself or child views occurs.
		 * </p>
		 *
		 * @param e MotionEvent describing the touch event. All coordinates
		 *            are in the RecyclerView's coordinate system.
		 * @return true if this OnItemTouchListener wishes to begin intercepting
		 *         touch events, false to continue with the current behavior and
		 *         continue observing future events in the gesture.
		 */
		boolean onInterceptTouchEvent(RecyclerViewBase rv, MotionEvent e);

		/**
		 * Process a touch event as part of a gesture that was claimed by
		 * returning true from a previous call to {@link #onInterceptTouchEvent}
		 * .
		 *
		 * @param e MotionEvent describing the touch event. All coordinates
		 *            are in the RecyclerView's coordinate system.
		 */
		void onTouchEvent(RecyclerViewBase rv, MotionEvent e);
	}

	public interface OnScrollListener
	{
		void onScrollStateChanged(int oldState, int newState);

		void onScrolled(int dx, int dy);
	}

	public interface OnScrollFinishListener
	{
		void onScrollFinished();
	}

	//	public interface RecyclerListener
	//	{
	//
	//		/**
	//		 * This method is called whenever the view in the ViewHolder is
	//		 * recycled.
	//		 *
	//		 * @param holder The ViewHolder containing the view that was recycled
	//		 */
	//		public void onViewRecycled(ViewHolder holder);
	//	}

	/**
	 * A ViewHolder describes an item view and metadata about its place within
	 * the RecyclerView.
	 * <p/>
	 * <p>
	 * {@link Adapter} implementations should subclass ViewHolder and add fields
	 * for caching potentially expensive {@link View#findViewById(int)} results.
	 * </p>
	 * <p/>
	 * <p>
	 * While {@link LayoutParams} belong to the {@link LayoutManager},
	 * {@link ViewHolder ViewHolders} belong to the adapter. Adapters should
	 * feel free to use their own custom ViewHolder implementations to store
	 * data that makes binding view contents easier. Implementations should
	 * assume that individual item views will hold strong references to
	 * <code>ViewHolder</code> objects and that <code>RecyclerView</code>
	 * instances may hold strong references to extra off-screen item views for
	 * caching purposes
	 * </p>
	 */
	public static abstract class ViewHolder
	{
		public final View			itemView;
		public View					mContent;
		public ContentHolder		mContentHolder;
		public int					mPosition			= NO_POSITION;
		public int					mOldPosition		= NO_POSITION;
		public long					mItemId				= NO_ID;
		public int					mItemViewType		= INVALID_TYPE;

		public static final int		TYPE_HEADERE		      = 1;
		public static final int		TYPE_FOOTER			      = 2;
		public static final int		TYPE_NORMAL			      = 3;
		public static final int		TYPE_CUSTOM_HEADERE		= 4;
		public static final int		TYPE_CUSTOM_FOOTER		= 5;
		public int					mViewType			= TYPE_NORMAL;
		/**
		 * This ViewHolder has been bound to a position; mPosition, mItemId and
		 * mItemViewType are all valid.
		 */
		protected static final int	FLAG_BOUND			= 1;

		/**
		 * The data this ViewHolder's view reflects is stale and needs to be
		 * rebound by the adapter. mPosition and mItemId are consistent.
		 */
		public static final int		FLAG_UPDATE			= 1 << 1;

		/**
		 * This ViewHolder's data is invalid. The identity implied by mPosition
		 * and mItemId are not to be trusted and may no longer match the item
		 * view type. This ViewHolder must be fully rebound to different data.
		 */
		protected static final int	FLAG_INVALID		= 1 << 2;

		/**
		 * This ViewHolder points at data that represents an item previously
		 * removed from the data set. Its view may still be used for things like
		 * outgoing animations.
		 */
		static final int			FLAG_REMOVED		= 1 << 3;

		/**
		 * This ViewHolder should not be recycled. This flag is set via
		 * setIsRecyclable() and is intended to keep views around during
		 * animations.
		 */
		static final int			FLAG_NOT_RECYCLABLE	= 1 << 4;

		protected int				mFlags;

		public boolean				mForceBind			= false;

		public boolean				mBindNextTime		= false;

		/* private */int			mIsRecyclableCount	= 0;

		// If non-null, view is currently considered scrap and may be reused for
		// other data by the
		// scrap container.
		/* private */Recycler		mScrapContainer		= null;

		public boolean				mPosDirty;

		protected RecyclerViewBase	mParent;

		/**
		 * 用于view的复用时，不会在View的缓存池里面随机取view，根据reuseKey来获取最适合的view
		 * 尽量保证刷新list的时候，用到自己之前的那个view，这样不会导致闪烁的问题
		 */
		public String				mHolderReuseKey		= null;

		public ViewHolder(View itemView, RecyclerViewBase rv)
		{
			this.mParent = rv;
			if (itemView == null)
			{
				throw new IllegalArgumentException("itemView may not be null");
			}
			this.itemView = itemView;
		}

		public void offsetPosition(int offset)
		{
			if (mOldPosition == NO_POSITION)
			{
				mOldPosition = mPosition;
			}
			mPosition += offset;
		}

		void clearOldPosition()
		{
			mOldPosition = NO_POSITION;
		}

		public int getPosition()
		{
			return mOldPosition == NO_POSITION ? mPosition : mOldPosition;
		}

		public final long getItemId()
		{
			return mItemId;
		}

		public final int getItemViewType()
		{
			return mItemViewType;
		}

		public final void setItemViewType(int type)
		{
			mItemViewType = type;
		}

		boolean isScrap()
		{
			return mScrapContainer != null;
		}

		void unScrap()
		{
			mScrapContainer.unscrapView(this);
			mScrapContainer = null;
		}

		public void setScrapContainer(Recycler recycler)
		{
			mScrapContainer = recycler;
		}

		public boolean isInvalid()
		{
			return (mFlags & FLAG_INVALID) != 0;
		}

		public boolean needsUpdate()
		{
			return (mFlags & FLAG_UPDATE) != 0;
		}

		public boolean isBound()
		{
			return (mFlags & FLAG_BOUND) != 0;
		}

		public boolean isRemoved()
		{
			return (mFlags & FLAG_REMOVED) != 0;
		}

		void setFlags(int flags, int mask)
		{
			mFlags = (mFlags & ~mask) | (flags & mask);
		}

		public void addFlags(int flags)
		{
			mFlags |= flags;
		}

		public void clearFlagsForSharedPool()
		{
			mFlags = 0;
		}

		@Override
		public String toString()
		{
			final StringBuilder sb = new StringBuilder("ViewHolder{" + Integer.toHexString(hashCode()) + " position=" + mPosition + " id=" + mItemId);
			if (isScrap())
				sb.append(" scrap");
			if (isInvalid())
				sb.append(" invalid");
			if (!isBound())
				sb.append(" unbound");
			if (needsUpdate())
				sb.append(" updateStyle");
			if (isRemoved())
				sb.append(" removed");
			sb.append(" type=" + mItemViewType);
			sb.append("}");
			return sb.toString();
		}

		/**
		 * Informs the recycler whether this item can be recycled. Views which
		 * are not recyclable will not be reused for other items until
		 * setIsRecyclable() is later set to true. Calls to setIsRecyclable()
		 * should always be paired (one call to setIsRecyclabe(false) should
		 * always be matched with a later call to setIsRecyclable(true)). Pairs
		 * of calls may be nested, as the state is internally reference-counted.
		 *
		 * @param recyclable Whether this item is available to be recycled.
		 *            Default
		 *            value is true.
		 */
		public final void setIsRecyclable(boolean recyclable)
		{
			mIsRecyclableCount = recyclable ? mIsRecyclableCount - 1 : mIsRecyclableCount + 1;
			if (mIsRecyclableCount < 0)
			{
				mIsRecyclableCount = 0;
				// Log.e(VIEW_LOG_TAG, "isRecyclable decremented below 0: " +
				// "unmatched pair of setIsRecyable() calls");
			}
			else if (!recyclable && mIsRecyclableCount == 1)
			{
				mFlags |= FLAG_NOT_RECYCLABLE;
			}
			else if (recyclable && mIsRecyclableCount == 0)
			{
				mFlags &= ~FLAG_NOT_RECYCLABLE;
			}
		}

		/**
		 * @return true if this item is available to be recycled, false
		 *         otherwise.
		 * @see {@link #setIsRecyclable(boolean)}
		 */
		public final boolean isRecyclable()
		{
			return (mFlags & FLAG_NOT_RECYCLABLE) == 0;
		}

		public abstract void inTraversals(int tracersalPurpose);

		public boolean canChangeOrder()
		{
			return false;
		}
	}

	/**
	 * Queued operation to happen when child views are updated.
	 */
	public static class UpdateOp
	{
		public static final int		ADD					= 0;
		public static final int		REMOVE				= 1;
		public static final int		UPDATE				= 2;
		static final int			POOL_SIZE			= 30;

		public int					cmd;
		public int					positionStart;
		public int					itemCount;
		public ArrayList<Integer>	mRemovePositions	= null;

		public UpdateOp(int cmd, int positionStart, int itemCount)
		{
			this.cmd = cmd;
			this.positionStart = positionStart;
			this.itemCount = itemCount;
		}
	}

	public UpdateOp obtainUpdateOp(int cmd, int positionStart, int itemCount)
	{
		UpdateOp op = mUpdateOpPool.acquire();
		if (op == null)
		{
			op = new UpdateOp(cmd, positionStart, itemCount);
		}
		else
		{
			op.cmd = cmd;
			op.positionStart = positionStart;
			op.itemCount = itemCount;
			op.mRemovePositions = null;
		}
		return op;
	}

	void recycleUpdateOp(UpdateOp op)
	{
		mUpdateOpPool.release(op);
	}

	public static class LayoutParams extends MarginLayoutParams
	{
		public ViewHolder		mViewHolder;
		protected final Rect	mDecorInsets	= new Rect();
		protected boolean		mInsetsDirty	= true;

		public LayoutParams(Context c, AttributeSet attrs)
		{
			super(c, attrs);
		}

		public LayoutParams(int width, int height)
		{
			super(width, height);
		}

		public LayoutParams(MarginLayoutParams source)
		{
			super(source);
		}

		public LayoutParams(ViewGroup.LayoutParams source)
		{
			super(source);
		}

		public LayoutParams(LayoutParams source)
		{
			super((ViewGroup.LayoutParams) source);
		}

		/**
		 * Returns true if the view this LayoutParams is attached to needs to
		 * have its content updated from the corresponding adapter.
		 *
		 * @return true if the view should have its content updated
		 */
		public boolean viewNeedsUpdate()
		{
			if (mViewHolder == null)
			{
				return false;
			}
			return mViewHolder.needsUpdate();
		}

		/**
		 * Returns true if the view this LayoutParams is attached to is now
		 * representing potentially invalid data. A LayoutManager should
		 * scrap/recycle it.
		 *
		 * @return true if the view is invalid
		 */
		public boolean isViewInvalid()
		{
			if (mViewHolder == null)
			{
				return false;
			}
			return mViewHolder.isInvalid();
		}

		/**
		 * Returns true if the adapter data item corresponding to the view this
		 * LayoutParams is attached to has been removed from the data set. A
		 * LayoutManager may choose to treat it differently in order to animate
		 * its outgoing or disappearing state.
		 *
		 * @return true if the item the view corresponds to was removed from the
		 *         data set
		 */
		public boolean isItemRemoved()
		{
			if (mViewHolder == null)
			{
				return true;
			}
			return mViewHolder.isRemoved();
		}

		/**
		 * Returns the position that the view this LayoutParams is attached to
		 * corresponds to.
		 *
		 * @return the adapter position this view was bound from
		 */
		public int getViewPosition()
		{
			if (mViewHolder == null)
			{
				return 0;
			}
			return mViewHolder.mPosition;
		}
	}

	/**
	 * Observer base class for watching changes to an {@link Adapter}. See
	 * {@link Adapter#registerAdapterDataObserver(AdapterDataObserver)}.
	 */
	public static abstract class AdapterDataObserver
	{
		public void onChanged()
		{
			// Do nothing
		}

		public void onItemRangeChanged(int positionStart, int itemCount)
		{
			// do nothing
		}

		//		public void onItemRangeChanged(int positionStart, int itemCount, Object payload)
		//		{
		//			// do nothing
		//		}

		public void onItemRangeInserted(int positionStart, int itemCount)
		{
			// do nothing
		}

		public void onItemRangeRemoved(int positionStart, int itemCount)
		{
			// do nothing
		}

		public void onItemsRemoved(ArrayList<Integer> removeItemPositions)
		{

		}
	}

	public static abstract class SmoothScroller
	{

		/* private */int				mTargetPosition	= RecyclerViewBase.NO_POSITION;

		/* private */RecyclerViewBase	mRecyclerView;

		/* private */LayoutManager		mLayoutManager;

		/* private */boolean			mPendingInitialRun;

		/* private */boolean			mRunning;

		/* private */View				mTargetView;

		/* private */final Action		mRecyclingAction;

		public SmoothScroller()
		{
			mRecyclingAction = new Action(0, 0);
		}

		void start(RecyclerViewBase recyclerView, LayoutManager layoutManager)
		{
			mRecyclerView = recyclerView;
			mLayoutManager = layoutManager;
			if (mTargetPosition == RecyclerViewBase.NO_POSITION)
			{
				throw new IllegalArgumentException("Invalid target position");
			}
			mRecyclerView.mState.mTargetPosition = mTargetPosition;
			mRunning = true;
			mPendingInitialRun = true;
			mTargetView = findViewByPosition(getTargetPosition());
			onStart();
			mRecyclerView.mViewFlinger.postOnAnimation();
		}

		public void setTargetPosition(int targetPosition)
		{
			mTargetPosition = targetPosition;
		}

		/**
		 * @return The LayoutManager to which this SmoothScroller is attached
		 */
		public LayoutManager getLayoutManager()
		{
			return mLayoutManager;
		}

		final protected void stop()
		{
			if (!mRunning)
			{
				return;
			}
			onStop();
			mRecyclerView.mState.mTargetPosition = RecyclerViewBase.NO_POSITION;
			mTargetView = null;
			mTargetPosition = RecyclerViewBase.NO_POSITION;
			mPendingInitialRun = false;
			mRunning = false;
			// trigger a cleanup
			mLayoutManager.onSmoothScrollerStopped(this);
			// clear references to avoid any potential leak by a custom smooth
			// scroller
			mLayoutManager = null;
			mRecyclerView = null;
		}

		/**
		 * Returns true if SmoothScroller has beens started but has not received
		 * the first animation callback yet.
		 *
		 * @return True if this SmoothScroller is waiting to start
		 */
		public boolean isPendingInitialRun()
		{
			return mPendingInitialRun;
		}

		/**
		 * @return True if SmoothScroller is currently active
		 */
		public boolean isRunning()
		{
			return mRunning;
		}

		public int getTargetPosition()
		{
			return mTargetPosition;
		}

		/* private */void onAnimation(int dx, int dy)
		{
			if (!mRunning || mTargetPosition == RecyclerViewBase.NO_POSITION)
			{
				stop();
			}
			mPendingInitialRun = false;
			if (mTargetView != null)
			{
				// verify target position
				if (getChildPosition(mTargetView) == mTargetPosition)
				{
					onTargetFound(mTargetView, mRecyclerView.mState, mRecyclingAction);
					mRecyclingAction.runInNecessary(mRecyclerView);
					stop();
				}
				else
				{
					// Log.e(TAG,
					// "Passed over target position while smooth scrolling.");
					mTargetView = null;
				}
			}
			if (mRunning)
			{
				onSeekTargetStep(dx, dy, mRecyclerView.mState, mRecyclingAction);
				mRecyclingAction.runInNecessary(mRecyclerView);
			}
		}

		public int getChildPosition(View view)
		{
			return mRecyclerView.getChildPosition(view);
		}

		public int getChildCount()
		{
			return mRecyclerView.getChildCount();
		}

		public View findViewByPosition(int position)
		{
			return mRecyclerView.mLayout.findViewByPosition(position);
		}

		public void instantScrollToPosition(int position)
		{
			mRecyclerView.scrollToPosition(position);
		}

		protected void onChildAttachedToWindow(View child)
		{
			if (getChildPosition(child) == getTargetPosition())
			{
				mTargetView = child;
				if (DEBUG)
				{
					//					Log.d(TAG, "smooth scroll target view has been attached");
				}
			}
		}

		/**
		 * Normalizes the vector.
		 *
		 * @param scrollVector The vector that points to the target scroll
		 *            position
		 */
		protected void normalize(PointF scrollVector)
		{
			final double magnitute = Math.sqrt(scrollVector.x * scrollVector.x + scrollVector.y * scrollVector.y);
			scrollVector.x /= magnitute;
			scrollVector.y /= magnitute;
		}

		/**
		 * Called when smooth scroll is started. This might be a good time to do
		 * setup.
		 */
		abstract protected void onStart();

		/**
		 * Called when smooth scroller is stopped. This is a good place to
		 * cleanup your state etc.
		 *
		 * @see #stop()
		 */
		abstract protected void onStop();

		/**
		 * <p>
		 * RecyclerView will call this method each time it scrolls until it can
		 * find the target position in the layout.
		 * </p>
		 * <p>
		 * SmoothScroller should check dx, dy and if scroll should be changed,
		 * updateStyle the provided {@link Action} to define the next scroll.
		 * </p>
		 *
		 * @param dx Last scroll amount horizontally
		 * @param dy Last scroll amount verticaully
		 * @param state Transient state of RecyclerView
		 * @param action If you want to trigger a new smooth scroll and cancel
		 *            the
		 *            previous one, updateStyle this object.
		 */
		abstract protected void onSeekTargetStep(int dx, int dy, State state, Action action);

		/**
		 * Called when the target position is laid out. This is the last
		 * callback SmoothScroller will receive and it should updateStyle the
		 * provided {@link Action} to define the scroll details towards the
		 * target view.
		 *
		 * @param targetView The view element which render the target position.
		 * @param state Transient state of RecyclerView
		 * @param action Action instance that you should updateStyle to define
		 *            final
		 *            scroll action towards the targetView
		 * @return An {@link Action} to finalize the smooth scrolling
		 */
		abstract protected void onTargetFound(View targetView, State state, Action action);

		/**
		 * Holds information about a smooth scroll request by a
		 * {@link SmoothScroller}.
		 */
		public static class Action
		{

			public static final int		UNDEFINED_DURATION	= Integer.MIN_VALUE;

			/* private */int			mDx;

			/* private */int			mDy;

			/* private */int			mDuration;

			/* private */Interpolator	mInterpolator;

			/* private */boolean		changed				= false;

			// we track this variable to inform custom implementer if they are
			// updating the action
			// in every animation callback
			/* private */int			consecutiveUpdates	= 0;

			/**
			 * @param dx Pixels to scroll horizontally
			 * @param dy Pixels to scroll vertically
			 */
			public Action(int dx, int dy)
			{
				this(dx, dy, UNDEFINED_DURATION, null);
			}

			/**
			 * @param dx Pixels to scroll horizontally
			 * @param dy Pixels to scroll vertically
			 * @param duration Duration of the animation in milliseconds
			 */
			public Action(int dx, int dy, int duration)
			{
				this(dx, dy, duration, null);
			}

			/**
			 * @param dx Pixels to scroll horizontally
			 * @param dy Pixels to scroll vertically
			 * @param duration Duration of the animation in milliseconds
			 * @param interpolator Interpolator to be used when calculating
			 *            scroll
			 *            position in each animation step
			 */
			public Action(int dx, int dy, int duration, Interpolator interpolator)
			{
				mDx = dx;
				mDy = dy;
				mDuration = duration;
				mInterpolator = interpolator;
			}

			/* private */void runInNecessary(RecyclerViewBase recyclerView)
			{
				if (changed)
				{
					validate();
					if (mInterpolator == null)
					{
						if (mDuration == UNDEFINED_DURATION)
						{
							recyclerView.mViewFlinger.smoothScrollBy(mDx, mDy, false);
						}
						else
						{
							recyclerView.mViewFlinger.smoothScrollBy(mDx, mDy, mDuration, false);
						}
					}
					else
					{
						recyclerView.mViewFlinger.smoothScrollBy(mDx, mDy, mDuration, mInterpolator, false);
					}
					consecutiveUpdates++;
					if (consecutiveUpdates > 10)
					{
						// A new action is being set in every animation step.
						// This looks like a bad
						// implementation. Inform developer.
						// Log.e(TAG,
						// "Smooth Scroll action is being updated too frequently. Make sure"
						// + " you are not changing it unless necessary");
					}
					changed = false;
				}
				else
				{
					consecutiveUpdates = 0;
				}
			}

			/* private */void validate()
			{
				if (mInterpolator != null && mDuration < 1)
				{
					throw new IllegalStateException("If you provide an interpolator, you must" + " set a positive duration");
				}
				else if (mDuration < 1)
				{
					throw new IllegalStateException("Scroll duration must be a positive number");
				}
			}

			public int getDx()
			{
				return mDx;
			}

			public void setDx(int dx)
			{
				changed = true;
				mDx = dx;
			}

			public int getDy()
			{
				return mDy;
			}

			public void setDy(int dy)
			{
				changed = true;
				mDy = dy;
			}

			public int getDuration()
			{
				return mDuration;
			}

			public void setDuration(int duration)
			{
				changed = true;
				mDuration = duration;
			}

			public Interpolator getInterpolator()
			{
				return mInterpolator;
			}

			/**
			 * Sets the interpolator to calculate scroll steps
			 *
			 * @param interpolator The interpolator to use. If you specify an
			 *            interpolator, you must also set the duration.
			 * @see #setDuration(int)
			 */
			public void setInterpolator(Interpolator interpolator)
			{
				changed = true;
				mInterpolator = interpolator;
			}

			/**
			 * Updates the action with given parameters.
			 *
			 * @param dx Pixels to scroll horizontally
			 * @param dy Pixels to scroll vertically
			 * @param duration Duration of the animation in milliseconds
			 * @param interpolator Interpolator to be used when calculating
			 *            scroll
			 *            position in each animation step
			 */
			public void update(int dx, int dy, int duration, Interpolator interpolator)
			{
				mDx = dx;
				mDy = dy;
				mDuration = duration;
				mInterpolator = interpolator;
				changed = true;
			}
		}
	}

	static class AdapterDataObservable extends Observable<AdapterDataObserver>
	{
		public boolean hasObservers()
		{
			return !mObservers.isEmpty();
		}

		public void notifyChanged()
		{
			// since onChanged() is implemented by the app, it could do
			// anything, including
			// removing itself from {@link mObservers} - and that could cause
			// problems if
			// an iterator is used on the ArrayList {@link mObservers}.
			// to avoid such problems, just march thru the list in the reverse
			// order.
			for (int i = mObservers.size() - 1; i >= 0; i--)
			{
				mObservers.get(i).onChanged();
			}
		}

		public void notifyItemRangeChanged(int positionStart, int itemCount)
		{
			// since onItemRangeChanged() is implemented by the app, it could do
			// anything, including
			// removing itself from {@link mObservers} - and that could cause
			// problems if
			// an iterator is used on the ArrayList {@link mObservers}.
			// to avoid such problems, just march thru the list in the reverse
			// order.
			for (int i = mObservers.size() - 1; i >= 0; i--)
			{
				mObservers.get(i).onItemRangeChanged(positionStart, itemCount);
			}
		}

		//		public void notifyItemRangeChanged(int positionStart, int itemCount, Object payload)
		//		{
		//			// since onItemRangeChanged() is implemented by the app, it could do
		//			// anything, including
		//			// removing itself from {@link mObservers} - and that could cause
		//			// problems if
		//			// an iterator is used on the ArrayList {@link mObservers}.
		//			// to avoid such problems, just march thru the list in the reverse
		//			// order.
		//			for (int i = mObservers.size() - 1; i >= 0; i--)
		//			{
		//				mObservers.get(i).onItemRangeChanged(positionStart, itemCount, payload);
		//			}
		//		}

		public void notifyItemRangeInserted(int positionStart, int itemCount)
		{
			// since onItemRangeInserted() is implemented by the app, it could
			// do anything,
			// including removing itself from {@link mObservers} - and that
			// could cause problems if
			// an iterator is used on the ArrayList {@link mObservers}.
			// to avoid such problems, just march thru the list in the reverse
			// order.
			for (int i = mObservers.size() - 1; i >= 0; i--)
			{
				mObservers.get(i).onItemRangeInserted(positionStart, itemCount);
			}
		}

		public void notifyItemRangeRemoved(int positionStart, int itemCount)
		{
			// since onItemRangeRemoved() is implemented by the app, it could do
			// anything, including
			// removing itself from {@link mObservers} - and that could cause
			// problems if
			// an iterator is used on the ArrayList {@link mObservers}.
			// to avoid such problems, just march thru the list in the reverse
			// order.
			for (int i = mObservers.size() - 1; i >= 0; i--)
			{
				mObservers.get(i).onItemRangeRemoved(positionStart, itemCount);
			}
		}

		public void notifyItemsRemoved(ArrayList<Integer> positions)
		{
			for (int i = mObservers.size() - 1; i >= 0; i--)
			{
				mObservers.get(i).onItemsRemoved(positions);
			}
		}
	}

	static class SavedState extends BaseSavedState
	{

		Parcelable mLayoutState;

		/**
		 * called by CREATOR
		 */
		SavedState(Parcel in)
		{
			super(in);
			mLayoutState = in.readParcelable(LayoutManager.class.getClassLoader());
		}

		/**
		 * Called by onSaveInstanceState
		 */
		SavedState(Parcelable superState)
		{
			super(superState);
		}

		@Override
		public void writeToParcel(Parcel dest, int flags)
		{
			super.writeToParcel(dest, flags);
			dest.writeParcelable(mLayoutState, 0);
		}

		/* private */void copyFrom(SavedState other)
		{
			mLayoutState = other.mLayoutState;
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

	/**
	 * <p>
	 * Contains useful information about the current RecyclerView state like
	 * target scroll position or view focus. State object can also keep
	 * arbitrary data, identified by resource ids.
	 * </p>
	 * <p>
	 * Often times, RecyclerView components will need to pass information
	 * between each other. To provide a well defined data bus between
	 * components, RecyclerView passes the same State object to component
	 * callbacks and these components can use it to exchange data.
	 * </p>
	 * <p>
	 * If you implement custom components, you can use State's put/get/remove
	 * methods to pass data between your components without needing to manage
	 * their lifecycles.
	 * </p>
	 */
	public static class State
	{

		/* private */int									mTargetPosition									= RecyclerViewBase.NO_POSITION;
		/* private */ArrayMap<ViewHolder, ItemHolderInfo>	mPreLayoutHolderMap								= new ArrayMap<ViewHolder, ItemHolderInfo>();
		/* private */ArrayMap<ViewHolder, ItemHolderInfo>	mPostLayoutHolderMap							= new ArrayMap<ViewHolder, ItemHolderInfo>();

		/* private */SparseArray<Object>					mData;
		public boolean										mDataChanged									= false;
		/**
		 * Number of items adapter has.
		 */
		public int											mItemCount										= 0;

		public int											mTotalHeight;
		/**
		 * Number of Header adapter has.
		 */
		public int											mHeaderCount									= 0;
		public boolean										overscroll										= true;
		/**
		 * Number of Footer adapter has.
		 */
		public int											mFooterCount									= 0;

		/**
		 * Number of items adapter had in the previous layout.
		 */
		/* private */int									mPreviousLayoutItemCount						= 0;

		/**
		 * Number of items that were NOT laid out but has been deleted from the
		 * adapter after the previous layout.
		 */
		/* private */int									mDeletedInvisibleItemCountSincePreviousLayout	= 0;

		/* private */boolean								mStructureChanged								= false;

		/* private */boolean								mInPreLayout									= false;

		public int											mHeaderCountInScreen							= 0;
		public int											mFooterCountInScreen							= 0;
		public int                      mCustomHeaderHeight               = 0;
		public int                      mCustomFooterHeight               = 0;
		public int                      mCustomHeaderWidth                = 0;
		public int                      mCustomFooterWidth                = 0;

		State reset()
		{
			mTargetPosition = RecyclerViewBase.NO_POSITION;
			if (mData != null)
			{
				mData.clear();
			}
			mItemCount = 0;
			mHeaderCount = 0;
			mFooterCount = 0;
			mStructureChanged = false;
			return this;
		}

		public boolean isPreLayout()
		{
			return mInPreLayout;
		}

		/**
		 * Removes the mapping from the specified id, if there was any.
		 *
		 * @param resourceId Id of the resource you want to remove. It is
		 *            suggested to
		 *            use R.id.* to preserve cross functionality and avoid
		 *            conflicts.
		 */
		public void remove(int resourceId)
		{
			if (mData == null)
			{
				return;
			}
			mData.remove(resourceId);
		}

		/**
		 * Gets the Object mapped from the specified id, or <code>null</code> if
		 * no such data exists.
		 *
		 * @param resourceId Id of the resource you want to remove. It is
		 *            suggested to
		 *            use R.id.* to preserve cross functionality and avoid
		 *            conflicts.
		 */
		public <T> T get(int resourceId)
		{
			if (mData == null)
			{
				return null;
			}
			return (T) mData.get(resourceId);
		}

		/**
		 * Adds a mapping from the specified id to the specified value,
		 * replacing the previous mapping from the specified key if there was
		 * one.
		 *
		 * @param resourceId Id of the resource you want to add. It is suggested
		 *            to use
		 *            R.id.* to preserve cross functionality and avoid
		 *            conflicts.
		 * @param data The data you want to associate with the resourceId.
		 */
		public void put(int resourceId, Object data)
		{
			if (mData == null)
			{
				mData = new SparseArray<Object>();
			}
			mData.put(resourceId, data);
		}

		public int getTargetScrollPosition()
		{
			return mTargetPosition;
		}

		/**
		 * Returns if current scroll has a target position.
		 *
		 * @return true if scroll is being triggered to make a certain position
		 *         visible
		 * @see #getTargetScrollPosition()
		 */
		public boolean hasTargetScrollPosition()
		{
			return mTargetPosition != RecyclerViewBase.NO_POSITION;
		}

		/**
		 * @return true if the structure of the data set has changed since the
		 *         last call to onLayoutChildren, false otherwise
		 */
		public boolean didStructureChange()
		{
			return mStructureChanged;
		}

		/**
		 * @return Total number of items to be laid out. Note that, this number
		 *         is not necessarily equal to the number of items in the
		 *         adapter, so you should always use this number for your
		 *         position calculations and never call adapter directly.
		 */
		public int getItemCount()
		{
			return mInPreLayout ? (mPreviousLayoutItemCount - mDeletedInvisibleItemCountSincePreviousLayout) : mItemCount;
		}
	}


	/**
	 * Internal data structure that holds information about an item's bounds.
	 * This information is used in calculating item animations.
	 */
	public static class ItemHolderInfo
	{
		public ViewHolder	holder;
		public int			left, top;

		ItemHolderInfo(ViewHolder holder, int left, int top, int right, int bottom, int position)
		{
			this.holder = holder;
			this.left = left;
			this.top = top;
		}
	}

	public void setRecyclerViewTouchEnabled(boolean enabled)
	{
		mAnimatingBlockTouch = !enabled || forceBlockTouch;
        if (blockTouchListener != null) {
            blockTouchListener.onRecyclerViewTouchEnabled(!mAnimatingBlockTouch);
        }
	}

    public void setBlockTouchListener(IBlockTouchListener blockTouchListener) {
        this.blockTouchListener = blockTouchListener;
    }

	protected void enter(int pos)
	{
		mEnterPos = pos;
		mEnterCalled = true;
		if (mExitCalled && mEnterPos != mExitPos)
		{
			int smaller = mEnterPos > mExitPos ? mExitPos : mEnterPos;
			int bigger = mEnterPos + mExitPos - smaller;
			mExchangeFromBigger = bigger == mExitPos;
			mEnterCalled = false;
			mExitCalled = false;
		}
	}

	protected void exit(int pos)
	{
		mExitPos = pos;
		mExitCalled = true;
		if (mEnterCalled && mEnterPos != mExitPos)
		{
			int smaller = mEnterPos > mExitPos ? mExitPos : mEnterPos;
			int bigger = mEnterPos + mExitPos - smaller;
			mExchangeFromBigger = bigger == mExitPos;
			mEnterCalled = false;
			mExitCalled = false;
		}
	}

	protected boolean dirtyInRange(int start, int end)
	{
		int first = getFirstVisibleItemPos();
		if (first == -1)
		{
			return true;
		}
		start -= first;
		end -= first;

		int smaller = start >= end ? end : start;
		int bigger = start + end - smaller;
		// Log.d(TAG, "dirtyInRange" + "start=" + smaller + ",end=" + bigger);
		for (int i = smaller; i <= bigger; i++)
		{
			RecyclerViewItem item = (RecyclerViewItem) getChildAtInItem(i);
			if (item != null && item.mHolder != null)
			{
				if (item.mHolder.mPosDirty)
				{
					// Log.d(TAG, "dirtyInRange" + "result=" + true + "pos=" +
					// item.mHolder.mDraggedPosition);
					return true;
				}
			}
		}
		// Log.d(TAG, "dirtyInRange" + "result=" + false);
		return false;
	}

	public int getFirstVisibleItemPos()
	{
		for (int i = 0; i < getChildCountInItem(); i++)
		{
			View item = getChildAtInItem(i);
			if (item instanceof RecyclerViewItem)
			{
				return ((RecyclerViewItem) item).mHolder.mPosition;
			}
		}
		return -1;
	}

	/* private */int getFirstVisibleItemPosWithHeader()
	{
		for (int i = 0; i < getChildCount(); i++)
		{
			View item = getChildAt(i);
			if (item instanceof RecyclerViewItem)
			{
				return ((RecyclerViewItem) item).mHolder.mPosition;
			}
		}
		return Integer.MAX_VALUE;


	}

	public View findViewByPosition(int position)
	{
		if (mLayout != null)
		{
			return mLayout.findViewByPosition(position);
		}
		return null;
	}

	protected boolean isTransformedTouchPointInView(float x, float y, RecyclerViewItem child, PointF outLocalPoint)
	{
		float localX = x - getScrollX() - child.getLeft();
		float localY = y - getScrollY() - child.getTop();
		final boolean isInView = child.isPointInView(localX, localY);
		if (isInView && outLocalPoint != null)
		{
			outLocalPoint.set(localX, localY);
		}
		return isInView;
	}

	protected boolean	isAutoScrolling			= false;
	protected boolean	mHorizontalCanScroll	= true;
	protected boolean	mVerticalCanScroll		= true;
	protected boolean	mUpOverScrollEnabled;
	protected boolean	mDownOverScrollEnabled;

	public class AutoScrollRunnable implements Runnable
	{

		public int		dir	= DIRECTION_UP;
		public boolean	cancel;

		//public int		mY	= 4;


		public void cancelPost(boolean cancled)
		{
			cancel = cancled;
		}

		@Override
		public void run()
		{
			boolean canOverScroll = dir > 0 ? mDownOverScrollEnabled : mUpOverScrollEnabled;
			setOverScrollEnabled(false);
			scrollBy(0, getAutoScrollVelocity() * dir);
			if (!cancel)
			{
				postDelayed(this, 16);
			}
			setOverScrollEnabled(canOverScroll);
		}
	}

	//	@Override
	//	public void removeOnScrollFinishListener()
	//	{
	//		mViewFlinger.mScrollFinishListener = null;
	//		mViewFlinger.mTargetPosition = Integer.MAX_VALUE;
	//
	//	}

	public void scrollToTop(OnScrollFinishListener listener)
	{
		if (mLayout.canScrollHorizontally())
		{
			smoothScrollBy(-mOffsetX + mState.mCustomHeaderWidth, 0, false, true);
			mViewFlinger.mScrollFinishListener = listener;
			mViewFlinger.mTargetPosition = -mOffsetX + mState.mCustomHeaderWidth;
		}
		else
		{
			smoothScrollBy(0, -mOffsetY + mState.mCustomHeaderHeight, false, true);
			mViewFlinger.mScrollFinishListener = listener;
			mViewFlinger.mTargetPosition = -mOffsetY + mState.mCustomHeaderHeight;
		}
	}

	public void scrollToTopAtOnce()
	{
		if (mAdapter == null)
		{
			return;
		}
		int[] target = mAdapter.getBeginPositionWithOffset(0);
		scrollToPosition(target[0], target[1]);
	}

	protected void refreshCachedViews()
	{
		traversal(TRAVERSAL_PURPOSE_MODECHANGE);
	}

	public boolean isScrolling()
	{
		return mScrollState == SCROLL_STATE_DRAGGING || mScrollState == SCROLL_STATE_SETTLING;
	}

	public int getHeightBefore(int pos)
	{
		return 0;
	}

	protected boolean canTranversal(int purpose, ViewHolder holder)
	{
		return true;
	}

	public void traversal(int tracersalPurpose)
	{
		int count = getChildCount();
		if (tracersalPurpose != TRAVERSAL_PURPOSE_MODECHANGE)
		{
			if (count > 0)
			{
				for (int i = 0; i < count; i++)
				{
					View child = getChildAt(i);
					ViewHolder holder = getChildViewHolderInt(child);
					if (holder != null)
					{
						if (canTranversal(tracersalPurpose, holder))
						{
							holder.inTraversals(tracersalPurpose);
						}
						//						if (tracersalPurpose == TRAVERSAL_PURPOSE_SWITBACKGROUND)
						//						{
						//							if (holder.itemView instanceof QBViewInterface && holder.mContentHolder != null)
						//							{
						//								if (!holder.mContentHolder.mUseCustomCardType)
						//								{
						//									((QBViewInterface) holder.itemView).getQBViewResourceManager()
						//											.setCardBackground(mAdapter.getCardItemViewType(holder.mPosition));
						//								}
						//							}
						//						}
						//						else
						//						{
						//							if (canTranversal(tracersalPurpose, holder))
						//							{
						//								holder.inTraversals(tracersalPurpose);
						//							}
						//						}
					}
				}
			}
		}

		final int attachedScrap = mRecycler.mAttachedScrap.size();
		for (int i = 0; i < attachedScrap; i++)
		{
			final ViewHolder holder = mRecycler.mAttachedScrap.get(i);
			if (holder != null)
			{
				if (canTranversal(tracersalPurpose, holder))
				{
					holder.inTraversals(tracersalPurpose);
				}
			}
		}

		final int cacheSize = mRecycler.mCachedViews.size();
		for (int i = 0; i < cacheSize; i++)
		{
			final ViewHolder holder = mRecycler.mCachedViews.get(i);
			if (holder != null)
			{
				if (canTranversal(tracersalPurpose, holder))
				{
					holder.inTraversals(tracersalPurpose);
				}
			}
		}

		final int unmodifiableAttachedScrapScrap = mRecycler.mUnmodifiableAttachedScrap.size();
		for (int i = 0; i < unmodifiableAttachedScrapScrap; i++)
		{
			final ViewHolder holder = mRecycler.mUnmodifiableAttachedScrap.get(i);
			if (holder != null)
			{
				if (canTranversal(tracersalPurpose, holder))
				{
					holder.inTraversals(tracersalPurpose);
				}
			}
		}

		// if (tracersalPurpose == TRAVERSAL_PURPOSE_SWITCHSKIN)
		// {
		final int scrapSize = getRecycledViewPool().mScrap.size();
		for (int i = 0; i < scrapSize; i++)
		{
			ArrayList<ViewHolder> scrapHeap = getRecycledViewPool().mScrap.valueAt(i);
			if (scrapHeap != null)
			{
				final int scrapHeapSize = scrapHeap.size();
				for (int j = 0; j < scrapHeapSize; j++)
				{
					ViewHolder holder = scrapHeap.get(j);
					if (holder != null)
					{
						holder.inTraversals(tracersalPurpose);
					}
				}
			}
		}
		// }
	}

	public void setOverScrollEnabled(boolean enable)
	{
		mUpOverScrollEnabled = enable;
		mDownOverScrollEnabled = enable;
	}

	public boolean getOverScrollEnabled()
	{
		return mUpOverScrollEnabled;
	}

	public void setHasSuspentedItem(boolean has)
	{
		mHasSuspentedItem = has;
	}

	public boolean hasSuspentedItem()
	{
		return mHasSuspentedItem;
	}

	public void setRepeatableSuspensionMode(boolean use)
	{
		mUseRepeatableSuspensionMode = use;
	}

	public boolean isRepeatableSuspensionMode()
	{
		return mUseRepeatableSuspensionMode;
	}

	public void scrollToPositionWithOffset(int pos, int offset)
	{
		if (mLayout != null)
		{
			mLayout.scrollToPositionWithOffset(pos, offset);
		}
	}

	// TODO: vertical & horizontal 可滚动
	//	@Override
	//	public boolean verticalCanScroll(int direction)
	//	{
	//		if (mLayout != null)
	//		{
	//			return mVerticalCanScroll && mLayout.canScrollVertically();
	//		}
	//		return false;
	//	}
	//
	//	@Override
	//	public boolean horizontalCanScroll(int direction)
	//	{
	//		if (mLayout != null)
	//		{
	//			return mHorizontalCanScroll && mLayout.canScrollHorizontally();
	//		}
	//		return false;
	//	}

	public boolean isInOverScrollArea()
	{
		if (mLayout != null && mLayout.canScrollHorizontally()) //list横向滑动
		{
			return mOffsetX > mState.mTotalHeight - getWidth() || mOffsetX < 0;
		}
		return mOffsetY > mState.mTotalHeight - getHeight() || mOffsetY < 0; //list纵向滑动
	}

	public int validateAnchorItemPosition(int anchorItemPosition)
	{
		if (mAdapter == null)
		{
			return anchorItemPosition;
		}
		int headerCount = mAdapter.getHeaderViewCount();
		// TODO: GRID调用
		//		if (mLayoutType == LAYOUT_TYPE_GRID && mLayout instanceof GridLayoutManager)
		//		{
		//			int column = ((GridLayoutManager) mLayout).mColumns;
		//			if (anchorItemPosition >= 0 && (anchorItemPosition) % column != 0)
		//			{
		//				anchorItemPosition -= (anchorItemPosition) % column;
		//			}
		//		}
		int footerCount = mAdapter.getFooterViewCount();
		int min = -headerCount;
		if (anchorItemPosition < 0 && mAdapter.headerMayChange())
		{
			return min;
		}
		int itemcount = mAdapter.getItemCount();
		int max = footerCount + itemcount;
		if (anchorItemPosition >= max || anchorItemPosition <= min)
		{
			return min;
		}
		else
		{
			return anchorItemPosition;
		}
	}

	public int getCachedTotalHeight()
	{
		return mState.mTotalHeight;
	}

	public int findPrevSuspentedPos(int pos)
	{
		return -1;
	}

	public int findNextSuspentedPos(int pos)
	{
		return -1;
	}

	public boolean isRefreshing()
	{
		return false;
	}

	public void setCanScroll(boolean horizontal, boolean vertical)
	{
		mHorizontalCanScroll = horizontal;
		mVerticalCanScroll = vertical;
	}

	//	@Override
	//	public void removeCallbacksDelegate(Runnable runnable)
	//	{
	//		removeCallbacks(runnable);
	//	}
	//
	//	@Override
	//	public void postDelayedDelegate(Runnable runnable, long l)
	//	{
	//		postDelayed(runnable, l);
	//	}

	public void setOverScrollEnabled(boolean up, boolean down)
	{
		mUpOverScrollEnabled = up;
		mDownOverScrollEnabled = down;
	}

	public boolean onStartScroll(int dy)
	{
		return true;
	}

	public boolean hasNoItem()
	{
		return mAdapter != null && mAdapter.getItemCount() == 0 && mAdapter.getFooterViewCount() == 0 && mAdapter.getHeaderViewCount() == 0;
	}

	public void setEnableRecyclerViewTouchEventListener(boolean enableTouchEventListner)
	{
		mEnableRecyclerViewTouchListener = enableTouchEventListner;
	}

	public void notifyRecyclerViewTouchEvent(MotionEvent event)
	{

	}

	public void setPrebindItem(boolean prebind)
	{
		this.mShouldPrebindItem = prebind;
	}

	public boolean shouldPrebindItem()
	{
		return this.mShouldPrebindItem;
	}

	protected void handleCustomClickEvent(MotionEvent event)
	{

	}

	protected boolean needAdvancedStopDetachChildView()
	{
		return false;
	}

	public ViewHolder createViewHolder(View itemView, RecyclerViewBase rv)
	{
		return null;
	}

	public void onItemsFill(int offset)
	{

	}

	public void checkNotifyFooterAppearWithFewChild(int endOffset)
	{

	}

	public void handleInTraversal(int traversalPurpose, int position, View contentView)
	{

	}

	protected boolean isTouchStopWhenFastFling()
	{
		return true;
	}
}
