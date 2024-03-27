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
import android.view.View;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import java.lang.ref.WeakReference;
import java.nio.ByteBuffer;

@SuppressWarnings("JavaJniMissingFunction")
public class JsDriver implements Connector {

    private int mInstanceId = -1;
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
        return mInstanceId;
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

    public void recordNativeInitEndTime(long startTime, long endTime) {
        onNativeInitEnd(mInstanceId, startTime, endTime);
    }

    public void recordFirstPaintEndTime(long time) {
        onFirstPaintEnd(mInstanceId, time);
    }

    public void recordFirstContentfulPaintEndTime(long time) {
        onFirstContentfulPaintEnd(mInstanceId, time);
    }

    public void doRecordResourceLoadResult(@NonNull String uri, long startTime, long endTime,
            long retCode, @Nullable String errorMsg) {
        onResourceLoadEnd(mInstanceId, uri, startTime, endTime, retCode, errorMsg);
    }

    public void onResourceReady(ByteBuffer output, long resId) {
        onResourceReady(mInstanceId, output, resId);
    }

    public void initialize(byte[] globalConfig, boolean useLowMemoryMode,
            boolean enableV8Serialization, boolean isDevModule, NativeCallback callback,
            long groupId, int domManagerId, V8InitParams v8InitParams, int vfsId, int devtoolsId) {
        mInstanceId = onCreate(globalConfig, useLowMemoryMode, enableV8Serialization,
                isDevModule, callback, groupId, domManagerId, v8InitParams, vfsId, devtoolsId);
    }

    public void onDestroy(boolean useLowMemoryMode, boolean isReload,
            NativeCallback callback) {
        onDestroy(mInstanceId, useLowMemoryMode, isReload, callback);
    }

    public void callFunction(String action, NativeCallback callback,
            ByteBuffer buffer, int offset, int length) {
        callFunction(mInstanceId, action, callback, buffer, offset, length);
    }

    public void callFunction(String action, NativeCallback callback,
            byte[] buffer, int offset, int length) {
        callFunction(mInstanceId, action, callback, buffer, offset, length);
    }

    public boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache,
            String codeCacheDir, int vfsId, NativeCallback callback) {
        return runScriptFromUri(mInstanceId, uri, assetManager, canUseCodeCache, codeCacheDir,
                vfsId,
                callback);
    }

    public void loadInstance(byte[] buffer, int offset, int length, NativeCallback callback) {
        loadInstance(mInstanceId, buffer, offset, length, callback);
    }

    public void unloadInstance(byte[] buffer, int offset, int length) {
        unloadInstance(mInstanceId, buffer, offset, length);
    }

    public void attachToDom(@NonNull Connector domConnector) {
        attachToDom(mInstanceId, domConnector.getInstanceId());
    }

    public void attachToRoot(@NonNull View root) {
        attachToRoot(mInstanceId, root.getId());
    }

    /**
     * Will call native jni to connect driver runtime with root node.
     *
     * @param instanceId driver runtime id
     * @param rootId root node id
     */
    private native void attachToRoot(int instanceId, int rootId);

    private native void attachToDom(int instanceId, int domId);

    private native int onCreate(byte[] globalConfig, boolean useLowMemoryMode,
            boolean enableV8Serialization, boolean isDevModule, NativeCallback callback,
            long groupId, int domManagerId, V8InitParams v8InitParams, int vfs_id, int devtoolsId);

    private native void onDestroy(int instanceId, boolean useLowMemoryMode, boolean isReload,
            NativeCallback callback);

    private native void loadInstance(int instanceId, byte[] buffer, int offset, int length,
            NativeCallback callback);

    private native void unloadInstance(int instanceId, byte[] buffer, int offset, int length);

    private native boolean runScriptFromUri(int instanceId, String uri, AssetManager assetManager,
            boolean canUseCodeCache, String codeCacheDir, int vfsId, NativeCallback callback);

    private native void callFunction(int instanceId, String action, NativeCallback callback,
            ByteBuffer buffer, int offset, int length);

    private native void callFunction(int instanceId, String action, NativeCallback callback,
            byte[] buffer, int offset, int length);

    private native void onResourceReady(int instanceId, ByteBuffer output, long resId);

    private native void onNativeInitEnd(int instanceId, long startTime, long endTime);

    private native void onFirstPaintEnd(int instanceId, long time);

    private native void onFirstContentfulPaintEnd(int instanceId, long time);

    private native void onResourceLoadEnd(int instanceId, String uri, long startTime, long endTime,
            long retCode, String errorMsg);
}
