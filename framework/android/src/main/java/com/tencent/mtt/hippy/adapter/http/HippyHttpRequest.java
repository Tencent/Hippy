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
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class HippyHttpRequest {

    public static final int DEFAULT_TIMEOUT_MS = 3000;
    public static final String HTTP_HEADERS = "headers";
    public static final String HTTP_HEADERS_SEPARATOR = ",";
    public static final String HTTP_URL = "url";
    public static final String HTTP_METHOD = "method";
    public static final String HTTP_REDIRECT = "redirect";
    public static final String HTTP_BODY = "body";

    private static String USER_AGENT = null;
    private int mConnectTimeout = DEFAULT_TIMEOUT_MS;
    private int mReadTimeout = DEFAULT_TIMEOUT_MS;
    private boolean mUseCaches = true;
    @Nullable
    private AtomicInteger mRedirectTimes;
    @Nullable
    private String mUrl;
    @NonNull
    private final HashMap<String, String> mHeaders;
    @Nullable
    private final HashMap<String, String> mInitParams;
    @Nullable
    private final Map<String, Object> mNativeParams;

    public HippyHttpRequest(@Nullable HashMap<String, String> headers,
            @Nullable HashMap<String, String> initParams,
            @Nullable Map<String, Object> nativeParams) {
        mHeaders = (headers == null) ? new HashMap<>() : headers;
        mInitParams = initParams;
        mNativeParams = nativeParams;
        initUserAgent();
    }

    @Nullable
    public String getRequestCookies() {
        return mHeaders.get(HttpHeader.REQ.COOKIE);
    }

    @Nullable
    public Map<String, Object> getNativeParams() {
        return mNativeParams;
    }

    public void setUrl(String url) {
        mUrl = url;
    }

    @Nullable
    public String getUrl() {
        if (mUrl != null) {
            return mUrl;
        }
        return (mInitParams != null) ? mInitParams.get(HTTP_URL) : null;
    }

    public void addHeader(String name, String value) {
        mHeaders.put(name, value);
    }

    public int getAndIncrementRedirectTimes() {
        if (mRedirectTimes == null) {
            mRedirectTimes = new AtomicInteger();
        }
        return mRedirectTimes.getAndIncrement();
    }

    @NonNull
    public HashMap<String, String> getHeaders() {
        return mHeaders;
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

    @NonNull
    public String getMethod() {
        if (mInitParams != null) {
            String method = mInitParams.get(HTTP_METHOD);
            if (!TextUtils.isEmpty(method)) {
                return method;
            }
        }
        return "GET";
    }

    public boolean isInstanceFollowRedirects() {
        String redirect = (mInitParams != null) ? mInitParams.get(HTTP_REDIRECT) : null;
        return !TextUtils.isEmpty(redirect) && TextUtils.equals("follow", redirect);
    }

    @Nullable
    public String getBody() {
        return (mInitParams != null) ? mInitParams.get(HTTP_BODY) : null;
    }

    private void initUserAgent() {
        if (USER_AGENT == null) {
            Locale locale = Locale.getDefault();
            StringBuilder buffer = new StringBuilder();
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
        addHeader(HttpHeader.REQ.USER_AGENT, USER_AGENT);
    }
}
