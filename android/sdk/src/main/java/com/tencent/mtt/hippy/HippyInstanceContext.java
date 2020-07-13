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

import android.content.Context;
import android.content.ContextWrapper;
import android.text.TextUtils;

import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyFileBundleLoader;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.supportui.utils.struct.WeakEventHub;

import java.util.Map;

/**
 * FileName: HippyInstanceContext
 * Description：
 * History：
 */
public final class HippyInstanceContext extends ContextWrapper
{
	private static final String						TAG	= "HippyInstanceContext";

	private HippyEngineContext						mEngineContext;
	private WeakEventHub<InstanceDestroyListener> mDestroyListeners;
	HippyEngine.ModuleLoadParams					mModuleParams;
	private HippyBundleLoader						mBundleLoader;

	public HippyInstanceContext(Context context, HippyEngine.ModuleLoadParams params)
	{
		super(context);
		setModuleParams(params);
		mDestroyListeners = new WeakEventHub<>();
	}

	public HippyBundleLoader getBundleLoader()
	{
		return mBundleLoader;
	}

	public HippyInstanceContext(Context context)
	{
		super(context);
		mDestroyListeners = new WeakEventHub<>();
	}

	public HippyEngine.ModuleLoadParams getModuleParams()
	{
		return mModuleParams;
	}

	public void setEngineContext(HippyEngineContext context)
	{
		this.mEngineContext = context;
	}

	public void setModuleParams(HippyEngine.ModuleLoadParams params)
	{
		mModuleParams = params;
		if (mModuleParams != null && mModuleParams.bundleLoader != null)
			mBundleLoader = mModuleParams.bundleLoader;
		else
		{
			if (!TextUtils.isEmpty(params.jsAssetsPath))
				mBundleLoader = new HippyAssetBundleLoader(params.context, params.jsAssetsPath, !TextUtils.isEmpty(params.codeCacheTag), params.codeCacheTag);
			else if (!TextUtils.isEmpty(params.jsFilePath))
				mBundleLoader = new HippyFileBundleLoader(params.jsFilePath, !TextUtils.isEmpty(params.codeCacheTag), params.codeCacheTag);
		}
	}

	public HippyEngineContext getEngineContext()
	{
		return mEngineContext;
	}

	public Map getNativeParams()
	{
		return mModuleParams != null ? mModuleParams.nativeParams : null;
	}

	public void registerInstanceDestroyListener(InstanceDestroyListener listener)
	{
		if (listener != null && mDestroyListeners != null)
		{
			mDestroyListeners.registerListener(listener);
		}
	}

	public void unregisterInstanceDestroyListener(InstanceDestroyListener listener)
	{
		if (listener != null && mDestroyListeners != null)
		{
			mDestroyListeners.unregisterListener(listener);
		}
	}

	void notifyInstanceDestroy()
	{
		if (mModuleParams != null)
		{
			Map map = mModuleParams.nativeParams;
			if (map != null)
				map.clear();
		}
		if (mDestroyListeners != null && mDestroyListeners.size() > 0)
		{
			Iterable<InstanceDestroyListener> listeners = mDestroyListeners.getNotifyListeners();
			for (InstanceDestroyListener l : listeners)
			{
				if (l != null)
				{
					try
					{
						l.onInstanceDestroy();
					}
					catch (Exception e)
					{
						LogUtils.e(TAG, e.getCause().toString());
					}
				}
			}
		}
		// harryguo：有什么必要置空？理由：注意本类是个继承与Android系统的Context，用途极为广泛，而且极难发现。
		// 极容易被不小心的SDK使用者拿来用作它途（如：创建其他不相干的View....），导致无法释放，
		// 所以本类里的所有变量都得置空，避免这些变量及这些变量内部的其他变量也无法释放。
		// new 一个新的Context，而不用Activity自带的Context，不是个好主意，存在大隐患。应该重构去除。
		mDestroyListeners = null;
		mEngineContext = null;
		mModuleParams = null;
		mBundleLoader = null;
	}

	HippyEngine mHippyEngineManager;

	public void attachEngineManager(HippyEngine hippyEngineManager)
	{
		mHippyEngineManager = hippyEngineManager;
	}

	public HippyEngine getEngineManager()
	{
		return mHippyEngineManager;
	}

	public interface InstanceDestroyListener
	{
		void onInstanceDestroy();
	}
}
