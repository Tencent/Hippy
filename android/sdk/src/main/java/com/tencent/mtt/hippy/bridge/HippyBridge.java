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

import android.content.res.AssetManager;
import com.tencent.mtt.hippy.common.HippyArray;
import java.nio.ByteBuffer;

public interface HippyBridge {
	static final String URI_SCHEME_ASSETS = "asset:";
	static final String URI_SCHEME_FILE   = "file:";

	public void initJSBridge(String gobalConfig, NativeCallback callback, int groupId);

	public boolean runScriptFromFile(String filePath, String scriptName, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback);

	public boolean runScriptFromAssets(String fileName, AssetManager assetManager, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback);

	public boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache, String codeCacheTag, NativeCallback callback);

	void onDestroy();

	public void destroy(NativeCallback callback);

	public void callFunction(String action, NativeCallback callback, ByteBuffer buffer);

  public void callFunction(String action, NativeCallback callback, byte[] buffer);
	public void callFunction(String action, NativeCallback callback, byte[] buffer, int offset, int length);

	public static interface BridgeCallback {
		public void callNatives(String moduleName, String moduleFunc, String callId, HippyArray params);

		public void reportException(String exception, String stackTrace);
	}
}
