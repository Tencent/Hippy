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
package com.tencent.mtt.hippy.views.refresh;

import android.content.Context;
import android.view.View;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;

@SuppressWarnings({"unused"})
@HippyController(name = "RefreshWrapper")
public class RefreshWrapperController extends HippyGroupController<RefreshWrapper>
{
	final String	RefreshComplected	= "refreshComplected";
	final String	StartRefresh		= "startRefresh";

	@Override
	protected View createViewImpl(Context context)
	{
		return new RefreshWrapper(context);
	}

	@HippyControllerProps(name = "bounceTime", defaultType = HippyControllerProps.NUMBER, defaultNumber = 300)
	public void bounceTime(RefreshWrapper wrapper, int time)
	{
		wrapper.setTime(time);
	}

	@HippyControllerProps(name = "onScrollEnable", defaultType = HippyControllerProps.BOOLEAN)
	public void setOnScrollEventEnable(RefreshWrapper wrapper, boolean flag)
	{
		wrapper.setOnScrollEventEnable(flag);
	}
	@HippyControllerProps(name = "scrollEventThrottle", defaultType = HippyControllerProps.NUMBER, defaultNumber = 30.0D)
	public void setscrollEventThrottle(RefreshWrapper wrapper, int scrollEventThrottle)
	{
		wrapper.setScrollEventThrottle(scrollEventThrottle);
	}
	@Override
	public void dispatchFunction(RefreshWrapper view, String functionName, HippyArray var)
	{
		super.dispatchFunction(view, functionName, var);

		if (RefreshComplected.equals(functionName))
		{
			view.refreshComplected();
		}
		else if (StartRefresh.equals(functionName))
		{
			view.startRefresh();
		}
	}
}
