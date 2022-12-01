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

    private int mJsDriverId;
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
        return mJsDriverId;
    }

    public void setInstanceId(int runtimeId) {
        mJsDriverId = runtimeId;
    }

    public void attachToDom(@NonNull Connector domConnector) {
        onAttachToDom(mJsDriverId, domConnector.getInstanceId());
    }

    public void attachToRoot(int rootId) {
        onAttachToRoot(mJsDriverId, rootId);
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

    public void reportException(String message, String stackTrace) {
        if (mBridgeProxy != null && mBridgeProxy.get() != null) {
            mBridgeProxy.get().reportException(message, stackTrace);
        }
    }
    /**
     * Will call native jni to connect driver runtime with root node.
     *
     * @param jsDriverId driver runtime id
     * @param rootId root node id
     */
    private native void onAttachToRoot(int jsDriverId, int rootId);

    private native void onAttachToDom(int jsDriverId, int domId);

    public native int createJsDriver(byte[] globalConfig, boolean useLowMemoryMode,
                                     boolean enableV8Serialization, boolean isDevModule, NativeCallback callback,
                                     long groupId, int domManagerId, V8InitParams v8InitParams, int j_devtools_id);

    public native void destroyJsDriver(int jsDriverId, boolean useLowMemoryMode, boolean isReload,
                                       NativeCallback callback);

    public native void loadInstance(int jsDriverId, byte[] buffer, int offset, int length);

    public native void unloadInstance(int jsDriverId, byte[] buffer, int offset, int length);

    public native boolean runScriptFromUri(int jsDriverId, String uri, AssetManager assetManager,
                                           boolean canUseCodeCache, String codeCacheDir, int vfsId,
                                           NativeCallback callback);

    public native void callFunction(int jsDriverId, String action, NativeCallback callback,
            ByteBuffer buffer, int offset, int length);

    public native void callFunction(int jsDriverId, String action, NativeCallback callback,
            byte[] buffer, int offset, int length);

    public native void onResourceReady(int jsDriverId, ByteBuffer output, long resId);

}
