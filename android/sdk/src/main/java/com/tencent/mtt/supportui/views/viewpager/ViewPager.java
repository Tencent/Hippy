package com.tencent.mtt.supportui.views.viewpager;

import com.tencent.mtt.hippy.utils.LogUtils;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

import com.tencent.mtt.supportui.utils.ViewCompatTool;
import com.tencent.mtt.supportui.views.ScrollChecker;

import android.content.Context;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.content.res.TypedArray;
import android.database.DataSetObserver;
import android.graphics.Canvas;
import android.graphics.Rect;
import android.graphics.drawable.Drawable;
import android.os.Parcel;
import android.os.Parcelable;
import android.os.SystemClock;
import android.util.AttributeSet;
import android.util.Log;
import android.view.FocusFinder;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.MotionEvent;
import android.view.SoundEffectConstants;
import android.view.VelocityTracker;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.ViewTreeObserver.OnPreDrawListener;
import android.view.accessibility.AccessibilityEvent;
import android.view.animation.Interpolator;
import android.widget.Scroller;

/**
 * Created by leonardgong on 2018/4/19 0007.
 */

public class ViewPager extends ViewGroup implements ScrollChecker.IScrollCheck
{
	/* private */static final String	TAG							= "ViewPager";
	/* private */static final boolean	DEBUG						= false;

	/* private */static final int		DEFAULT_OFFSCREEN_PAGES		= 1;
	/* private */static final int		MAX_SETTLE_DURATION			= 600;
	// ms
	/* private */static final int		MIN_DISTANCE_FOR_FLING		= 25;											// dips

	/* private */static final int		DEFAULT_GUTTER_SIZE			= 25;											// dips

	/* private */static final int		MIN_FLING_VELOCITY			= 400;											// dips

	/* private */static final int[]		LAYOUT_ATTRS				= new int[] { android.R.attr.layout_gravity };

	/**
	 * Used to track what the expected number of items in the adapter should be.
	 * If the app changes this when we don't expect it, we'll throw a big
	 * obnoxious exception.
	 */
	/* private */ int					mExpectedAdapterCount;

	private boolean						mDisallowInterceptWhenDrag	= true;
	private float						mMinOffset					= Float.MIN_VALUE;
	private float						mMaxOffset					= Float.MAX_VALUE;
	private boolean						mConsumeNextTouchDown;
	private int							mMinPage					= Integer.MIN_VALUE;
	private int							mMaxPage					= Integer.MAX_VALUE;
	private int							mAutoScrollCustomDuration	= -1;
	//TODO 变量后面版本再清除,继承在不同git工程不同分支再用。
	protected boolean					mNeedRepopulate				= false;

	public boolean isGallery()
	{
		return mAdapter == null;
	}

	public void onTabPressed(int id)
	{
		if (mSelectedListener != null)
		{
			mSelectedListener.onPageSelected(true, id);
		}
	}


	static class ItemInfo
	{
		Object	object;
		int		position;
		boolean	scrolling;
		float	sizeFactor;
		float	offset;

		public String toString()
		{
			return "position=" + position + ",scrolling=" + scrolling + ",sizeFactor=" + sizeFactor + ",offset=" + offset;

		}
	}

	/* private */static final Comparator<ItemInfo>		COMPARATOR						= new Comparator<ItemInfo>()
																						{
																							@Override
																							public int compare(ItemInfo lhs, ItemInfo rhs)
																							{
																								return lhs.position - rhs.position;
																							}
																						};

	/* private */static final Interpolator				sInterpolator					= new Interpolator()
																						{
																							public float getInterpolation(float t)
																							{
																								t -= 1.0f;
																								return t * t * t * t * t + 1.0f;
																							}
																						};

	/* private */final ArrayList<ItemInfo>				mItems							= new ArrayList<ItemInfo>();
	/* private */final ItemInfo							mTempItem						= new ItemInfo();

	/* private */final Rect								mTempRect						= new Rect();

	/* private */ ViewPagerAdapter						mAdapter;
	/* private */ int									mCurItem;
	/* private */ int									mLastItem                       = INVALID_SCREEN;
	// Index
	// of
	// currently
	// displayed
	// page.
	/* private */ int									mRestoredCurItem				= -1;
	/* private */ Parcelable							mRestoredAdapterState			= null;
	/* private */ ClassLoader							mRestoredClassLoader			= null;
	protected Scroller									mScroller;
	/* private */ PagerObserver							mObserver;
	/* private */ int									mPageMargin;
	/* private */ Drawable								mMarginDrawable;
	/* private */ int									mTopPageBounds;
	/* private */ int									mBottomPageBounds;
	/* private */ boolean								mScrollEnabled					= true;
	boolean												mForceUnableToDrag				= false;
	// Offsets of the first and last items, if known.
	// Set during population, used to determine if we are at the beginning
	// or end of the pager data set during touch scrolling.
	/* private */ float									mFirstOffset					= -Float.MAX_VALUE;
	/* private */ float									mLastOffset						= Float.MAX_VALUE;

	/* private */ int									mChildWidthMeasureSpec;
	/* private */ int									mChildHeightMeasureSpec;
	/* private */ boolean								mInLayout;

	/* private */ boolean								mScrollingCacheEnabled;

	protected boolean									mPopulatePending;
	/* private */ int									mOffscreenPageLimit				= DEFAULT_OFFSCREEN_PAGES;

	/* private */ boolean								mIsBeingDragged;
	public/* private */ boolean							mIsUnableToDrag;
	/* private */ int									mDefaultGutterSize;
	/* private */ int									mGutterSize;
	protected int										mTouchSlop;
	/**
	 * Position of the last motion event.
	 */
	protected float										mLastMotionX;
	protected float										mLastMotionY;
	/* private */ float									mInitialMotionX;
	/* private */ float									mInitialMotionY;
	/**
	 * ID of the active pointer. This is used to retain consistency during
	 * drags/flings if multiple pointers are used.
	 */
	/* private */ int									mActivePointerId				= INVALID_POINTER;
	/**
	 * Sentinel value for no current active pointer.
	 * Used by {@link #mActivePointerId}.
	 */
	/* private */static final int						INVALID_POINTER					= -1;

	/**
	 * Determines speed during touch scrolling
	 */
	/* private */ VelocityTracker						mVelocityTracker;
	protected int										mMinimumVelocity;
	protected int										mMaximumVelocity;
	protected int										mFlingDistance;
	/* private */ int									mCloseEnough;

	// If the pager is at least this close to its final position, complete the
	// scroll
	// on touch down and let the user interact with the content inside instead
	// of
	// "catching" the flinging pager.
	/* private */static final int						CLOSE_ENOUGH					= 2;												// dp

	/* private */ boolean								mFakeDragging;
	/* private */ long									mFakeDragBeginTime;

	// /*private*/ EdgeEffectCompat mLeftEdge;
	// /*private*/ EdgeEffectCompat mRightEdge;

	/* private */ boolean								mFirstLayout					= true;
	boolean												mCallPageChangedOnFirstLayout	= false;
	/* private */ boolean								mCalledSuper;
	/* private */ int									mDecorChildCount;

	/* private */ OnPageChangeListener					mOnPageChangeListener;
	/* private */ OnPageChangeListener					mInternalPageChangeListener;
	/* private */ OnAdapterChangeListener				mAdapterChangeListener;
	/* private */ PageTransformer						mPageTransformer;
	/* private */ Method								mSetChildrenDrawingOrderEnabled;

	/* private */static final int						DRAW_ORDER_DEFAULT				= 0;
	/* private */static final int						DRAW_ORDER_FORWARD				= 1;
	/* private */static final int						DRAW_ORDER_REVERSE				= 2;
	/* private */ int									mDrawingOrder;
	/* private */ ArrayList<View>						mDrawingOrderedChildren;
	/* private */static final ViewPositionComparator	sPositionComparator				= new ViewPositionComparator();
	/**
	 * Indicates that the pager is in an idle, settled state. The current page
	 * is fully in view and no animation is in progress.
	 */
	public static final int								SCROLL_STATE_IDLE				= 0;

	/**
	 * Indicates that the pager is currently being dragged by the user.
	 */
	public static final int								SCROLL_STATE_DRAGGING			= 1;

	/**
	 * Indicates that the pager is in the process of settling to a final
	 * position.
	 */
	public static final int								SCROLL_STATE_SETTLING			= 2;
	/* private */static final int						SNAP_VELOCITY					= 600;
	/* private */static final int						GALLERY_SCROLL_DURING			= 500;
	/* private */static final float						FLING_VELOCITY_INFLUENCE		= 0.4f;
	/* private */static final float						BASELINE_FLING_VELOCITY			= 2500.f;
	/* private */static final int						INVALID_SCREEN					= -1;

	/* private */final Runnable							mEndScrollRunnable				= new Runnable()
																						{
																							public void run()
																							{
																								setScrollState(SCROLL_STATE_IDLE);
																								populate();
																							}
																						};

	protected int										mScrollState					= SCROLL_STATE_IDLE;
	/* private */ boolean								mLeftDragOutSizeEnable			= true;
	/* private */ boolean								mRightDragOutSizeEnable			= true;
	QBGalleryGlideBlankListener							mLeftGlideBlankListener;
	QBGalleryGlideBlankListener							mRightGlideBlankListener;
	public int											mCurrentScreen;
	/* private */ int									mNextScreen						= INVALID_SCREEN;
	/* private */ int									mPageCount;
	/* private */ boolean								mScrollToNeedNotify;
	Interpolator										mCustomInterplater				= null;

	public void setLeftDragOutSizeEnabled(boolean enabled)
	{
		mLeftDragOutSizeEnable = enabled;
	}

	public void setRightDragOutSizeEnabled(boolean enabled)
	{
		mRightDragOutSizeEnable = enabled;
	}

	/**
	 * 目前不考虑gallery
	 */
	private boolean mIsVertical = false;

	/**
	 * Callback interface for responding to changing state of the selected page.
	 */
	public interface QBGalleryGlideBlankListener
	{

		boolean onGlideBlank(boolean left);

	}

	public void setLeftGlideBlankListener(QBGalleryGlideBlankListener listener)
	{
		mLeftGlideBlankListener = listener;
	}

	public void setRightGlideBlankListener(QBGalleryGlideBlankListener listener)
	{
		mRightGlideBlankListener = listener;
	}

	public interface OnPageChangeListener
	{

		/**
		 * This method will be invoked when the current page is scrolled, either
		 * as part
		 * of a programmatically initiated smooth scroll or a user initiated
		 * touch scroll.
		 *
		 * @param position Position index of the first page currently being
		 *            displayed.
		 *            Page position+1 will be visible if positionOffset is
		 *            nonzero.
		 * @param positionOffset Value from [0, 1) indicating the offset from
		 *            the page at position.
		 * @param positionOffsetPixels Value in pixels indicating the offset
		 *            from position.
		 */
		void onPageScrolled(int position, float positionOffset, int positionOffsetPixels);

		/**
		 * This method will be invoked when a new page becomes selected.
		 * Animation is not
		 * necessarily complete.
		 *
		 * @param position Position index of the new selected page.
		 */
		void onPageSelected(int position);

		/**
		 * Called when the scroll state changes. Useful for discovering when the
		 * user
		 * begins dragging, when the pager is automatically settling to the
		 * current page,
		 * or when it is fully stopped/idle.
		 *
		 * @param state The new scroll state.
		 * @see ViewPager#SCROLL_STATE_IDLE
		 * @see ViewPager#SCROLL_STATE_DRAGGING
		 * @see ViewPager#SCROLL_STATE_SETTLING
		 */
		void onPageScrollStateChanged(int oldState, int state);
	}

	public interface PageSelectedListener
	{
		void onPageSelected(boolean programmed, int newIndex);
	}

	private PageSelectedListener	mSelectedListener;
	private boolean					mCacheEnabled	= false;

	public void setPageSelectedListener(PageSelectedListener listener)
	{
		mSelectedListener = listener;
	}

	public PageSelectedListener getPageSelectedListener()
	{
		return mSelectedListener;
	}

	/**
	 * Simple implementation of the {@link OnPageChangeListener} interface with
	 * stub
	 * implementations of each method. Extend this if you do not intend to
	 * override
	 * every method of {@link OnPageChangeListener}.
	 */
	public static class SimpleOnPageChangeListener implements OnPageChangeListener
	{
		@Override
		public void onPageScrolled(int position, float positionOffset, int positionOffsetPixels)
		{
			// This space for rent
		}

		@Override
		public void onPageSelected(int position)
		{
			// This space for rent
		}

		@Override
		public void onPageScrollStateChanged(int oldState, int state)
		{
			// This space for rent
		}
	}

	/**
	 * A PageTransformer is invoked whenever a visible/attached page is
	 * scrolled.
	 * This offers an opportunity for the application to apply a custom
	 * transformation
	 * to the page views using animation properties.
	 * <p/>
	 * <p>
	 * As property animation is only supported as of Android 3.0 and forward,
	 * setting a PageTransformer on a QBViewPager on earlier platform versions
	 * will be ignored.
	 * </p>
	 */
	public interface PageTransformer
	{
		/**
		 * Apply a property transformation to the given page.
		 *
		 * @param page Apply the transformation to this page
		 * @param position Position of page relative to the current
		 *            front-and-center
		 *            position of the pager. 0 is front and center. 1 is one
		 *            full
		 *            page position to the right, and -1 is one page position to
		 *            the left.
		 */
		void transformPage(View page, float position);
	}

	/**
	 * Used internally to monitor when adapters are switched.
	 */
	public interface OnAdapterChangeListener
	{
		void onAdapterChanged(ViewPagerAdapter oldAdapter, ViewPagerAdapter newAdapter);
	}

	/**
	 * Used internally to tag special types of child views that should be added
	 * as
	 * pager decorations by default.
	 */
	interface Decor
	{
	}

	public ViewPager(Context context)
	{
		this(context, false);
	}

	public ViewPager(Context context, Interpolator interpolator)
	{
		this(context, false);
		mCustomInterplater = interpolator;
		initViewPager();
	}

	public ViewPager(Context context, boolean isVertical)
	{
		super(context);
		mIsVertical = isVertical;
		initViewPager();
	}

	public ViewPager(Context context, AttributeSet attrs)
	{
		super(context);
		initViewPager();
	}

//	public void enableDefaultPageTransformer(boolean enable)
//	{
//		if (!enable)
//		{
//			setPageTransformer(null);
//		}
//	}

	protected void initViewPager()
	{
		setWillNotDraw(false);
		ViewCompatTool.setDefaultLayotuDirection(this);
		setDescendantFocusability(FOCUS_AFTER_DESCENDANTS);
		final Context context = getContext();
		if (mCustomInterplater != null)
		{
			mScroller = new Scroller(context, mCustomInterplater);
		}
		else
		{
			mScroller = new Scroller(context, sInterpolator);
		}
		final ViewConfiguration configuration = ViewConfiguration.get(context);
		final float density = context.getResources().getDisplayMetrics().density;

		// mTouchSlop = configuration.getTouchSlop();
		mTouchSlop = configuration.getScaledTouchSlop();
		// mTouchSlop=10;
		mMinimumVelocity = (int) (MIN_FLING_VELOCITY * density);
		mMaximumVelocity = configuration.getScaledMaximumFlingVelocity();
		// mLeftEdge = new EdgeEffectCompat(context);
		// mRightEdge = new EdgeEffectCompat(context);

		mFlingDistance = (int) (MIN_DISTANCE_FOR_FLING * density);
		mCloseEnough = (int) (CLOSE_ENOUGH * density);
		mDefaultGutterSize = (int) (DEFAULT_GUTTER_SIZE * density);
		//mPageTransformer = new DefaultPageTransformer();
		getViewTreeObserver().addOnPreDrawListener(new OnPreDrawListener()
		{
			@Override
			public boolean onPreDraw()
			{
				post(new Runnable()
				{
					@Override
					public void run()
					{
						// TODO Auto-generated method stub
						if (mOnPageReadyListener != null)
						{
//							Log.d("leo", "mCurrPage=" + mCurrentScreen);
							mOnPageReadyListener.onPageReady(isGallery() ? mCurrentScreen : mCurItem);
						}
					}
				});
				getViewTreeObserver().removeOnPreDrawListener(this);
				return true;
			}
		});
	}


	@Override
	protected void onDetachedFromWindow()
	{
		removeCallbacks(mEndScrollRunnable);
		super.onDetachedFromWindow();
	}

	protected/* private */void setScrollState(int newState)
	{
		if (mScrollState == newState)
		{
			return;
		}
		if (DEBUG)
		{
//			Log.d("leo", "scroll state from" + mScrollState + "change to" + newState);
		}
		if (mPageTransformer != null)
		{
			// PageTransformers can do complex things that benefit from hardware
			// layers.
			// enableLayers(newState != SCROLL_STATE_IDLE);
		}

		if (newState == SCROLL_STATE_DRAGGING)
		{
			if (mNextScreen != INVALID_SCREEN && isGallery())
			{
				mNextScreen = INVALID_SCREEN;
			}
		}
		notifyScrollStateChanged(mScrollState, newState);
		if (newState == SCROLL_STATE_IDLE)
		{
			mMinOffset = Float.MIN_VALUE;
			mMaxOffset = Float.MAX_VALUE;
			mMinPage = Integer.MIN_VALUE;
			mMaxPage = Integer.MAX_VALUE;
		}

		if (newState == SCROLL_STATE_IDLE) {
			mLastItem = mCurItem;
		}

		mScrollState = newState;
	}

	protected void notifyScrollStateChanged(int oldState, int newState)
	{
		if (mOnPageChangeListener != null)
		{
			mOnPageChangeListener.onPageScrollStateChanged(oldState, newState);
		}
		if (mInternalPageChangeListener != null)
		{
			mInternalPageChangeListener.onPageScrollStateChanged(oldState, newState);
		}
	}

