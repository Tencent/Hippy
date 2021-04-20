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
package com.tencent.mtt.hippy.modules.nativemodules.deviceevent;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.UIThreadUtils;

@HippyNativeModule(name = "DeviceEventModule",init = true)
public class DeviceEventModule extends HippyNativeModuleBase
{
	HippyEngine.BackPressHandler mBackPressHandler = null;
	private boolean mIsListening = false;

	public DeviceEventModule(HippyEngineContext context)
	{
		super(context);
	}

	public boolean onBackPressed(HippyEngine.BackPressHandler handler)
	{
		if (mIsListening)
		{
			mBackPressHandler = handler;
			if (mContext != null && mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class) != null)
			{
				mContext.getModuleManager().getJavaScriptModule(EventDispatcher.class).receiveNativeEvent("hardwareBackPress", null);
				return true;
			}
			else
			{
				return false;
			}
		}
		return false;
	}

	/**
	 * 前端JS告知SDK：我要监听back事件（如果没有告知，则SDK不用把back事件抛给前端，这样可以加快back的处理速度，毕竟大部分hippy业务是无需监听back事件的）
	 * @param listen 是否监听？
	 */
	@SuppressWarnings("unused")
	@HippyMethod(name = "setListenBackPress")
	public void setListenBackPress(boolean listen)
	{
		mIsListening = listen;
	}

	@SuppressWarnings("unused")
	@HippyMethod(name = "invokeDefaultBackPressHandler")
	public void invokeDefaultBackPressHandler()
	{
		UIThreadUtils.runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{
				HippyEngine.BackPressHandler handler = mBackPressHandler;
				if (handler != null)
				{
				handler.handleBackPress();
				}
			}
		});
	}

	@Override
	public void destroy()
	{
		super.destroy();
		mBackPressHandler = null;
	}

	@SuppressWarnings("DeprecatedIsStillUsed")
	@Deprecated
	public interface InvokeDefaultBackPress
	{
		void callSuperOnBackPress();
	}
}
