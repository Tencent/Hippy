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
import com.tencent.mtt.hippy.modules.nativemodules.HippySettableFuture;

import java.io.*;
import java.util.Locale;

/**
 * @author: edsheng
 * @date: 2017/11/14 17:36
 * @version: V1.0
 */
public class DevServerHelper
{
	private static final String	BUNDLE_URL_FORMAT						= "http://%s/%s?platform=android&dev=%s&hot=%s&minify=%s";
	private static final String	LAUNCH_JS_DEVTOOLS_COMMAND_URL_FORMAT	= "http://%s/launch-js-devtools";
	private static final String	WEBSOCKET_PROXY_URL_FORMAT				= "ws://%s/debugger-proxy?role=client";
	private static final String	WEBSOCKET_LIVERELOAD_URL_FORMAT			= "ws://%s/debugger-live-reload";
	private static final String	ONCHANGE_ENDPOINT_URL_FORMAT			= "http://%s/onchange";

	private HippyGlobalConfigs	mGlobalConfigs;
	private String				mServerHost;

	public DevServerHelper(HippyGlobalConfigs configs, String serverHost)
	{
		mGlobalConfigs = configs;
		mServerHost = serverHost;
	}

	private static String createBundleURL(String host, String bundleName, boolean devMode, boolean hmr, boolean jsMinify)
	{
		return String.format(Locale.US, BUNDLE_URL_FORMAT, host, bundleName, devMode, hmr, jsMinify);
	}

	private String createOnChangeEndpointUrl()
	{
		return String.format(Locale.US, ONCHANGE_ENDPOINT_URL_FORMAT, mServerHost);
	}

	public String getWebSocketProxyURL()
	{
		return String.format(Locale.US, WEBSOCKET_PROXY_URL_FORMAT, mServerHost);
	}

	public String getLiveReloadURL()
	{
		return String.format(Locale.US, WEBSOCKET_LIVERELOAD_URL_FORMAT, mServerHost);
	}

	private String createLaunchJSDevToolsCommandUrl()
	{
		return String.format(Locale.US, LAUNCH_JS_DEVTOOLS_COMMAND_URL_FORMAT, mServerHost);
	}

	public String getJSBundleURLForRemoteDebugging(String serverHost, String bundleName, boolean devmode)
	{
		return createBundleURL(serverHost, bundleName, devmode, false, false);
	}

	public boolean launchDebugTools()
	{
		final HippySettableFuture<Boolean> future = new HippySettableFuture();
		HippyHttpRequest request = new HippyHttpRequest();
		request.setUrl(createLaunchJSDevToolsCommandUrl());
		mGlobalConfigs.getHttpAdapter().sendRequest(request, new HippyHttpAdapter.HttpTaskCallback()
		{
			@Override
			public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response) throws Exception
			{
				future.set(response.getStatusCode() == 200);
			}

			@Override
			public void onTaskFailed(HippyHttpRequest request, Throwable error)
			{
				future.set(false);
			}
		});

		try
		{
			return future.get();
		}
		catch (Throwable e)
		{
			return false;
		}
	}

	public void fetchBundleFromURL(final BundleFetchCallBack bundleFetchCallBack, boolean enableDebug, String serverHost, String bundleName, final File outputFile)
	{
		final String bundleURL = createBundleURL(serverHost, bundleName, enableDebug, false, false);

		HippyHttpRequest request = new HippyHttpRequest();
		request.setUrl(bundleURL);
		mGlobalConfigs.getHttpAdapter().sendRequest(request, new HippyHttpAdapter.HttpTaskCallback()
		{
			@Override
			public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response) throws Exception
			{
				if (bundleFetchCallBack == null)
				{
					return;
				}
				if (response.getStatusCode() == 200 && response.getInputStream() != null)
				{
					FileOutputStream fileOutputStream = null;
					try
					{
						if (outputFile.exists())
						{
							outputFile.delete();
						}
						outputFile.createNewFile();

						fileOutputStream = new FileOutputStream(outputFile);

						byte[] b = new byte[2048];
						int size = 0;
						while ((size = response.getInputStream().read(b)) > 0)
						{
							fileOutputStream.write(b, 0, size);
						}
						fileOutputStream.flush();
						if (bundleFetchCallBack != null)
						{
							bundleFetchCallBack.onSuccess(outputFile);
						}
					}
					catch (Throwable e)
					{
						e.printStackTrace();
					}
					finally
					{
						if (fileOutputStream != null)
						{
							try
							{
								fileOutputStream.close();
							}
							catch (IOException e)
							{
							}
						}
					}
				}
				else
				{
					String message = "unknown";
					if (response.getErrorStream() != null)
					{
						StringBuffer sb = new StringBuffer();
						String readLine = null;
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
						bundleFetchCallBack.onFail(new DevServerException("Could not connect to development server." + "URL: " + bundleURL.toString()
								+ "  try to :adb reverse tcp:38989 tcp:38989 , message : " + message));
					}
				}
			}

			@Override
			public void onTaskFailed(HippyHttpRequest request, Throwable error)
			{
				if (bundleFetchCallBack != null)
				{
					bundleFetchCallBack.onFail(new DevServerException("Could not connect to development server." + "URL: " + bundleURL.toString()
							+ "  try to :adb reverse tcp:38989 tcp:38989 , message : " + error.getMessage()));
				}
			}
		});
	}
}
