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
package com.tencent.mtt.hippy.adapter.http;

import android.os.Build;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@SuppressWarnings({"unused"})
public class HippyHttpRequest {

  public static final int DEFAULT_TIMEOUT_MS = 3000;

  private static String USER_AGENT = null;
  private int mConnectTimeout = DEFAULT_TIMEOUT_MS;
  private int mReadTimeout = DEFAULT_TIMEOUT_MS;
  private final Map<String, Object> mHeaderMap;
  private String mUrl;
  private boolean mUseCaches = true;
  private String mMethod = "GET";
  private boolean mInstanceFollowRedirects = false;
  private String mBody;
  private int mErrorCode = 0;

  public HippyHttpRequest() {
    //noinspection unchecked,rawtypes
    mHeaderMap = new HashMap();
    initUserAgent();

    if (USER_AGENT != null) {
      addHeader(HttpHeader.REQ.USER_AGENT, USER_AGENT);
    } else {
      System.err.println("user_agent is null!");
    }
  }

  public String getUrl() {
    return mUrl;
  }

  public void setUrl(String url) {
    this.mUrl = url;
  }

  public void addHeader(String name, String value) {
    mHeaderMap.put(name, value);
  }

  public void addHeader(String name, List<String> value) {
    mHeaderMap.put(name, value);
  }

  public Map<String, Object> getHeaders() {
    return mHeaderMap;
  }

  public int getConnectTimeout() {
    return mConnectTimeout;
  }

  public void setConnectTimeout(int time) {
    mConnectTimeout = time;
  }

  public int getReadTimeout() {
    return mReadTimeout;
  }

  public void setReadTimeout(int time) {
    mReadTimeout = time;
  }

  public boolean isUseCaches() {
    return mUseCaches;
  }

  public void setUseCaches(boolean useCaches) {
    this.mUseCaches = useCaches;
  }

  public String getMethod() {
    return mMethod;
  }

  public void setMethod(String method) {
    this.mMethod = method;
  }

  public boolean isInstanceFollowRedirects() {
    return mInstanceFollowRedirects;
  }

  public void setInstanceFollowRedirects(boolean instanceFollowRedirects) {
    this.mInstanceFollowRedirects = instanceFollowRedirects;
  }

  public String getBody() {
    return mBody;
  }

  public void setErrorCode(int errorCode) {
    this.mErrorCode = errorCode;
  }

  public int getErrorCode() {
    return mErrorCode;
  }

  public void setBody(String body) {
    this.mBody = body;
  }

  private void initUserAgent() {
    if (USER_AGENT == null) {
      Locale locale = Locale.getDefault();
      StringBuffer buffer = new StringBuffer();
      // Add version
      final String version = Build.VERSION.RELEASE;
      if (version.length() > 0) {
        buffer.append(version);
      } else {
        // default to "1.0"
        buffer.append("1.0");
      }
      buffer.append("; ");
      final String language = locale.getLanguage();
      buffer.append(language.toLowerCase());
      final String country = locale.getCountry();
      buffer.append("-");
      buffer.append(country.toLowerCase());
      final String base = "Mozilla/5.0 (Linux; U; Android %s) AppleWebKit/533.1 (KHTML, like Gecko) Mobile Safari/533.1";
      USER_AGENT = String.format(base, buffer);
    }
  }

}
