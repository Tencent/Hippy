package com.tencent.mtt.supportui.views.recyclerview;

import android.view.View;

/**
 * Created by leonardgong on 2018/4/9 0008.
 */

public class ContentHolder
{
	public Object	mParentViewHolder;
	public View		mContentView;
	public int		mContentLeftPadding	= 0;
	public int		mItemPaddingLeft	= 0;
	public int		mItemPaddingRight	= 0;
	public boolean	mFocusable			= true;
	public boolean	mForceBind			= false;

	public void inTraversals(int traversalPurpose, int position, RecyclerViewBase recyclerView)
	{

	}

	public void setEnable(boolean enabled)
	{
		if (mContentView != null && mContentView.getParent() != null)
		{
			((View) mContentView.getParent()).setEnabled(enabled);
		}
	}

}
