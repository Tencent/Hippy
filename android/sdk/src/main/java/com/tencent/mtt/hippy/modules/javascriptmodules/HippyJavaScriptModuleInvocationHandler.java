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
package com.tencent.mtt.hippy.modules.javascriptmodules;


import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.utils.ArgumentUtils;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

/**
 * FileName: HippyJavaScriptModuleInvocationHandler
 * Description：
 * History：
 */
public class HippyJavaScriptModuleInvocationHandler implements InvocationHandler
{
	private HippyEngineContext	mHippyContext;
	private String				mName;

	public HippyJavaScriptModuleInvocationHandler(HippyEngineContext context, String name)
	{
		mHippyContext = context;
		this.mName = name;
	}

	@Override
	public Object invoke(Object proxy, Method method, Object[] args) throws Throwable
	{
		if (proxy instanceof HippyJavaScriptModule)
		{
			Object params = null;
			if (args != null && args.length == 1)
			{
				params = args[0];
			}
			else
			{
				params = ArgumentUtils.fromJavaArgs(args);
			}

			if (mHippyContext != null && mHippyContext.getBridgeManager() != null)
			{
				mHippyContext.getBridgeManager().callJavaScriptModule(mName, method.getName(), params);
			}
		}
		return null;
	}

}