	/**
	 * Set a QBPagerAdapter that will supply views for this pager as needed.
	 *
	 * @param adapter Adapter to use
	 */
	public void setAdapter(ViewPagerAdapter adapter)
	{
		if (mAdapter != null)
		{
			mAdapter.unregisterDataSetObserver(mObserver);
			mAdapter.startUpdate(this, mCurItem);
			for (int i = 0; i < mItems.size(); i++)
			{
				final ItemInfo ii = mItems.get(i);
				mAdapter.destroyItem(this, ii.position, ii.object);
			}
			mAdapter.finishUpdate(this);
			mItems.clear();
			removeNonDecorViews();
			mCurItem = 0;
			scrollTo(0, 0);
		}

		final ViewPagerAdapter oldAdapter = mAdapter;
		mAdapter = adapter;
		mExpectedAdapterCount = 0;

		if (mAdapter != null)
		{
			if (mObserver == null)
			{
				mObserver = new PagerObserver();
			}
			mAdapter.registerDataSetObserver(mObserver);
			mPopulatePending = false;
			final boolean wasFirstLayout = mFirstLayout;
			mFirstLayout = true;
			mExpectedAdapterCount = mAdapter.getCount();
			if (mRestoredCurItem >= 0)
			{
				mAdapter.restoreState(mRestoredAdapterState, mRestoredClassLoader);
				setCurrentItemInternal(mRestoredCurItem, false, true);
				mRestoredCurItem = -1;
				mRestoredAdapterState = null;
				mRestoredClassLoader = null;
			}
			else if (!wasFirstLayout)
			{
				populate();
			}
			else
			{
				requestLayout();
			}
		}

		if (mAdapterChangeListener != null && oldAdapter != adapter)
		{
			mAdapterChangeListener.onAdapterChanged(oldAdapter, adapter);
		}
	}

	/* private */void removeNonDecorViews()
	{
		for (int i = 0; i < getChildCount(); i++)
		{
			final View child = getChildAt(i);
			final LayoutParams lp = (LayoutParams) child.getLayoutParams();
			if (!lp.isDecor)
			{
				removeViewAt(i);
				i--;
			}
		}
	}

	/**
	 * Retrieve the current adapter supplying pages.
	 *
	 * @return The currently registered QBPagerAdapter
	 */
	public ViewPagerAdapter getAdapter()
	{
		return mAdapter;
	}

	public void setOnAdapterChangeListener(OnAdapterChangeListener listener)
	{
		mAdapterChangeListener = listener;
	}

	/* private */int getClientWidth()
	{
		return getMeasuredWidth() - getPaddingLeft() - getPaddingRight();
	}

	int getClientSize()
	{
		return mIsVertical ? getClientHeight() : getClientWidth();
	}

	public int getClientHeight()
	{
		return getMeasuredHeight() - getPaddingTop() - getPaddingBottom();
	}

	/**
	 * Set the currently selected page. If the QBViewPager has already been
	 * through its first
	 * layout with its current adapter there will be a smooth animated
	 * transition between
	 * the current item and the specified item.
	 *
	 * @param item Item index to select
	 */
	public void setCurrentItem(int item)
	{
		mPopulatePending = false;
		setCurrentItemInternal(item, !mFirstLayout, false);
	}

	/**
	 * Set the currently selected page.
	 *
	 * @param item Item index to select
	 * @param smoothScroll True to smoothly scroll to the new item, false to
	 *            transition immediately
	 */
	public void setCurrentItem(int item, boolean smoothScroll)
	{
		mPopulatePending = false;
		setCurrentItemInternal(item, smoothScroll, false);
	}

	/**
	 * Set the currently selected page.
	 *
	 * @param item Item index to select
	 * @param smoothScroll True to smoothly scroll to the new item, false to
	 *            transition immediately
	 * @param smoothScroll True to smoothly scroll to the new item, false to
	 *            transition immediately
	 */
	public void setCurrentItem(int item, boolean smoothScroll, int animDuration)
	{
		mPopulatePending = false;
		setCurrentItemInternal(item, smoothScroll, false, animDuration, 0);
	}

	public int getCurrentItem()
	{
		return mCurItem;
	}

	protected void setCurrentItemInternal(int item, boolean smoothScroll, boolean always)
	{
		setCurrentItemInternal(item, smoothScroll, always, 0, 0);
	}

	void setCurrentItemInternal(int item, boolean smoothScroll, boolean always, int animDuration, int velocity)
	{
		if (mAdapter == null || mAdapter.getCount() <= 0)
		{
			setScrollingCacheEnabled(false);
			return;
		}
		if (!always && mCurItem == item && mItems.size() != 0)
		{
			setScrollingCacheEnabled(false);
			return;
		}

		if (item < 0)
		{
			item = 0;
		}
		else if (item >= mAdapter.getCount())
		{
			item = mAdapter.getCount() - 1;
		}
		final int pageLimit = mOffscreenPageLimit;
		if (item > (mCurItem + pageLimit) || item < (mCurItem - pageLimit))
		{
			// We are doing a jump by more than one page. To avoid
			// glitches, we want to keep all current pages in the view
			// until the scroll ends.
			for (int i = 0; i < mItems.size(); i++)
			{
				mItems.get(i).scrolling = true;
			}
		}
		final boolean dispatchSelected = mCurItem != item;

		if (mFirstLayout)
		{
			// We don't have any idea how big we are yet and shouldn't have any
			// pages either.
			// Just set things up and let the pending layout handle things.
			mCurItem = item;
			if ((dispatchSelected || mCallPageChangedOnFirstLayout) && mOnPageChangeListener != null)
			{
				mOnPageChangeListener.onPageSelected(item);
			}
			if ((dispatchSelected || mCallPageChangedOnFirstLayout) && mInternalPageChangeListener != null)
			{
				mInternalPageChangeListener.onPageSelected(item);
			}
			requestLayout();
		}
		else
		{
			populate(item, true);
			scrollToItem(item, smoothScroll, animDuration, velocity, dispatchSelected, mTouching);
		}
	}

	/* private */void scrollToItem(int item, boolean smoothScroll, int velocity, boolean dispatchSelected)
	{
		scrollToItem(item, smoothScroll, 0, velocity, dispatchSelected, mTouching);
	}

	/* private */void scrollToItem(int item, boolean smoothScroll, int animDuration, int velocity, boolean dispatchSelected, boolean touching)
	{
		final ItemInfo curInfo = infoForPosition(item);
		int dest = 0;
		if (curInfo != null)
		{
			final int size = getClientSize();
			dest = (int) (size * Math.max(mFirstOffset, Math.min(curInfo.offset, mLastOffset)));
		}
		if (smoothScroll)
		{
			if (mIsVertical)
			{
				smoothScrollTo(0, dest, animDuration, velocity);
			}
			else
			{
				smoothScrollTo(dest, 0, animDuration, velocity);
			}
			if (dispatchSelected && mOnPageChangeListener != null)
			{
				mOnPageChangeListener.onPageSelected(item);
			}
			if (dispatchSelected && mInternalPageChangeListener != null)
			{
				mInternalPageChangeListener.onPageSelected(item);
			}
		}
		else
		{
			if (dispatchSelected && mOnPageChangeListener != null)
			{
				mOnPageChangeListener.onPageSelected(item);
			}
			if (dispatchSelected && mInternalPageChangeListener != null)
			{
				mInternalPageChangeListener.onPageSelected(item);
			}
			mScrollToNeedNotify = true;
			completeScroll(false);
			if (mIsVertical)
			{
				scrollTo(0, dest);
			}
			else
			{
				scrollTo(dest, 0);
			}

			int direction = (item > mLastItem) ? 1 : -1;
			pageScrolled(dest, direction);
		}
		if (mSelectedListener != null && touching)
		{
			mSelectedListener.onPageSelected(false, mCurItem);
		}
	}

	/**
	 * Set a listener that will be invoked whenever the page changes or is
	 * incrementally
	 * scrolled. See {@link OnPageChangeListener}.
	 *
	 * @param listener Listener to set
	 */
	public void setOnPageChangeListener(OnPageChangeListener listener)
	{
		mOnPageChangeListener = listener;
	}

	/**
	 * Set a {@link PageTransformer} that will be called for each attached page
	 * whenever
	 * the scroll position is changed. This allows the application to apply
	 * custom property
	 * transformations to each page, overriding the default sliding look and
	 * feel.
	 * <p/>
	 * <p>
	 * <em>Note:</em> Prior to Android 3.0 the property animation APIs did not
	 * exist. As a result, setting a PageTransformer prior to Android 3.0 (API
	 * 11) will have no effect.
	 * </p>
	 *
	 * @param reverseDrawingOrder true if the supplied PageTransformer requires
	 *            page views
	 *            to be drawn from last to first instead of first to last.
	 * @param transformer PageTransformer that will modify each page's animation
	 *            properties
	 */
	public void setPageTransformer(boolean reverseDrawingOrder, PageTransformer transformer)
	{
		if (!isGallery())
		{
			final boolean hasTransformer = transformer != null;
			final boolean needsPopulate = hasTransformer != (mPageTransformer != null);
			mPageTransformer = transformer;
			setChildrenDrawingOrderEnabled(hasTransformer);
			if (hasTransformer)
			{
				mDrawingOrder = reverseDrawingOrder ? DRAW_ORDER_REVERSE : DRAW_ORDER_FORWARD;
			}
			else
			{
				mDrawingOrder = DRAW_ORDER_DEFAULT;
			}
			if (needsPopulate)
				populate();
		}
		else
		{
			mPageTransformer = transformer;
		}
	}

	public void setPageTransformer(PageTransformer transformer)
	{
		mPageTransformer = transformer;
	}

	//	void setChildrenDrawingOrderEnabledCompat(boolean enable)
	//	{
	//		if (mSetChildrenDrawingOrderEnabled == null)
	//		{
	//			try
	//			{
	//				mSetChildrenDrawingOrderEnabled = ViewGroup.class.getDeclaredMethod("setChildrenDrawingOrderEnabled", new Class[] { Boolean.TYPE });
	//			}
	//			catch (NoSuchMethodException e)
	//			{
	//				// Log.e(TAG, "Can't find setChildrenDrawingOrderEnabled",
	//				// e);
	//			}
	//		}
	//		try
	//		{
	//			mSetChildrenDrawingOrderEnabled.invoke(this, enable);
	//		}
	//		catch (Exception e)
	//		{
	//			// Log.e(TAG, "Error changing children drawing order", e);
	//		}
	//		//		if (Build.VERSION.SDK_INT >= 7)
	//		//		{
	//		//			if (mSetChildrenDrawingOrderEnabled == null)
	//		//			{
	//		//				try
	//		//				{
	//		//					mSetChildrenDrawingOrderEnabled = ViewGroup.class.getDeclaredMethod("setChildrenDrawingOrderEnabled",
	//		//							new Class[] { Boolean.TYPE });
	//		//				}
	//		//				catch (NoSuchMethodException e)
	//		//				{
	//		//					// Log.e(TAG, "Can't find setChildrenDrawingOrderEnabled",
	//		//					// e);
	//		//				}
	//		//			}
	//		//			try
	//		//			{
	//		//				mSetChildrenDrawingOrderEnabled.invoke(this, enable);
	//		//			}
	//		//			catch (Exception e)
	//		//			{
	//		//				// Log.e(TAG, "Error changing children drawing order", e);
	//		//			}
	//		//		}
	//	}

	@Override
	protected int getChildDrawingOrder(int childCount, int i)
	{
		int index = mDrawingOrder == DRAW_ORDER_REVERSE ? childCount - 1 - i : i;
		// 对index进行保护，防止ArrayList.get(index)越界
		index = index >= mDrawingOrderedChildren.size() ? mDrawingOrderedChildren.size() - 1 : index;
		index = index < 0 ? 0 : index;
		return ((LayoutParams) mDrawingOrderedChildren.get(index).getLayoutParams()).childIndex;
		//		return result;
	}

	/**
	 * Set a separate OnPageChangeListener for internal use by the support
	 * library.
	 *
	 * @param listener Listener to set
	 * @return The old listener that was set, if any.
	 */
	public OnPageChangeListener setInternalPageChangeListener(OnPageChangeListener listener)
	{
		OnPageChangeListener oldListener = mInternalPageChangeListener;
		mInternalPageChangeListener = listener;
		return oldListener;
	}

	/**
	 * Returns the number of pages that will be retained to either side of the
	 * current page in the view hierarchy in an idle state. Defaults to 1.
	 *
	 * @return How many pages will be kept offscreen on either side
	 * @see #setOffscreenPageLimit(int)
	 */
	public int getOffscreenPageLimit()
	{
		return mOffscreenPageLimit;
	}

	/**
	 * Set the number of pages that should be retained to either side of the
	 * current page in the view hierarchy in an idle state. Pages beyond this
	 * limit will be recreated from the adapter when needed.
	 * <p/>
	 * <p>
	 * This is offered as an optimization. If you know in advance the number of
	 * pages you will need to support or have lazy-loading mechanisms in place
	 * on your pages, tweaking this setting can have benefits in perceived
	 * smoothness of paging animations and interaction. If you have a small
	 * number of pages (3-4) that you can keep active all at once, less time
	 * will be spent in layout for newly created view subtrees as the user pages
	 * back and forth.
	 * </p>
	 * <p/>
	 * <p>
	 * You should keep this limit low, especially if your pages have complex
	 * layouts. This setting defaults to 1.
	 * </p>
	 *
	 * @param limit How many pages will be kept offscreen in an idle state.
	 */
	public void setOffscreenPageLimit(int limit)
	{
		if (limit < DEFAULT_OFFSCREEN_PAGES)
		{
			// Log.w(TAG, "Requested offscreen page limit " + limit +
			// " too small; defaulting to " + DEFAULT_OFFSCREEN_PAGES);
			limit = DEFAULT_OFFSCREEN_PAGES;
		}
		if (limit != mOffscreenPageLimit)
		{
			mOffscreenPageLimit = limit;
			populate();
		}
	}

	/**
	 * Set the margin between pages.
	 *
	 * @param marginPixels Distance between adjacent pages in pixels
	 * @see #getPageMargin()
	 * @see #setPageMarginDrawable(Drawable)
	 * @see #setPageMarginDrawable(int)
	 */
	public void setPageMargin(int marginPixels)
	{
		final int oldMargin = mPageMargin;
		mPageMargin = marginPixels;

		final int width = getWidth();
		recomputeScrollPosition(width, width, marginPixels, oldMargin);

		requestLayout();
	}

	/**
	 * Return the margin between pages.
	 *
	 * @return The size of the margin in pixels
	 */
	public int getPageMargin()
	{
		return mPageMargin;
	}

	/**
	 * Set a drawable that will be used to fill the margin between pages.
	 *
	 * @param d Drawable to display between pages
	 */
	public void setPageMarginDrawable(Drawable d)
	{
		mMarginDrawable = d;
		if (d != null)
			refreshDrawableState();
		setWillNotDraw(d == null);
		invalidate();
	}

	/**
	 * Set a drawable that will be used to fill the margin between pages.
	 *
	 * @param resId Resource ID of a drawable to display between pages
	 */
	public void setPageMarginDrawable(int resId)
	{
		setPageMarginDrawable(getContext().getResources().getDrawable(resId));
	}

	@Override
	protected boolean verifyDrawable(Drawable who)
	{
		return super.verifyDrawable(who) || who == mMarginDrawable;
	}

	@Override
	protected void drawableStateChanged()
	{
		super.drawableStateChanged();
		final Drawable d = mMarginDrawable;
		if (d != null && d.isStateful())
		{
			d.setState(getDrawableState());
		}
	}

	// We want the duration of the page snap animation to be influenced by the
	// distance that
	// the screen has to travel, however, we don't want this duration to be
	// effected in a
	// purely linear fashion. Instead, we use this method to moderate the effect
	// that the distance
	// of travel has on the overall snap duration.
	float distanceInfluenceForSnapDuration(float f)
	{
		f -= 0.5f; // center the values about 0.
		f *= 0.3f * Math.PI / 2.0f;
		return (float) Math.sin(f);
	}

	/**
	 * Like {@link View#scrollBy}, but scroll smoothly instead of immediately.
	 *
	 * @param x the number of pixels to scroll by on the X axis
	 * @param y the number of pixels to scroll by on the Y axis
	 * @param velocity the velocity associated with a fling, if applicable. (0
	 *            otherwise)
	 */
	void smoothScrollTo(int x, int y, int animDuration, int velocity)
	{
		if (getChildCount() == 0 || mAdapter == null)
		{
			// Nothing to do.
			setScrollingCacheEnabled(false);
			return;
		}
		int sx = getScrollX();
		int sy = getScrollY();
		int dx = x - sx;
		int dy = y - sy;
		if (dx == 0 && dy == 0)
		{
			completeScroll(false);
			populate();
			setScrollState(SCROLL_STATE_IDLE);
			return;
		}

		setScrollingCacheEnabled(true);
		setScrollState(SCROLL_STATE_SETTLING);

		final int size = getClientSize();
		final int halfSize = size / 2;
		final float distanceRatio = Math.min(1f, 1.0f * Math.abs(dx) / size);
		final float distance = halfSize + halfSize * distanceInfluenceForSnapDuration(distanceRatio);

		if (animDuration <= 0)
		{
			if (mTouching || mAutoScrollCustomDuration < 0)
			{
				velocity = Math.abs(velocity);
				if (velocity > 0)
				{
					animDuration = 4 * Math.round(1000 * Math.abs(distance / velocity));
				}
				else
				{
					final float pageSize = size * mAdapter.getPageSize(mCurItem);
					final float pageDelta = (float) Math.abs(mIsVertical ? dy : dx) / (pageSize + mPageMargin);
					animDuration = (int) ((pageDelta + 1) * 100);
				}
				animDuration = Math.min(animDuration, MAX_SETTLE_DURATION);

			}
			else
			{
				animDuration = mAutoScrollCustomDuration;
			}
		}
		mScroller.startScroll(sx, sy, dx, dy, animDuration);
		ViewCompatTool.postInvalidateOnAnimation(this);
	}

