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

package com.tencent.mtt.hippy.bridge;

import android.os.Handler;
import android.os.Message;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.openhippy.connector.JSBridgeProxy;
import com.openhippy.connector.JsDriver;
import com.openhippy.connector.NativeCallback;
import com.openhippy.connector.JsDriver.V8InitParams;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.utils.UIThreadUtils;

import com.tencent.vfs.ResourceDataHolder;
import com.tencent.vfs.VfsManager.FetchResourceCallback;
import java.io.File;
import java.lang.ref.WeakReference;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

import android.content.Context;
import android.content.res.AssetManager;
import android.text.TextUtils;

import com.tencent.mtt.hippy.devsupport.DebugWebSocketClient;
import com.tencent.mtt.hippy.devsupport.DevRemoteDebugProxy;
import com.tencent.mtt.hippy.utils.FileUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.nio.ByteOrder;

@SuppressWarnings({"unused", "JavaJniMissingFunction"})

public class HippyBridgeImpl implements HippyBridge, JSBridgeProxy, DevRemoteDebugProxy.OnReceiveDataListener {
    private static final String TAG = "HippyBridgeImpl";
    private static final String DEFAULT_LOCAL_HOST = "localhost:38989";
    private static final String DEBUG_WEBSOCKET_URL = "ws://%s/debugger-proxy?role=android_client&clientId=%s";
    private static volatile String mCodeCacheRootDir;
    private BridgeCallback mBridgeCallback;
    private boolean mInit = false;
    private final boolean mIsDevModule;
    private String mDebugServerHost;
    private final boolean mSingleThreadMode;
    private final boolean mEnableV8Serialization;
    private DebugWebSocketClient mDebugWebSocketClient;
    private String mDebugGlobalConfig;
    private HippyEngineContext mContext;
    private final V8InitParams mV8InitParams;
    @NonNull
    private final JsDriver mJsDriver;

    public HippyBridgeImpl(HippyEngineContext engineContext, BridgeCallback callback,
            boolean singleThreadMode, boolean enableV8Serialization, boolean isDevModule,
            String debugServerHost, V8InitParams v8InitParams, @NonNull JsDriver jsDriver) {
        mBridgeCallback = callback;
        mSingleThreadMode = singleThreadMode;
        mEnableV8Serialization = enableV8Serialization;
        mIsDevModule = isDevModule;
        mDebugServerHost = debugServerHost;
        mContext = engineContext;
        mV8InitParams = v8InitParams;
        mJsDriver = jsDriver;
        mJsDriver.setBridgeProxy(this);
        if (mCodeCacheRootDir == null) {
            Context context = mContext.getGlobalConfigs().getContext();
            File hippyFile = FileUtils.getHippyFile(context);
            if (hippyFile != null) {
                mCodeCacheRootDir =
                        hippyFile.getAbsolutePath() + File.separator + "codecache"
                                + File.separator;
            }
        }
    }

    @Override
    public void initJSBridge(String globalConfig, NativeCallback callback, final int groupId) {
        mDebugGlobalConfig = globalConfig;
        initJSEngine(groupId, callback);
    }

    private void initJSEngine(int groupId, NativeCallback callback) {
        synchronized (HippyBridgeImpl.class) {
            try {
                String localCachePath = mContext.getGlobalConfigs().getContext().getCacheDir()
                        .getAbsolutePath();
                byte[] globalConfig = mDebugGlobalConfig.getBytes(StandardCharsets.UTF_16LE);
                mJsDriver.initialize(
                        globalConfig,
                        mSingleThreadMode,
                        mEnableV8Serialization,
                        mIsDevModule,
                        callback,
                        groupId,
                        mContext.getDomManagerId(),
                        mV8InitParams,
                        mContext.getVfsId(),
                        mContext.getDevtoolsId()
                );
                mInit = true;
            } catch (Throwable e) {
                if (mBridgeCallback != null) {
                    mBridgeCallback.reportException(e);
                }
            }
        }
    }

    @Override
    public long getV8RuntimeId() {
        return mJsDriver.getInstanceId();
    }

