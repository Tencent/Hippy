package com.tencent.mtt.supportui.views.recyclerview;

import android.content.Context;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewTreeObserver;
import android.widget.FrameLayout;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

public class RecyclerViewItem extends FrameLayout
{
	public int								id;
	protected RecyclerViewBase				mParentRecyclerView;
	public RecyclerView.ViewHolderWrapper	mHolder;
	public View								mContentView;
	/* private */boolean					mTouchEnabled				= true;
	public static int						ITEM_VIEW_DEFAULT_HEIGHT	= 360;	//(int) PixelUtil.dp2px(120);

	public RecyclerViewItem(Context context, RecyclerViewBase recyclerView)
	{
		super(context);
		mParentRecyclerView = recyclerView;
	}

	public void setParentRecyclerView(RecyclerViewBase mParentRecyclerView)
	{
		this.mParentRecyclerView = mParentRecyclerView;
	}

	@Override
	protected void onAttachedToWindow()
	{
		try
		{
			super.onAttachedToWindow();
		}
		catch (NullPointerException e)
		{

		}
	}

	@Override
	protected void onLayout(boolean changed, int left, int top, int right, int bottom)
	{
		// TODO Auto-generated method stub
		mBlockRequestLayout = true;
		super.onLayout(changed, left, top, right, bottom);
		mBlockRequestLayout = false;
	}

	public void addContentView(View contentView, boolean hasDivider)
	{
		if (contentView != null)
		{
			mContentView = contentView;
			ViewGroup.LayoutParams lp = new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT);
			mContentView.setLayoutParams(lp);
			//mContentView.setId(CONTENTVIEW_ID);
			addView(mContentView);

		}
	}

	public void onPreAnimate(int which, boolean enter, boolean checked)
	{

	}

	public void onStartAnimate(int which)
	{
	}

	public void onAnimate(float percent, int which, boolean enter)
	{
	}

	public void onPostAnimate(int which, boolean enter)
	{

	}

	public final boolean isPointInView(float localX, float localY)
	{
		return localX >= 0 && localX < (getRight() - getLeft()) && localY >= 0 && localY < (getBottom() - getTop());
	}

	public View getContentView()
	{
		return mContentView;
	}

	@Override
	public void setEnabled(boolean enabled)
	{
		super.setEnabled(enabled);
		mTouchEnabled = enabled;
	}

	@Override
	public boolean dispatchTouchEvent(MotionEvent ev)
	{
		// TODO Auto-generated method stub
		if (!mTouchEnabled)
		{
			return true;
		}
		return super.dispatchTouchEvent(ev);
	}

	// TODO: vertical滚动调用
	//    @Override
	//    public boolean verticalCanScroll(int dis)
	//    {
	//        return false;
	//    }

	//	/* private */float getContentViewTranslationX()
	//	{
	//		if (mContentView != null)
	//		{
	//			return mContentView.getTranslationX();
	//		}
	//		return 0;
	//	}

	// TODO: horizontal滚动调用
	//    @Override
	//    public boolean horizontalCanScroll(int dis)
	//    {
	//        if (getContentViewTranslationX() != 0)
	//        {
	//            return true;
	//        }
	//        if (mParentRecyclerView != null && mHolder != null && mHolder.mContentHolder != null)
	//        {
	//            return /* mParentRecyclerView.canSwipeDelete() && */mHolder.mContentHolder.canSwipeDelete() && dis > 0;
	//        }
	//        return false;
	//    }

	/* private */ViewTreeObserver.OnPreDrawListener	mLayoutListener;
	/* private */boolean							mBlockRequestLayout	= false;
	/* private */boolean							mLayoutListenerPosted;
}