	public void setAutoScrollCustomDuration(int duration)
	{
		mAutoScrollCustomDuration = duration;
	}

	ItemInfo addNewItem(int position, int index)
	{
		ItemInfo ii = new ItemInfo();
		ii.position = position;
		ii.object = mAdapter.instantiateItem(this, position);
		// if (ii.object instanceof View)
		// {
		// ((View) ii.object).setBackgroundColor(Color.RED);
		// }
		ii.sizeFactor = mAdapter.getPageSize(position);
		if (index < 0 || index >= mItems.size())
		{
			mItems.add(ii);
		}
		else
		{
			mItems.add(index, ii);
		}
		return ii;
	}

	private boolean mFirstDatasetChanged = true;

	void dataSetChanged()
	{
		// This method only gets called if our observer is attached, so mAdapter
		// is non-null.

		final int adapterCount = mAdapter.getCount();
		mExpectedAdapterCount = adapterCount;
		boolean needPopulate = mItems.size() < mOffscreenPageLimit * 2 + 1 && mItems.size() < adapterCount;
		if (mFirstDatasetChanged)
		{
			mFirstDatasetChanged = false;
			mCurItem = mAdapter.getInitialItemIndex();
		}
		int newCurrItem = mCurItem;

		boolean isUpdating = false;
		for (int i = 0; i < mItems.size(); i++)
		{
			final ItemInfo ii = mItems.get(i);
			final int newPos = mAdapter.getItemPosition(ii.object);

			if (newPos == ViewPagerAdapter.POSITION_UNCHANGED || newPos == ii.position)
			{
				// 通过refreshItem判断item是否需要更新
				if (0 < mAdapter.refreshItem(this, ii.position, ii.object))
				{// 默认修改大小，如果以后有新的属性需要增加返回类型
					ii.sizeFactor = mAdapter.getPageSize(ii.position);
					needPopulate = true;
				}
			}

			if (newPos == ViewPagerAdapter.POSITION_UNCHANGED)
			{
				continue;
			}

			if (newPos == ViewPagerAdapter.POSITION_NONE)
			{
				mItems.remove(i);
				i--;

				if (!isUpdating)
				{
					mAdapter.startUpdate(this, mCurItem);
					isUpdating = true;
				}

				mAdapter.destroyItem(this, ii.position, ii.object);
				needPopulate = true;

				if (mCurItem == ii.position)
				{
					// Keep the current item in the valid range
					newCurrItem = Math.max(0, Math.min(mCurItem, adapterCount - 1));
					needPopulate = true;
				}
				continue;
			}

			if (ii.position != newPos)
			{
				if (ii.position == mCurItem)
				{
					// Our current item changed position. Follow it.
					newCurrItem = newPos;
				}

				ii.position = newPos;
				needPopulate = true;
			}
		}

		if (isUpdating)
		{
			mAdapter.finishUpdate(this);
		}

		Collections.sort(mItems, COMPARATOR);

		if (needPopulate)
		{
			// Reset our known page widths; populate will recompute them.
			final int childCount = getChildCount();
			for (int i = 0; i < childCount; i++)
			{
				final View child = getChildAt(i);
				final LayoutParams lp = (LayoutParams) child.getLayoutParams();
				if (!lp.isDecor)
				{
					lp.sizeFactor = 0.f;
				}
			}

			setCurrentItemInternal(newCurrItem, false, true);
			requestLayout();
		}
	}

	void populate()
	{
		populate(mCurItem);
	}

	public Object getCurrentItemView()
	{
		ItemInfo ii = infoForPosition(mCurItem);
		if (ii != null)
		{
			return ii.object;
		}
		return null;
	}

//	@Override
//	public void scrollTo(int x, int y)
//	{
//		Log.d(TAG, "----------------------");
//		Log.d(TAG, "scrollTo " + x);
//		Log.d(TAG, "----------------------");
//		super.scrollTo(x, y);
//	}

	/**
	 * cache开启后，每次populate都会先摘掉所有item用于重用。
	 *
	 * @param enabled
	 */
	public void setCacheEnabled(boolean enabled)
	{
		mCacheEnabled = enabled;
	}

	void populate(int newCurrentItem)
	{
		populate(newCurrentItem, false);
	}

	void populate(int newCurrentItem, boolean useCache)
	{
		ItemInfo oldCurInfo = null;
		int focusDirection = View.FOCUS_FORWARD;
		if (mCurItem != newCurrentItem)
		{
			focusDirection = mCurItem < newCurrentItem ? View.FOCUS_RIGHT : View.FOCUS_LEFT;
			oldCurInfo = infoForPosition(mCurItem);
			mCurItem = newCurrentItem;
		}

		if (mAdapter == null)
		{
			sortChildDrawingOrder();
			return;
		}

		// Bail now if we are waiting to populate. This is to hold off
		// on creating views from the time the user releases their finger to
		// fling to a new position until we have finished the scroll to
		// that position, avoiding glitches from happening at that point.
		if (mPopulatePending)
		{
			if (DEBUG)
				Log.i(TAG, "populate is pending, skipping for now...");
			sortChildDrawingOrder();
			return;
		}

		// Also, don't populate until we are attached to a window. This is to
		// avoid trying to populate before we have restored our view hierarchy
		// state and conflicting with what is restored.
		/**
		 * ViewPager没有挂载上去，会在挂载到window的时候在populate,但是feeds的需求
		 * 需要hippyView在没挂载到树上的时候，初始话出来。
		 * */
		/*
		if (getWindowToken() == null)
		{
			mNeedRepopulate = true; // 此次populate失效
			return;
		}
		*/
		if (DEBUG)
		{
//			Log.d(TAG, "populate begin-----------------");
			dumpItemInfos();
		}
		mAdapter.startUpdate(this, mCurItem);

		if (mCacheEnabled && useCache)
		{
			for (int i = 0; i < mItems.size(); i++)
			{
				final ItemInfo ii = mItems.get(i);
				mAdapter.destroyItem(this, ii.position, ii.object);
			}
			mItems.clear();
		}
		final int pageLimit = mOffscreenPageLimit;
		final int startPos = Math.max(0, mCurItem - pageLimit);
		final int N = mAdapter.getCount();
		final int endPos = Math.min(N - 1, mCurItem + pageLimit);
		//不挂载的HippyRootView在初始化话的时候，会两次调用populate，一次是createNode,一次是updateNoe.
		//第一次createNode mExpectedAdapterCount = 0，所以这里保证这种情况这里不会挂
		if(getWindowToken() != null)
		{
			if (N != mExpectedAdapterCount)
			{
				String resName;
				try
				{
					resName = getResources().getResourceName(getId());
				}
				catch (Resources.NotFoundException e)
				{
					resName = Integer.toHexString(getId());
				}
				throw new IllegalStateException("The application's QBPagerAdapter changed the adapter's"
						+ " contents without calling QBPagerAdapter#notifyDataSetChanged!" + " Expected adapter item count: " + mExpectedAdapterCount
						+ ", found: " + N + " Pager id: " + resName + " Pager class: " + getClass() + " Problematic adapter: " + mAdapter.getClass());
			}
		}


		// Locate the currently focused item or add it if needed.
		int curIndex = -1;
		ItemInfo curItem = null;
		for (curIndex = 0; curIndex < mItems.size(); curIndex++)
		{
			final ItemInfo ii = mItems.get(curIndex);
			if (ii.position >= mCurItem)
			{
				if (ii.position == mCurItem)
					curItem = ii;
				break;
			}
		}

		if (curItem == null && N > 0)
		{
			curItem = addNewItem(mCurItem, curIndex);
		}

		// Fill 3x the available width or up to the number of offscreen
		// pages requested to either side, whichever is larger.
		// If we have no current item we have no work to do.
		if (curItem != null)
		{
			float extraSizeStart = 0.f;
			int itemIndex = curIndex - 1;
			ItemInfo ii = itemIndex >= 0 ? mItems.get(itemIndex) : null;
			final int clientSize = getClientSize();
			int paddingStart = mIsVertical ? getPaddingTop() : getPaddingLeft();
			final float startSizeNeeded = clientSize <= 0 ? 0 : 2.f - curItem.sizeFactor + (float) paddingStart / (float) clientSize;
			for (int pos = mCurItem - 1; pos >= 0; pos--)
			{
				if (extraSizeStart >= startSizeNeeded && pos < startPos)
				{
					if (ii == null)
					{
						break;
					}
					if (pos == ii.position && !ii.scrolling)
					{
						mItems.remove(itemIndex);
						mAdapter.destroyItem(this, pos, ii.object);
						if (DEBUG)
						{
							Log.i(TAG, "populate() - destroyItem() with pos: " + pos + " view: " + ii.object);
						}
						itemIndex--;
						curIndex--;
						ii = itemIndex >= 0 ? mItems.get(itemIndex) : null;
					}
				}
				else if (ii != null && pos == ii.position)
				{
					extraSizeStart += ii.sizeFactor;
					itemIndex--;
					ii = itemIndex >= 0 ? mItems.get(itemIndex) : null;
				}
				else
				{
					ii = addNewItem(pos, itemIndex + 1);
					extraSizeStart += ii.sizeFactor;
					curIndex++;
					ii = itemIndex >= 0 ? mItems.get(itemIndex) : null;
				}
			}

			float extraSizeEnd = curItem.sizeFactor;
			itemIndex = curIndex + 1;
			if (extraSizeEnd < 2.f)
			{
				ii = itemIndex < mItems.size() ? mItems.get(itemIndex) : null;
				int paddingEnd = mIsVertical ? getPaddingBottom() : getPaddingRight();
				final float endSizeNeeded = clientSize <= 0 ? 0 : (float) paddingEnd / (float) clientSize + 2.f;
				for (int pos = mCurItem + 1; pos < N; pos++)
				{
					if (extraSizeEnd >= endSizeNeeded && pos > endPos)
					{
						if (ii == null)
						{
							break;
						}
						if (pos == ii.position && !ii.scrolling)
						{
							mItems.remove(itemIndex);
							mAdapter.destroyItem(this, pos, ii.object);
							if (DEBUG)
							{
								Log.i(TAG, "populate() - destroyItem() with pos: " + pos + " view: " + (ii.object));
							}
							ii = itemIndex < mItems.size() ? mItems.get(itemIndex) : null;
						}
					}
					else if (ii != null && pos == ii.position)
					{
						extraSizeEnd += ii.sizeFactor;
						itemIndex++;
						ii = itemIndex < mItems.size() ? mItems.get(itemIndex) : null;
					}
					else
					{
						if (ii != null)// 当ii和当前pos不相等时，需要移除原来ii的内容
							mAdapter.destroyItem(this, ii.position, ii.object);

						ii = addNewItem(pos, itemIndex);
						itemIndex++;
						extraSizeEnd += ii.sizeFactor;
						ii = itemIndex < mItems.size() ? mItems.get(itemIndex) : null;
					}
				}
			}

			calculatePageOffsets(curItem, curIndex, oldCurInfo);
		}

		// if (DEBUG)
		// {
		// Log.i(TAG, "Current page list:");
		// for (int i = 0; i < mItems.size(); i++)
		// {
		// Log.i(TAG, "#" + i + ": page " + mItems.get(i).position);
		// }
		// }

		mAdapter.setPrimaryItem(this, mCurItem, curItem != null ? curItem.object : null);

		mAdapter.finishUpdate(this);

		// Check width measurement of current pages and drawing sort order.
		// Update LayoutParams as needed.
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final View child = getChildAt(i);
			final LayoutParams lp = (LayoutParams) child.getLayoutParams();
			lp.childIndex = i;
			// if (!lp.isDecor && lp.sizeFactor == 0.f)
			// {
			// 0 means reQuery the adapter for this, it doesn't have a valid
			// width.
			final ItemInfo ii = infoForChild(child);
			if (ii != null)
			{
				lp.sizeFactor = ii.sizeFactor;
				lp.position = ii.position;
			}
			// }
		}
		if (DEBUG)
		{
			Log.d(TAG, "-------------------");
			dumpItemInfos();
			Log.d(TAG, "populate end-----------------");
		}
		sortChildDrawingOrder();

