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
import com.tencent.mtt.hippy.utils.LogUtils;
import java.io.UnsupportedEncodingException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.regex.Pattern;

public class DevRemoteServerData {

  private static String KEY_DEBUG_URL = "debugUrl";
  private String scheme;  // protocol http or https
  private String host;  // host:port address
  private String path;
  private String versionId;
  private String wsUrl;  // ws debug url if remoteDebugUrl with

  public DevRemoteServerData(String remoteServerUrl) {
    parseUrl(remoteServerUrl);
  }

  /**
   * parse url in remote debugging
   * <p>url structure: http://host/versionId/index.bundle</p>
   *
   * @param remoteServerUrl remote debugging url
   */
  private void parseUrl(String remoteServerUrl) {
    if (TextUtils.isEmpty(remoteServerUrl)) {
      return;
    }
    String wsUrlPattern = "^wss?://.+";
    try {
      if (Pattern.matches(wsUrlPattern, remoteServerUrl)) {
        wsUrl = remoteServerUrl;
        host = "fakeurl.com"; // just for the isValid rule
      } else {
        URL url = new URL(remoteServerUrl);
        scheme = url.getProtocol();
        host = url.getHost();
        path = url.getPath();
        int port = url.getPort();
        if (port > 0) {
          host = host + ":" + port;
        }
        wsUrl = parseQueryDebugUrl(url.getQuery());
        if (path.startsWith("/")) {
          path = path.substring(1); // remove first character /
        }
        int index = path.indexOf("/");
        if (index >= 0) {
          versionId = path.substring(0, index);
        }
        LogUtils.i("Hippy DevRemoteServerData",
                String.format("parseUrl host:%s, versionId:%s", host, versionId));
      }
    } catch (Exception e) {
      LogUtils.e("Hippy DevRemoteServerData", "parseUrl error", e);
    }
  }

  /**
   * parse the ws debug url when remoteDebugUrl with
   *
   * @param query query params
   * @return debugUrl value
   * @throws UnsupportedEncodingException not support encoding
   */
  private String parseQueryDebugUrl(String query) throws UnsupportedEncodingException {
    if (TextUtils.isEmpty(query)) {
      return null;
    }
    String[] queryList = query.split("&");
    for (String queryItem : queryList) {
      int idPosition = queryItem.indexOf("=");
      if (idPosition >= 0) {
        String findKey = queryItem.substring(0, idPosition);
        if (KEY_DEBUG_URL.equals(findKey)) {
          return URLDecoder.decode(queryItem.substring(idPosition + 1), "UTF-8");
        }
      }
    }
    return null;
  }

  public boolean isValid() {
    return !TextUtils.isEmpty(host);
  }

  public String getHost() {
    return host;
  }

  public String getVersionId() {
    return versionId;
  }

  public String getPath() {
    return path;
  }

  public String getScheme() {
    return scheme;
  }

  public String getWsUrl() {
    return wsUrl;
  }
}
