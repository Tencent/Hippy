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
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.lang.ref.WeakReference;
import java.nio.ByteBuffer;

@SuppressWarnings("JavaJniMissingFunction")
public class JsDriver implements Connector {

    private int mRuntimeId;
    @Nullable
    private WeakReference<JSBridgeProxy> mBridgeProxy;

    public static class V8InitParams {

        public long initialHeapSize;
        public long maximumHeapSize;
    }

    public void setBridgeProxy(@NonNull JSBridgeProxy bridgeProxy) {
        mBridgeProxy = new WeakReference<>(bridgeProxy);
    }

    @Override
    public void destroy() {

    }

    @Override
    public int getInstanceId() {
        return mRuntimeId;
    }

    public void setInstanceId(int runtimeId) {
        mRuntimeId = runtimeId;
    }

    public void attachToDom(@NonNull Connector domConnector) {
        onAttachToDom(domConnector.getInstanceId());
    }

    public void attachToRoot(int rootId) {
        onAttachToRoot(mRuntimeId, rootId);
    }

    public void callNatives(String moduleName, String moduleFunc, String callId, byte[] buffer) {
        if (mBridgeProxy != null && mBridgeProxy.get() != null) {
            mBridgeProxy.get().callNatives(moduleName, moduleFunc, callId, buffer);
        }
    }

    public void callNatives(String moduleName, String moduleFunc, String callId,
            ByteBuffer buffer) {
        if (mBridgeProxy != null && mBridgeProxy.get() != null) {
            mBridgeProxy.get().callNatives(moduleName, moduleFunc, callId, buffer);
        }
    }

    /**
     * Will call native jni to connect driver runtime with root node.
     *
     * @param runtimeId driver runtime id
     * @param rootId root node id
     */
    private native void onAttachToRoot(int runtimeId, int rootId);

    private native void onAttachToDom(int domId);

    public native long initJSFramework(byte[] globalConfig, boolean useLowMemoryMode,
            boolean enableV8Serialization, boolean isDevModule, NativeCallback callback,
            long groupId, int domManagerId, V8InitParams v8InitParams, String dataDir, String wsUrl);

    public native boolean runScriptFromUri(String uri, AssetManager assetManager,
            boolean canUseCodeCache, String codeCacheDir, long V8RuntimeId, int vfsId,
            NativeCallback callback);

    public native void destroy(long runtimeId, boolean useLowMemoryMode, boolean isReload,
            NativeCallback callback);

    public native void callFunction(String action, long V8RuntimeId, NativeCallback callback,
            ByteBuffer buffer, int offset, int length);

    public native void callFunction(String action, long V8RuntimeId, NativeCallback callback,
            byte[] buffer, int offset, int length);

    public native void destroyInstance(long V8RuntimeId, byte[] buffer, int offset, int length);

    public native void loadInstance(long V8RuntimeId, byte[] buffer, int offset, int length);

    public native void onResourceReady(ByteBuffer output, long runtimeId, long resId);

}
