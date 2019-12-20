/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.uimanager;

import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.views.list.IRecycleItemTypeChange;

/**
 * @author: edsheng
 * @date: 2017/12/9 17:44
 * @version: V1.0
 */

public class ListItemRenderNode extends RenderNode
{
	public static final String		ITEM_VIEW_TYPE	= "itemViewType";
	public static final String		ITEM_STICKY		= "sticky";

	private boolean					mShouldSticky;
	private IRecycleItemTypeChange	mRecycleItemTypeChangeListener;

	public ListItemRenderNode(int mId, HippyMap mPropsToUpdate, String className, HippyRootView mRootView, ControllerManager componentManager,
			boolean isLazyLoad)
	{
		super(mId, mPropsToUpdate, className, mRootView, componentManager, isLazyLoad);
		if (mProps.get(ITEM_STICKY) != null)
		{
			mShouldSticky = mProps.getBoolean(ITEM_STICKY);
		}
	}


	@Override
	public void updateLayout(int x, int y, int w, int h)
	{
		super.updateLayout(x, y, w, h);
		this.mY = 0;
		if (getParent() != null && mComponentManager != null && mComponentManager.mContext != null)
		{ // 若屏幕内node更新引起了item整体变化，需要通知ListView发起dispatchLayout重排版
			RenderManager renderManager = mComponentManager.mContext.getRenderManager();
			if (renderManager != null)
			{
				renderManager.addUpdateNodeIfNeeded(getParent());
			}
		}
	}

	@Override
	public void updateNode(HippyMap map)
	{
		int oldType = mProps.getInt(ITEM_VIEW_TYPE);
		int newType = map.getInt(ITEM_VIEW_TYPE);
		if (mRecycleItemTypeChangeListener != null && oldType != newType)
		{
			mRecycleItemTypeChangeListener.onRecycleItemTypeChanged(oldType, newType, this);
		}
		super.updateNode(map);
		if (mProps.get(ITEM_STICKY) != null)
		{
			mShouldSticky = mProps.getBoolean(ITEM_STICKY);
		}
	}

	public void setRecycleItemTypeChangeListener(IRecycleItemTypeChange recycleItemTypeChangeListener)
	{
		mRecycleItemTypeChangeListener = recycleItemTypeChangeListener;
	}

	public boolean shouldSticky()
	{
		return mShouldSticky;
	}
}
