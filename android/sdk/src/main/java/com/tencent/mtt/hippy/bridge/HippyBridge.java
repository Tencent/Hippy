/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018-2022 THL A29 Limited, a Tencent company. All rights reserved.
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

package com.tencent.mtt.hippy.bridge;

import android.content.res.AssetManager;

import androidx.annotation.NonNull;

import com.tencent.mtt.hippy.common.Callback;

import java.nio.ByteBuffer;

public interface HippyBridge {

    String URI_SCHEME_ASSETS = "asset:";
    String URI_SCHEME_FILE = "file:";

    void initJSBridge(String globalConfig, NativeCallback callback, int groupId);

    void runScript(@NonNull String script);

    void runInJsThread(Callback<Void> callback);

    boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache,
            String codeCacheTag, NativeCallback callback);

    void onDestroy(boolean isReload);

    void destroy(NativeCallback callback, boolean isReload);

    void callFunction(String action, NativeCallback callback, ByteBuffer buffer);

    void callFunction(String action, NativeCallback callback, byte[] buffer);

    void callFunction(String action, NativeCallback callback, byte[] buffer, int offset,
            int length);

    long getV8RuntimeId();

    interface BridgeCallback {

        void callNatives(String moduleName, String moduleFunc, String callId, Object params);

        void reportException(String message, String stackTrace);

        void reportException(Throwable e);
    }
    public void connectDebugUrl(String wsDebugUrl);
}
