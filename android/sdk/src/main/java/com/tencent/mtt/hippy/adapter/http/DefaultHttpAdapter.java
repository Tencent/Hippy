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
import android.text.TextUtils;

import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.GZIPInputStream;

public class DefaultHttpAdapter implements HippyHttpAdapter {

    private static final String TAG = "DefaultHttpAdapter";
    private static CookieSyncManager mCookieSyncManager;
    private ExecutorService mExecutorService;

    protected void execute(Runnable runnable) {
        if (mExecutorService == null) {
            mExecutorService = Executors.newFixedThreadPool(3);
        }
        mExecutorService.execute(runnable);
    }

    @Override
    public void fetch(final HippyMap initParams, final Promise promise, Map nativeParams) {
        final HippyHttpRequest httpRequest = generateHttpRequest(initParams, promise, nativeParams);
        if (httpRequest != null) {
            handleRequestCookie(httpRequest);
            sendRequest(httpRequest, new HttpTaskCallbackImpl(promise));
        }
    }

    @Override
    public void getCookie(String url, Promise promise) {
        CookieManager cookieManager = getCookieManager();
        if (cookieManager == null) {
            promise.reject("get cookie manager failed!");
            return;
        }
        String cookie = cookieManager.getCookie(url);
        promise.resolve(cookie);
    }

