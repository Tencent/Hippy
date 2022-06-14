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

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngine.V8InitParams;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.devsupport.DevServerCallBack;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleInfo;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.compatible.Deserializer;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeDirectReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.utils.UrlUtils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

import android.content.Context;
import android.content.res.AssetManager;
import android.text.TextUtils;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.devsupport.DebugWebSocketClient;
import com.tencent.mtt.hippy.devsupport.DevRemoteDebugProxy;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.FileUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.nio.ByteOrder;

@SuppressWarnings({"unused", "JavaJniMissingFunction"})
public class HippyBridgeImpl implements HippyBridge, DevRemoteDebugProxy.OnReceiveDataListener {
    private static final String TAG = "HippyBridgeImpl";
    private static final Object sBridgeSyncLock;
    private static final String DEFAULT_LOCAL_HOST = "localhost:38989";
    private static final String DEBUG_WEBSOCKET_URL = "ws://%s/debugger-proxy?role=android_client&clientId=%s";
    static {
        sBridgeSyncLock = new Object();
    }

    private static volatile String mCodeCacheRootDir;
    private long mV8RuntimeId = 0;
    private BridgeCallback mBridgeCallback;
    private boolean mInit = false;
    private final boolean mIsDevModule;
    private String mDebugServerHost;
    private final boolean mSingleThreadMode;
    private final boolean enableV8Serialization;
    private DebugWebSocketClient mDebugWebSocketClient;
    private String mDebugGlobalConfig;
    private NativeCallback mDebugInitJSFrameworkCallback;
    private HippyEngineContext mContext;
    private final HippyEngine.V8InitParams v8InitParams;

