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
package com.tencent.mtt.hippy.modules.nativemodules;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;

import java.util.HashMap;

@SuppressWarnings({"unused"})
public class HippyNativeModuleBase
{
	protected final HippyEngineContext	mContext;

	private HashMap<String, Integer>	mEventMaps;

	public HippyNativeModuleBase(HippyEngineContext context)
	{
		this.mContext = context;
	}

	@HippyMethod(name = "addListener")
	public void addListener(String name)
	{
		if (mEventMaps == null)
		{
			mEventMaps = new HashMap<>();
		}
		int count = 0;
		if (mEventMaps.containsKey(name))
		{
			//noinspection ConstantConditions
			count = mEventMaps.get(name);
		}
		count++;

		if (count == 1)
		{
			handleAddListener(name);
		}
		mEventMaps.remove(name);
		mEventMaps.put(name, count);
	}

	@HippyMethod(name = "removeListener")
	public void removeListener(String name)
	{
		if (mEventMaps == null || !mEventMaps.containsKey(name))
		{
			return;
		}
		@SuppressWarnings("ConstantConditions") int count = mEventMaps.get(name);
		if (count == 1)
		{
			handleRemoveListener(name);
			mEventMaps.remove(name);
		}
		else
		{
			count--;
			mEventMaps.remove(name);
			mEventMaps.put(name, count);
		}
	}

	public void handleAddListener(String name)
	{

	}

	public void handleRemoveListener(String name)
	{

	}

	public void initialize()
	{
	}

	public void destroy()
	{
	}
}
