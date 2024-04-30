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

import android.content.Context;
import android.content.res.AssetManager;
import android.text.TextUtils;

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngine.V8InitParams;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.devsupport.DebugWebSocketClient;
import com.tencent.mtt.hippy.devsupport.DevRemoteDebugProxy;
import com.tencent.mtt.hippy.devsupport.DevServerCallBack;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.devsupport.inspector.Inspector;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleInfo;
import com.tencent.mtt.hippy.serialization.PrimitiveValueDeserializer;
import com.tencent.mtt.hippy.serialization.compatible.Deserializer;
import com.tencent.mtt.hippy.serialization.nio.reader.BinaryReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeDirectReader;
import com.tencent.mtt.hippy.serialization.nio.reader.SafeHeapReader;
import com.tencent.mtt.hippy.serialization.string.InternalizedStringTable;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.FileUtils;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.UIThreadUtils;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

@SuppressWarnings({"unused", "JavaJniMissingFunction"})
public class HippyBridgeImpl implements HippyBridge, DevRemoteDebugProxy.OnReceiveDataListener {

    private static final Object sBridgeSyncLock;

    static {
        sBridgeSyncLock = new Object();
    }

    private static volatile String mCodeCacheRootDir;
    private long mV8RuntimeId = 0;
    private BridgeCallback mBridgeCallback;
    private boolean mInit = false;
    private final HippyEngine.DebugMode mDebugMode;
    private String mDebugServerHost;
    private final boolean mSingleThreadMode;
    private final boolean enableV8Serialization;
    private DebugWebSocketClient mDebugWebSocketClient;
    private String mDebugGlobalConfig;
    private HippyEngineContext mContext;
    @Nullable
    private Deserializer mCompatibleDeserializer;
    @Nullable
    private com.tencent.mtt.hippy.serialization.recommend.Deserializer mRecommendDeserializer;
    private BinaryReader mSafeHeapReader;
    private BinaryReader mSafeDirectReader;
    private final HippyEngine.V8InitParams v8InitParams;
    private Inspector mInspector;

    public HippyBridgeImpl(HippyEngineContext engineContext, BridgeCallback callback,
            boolean singleThreadMode, boolean enableV8Serialization, HippyEngine.DebugMode debugMode,
            String debugServerHost, V8InitParams v8InitParams) {
        this.mBridgeCallback = callback;
        this.mSingleThreadMode = singleThreadMode;
        this.enableV8Serialization = enableV8Serialization;
        this.mDebugMode = debugMode;
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

        if (enableV8Serialization) {
            mCompatibleDeserializer = new Deserializer(null, new InternalizedStringTable());
            mRecommendDeserializer = new com.tencent.mtt.hippy.serialization.recommend.Deserializer(
                    null, new InternalizedStringTable());
        }
    }

    public static int createSnapshotFromScript(String[] script, String basePath, String uri, Context context) {
        HippyMap globalParams = new HippyMap();
        assert (context != null);
        HippyMap dimensionMap = DimensionsUtil.getDimensions(-1, -1, context, false);
        globalParams.pushMap("Dimensions", dimensionMap);
        HippyMap platformParams = new HippyMap();
        platformParams.pushString("OS", "android");
        globalParams.pushMap("Platform", platformParams);
        return createSnapshot(script, basePath, uri, ArgumentUtils.objectToJson(globalParams));
    };

    @Override
    public void initJSBridge(String globalConfig, final NativeCallback callback, final int groupId) {
        mDebugGlobalConfig = globalConfig;

        if (mDebugMode == HippyEngine.DebugMode.Dev) {
            createDebugSocketClient("", new DebugWebSocketClient.JSDebuggerCallback() {
                @SuppressWarnings("unused")
                @Override
                public void onSuccess(String response) {
                    LogUtils.d("hippyCore", "js debug socket connect success");
                    initJSEngine(groupId, callback);
                }

                @SuppressWarnings("unused")
                @Override
                public void onFailure(final Throwable cause) {
                    LogUtils.e("hippyCore", "js debug socket connect failed");
                    initJSEngine(groupId, callback);
                }
            });
        } else {
            initJSEngine(groupId, callback);
        }
    }