    public HippyBridgeImpl(HippyEngineContext engineContext, BridgeCallback callback,
            boolean singleThreadMode, boolean enableV8Serialization, boolean isDevModule,
            String debugServerHost, V8InitParams v8InitParams) {
        this.mBridgeCallback = callback;
        this.mSingleThreadMode = singleThreadMode;
        this.enableV8Serialization = enableV8Serialization;
        this.mIsDevModule = isDevModule;
        this.mDebugServerHost = debugServerHost;
        this.mContext = engineContext;
        this.v8InitParams = v8InitParams;

        synchronized (sBridgeSyncLock) {
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
    }

    @Override
    public void initJSBridge(String globalConfig, NativeCallback callback, final int groupId) {
        mDebugGlobalConfig = globalConfig;
        mDebugInitJSFrameworkCallback = callback;

        if (this.mIsDevModule) {
            mDebugWebSocketClient = new DebugWebSocketClient();
            mDebugWebSocketClient.setOnReceiveDataCallback(this);
            String debugUrl = mContext.getDevSupportManager().createDebugUrl(mDebugServerHost);
            mDebugWebSocketClient.connect(debugUrl, new DebugWebSocketClient.JSDebuggerCallback() {
              @SuppressWarnings("unused")
              @Override
              public void onSuccess(String response) {
                LogUtils.d("hippyCore", "js debug socket connect success");
                initJSEngine(groupId);
              }

              @SuppressWarnings("unused")
              @Override
              public void onFailure(final Throwable cause) {
                LogUtils.e("hippyCore", "js debug socket connect failed");
                initJSEngine(groupId);
              }
            });
        } else {
            initJSEngine(groupId);
        }
    }

    private void initJSEngine(int groupId) {
        synchronized (HippyBridgeImpl.class) {
            try {
                String localCachePath = mContext.getGlobalConfigs().getContext().getFilesDir().getAbsolutePath();
                byte[] globalConfig = mDebugGlobalConfig.getBytes(StandardCharsets.UTF_16LE);
                mV8RuntimeId = initJSFramework(
                    globalConfig, mSingleThreadMode, enableV8Serialization,
                    mIsDevModule, mDebugInitJSFrameworkCallback, groupId,
                    v8InitParams,
                    localCachePath,
                    mContext.getDevSupportManager().createDebugUrl(mDebugServerHost)
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
        return mV8RuntimeId;
    }

    @Override
    public boolean runScriptFromUri(String uri, AssetManager assetManager, boolean canUseCodeCache,
            String codeCacheTag, NativeCallback callback) {
        if (!mInit) {
            return false;
        }

        if (!TextUtils.isEmpty(codeCacheTag) && !TextUtils.isEmpty(mCodeCacheRootDir)) {
            String codeCacheDir = mCodeCacheRootDir + codeCacheTag + File.separator;
            File codeCacheFile = new File(codeCacheDir);
            if (!codeCacheFile.exists()) {
                boolean ret = codeCacheFile.mkdirs();
                if (!ret) {
                    canUseCodeCache = false;
                    codeCacheDir = "";
                }
            }

            return runScriptFromUri(uri, assetManager, canUseCodeCache, codeCacheDir, mV8RuntimeId,
                    callback);
        } else {
            boolean ret = false;
            LogUtils.d("HippyEngineMonitor", "runScriptFromAssets codeCacheTag is null");
            try {
                ret = runScriptFromUri(uri, assetManager, false, "" + codeCacheTag + File.separator,
                        mV8RuntimeId, callback);
            } catch (Throwable e) {
                if (mBridgeCallback != null) {
                    mBridgeCallback.reportException(e);
                }
            }
            return ret;
        }
    }

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
            case HippyBridgeManagerImpl.FUNCTION_ACTION_CALL_JSMODULE: {
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
            callFunction(functionName, mV8RuntimeId, callback, buffer, offset, length);
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
            callFunction(functionName, mV8RuntimeId, callback, buffer.array(), offset, length);
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
            loadInstance(mV8RuntimeId, buffer, offset, length);
        } else {
            callFunction(functionName, mV8RuntimeId, callback, buffer, offset, length);
        }
    }

    @Override
    public void onDestroy() {
        if (mDebugWebSocketClient != null) {
            mDebugWebSocketClient.closeQuietly();
            mDebugWebSocketClient = null;
        }
        if (!mInit) {
            return;
        }
        mInit = false;
        mV8RuntimeId = 0;
        mContext = null;
        mBridgeCallback = null;
    }

    @Override
    public void destroy(NativeCallback callback, boolean isReload) {
        destroy(mV8RuntimeId, mSingleThreadMode, isReload, callback);
    }

    public native long initJSFramework(byte[] gobalConfig, boolean useLowMemoryMode,
            boolean enableV8Serialization, boolean isDevModule, NativeCallback callback,
            long groupId, V8InitParams v8InitParams, String dataDir, String wsUrl);

    public native boolean runScriptFromUri(String uri, AssetManager assetManager,
            boolean canUseCodeCache, String codeCacheDir, long V8RuntimeId,
            NativeCallback callback);

    public native void destroy(long runtimeId, boolean useLowMemoryMode, boolean isReload, NativeCallback callback);

    public native void callFunction(String action, long V8RuntimeId, NativeCallback callback,
            ByteBuffer buffer, int offset, int length);

    public native void callFunction(String action, long V8RuntimeId, NativeCallback callback,
            byte[] buffer, int offset, int length);

    public native void loadInstance(long V8RuntimeId, byte[] buffer, int offset, int length);

    public native void onResourceReady(ByteBuffer output, long runtimeId, long resId);

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

    @SuppressWarnings("unused")
    public void fetchResourceWithUri(final String uri, final long resId) {
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                DevSupportManager devManager = mContext.getDevSupportManager();
                if (TextUtils.isEmpty(uri) || !UrlUtils.isWebUrl(uri) || devManager == null) {
                    LogUtils.e("HippyBridgeImpl",
                            "fetchResourceWithUri: can not call loadRemoteResource with " + uri);
                    return;
                }

                devManager.loadRemoteResource(uri, new DevServerCallBack() {
                    @Override
                    public void onDevBundleReLoad() {
                    }

                    @Override
                    public void onDevBundleLoadReady(InputStream inputStream) {
                        try {
                            ByteArrayOutputStream output = new ByteArrayOutputStream();

                            byte[] b = new byte[2048];
                            int size;
                            while ((size = inputStream.read(b)) > 0) {
                                output.write(b, 0, size);
                            }

                            byte[] resBytes = output.toByteArray();
                            final ByteBuffer buffer = ByteBuffer.allocateDirect(resBytes.length);
                            buffer.put(resBytes);
                            onResourceReady(buffer, mV8RuntimeId, resId);
                        } catch (Throwable e) {
                            if (mBridgeCallback != null) {
                                mBridgeCallback.reportException(e);
                            }
                            onResourceReady(null, mV8RuntimeId, resId);
                        }
                    }

                    @Override
                    public void onInitDevError(Throwable e) {
                        LogUtils.e("hippy", "requireSubResource: " + e.getMessage());
                        onResourceReady(null, mV8RuntimeId, resId);
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
