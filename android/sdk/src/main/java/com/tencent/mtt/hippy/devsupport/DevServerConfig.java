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
package com.tencent.mtt.hippy.devsupport;

import android.content.Context;
import android.content.SharedPreferences;
import com.tencent.mtt.hippy.utils.ContextHolder;

public class DevServerConfig
{
	private static final String	JS_REMOTE_DEBUG		= "js_remote_debug";

	private static final String	HIPPYDEBUGPREF		= "hippydebugpref";

	boolean						mLiveDebug			= false;

	final SharedPreferences sharedPreferences;

	// Hippy Server JsBundle名字
	private final String				mServerHost;

	@SuppressWarnings("unused")
	public DevServerConfig(String serverHost, String bundleName)
	{
		sharedPreferences = ContextHolder.getAppContext().getSharedPreferences(HIPPYDEBUGPREF, Context.MODE_PRIVATE);
		mServerHost = serverHost;
	}

	public String getServerHost()
	{
		return mServerHost;
	}

	public boolean enableRemoteDebug()
	{
		return sharedPreferences.getBoolean(JS_REMOTE_DEBUG, false);
	}

	public boolean enableLiveDebug()
	{
		return mLiveDebug;
	}

	public void setEnableLiveDebug(boolean enableLiveDebug)
	{
		mLiveDebug = enableLiveDebug;
	}

}
