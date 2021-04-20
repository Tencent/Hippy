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
package com.tencent.mtt.hippy.views.view;

import android.content.Context;
import android.view.View;

import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.image.HippyImageView;

import java.util.WeakHashMap;

@HippyController(name = HippyViewGroupController.CLASS_NAME)
public class HippyViewGroupController extends HippyGroupController<HippyViewGroup>
{

	public static final String					CLASS_NAME		= "View";

	public static final WeakHashMap<View, Integer> mZIndexHash	= new WeakHashMap<>();


	public static void setViewZIndex(View view, int zIndex)
	{
		mZIndexHash.put(view, zIndex);
	}

	public static void removeViewZIndex(View view)
	{
		mZIndexHash.remove(view);
	}

	public static Integer getViewZIndex(View view)
	{
		return mZIndexHash.get(view);
	}

	@Override
	protected View createViewImpl(Context context)
	{
		return new HippyViewGroup(context);
	}

	@HippyControllerProps(name = NodeProps.OVERFLOW, defaultType = HippyControllerProps.STRING, defaultString = "visible")
	public void setOverflow(HippyViewGroup hippyViewGroup, String overflow)
	{
		hippyViewGroup.setOverflow(overflow);
	}

	@HippyControllerProps(name = NodeProps.BACKGROUND_IMAGE, defaultType = HippyControllerProps.STRING)
	public void setBackgroundImage(HippyViewGroup hippyViewGroup, String url)
	{
		hippyViewGroup.setUrl(url);
	}

	@HippyControllerProps(name = NodeProps.BACKGROUND_SIZE, defaultType = HippyControllerProps.STRING, defaultString = "origin")
	public void setBackgroundImageSize(HippyImageView hippyImageView, String resizeModeValue)
	{
		if ("contain".equals(resizeModeValue))
		{
			// 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸
			// 这样图片完全被包裹在容器中，容器中可能留有空白
			hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER_INSIDE);
		}
		else if ("cover".equals(resizeModeValue))
		{
			// 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
			// 这样图片完全覆盖甚至超出容器，容器中不留任何空白
			hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER_CROP);
		}
		else if ("center".equals(resizeModeValue))
		{
			// 居中不拉伸
			hippyImageView.setScaleType(HippyImageView.ScaleType.CENTER);
		}
		else if ("origin".equals(resizeModeValue))
		{
			// 不拉伸，居左上
			hippyImageView.setScaleType(HippyImageView.ScaleType.ORIGIN);
		}
		else
		{
			// stretch and other mode
			// 拉伸图片且不维持宽高比，直到宽高都刚好填满容器
			hippyImageView.setScaleType(HippyImageView.ScaleType.FIT_XY);
		}
	}

	@HippyControllerProps(name = NodeProps.BACKGROUND_POSITION_X, defaultType = HippyControllerProps.NUMBER)
	public void setBackgroundImagePositionX(HippyViewGroup hippyViewGroup, int positionX)
	{
		hippyViewGroup.setImagePositionX((int) PixelUtil.dp2px(positionX));
	}

	@HippyControllerProps(name = NodeProps.BACKGROUND_POSITION_Y, defaultType = HippyControllerProps.NUMBER)
	public void setBackgroundImagePositionY(HippyViewGroup hippyViewGroup, int positionY)
	{
		hippyViewGroup.setImagePositionY((int) PixelUtil.dp2px(positionY));
	}
}
