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

import android.util.Log;
import android.view.View;
import android.view.ViewGroup;

import com.tencent.mtt.hippy.views.view.HippyViewGroupController;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;

/**
 * Created by leonardgong on 2018/1/9 0009.
 */

public class ViewGroupDrawingOrderHelper
{
	private final ViewGroup	mViewGroup;
	private int				mNumberOfChildrenWithZIndex	= 0;
	private int[]			mDrawingOrderIndices;

	public ViewGroupDrawingOrderHelper(ViewGroup viewGroup)
	{
		mViewGroup = viewGroup;
	}


	public void handleAddView(View view)
	{
		if (HippyViewGroupController.getViewZIndex(view) != null)
		{
			mNumberOfChildrenWithZIndex++;
		}

		mDrawingOrderIndices = null;
	}


	public void handleRemoveView(View view)
	{
		if (HippyViewGroupController.getViewZIndex(view) != null)
		{
			mNumberOfChildrenWithZIndex--;
		}

		mDrawingOrderIndices = null;
	}


	public boolean shouldEnableCustomDrawingOrder()
	{
		return mNumberOfChildrenWithZIndex > 0;
	}


	public int getChildDrawingOrder(int childCount, int index)
	{
		if (mDrawingOrderIndices == null)
		{
			ArrayList<View> viewsToSort = new ArrayList<>();
			for (int i = 0; i < childCount; i++)
			{
				viewsToSort.add(mViewGroup.getChildAt(i));
			}
			// Sort the views by zIndex
			Collections.sort(viewsToSort, new Comparator<View>()
			{
				@Override
				public int compare(View view1, View view2)
				{
					Integer view1ZIndex = HippyViewGroupController.getViewZIndex(view1);
					if (view1ZIndex == null)
					{
						view1ZIndex = 0;
					}

					Integer view2ZIndex = HippyViewGroupController.getViewZIndex(view2);
					if (view2ZIndex == null)
					{
						view2ZIndex = 0;
					}

					return view1ZIndex - view2ZIndex;
				}
			});

			mDrawingOrderIndices = new int[childCount];
			for (int i = 0; i < childCount; i++)
			{
				View child = viewsToSort.get(i);
				mDrawingOrderIndices[i] = mViewGroup.indexOfChild(child);
			}
		}
		if (index >= mDrawingOrderIndices.length)
		{
			Log.e("VGDrawingOrderHelper", "WRONG, index out of mDrawingOrderIndices length");
			return 0;
		}
		return mDrawingOrderIndices[index];
	}

	public void update()
	{
		mNumberOfChildrenWithZIndex = 0;
		for (int i = 0; i < mViewGroup.getChildCount(); i++)
		{
			if (HippyViewGroupController.getViewZIndex(mViewGroup.getChildAt(i)) != null)
			{
				mNumberOfChildrenWithZIndex++;
			}
		}
		mDrawingOrderIndices = null;
	}
}