    private void createDebugSocketClient(String wsDebugUrl, DebugWebSocketClient.JSDebuggerCallback cb) {
        mDebugWebSocketClient = new DebugWebSocketClient();
        mDebugWebSocketClient.setOnReceiveDataCallback(this);
        if (TextUtils.isEmpty(mDebugServerHost)) {
          mDebugServerHost = "localhost:38989";
        }
        DevSupportManager devSupportManager = mContext.getDevSupportManager();
        if (!"".equals(wsDebugUrl)) {
          devSupportManager.setRemoteServerData(wsDebugUrl);
        }
        mInspector = devSupportManager.getInspector()
                .setEngineContext(mContext, mDebugWebSocketClient);
        String debugUrl = devSupportManager.createDebugUrl(mDebugServerHost);
        mDebugWebSocketClient.connect(debugUrl, cb);
    }

    public void connectDebugUrl(String wsDebugUrl) {
        createDebugSocketClient(wsDebugUrl, new DebugWebSocketClient.JSDebuggerCallback() {
            @SuppressWarnings("unused")
            @Override
            public void onSuccess(String response) {
                LogUtils.d("hippyCore", "js debug socket connect success; from business");
            }

            @SuppressWarnings("unused")
            @Override
            public void onFailure(final Throwable cause) {
                LogUtils.e("hippyCore", "js debug socket connect failed; from business");
            }
        });
    }

