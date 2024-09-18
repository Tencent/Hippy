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

import static com.tencent.mtt.hippy.adapter.http.HippyHttpRequest.HTTP_HEADERS;
import static com.tencent.mtt.hippy.adapter.http.HippyHttpRequest.HTTP_HEADERS_SEPARATOR;
import static com.tencent.mtt.hippy.adapter.http.HippyHttpRequest.HTTP_URL;
import static com.tencent.mtt.hippy.adapter.http.HippyHttpResponse.HTTP_RESPONSE_RESPONSE_MESSAGE;
import static com.tencent.mtt.hippy.adapter.http.HippyHttpResponse.HTTP_RESPONSE_STATUS_CODE;

import android.text.TextUtils;
import androidx.annotation.NonNull;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager;
import com.tencent.vfs.VfsManager.FetchResourceCallback;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;

@HippyNativeModule(name = "network")
public class NetworkModule extends HippyNativeModuleBase {

    private static final String TAG = "NetworkModule";
    private static final String HTTP_RESPONSE_REQUEST_DURATION = "Hippy-Request-Duration";

    public NetworkModule(HippyEngineContext context) {
        super(context);
    }

    @SuppressWarnings("deprecation")
    protected void normalizeRequestHeaders(@NonNull HippyMap headers,
            @NonNull HashMap<String, String> requestHeaders) {
        Set<Entry<String, Object>> entrySet = headers.entrySet();
        for (Entry<String, Object> entry : entrySet) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (key == null || value == null) {
                continue;
            }
            if (value instanceof String) {
                requestHeaders.put(key, value.toString());
            } else if (value instanceof HippyArray) {
                HippyArray header = (HippyArray) value;
                if (header.size() == 1) {
                    requestHeaders.put(key, header.get(0).toString());
                } else if (header.size() > 1) {
                    List<Object> listObject = header.getInternalArray();
                    List<String> listString = new ArrayList<>();
                    for (Object obj : listObject) {
                        listString.add(obj.toString());
                    }
                    requestHeaders.put(key, String.join(HTTP_HEADERS_SEPARATOR, listString));
                }
            }
        }
    }

    @SuppressWarnings("deprecation")
    protected void normalizeRequest(@NonNull HippyMap request,
            @NonNull HashMap<String, String> requestHeaders,
            @NonNull HashMap<String, String> requestParams) throws IllegalStateException {
        Set<Entry<String, Object>> entrySet = request.entrySet();
        if (entrySet == null) {
            throw new IllegalStateException("Init request is empty!");
        }
        for (Entry<String, Object> entry : entrySet) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (key == null || value == null) {
                continue;
            }
            if (key.equals(HTTP_HEADERS) && value instanceof HippyMap) {
                normalizeRequestHeaders((HippyMap) value, requestHeaders);
                continue;
            }
            requestParams.put(key, value.toString());
        }
    }

    @NonNull
    protected JSObject handleFetchResponse(@NonNull ResourceDataHolder dataHolder,
                                           double requestDuration)
        throws IllegalStateException {
        JSObject responseObject = new JSObject();
        int statusCode = -1;
        String responseMessage = null;
        JSObject headerObject = new JSObject();
        if (dataHolder.responseHeaders != null) {
            try {
                statusCode = Integer.parseInt(
                        dataHolder.responseHeaders.get(HTTP_RESPONSE_STATUS_CODE));
            } catch (NumberFormatException e) {
                throw new IllegalStateException("parse status code error!");
            }
            responseMessage = dataHolder.responseHeaders.get(HTTP_RESPONSE_RESPONSE_MESSAGE);
            for (Entry<String, String> entry : dataHolder.responseHeaders.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                if (key == null || value == null) {
                    continue;
                }
                headerObject.set(key, value);
            }
        }
        if (responseMessage == null) {
            responseMessage = (dataHolder.errorMessage == null) ? "" : dataHolder.errorMessage;
        }
        headerObject.set(HTTP_RESPONSE_REQUEST_DURATION, Double.toString(requestDuration));
        responseObject.set(HTTP_RESPONSE_STATUS_CODE, statusCode);
        responseObject.set("statusLine", responseMessage);
        responseObject.set("respHeaders", headerObject);
        String body = "";
        try {
            byte[] bytes = dataHolder.getBytes();
            if (bytes != null) {
                body = new String(bytes, StandardCharsets.UTF_8);
            }
        } catch (Exception e) {
            throw new IllegalStateException(e.getMessage());
        }
        responseObject.set("respBody", body);
        return responseObject;
    }

    protected void handleFetchResult(@NonNull ResourceDataHolder dataHolder,
                                     double requestDuration,
                                     final Promise promise) {
        try {
            if (dataHolder.resultCode == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE) {
                JSObject responseObject = handleFetchResponse(dataHolder, requestDuration);
                promise.resolve(responseObject);
            } else {
                String errorMessage =
                        (dataHolder.errorMessage == null) ? "Load remote resource failed!" : dataHolder.errorMessage;
                promise.reject(errorMessage);
            }
        } catch (IllegalStateException e) {
            promise.reject("Handle response failed: " + e.getMessage());
        }
    }

    @SuppressWarnings("deprecation")
    @HippyMethod(name = "fetch")
    public void fetch(final HippyMap request, final Promise promise) {
        VfsManager vfsManager = mContext.getVfsManager();
        HashMap<String, String> requestHeaders = new HashMap<>();
        HashMap<String, String> requestParams = new HashMap<>();
        try {
            normalizeRequest(request, requestHeaders, requestParams);
        } catch (Exception e) {
            promise.reject(e.getMessage());
            return;
        }
        final String uri = requestParams.get(HTTP_URL);
        if (TextUtils.isEmpty(uri)) {
            promise.reject("Get url parameter failed!");
            return;
        }

        // Record request start time
        final long startTime = System.nanoTime();

        vfsManager.fetchResourceAsync(uri, requestHeaders, requestParams,
            new FetchResourceCallback() {
                @Override
                public void onFetchCompleted(@NonNull ResourceDataHolder dataHolder) {
                    // Time taken for the request, in milliseconds
                    double requestDuration = (System.nanoTime() - startTime) / 1_000_000.0;
                    handleFetchResult(dataHolder, requestDuration, promise);
                    dataHolder.recycle();
                }

                @Override
                public void onFetchProgress(long total, long loaded) {
                    // Nothing need to do here.
                }
            });
    }

    @HippyMethod(name = "getCookie")
    public void getCookie(String url, Promise promise) {
        HippyHttpAdapter adapter = mContext.getGlobalConfigs().getHttpAdapter();
        if (adapter != null) {
            adapter.getCookie(url, promise);
        }
    }

    @HippyMethod(name = "setCookie")
    public void setCookie(String url, String keyValue, String expires) {
        HippyHttpAdapter adapter = mContext.getGlobalConfigs().getHttpAdapter();
        if (adapter != null) {
            adapter.setCookie(url, keyValue, expires);
        }
    }
}
