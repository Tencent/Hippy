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

import android.view.ViewGroup;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.dom.node.NodeProps;

@SuppressWarnings({"unused"})
public abstract class HippyGroupController<T extends ViewGroup & HippyViewBase> extends HippyViewController<T>
{
	/** touch/click intercept **/
	@HippyControllerProps(name = NodeProps.ON_INTERCEPT_TOUCH_EVENT, defaultType = HippyControllerProps.BOOLEAN)
	public void setInterceptTouch(T viewGroup, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(viewGroup, NodeProps.ON_INTERCEPT_TOUCH_EVENT, flag);
		}
	}

	/** touch/click intercept **/
	@HippyControllerProps(name = NodeProps.ON_INTERCEPT_PULL_UP_EVENT, defaultType = HippyControllerProps.BOOLEAN)
	public void setInterceptPullUp(T viewGroup, boolean flag)
	{
		if (!handleGestureBySelf())
		{
			setGestureType(viewGroup, NodeProps.ON_INTERCEPT_PULL_UP_EVENT, flag);
		}
	}
}
