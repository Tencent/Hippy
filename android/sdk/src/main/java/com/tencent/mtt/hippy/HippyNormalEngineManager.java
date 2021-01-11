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

import android.os.Handler;
import android.os.Looper;
import com.tencent.mtt.hippy.bridge.HippyBridgeManagerImpl;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.utils.LogUtils;

public final class HippyNormalEngineManager extends HippyEngineManagerImpl
{
	private volatile ThreadExecutor mThreadExecutor;

	private Object					mLock	= new Object();

	HippyNormalEngineManager(EngineInitParams params, HippyBundleLoader preloadBundleLoader)
	{
		super(params, preloadBundleLoader);
	}

	@Override
	protected void onDestroy() {
		super.onDestroy();
		synchronized (mLock) {
			if (mThreadExecutor != null) {
				mThreadExecutor.destroy();
				mThreadExecutor = null;
			}
		}
	}

	@Override
	public void destroyEngine() {
		super.destroyEngine();
	}

	@Override
	public ThreadExecutor getThreadExecutor()
	{
		if (mThreadExecutor == null)
		{
			synchronized (mLock)
			{
				if (mThreadExecutor == null)
				{
					mThreadExecutor = new ThreadExecutor(-1);
					mThreadExecutor.setUncaughtExceptionHandler(this);
				}
			}
		}
		return mThreadExecutor;
	}

	@Override
	public int getBridgeType()
	{
		return HippyBridgeManagerImpl.BRIDGE_TYPE_NORMAL;
	}

	@Override
	public void handleThreadUncaughtException(Thread t, Throwable e, Integer groupId)
	{
		super.handleThreadUncaughtException(t, e, groupId);
		if (mDebugMode && mDevSupportManager != null)
		{
			synchronized (mLock)
			{
				if (mThreadExecutor != null)
				{
					mThreadExecutor.destroy();
					mThreadExecutor = null;
				}

			}

		}
	}
}
