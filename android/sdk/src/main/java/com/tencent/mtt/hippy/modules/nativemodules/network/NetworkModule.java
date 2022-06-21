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

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.annotation.HippyMethod;
import com.tencent.mtt.hippy.annotation.HippyNativeModule;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase;

@SuppressWarnings({"deprecation", "unused"})
@HippyNativeModule(name = "network")
public class NetworkModule extends HippyNativeModuleBase {

    private static final String TAG = "NetworkModule";

    public NetworkModule(HippyEngineContext context) {
        super(context);
    }

    @HippyMethod(name = "fetch")
    public void fetch(final HippyMap request, final Promise promise) {
        HippyHttpAdapter adapter = mContext.getGlobalConfigs().getHttpAdapter();
        if (adapter != null) {
            adapter.fetch(request, promise, mContext.getNativeParams());
        }
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
