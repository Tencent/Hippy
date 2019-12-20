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
package com.tencent.mtt.hippy.bridge;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.supportui.utils.struct.Pools;

/**
 * FileName: HippyCallNativeParams
 * Description：
 * History：
 */
public class HippyCallNativeParams
{

	private static final int											POOL_SIZE		= 20;
	private static final Pools.SynchronizedPool<HippyCallNativeParams>	INSTANCE_POOL	= new Pools.SynchronizedPool<>(POOL_SIZE);

	public String														mModuleName;
	public String														mModuleFunc;
	public String														mCallId;
	public HippyArray													mParams;

	public static HippyCallNativeParams obtain(String moduleName, String moduleFunc, String callId, HippyArray params)
	{
		HippyCallNativeParams instance = INSTANCE_POOL.acquire();
		if (instance == null)
		{
			instance = new HippyCallNativeParams();
		}
		instance.init(moduleName, moduleFunc, callId, params);
		return instance;
	}

	private void init(String moduleName, String moduleFunc, String callId, HippyArray params)
	{
		this.mModuleName = moduleName;
		this.mModuleFunc = moduleFunc;
		this.mCallId = callId;
		this.mParams = params;
	}

	public void onDispose()
	{
		mParams = null;
		INSTANCE_POOL.release(this);
	}
}
