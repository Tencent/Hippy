package com.tencent.mtt.supportui.views.recyclerview;

/**
 * Created by leonardgong on 2018/1/8 0008.
 */

public interface IViewRecycleStateListener
{
	int	NOTIFY_ON_USE		= 1;
	int	NOTIFY_ON_RECYCLE	= 2;

	void onUse();

	void onRecycle();
}
