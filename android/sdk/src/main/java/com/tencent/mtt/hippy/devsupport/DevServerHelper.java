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


import android.text.TextUtils;

import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpRequest;
import com.tencent.mtt.hippy.adapter.http.HippyHttpResponse;

import java.io.*;
import java.util.Locale;

@SuppressWarnings({"unused"})
public class DevServerHelper {

  private static final String BUNDLE_URL_FORMAT = "%s://%s/%s?platform=android&dev=%s&hot=%s&minify=%s";
  // --Commented out by Inspection (2021/5/4 20:09):private static final String	LAUNCH_JS_DEVTOOLS_COMMAND_URL_FORMAT	= "http://%s/launch-js-devtools";
  // --Commented out by Inspection (2021/5/4 20:10):private static final String	WEBSOCKET_PROXY_URL_FORMAT				= "ws://%s/debugger-proxy?role=client";
  private static final String WEBSOCKET_LIVERELOAD_URL_FORMAT = "ws://%s/debugger-live-reload";
  // --Commented out by Inspection (2021/5/4 20:10):private static final String	ONCHANGE_ENDPOINT_URL_FORMAT			= "http://%s/onchange";
  private static final String DEBUG_URL_PREFIX = "ws://%s/debugger-proxy";
  private static final String DEBUG_URL_APPEND = "role=android_client&clientId=%s&hash=%s&contextName=%s";
  private static final String DEFAULT_BUNDLE_SCHEME = "http";

  private final HippyGlobalConfigs mGlobalConfigs;
  private final String mServerHost;
  DevRemoteServerData mRemoteServerData;

  public DevServerHelper(HippyGlobalConfigs configs, String serverHost, String remoteServerUrl) {
    mGlobalConfigs = configs;
    mServerHost = serverHost;
    mRemoteServerData = new DevRemoteServerData(remoteServerUrl);
  }
  // 单独设置remoteServerUrl的解析
  public void setRemoteServerData(String wsDebugUrl) {
    mRemoteServerData = new DevRemoteServerData(wsDebugUrl);
  }

  public String createBundleURL(String host, String bundleName, boolean devMode, boolean hmr,
    boolean jsMinify) {
    if (mRemoteServerData.isValid()) {
      // remote debugging in non usb
      return String.format(Locale.US, BUNDLE_URL_FORMAT, mRemoteServerData.getScheme(), mRemoteServerData.getHost(), mRemoteServerData.getPath(),
        devMode, hmr, jsMinify);
    }
    return String.format(Locale.US, BUNDLE_URL_FORMAT, DEFAULT_BUNDLE_SCHEME, host, bundleName, devMode, hmr, jsMinify);
  }

  public String createDebugURL(String host, String componentName, String clientId) {
    String debugUrl = DEBUG_URL_PREFIX + "?" + DEBUG_URL_APPEND;
    if (mRemoteServerData.isValid()) {
      // remote debugging in non usb
      if (!TextUtils.isEmpty(mRemoteServerData.getWsUrl())) {
        // use the remoteServer ws url first
        debugUrl = mRemoteServerData.getWsUrl() + (mRemoteServerData.getWsUrl().contains("?") ? "&" : "?") + DEBUG_URL_APPEND;
        return String.format(Locale.US, debugUrl, clientId, mRemoteServerData.getVersionId(), componentName);
      }
      return String.format(Locale.US, debugUrl, mRemoteServerData.getHost(), clientId,
        mRemoteServerData.getVersionId(), componentName);
    }
    return String.format(Locale.US, debugUrl, host, clientId, "", componentName);
  }

  public String getLiveReloadURL() {
    String[] host = mServerHost.split(":");
    String newHost = host[0] + ":38999";
    return String.format(Locale.US, WEBSOCKET_LIVERELOAD_URL_FORMAT, newHost);
  }

  public void fetchBundleFromURL(final BundleFetchCallBack bundleFetchCallBack, final String url) {
    HippyHttpRequest request = new HippyHttpRequest();
    request.setUrl(url);
    mGlobalConfigs.getHttpAdapter().sendRequest(request, new HippyHttpAdapter.HttpTaskCallback() {
      @Override
      public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response)
          throws Exception {
        if (bundleFetchCallBack == null) {
          return;
        }
        if (response.getStatusCode() == 200 && response.getInputStream() != null) {
          bundleFetchCallBack.onSuccess(response.getInputStream());
        } else {
          String message = "unknown";
          if (response.getErrorStream() != null) {
            StringBuilder sb = new StringBuilder();
            String readLine;
            //noinspection CharsetObjectCanBeUsed
            BufferedReader bfReader = new BufferedReader(
                new InputStreamReader(response.getErrorStream(), "UTF-8"));
            while ((readLine = bfReader.readLine()) != null) {
              sb.append(readLine);
              sb.append("\r\n");
            }
            message = sb.toString();
          }
          bundleFetchCallBack.onFail(
              new DevServerException("Could not connect to development server." + "URL: " + url
                  + "  try to :adb reverse tcp:38989 tcp:38989 , message : " + message));
        }
      }

      @Override
      public void onTaskFailed(HippyHttpRequest request, Throwable error) {
        if (bundleFetchCallBack != null) {
          bundleFetchCallBack.onFail(
              new DevServerException("Could not connect to development server." + "URL: " + url
                  + "  try to :adb reverse tcp:38989 tcp:38989 , message : " + error.getMessage()));
        }
      }
    });
  }
}
