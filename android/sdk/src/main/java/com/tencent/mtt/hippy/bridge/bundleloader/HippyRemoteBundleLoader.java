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
package com.tencent.mtt.hippy.bridge.bundleloader;

import android.text.TextUtils;
import com.tencent.mtt.hippy.bridge.HippyBridge;
import com.tencent.mtt.hippy.bridge.NativeCallback;
import com.tencent.mtt.hippy.utils.LogUtils;

@SuppressWarnings("unused")
public class HippyRemoteBundleLoader implements HippyBundleLoader
{
	final String	mUrl;

	boolean         mIsDebugMode = false;

	private boolean	mCanUseCodeCache;

	private String	mCodeCacheTag;

	public HippyRemoteBundleLoader(String url)
	{
		this(url, false, "");
	}

	public HippyRemoteBundleLoader(String url, boolean canUseCodeCache, String codeCacheTag) {
		this.mUrl = url;
		this.mCanUseCodeCache = canUseCodeCache;
		this.mCodeCacheTag = codeCacheTag;
	}

	public void setCodeCache(boolean canUseCodeCache, String codeCacheTag) {
		this.mCanUseCodeCache = canUseCodeCache;
		this.mCodeCacheTag = codeCacheTag;
	}

	public void setIsDebugMode(boolean debugMode) {
		mIsDebugMode = debugMode;
	}

	@Override
	public void load(HippyBridge bridge, NativeCallback callback) {
		if (TextUtils.isEmpty(mUrl)) {
			return;
		}

		boolean ret = bridge.runScriptFromUri(mUrl, null, mCanUseCodeCache, mCodeCacheTag, callback);
		LogUtils.d("HippyRemoteBundleLoader", "load: ret" + ret);
	}

	@Override
	public String getPath() { return mUrl; }

	@Override
	public String getRawPath()
	{
		return mUrl;
	}

	@Override
	public String getBundleUniKey()
	{
		return getPath();
	}

	@Override
	public boolean canUseCodeCache()
	{
		return mCanUseCodeCache;
	}

	@Override
	public String getCodeCacheTag()
	{
		return mCodeCacheTag;
	}

}
