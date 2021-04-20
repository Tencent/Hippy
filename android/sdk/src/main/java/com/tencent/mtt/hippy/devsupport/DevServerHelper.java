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


import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpRequest;
import com.tencent.mtt.hippy.adapter.http.HippyHttpResponse;

import java.io.*;
import java.util.Locale;

public class DevServerHelper
{
	private static final String	BUNDLE_URL_FORMAT						= "http://%s/%s?platform=android&dev=%s&hot=%s&minify=%s";
	private static final String	LAUNCH_JS_DEVTOOLS_COMMAND_URL_FORMAT	= "http://%s/launch-js-devtools";
	private static final String	WEBSOCKET_PROXY_URL_FORMAT				= "ws://%s/debugger-proxy?role=client";
	private static final String	WEBSOCKET_LIVERELOAD_URL_FORMAT			= "ws://%s/debugger-live-reload";
	private static final String	ONCHANGE_ENDPOINT_URL_FORMAT			= "http://%s/onchange";

	private final HippyGlobalConfigs	mGlobalConfigs;
	private final String				mServerHost;

	public DevServerHelper(HippyGlobalConfigs configs, String serverHost)
	{
		mGlobalConfigs = configs;
		mServerHost = serverHost;
	}

	public String createBundleURL(String host, String bundleName, boolean devMode, boolean hmr, boolean jsMinify)
	{
		return String.format(Locale.US, BUNDLE_URL_FORMAT, host, bundleName, devMode, hmr, jsMinify);
	}

	public String getLiveReloadURL()
	{
		return String.format(Locale.US, WEBSOCKET_LIVERELOAD_URL_FORMAT, mServerHost);
	}

	public void fetchBundleFromURL(final BundleFetchCallBack bundleFetchCallBack, final String url)
	{
		HippyHttpRequest request = new HippyHttpRequest();
		request.setUrl(url);
		mGlobalConfigs.getHttpAdapter().sendRequest(request, new HippyHttpAdapter.HttpTaskCallback()
		{
			@Override
			public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response) throws Exception
			{
				if (bundleFetchCallBack == null) {
					return;
				}
				if (response.getStatusCode() == 200 && response.getInputStream() != null) {
					bundleFetchCallBack.onSuccess(response.getInputStream());
				} else {
					String message = "unknown";
					if (response.getErrorStream() != null)
					{
						StringBuffer sb = new StringBuffer();
						String readLine;
						//noinspection CharsetObjectCanBeUsed
						BufferedReader bfReader = new BufferedReader(new InputStreamReader(response.getErrorStream(), "UTF-8"));
						while ((readLine = bfReader.readLine()) != null)
						{
							sb.append(readLine);
							sb.append("\r\n");
						}
						message = sb.toString();
					}
					if (bundleFetchCallBack != null)
					{
						bundleFetchCallBack.onFail(new DevServerException("Could not connect to development server." + "URL: " + url
								+ "  try to :adb reverse tcp:38989 tcp:38989 , message : " + message));
					}
				}
			}

			@Override
			public void onTaskFailed(HippyHttpRequest request, Throwable error)
			{
				if (bundleFetchCallBack != null)
				{
					bundleFetchCallBack.onFail(new DevServerException("Could not connect to development server." + "URL: " + url
							+ "  try to :adb reverse tcp:38989 tcp:38989 , message : " + error.getMessage()));
				}
			}
		});
	}
}
