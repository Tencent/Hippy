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

import android.text.TextUtils;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.modules.nativemodules.network.NetworkModule;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class DefaultHttpAdapter implements HippyHttpAdapter {

  private ExecutorService mExecutorService;

  private static URL toURL(String url) throws MalformedURLException {
    URL _URL = new URL(url);

    // 有个别 URL 在 path 和 querystring 之间缺少 / 符号，需补上
    if (_URL.getPath() == null || "".equals(_URL.getPath())) {
      if (_URL.getFile() != null && _URL.getFile().startsWith("?")) {
        // 补斜杠符号
        int idx = url.indexOf('?');
        if (idx != -1) {
          String sb = url.substring(0, idx)
              + '/'
              + url.substring(idx);
          _URL = new URL(sb);

          // System.out.println("toURL : " + _URL.toString());
        }
      }

      // 分支走到这里，没有path也没有file，证明为一个没有/的host，例如:
      // http://m.cnbeta.com(注意：后面没有/)
      if (_URL.getFile() == null || "".equals(_URL.getFile())) {
        String sb = url
            + "/";
        _URL = new URL(sb);
      }

    }
    return _URL;
  }

  private void execute(Runnable runnable) {
    if (mExecutorService == null) {
      mExecutorService = Executors.newFixedThreadPool(3);
    }
    mExecutorService.execute(runnable);
  }

  @Override
  public void sendRequest(final HippyHttpRequest request, final HttpTaskCallback callback) {
    execute(new Runnable() {
      @Override
      public void run() {
        if (callback == null) {
          return;
        }
        HippyHttpResponse response = null;
        HttpURLConnection connection = null;
        try {
          connection = createConnection(request);
          fillHeader(connection, request);
          fillPostBody(connection, request);
          response = createResponse(connection);

          callback.onTaskSuccess(request, response);
        } catch (Throwable e) {
          callback.onTaskFailed(request, e);
        } finally {
          if (response != null) {
            response.close();
          }
          if (connection != null) {
            connection.disconnect();
          }
        }
      }
    });
  }

  HippyHttpResponse createResponse(HttpURLConnection urlConnection) throws Exception {
    HippyHttpResponse response = new HippyHttpResponse();
    parseResponseHeaders(urlConnection, response);
    boolean isException = false;
    InputStream inputStream = null;
    try {
      inputStream = urlConnection.getInputStream();
    } catch (IOException ie) {
      ie.printStackTrace();
      isException = true;
    }

    InputStream errorStream = null;
    if (isException || urlConnection.getResponseCode() >= 400) {
      try {
        errorStream = urlConnection.getErrorStream();
      } catch (Exception e) {
        e.printStackTrace();
      }
    }

    if (isException) {
      inputStream = errorStream;
    }
    response.setInputStream(inputStream);
    response.setErrorStream(errorStream);
    response.setResponseMessage(urlConnection.getResponseMessage());

    return response;
  }

  HttpURLConnection createConnection(HippyHttpRequest request) throws Exception {
    if (TextUtils.isEmpty(request.getUrl())) {
      throw new RuntimeException("url is null");
    }
    URL url = toURL(request.getUrl());
    HttpURLConnection connection = (HttpURLConnection) url.openConnection();

    if (TextUtils.isEmpty(request.getMethod())) {
      request.setMethod("GET");
    }
    connection.setRequestMethod(request.getMethod());
    connection.setUseCaches(request.isUseCaches());
    connection.setInstanceFollowRedirects(request.isInstanceFollowRedirects());

    connection.setConnectTimeout(request.getConnectTimeout());
    connection.setReadTimeout(request.getReadTimeout());

    if (request.getMethod().equalsIgnoreCase("POST") || request.getMethod().equalsIgnoreCase("PUT")
        || request.getMethod().equalsIgnoreCase("PATCH")) {

      connection.setDoOutput(true);
    }

    return connection;
  }

  void fillHeader(URLConnection urlConnection, HippyHttpRequest request) {
    Map<String, Object> headerMap = request.getHeaders();
    if (headerMap != null && !headerMap.isEmpty()) {
      Set<String> keySets = headerMap.keySet();
      for (String key : keySets) {
        Object obj = headerMap.get(key);
        if (obj instanceof String) {
          urlConnection.setRequestProperty(key, (String) obj);
        } else if (obj instanceof List) {
          @SuppressWarnings("unchecked") List<String> requestProperties = (List<String>) obj;
          if (!requestProperties.isEmpty()) {
            for (String oneReqProp : requestProperties) {
              if (!TextUtils.isEmpty(oneReqProp)) {
                urlConnection.addRequestProperty(key, oneReqProp);
              }
            }
          }
        }

      }
    }
  }

  void fillPostBody(HttpURLConnection connection, HippyHttpRequest request) throws IOException {
    if (TextUtils.isEmpty(request.getBody())) {
      return;
    }
    connection.setRequestProperty("Content-Length", request.getBody().getBytes().length + "");
    DataOutputStream out = new DataOutputStream(connection.getOutputStream());
    //TODO big stream will cause OOM; Progress callback is meaningless
    out.write(request.getBody().getBytes());
    out.flush();
    out.close();
  }

  void parseResponseHeaders(HttpURLConnection httpConn, HippyHttpResponse response)
      throws Exception {
    if (httpConn == null) {
      return;
    }

    response.setStatusCode(httpConn.getResponseCode());
    response.setRspHeaderMap(httpConn.getHeaderFields());
  }

  public void destroyIfNeed() {
    if (mExecutorService != null && !mExecutorService.isShutdown()) {
      mExecutorService.shutdown();
      mExecutorService = null;
    }
  }

  public void handleRequestCookie(String url, HippyArray requestCookies, HippyHttpRequest httpRequest) {
    NetworkModule.saveCookie2Manager(url, requestCookies);
    String cookie = NetworkModule.getCookieManager().getCookie(url);
    if (!TextUtils.isEmpty(cookie)) {
      httpRequest.addHeader(HttpHeader.REQ.COOKIE, cookie);
    }
  }
}
