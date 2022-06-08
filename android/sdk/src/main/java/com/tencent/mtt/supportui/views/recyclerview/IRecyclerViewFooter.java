package com.tencent.mtt.supportui.views.recyclerview;

/**
 * Created by leonardgong on 2017/7/30 0030.
 */

public interface IRecyclerViewFooter
{
	int	LOADING_STATUS_NONE							= 0;
	int	LOADING_STATUS_LOADING						= 1;
	int	LOADING_STATUS_FINISH						= 2;
	int	LOADING_STATUS_ERROR						= 3;
	int	LOADING_STATUS_ERROR_RETRY					= 4;
	int	LOADING_STATUS_ERROR_PULL_UP				= 5;
	int	LOADING_STATUS_NOMORE_CLICKBACKWARDS		= 6;
	int	LOADING_STATUS_BLANK						= 7;
	int	LOADING_STATUS_FINISH_WITH_NUM				= 8;
	int	LOADING_STATUS_ERROR_NETWORK_DISCONNECTED	= 9;
	int	LOADING_STATUS_ERROR_NETWORK_ERROR			= 10;
	int	LOADING_STATUS_CUSTOM						= 100;

	void setLoadingStatus(int loadingStatus);

	int getLoadingStatus();
}
