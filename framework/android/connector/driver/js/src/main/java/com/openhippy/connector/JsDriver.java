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

package com.openhippy.connector;

import android.content.res.AssetManager;
import java.nio.ByteBuffer;

@SuppressWarnings("JavaJniMissingFunction")
public class JsDriver {

    public static class V8InitParams {
        public long initialHeapSize;
        public long maximumHeapSize;
    }

    public native long initJSFramework(byte[] globalConfig, boolean useLowMemoryMode,
            boolean enableV8Serialization, boolean isDevModule, NativeCallback callback,
            long groupId, int workerManagerId, int domManagerId,
            V8InitParams v8InitParams, String dataDir, String wsUrl);

    public native boolean runScriptFromUri(String uri, AssetManager assetManager,
            boolean canUseCodeCache, String codeCacheDir, long V8RuntimeId, int vfsId,
            NativeCallback callback);

    public native void destroy(long runtimeId, boolean useLowMemoryMode, boolean isReload, NativeCallback callback);

    public native void callFunction(String action, long V8RuntimeId, NativeCallback callback,
            ByteBuffer buffer, int offset, int length);

    public native void callFunction(String action, long V8RuntimeId, NativeCallback callback,
            byte[] buffer, int offset, int length);

    public native void destroyInstance(long V8RuntimeId, byte[] buffer, int offset, int length);

    public native void loadInstance(long V8RuntimeId, byte[] buffer, int offset, int length);

    public native void onResourceReady(ByteBuffer output, long runtimeId, long resId);

}