		if (hasFocus())
		{
			View currentFocused = findFocus();
			ItemInfo ii = currentFocused != null ? infoForAnyChild(currentFocused) : null;
			if (ii == null || ii.position != mCurItem)
			{
				for (int i = 0; i < getChildCount(); i++)
				{
					View child = getChildAt(i);
					ii = infoForChild(child);
					if (ii != null && ii.position == mCurItem)
					{
						if (child.requestFocus(focusDirection))
						{
							break;
						}
					}
				}
			}
		}
	}

	/* private */void sortChildDrawingOrder()
	{
		if (mDrawingOrder != DRAW_ORDER_DEFAULT)
		{
			if (mDrawingOrderedChildren == null)
			{
				mDrawingOrderedChildren = new ArrayList<View>();
			}
			else
			{
				mDrawingOrderedChildren.clear();
			}
			final int childCount = getChildCount();
			for (int i = 0; i < childCount; i++)
			{
				final View child = getChildAt(i);
				mDrawingOrderedChildren.add(child);
			}
			Collections.sort(mDrawingOrderedChildren, sPositionComparator);
		}
	}

	/* private */void calculatePageOffsets(ItemInfo curItem, int curIndex, ItemInfo oldCurInfo)
	{
		final int N = mAdapter.getCount();
		final int size = getClientSize();
		final float marginOffset = size > 0 ? (float) mPageMargin / size : 0;
		// Fix up offsets for later layout.
		if (oldCurInfo != null)
		{
			final int oldCurPosition = oldCurInfo.position;
			// Base offsets off of oldCurInfo.
			if (oldCurPosition < curItem.position)
			{
				int itemIndex = 0;
				ItemInfo ii = null;
				float offset = oldCurInfo.offset + oldCurInfo.sizeFactor + marginOffset;
				for (int pos = oldCurPosition + 1; pos <= curItem.position && itemIndex < mItems.size(); pos++)
				{
					ii = mItems.get(itemIndex);
					while (pos > ii.position && itemIndex < mItems.size() - 1)
					{
						itemIndex++;
						ii = mItems.get(itemIndex);
					}
					while (pos < ii.position)
					{
						// We don't have an item populated for this,
						// ask the adapter for an offset.
						offset += mAdapter.getPageSize(pos) + marginOffset;
						pos++;
					}
					ii.offset = offset;
					offset += ii.sizeFactor + marginOffset;
				}
			}
			else if (oldCurPosition > curItem.position)
			{
				int itemIndex = mItems.size() - 1;
				ItemInfo ii = null;
				float offset = oldCurInfo.offset;
				for (int pos = oldCurPosition - 1; pos >= curItem.position && itemIndex >= 0; pos--)
				{
					ii = mItems.get(itemIndex);
					while (pos < ii.position && itemIndex > 0)
					{
						itemIndex--;
						ii = mItems.get(itemIndex);
					}
					while (pos > ii.position)
					{
						// We don't have an item populated for this,
						// ask the adapter for an offset.
						offset -= mAdapter.getPageSize(pos) + marginOffset;
						pos--;
					}
					offset -= ii.sizeFactor + marginOffset;
					ii.offset = offset;
				}
			}
		}

		// Base all offsets off of curItem.
		final int itemCount = mItems.size();
		float offset = curItem.offset;
		int pos = curItem.position - 1;
		mFirstOffset = curItem.position == 0 ? curItem.offset : -Float.MAX_VALUE;
		mLastOffset = curItem.position == N - 1 ? curItem.offset + curItem.sizeFactor - 1 : Float.MAX_VALUE;
		// Previous pages
		for (int i = curIndex - 1; i >= 0; i--, pos--)
		{
			final ItemInfo ii = mItems.get(i);
			while (pos > ii.position)
			{
				offset -= mAdapter.getPageSize(pos--) + marginOffset;
			}
			offset -= ii.sizeFactor + marginOffset;
			ii.offset = offset;
			if (ii.position == 0)
				mFirstOffset = offset;
		}
		offset = curItem.offset + curItem.sizeFactor + marginOffset;
		pos = curItem.position + 1;
		// Next pages
		for (int i = curIndex + 1; i < itemCount; i++, pos++)
		{
			final ItemInfo ii = mItems.get(i);
			while (pos < ii.position)
			{
				offset += mAdapter.getPageSize(pos++) + marginOffset;
			}
			if (ii.position == N - 1)
			{
				mLastOffset = offset + ii.sizeFactor - 1;
			}
			ii.offset = offset;
			offset += ii.sizeFactor + marginOffset;
		}
	}

	/**
	 * This is the persistent state that is saved by QBViewPager. Only needed
	 * if you are creating a subclass of QBViewPager that must save its own
	 * state, in which case it should implement a subclass of this which
	 * contains that state.
	 */
	public static class SavedState extends View.BaseSavedState
	{
		int			position;
		Parcelable	adapterState;
		ClassLoader	loader;

		public SavedState(Parcelable superState)
		{
			super(superState);
		}

		@Override
		public void writeToParcel(Parcel out, int flags)
		{
			super.writeToParcel(out, flags);
			out.writeInt(position);
			out.writeParcelable(adapterState, flags);
		}

		@Override
		public String toString()
		{
			return "FragmentPager.SavedState{" + Integer.toHexString(System.identityHashCode(this)) + " position=" + position + "}";
		}

		// public static final Parcelable.Creator<SavedState> CREATOR =
		// ParcelableCompat.newCreator(new
		// ParcelableCompatCreatorCallbacks<SavedState>()
		// {
		// @Override
		// public SavedState createFromParcel(Parcel in, ClassLoader loader)
		// {
		// return new SavedState(in, loader);
		// }
		//
		// @Override
		// public SavedState[] newArray(int size)
		// {
		// return new SavedState[size];
		// }
		// });

		SavedState(Parcel in, ClassLoader loader)
		{
			super(in);
			if (loader == null)
			{
				loader = getClass().getClassLoader();
			}
			position = in.readInt();
			adapterState = in.readParcelable(loader);
			this.loader = loader;
		}
	}

	@Override
	public Parcelable onSaveInstanceState()
	{
		Parcelable superState = super.onSaveInstanceState();
		SavedState ss = new SavedState(superState);
		ss.position = mCurItem;
		if (mAdapter != null)
		{
			ss.adapterState = mAdapter.saveState();
		}
		return ss;
	}

	@Override
	public void onRestoreInstanceState(Parcelable state)
	{
		if (!(state instanceof SavedState))
		{
			super.onRestoreInstanceState(state);
			return;
		}

		SavedState ss = (SavedState) state;
		super.onRestoreInstanceState(ss.getSuperState());

		if (mAdapter != null)
		{
			mAdapter.restoreState(ss.adapterState, ss.loader);
			setCurrentItemInternal(ss.position, false, true);
		}
		else
		{
			mRestoredCurItem = ss.position;
			mRestoredAdapterState = ss.adapterState;
			mRestoredClassLoader = ss.loader;
		}
	}

	@Override
	public void addView(View child, int index, ViewGroup.LayoutParams params)
	{
		if (child == null)
		{
			return;
		}
		if (!checkLayoutParams(params))
		{
			params = generateLayoutParams(params);
		}
		final LayoutParams lp = (LayoutParams) params;
		lp.isDecor |= child instanceof Decor;
		if (mInLayout)
		{
			if (lp != null && lp.isDecor)
			{
				throw new IllegalStateException("Cannot add pager decor view during layout");
			}
			lp.needsMeasure = true;
			addViewInLayout(child, index, params);
		}
		else
		{
			super.addView(child, index, params);
		}

		if (child.getVisibility() != GONE)
		{
			child.setDrawingCacheEnabled(mScrollingCacheEnabled);
		}
		else
		{
			child.setDrawingCacheEnabled(false);
		}
	}

	@Override
	public void removeView(View view)
	{
		if (mInLayout)
		{
			removeViewInLayout(view);
		}
		else
		{
			super.removeView(view);
		}
	}

	ItemInfo infoForChild(View child)
	{
		for (int i = 0; i < mItems.size(); i++)
		{
			ItemInfo ii = mItems.get(i);
			if (mAdapter.isViewFromObject(child, ii.object))
			{
				return ii;
			}
		}
		return null;
	}

	ItemInfo infoForAnyChild(View child)
	{
		ViewParent parent;
		while ((parent = child.getParent()) != this)
		{
			if (parent == null || !(parent instanceof View))
			{
				return null;
			}
			child = (View) parent;
		}
		return infoForChild(child);
	}

	ItemInfo infoForPosition(int position)
	{
		for (int i = 0; i < mItems.size(); i++)
		{
			ItemInfo ii = mItems.get(i);
			if (ii.position == position)
			{
				return ii;
			}
		}
		return null;
	}

	public interface OnPageReadyListener
	{
		void onPageReady(int currPageIndex);
	}

	/* private */ OnPageReadyListener	mOnPageReadyListener;
	/* private */ boolean				ignoreCheck					= false;
	/* private */ boolean				mUpdateScreenNextCall;
	private boolean						mFocusSearchEnabled			= true;
	protected boolean					checkTouchSlop				= true;
	private boolean						mCanScroll					= true;
	private boolean						mTouching;
	private boolean						mReLayoutOnAttachToWindow	= true;

	public void setOnPageReadyListener(OnPageReadyListener listener)
	{
		this.mOnPageReadyListener = listener;
	}

	@Override
	protected void onAttachedToWindow()
	{
		super.onAttachedToWindow();
		if (mReLayoutOnAttachToWindow)
		{
			mFirstLayout = true;
			requestLayout();
		}
	}

	//	public void triggerRequestLayout(int left, int top, int right, int bottom)
	//	{
	//		layout(left, top, right, bottom);
	//	}

	@Override
	public void forceLayout()
	{
		super.forceLayout();
	}

	@Override
	public void requestLayout()
	{
		super.requestLayout();
	}

	@Override
	protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec)
	{
		// For simple implementation, our internal size is always 0.
		// We depend on the container to specify the layout size of
		// our view. We can't really know what it is since we will be
		// adding and removing different arbitrary views and do not
		// want the layout to change as this happens.
		if (DEBUG)
		{
			Log.d("TMYPAGER", "onMeasure");
		}
		setMeasuredDimension(getDefaultSize(0, widthMeasureSpec), getDefaultSize(0, heightMeasureSpec));

		final int measuredHeight = getMeasuredHeight();
		final int measuredWidth = getMeasuredWidth();

		final int maxGutterSize = mIsVertical ? measuredHeight / 10 : measuredWidth / 10;
		mGutterSize = Math.min(maxGutterSize, mDefaultGutterSize);

		// Children are just made to fill our space.
		int childWidthSize = measuredWidth - getPaddingLeft() - getPaddingRight();
		int childHeightSize = getMeasuredHeight() - getPaddingTop() - getPaddingBottom();

		/*
		 * Make sure all children have been properly measured. Decor views
		 * first.
		 * Right now we cheat and make this less complicated by assuming decor
		 * views won't intersect. We will pin to edges based on gravity.
		 */
		int size = getChildCount();
		for (int i = 0; i < size; ++i)
		{
			final View child = getChildAt(i);
			if (child != null && child.getVisibility() != GONE)
			{
				final LayoutParams lp = (LayoutParams) child.getLayoutParams();
				if (lp != null && lp.isDecor)
				{
					final int hgrav = lp.gravity & Gravity.HORIZONTAL_GRAVITY_MASK;
					final int vgrav = lp.gravity & Gravity.VERTICAL_GRAVITY_MASK;
					int widthMode = View.MeasureSpec.AT_MOST;
					int heightMode = View.MeasureSpec.AT_MOST;
					boolean consumeVertical = vgrav == Gravity.TOP || vgrav == Gravity.BOTTOM;
					boolean consumeHorizontal = hgrav == Gravity.LEFT || hgrav == Gravity.RIGHT;

					if (consumeVertical)
					{
						widthMode = View.MeasureSpec.EXACTLY;
					}
					else if (consumeHorizontal)
					{
						heightMode = View.MeasureSpec.EXACTLY;
					}

					int widthSize = childWidthSize;
					int heightSize = childHeightSize;
					if (lp.width != LayoutParams.WRAP_CONTENT)
					{
						widthMode = View.MeasureSpec.EXACTLY;
						if (lp.width != LayoutParams.FILL_PARENT)
						{
							widthSize = lp.width;
						}
					}
					if (lp.height != LayoutParams.WRAP_CONTENT)
					{
						heightMode = View.MeasureSpec.EXACTLY;
						if (lp.height != LayoutParams.FILL_PARENT)
						{
							heightSize = lp.height;
						}
					}
					final int widthSpec = View.MeasureSpec.makeMeasureSpec(widthSize, widthMode);
					final int heightSpec = View.MeasureSpec.makeMeasureSpec(heightSize, heightMode);
					child.measure(widthSpec, heightSpec);
					if (consumeVertical && lp.takeHeightspace)
					{
						childHeightSize -= child.getMeasuredHeight();
					}

				}
			}
		}

		mChildWidthMeasureSpec = View.MeasureSpec.makeMeasureSpec(childWidthSize, View.MeasureSpec.EXACTLY);
		mChildHeightMeasureSpec = View.MeasureSpec.makeMeasureSpec(childHeightSize, View.MeasureSpec.EXACTLY);

		// Make sure we have created all fragments that we need to have shown.
		mInLayout = true;
		populate();
		mInLayout = false;

		// Page views next.
		size = getChildCount();
		for (int i = 0; i < size; ++i)
		{
			final View child = getChildAt(i);
			if (child != null && child.getVisibility() != GONE)
			{
				if (DEBUG)
					Log.v(TAG, "Measuring #" + i + " " + child + ": " + mChildWidthMeasureSpec);

				final LayoutParams lp = (LayoutParams) child.getLayoutParams();
				if (lp == null || !lp.isDecor)
				{
					if (isGallery())
					{
						child.measure(mChildWidthMeasureSpec, mChildHeightMeasureSpec);
					}
					else
					{
						if (mIsVertical)
						{
							final int heightSpec = View.MeasureSpec.makeMeasureSpec((int) (childHeightSize * lp.sizeFactor),
									View.MeasureSpec.EXACTLY);
							child.measure(mChildWidthMeasureSpec, heightSpec);
						}
						else
						{
							final int widthSpec = View.MeasureSpec.makeMeasureSpec((int) (childWidthSize * lp.sizeFactor), View.MeasureSpec.EXACTLY);
							child.measure(widthSpec, mChildHeightMeasureSpec);
						}
					}
				}
			}
		}
	}

	@Override
	protected void onSizeChanged(int w, int h, int oldw, int oldh)
	{
		super.onSizeChanged(w, h, oldw, oldh);

		// Make sure scroll position is set correctly.
		if (w != oldw)
		{
			recomputeScrollPosition(w, oldw, 0, 0);
		}
	}

	/* private */void recomputeScrollPosition(int width, int oldWidth, int margin, int oldMargin)
	{
		if (isGallery())
		{
			return;
		}
		if (oldWidth > 0 && !mItems.isEmpty())
		{
			final int widthWithMargin = width - getPaddingLeft() - getPaddingRight() + margin;
			final int oldWidthWithMargin = oldWidth - getPaddingLeft() - getPaddingRight() + oldMargin;
			final int xpos = getScrollX();
			final float pageOffset = (float) xpos / oldWidthWithMargin;
			final int newOffsetPixels = (int) (pageOffset * widthWithMargin);

			scrollTo(newOffsetPixels, getScrollY());
			if (!mScroller.isFinished())
			{
				// We now return to your regularly scheduled scroll, already in
				// progress.
				final int newDuration = mScroller.getDuration() - mScroller.timePassed();
				ItemInfo targetInfo = infoForPosition(mCurItem);
				if (targetInfo != null)
				{
					mScroller.startScroll(newOffsetPixels, 0, (int) (targetInfo.offset * width), 0, newDuration);
				}
			}
		}
		else
		{
			final ItemInfo ii = infoForPosition(mCurItem);
			final float scrollOffset = ii != null ? Math.min(ii.offset, mLastOffset) : 0;
			final int scrollPos = (int) (scrollOffset * (width - getPaddingLeft() - getPaddingRight()));
			if (scrollPos != getScrollX())
			{
				completeScroll(false);
				scrollTo(scrollPos, getScrollY());
			}
		}
	}

	@Override
	protected void onLayout(boolean changed, int l, int t, int r, int b)
	{
		final int count = getChildCount();
		int width = r - l;
		int height = b - t;
		int paddingLeft = getPaddingLeft();
		int paddingTop = getPaddingTop();
		int paddingRight = getPaddingRight();
		int paddingBottom = getPaddingBottom();
		final int scrollX = getScrollX();
		if (DEBUG)
		{
			Log.d(TAG, "viewpager onLayout!");
		}
		int decorCount = 0;
		// First pass - decor views. We need to do this in two passes so that
		// we have the proper offsets for non-decor views later.
		for (int i = 0; i < count; i++)
		{
			final View child = getChildAt(i);
			if (child != null && child.getVisibility() != GONE)
			{
				final LayoutParams lp = (LayoutParams) child.getLayoutParams();
				int childLeft = 0;
				int childTop = 0;
				if (lp.isDecor)
				{
					final int hgrav = lp.gravity & Gravity.HORIZONTAL_GRAVITY_MASK;
					final int vgrav = lp.gravity & Gravity.VERTICAL_GRAVITY_MASK;
					switch (hgrav)
					{
						default:
							childLeft = paddingLeft;
							break;
						case Gravity.LEFT:
							childLeft = paddingLeft;
							paddingLeft += child.getMeasuredWidth();
							break;
						case Gravity.CENTER_HORIZONTAL:
							childLeft = Math.max((width - child.getMeasuredWidth()) / 2, paddingLeft);
							break;
						case Gravity.RIGHT:
							childLeft = width - paddingRight - child.getMeasuredWidth();
							paddingRight += child.getMeasuredWidth();
							break;
					}
					switch (vgrav)
					{
						default:
							childTop = paddingTop;
							break;
						case Gravity.TOP:
							childTop = paddingTop;
							if (lp.takeHeightspace)
							{
								paddingTop += child.getMeasuredHeight();
							}
							break;
						case Gravity.CENTER_VERTICAL:
							childTop = Math.max((height - child.getMeasuredHeight()) / 2, paddingTop);
							break;
						case Gravity.BOTTOM:
							childTop = height - paddingBottom - child.getMeasuredHeight();
							if (lp.takeHeightspace)
							{
								paddingBottom += child.getMeasuredHeight();
							}
							break;
					}
					childLeft += scrollX;
					child.layout(childLeft, childTop, childLeft + child.getMeasuredWidth(), childTop + child.getMeasuredHeight());
					decorCount++;
				}
			}
		}

		final int childSize = mIsVertical ? height - paddingTop - paddingBottom : width - paddingLeft - paddingRight;
		// Page views. Do this once we have the right padding offsets from
		// above.
		if (mAdapter == null)
		{
			int childLeft = 0;
			final int childCount = getChildCount();
			for (int i = 0; i < childCount; i++)
			{
				final View child = getChildAt(i);
				if (child != null && child.getVisibility() != View.GONE)
				{
					LayoutParams lp = (LayoutParams) child.getLayoutParams();
					if (!lp.isDecor)
					{
						child.layout(childLeft, paddingTop, childLeft + childSize, paddingTop + child.getMeasuredHeight());
						childLeft += childSize;
					}
				}
			}
		}
		else
		{
			for (int i = 0; i < count; i++)
			{
				final View child = getChildAt(i);
				if (child != null && child.getVisibility() != GONE)
				{
					final LayoutParams lp = (LayoutParams) child.getLayoutParams();
					ItemInfo ii;
					if (!lp.isDecor && (ii = infoForChild(child)) != null)
					{
						int loff = (int) (childSize * ii.offset);
						int childStart = mIsVertical ? paddingTop + loff : paddingLeft + loff;
						if (lp.needsMeasure)
						{
							// This was added during layout and needs
							// measurement.
							// Do it now that we know what we're working with.
							lp.needsMeasure = false;
							if (!mIsVertical)
							{
								final int widthSpec = View.MeasureSpec.makeMeasureSpec((int) (childSize * lp.sizeFactor), View.MeasureSpec.EXACTLY);
								final int heightSpec = View.MeasureSpec.makeMeasureSpec(height - paddingTop - paddingBottom,
										View.MeasureSpec.EXACTLY);
								child.measure(widthSpec, heightSpec);
							}
							else
							{
								final int heightSpec = View.MeasureSpec.makeMeasureSpec((int) (childSize * lp.sizeFactor), View.MeasureSpec.EXACTLY);
								final int widthSpec = View.MeasureSpec.makeMeasureSpec(width - paddingLeft - paddingRight, View.MeasureSpec.EXACTLY);
								child.measure(widthSpec, heightSpec);
							}

						}
						if (mIsVertical)
						{
							child.layout(paddingLeft, childStart, paddingLeft + child.getMeasuredWidth(), childStart + child.getMeasuredHeight());
						}
						else
						{
							child.layout(childStart, paddingTop, childStart + child.getMeasuredWidth(), paddingTop + child.getMeasuredHeight());
						}
					}
				}
			}
		}
		mTopPageBounds = paddingTop;
		mBottomPageBounds = height - paddingBottom;
		mDecorChildCount = decorCount;
		mPageCount = getChildCount() - mDecorChildCount;
		if (mFirstLayout || mLayoutNeeded)
		{
			mLayoutNeeded = false;
			if (!isGallery())
			{
				scrollToItem(mCurItem, false, 0, false);
			}
			else
			{
				// Log.d(TAG, "firstLayout,scrollTo currPage=" +
				// getCurrentPage());
				scrollTo(getCurrentPage() * getWidth(), getScrollY());
			}
		}
		if (mUpdateScreenNextCall)
		{
			scrollTo(getCurrentPage() * getWidth(), getScrollY());
			mUpdateScreenNextCall = false;
		}
		mFirstLayout = false;
	}

	public int getTotalLength()
	{
		int total = 0;
		for (int i = 0; i < mAdapter.getCount(); i++)
		{
			total += mIsVertical ? getHeight() * mAdapter.getPageSize(i) : getWidth() * mAdapter.getPageSize(i);
		}
		return total;
	}

	private int		mOri	= Integer.MAX_VALUE;
	private boolean	mLayoutNeeded;

	@Override
	protected void onConfigurationChanged(Configuration newConfig)
	{
		if (newConfig.orientation != mOri)
		{
			mLayoutNeeded = true;
		}
		mOri = newConfig.orientation;
		super.onConfigurationChanged(newConfig);
	}

	@Override
	public void computeScroll()
	{
		Log.d(TAG, "computeScroll,mNextScreen=" + mNextScreen);
		if (!mScroller.isFinished() && mScroller.computeScrollOffset())
		{
			Log.d(TAG, "computeScroll not finished");
			int oldX = getScrollX();
			int oldY = getScrollY();
			int x = mScroller.getCurrX();
			int y = mScroller.getCurrY();

			if (oldX != x || oldY != y)
			{
				scrollTo(x, y);
				int direction = x - oldX > 0 ? 1 : -1;
				if (mIsVertical) {
					direction = y - oldY > 0 ? 1 : -1;
				}

				if (!pageScrolled(mIsVertical ? y : x, direction) && !isGallery())
				{
					mScroller.abortAnimation();
					if (mIsVertical)
					{
						scrollTo(0, y);
					}
					else
					{
						scrollTo(x, 0);
					}
				}
			}
			ViewCompatTool.postInvalidateOnAnimation(this);
			return;
		}
		else if (mNextScreen != INVALID_SCREEN)
		{
			changePage();
			if (mScrollState == SCROLL_STATE_IDLE)
			{
				notifyScrollStateChanged(SCROLL_STATE_IDLE, SCROLL_STATE_IDLE);
			}
			Log.d(TAG, "computeScroll changePage");
			setScrollState(SCROLL_STATE_IDLE);
			return;
		}
		else if (mScrollToNeedNotify)
		{
			mScrollToNeedNotify = false;
			if (mScrollState == SCROLL_STATE_IDLE)
			{
				notifyScrollStateChanged(SCROLL_STATE_IDLE, SCROLL_STATE_IDLE);
			}
		}

		// Done with scroll, clean up state.
		completeScroll(true);
	}

	// @Override
	// public int getChildCount()
	// {
	// // TODO Auto-generated method stub
	// return super.getChildCount() - (mIndicatorEnabled ? 1 : 0);
	// }

	/* private */void changePage()
	{
		// TODO Auto-generated method stub
		mCurrentScreen = Math.max(getLeftBoundPageIndex(), Math.min(mNextScreen, getRightBoundPageIndex()));
		mNextScreen = INVALID_SCREEN;
	}

	protected boolean pageScrolled(int pos, int direction)
	{
		final int size = getClientSize();
		final int sizeWithMargin = size + mPageMargin;
		float pageOffset = 0;
		int offsetPixels = 0;

		if (mItems != null && mItems.size() == 0)
		{
			mCalledSuper = false;
			pageOffset = ((float) pos / size) - mCurrentScreen;
			offsetPixels = (int) (pageOffset * sizeWithMargin);
			onPageScrolled(mCurrentScreen, pageOffset, offsetPixels);
			if (!mCalledSuper)
			{
				throw new IllegalStateException("onPageScrolled did not call superclass implementation");
			}
			return false;
		}
		final ItemInfo ii = infoForCurrentScrollPosition();
		final float marginOffset = (float) mPageMargin / size;
		int targetPage = ii.position;
		final float offsetBaseRight = (((float) pos / size) - (ii.offset + ii.sizeFactor)) / (ii.sizeFactor + marginOffset);
		final float offsetBaseLeft = (((float) pos / size) - ii.offset) / (ii.sizeFactor + marginOffset);

		if (mLastItem == INVALID_SCREEN) {
			mLastItem = mCurItem;
		}

		if (offsetBaseLeft == 0) {
			if (targetPage == mLastItem) {
				pageOffset = 0;
			} else {
				pageOffset = (targetPage < mLastItem) ? -1.0f : 1.0f;
			}
		} else {
			targetPage = (direction < 0) ? ii.position : ii.position + 1;
			if ((direction < 0 && targetPage == mLastItem) || (direction > 0 && targetPage > mLastItem)) {
				pageOffset = offsetBaseLeft;
			} else if ((direction < 0 && targetPage < mLastItem) || (direction > 0 && targetPage == mLastItem)) {
				pageOffset = offsetBaseRight;
			}

			pageOffset = (float)(Math.round(pageOffset*1000))/1000;
		}

		mCalledSuper = false;
		LogUtils.d(TAG, "pageScrolled: targetPage=" + targetPage + ", pageOffset=" + pageOffset);
		onPageScrolled(targetPage, pageOffset, offsetPixels);
		if (!mCalledSuper)
		{
			throw new IllegalStateException("onPageScrolled did not call superclass implementation");
		}
		return true;
	}

	/**
	 * This method will be invoked when the current page is scrolled, either as
	 * part
	 * of a programmatically initiated smooth scroll or a user initiated touch
	 * scroll.
	 * If you override this method you must call through to the superclass
	 * implementation
	 * (e.g. super.onPageScrolled(position, offset, offsetPixels)) before
	 * onPageScrolled
	 * returns.
	 *
	 * @param position Position index of the first page currently being
	 *            displayed.
	 *            Page position+1 will be visible if positionOffset is nonzero.
	 * @param offset Value from [0, 1) indicating the offset from the page at
	 *            position.
	 * @param offsetPixels Value in pixels indicating the offset from position.
	 */
	protected void onPageScrolled(int position, float offset, int offsetPixels)
	{
		// Offset any decor views if needed - keep them on-screen at all times.
		if (mDecorChildCount > 0)
		{
			final int scrollX = getScrollX();
			final int scrollY = getScrollY();
			int paddingLeft = getPaddingLeft();
			int paddingRight = getPaddingRight();
			int paddingTop = getPaddingTop();
			int paddingBottom = getPaddingBottom();
			final int width = getWidth();
			final int height = getHeight();
			final int childCount = getChildCount();
			for (int i = 0; i < childCount; i++)
			{
				final View child = getChildAt(i);
				final LayoutParams lp = (LayoutParams) child.getLayoutParams();
				if (!lp.isDecor)
					continue;
				if (!mIsVertical)
				{
					final int hgrav = lp.gravity & Gravity.HORIZONTAL_GRAVITY_MASK;
					int childLeft = 0;
					switch (hgrav)
					{
						default:
							childLeft = paddingLeft;
							break;
						case Gravity.LEFT:
							childLeft = paddingLeft;
							paddingLeft += child.getWidth();
							break;
						case Gravity.CENTER_HORIZONTAL:
							childLeft = Math.max((width - child.getMeasuredWidth()) / 2, paddingLeft);
							break;
						case Gravity.RIGHT:
							childLeft = width - paddingRight - child.getMeasuredWidth();
							paddingRight += child.getMeasuredWidth();
							break;
					}
					childLeft += scrollX;

					final int childOffset = childLeft - child.getLeft();
					if (childOffset != 0)
					{
						child.offsetLeftAndRight(childOffset);
					}
				}
				else
				{
					final int vgrav = lp.gravity & Gravity.VERTICAL_GRAVITY_MASK;
					int childTop = 0;
					switch (vgrav)
					{
						default:
							childTop = paddingTop;
							break;
						case Gravity.TOP:
							childTop = paddingTop;
							paddingTop += child.getHeight();
							break;
						case Gravity.CENTER_VERTICAL:
							childTop = Math.max((height - child.getMeasuredHeight()) / 2, paddingTop);
							break;
						case Gravity.BOTTOM:
							childTop = height - paddingTop - child.getMeasuredHeight();
							paddingBottom += child.getMeasuredHeight();
							break;
					}
					childTop += scrollY;

					final int childOffset = childTop - child.getTop();
					if (childOffset != 0)
					{
						child.offsetLeftAndRight(childOffset);
					}
				}
			}
		}

		if (mOnPageChangeListener != null)
		{
			mOnPageChangeListener.onPageScrolled(position, offset, offsetPixels);
		}
		if (mInternalPageChangeListener != null)
		{
			mInternalPageChangeListener.onPageScrolled(position, offset, offsetPixels);
		}

		if (mPageTransformer != null)
		{
			if (!mIsVertical)
			{
				final int scrollX = getScrollX();
				final int childCount = getChildCount();
				for (int i = 0; i < childCount; i++)
				{
					final View child = getChildAt(i);
					final LayoutParams lp = (LayoutParams) child.getLayoutParams();

					if (lp.isDecor)
						continue;
					if (mIsVertical)
					{
						final float transformPos = (float) (child.getTop() - getScrollY()) / getClientHeight();
						mPageTransformer.transformPage(child, transformPos);
					}
					else
					{
						final float transformPos = (float) (child.getLeft() - scrollX) / getClientWidth();
						mPageTransformer.transformPage(child, transformPos);
					}

				}
			}
			else
			{
				final int scrollY = getScrollY();
				final int childCount = getChildCount();
				for (int i = 0; i < childCount; i++)
				{
					final View child = getChildAt(i);
					final LayoutParams lp = (LayoutParams) child.getLayoutParams();

					if (lp.isDecor)
						continue;

					final float transformPos = (float) (child.getTop() - scrollY) / getClientHeight();
					mPageTransformer.transformPage(child, transformPos);
				}
			}
		}

		mCalledSuper = true;
	}

	/* private */void completeScroll(boolean postEvents)
	{
		boolean needPopulate = mScrollState == SCROLL_STATE_SETTLING;
		if (needPopulate)
		{
			// Done with scroll, no longer want to cache view drawing.
			setScrollingCacheEnabled(false);
			mScroller.abortAnimation();
			int oldX = getScrollX();
			int oldY = getScrollY();
			int x = mScroller.getCurrX();
			int y = mScroller.getCurrY();
			if (oldX != x || oldY != y)
			{
				scrollTo(x, y);
			}
		}
		mPopulatePending = false;
		for (int i = 0; i < mItems.size(); i++)
		{
			ItemInfo ii = mItems.get(i);
			if (ii.scrolling)
			{
				needPopulate = true;
				ii.scrolling = false;
			}
		}
		if (needPopulate)
		{
			if (postEvents)
			{
				ViewCompatTool.postOnAnimation(this, mEndScrollRunnable);
			}
			else
			{
				mEndScrollRunnable.run();
			}
		}
	}

	protected int getGutterSize()
	{
		return mGutterSize;
	}

	protected boolean isGutterDrag(float x, float dx)
	{
		return (x < getGutterSize() && dx > 0) || (x > getWidth() - getGutterSize() && dx < 0);
	}

	/* private */void enableLayers(boolean enable)
	{
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final int layerType = enable ? View.LAYER_TYPE_HARDWARE : View.LAYER_TYPE_NONE;
			getChildAt(i).setLayerType(layerType, null);
		}
	}

	protected boolean checkChildCanScroll(int dx, int x, int y)
	{
		return ScrollChecker.canScroll(this, false, mIsVertical, dx, x, y);
	}

	public interface IDragChecker
	{
		boolean checkStartDrag(float xDiff, float yDiff, float touchSlop);
	}

	private IDragChecker mChecker;

	public void setDragChecker(IDragChecker checker)
	{
		this.mChecker = checker;
	}

	protected boolean checkStartDrag(float xDiff, float yDiff, float xStartPos, float yStartPos, boolean toLeft, boolean toTop)
	{
		if (mChecker == null)
		{
			Log.d("PageScroller", "checkStartDrag,deltaX=" + xDiff + ",deltaY=" + yDiff);
			if (mIsVertical)
			{
				return (!checkTouchSlop && yDiff > xDiff) || (yDiff > mTouchSlop && yDiff > xDiff);
			}
			else
			{
				return (!checkTouchSlop && xDiff > yDiff) || (xDiff > mTouchSlop && xDiff > yDiff);
			}
		}
		return mChecker.checkStartDrag(xDiff, yDiff, mTouchSlop);
	}

	public void consumeNextTouchDown()
	{
		mConsumeNextTouchDown = true;
	}

	@Override
	public boolean onInterceptTouchEvent(MotionEvent ev)
	{
		/*
		 * This method JUST determines whether we want to intercept the motion.
		 * If we return true, onMotionEvent will be called and we do the actual
		 * scrolling there.
		 */

		final int action = ev.getAction() & MotionEvent.ACTION_MASK;
		if (DEBUG)
		{
			Log.d(TAG, this + "viewpager onintercept ev=" + ev.getAction());
		}
		if (action == MotionEvent.ACTION_DOWN)
		{
			if (mConsumeNextTouchDown)
			{
				mConsumeNextTouchDown = false;
				return true;
			}
		}
		// Always take care of the touch gesture being complete.
		if (action == MotionEvent.ACTION_CANCEL || action == MotionEvent.ACTION_UP)
		{
			// Release the drag.
			mIsBeingDragged = false;
			mIsUnableToDrag = false;
			ignoreCheck = false;
			checkTouchSlop = true;
			mActivePointerId = INVALID_POINTER;
			if (mVelocityTracker != null)
			{
				mVelocityTracker.recycle();
				mVelocityTracker = null;
			}
			return false;
		}

		// Nothing more to do here if we have decided whether or not we
		// are dragging.
		if (action != MotionEvent.ACTION_DOWN)
		{
			if (mIsUnableToDrag || mForceUnableToDrag)
			{
				Log.d(TAG, "onInterceptTouchEvent,resutl false due to mIsUnableToDrag");
				// if (action != MotionEvent.ACTION_POINTER_DOWN)
				// {
				// final int activePointerId = mActivePointerId;
				// if (activePointerId == INVALID_POINTER)
				// {
				// return false;
				// }
				// final int pointerIndex =
				// ev.findPointerIndex(activePointerId);
				// if (pointerIndex != -1)
				// {
				// final float x = ev.getX(pointerIndex);
				// mLastMotionX = x;
				// final float y = ev.getY(pointerIndex);
				// mLastMotionY = y;
				// }
				// }
				return false;
			}
			if (mIsBeingDragged)
			{
				if (DEBUG)
				{
					Log.v(TAG, "action=" + action + ",Intercept returning true! due to mIsBeingDragged");
				}
				return true;
			}
		}

		switch (action)
		{
			case MotionEvent.ACTION_MOVE:
			{
				/*
				 * mIsBeingDragged == false, otherwise the shortcut would have
				 * caught it. Check
				 * whether the user has moved far enough from his original down
				 * touch.
				 */

				/*
				 * Locally do absolute value. mLastMotionY is set to the y value
				 * of the down event.
				 */
				final int activePointerId = mActivePointerId;
				if (activePointerId == INVALID_POINTER)
				{
					Log.d("PageScroller", "INVALID_POINTER");
					// If we don't have a valid id, the touch down wasn't on
					// content.
					break;
				}

				final int pointerIndex = ev.findPointerIndex(activePointerId);
				if (pointerIndex == -1)
				{
					break;
				}
				final float x = ev.getX(pointerIndex);
				final float dx = x - mLastMotionX;
				final float xDiff = Math.abs(dx);
				final float y = ev.getY(pointerIndex);
				final float yDiff = Math.abs(y - mInitialMotionY);
				final float dy = y - mLastMotionY;
				final float xStartPos = mLastMotionX;
				final float yStartPos = mLastMotionY;
				final boolean toLeft = dx < 0;
				final boolean toTop = dy < 0;
				if (DEBUG)
				{
					Log.v(TAG, "mlastMotionX= " + mLastMotionX);
					Log.v(TAG, "Moved x to " + x + "," + y + " diffx=" + dx + "," + yDiff);
				}
				if (mIsVertical)
				{
					if (!mScrollEnabled
							|| (dy != 0 && !isGutterDrag(mLastMotionY, dy) && (!ignoreCheck && checkChildCanScroll((int) dx, (int) x, (int) y))))
					{
						// Nested view has scrollable area under this point. Let
						// it
						// be handled there.
						Log.v(TAG, "checkChildCanScroll failed,return false");
						mLastMotionX = x;
						mLastMotionY = y;
						mIsUnableToDrag = true;
						return false;
					}
				}
				else
				{
					if (!mScrollEnabled
							|| (dx != 0 && !isGutterDrag(mLastMotionX, dx) && (!ignoreCheck && checkChildCanScroll((int) dx, (int) x, (int) y))))
					{
						// Nested view has scrollable area under this point. Let
						// it
						// be handled there.
						Log.v(TAG, "checkChildCanScroll failed,return false");
						mLastMotionX = x;
						mLastMotionY = y;
						mIsUnableToDrag = true;
						return false;
					}
				}
				if (checkStartDrag(xDiff, yDiff, xStartPos, yStartPos, toLeft, toTop))
				{
					if (DEBUG)
						Log.v(TAG, "Starting drag!");

					if (onStartDrag(dx < 0))
					{
						mIsBeingDragged = true;
						setScrollState(SCROLL_STATE_DRAGGING);
						if (mDisallowInterceptWhenDrag)
						{
							ViewParent parent = getParent();
							if (parent != null)
							{
								parent.requestDisallowInterceptTouchEvent(true);
							}
						}
						if (mIsVertical)
						{
							if (checkTouchSlop)
							{
								mLastMotionY = dy > 0 ? mInitialMotionY + mTouchSlop : mInitialMotionY - mTouchSlop;
							}
							mLastMotionX = x;
						}
						else
						{
							if (checkTouchSlop)
							{
								mLastMotionX = dx > 0 ? mInitialMotionX + mTouchSlop : mInitialMotionX - mTouchSlop;
							}
							mLastMotionY = y;
						}
						setScrollingCacheEnabled(true);
					}
				}
				else if (!mIsVertical && yDiff > mTouchSlop)
				{
					// The finger has moved enough in the vertical
					// direction to be counted as a drag... abort
					// any attempt to drag horizontally, to work correctly
					// with children that have scrolling containers.
					if (DEBUG)
					{
						Log.v(TAG, "Starting unable to drag!");
					}
					mIsUnableToDrag = true;
				}
				else if (mIsVertical && xDiff > mTouchSlop)
				{
					if (DEBUG)
					{
						Log.v(TAG, "Starting unable to drag!");
					}
					mIsUnableToDrag = true;
				}
				if (mIsBeingDragged)
				{
					if (DEBUG)
					{
						Log.v(TAG, "onIntercept dragged" + mLastMotionX);
					}
					// Scroll to follow the motion event
					if (performDrag(mIsVertical ? y : x))
					{
						ViewCompatTool.postInvalidateOnAnimation(this);
					}
				}
				break;
			}

			case MotionEvent.ACTION_DOWN:
			{
				/*
				 * Remember location of down touch.
				 * ACTION_DOWN always refers to pointer index 0.
				 */
				ignoreCheck = false;
				mLastMotionX = mInitialMotionX = ev.getX();
				mLastMotionY = mInitialMotionY = ev.getY();
				mActivePointerId = ev.getPointerId(0);
				mIsUnableToDrag = false;

				mScroller.computeScrollOffset();
				if (mEnableCatching && mScrollState == SCROLL_STATE_SETTLING
						&& ((!mIsVertical && Math.abs(mScroller.getFinalX() - mScroller.getCurrX()) > mCloseEnough)
								|| (mIsVertical && mScroller.getFinalY() - mScroller.getCurrY() > mCloseEnough)))
				{
					// Let the user 'catch' the pager as it animates.
					mScroller.abortAnimation();
					if (mDisallowInterceptWhenDrag)
					{
						ViewParent parent = getParent();
						if (parent != null)
						{
							parent.requestDisallowInterceptTouchEvent(true);
						}
					}
					mPopulatePending = false;
					populate();
					mIsBeingDragged = true;
					setScrollState(SCROLL_STATE_DRAGGING);

				}
				else if (!isGallery())
				{
					completeScroll(false);
					mIsBeingDragged = false;
				}

				if (DEBUG)
				{
					Log.v("TMYTOUCH", "Down at " + mLastMotionX + "," + mLastMotionY + " mIsBeingDragged=" + mIsBeingDragged + "mIsUnableToDrag="
							+ mIsUnableToDrag);
				}
				break;
			}

			case MotionEvent.ACTION_POINTER_UP:
				onSecondaryPointerUp(ev);
				break;
		}

		if (mVelocityTracker == null)
		{
			mVelocityTracker = VelocityTracker.obtain();
		}
		mVelocityTracker.addMovement(ev);

		/*
		 * The only time we want to intercept motion events is if we are in the
		 * drag mode.
		 */
		return mIsBeingDragged;
	}

	@Override
	public boolean onTouchEvent(MotionEvent ev)
	{
		if (mFakeDragging)
		{
			// A fake drag is in progress already, ignore this real one
			// but still eat the touch events.
			// (It is likely that the user is multi-touching the screen.)
			return true;
		}
		if (mForceUnableToDrag)
		{
			return false;
		}
		if (ev.getAction() == MotionEvent.ACTION_DOWN && ev.getEdgeFlags() != 0)
		{
			// Don't handle edge touches immediately -- they may actually belong
			// to one of our
			// descendants.
			return false;
		}
		if (DEBUG)
		{
			Log.d(TAG, this + "viewpager ontouchevent ev=" + ev.getAction());
		}
		// if (mAdapter == null || mAdapter.getCount() == 0)
		// {
		// // Nothing to present or scroll; nothing to touch.
		// return false;
		// }

		if (mVelocityTracker == null)
		{
			mVelocityTracker = VelocityTracker.obtain();
		}
		mVelocityTracker.addMovement(ev);

		final int action = ev.getAction();
		boolean needsInvalidate = false;

		switch (action & MotionEvent.ACTION_MASK)
		{
			case MotionEvent.ACTION_DOWN:
			{
				if (mEnableCatching && mScroller != null && !mScroller.isFinished())
				{
					mScroller.abortAnimation();
					mPopulatePending = false;
					populate();
					mIsBeingDragged = true;
					setScrollState(SCROLL_STATE_DRAGGING);
				}
				ignoreCheck = false;
				// Remember where the motion event started
				try
				{
					mLastMotionX = mInitialMotionX = ev.getX();
					mLastMotionY = mInitialMotionY = ev.getY();
				}
				catch (Exception e)
				{

				}
				mActivePointerId = ev.getPointerId(0);
				break;
			}
			case MotionEvent.ACTION_MOVE:

				if (!mIsBeingDragged)
				{
					if (mActivePointerId == INVALID_POINTER)
					{
						Log.d("PageScroller,onTouch", "INVALID_POINTER");
						// If we don't have a valid id, the touch down wasn't on
						// content.
						break;
					}
					final int pointerIndex = ev.findPointerIndex(mActivePointerId);
					if (pointerIndex == -1)
					{
						break;
					}
					float x = 0;
					float y = 0;
					try
					{
						x = ev.getX(pointerIndex);
						y = ev.getY(pointerIndex);
					}
					catch (Exception e)
					{

					}
					final float xDiff = Math.abs(x - mLastMotionX);
					final float yDiff = Math.abs(y - mLastMotionY);
					if (DEBUG)
					{
						Log.d(TAG, "Moved x to " + x + "," + y + " diff=" + xDiff + "," + yDiff);
					}
					if (mIsVertical)
					{
						if (yDiff > mTouchSlop && yDiff > xDiff && mScrollEnabled)
						{
							if (onStartDrag(y - mLastMotionY < 0))
							{
								if (DEBUG)
								{
									Log.v(TAG, "Starting drag onintercept!");
								}
								mIsBeingDragged = true;
								mLastMotionY = y - mInitialMotionY > 0 ? mInitialMotionY + mTouchSlop : mInitialMotionY - mTouchSlop;
								mLastMotionX = x;
								setScrollState(SCROLL_STATE_DRAGGING);
								if (mDisallowInterceptWhenDrag)
								{
									ViewParent parent = getParent();
									if (parent != null)
									{
										parent.requestDisallowInterceptTouchEvent(true);
									}
								}
								setScrollingCacheEnabled(true);
							}
						}
					}
					else
					{
						if (xDiff > mTouchSlop && xDiff > yDiff && mScrollEnabled)
						{
							if (onStartDrag(x - mLastMotionX < 0))
							{
								if (DEBUG)
								{
									Log.v(TAG, "Starting drag onintercept!");
								}
								mIsBeingDragged = true;
								mLastMotionX = x - mInitialMotionX > 0 ? mInitialMotionX + mTouchSlop : mInitialMotionX - mTouchSlop;
								mLastMotionY = y;
								setScrollState(SCROLL_STATE_DRAGGING);
								if (mDisallowInterceptWhenDrag)
								{
									ViewParent parent = getParent();
									if (parent != null)
									{
										parent.requestDisallowInterceptTouchEvent(true);
									}
								}
								setScrollingCacheEnabled(true);
							}
						}
					}
				}
				// Not else! Note that mIsBeingDragged can be set above.
				if (mIsBeingDragged)
				{
					// Scroll to follow the motion event
					if (DEBUG)
					{
						Log.d(TAG, "ontouche dragged" + mLastMotionX);
					}
					if (mActivePointerId == INVALID_POINTER)
					{
						Log.d("PageScroller,onTouch", "INVALID_POINTER");
						break;
					}
					final int activePointerIndex = ev.findPointerIndex(mActivePointerId);
					if (activePointerIndex == -1)
					{
						break;
					}
					try
					{
						if (mIsVertical)
						{
							final float y = ev.getY(activePointerIndex);
							needsInvalidate |= performDrag(y);
						}
						else
						{
							final float x = ev.getX(activePointerIndex);
							needsInvalidate |= performDrag(x);
						}
						if (mIsUnableToDrag)
						{
							ViewParent parent = getParent();
							if (parent != null)
							{
								parent.requestDisallowInterceptTouchEvent(true);
							}
							return false;
						}
					}
					catch (Exception e)
					{

					}
				}
				break;
			case MotionEvent.ACTION_UP:
				if (mIsBeingDragged)
				{
					int initialVelocity = 0;
					final VelocityTracker velocityTracker = mVelocityTracker;
					if (velocityTracker != null)
					{
						velocityTracker.computeCurrentVelocity(1000, mMaximumVelocity);
						initialVelocity = mIsVertical ? (int) velocityTracker.getYVelocity(mActivePointerId)
								: (int) velocityTracker.getXVelocity(mActivePointerId);
					}
					if (isGallery())
					{
						upAction(initialVelocity, ev);
					}
					else
					{
						mPopulatePending = true;
						final int size = getClientSize();
						final int scroll = mIsVertical ? getScrollY() : getScrollX();
						int currentPage = 0;
						float pageOffset = 0;
						final ItemInfo ii = infoForCurrentScrollPosition();
						if (ii != null)
						{
							try
							{
								currentPage = ii.position;
								pageOffset = (((float) scroll / size) - ii.offset) / ii.sizeFactor;
								final int activePointerIndex = ev.findPointerIndex(mActivePointerId);
								final float x = ev.getX(activePointerIndex);
								final float y = ev.getY(activePointerIndex);
								final int totalDelta = mIsVertical ? (int) (y - mInitialMotionY) : (int) (x - mInitialMotionX);
								int nextPage = determineTargetPage(currentPage, pageOffset, initialVelocity, totalDelta);
								mTouching = true;
								setCurrentItemInternal(nextPage, true, true, 0, initialVelocity);
								mTouching = false;
							}
							catch (ArrayIndexOutOfBoundsException e)
							{

							}
							catch (IllegalArgumentException e1)
							{

							}
						}
					}
					Log.d(TAG, "ACTION_UP");
					mActivePointerId = INVALID_POINTER;
					ignoreCheck = false;
					endDrag();
					// needsInvalidate = (mLeftEdge.onRelease() |
					// mRightEdge.onRelease());
				}
				break;
			case MotionEvent.ACTION_CANCEL:
				if (mIsBeingDragged)
				{
					ignoreCheck = false;
					if (isGallery())
					{
						upAction(0, ev);
					}
					else
					{
						scrollToItem(mCurItem, true, 0, false);
					}
					mActivePointerId = INVALID_POINTER;
					endDrag();
					// needsInvalidate = mLeftEdge.onRelease() |
					// mRightEdge.onRelease();
				}
				break;
			case MotionEvent.ACTION_POINTER_DOWN:
			{
				final int index = ev.getActionIndex();
				try
				{
					mLastMotionX = ev.getX(index);
					mLastMotionY = ev.getY(index);
				}
				catch (Exception e)
				{

				}
				mActivePointerId = ev.getPointerId(index);
				break;
			}
			case MotionEvent.ACTION_POINTER_UP:
				onSecondaryPointerUp(ev);
				try
				{
					mLastMotionX = ev.getX(ev.findPointerIndex(mActivePointerId));
					mLastMotionY = ev.getY(ev.findPointerIndex(mActivePointerId));
				}
				catch (Exception e)
				{

				}
				break;
		}
		if (needsInvalidate)
		{
			ViewCompatTool.postInvalidateOnAnimation(this);
		}
		return true;
	}

	public void cancelDrag()
	{
		ignoreCheck = false;
		endDrag();
		mScrollState = SCROLL_STATE_IDLE;
	}

	protected int getLeftBoundPageIndex()
	{
		return 0;
	}

	protected int getRightBoundPageIndex()
	{
		return getPageCount() - 1;
	}

	private int findNextPosition(boolean right)
	{
		if (getWidth() == 0)
		{
			return 0;
		}
		if (right)
		{
			return getScrollX() / getWidth() + 1;
		}
		else
		{
			return getScrollX() / getWidth();
		}

	}

	/* private */void upAction(int velocity, MotionEvent ev)
	{
		final int width = getClientWidth();
		final int scrollX = getScrollX();
		if (width == 0)
		{
			return;
		}
		final int activePointerIndex = ev.findPointerIndex(mActivePointerId);
		float x = mInitialMotionX;
		try
		{
			x = ev.getX(activePointerIndex);
		}
		catch (Exception e)
		{

		}
		final int totalDelta = (int) (x - mInitialMotionX);
		int whichScreen;
		if (Math.abs(totalDelta) > mFlingDistance && Math.abs(velocity) > mMinimumVelocity)
		{
			whichScreen = findNextPosition(velocity < 0);
		}
		else
		{
			int rest = scrollX - scrollX / width * width;
			if (rest > width * 0.5)
			{
				whichScreen = scrollX / width + 1;
			}
			else
			{
				whichScreen = scrollX / width;
			}
		}

		final int screen = Math.min(Math.max(whichScreen, getLeftBoundPageIndex()), getRightBoundPageIndex());
		snapToScreen(screen, velocity, true);
	}

	public void snapToScreen(int whichScreen, int velocity, boolean settle)
	{
		snapToScreen(whichScreen, velocity, settle, true);
	}

	public int getNextScreen()
	{
		return mNextScreen;
	}

	public void snapToScreen(int whichScreen, int velocity, boolean settle, boolean animation)
	{
		if (animation)
		{
			whichScreen = Math.max(0, Math.min(whichScreen, getRightBoundPageIndex()));


			mNextScreen = whichScreen;

			final int screenDelta = Math.max(1, Math.abs(whichScreen - mCurrentScreen));
			final int newX = whichScreen * getWidth();
			final int delta = newX - getScrollX();
			int duration = (screenDelta + 1) * 100;
			if (DEBUG)
			{
				Log.d("galleryTMY", "snap" + " " + whichScreen + ",newX=" + newX);
			}
			// try
			// {
			// Log.d("galleryTMY", "stacktrack " + _Exception(new Exception()));
			// }
			// catch (IOException e)
			// {
			// // TODO Auto-generated catch block
			// e.printStackTrace();
			// }
			if (!mScroller.isFinished())
			{
				mScroller.abortAnimation();
			}
			velocity = Math.abs(velocity);
			if (velocity > 0)
			{
				duration += (duration / (velocity / BASELINE_FLING_VELOCITY)) * FLING_VELOCITY_INFLUENCE;
			}
			else
			{
				duration += 100;
			}
			setScrollState(SCROLL_STATE_SETTLING);
			if (delta == 0)
			{
				setScrollState(SCROLL_STATE_IDLE);
			}

			mScroller.startScroll(getScrollX(), 0, delta, 0, GALLERY_SCROLL_DURING);
			if (mOnPageChangeListener != null)
			{
				mOnPageChangeListener.onPageSelected(whichScreen);
			}
			if (mInternalPageChangeListener != null)
			{
				mInternalPageChangeListener.onPageSelected(whichScreen);
			}
			invalidate();
		}
		else
		{
			setCurrentPage(whichScreen);
		}
	}

	protected int getLeftEdge()
	{
		return 0;
	}

	protected boolean performDrag(float x)
	{
		boolean needsInvalidate = false;
		if (!mIsVertical)
		{
			float deltaX = mLastMotionX - x;
			mLastMotionX = x;
			float oldScrollX = getScrollX();
			float scrollX = oldScrollX + deltaX;
			final int width = getClientWidth();
			final boolean isGallery = mAdapter == null;
			float leftBound = isGallery ? getLeftEdge() : width * mFirstOffset;
			float rightBound = isGallery ? getRightEdge() : width * mLastOffset;

			if (!isGallery)
			{
				float minOffset = Float.MAX_VALUE;
				float maxOffset = Float.MIN_VALUE;
				for (int i = 0; i < mItems.size(); i++)
				{
					float off = mItems.get(i).offset;
					if (off < minOffset)
					{
						minOffset = off;
					}
					if (off > maxOffset)
					{
						maxOffset = off;
					}
				}
				leftBound = width * (mMinOffset == Float.MIN_VALUE ? minOffset : mMinOffset);
				rightBound = width * (mMaxOffset == Float.MAX_VALUE ? maxOffset : mMaxOffset);
				Log.d(TAG, this + "performDrag,scrollX=" + oldScrollX + ",leftBounds=" + leftBound + ",rightBounds=" + rightBound);
			}
			else
			{
				leftBound = getLeftEdge();
				rightBound = getRightEdge();
			}

			if (scrollX < leftBound)
			{
				if (!onLeftGlideBlank() && mLeftDragOutSizeEnable)
				{
					scrollX -= deltaX;
					deltaX = deltaX / 4;
					scrollX += deltaX;

					if (scrollX < leftBound - width / 3)
					{
						scrollX = leftBound - width / 3;
					}
					else
					{
						needsInvalidate = true;
					}
				}
				else
				{
					scrollX = leftBound;
					ViewParent parent = getParent();
					if (parent != null)
					{
						parent.requestDisallowInterceptTouchEvent(false);
					}
					if (!mLeftDragOutSizeEnable)
					{
						mIsUnableToDrag = true;
					}
				}

			}
			else if (scrollX > rightBound)
			{
				if (!onRightGlideBlank() && mRightDragOutSizeEnable)
				{
					scrollX -= deltaX;
					deltaX = deltaX / 4;
					scrollX += deltaX;

					if (scrollX > rightBound + width / 3)
					{
						scrollX = rightBound + width / 3;
					}
					else
					{
						needsInvalidate = true;
					}
				}
				else
				{
					scrollX = rightBound;
					ViewParent parent = getParent();
					if (parent != null)
					{
						parent.requestDisallowInterceptTouchEvent(false);
					}
					if (!mRightDragOutSizeEnable)
					{
						mIsUnableToDrag = true;
					}
				}
			}
			// Don't lose the rounded component
			mLastMotionX += scrollX - (int) scrollX;
			scrollTo((int) scrollX, getScrollY());
			pageScrolled((int) scrollX, deltaX > 0 ? 1 : -1);
			return needsInvalidate;
		}
		else
		{
			float y = x;
			float deltaY = mLastMotionY - y;
			Log.d(TAG, "performDrag,x=" + y + ",delta=" + deltaY + ",mLasty=" + mLastMotionY);
			mLastMotionY = y;
			float oldScrollY = getScrollY();
			float scrollY = oldScrollY + deltaY;
			final int size = getClientSize();

			float topBound = size * mFirstOffset;
			float bottomBound = size * mLastOffset;

			boolean topAbsolute = true;
			boolean bottomAbsolute = true;
			if (mItems.size() > 0)
			{
				final ItemInfo firstItem = mItems.get(0);
				final ItemInfo lastItem = mItems.get(mItems.size() - 1);
				if (firstItem.position != 0)
				{
					topAbsolute = false;
					topBound = firstItem.offset * size;
				}
				if (lastItem.position != mAdapter.getCount() - 1)
				{
					bottomAbsolute = false;
					bottomBound = lastItem.offset * size;
				}
			}

			if (scrollY < topBound && topAbsolute)
			{
				if (!onLeftGlideBlank() && mLeftDragOutSizeEnable)
				{
					scrollY -= deltaY;
					deltaY = deltaY / 4;
					scrollY += deltaY;

					if (scrollY < topBound - size / 3)
					{
						scrollY = topBound - size / 3;
					}
					else
					{
						needsInvalidate = true;
					}
				}
				else
				{
					scrollY = topBound;
					ViewParent parent = getParent();
					if (parent != null)
					{
						parent.requestDisallowInterceptTouchEvent(false);
					}
				}

			}
			else if (scrollY > bottomBound && bottomAbsolute)
			{
				if (!onRightGlideBlank() && mRightDragOutSizeEnable)
				{
					scrollY -= deltaY;
					deltaY = deltaY / 4;
					scrollY += deltaY;

					if (scrollY > bottomBound + size / 3)
					{
						scrollY = bottomBound + size / 3;
					}
					else
					{
						needsInvalidate = true;
					}
				}
				else
				{
					scrollY = bottomBound;
					ViewParent parent = getParent();
					if (parent != null)
					{
						parent.requestDisallowInterceptTouchEvent(false);
					}
				}
			}
			// Don't lose the rounded component
			mLastMotionY += scrollY - (int) scrollY;
			scrollTo(getScrollX(), (int) scrollY);
			pageScrolled((int) scrollY, deltaY > 0 ? 1 : -1);
			return needsInvalidate;
		}
	}

	/* private */boolean onRightGlideBlank()
	{
		if (DEBUG)
		{
			Log.d(TAG, "onrightGlideBlank");
		}
		return mRightGlideBlankListener != null && mRightGlideBlankListener.onGlideBlank(false);
	}

	protected float getRightEdge()
	{
		// TODO Auto-generated method stub
		int pageCount = getPageCount();
		View child = getChildAt(pageCount);
		if (child != null)
		{
			return child.getRight() - getWidth();
		}
		return (pageCount - 1) * getWidth();
	}

	public int getPageCount()
	{
		return isGallery() ? getChildCount() : mAdapter == null ? 0 : mAdapter.getCount();
	}

	/* private */boolean onLeftGlideBlank()
	{
		// TODO Auto-generated method stub
		if (DEBUG)
		{
			Log.d(TAG, "onLeftGlideBlank");
		}
		return mLeftGlideBlankListener != null && mLeftGlideBlankListener.onGlideBlank(true);
	}

	/**
	 * @return Info about the page at the current scroll position.
	 *         This can be synthetic for a missing middle page; the
	 *         'object'
	 *         field can be null.
	 */
	/* private */ItemInfo infoForCurrentScrollPosition()
	{
		final int size = getClientSize();
		final float scrollOffset = size > 0 ? (mIsVertical ? ((float) getScrollY()) / size : ((float) getScrollX()) / size) : 0;
		final float marginOffset = size > 0 ? (float) mPageMargin / size : 0;
		int lastPos = -1;
		float lastOffset = 0.f;
		float lastSize = 0.f;
		boolean first = true;

		ItemInfo lastItem = null;
		for (int i = 0; i < mItems.size(); i++)
		{
			ItemInfo ii = mItems.get(i);
			float offset;
			if (!first && ii.position != lastPos + 1)
			{
				// Create a synthetic item for a missing page.
				ii = mTempItem;
				ii.offset = lastOffset + lastSize + marginOffset;
				ii.position = lastPos + 1;
				ii.sizeFactor = mAdapter.getPageSize(ii.position);
				i--;
			}
			offset = ii.offset;

			final float leftBound = offset;
			final float rightBound = offset + ii.sizeFactor + marginOffset;
			if (first || scrollOffset >= leftBound)
			{
				if (scrollOffset < rightBound || i == mItems.size() - 1)
				{
					return ii;
				}
			}
			else
			{
				return lastItem;
			}
			first = false;
			lastPos = ii.position;
			lastOffset = offset;
			lastSize = ii.sizeFactor;
			lastItem = ii;
		}

		return lastItem;
	}

	/* private */int determineTargetPage(int currentPage, float pageOffset, int velocity, int deltaX)
	{
		int targetPage;
		if (Math.abs(deltaX) > mFlingDistance && Math.abs(velocity) > mMinimumVelocity)
		{
			targetPage = velocity > 0 ? currentPage : currentPage + 1;
		}
		else
		{
			final float truncator = currentPage >= mCurItem ? 0.4f : 0.6f;
			targetPage = (int) (currentPage + pageOffset + truncator);
		}

		if (mItems.size() > 0)
		{
			final ItemInfo firstItem = mMinPage == Integer.MIN_VALUE ? mItems.get(0) : infoForPosition(mMinPage);
			final ItemInfo lastItem = mMaxPage == Integer.MAX_VALUE ? mItems.get(mItems.size() - 1) : infoForPosition(mMaxPage);

			// Only let the user target pages we have items for
			targetPage = Math.max(firstItem.position, Math.min(targetPage, lastItem.position));
		}

		return targetPage;
	}

	// @Override
	// public void draw(Canvas canvas)
	// {
	// super.draw(canvas);
	// boolean needsInvalidate = false;
	//
	// // final int overScrollMode = ViewCompat.getOverScrollMode(this);
	// // if (overScrollMode == ViewCompat.OVER_SCROLL_ALWAYS
	// // || (overScrollMode == ViewCompat.OVER_SCROLL_IF_CONTENT_SCROLLS &&
	// // mAdapter != null && mAdapter.getCount() > 1))
	// // {
	// // if (!mLeftEdge.isFinished())
	// // {
	// // final int restoreCount = canvas.save();
	// // final int height = getHeight() - getPaddingTop() -
	// // getPaddingBottom();
	// // final int width = getWidth();
	// //
	// // canvas.rotate(270);
	// // canvas.translate(-height + getPaddingTop(), mFirstOffset *
	// // width);
	// // mLeftEdge.setSize(height, width);
	// // needsInvalidate |= mLeftEdge.draw(canvas);
	// // canvas.restoreToCount(restoreCount);
	// // }
	// // if (!mRightEdge.isFinished())
	// // {
	// // final int restoreCount = canvas.save();
	// // final int width = getWidth();
	// // final int height = getHeight() - getPaddingTop() -
	// // getPaddingBottom();
	// //
	// // canvas.rotate(90);
	// // canvas.translate(-getPaddingTop(), -(mLastOffset + 1) * width);
	// // mRightEdge.setSize(height, width);
	// // needsInvalidate |= mRightEdge.draw(canvas);
	// // canvas.restoreToCount(restoreCount);
	// // }
	// // }
	// // else
	// // {
	// // // mLeftEdge.finish();
	// // // mRightEdge.finish();
	// // }
	//
	// if (needsInvalidate)
	// {
	// // Keep animating
	// ViewCompat.postInvalidateOnAnimation(this);
	// }
	// }

	@Override
	protected void onDraw(Canvas canvas)
	{
		super.onDraw(canvas);

		// Draw the margin drawable between pages if needed.
		if (mPageMargin > 0 && mMarginDrawable != null && mItems.size() > 0 && mAdapter != null)
		{
			final int scrollX = getScrollX();
			final int width = getWidth();

			final float marginOffset = (float) mPageMargin / width;
			int itemIndex = 0;
			ItemInfo ii = mItems.get(0);
			float offset = ii.offset;
			final int itemCount = mItems.size();
			final int firstPos = ii.position;
			final int lastPos = mItems.get(itemCount - 1).position;
			for (int pos = firstPos; pos < lastPos; pos++)
			{
				while (pos > ii.position && itemIndex < itemCount)
				{
					ii = mItems.get(++itemIndex);
				}

				float drawAt;
				if (pos == ii.position)
				{
					drawAt = (ii.offset + ii.sizeFactor) * width;
					offset = ii.offset + ii.sizeFactor + marginOffset;
				}
				else
				{
					float widthFactor = mAdapter.getPageSize(pos);
					drawAt = (offset + widthFactor) * width;
					offset += widthFactor + marginOffset;
				}

				if (drawAt + mPageMargin > scrollX)
				{
					mMarginDrawable.setBounds((int) drawAt, mTopPageBounds, (int) (drawAt + mPageMargin + 0.5f), mBottomPageBounds);
					mMarginDrawable.draw(canvas);
				}

				if (drawAt > scrollX + width)
				{
					break; // No more visible, no sense in continuing
				}
			}
		}
	}

  @Override
  public boolean canScrollHorizontally(int direction) {
    if (!mScrollEnabled) {
      return false;
    }
    return horizontalCanScroll(direction);
  }

  @Override
  public boolean canScrollVertically(int direction) {
    if (!mScrollEnabled) {
      return false;
    }
    return verticalCanScroll(direction);
  }

	protected boolean onStartDrag(boolean left) {
    if (left) {
      return horizontalCanScroll(1);
    } else {
      return horizontalCanScroll(-1);
    }
  }

	/**
	 * Start a fake drag of the pager.
	 * <p/>
	 * <p/>
	 * A fake drag can be useful if you want to synchronize the motion of the
	 * QBViewPager with the touch scrolling of another view, while still letting
	 * the QBViewPager control the snapping motion and fling behavior. (e.g.
	 * parallax-scrolling tabs.) Call {@link #fakeDragBy(float)} to simulate the
	 * actual drag motion. Call {@link #endFakeDrag()} to complete the fake drag
	 * and fling as necessary.
	 * <p/>
	 * <p/>
	 * During a fake drag the QBViewPager will ignore all touch events. If a
	 * real drag is already in progress, this method will return false.
	 *
	 * @return true if the fake drag began successfully, false if it could not
	 *         be started.
	 * @see #fakeDragBy(float)
	 * @see #endFakeDrag()
	 */
	public boolean beginFakeDrag()
	{
		if (mIsBeingDragged)
		{
			return false;
		}
		mFakeDragging = true;
		setScrollState(SCROLL_STATE_DRAGGING);
		mInitialMotionX = mLastMotionX = 0;
		if (mVelocityTracker == null)
		{
			mVelocityTracker = VelocityTracker.obtain();
		}
		else
		{
			mVelocityTracker.clear();
		}
		final long time = SystemClock.uptimeMillis();
		final MotionEvent ev = MotionEvent.obtain(time, time, MotionEvent.ACTION_DOWN, 0, 0, 0);
		mVelocityTracker.addMovement(ev);
		ev.recycle();
		mFakeDragBeginTime = time;
		return true;
	}

	/**
	 * End a fake drag of the pager.
	 *
	 * @see #beginFakeDrag()
	 * @see #fakeDragBy(float)
	 */
	public void endFakeDrag()
	{
		if (!mFakeDragging)
		{
			throw new IllegalStateException("No fake drag in progress. Call beginFakeDrag first.");
		}

		final VelocityTracker velocityTracker = mVelocityTracker;
		velocityTracker.computeCurrentVelocity(1000, mMaximumVelocity);
		int initialVelocity = (int) velocityTracker.getXVelocity(mActivePointerId);
		mPopulatePending = true;
		final int width = getClientWidth();
		final int scrollX = getScrollX();
		final ItemInfo ii = infoForCurrentScrollPosition();
		final int currentPage = ii.position;
		final float pageOffset = (((float) scrollX / width) - ii.offset) / ii.sizeFactor;
		final int totalDelta = (int) (mLastMotionX - mInitialMotionX);
		int nextPage = determineTargetPage(currentPage, pageOffset, initialVelocity, totalDelta);
		setCurrentItemInternal(nextPage, true, true, 0, initialVelocity);
		endDrag();

		mFakeDragging = false;
	}

	/**
	 * Fake drag by an offset in pixels. You must have called
	 * {@link #beginFakeDrag()} first.
	 *
	 * @param xOffset Offset in pixels to drag by.
	 * @see #beginFakeDrag()
	 * @see #endFakeDrag()
	 */
	public void fakeDragBy(float xOffset)
	{
		if (!mFakeDragging)
		{
			throw new IllegalStateException("No fake drag in progress. Call beginFakeDrag first.");
		}

		mLastMotionX += xOffset;

		float oldScrollX = getScrollX();
		float scrollX = oldScrollX - xOffset;
		final int width = getClientWidth();

		float leftBound = width * mFirstOffset;
		float rightBound = width * mLastOffset;

		final ItemInfo firstItem = mItems.get(0);
		final ItemInfo lastItem = mItems.get(mItems.size() - 1);
		if (firstItem.position != 0)
		{
			leftBound = firstItem.offset * width;
		}
		if (lastItem.position != mAdapter.getCount() - 1)
		{
			rightBound = lastItem.offset * width;
		}

		if (scrollX < leftBound)
		{
			scrollX = leftBound;
		}
		else if (scrollX > rightBound)
		{
			scrollX = rightBound;
		}
		// Don't lose the rounded component
		mLastMotionX += scrollX - (int) scrollX;
		scrollTo((int) scrollX, getScrollY());
		pageScrolled((int) scrollX, xOffset > 0 ? 1 : -1);

		// Synthesize an event for the VelocityTracker.
		final long time = SystemClock.uptimeMillis();
		final MotionEvent ev = MotionEvent.obtain(mFakeDragBeginTime, time, MotionEvent.ACTION_MOVE, mLastMotionX, 0, 0);
		mVelocityTracker.addMovement(ev);
		ev.recycle();
	}

	/**
	 * Returns true if a fake drag is in progress.
	 *
	 * @return true if currently in a fake drag, false otherwise.
	 * @see #beginFakeDrag()
	 * @see #fakeDragBy(float)
	 * @see #endFakeDrag()
	 */
	public boolean isFakeDragging()
	{
		return mFakeDragging;
	}

	/* private */void onSecondaryPointerUp(MotionEvent ev)
	{
		final int pointerIndex = ev.getActionIndex();
		final int pointerId = ev.getPointerId(pointerIndex);
		if (pointerId == mActivePointerId)
		{
			// This was our active pointer going up. Choose a new
			// active pointer and adjust accordingly.
			try
			{
				final int newPointerIndex = pointerIndex == 0 ? 1 : 0;
				mLastMotionX = ev.getX(newPointerIndex);
				mLastMotionY = ev.getY(newPointerIndex);
				mActivePointerId = ev.getPointerId(newPointerIndex);
			}
			catch (Exception e)
			{

			}
			if (mVelocityTracker != null)
			{
				mVelocityTracker.clear();
			}
		}
	}

	/* private */void endDrag()
	{
		Log.d(TAG, "endDrag");
		mIsBeingDragged = false;
		mIsUnableToDrag = false;
		checkTouchSlop = true;
		if (mVelocityTracker != null)
		{
			mVelocityTracker.recycle();
			mVelocityTracker = null;
		}
	}

	protected void setScrollingCacheEnabled(boolean enabled)
	{
		if (mScrollingCacheEnabled != enabled)
		{
			mScrollingCacheEnabled = enabled;
			final int size = getChildCount();
			for (int i = 0; i < size; ++i)
			{
				final View child = getChildAt(i);
				if (child != null && child.getVisibility() != GONE)
				{
					child.setDrawingCacheEnabled(enabled);
				}
			}
		}
	}

	// /**
	// * Tests scrollability within child views of v given a delta of dx.
	// *
	// * @param v View to test for horizontal scrollability
	// * @param checkV Whether the view v passed should itself be checked for
	// * scrollability (true),
	// * or just its children (false).
	// * @param dx Delta scrolled in pixels
	// * @param x X coordinate of the active touch point
	// * @param y Y coordinate of the active touch point
	// * @return true if child views of v can be scrolled by delta of dx.
	// */
	// protected boolean canScroll(View v, boolean checkV, int dx, int x, int y)
	// {
	// if (v instanceof ViewGroup)
	// {
	// final ViewGroup group = (ViewGroup) v;
	// final int scrollX = v.getScrollX();
	// final int scrollY = v.getScrollY();
	// final int count = group.getChildCount();
	// // Count backwards - let topmost views consume scroll distance
	// // first.
	// for (int i = count - 1; i >= 0; i--)
	// {
	// // TODO: Add versioned support here for transformed views.
	// // This will not work for transformed views in Honeycomb+
	// final View child = group.getChildAt(i);
	// if (x + scrollX >= child.getLeft() && x + scrollX < child.getRight() && y
	// + scrollY >= child.getTop()
	// && y + scrollY < child.getBottom() && canScroll(child, true, dx, x +
	// scrollX - child.getLeft(), y + scrollY - child.getTop()))
	// {
	// return true;
	// }
	// }
	// }
	//
	// return checkV && ViewCompat.canScrollHorizontally(v, -dx);
	// }

	@Override
	public boolean dispatchKeyEvent(KeyEvent event)
	{
		// Let the focused view and/or our descendants get the key first
		return super.dispatchKeyEvent(event) || executeKeyEvent(event);
	}

	/**
	 * You can call this function yourself to have the scroll view perform
	 * scrolling from a key event, just as if the event had been dispatched to
	 * it by the view hierarchy.
	 *
	 * @param event The key event to execute.
	 * @return Return true if the event was handled, else false.
	 */
	public boolean executeKeyEvent(KeyEvent event)
	{
		boolean handled = false;
		if (event.getAction() == KeyEvent.ACTION_DOWN)
		{
			switch (event.getKeyCode())
			{
				case KeyEvent.KEYCODE_DPAD_LEFT:
					handled = arrowScroll(FOCUS_LEFT);
					break;
				case KeyEvent.KEYCODE_DPAD_RIGHT:
					handled = arrowScroll(FOCUS_RIGHT);
					break;
				case KeyEvent.KEYCODE_TAB:
					// The focus finder had a bug handling FOCUS_FORWARD and
					// FOCUS_BACKWARD
					// before Android 3.0. Ignore the tab key on those
					// devices.
					if (event.hasNoModifiers())
					{
						handled = arrowScroll(FOCUS_FORWARD);
					}
					else if (event.hasModifiers(KeyEvent.META_SHIFT_ON))
					{
						handled = arrowScroll(FOCUS_BACKWARD);
					}
					break;
			}
		}
		return handled;
	}

	public void setFocusSearchEnabled(boolean enabled)
	{
		mFocusSearchEnabled = enabled;
	}

	public boolean arrowScroll(int direction)
	{
		if (!mFocusSearchEnabled)
		{
			return true;
		}
		View currentFocused = findFocus();
		if (currentFocused == this)
		{
			currentFocused = null;
		}
		else if (currentFocused != null)
		{
			boolean isChild = false;
			for (ViewParent parent = currentFocused.getParent(); parent instanceof ViewGroup; parent = parent.getParent())
			{
				if (parent == this)
				{
					isChild = true;
					break;
				}
			}
			if (!isChild)
			{
				// This would cause the focus search down below to fail in fun
				// ways.
				final StringBuilder sb = new StringBuilder();
				sb.append(currentFocused.getClass().getSimpleName());
				for (ViewParent parent = currentFocused.getParent(); parent instanceof ViewGroup; parent = parent.getParent())
				{
					sb.append(" => ").append(parent.getClass().getSimpleName());
				}
				// Log.e(TAG,
				// "arrowScroll tried to find focus based on non-child " +
				// "current focused view " + sb.toString());
				currentFocused = null;
			}
		}

		boolean handled = false;

		View nextFocused = FocusFinder.getInstance().findNextFocus(this, currentFocused, direction);
		if (nextFocused != null && nextFocused != currentFocused)
		{
			if (direction == View.FOCUS_LEFT)
			{
				// If there is nothing to the left, or this is causing us to
				// jump to the right, then what we really want to do is page
				// left.
				final int nextLeft = getChildRectInPagerCoordinates(mTempRect, nextFocused).left;
				final int currLeft = getChildRectInPagerCoordinates(mTempRect, currentFocused).left;
				if (currentFocused != null && nextLeft >= currLeft)
				{
					handled = pageLeft();
				}
				else
				{
					handled = nextFocused.requestFocus();
				}
			}
			else if (direction == View.FOCUS_RIGHT)
			{
				// If there is nothing to the right, or this is causing us to
				// jump to the left, then what we really want to do is page
				// right.
				final int nextLeft = getChildRectInPagerCoordinates(mTempRect, nextFocused).left;
				final int currLeft = getChildRectInPagerCoordinates(mTempRect, currentFocused).left;
				if (currentFocused != null && nextLeft <= currLeft)
				{
					handled = pageRight();
				}
				else
				{
					handled = nextFocused.requestFocus();
				}
			}
		}
		else if (direction == FOCUS_LEFT || direction == FOCUS_BACKWARD)
		{
			// Trying to move left and nothing there; try to page.
			handled = pageLeft();
		}
		else if (direction == FOCUS_RIGHT || direction == FOCUS_FORWARD)
		{
			// Trying to move right and nothing there; try to page.
			handled = pageRight();
		}
		if (handled)
		{
			playSoundEffect(SoundEffectConstants.getContantForFocusDirection(direction));
		}
		return handled;
	}

	/* private */Rect getChildRectInPagerCoordinates(Rect outRect, View child)
	{
		if (outRect == null)
		{
			outRect = new Rect();
		}
		if (child == null)
		{
			outRect.set(0, 0, 0, 0);
			return outRect;
		}
		outRect.left = child.getLeft();
		outRect.right = child.getRight();
		outRect.top = child.getTop();
		outRect.bottom = child.getBottom();

		ViewParent parent = child.getParent();
		while (parent instanceof ViewGroup && parent != this)
		{
			final ViewGroup group = (ViewGroup) parent;
			outRect.left += group.getLeft();
			outRect.right += group.getRight();
			outRect.top += group.getTop();
			outRect.bottom += group.getBottom();

			parent = group.getParent();
		}
		return outRect;
	}

	boolean pageLeft()
	{
		if (mCurItem > 0)
		{
			setCurrentItem(mCurItem - 1, true);
			return true;
		}
		return false;
	}

	boolean pageRight()
	{
		if (mAdapter != null && mCurItem < (mAdapter.getCount() - 1))
		{
			setCurrentItem(mCurItem + 1, true);
			return true;
		}
		return false;
	}

	/**
	 * We only want the current page that is being shown to be focusable.
	 */
	@Override
	public void addFocusables(ArrayList<View> views, int direction, int focusableMode)
	{
		final int focusableCount = views.size();

		final int descendantFocusability = getDescendantFocusability();

		if (descendantFocusability != FOCUS_BLOCK_DESCENDANTS)
		{
			for (int i = 0; i < getChildCount(); i++)
			{
				final View child = getChildAt(i);
				if (child != null && child.getVisibility() == VISIBLE)
				{
					if (isGallery())
					{
						child.addFocusables(views, direction, focusableMode);
					}
					else
					{
						ItemInfo ii = infoForChild(child);
						if (ii != null && ii.position == mCurItem)
						{
							child.addFocusables(views, direction, focusableMode);
						}
					}
				}
			}
		}

		// we add ourselves (if focusable) in all cases except for when we are
		// FOCUS_AFTER_DESCENDANTS and there are some descendants focusable.
		// this is
		// to avoid the focus search finding layouts when a more precise search
		// among the focusable children would be more interesting.
		if (descendantFocusability != FOCUS_AFTER_DESCENDANTS ||
		// No focusable descendants
				(focusableCount == views.size()))
		{
			// Note that we can't call the superclass here, because it will
			// add all views in. So we need to do the same thing View does.
			if (!isFocusable())
			{
				return;
			}
			if ((focusableMode & FOCUSABLES_TOUCH_MODE) == FOCUSABLES_TOUCH_MODE && isInTouchMode() && !isFocusableInTouchMode())
			{
				return;
			}
			if (views != null)
			{
				views.add(this);
			}
		}
	}

	@Override
	public void requestChildFocus(View child, View focused)
	{
		super.requestChildFocus(child, focused);
		// 菜单里面用按键选择的时候，需要自动跳到下一页或者上一页。
		if (isGallery())
		{
			for (int i = 0; i < getChildCount(); i++)
			{
				if (child == getChildAt(i))
				{
					if (i != mCurrentScreen)
					{
						snapToScreen(i, 0, true);
					}
					break;
				}
			}
		}
	}

	/**
	 * We only want the current page that is being shown to be touchable.
	 */
	@Override
	public void addTouchables(ArrayList<View> views)
	{
		// Note that we don't call super.addTouchables(), which means that
		// we don't call View.addTouchables(). This is okay because a
		// QBViewPager
		// is itself not touchable.
		for (int i = 0; i < getChildCount(); i++)
		{
			final View child = getChildAt(i);
			if (child != null && child.getVisibility() == VISIBLE)
			{
				ItemInfo ii = infoForChild(child);
				if (ii != null && ii.position == mCurItem)
				{
					child.addTouchables(views);
				}
			}
		}
	}

	/**
	 * We only want the current page that is being shown to be focusable.
	 */
	@Override
	protected boolean onRequestFocusInDescendants(int direction, Rect previouslyFocusedRect)
	{
		int index;
		int increment;
		int end;
		int count = getChildCount();
		if ((direction & FOCUS_FORWARD) != 0)
		{
			index = 0;
			increment = 1;
			end = count;
		}
		else
		{
			index = count - 1;
			increment = -1;
			end = -1;
		}
		for (int i = index; i != end; i += increment)
		{
			View child = getChildAt(i);
			if (child != null && child.getVisibility() == VISIBLE)
			{
				ItemInfo ii = infoForChild(child);
				if (ii != null && ii.position == mCurItem)
				{
					if (child.requestFocus(direction, previouslyFocusedRect))
					{
						return true;
					}
				}
			}
		}
		return false;
	}

	@Override
	public boolean dispatchPopulateAccessibilityEvent(AccessibilityEvent event)
	{
		// Dispatch scroll events from this QBViewPager.

		// Dispatch all other accessibility events from the current page.
		final int childCount = getChildCount();
		for (int i = 0; i < childCount; i++)
		{
			final View child = getChildAt(i);
			if (child != null && child.getVisibility() == VISIBLE)
			{
				final ItemInfo ii = infoForChild(child);
				if (ii != null && ii.position == mCurItem && child.dispatchPopulateAccessibilityEvent(event))
				{
					return true;
				}
			}
		}

		return false;
	}

	@Override
	protected ViewGroup.LayoutParams generateDefaultLayoutParams()
	{
		return new LayoutParams();
	}

	@Override
	protected ViewGroup.LayoutParams generateLayoutParams(ViewGroup.LayoutParams p)
	{
		return generateDefaultLayoutParams();
	}

	@Override
	protected boolean checkLayoutParams(ViewGroup.LayoutParams p)
	{
		return p instanceof LayoutParams && super.checkLayoutParams(p);
	}

	@Override
	public ViewGroup.LayoutParams generateLayoutParams(AttributeSet attrs)
	{
		return new LayoutParams(getContext(), attrs);
	}


	/* private */class PagerObserver extends DataSetObserver
	{
		@Override
		public void onChanged()
		{
			dataSetChanged();
		}

		@Override
		public void onInvalidated()
		{
			dataSetChanged();
		}
	}

	/**
	 * Layout parameters that should be supplied for views added to a
	 * QBViewPager.
	 */
	public static class LayoutParams extends ViewGroup.LayoutParams
	{
		/**
		 * true if this view is a decoration on the pager itself and not
		 * a view supplied by the adapter.
		 */
		public boolean	isDecor;

		/**
		 * Gravity setting for use on decor views only:
		 * Where to position the view page within the overall QBViewPager
		 * container; constants are defined in {@link android.view.Gravity}.
		 */
		public int		gravity;

		/**
		 * Width as a 0-1 multiplier of the measured pager width
		 */
		public float	sizeFactor	= 0.f;

		/**
		 * true if this view was added during layout and needs to be measured
		 * before being positioned.
		 */
		boolean			needsMeasure;

		/**
		 * Adapter position this view is for if !isDecor
		 */
		int				position;

		/**
		 * Current child index within the QBViewPager that this view occupies
		 */
		int				childIndex;

		boolean			takeHeightspace;

		public LayoutParams()
		{
			super(FILL_PARENT, FILL_PARENT);

		}

		public LayoutParams(Context context, AttributeSet attrs)
		{
			super(context, attrs);

			final TypedArray a = context.obtainStyledAttributes(attrs, LAYOUT_ATTRS);
			gravity = a.getInteger(0, Gravity.TOP);
			a.recycle();
		}
	}

	static class ViewPositionComparator implements Comparator<View>
	{
		@Override
		public int compare(View lhs, View rhs)
		{
			final LayoutParams llp = (LayoutParams) lhs.getLayoutParams();
			final LayoutParams rlp = (LayoutParams) rhs.getLayoutParams();
			if (llp.isDecor != rlp.isDecor)
			{
				return llp.isDecor ? 1 : -1;
			}
			return llp.position - rlp.position;
		}
	}

