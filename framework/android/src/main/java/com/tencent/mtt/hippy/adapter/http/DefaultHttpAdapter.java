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

import static com.tencent.mtt.hippy.adapter.http.HippyHttpRequest.HTTP_HEADERS_SEPARATOR;
import static com.tencent.mtt.hippy.adapter.http.HippyHttpResponse.HTTP_RESPONSE_RESPONSE_MESSAGE;
import static com.tencent.mtt.hippy.adapter.http.HippyHttpResponse.HTTP_RESPONSE_STATUS_CODE;

import android.text.TextUtils;

import android.webkit.CookieManager;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.HippyResourceLoader.FetchResultCode;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager.ProcessorCallback;
import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.zip.GZIPInputStream;

public class DefaultHttpAdapter implements HippyHttpAdapter {

    private static final String TAG = "DefaultHttpAdapter";
    private ExecutorService mExecutorService;

    protected void execute(Runnable runnable) {
        if (mExecutorService == null) {
            mExecutorService = Executors.newFixedThreadPool(4);
        }
        mExecutorService.execute(runnable);
    }

    public void fetch(@NonNull final ResourceDataHolder holder,
            @Nullable HashMap<String, Object> nativeParams,
            @NonNull final ProcessorCallback callback) {
        holder.processorTag = DefaultHttpAdapter.class.getName();
        final HippyHttpRequest httpRequest = generateHttpRequest(holder, nativeParams);
        handleRequestCookie(httpRequest);
        sendRequest(httpRequest, new HttpTaskCallbackImpl(holder, callback));
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

    private void handleRedirectRequest(@NonNull final HippyHttpRequest request,
            @NonNull final HttpTaskCallback callback, @NonNull HttpURLConnection connection) {
        String location = connection.getHeaderField("Location");
        if (TextUtils.isEmpty(location)) {
            callback.onTaskFailed(request, new IllegalStateException (
                    "Redirect location field is empty!"));
        } else if (request.getAndIncrementRedirectTimes() > 2) {
            callback.onTaskFailed(request, new IllegalStateException (
                    "Redirect more than 3 times!"));
        } else {
            request.setUrl(location);
            sendRequest(request, callback);
        }
    }

    @Override
    public void sendRequest(@NonNull final HippyHttpRequest request,
            @NonNull final HttpTaskCallback callback) {
        execute(new Runnable() {
            @Override
            public void run() {
                HippyHttpResponse response = null;
                HttpURLConnection connection = null;
                try {
                    connection = createConnection(request);
                    fillHeader(connection, request);
                    fillPostBody(connection, request);
                    if (connection.getResponseCode() == 302) {
                        handleRedirectRequest(request, callback, connection);
                    } else {
                        response = createResponse(connection);
                        callback.onTaskSuccess(request, response);
                    }
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
        response.setStatusCode(urlConnection.getResponseCode());
        response.setRspHeaderMap(urlConnection.getHeaderFields());
        boolean isException = false;
        InputStream inputStream = null;
        InputStream errorStream = null;
        try {
            inputStream = urlConnection.getInputStream();
        } catch (IOException e) {
            e.printStackTrace();
            isException = true;
        }
        if (isException || urlConnection.getResponseCode() >= 400) {
            errorStream = urlConnection.getErrorStream();
        }
        response.setInputStream(inputStream);
        response.setErrorStream(errorStream);
        try {
            response.setResponseMessage(urlConnection.getResponseMessage());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return response;
    }

    protected HttpURLConnection createConnection(HippyHttpRequest request) throws IOException {
        URL url = toURL(request.getUrl());
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        String method = request.getMethod();
        connection.setRequestMethod(method);
        connection.setUseCaches(request.isUseCaches());
        connection.setInstanceFollowRedirects(request.isInstanceFollowRedirects());
        connection.setConnectTimeout(request.getConnectTimeout());
        connection.setReadTimeout(request.getReadTimeout());
        if (method.equalsIgnoreCase("POST")
                || method.equalsIgnoreCase("PUT")
                || method.equalsIgnoreCase("PATCH")) {
            connection.setDoOutput(true);
        }
        return connection;
    }

    protected void fillHeader(URLConnection urlConnection, HippyHttpRequest request) {
        HashMap<String, String> headerMap = request.getHeaders();
        if (headerMap.isEmpty()) {
            return;
        }
        Set<Entry<String, String>> entrySet = headerMap.entrySet();
        for (Entry<String, String> entry : entrySet) {
            String key = entry.getKey();
            String property = entry.getValue();
            if (key == null || TextUtils.isEmpty(property)) {
                continue;
            }
            urlConnection.setRequestProperty(key, property);
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

    public void destroyIfNeed() {
        if (mExecutorService != null && !mExecutorService.isShutdown()) {
            mExecutorService.shutdown();
            mExecutorService = null;
        }
    }

    protected void handleRequestCookie(HippyHttpRequest httpRequest) {
        String url = httpRequest.getUrl();
        if (url != null) {
            String cookies = httpRequest.getRequestCookies();
            saveCookie2Manager(url, cookies, null);
            CookieManager cookieManager = getCookieManager();
            if (cookieManager != null) {
                String cookie = cookieManager.getCookie(url);
                if (!TextUtils.isEmpty(cookie)) {
                    httpRequest.addHeader(HttpHeader.REQ.COOKIE, cookie);
                }
            }
        }
    }

    @NonNull
    protected HippyHttpRequest generateHttpRequest(@NonNull final ResourceDataHolder holder,
            @Nullable HashMap<String, Object> nativeParams) {
        HippyHttpRequest httpRequest = new HippyHttpRequest(holder.requestHeaders,
                holder.requestParams, nativeParams);
        httpRequest.setUrl(holder.uri);
        httpRequest.setConnectTimeout(10 * 1000);
        httpRequest.setReadTimeout(16 * 1000);
        httpRequest.setUseCaches(false);
        return httpRequest;
    }

    protected void saveCookie2Manager(String url, @NonNull List<String> cookies) {
        for (int i = 0; i < cookies.size(); i++) {
            String cookie = cookies.get(i);
            saveCookie2Manager(url, cookie, null);
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
        cookieManager.flush();
    }

    protected void saveCookie2Manager(@NonNull String url, @Nullable String cookies,
            @Nullable String expires) {
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
        cookieManager.flush();
    }

    @Nullable
    protected CookieManager getCookieManager() {
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

        @NonNull
        private final ProcessorCallback mCallback;
        @NonNull
        private final ResourceDataHolder mDataHolder;

        public HttpTaskCallbackImpl(@NonNull ResourceDataHolder holder,
                @NonNull ProcessorCallback callback) {
            mCallback = callback;
            mDataHolder = holder;
        }

        @Override
        public void onTaskSuccess(HippyHttpRequest request, HippyHttpResponse response)
                throws Exception {
            mDataHolder.resultCode = FetchResultCode.OK.ordinal();
            mDataHolder.addResponseHeaderProperty(HTTP_RESPONSE_STATUS_CODE,
                    response.getStatusCode().toString());
            mDataHolder.addResponseHeaderProperty(HTTP_RESPONSE_RESPONSE_MESSAGE,
                    response.getResponseMessage());
            InputStream inputStream = response.getInputStream();
            if (response.getStatusCode() != 200 || inputStream == null) {
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
                    mDataHolder.errorMessage = sb.toString();
                }
                mCallback.onHandleCompleted();
                return;
            }
            try {
                if (isGzipRequest(request)) {
                    inputStream = new GZIPInputStream(inputStream);
                }
                mDataHolder.readResourceDataFromStream(inputStream);
            } catch (IOException e) {
                mDataHolder.errorMessage = e.getMessage();
                mCallback.onHandleCompleted();
                return;
            }
            Map<String, List<String>> headers = response.getRspHeaderMaps();
            if (headers != null && !headers.isEmpty()) {
                boolean hasCookie = false;
                CookieManager cookieManager = getCookieManager();
                for (Map.Entry<String, List<String>> entry : headers.entrySet()) {
                    String key = entry.getKey();
                    List<String> list = entry.getValue();
                    if (list != null && !list.isEmpty()) {
                        if (HttpHeader.RSP.SET_COOKIE.equalsIgnoreCase(key)
                                && cookieManager != null) {
                            hasCookie = true;
                            for (int i = 0; i < list.size(); i++) {
                                cookieManager.setCookie(request.getUrl(), list.get(i));
                            }
                        }
                        if (list.size() == 1) {
                            mDataHolder.addResponseHeaderProperty(key, list.get(0));
                        } else if (list.size() > 1) {
                            mDataHolder.addResponseHeaderProperty(key,
                                    String.join(HTTP_HEADERS_SEPARATOR, list));
                        }
                    }
                }
                if (hasCookie) {
                    cookieManager.flush();
                }
            }
            mCallback.onHandleCompleted();
        }

        @Override
        public void onTaskFailed(HippyHttpRequest request, Throwable error) {
            mDataHolder.resultCode = FetchResultCode.ERR_REMOTE_REQUEST_FAILED.ordinal();
            if (error != null) {
                mDataHolder.errorMessage = error.getMessage();
            }
            mCallback.onHandleCompleted();
        }
    }

    private boolean isGzipRequest(@NonNull HippyHttpRequest request) {
        HashMap<String, String> headers = request.getHeaders();
        for (Map.Entry<String, String> header : headers.entrySet()) {
            String key = header.getKey();
            if (key != null && key.equalsIgnoreCase(HttpHeader.REQ.ACCEPT_ENCODING)) {
                String value = header.getValue();
                if (TextUtils.isEmpty(value)) {
                    return false;
                }
                String[] encodings = value.split(HTTP_HEADERS_SEPARATOR);
                for (String valueItem : encodings) {
                    if (valueItem.equalsIgnoreCase("gzip") || valueItem.equalsIgnoreCase(
                            "deflate")) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private URL toURL(String url) throws MalformedURLException {
        URL _URL = new URL(url);
        if (_URL.getPath() == null || "".equals(_URL.getPath())) {
            if (_URL.getFile() != null && _URL.getFile().startsWith("?")) {
                // 补斜杠符号
                int idx = url.indexOf('?');
                if (idx != -1) {
                    String sb = url.substring(0, idx)
                            + '/'
                            + url.substring(idx);
                    _URL = new URL(sb);
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
