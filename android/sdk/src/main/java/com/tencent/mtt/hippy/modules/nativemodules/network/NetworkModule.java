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
package com.tencent.mtt.hippy.modules.nativemodules.network;

import android.os.Build;
import android.text.TextUtils;
import android.webkit.CookieManager;
import android.webkit.CookieSyncManager;

import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyGlobalConfigs;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpRequest;
import com.tencent.mtt.hippy.adapter.http.HippyHttpResponse;
import com.tencent.mtt.hippy.adapter.http.HttpHeader;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.zip.GZIPInputStream;

@SuppressWarnings({"deprecation", "unused"})
@HippyNativeModule(name = "network")
public class NetworkModule extends HippyNativeModuleBase {

    private static final String TAG = "NetworkModule";
    private static CookieSyncManager mCookieSyncManager;

    public NetworkModule(HippyEngineContext context) {
        super(context);
    }

    private void hippyMapToRequestHeaders(HippyHttpRequest request, HippyMap map) {
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

    @HippyMethod(name = "fetch")
    public void fetch(final HippyMap request, final Promise promise) {
        if (request == null) {
            promise.reject("invalid request param");
            return;
        }

        String url = request.getString("url");
        final String method = request.getString("method");
        if (TextUtils.isEmpty(url) || TextUtils.isEmpty(method)) {
            promise.reject("no valid url for request");
            return;
        }

        HippyHttpRequest httpRequest = new HippyHttpRequest();
        httpRequest.setConnectTimeout(10 * 1000);
        httpRequest.setReadTimeout(10 * 1000);
        String redirect = request.getString("redirect");
        httpRequest.setInstanceFollowRedirects(
                !TextUtils.isEmpty(redirect) && TextUtils.equals("follow", redirect));
        httpRequest.setUseCaches(false);
        httpRequest.setMethod(method);
        httpRequest.setUrl(url);
        HippyMap headers = request.getMap("headers");
        HippyArray requestCookies = null;
        if (headers != null) {
            requestCookies = headers.getArray("Cookie");
            hippyMapToRequestHeaders(httpRequest, headers);
        }
        String body = request.getString("body");
        httpRequest.setBody(body);
        httpRequest.setNativeParams(mContext.getNativeParams());
        HippyGlobalConfigs configs = mContext.getGlobalConfigs();
        HippyHttpAdapter adapter;
        if (configs != null && configs.getHttpAdapter() != null) {
            adapter = configs.getHttpAdapter();
            adapter.handleRequestCookie(url, requestCookies, httpRequest);
            adapter.sendRequest(httpRequest, new HttpTaskCallbackImpl(promise));
        }
    }

    @HippyMethod(name = "getCookie")
    public void getCookie(String url, Promise promise) {
        CookieManager cookieManager = getCookieManager();
        if (cookieManager == null) {
            promise.reject("get cookie manager failed!");
            return;
        }
        String cookie = cookieManager.getCookie(url);
        promise.resolve(cookie);
    }

    @HippyMethod(name = "setCookie")
    public void setCookie(String url, String keyValue, String expires) {
        CookieManager cookieManager = getCookieManager();
        if (cookieManager == null) {
            return;
        }
        if (!TextUtils.isEmpty(url) && !TextUtils.isEmpty(keyValue)) {
            if (!TextUtils.isEmpty(expires)) {
                keyValue = keyValue + ";expires=" + expires;
                cookieManager.setCookie(url, keyValue);
                syncCookie();
            } else {
                saveCookie2Manager(url, keyValue);
            }
        }
    }

    public static void saveCookie2Manager(String url, HippyArray cookies) {
        if (cookies != null) {
            for (int i = 0; i < cookies.size(); i++) {
                String cookieStr = (String) cookies.get(i);
                saveCookie2Manager(url, cookieStr);
            }
        }
    }

    public static void saveCookie2Manager(String url, String cookies) {
        CookieManager cookieManager = getCookieManager();
        if (cookieManager == null) {
            return;
        }
        if (cookies != null) {
            cookies = cookies.replaceAll("\\s+", "");
            String[] cookieItems = cookies.split(";");
            for (String cookie : cookieItems) {
                cookieManager.setCookie(url, cookie);
            }
            syncCookie();
        }
    }

    @Nullable
    public static CookieManager getCookieManager() {
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

    private static void syncCookie() {
        if (getCookieManager() != null) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                getCookieManager().flush();
            } else if (mCookieSyncManager != null) {
                mCookieSyncManager.sync();
            }
        }
    }

    private static class HttpTaskCallbackImpl implements HippyHttpAdapter.HttpTaskCallback {

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

    // 检查是否是gzip/deflate压缩的请求
    private static boolean isGzipRequest(HippyHttpRequest request) {
        if (request == null) {
            return false;
        }
        Map<String, Object> headers = request.getHeaders();
        if (headers != null) {
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
        }
        return false;
    }
}