    private void initJSEngine(int groupId, final NativeCallback callback) {
        synchronized (HippyBridgeImpl.class) {
            try {
                byte[] globalConfig = mDebugGlobalConfig.getBytes(StandardCharsets.UTF_16LE);
                mV8RuntimeId = initJSFramework(globalConfig, mSingleThreadMode,
                        enableV8Serialization,
                        mDebugMode == HippyEngine.DebugMode.Dev || mDebugMode == HippyEngine.DebugMode.UserLocal,
                        callback, groupId, v8InitParams);
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

    @Override
    public void callFunction(String action, NativeCallback callback, ByteBuffer buffer) {
        if (!mInit || TextUtils.isEmpty(action) || buffer == null || buffer.limit() == 0) {
            return;
        }

        int offset = buffer.position();
        int length = buffer.limit() - buffer.position();
        if (buffer.isDirect()) {
            callFunction(action, mV8RuntimeId, callback, buffer, offset, length);
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
            callFunction(action, mV8RuntimeId, callback, buffer.array(), offset, length);
        }
    }

    @Override
    public void callFunction(String action, NativeCallback callback, byte[] buffer) {
        callFunction(action, callback, buffer, 0, buffer.length);
    }

    @Override
    public void callFunction(String action, NativeCallback callback, byte[] buffer, int offset,
            int length) {
        if (!mInit || TextUtils.isEmpty(action) || buffer == null || offset < 0 || length < 0
                || offset + length > buffer.length) {
            return;
        }

        callFunction(action, mV8RuntimeId, callback, buffer, offset, length);
    }

    @Override
    public void onDestroy(boolean isReload) {
        if (mDebugWebSocketClient != null) {
            mDebugWebSocketClient.close(isReload ? Inspector.CLOSE_RELOAD : Inspector.CLOSE_DESTROY, "");
            mDebugWebSocketClient = null;
        }
        if (mInspector != null) {
            mInspector.onDestroy();
        }
        if (!mInit) {
            return;
        }
        if (enableV8Serialization) {
            if (mCompatibleDeserializer != null) {
                mCompatibleDeserializer.getStringTable().release();
            }
            if (mRecommendDeserializer != null) {
                mRecommendDeserializer.getStringTable().release();
            }
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

    @Override
    public void runScript(@NonNull String script) {
        runScript(mV8RuntimeId, script);
    }

    @Override
    public void runInJsThread(Callback<Void> callback) {
      runInJsThread(mV8RuntimeId, callback);
    }

    public static native int createSnapshot(String[] script, String path, String uri, String config);

    public native long initJSFramework(byte[] globalConfig, boolean useLowMemoryMode,
            boolean enableV8Serialization, boolean isDevModule, NativeCallback callback,
            long groupId, V8InitParams v8InitParams);

    public native void runScript(long runtimeId, String script);

    public native boolean runScriptFromUri(String uri, AssetManager assetManager,
            boolean canUseCodeCache, String codeCacheDir, long V8RuntimeId, NativeCallback callback);

    public native void destroy(long runtimeId, boolean useLowMemoryMode, boolean isReload, NativeCallback callback);

    public native void callFunction(String action, long runtimeId, NativeCallback callback,
            ByteBuffer buffer, int offset, int length);

    public native void callFunction(String action, long runtimeId, NativeCallback callback,
            byte[] buffer, int offset, int length);

    public native void onResourceReady(ByteBuffer output, long runtimeId, long resId);

    private native void runInJsThread(long runtimeId, Callback<Void> callback);

    public void callNatives(String moduleName, String moduleFunc, String callId, byte[] buffer) {
        callNatives(moduleName, moduleFunc, callId, ByteBuffer.wrap(buffer));
    }

    public void callNatives(String moduleName, String moduleFunc, String callId,
            ByteBuffer buffer) {
        LogUtils.d("jni_callback",
                "callNatives [moduleName:" + moduleName + " , moduleFunc: " + moduleFunc + "]");
        if (mBridgeCallback != null) {
            Object params = bytesToArgument(moduleName, moduleFunc, buffer);
            mBridgeCallback.callNatives(moduleName, moduleFunc, callId, params);
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
        final WeakReference<BridgeCallback> callbackWeakReference = new WeakReference<>(mBridgeCallback);
        UIThreadUtils.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (mContext == null) {
                    return;
                }
                DevSupportManager devManager = mContext.getDevSupportManager();
                if (TextUtils.isEmpty(uri) || devManager == null) {
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
                            BridgeCallback callback = callbackWeakReference.get();
                            if (callback != null) {
                                callback.reportException(e);
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

    private HippyArray parseJsonData(ByteBuffer buffer) {
        byte[] bytes;
        if (buffer.isDirect()) {
            bytes = new byte[buffer.limit()];
            buffer.get(bytes);
        } else {
            bytes = buffer.array();
        }
        return ArgumentUtils.parseToArray(new String(bytes));
    }

    @Nullable
    private Object parseV8SerializeData(@NonNull String moduleName, @NonNull String moduleFunc,
            ByteBuffer buffer) {
        HippyModuleManager moduleManager = mContext.getModuleManager();
        HippyNativeModuleInfo moduleInfo = moduleManager.getModuleInfo(moduleName);
        if (moduleInfo == null) {
            return null;
        }
        HippyNativeModuleInfo.HippyNativeMethod method = moduleInfo.findMethod(moduleFunc);
        PrimitiveValueDeserializer deserializer = mCompatibleDeserializer;
        if (method != null && method.useJSValueType()) {
            deserializer = mRecommendDeserializer;
        }
        final BinaryReader binaryReader;
        if (buffer.isDirect()) {
            if (mSafeHeapReader == null) {
                mSafeHeapReader = new SafeDirectReader();
            }
            binaryReader = mSafeHeapReader;
        } else {
            if (mSafeDirectReader == null) {
                mSafeDirectReader = new SafeHeapReader();
            }
            binaryReader = mSafeDirectReader;
        }
        binaryReader.reset(buffer);
        deserializer.setReader(binaryReader);
        deserializer.reset();
        deserializer.readHeader();
        return deserializer.readValue();
    }

    private Object bytesToArgument(String moduleName, String moduleFunc, ByteBuffer buffer) {
        Object result = null;
        try {
            if (enableV8Serialization) {
                result = parseV8SerializeData(moduleName, moduleFunc, buffer);
            } else {
                result = parseJsonData(buffer);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return result == null ? new HippyArray() : result;
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
        if (mDebugMode == HippyEngine.DebugMode.Dev || mDebugMode == HippyEngine.DebugMode.UserLocal) {
            boolean isInspectMsg =
                    mInspector != null && mInspector.dispatchReqFromFrontend(mContext, msg);
            if (!isInspectMsg) {
                callFunction("onWebsocketMsg", null, msg.getBytes(StandardCharsets.UTF_16LE));
            }
        }
    }
}
