/*
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
package com.tencent.mtt.hippy.devsupport;

import android.app.Activity;

import com.tencent.mtt.hippy.HippyRootView;

/**
 * @author: edsheng
 * @date: 2017/11/18 16:30
 * @version: V1.0
 */

public class DevServerImplDisable implements DevServerInterface
{
	@Override
	public void reload(DevRemoteDebugProxy proxy)
	{

	}

    @Override
	public void setDevServerCallback(DevServerCallBack devServerCallback)
	{

	}

	@Override
	public void attachToHost(HippyRootView view)
	{

	}

	@Override
	public void detachFromHost(HippyRootView view)
	{

	}

	@Override
	public void handleException(Throwable exception)
	{

	}
}