    @Override
    public boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache,
            String codeCacheTag, NativeCallback callback) {
        if (!mInit) {
            return false;
        }
        if (assetManager == null) {
            assetManager = mContext.getGlobalConfigs().getContext().getAssets();
        }
        String codeCacheDir = "";
        if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir)) {
            codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
            File codeCacheFile = new File(codeCacheDir);
            if (!codeCacheFile.exists() && !codeCacheFile.mkdirs()) {
                canUseCodeCache = false;
                codeCacheDir = "";
            }
        } else {
            canUseCodeCache = false;
        }
        return mJsDriver.runScriptFromUri(uri, assetManager, canUseCodeCache, codeCacheDir,
                mContext.getVfsId(), callback);
    }

    @Nullable
    private String getCallFunctionName(int functionId) {
        String action = null;
        switch (functionId) {
            case HippyBridgeManagerImpl.FUNCTION_ACTION_LOAD_INSTANCE: {
                action = "loadInstance";
                break;
            }
            case HippyBridgeManagerImpl.FUNCTION_ACTION_RESUME_INSTANCE: {
                action = "resumeInstance";
                break;
            }
            case HippyBridgeManagerImpl.FUNCTION_ACTION_PAUSE_INSTANCE: {
                action = "pauseInstance";
                break;
            }
            case HippyBridgeManagerImpl.FUNCTION_ACTION_DESTROY_INSTANCE: {
                action = "destroyInstance";
                break;
            }
            case HippyBridgeManagerImpl.FUNCTION_ACTION_CALLBACK: {
                action = "callBack";
                break;
            }
            case HippyBridgeManagerImpl.FUNCTION_ACTION_CALL_JS_MODULE: {
                action = "callJsModule";
                break;
            }
            case HippyBridgeManagerImpl.FUNCTION_ACTION_ON_WEBSOCKET_MESSAGE: {
                action = "onWebsocketMsg";
                break;
            }
            default:
                LogUtils.w(TAG, "getCallFunctionName: Unknown function id=" + functionId);

        }
        return action;
    }

    @Override
    public void callFunction(int functionId, NativeCallback callback, ByteBuffer buffer) {
        String functionName = getCallFunctionName(functionId);
        if (!mInit || TextUtils.isEmpty(functionName) || buffer == null || buffer.limit() == 0) {
            return;
        }
        int offset = buffer.position();
        int length = buffer.limit() - buffer.position();
        if (buffer.isDirect()) {
            mJsDriver.callFunction(functionName, callback, buffer, offset, length);
        } else {
            /*
             * In Android's DirectByteBuffer implementation.
             *
             * {@link DirectByteBuffer#hb backing array} will be used to store buffer data,
             * {@link DirectByteBuffer#offset} will be used to handle the alignment,
             * it's already add to {@link DirectByteBuffer#address},
             * so the {@link DirectByteBuffer} has backing array and offset.
             *
             * In the other side, JNI method |void* GetDirectBufferAddress(JNIEnv*, jobject)|
             * will be directly return {@link DirectByteBuffer#address} as the starting buffer address.
             *
             * So in this situation if, and only if, buffer is direct,
             * {@link ByteBuffer#arrayOffset} will be ignored, treated as 0.
             */
            offset += buffer.arrayOffset();
            mJsDriver.callFunction(functionName, callback, buffer.array(), offset, length);
        }
    }

    @Override
    public void callFunction(int functionId, NativeCallback callback, byte[] buffer) {
        callFunction(functionId, callback, buffer, 0, buffer.length);
    }

    @Override
    public void callFunction(int functionId, NativeCallback callback, byte[] buffer, int offset,
            int length) {
        String functionName = getCallFunctionName(functionId);
        if (!mInit || TextUtils.isEmpty(functionName) || buffer == null || offset < 0 || length < 0
                || offset + length > buffer.length) {
            return;
        }
        if (functionId == HippyBridgeManagerImpl.FUNCTION_ACTION_LOAD_INSTANCE) {
            final WeakReference<HippyEngineContext> contextWeakRef = new WeakReference<>(mContext);
            callback = new NativeCallback(callback.getHandler()) {
                @Override
                public void Call(long result, Message message, String action, String reason) {
                    if (contextWeakRef.get() != null) {
                        contextWeakRef.get().onLoadInstanceCompleted(result, reason);
                    }
                }
            };
            mJsDriver.loadInstance(buffer, offset, length, callback);
        } else if (functionId == HippyBridgeManagerImpl.FUNCTION_ACTION_DESTROY_INSTANCE) {
            mJsDriver.unloadInstance(buffer, offset, length);
        } else {
            mJsDriver.callFunction(functionName, callback, buffer, offset, length);
        }
    }

    @Override
    public void onDestroy() {
        if (mDebugWebSocketClient != null) {
            mDebugWebSocketClient.closeQuietly();
            mDebugWebSocketClient = null;
        }
        if (mInit) {
            mInit = false;
            mContext = null;
            mBridgeCallback = null;
        }
    }

    @Override
    public void destroy(NativeCallback callback, boolean isReload) {
        mJsDriver.onDestroy(mSingleThreadMode, isReload, callback);
    }

    public void callNatives(String moduleName, String moduleFunc, String callId, byte[] buffer) {
        callNatives(moduleName, moduleFunc, callId, ByteBuffer.wrap(buffer));
    }

    public void callNatives(String moduleName, String moduleFunc, String callId,
            ByteBuffer buffer) {
        if (mBridgeCallback != null) {
            mBridgeCallback.callNatives(moduleName, moduleFunc, callId, buffer);
        }
    }

    public void InspectorChannel(byte[] params) {
        String encoding = ByteOrder.nativeOrder() == ByteOrder.BIG_ENDIAN ? "UTF-16BE" : "UTF-16LE";
        String msg = new String(params, Charset.forName(encoding));
        if (mDebugWebSocketClient != null) {
            mDebugWebSocketClient.sendMessage(msg);
        }
    }

    private boolean isWebUrl(String url) {
        if (TextUtils.isEmpty(url)) {
            return false;
        }
        return ((url.length() > 6) && url.substring(0, 7)
                .equalsIgnoreCase("http://")) || ((url.length() > 7) && url.substring(0, 8)
                .equalsIgnoreCase("https://"));
    }

    @SuppressWarnings("unused")
    public void fetchResourceWithUri(final String uri, final long resId) {
        if (TextUtils.isEmpty(uri) || !isWebUrl(uri)) {
            return;
        }
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                mContext.getVfsManager().fetchResourceAsync(uri, null, null,
                        new FetchResourceCallback() {
                            @Override
                            public void onFetchCompleted(@NonNull ResourceDataHolder holder) {
                                DevSupportManager devManager = mContext.getDevSupportManager();
                                if (holder.resultCode
                                        == ResourceDataHolder.RESOURCE_LOAD_SUCCESS_CODE
                                        && holder.bytes != null) {
                                    final ByteBuffer buffer = ByteBuffer.allocateDirect(
                                            holder.bytes.length);
                                    buffer.put(holder.bytes);
                                    mJsDriver.onResourceReady(buffer, resId);
                                } else {
                                    mJsDriver.onResourceReady(null, resId);
                                    if (devManager != null) {
                                        devManager.onLoadResourceFailed(uri, holder.errorMessage);
                                    }
                                }
                            }

                            @Override
                            public void onFetchProgress(long total, long loaded) {
                                // Nothing need to do here.
                            }
                        });
            }
        });
    }

    public void reportException(String message, String stackTrace) {
        LogUtils.e("reportException", "!!!!!!!!!!!!!!!!!!!");

        LogUtils.e("reportException", message);
        LogUtils.e("reportException", stackTrace);

        if (mBridgeCallback != null) {
            mBridgeCallback.reportException(message, stackTrace);
        }
    }

    @Override
    public void onReceiveData(String msg) {
        if (this.mIsDevModule) {
            callFunction(HippyBridgeManagerImpl.FUNCTION_ACTION_ON_WEBSOCKET_MESSAGE, null,
                    msg.getBytes(StandardCharsets.UTF_16LE));
        }
    }
}
