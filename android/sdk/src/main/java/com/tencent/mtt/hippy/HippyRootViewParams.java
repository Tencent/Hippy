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

import android.app.Activity;
import android.text.TextUtils;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.common.HippyMap;

import java.util.Map;

@SuppressWarnings({"deprecation", "unused", "rawtypes"})
@Deprecated
public class HippyRootViewParams
{

	private final HippyBundleLoader		mBundleLoader;

	private final Activity				mActivity;

	private final String				mName;

	// 带上参数，传递给前端的rootview：比如：Hippy.entryPage: class App extends Component
	private final HippyMap				mLaunchParams;

	// 目前只有一个用处：映射："CustomViewCreator" <==> 宿主自定义的一个HippyCustomViewCreator(这个creator还得通过ModuleParams.Builder.setCustomViewCreator来指定才行)
	private final Map					mNativeParams;

	private HippyInstanceContext	    mHippyInstanceContext;


	private HippyRootViewParams(String name, HippyBundleLoader bundleLoader, Activity activity, HippyMap launchParams, Map nativeParams,
			HippyInstanceContext hippyInstanceContext)
	{
		this.mName = name;
		this.mBundleLoader = bundleLoader;
		this.mActivity = activity;
		this.mLaunchParams = launchParams;
		this.mNativeParams = nativeParams;
		this.mHippyInstanceContext = hippyInstanceContext;
	}

	HippyInstanceContext getInstanceContext()
	{
		return mHippyInstanceContext;
	}

	public void clearHippyInstanceContext()
	{
		mHippyInstanceContext = null;
	}

	public HippyBundleLoader getBundleLoader()
	{
		return mBundleLoader;
	}

	public String getName()
	{
		return mName;
	}

	public HippyMap getLaunchParams()
	{
		return mLaunchParams;
	}

	public Map getNativeParams()
	{
		return mNativeParams;
	}

	public Activity getActivity()
	{
		return mActivity;
	}

	public static class Builder
	{

		private HippyBundleLoader		mBundleLoader;

		private Activity				mActivity;

		private String					mName;

		private HippyMap				mLaunchParams;

		private Map						mNativeParams;

		private HippyInstanceContext	mHippyInstanceContext;

		public HippyRootViewParams.Builder setInstanceContext(HippyInstanceContext hippyInstanceContext)
		{
			this.mHippyInstanceContext = hippyInstanceContext;
			return this;
		}

		@SuppressWarnings("UnusedReturnValue")
		public HippyRootViewParams.Builder setBundleLoader(HippyBundleLoader loader)
		{
			this.mBundleLoader = loader;
			return this;
		}

		public HippyRootViewParams.Builder setActivity(Activity activity)
		{
			this.mActivity = activity;
			return this;
		}

		public HippyRootViewParams.Builder setName(String name)
		{
			this.mName = name;
			return this;
		}

		@SuppressWarnings("UnusedReturnValue")
		public HippyRootViewParams.Builder setLaunchParams(HippyMap params)
		{
			this.mLaunchParams = params;
			return this;
		}

		public HippyRootViewParams.Builder setNativeParams(Map params)
		{
			this.mNativeParams = params;
			return this;
		}

		public HippyRootViewParams build()
		{
			if (mActivity == null)
			{
				throw new IllegalArgumentException("HippyInstance must set activity!");
			}
			if (TextUtils.isEmpty(mName))
			{
				throw new IllegalArgumentException("HippyInstance must set name!");
			}
			if (mLaunchParams == null)
			{
				mLaunchParams = new HippyMap();
			}

			if (mBundleLoader != null)
			{
				mLaunchParams.pushString("sourcePath", mBundleLoader.getPath());
			}

			return new HippyRootViewParams(mName, mBundleLoader, mActivity, mLaunchParams, mNativeParams,
					mHippyInstanceContext);
		}
	}
}
