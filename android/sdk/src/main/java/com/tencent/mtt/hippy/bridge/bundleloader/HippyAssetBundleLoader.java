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

import static com.tencent.mtt.hippy.bridge.HippyBridge.URI_SCHEME_ASSETS;

import android.content.Context;
import android.content.res.AssetManager;
import android.text.TextUtils;

import com.tencent.mtt.hippy.bridge.HippyBridge;
import com.tencent.mtt.hippy.bridge.NativeCallback;

/**
 * FileName: HippyAssetBundleLoader
 * Description：
 * History：
 */
public class HippyAssetBundleLoader implements HippyBundleLoader
{
	private static final String ASSETS_STR = "assets://";
	private Context	mContext;

	private String mAssetPath;

	private boolean	mCanUseCodeCache;

	private String	mCodeCacheTag;

	public HippyAssetBundleLoader(Context context, String assetName)
	{
		this(context, assetName, false, "");
	}

	public HippyAssetBundleLoader(Context context, String assetName, boolean canUseCodeCache, String codeCacheTag)
	{
		this.mContext = context;
		this.mAssetPath = assetName;
		this.mCanUseCodeCache = canUseCodeCache;
		this.mCodeCacheTag = codeCacheTag;
	}

	public void setCodeCache(boolean canUseCodeCache, String codeCacheTag)
	{
		this.mCanUseCodeCache = canUseCodeCache;
		this.mCodeCacheTag = codeCacheTag;
	}

	@Override
	public boolean load(HippyBridge bridge, NativeCallback callback)
	{
		if (TextUtils.isEmpty(mAssetPath)) {
			return false;
		}

		AssetManager assetManager = mContext.getAssets();
		String uri = mAssetPath;
		if (!mAssetPath.startsWith(URI_SCHEME_ASSETS)) {
			if (mAssetPath.startsWith("/")) {
				uri = URI_SCHEME_ASSETS + mAssetPath;
			} else {
				uri = URI_SCHEME_ASSETS + "/" + mAssetPath;
			}
		}

		return bridge.runScriptFromUri(uri, assetManager, mCanUseCodeCache, mCodeCacheTag, callback);
		//return bridge.runScriptFromAssets(mAssetPath, assetManager,mCanUseCodeCache,mCodeCacheTag, callback);
	}

	@Override
	public String getPath()
	{
		if (mAssetPath != null && !mAssetPath.startsWith(ASSETS_STR))
			return ASSETS_STR + mAssetPath;
		else
			return mAssetPath;
	}

	@Override
	public String getRawPath()
	{
		return mAssetPath;
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