    @Override
    public void setCookie(String url, String keyValue, String expires) {
        if (!TextUtils.isEmpty(url) && keyValue != null) {
            if (keyValue.trim().length() == 0) {
                clearCookie(url);
            } else {
                saveCookie2Manager(url, keyValue, expires);
            }
        }
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

    protected HippyHttpResponse createResponse(HttpURLConnection urlConnection) throws Exception {
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

    protected HttpURLConnection createConnection(HippyHttpRequest request) throws Exception {
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

        if (request.getMethod().equalsIgnoreCase("POST") || request.getMethod()
                .equalsIgnoreCase("PUT")
                || request.getMethod().equalsIgnoreCase("PATCH")) {

            connection.setDoOutput(true);
        }

        return connection;
    }

    protected void fillHeader(URLConnection urlConnection, HippyHttpRequest request) {
        Map<String, Object> headerMap = request.getHeaders();
        if (headerMap == null || headerMap.isEmpty()) {
            return;
        }
        Set<String> keySets = headerMap.keySet();
        for (String key : keySets) {
            Object obj = headerMap.get(key);
            if (obj instanceof String) {
                urlConnection.setRequestProperty(key, (String) obj);
            } else if (obj instanceof List) {
                @SuppressWarnings("unchecked") List<String> requestProperties = (List<String>) obj;
                if (requestProperties.isEmpty()) {
                    continue;
                }
                for (String oneReqProp : requestProperties) {
                    if (!TextUtils.isEmpty(oneReqProp)) {
                        urlConnection.addRequestProperty(key, oneReqProp);
                    }
                }
            }
        }
    }

    protected void fillPostBody(HttpURLConnection connection, HippyHttpRequest request)
            throws IOException {
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

    protected void parseResponseHeaders(HttpURLConnection httpConn, HippyHttpResponse response)
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

    protected void handleRequestCookie(HippyHttpRequest httpRequest) {
        String url = httpRequest.getUrl();
        HippyArray requestCookies = httpRequest.getRequestCookies();
        if (url == null || requestCookies == null) {
            return;
        }
        saveCookie2Manager(url, requestCookies);
        CookieManager cookieManager = getCookieManager();
        if (cookieManager != null) {
            String cookie = cookieManager.getCookie(url);
            if (!TextUtils.isEmpty(cookie)) {
                httpRequest.addHeader(HttpHeader.REQ.COOKIE, cookie);
            }
        }
    }

    protected HippyHttpRequest generateHttpRequest(HippyMap initParams, Promise promise,
            @Nullable Map nativeParams) {
        if (initParams == null) {
            promise.reject("invalid request param");
            return null;
        }
        String url = initParams.getString("url");
        final String method = initParams.getString("method");
        if (TextUtils.isEmpty(url) || TextUtils.isEmpty(method)) {
            promise.reject("no valid url for request");
            return null;
        }
        HippyHttpRequest httpRequest = new HippyHttpRequest();
        httpRequest.setConnectTimeout(10 * 1000);
        httpRequest.setReadTimeout(10 * 1000);
        String redirect = initParams.getString("redirect");
        httpRequest.setInstanceFollowRedirects(
                !TextUtils.isEmpty(redirect) && TextUtils.equals("follow", redirect));
        httpRequest.setUseCaches(false);
        httpRequest.setMethod(method);
        httpRequest.setUrl(url);
        HippyMap headers = initParams.getMap("headers");
        if (headers != null) {
            httpRequest.setRequestCookies(headers.getArray("Cookie"));
            hippyMapToRequestHeaders(httpRequest, headers);
        }
        String body = initParams.getString("body");
        httpRequest.setBody(body);
        httpRequest.setNativeParams(nativeParams);
        httpRequest.setInitParams(initParams);
        return httpRequest;
    }

    protected void hippyMapToRequestHeaders(HippyHttpRequest request, HippyMap map) {
        if (request == null || map == null) {
            return;
        }
        Set<String> keys = map.keySet();
        for (String oneKey : keys) {
            Object valueObj = map.get(oneKey);
            if (valueObj instanceof HippyArray) {
                HippyArray oneHeaderArray = (HippyArray) valueObj;
                List<String> headerValueArray = new ArrayList<>();
                for (int i = 0; i < oneHeaderArray.size(); i++) {
                    Object oneHeaderValue = oneHeaderArray.get(i);
                    if (oneHeaderValue instanceof Number) {
                        headerValueArray.add(oneHeaderValue + "");
                    } else if (oneHeaderValue instanceof Boolean) {
                        headerValueArray.add(oneHeaderValue + "");
                    } else if (oneHeaderValue instanceof String) {
                        headerValueArray.add((String) oneHeaderValue);
                    } else {
                        LogUtils.e("hippy_console", "Unsupported Request Header List Type");
                    }
                }

                if (!headerValueArray.isEmpty()) {
                    request.addHeader(oneKey, headerValueArray);
                }
            } else {
                LogUtils.e("hippy_console",
                        "Unsupported Request Header Type, Header Field Should All be an Array!!!");
            }
        }
    }

    protected void saveCookie2Manager(String url, @NonNull HippyArray cookieArr) {
        for (int i = 0; i < cookieArr.size(); i++) {
            String cookies = (String) cookieArr.get(i);
            saveCookie2Manager(url, cookies, null);
        }
    }

    @NonNull
    protected String resetCookieIfNeeded(@NonNull String cookie, @Nullable String expires) {
        String[] kv = cookie.split("=");
        if (kv.length == 1 || (kv.length >= 2 && kv[1].trim().length() == 0)) {
            return kv[0] + "=;Max-Age=0";
        }
        if (!TextUtils.isEmpty(expires)) {
            return cookie + ";expires=" + expires;
        }
        return cookie;
    }

    protected void clearCookie(@NonNull String url) {
        CookieManager cookieManager = getCookieManager();
        if (cookieManager == null) {
            return;
        }
        String cookies = cookieManager.getCookie(url);
        if (TextUtils.isEmpty(cookies)) {
            return;
        }
        String[] cookieItems = cookies.split(";");
        for (String cookie : cookieItems) {
            cookieManager.setCookie(url, (cookie + ";Max-Age=0"));
        }
        syncCookie();
    }

    protected void saveCookie2Manager(@NonNull String url, @Nullable String cookies, @Nullable String expires) {
        CookieManager cookieManager = getCookieManager();
        if (cookieManager == null || cookies == null) {
            return;
        }
        cookies = cookies.replaceAll("\\s+", "");
        String[] cookieItems = cookies.split(";");
        for (String cookie : cookieItems) {
            if (cookie != null && cookie.trim().length() > 0) {
                String newCookie = resetCookieIfNeeded(cookie, expires);
                cookieManager.setCookie(url, newCookie);
            }
        }
        syncCookie();
    }

    protected void syncCookie() {
        if (getCookieManager() != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                getCookieManager().flush();
            } else if (mCookieSyncManager != null) {
                mCookieSyncManager.sync();
            }
        }
    }

    @Nullable
    protected CookieManager getCookieManager() {
        if (mCookieSyncManager == null) {
            mCookieSyncManager = CookieSyncManager.createInstance(ContextHolder.getAppContext());
        }
        CookieManager cookieManager;
        try {
            cookieManager = CookieManager.getInstance();
            if (!cookieManager.acceptCookie()) {
                cookieManager.setAcceptCookie(true);
            }
        } catch (IllegalArgumentException ex) {
            // https://bugs.chromium.org/p/chromium/issues/detail?id=559720
            return null;
        } catch (Exception exception) {
            LogUtils.w(TAG, "getCookieManager: " + exception.getMessage());
            // We cannot catch MissingWebViewPackageException as it is in a private / system API
            // class. This validates the exception's message to ensure we are only handling this
            // specific exception.
            // The exception class doesn't always contain the correct name as it depends on the OEM
            // and OS version. It is better to check the message for clues regarding the exception
            // as that is somewhat consistent across OEMs.
            // https://android.googlesource.com/platform/frameworks/base/+/master/core/java/android/webkit/WebViewFactory.java#348
            return null;
        }
        return cookieManager;
    }

    protected class HttpTaskCallbackImpl implements HippyHttpAdapter.HttpTaskCallback {

        private final Promise mPromise;

        public HttpTaskCallbackImpl(Promise promise) {
            mPromise = promise;
        }

        @SuppressWarnings("CharsetObjectCanBeUsed")
        @Override
        public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response)
                throws Exception {
            String respBody = null;
            if (response.getInputStream() != null) {
                InputStream inputStream = response.getInputStream();
                if (isGzipRequest(request)) {
                    inputStream = new GZIPInputStream(inputStream); // gzip解压
                }
                StringBuilder sb = new StringBuilder();
                String readLine;
                BufferedReader bfReader = new BufferedReader(
                        new InputStreamReader(inputStream, "UTF-8"));
                while ((readLine = bfReader.readLine()) != null) {
                    sb.append(readLine).append("\r\n");
                }
                respBody = sb.toString();
            }

            CookieManager cookieManager = getCookieManager();
            HippyMap respMap = new HippyMap();
            respMap.pushInt("statusCode", response.getStatusCode());
            respMap.pushString("statusLine", response.getResponseMessage());

            HippyMap headerMap = new HippyMap();
            if (response.getRspHeaderMaps() != null && !response.getRspHeaderMaps().isEmpty()) {
                Set<String> keys = response.getRspHeaderMaps().keySet();
                for (String oneKey : keys) {
                    List<String> value = response.getRspHeaderMaps().get(oneKey);
                    HippyArray oneHeaderFiled = new HippyArray();
                    if (value != null && !value.isEmpty()) {
                        boolean hasSetCookie = false;
                        for (int i = 0; i < value.size(); i++) {
                            String valueStr = value.get(i);
                            oneHeaderFiled.pushString(valueStr);
                            if (HttpHeader.RSP.SET_COOKIE.equalsIgnoreCase(oneKey)) {
                                if (cookieManager != null) {
                                    hasSetCookie = true;
                                    cookieManager.setCookie(request.getUrl(), valueStr);
                                }
                            }
                        }
                        if (hasSetCookie) {
                            syncCookie();
                        }
                    }
                    headerMap.pushArray(oneKey, oneHeaderFiled);
                }
            }
            respMap.pushMap("respHeaders", headerMap);
            if (respBody == null) {
                respBody = "";
            }
            respMap.pushString("respBody", respBody);
            mPromise.resolve(respMap);
        }

        @Override
        public void onTaskFailed(HippyHttpRequest request, Throwable error) {
            if (error != null) {
                mPromise.resolve(error.getMessage());
            }
        }
    }

    private boolean isGzipRequest(HippyHttpRequest request) {
        if (request == null) {
            return false;
        }
        Map<String, Object> headers = request.getHeaders();
        if (headers == null) {
            return false;
        }
        for (Map.Entry<String, Object> header : headers.entrySet()) {
            String key = header.getKey();
            if (key != null && key.equalsIgnoreCase(HttpHeader.REQ.ACCEPT_ENCODING)) {
                Object value = header.getValue();
                if (value instanceof ArrayList) {
                    //noinspection unchecked
                    for (String valueItem : (ArrayList<String>) value) {
                        if (valueItem.equalsIgnoreCase("gzip") || valueItem.equalsIgnoreCase(
                                "deflate")) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    private URL toURL(String url) throws MalformedURLException {
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
}
