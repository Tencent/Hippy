/*
 * Tencent is pleased to support the open source community by making Hippy
 * available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.tencent.mtt.hippy.bridge;

import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.res.Configuration;
import android.os.Build;
import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;

import androidx.annotation.NonNull;
import com.openhippy.connector.JsDriver;
import com.openhippy.connector.JsDriver.V8InitParams;
import com.openhippy.connector.NativeCallback;
import com.openhippy.framework.BuildConfig;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadStatus;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.adapter.thirdparty.HippyThirdPartyAdapter;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.bridge.jsi.TurboModuleManager;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.HippyModulePromise.BridgeTransferType;
import com.tencent.mtt.hippy.runtime.builtins.JSObject;
import com.tencent.mtt.hippy.runtime.builtins.JSValue;
import com.tencent.mtt.hippy.serialization.PrimitiveValueSerializer;
import com.tencent.mtt.hippy.serialization.compatible.Serializer;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeDirectWriter;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.I18nUtil;
import com.tencent.mtt.hippy.utils.TimeMonitor;

import java.lang.ref.WeakReference;
import org.json.JSONObject;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;

@SuppressWarnings({"unused", "deprecation"})
public class HippyBridgeManagerImpl implements HippyBridgeManager, HippyBridge.BridgeCallback,
        Handler.Callback {

    public enum BridgeState {
        UNINITIALIZED,
        INITIALIZED,
        DESTROYED
    }

    static final int MSG_CODE_INIT_BRIDGE = 10;
    static final int MSG_CODE_RUN_BUNDLE = 11;
    static final int MSG_CODE_CALL_FUNCTION = 12;
    static final int MSG_CODE_DESTROY_BRIDGE = 13;
    static final int MSG_CODE_ON_BRIDGE_DESTROYED = 14;

    static final int FUNCTION_ACTION_LOAD_INSTANCE = 1;
    static final int FUNCTION_ACTION_RESUME_INSTANCE = 2;
    static final int FUNCTION_ACTION_PAUSE_INSTANCE = 3;
    static final int FUNCTION_ACTION_DESTROY_INSTANCE = 4;
    static final int FUNCTION_ACTION_CALLBACK = 5;
    static final int FUNCTION_ACTION_CALL_JS_MODULE = 6;
    static final int FUNCTION_ACTION_ON_WEBSOCKET_MESSAGE = 7;

    public static final int BRIDGE_TYPE_SINGLE_THREAD = 2;
    public static final int BRIDGE_TYPE_NORMAL = 1;

    public static final int DESTROY_CLOSE = 0;
    public static final int DESTROY_RELOAD = 1;

    final HippyEngineContext mContext;
    final HippyBundleLoader mCoreBundleLoader;
    private final HippyBridge mHippyBridge;
    BridgeState mBridgeState = BridgeState.UNINITIALIZED;
    Handler mHandler;
    final boolean mEnableV8Serialization;
    ArrayList<String> mLoadedBundleInfo = null;
    private final int mGroupId;
    private final HippyThirdPartyAdapter mThirdPartyAdapter;
    private StringBuilder mStringBuilder;
    private SafeHeapWriter safeHeapWriter;
    private SafeDirectWriter safeDirectWriter;
    private Serializer compatibleSerializer;
    private com.tencent.mtt.hippy.serialization.recommend.Serializer recommendSerializer;
    private TurboModuleManager mTurboModuleManager;
    private NativeCallback mCallFunctionCallback;

    public HippyBridgeManagerImpl(HippyEngineContext context, HippyBundleLoader coreBundleLoader,
            int bridgeType, boolean enableV8Serialization, boolean isDevModule,
            String debugServerHost, int groupId, HippyThirdPartyAdapter thirdPartyAdapter,
            V8InitParams v8InitParams, @NonNull JsDriver jsDriver) {
        mContext = context;
        mCoreBundleLoader = coreBundleLoader;
        mGroupId = groupId;
        mThirdPartyAdapter = thirdPartyAdapter;
        mEnableV8Serialization = enableV8Serialization;
        mHippyBridge = new HippyBridgeImpl(context, this, bridgeType == BRIDGE_TYPE_SINGLE_THREAD,
                enableV8Serialization, isDevModule, debugServerHost, v8InitParams, jsDriver);
        if (enableV8Serialization) {
            compatibleSerializer = new Serializer();
            recommendSerializer = new com.tencent.mtt.hippy.serialization.recommend.Serializer();
        } else {
            mStringBuilder = new StringBuilder(1024);
        }
    }

    private void handleCallFunction(Message msg) {
        if (mCallFunctionCallback == null) {
            mCallFunctionCallback = new NativeCallback(mHandler) {
                @Override
                public void Call(long result, Message message, String action, String reason) {
                    if (result != 0) {
                        String info = "CallFunction error: action=" + action
                                + ", result=" + result + ", reason=" + reason;
                        reportException(new Throwable(info));
                    }
                }
            };
        }
        int functionId = msg.arg2;
        PrimitiveValueSerializer serializer = (msg.obj instanceof JSValue) ?
                recommendSerializer : compatibleSerializer;
        if (msg.arg1 == BridgeTransferType.BRIDGE_TRANSFER_TYPE_NIO.value()) {
            ByteBuffer buffer;
            if (mEnableV8Serialization) {
                if (safeDirectWriter == null) {
                    safeDirectWriter = new SafeDirectWriter(SafeDirectWriter.INITIAL_CAPACITY, 0);
                } else {
                    safeDirectWriter.reset();
                }
                serializer.setWriter(safeDirectWriter);
                serializer.reset();
                serializer.writeHeader();
                serializer.writeValue(msg.obj);
                buffer = safeDirectWriter.chunked();
            } else {
                mStringBuilder.setLength(0);
                byte[] bytes = ArgumentUtils.objectToJsonOpt(msg.obj, mStringBuilder).getBytes(
                        StandardCharsets.UTF_16LE);
                buffer = ByteBuffer.allocateDirect(bytes.length);
                buffer.put(bytes);
            }

            mHippyBridge.callFunction(functionId, mCallFunctionCallback, buffer);
        } else {
            if (mEnableV8Serialization) {
                if (safeHeapWriter == null) {
                    safeHeapWriter = new SafeHeapWriter();
                } else {
                    safeHeapWriter.reset();
                }
                serializer.setWriter(safeHeapWriter);
                serializer.reset();
                serializer.writeHeader();
                serializer.writeValue(msg.obj);
                ByteBuffer buffer = safeHeapWriter.chunked();
                int offset = buffer.arrayOffset() + buffer.position();
                int length = buffer.limit() - buffer.position();
                mHippyBridge.callFunction(functionId, mCallFunctionCallback, buffer.array(), offset,
                        length);
            } else {
                mStringBuilder.setLength(0);
                byte[] bytes = ArgumentUtils.objectToJsonOpt(msg.obj, mStringBuilder).getBytes(
                        StandardCharsets.UTF_16LE);
                mHippyBridge.callFunction(functionId, mCallFunctionCallback, bytes);
            }
        }
    }

    private void onBridgeDestroyed(Message msg) {
        mContext.onBridgeDestroyed((msg.arg1 == DESTROY_RELOAD), (Throwable) msg.obj);
    }

    private void handleDestroyBridge(Message msg) {
        if (mThirdPartyAdapter != null) {
            mThirdPartyAdapter.onRuntimeDestroy();
        }
        final int code = msg.arg1;
        final com.tencent.mtt.hippy.common.Callback<Boolean> destroyCallback = new Callback<Boolean>() {
            @Override
            public void callback(Boolean result, Throwable e) {
                Message message = mHandler.obtainMessage(MSG_CODE_ON_BRIDGE_DESTROYED, e);
                message.arg1 = code;
                mHandler.sendMessage(message);
            }
        };
        mHippyBridge.destroy(new NativeCallback(mHandler) {
            @Override
            public void Call(long result, Message message, String action, String reason) {
                boolean success = result == 0;
                mHippyBridge.onDestroy();
                RuntimeException exception = null;
                if (!success) {
                    exception = new RuntimeException(
                            "destroy error: result=" + result + ", reason=" + reason);
                }
                destroyCallback.callback(success, exception);
                mCallFunctionCallback = null;
            }
        }, (msg.arg1 == DESTROY_RELOAD));
        // When the driver is destroyed, the corresponding scope is also cleared, so there can
        // be no more call function calls, destroy needs to be called here.
        destroy();
    }

    @Override
    public boolean handleMessage(Message msg) {
        final TimeMonitor timeMonitor = mContext.getMonitor();
        try {
            switch (msg.what) {
                case MSG_CODE_INIT_BRIDGE: {
                    @SuppressWarnings("unchecked") final com.tencent.mtt.hippy.common.Callback<Boolean> callback = (com.tencent.mtt.hippy.common.Callback<Boolean>) msg.obj;
                    try {
                        mHippyBridge.initJSBridge(getGlobalConfigs(), new NativeCallback(mHandler) {
                            @Override
                            public void Call(long result, Message message, String action,
                                    String reason) {
                                if (result != 0 || mBridgeState == BridgeState.DESTROYED) {
                                    String info =
                                            "initJSBridge error: result " + result + ", reason "
                                                    + reason + ", bridge state " + mBridgeState;
                                    reportException(new Throwable(info));
                                    return;
                                }
                                long runtimeId = mHippyBridge.getV8RuntimeId();
                                if (mContext != null) {
                                    mContext.onRuntimeInitialized();
                                }
                                if (enableTurbo()) {
                                    mTurboModuleManager = new TurboModuleManager(mContext);
                                    mTurboModuleManager.install(runtimeId);
                                }
                                if (mThirdPartyAdapter != null) {
                                    mThirdPartyAdapter.onRuntimeInit(runtimeId);
                                }
                                if (mCoreBundleLoader != null) {
                                    timeMonitor.addPoint(TimeMonitor.MONITOR_GROUP_INIT_ENGINE,
                                            TimeMonitor.MONITOR_POINT_LOAD_VENDOR_JS);
                                    mCoreBundleLoader
                                            .load(mHippyBridge, new NativeCallback(mHandler) {
                                                @Override
                                                public void Call(long result, Message message,
                                                        String action, String reason) {
                                                    if (mBridgeState == BridgeState.DESTROYED) {
                                                        return;
                                                    }
                                                    RuntimeException exception = null;
                                                    if (result == 0) {
                                                        mBridgeState = BridgeState.INITIALIZED;
                                                    } else {
                                                        exception = new RuntimeException(
                                                                "load coreJsBundle failed, check your core jsBundle:"
                                                                        + reason);
                                                    }
                                                    callback.callback((result == 0), exception);
                                                    timeMonitor.endGroup(TimeMonitor.MONITOR_GROUP_INIT_ENGINE);
                                                }
                                            });
                                } else {
                                    mBridgeState = BridgeState.INITIALIZED;
                                    callback.callback(true, null);
                                }
                            }
                        }, mGroupId);
                    } catch (Throwable e) {
                        mBridgeState = BridgeState.UNINITIALIZED;
                        callback.callback(false, e);
                    }
                    return true;
                }
                case MSG_CODE_RUN_BUNDLE: {
                    HippyBundleLoader loader = (HippyBundleLoader) msg.obj;
                    if (mBridgeState != BridgeState.INITIALIZED) {
                        mContext.onLoadModuleCompleted(ModuleLoadStatus.STATUS_ENGINE_UNINIT,
                                "load module error. bridge state: " + mBridgeState);
                        return true;
                    }
                    if (loader == null) {
                        mContext.onLoadModuleCompleted(ModuleLoadStatus.STATUS_VARIABLE_NULL,
                                "load module error. loader:" + null);
                        return true;
                    }
                    final String bundleUniKey = loader.getBundleUniKey();
                    if (mLoadedBundleInfo != null && !TextUtils.isEmpty(bundleUniKey)
                            && mLoadedBundleInfo.contains(bundleUniKey)) {
                        mContext.onLoadModuleCompleted(ModuleLoadStatus.STATUS_REPEAT_LOAD,
                                "repeat load module. loader.getBundleUniKey=" + bundleUniKey);
                        return true;
                    }
                    if (!TextUtils.isEmpty(bundleUniKey)) {
                        if (mLoadedBundleInfo == null) {
                            mLoadedBundleInfo = new ArrayList<>();
                        }
                        mLoadedBundleInfo.add(bundleUniKey);
                        final WeakReference<HippyEngineContext> contextWeakRef = new WeakReference<>(mContext);
                        loader.load(mHippyBridge, new NativeCallback(mHandler) {
                            @Override
                            public void Call(long result, Message message, String action,
                                    String reason) {
                                if (result == 0) {
                                    if (contextWeakRef.get() != null) {
                                        contextWeakRef.get().onLoadModuleCompleted(ModuleLoadStatus.STATUS_OK,
                                                null);
                                    }
                                } else {
                                    if (contextWeakRef.get() != null) {
                                        contextWeakRef.get().onLoadModuleCompleted(
                                                ModuleLoadStatus.STATUS_ERR_RUN_BUNDLE,
                                                "load module error. loader.load failed. check the file!!");
                                    }
                                }
                                timeMonitor.endGroup(TimeMonitor.MONITOR_GROUP_RUN_BUNDLE);
                                timeMonitor.beginGroup(TimeMonitor.MONITOR_GROUP_PAINT);
                                timeMonitor.addPoint(TimeMonitor.MONITOR_GROUP_PAINT, TimeMonitor.MONITOR_POINT_FIRST_PAINT);
                            }
                        });
                    } else {
                        mContext.onLoadModuleCompleted(ModuleLoadStatus.STATUS_VARIABLE_NULL,
                                "can not load module. loader.getBundleUniKey=null");
                    }
                    return true;
                }
                case MSG_CODE_CALL_FUNCTION: {
                    if (mBridgeState == BridgeState.INITIALIZED) {
                        handleCallFunction(msg);
                    }
                    return true;
                }
                case MSG_CODE_DESTROY_BRIDGE: {
                    handleDestroyBridge(msg);
                    return true;
                }
                case MSG_CODE_ON_BRIDGE_DESTROYED: {
                    onBridgeDestroyed(msg);
                    return true;
                }
            }
        } catch (Throwable e) {
            reportException(e);
        }
        return false;
    }

    @Override
    public void initBridge(Callback<Boolean> callback) {
        mHandler = new Handler(mContext.getThreadExecutor().getBridgeThread().getLooper(), this);
        Message message = mHandler.obtainMessage(MSG_CODE_INIT_BRIDGE, callback);
        mHandler.sendMessage(message);
    }

    @Override
    public void runBundle(int id, HippyBundleLoader loader) {
        if (mHandler != null) {
            mContext.getMonitor().beginGroup(TimeMonitor.MONITOR_GROUP_RUN_BUNDLE);
            mContext.getMonitor().addPoint(TimeMonitor.MONITOR_GROUP_RUN_BUNDLE,
                    TimeMonitor.MONITOR_POINT_LOAD_MAIN_JS);
            Message message = mHandler.obtainMessage(MSG_CODE_RUN_BUNDLE, 0, id, loader);
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void loadInstance(String name, int id, HippyMap params) {
        if (mHandler != null) {
            mContext.getMonitor().beginGroup(TimeMonitor.MONITOR_GROUP_PAINT);
            mContext.getMonitor().addPoint(TimeMonitor.MONITOR_GROUP_PAINT, TimeMonitor.MONITOR_POINT_FIRST_PAINT);
            HippyMap map = new HippyMap();
            map.pushString("name", name);
            map.pushInt("id", id);
            map.pushMap("params", params);
            Message message = mHandler
                    .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_LOAD_INSTANCE, map);
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void resumeInstance(int id) {
        if (mHandler != null) {
            Message message = mHandler
                    .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_RESUME_INSTANCE, id);
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void pauseInstance(int id) {
        if (mHandler != null) {
            Message message = mHandler
                    .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_PAUSE_INSTANCE, id);
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void destroyInstance(int id) {
        if (mHandler != null) {
            JSObject jsObject = new JSObject();
            jsObject.set("id", id);
            Message message = mHandler
                    .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_DESTROY_INSTANCE,
                            jsObject);
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void execCallback(Object params, BridgeTransferType transferType) {
        if (mHandler != null) {
            Message message = mHandler
                    .obtainMessage(MSG_CODE_CALL_FUNCTION, transferType.value(),
                            FUNCTION_ACTION_CALLBACK, params);
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void destroyBridge(boolean isReload) {
        if (mHandler != null) {
            Message message = mHandler.obtainMessage(MSG_CODE_DESTROY_BRIDGE);
            message.arg1 = isReload ? DESTROY_RELOAD : DESTROY_CLOSE;
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void destroy() {
        mBridgeState = BridgeState.DESTROYED;
        if (mHandler != null) {
            mHandler.removeMessages(MSG_CODE_INIT_BRIDGE);
            mHandler.removeMessages(MSG_CODE_RUN_BUNDLE);
            mHandler.removeMessages(MSG_CODE_CALL_FUNCTION);
        }
    }

    @Override
    public void callJavaScriptModule(String moduleName, String methodName, Object param,
            BridgeTransferType transferType) {
        if (mHandler != null) {
            HippyMap map = new HippyMap();
            map.pushString("moduleName", moduleName);
            map.pushString("methodName", methodName);
            map.pushObject("params", param);
            Message message = mHandler
                    .obtainMessage(MSG_CODE_CALL_FUNCTION, transferType.value(),
                            FUNCTION_ACTION_CALL_JS_MODULE, map);
            mHandler.sendMessage(message);
        }
    }

    @Override
    public void callNatives(String moduleName, String moduleFunc, String callId,
            ByteBuffer params) {
        if (mContext != null) {
            HippyModuleManager moduleManager = mContext.getModuleManager();
            if (moduleManager != null) {
                HippyCallNativeParams callNativeParams = HippyCallNativeParams
                        .obtain(moduleName, moduleFunc, callId, params);
                moduleManager.callNatives(callNativeParams);
            }
        }
    }

    @Override
    public void reportException(Throwable e) {
        if (mContext != null && e != null) {
            mContext.handleException(e);
        }
    }

    @Override
    public void reportException(String message, String stackTrace) {
        if (mContext != null) {
            mContext.handleException(new HippyJsException(message, stackTrace));
        }
    }

    String getGlobalConfigs() {
        Context context = mContext.getGlobalConfigs().getContext();
        assert (context != null);

        HippyMap globalParams = new HippyMap();
        HippyMap dimensionMap = DimensionsUtil.getDimensions(-1, -1, context, false);

        if (mContext.getGlobalConfigs() != null
                && mContext.getGlobalConfigs().getDeviceAdapter() != null) {
            mContext.getGlobalConfigs().getDeviceAdapter()
                    .reviseDimensionIfNeed(context, dimensionMap, false,
                            false);
        }
        DimensionsUtil.convertDimensionsToDp(dimensionMap);
        globalParams.pushMap("Dimensions", dimensionMap);

        String packageName = "";
        String versionName = "";
        String pageUrl = "";
        boolean nightMode = false;

        HippyMap extraDataMap = new HippyMap();
        if (mThirdPartyAdapter != null) {
            packageName = mThirdPartyAdapter.getPackageName();
            versionName = mThirdPartyAdapter.getAppVersion();
            pageUrl = mThirdPartyAdapter.getPageUrl();
            nightMode = mThirdPartyAdapter.getNightMode();
            JSONObject jObject = mThirdPartyAdapter.getExtraData();
            if (jObject != null) {
                extraDataMap.pushJSONObject(jObject);
            }
        }

        try {
            PackageManager packageManager = context.getPackageManager();
            PackageInfo packageInfo = packageManager.getPackageInfo(
                    context.getPackageName(), 0);
            if (TextUtils.isEmpty(packageName)) {
                packageName = packageInfo.packageName;
            }

            if (TextUtils.isEmpty(versionName)) {
                versionName = packageInfo.versionName;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        HippyMap platformParams = new HippyMap();
        platformParams.pushString("OS", "android");
        platformParams.pushString("PackageName", (packageName == null) ? "" : packageName);
        platformParams.pushString("VersionName", (versionName == null) ? "" : versionName);
        platformParams.pushInt("APILevel", Build.VERSION.SDK_INT);
        platformParams.pushBoolean("NightMode", getNightMode());
        platformParams.pushString("SDKVersion", BuildConfig.LIBRARY_VERSION);

        HippyMap Localization = new HippyMap();
        Localization.pushString("language", I18nUtil.getLanguage());
        Localization.pushString("country", I18nUtil.getCountry());
        Localization.pushInt("direction", I18nUtil.getLayoutDirection());
        platformParams.pushMap("Localization", Localization);

        globalParams.pushMap("Platform", platformParams);

        if (mContext.getDevSupportManager().isSupportDev()) {
            HippyMap debugParams = new HippyMap();
            debugParams.pushString("debugClientId",
                    mContext.getDevSupportManager().getDevInstanceUUID());
            globalParams.pushMap("Debug", debugParams);
        }

        HippyMap host = new HippyMap();
        host.pushString("url", (pageUrl == null) ? "" : pageUrl);
        host.pushString("appName", (packageName == null) ? "" : packageName);
        host.pushString("appVersion", (versionName == null) ? "" : versionName);
        host.pushBoolean("nightMode", nightMode);
        host.pushMap("extra", extraDataMap);
        globalParams.pushMap("HostConfig", host);

        return ArgumentUtils.objectToJson(globalParams);
    }

    private boolean getNightMode() {
        int currentNightMode =
                mContext.getGlobalConfigs().getContext().getResources().getConfiguration().uiMode
                        & Configuration.UI_MODE_NIGHT_MASK;
        switch (currentNightMode) {
            case Configuration.UI_MODE_NIGHT_UNDEFINED:
                // We don't know what mode we're in, assume notnight
                return false;
            case Configuration.UI_MODE_NIGHT_NO:
                // Night mode is not active, we're in day time
                return false;
            case Configuration.UI_MODE_NIGHT_YES:
                // Night mode is active, we're at night!
                return true;
            default:
                return false;
        }
    }

    @Override
    public HippyThirdPartyAdapter getThirdPartyAdapter() {
        return mThirdPartyAdapter;
    }

    private boolean enableTurbo() {
        return mContext.getGlobalConfigs() != null && mContext.getGlobalConfigs().enableTurbo();
    }
}
