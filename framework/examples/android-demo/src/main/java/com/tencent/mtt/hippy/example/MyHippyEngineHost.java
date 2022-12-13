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

package com.tencent.mtt.hippy.example;

import android.app.Application;

import com.tencent.mtt.hippy.HippyEngineHost;
import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.example.adapter.MyExceptionHandler;

import java.util.ArrayList;
import java.util.List;

@SuppressWarnings({"DeprecatedIsStillUsed", "unused", "deprecation"})
@Deprecated
public class MyHippyEngineHost extends HippyEngineHost
{
	final private Application mApplication;

	public MyHippyEngineHost(Application application)
	{
		super(application);
		this.mApplication = application;
	}

	@Override
	protected List<HippyAPIProvider> getPackages()
	{
		List<HippyAPIProvider> providers = new ArrayList<>();
		providers.add(new MyAPIProvider());
		return providers;
	}

	@Override
	protected HippyBundleLoader getCoreBundleLoader()
	{
		return new HippyAssetBundleLoader(mApplication, "vendor.android.js");
	}

	@Override
	public HippyGlobalConfigs getHippyGlobalConfigs()
	{
		return new HippyGlobalConfigs.Builder().setContext(mApplication).setExceptionHandler(new MyExceptionHandler()).build();
	}

	@Override
	protected boolean enableHippyBufferBridge()
	{
		return true;
	}
}
