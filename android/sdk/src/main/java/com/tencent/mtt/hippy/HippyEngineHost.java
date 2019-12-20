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
package com.tencent.mtt.hippy;

import android.app.Application;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.utils.ContextHolder;

import java.util.List;

/**
 * FileName: HippyEngineHost
 * Description：
 * History：
 * 2019/3/26 harryguo注释：
 * 老的引擎初始化代码。将被废弃
 * 请参见{@link com.tencent.mtt.hippy.HippyEngine}
 */
@Deprecated
public abstract class HippyEngineHost
{
	/**
	 * Application
	 */
	private Application	mApplication;


	public HippyEngineHost(Application application)
	{
		mApplication = application;
		ContextHolder.initAppContext(mApplication);
	}

	/**
	 * Create non-debug engine manager
	 * 
	 * @return
	 */
	public HippyEngineManager createHippyEngineManager()
	{
		return createHippyEngineManager(null);
	}

	/**
	 * Create non-debug engine manager
	 * @param preloadBundleLoader --- After the engine is loaded successfully, the bundle is loaded directly
	 * @return
	 */
	public HippyEngineManager createHippyEngineManager(HippyBundleLoader preloadBundleLoader)
	{
		HippyEngineManager.Builder builder = new HippyEngineManager.Builder();
		builder.setHippyGlobalConfigs(getHippyGlobalConfigs()).setCoreBundleLoader(getCoreBundleLoader()).setPreloadBundleLoader(preloadBundleLoader)
				.setPackages(getPackages()).setSupportDev(false).setDebugJs("").setEngineMode(getEngineMode()).setEnableHippyBuffer(enableHippyBufferBridge()).setGroupId(getGroupId());

		HippyEngineManager engineManager = builder.build();
		return engineManager;
	}

	/**
	 * Create debug engine manager
	 *
	 * @param debugJs -- debug js path
	 * @return
	 */
	public HippyEngineManager createDebugHippyEngineManager(String debugJs)
	{
		HippyEngineManager.Builder builder = new HippyEngineManager.Builder();
		builder.setHippyGlobalConfigs(getHippyGlobalConfigs()).setCoreBundleLoader(null).setPackages(getPackages()).setSupportDev(true)
				.setDebugJs(debugJs).setEngineMode(getEngineMode()).setGroupId(getGroupId());

		HippyEngineManager engineManager = builder.build();
		return engineManager;
	}

	/**
	 * Engine global configuration
	 * 
	 * @return
	 */
	public HippyGlobalConfigs getHippyGlobalConfigs()
	{
		return new HippyGlobalConfigs.Builder().setContext(mApplication).build();
	}

	/**
	 * Register the providers you need
	 * 
	 * @return
	 */
	protected abstract List<HippyAPIProvider> getPackages();

	/**
	 * Engine core bundle loader
	 * 
	 * @return
	 */
	protected HippyBundleLoader getCoreBundleLoader()
	{
		return null;
	}

	/**
	 * @see HippyEngine.EngineMode
	 * @return
	 */
	protected HippyEngine.EngineMode getEngineMode()
	{
		return HippyEngine.EngineMode.NORMAL;
	}

	protected boolean enableHippyBufferBridge()
	{
		return false;
	}

	/**
	 * business override getGroupId， valid group id must >= 0. if value <= -1, means not in any group.
	 * @see int
	 * @return
	 */
	protected  int getGroupId() { return -1; }

}