//	static class DefaultPageTransformer implements PageTransformer
//	{
//
//		private static final float MIN_SCALE = 0.95f;
//
//		@Override
//		public void transformPage(View page, float position)
//		{
//
//			if (position < -1)
//			{ // [-Infinity,-1)
//				// This page is way off-screen to the left.
//				//page.setAlpha(0);
//				//page.setRotationY(0);
//
//			}
//			else if (position <= 1)
//			{ // [-1,1]
//				// Modify the default slide transition to shrink the page as well
//				float scaleFactor = Math.max(MIN_SCALE, 1 - Math.abs(position) * 0.05f);
//				//				float vertMargin = pageHeight * (1 - scaleFactor) / 2;
//				//				float horzMargin = pageWidth * (1 - scaleFactor) / 2;
//				//				if (position < 0) {
//				//					page.setTranslationX(horzMargin - vertMargin / 2);
//				//				} else {
//				//					page.setTranslationX(-horzMargin + vertMargin / 2);
//				//				}
//				// Rotate the page
//				//page.setRotationY(-position * 20);
//
//
//
//				// Scale the page down (between MIN_SCALE and 1)
//				page.setScaleX(scaleFactor);
//				page.setScaleY(scaleFactor);
//
//				// Fade the page relative to its size.
//				//				page.setAlpha(MIN_ALPHA +
//				//						(scaleFactor - MIN_SCALE) /
//				//								(1 - MIN_SCALE) * (1 - MIN_ALPHA));
//
//			}
//			else
//			{ // (1,+Infinity]
//				// This page is way off-screen to the right.
//				//page.setAlpha(0);
//				//page.setRotationY(0);
//			}
//		}
//	}

	/* private */void dumpItemInfos()
	{
		if (mItems != null)
		{
			for (int i = 0; i < mItems.size(); i++)
			{
				Log.d(TAG, "index " + i + "--->" + mItems.get(i).toString());
			}
		}
	}

	public int getCurrentPage()
	{
		return isGallery() ? mCurrentScreen : mCurItem;
	}

	public void setCurrentPage(int currentScreen)
	{
		if (mCurrentScreen != currentScreen)
		{
			if (!mScroller.isFinished())
			{
				mScroller.abortAnimation();
			}
			int nextScreen = Math.max(0, Math.min(currentScreen, getPageCount() - 1));
			setScrollState(SCROLL_STATE_IDLE);
			if (mOnPageChangeListener != null)
			{
				mOnPageChangeListener.onPageSelected(nextScreen);
			}
			mCurrentScreen = nextScreen;
			Log.d("TMYGALLERY", "setCurrentPage,currScreen=" + mCurrentScreen);
			scrollTo(nextScreen * getWidth(), getScrollY());
			invalidate();
		}
	}

	public boolean isSettling()
	{
		return mScrollState == SCROLL_STATE_SETTLING;
	}

	public void setScrollEnabled(boolean enabled)
	{
		mScrollEnabled = enabled;
	}


	@Override
	public boolean verticalCanScroll(int dis)
	{
		return false;
	}

	@Override
	public boolean horizontalCanScroll(int dis)
	{
		if (!mCanScroll)
		{
			return false;
		}
		boolean isFirstPage = false;
		boolean isLastPage = false;
		if (isGallery())
		{
			isFirstPage = mCurrentScreen == 0;
			isLastPage = mCurrentScreen == getPageCount() - 1;
		}
		else
		{
			isFirstPage = mCurItem == 0;
			isLastPage = mCurItem == getPageCount() - 1;
		}
		boolean leftCanScroll = (dis < 0) && (mLeftDragOutSizeEnable || !isFirstPage);
		boolean rightCanScroll = (dis > 0) && (mRightDragOutSizeEnable || !isLastPage);
		return (leftCanScroll || rightCanScroll) /* && mScrollEnabled */;
	}

	public void setCanScroll(boolean canScroll)
	{
		mCanScroll = canScroll;
	}

	public boolean onOverScroll(int deltaX, int deltaY, int scrollX, int scrollY, int scrollRangeX, int scrollRangeY, int maxOverScrollX,
			int maxOverScrollY, boolean isTouchEvent)
	{
		if (mIsVertical)
		{
			if (((scrollY == 0 && deltaY < 0) || (scrollY == scrollRangeY && deltaY > 0)))
			{
				onOverScrollSuccess();
			}
		}
		else
		{
			if (((scrollX == 0 && deltaX < 0) || (scrollX == scrollRangeX && deltaX > 0)))
			{
				onOverScrollSuccess();
			}
		}
		return true;
	}

	/**
	 * 针对NativeContainer中有webView发起的onOverScroll
	 */
	public boolean onOverScrollWithNativeContainer(int deltaX, int deltaY, int scrollX, int scrollY, int scrollRangeX, int scrollRangeY,
			int maxOverScrollX, int maxOverScrollY, boolean isTouchEvent)
	{
		if (((scrollX == 0 && deltaX < 0) || (scrollX == scrollRangeX && deltaX > 0)))
		{
			mIsUnableToDrag = false;
		}
		return true;
	}


	public void onOverScrollSuccess()
	{
		mIsUnableToDrag = false;
		ignoreCheck = true;
	}

	protected void setForceUnableToDrag(boolean unable)
	{
		mForceUnableToDrag = unable;
	}

	@Override
	public void postInvalidate()
	{
		try
		{
			super.postInvalidate();
			if (mInvalidateListener != null)
			{
				mInvalidateListener.onPostInvalidate();
			}
		}
		catch (Exception e)
		{

		}
	}

	@Override
	public void invalidate()
	{
		// TODO Auto-generated method stub
		super.invalidate();
		if (mInvalidateListener != null)
		{
			mInvalidateListener.onInvalidate();
		}
	}

	/* private */ PagerInvalidateListener	mInvalidateListener;
	private boolean							mEnableCatching	= true;

	public void setPagerInvalidateListener(PagerInvalidateListener listener)
	{
		mInvalidateListener = listener;
	}

	public interface PagerInvalidateListener
	{
		void onInvalidate();

		void onPostInvalidate();
	}

	public void updateScreenNextCall()
	{
		mUpdateScreenNextCall = true;
	}

	public float getLastMotionX()
	{
		return mLastMotionX;
	}

	public float getLastMotionY()
	{
		return mLastMotionY;
	}

	public void setDisallowInterceptWhenDrag(boolean disallow)
	{
		mDisallowInterceptWhenDrag = disallow;
	}

	protected void stopScroller()
	{
		if (!mScroller.isFinished())
		{
			mScroller.abortAnimation();
		}
	}

	public void setEnableCatching(boolean enable)
	{
		mEnableCatching = enable;
	}

	public boolean isIdle()
	{
		return mScrollState == SCROLL_STATE_IDLE;
	}

	public void setFirstOffsetBy(View obj)
	{
		ItemInfo ii = infoForChild(obj);
		if (ii != null)
		{
			mMinOffset = ii.offset;
			mMinPage = ii.position;
		}
	}

	public void setLastOffsetBy(View obj)
	{
		ItemInfo ii = infoForChild(obj);
		if (ii != null)
		{
			mMaxOffset = ii.offset;
			mMaxPage = ii.position;
		}
	}

	public int positionForChild(View child)
	{
		ItemInfo ii = infoForChild(child);
		if (ii != null)
		{
			return ii.position;
		}
		return 0;
	}

	public Object childByPosition(int position)
	{
		ItemInfo ii = infoForPosition(position);
		if (ii != null)
		{
			return ii.object;
		}
		return null;
	}

	public void setFirstLayoutParameter(boolean isFirstLayout)
	{
		mFirstLayout = isFirstLayout;
	}

	public boolean isFirstLayout()
	{
		return mFirstLayout;
	}

	public void setEnableReLayoutOnAttachToWindow(boolean enable)
	{
		mReLayoutOnAttachToWindow = enable;
	}

	public void setCallPageChangedOnFirstLayout(boolean enable)
	{
		mCallPageChangedOnFirstLayout = enable;
	}

	public boolean isScrollEnabled() {
	  return mScrollEnabled;
  }
}
