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

package com.tencent.mtt.hippy;

import android.content.Context;
import android.graphics.Bitmap;
import android.text.TextUtils;

import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.openhippy.connector.JsDriver.V8InitParams;
import com.openhippy.framework.BuildConfig;
import com.tencent.mtt.hippy.adapter.DefaultLogAdapter;
import com.tencent.mtt.hippy.adapter.HippyLogAdapter;
import com.tencent.mtt.hippy.adapter.device.DefaultDeviceAdapter;
import com.tencent.mtt.hippy.adapter.device.HippyDeviceAdapter;
import com.tencent.mtt.hippy.adapter.exception.DefaultExceptionHandler;
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter;
import com.tencent.mtt.hippy.adapter.executor.DefaultExecutorSupplierAdapter;
import com.tencent.mtt.hippy.adapter.executor.HippyExecutorSupplierAdapter;
import com.tencent.mtt.hippy.adapter.font.DefaultFontScaleAdapter;
import com.tencent.mtt.hippy.adapter.font.HippyFontScaleAdapter;
import com.tencent.mtt.hippy.adapter.http.DefaultHttpAdapter;
import com.tencent.mtt.hippy.adapter.http.HippyHttpAdapter;
import com.tencent.mtt.hippy.adapter.monitor.DefaultEngineMonitorAdapter;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.adapter.sharedpreferences.DefaultSharedPreferencesAdapter;
import com.tencent.mtt.hippy.adapter.sharedpreferences.HippySharedPreferencesAdapter;
import com.tencent.mtt.hippy.adapter.soloader.DefaultSoLoaderAdapter;
import com.tencent.mtt.hippy.adapter.soloader.HippySoLoaderAdapter;
import com.tencent.mtt.hippy.adapter.storage.DefaultStorageAdapter;
import com.tencent.mtt.hippy.adapter.storage.HippyStorageAdapter;
import com.tencent.mtt.hippy.bridge.HippyCoreAPI;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.bridge.libraryloader.LibraryLoader;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.HippyModulePromise.BridgeTransferType;
import com.tencent.mtt.hippy.utils.BuglyUtils;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import com.tencent.mtt.hippy.adapter.thirdparty.HippyThirdPartyAdapter;
import com.tencent.renderer.NativeRenderException;
import com.tencent.renderer.component.image.ImageDecoderAdapter;
import com.tencent.renderer.serialization.Serializer;
import com.tencent.vfs.Processor;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicInteger;

@SuppressWarnings({"deprecation", "unused", "rawtypes"})
public abstract class HippyEngine {

    private static final AtomicInteger ID_COUNTER = new AtomicInteger();
    private final int engineId = ID_COUNTER.getAndIncrement();

    @SuppressWarnings("unchecked")
    final CopyOnWriteArrayList<EngineListener> mEventListeners = new CopyOnWriteArrayList();
    volatile EngineState mCurrentState = EngineState.UNINIT;
    // Engine所属的分组ID，同一个组共享线程和isolate，不同context
    protected int mGroupId;
    ModuleListener mModuleListener;

    private static HippyLogAdapter sLogAdapter = null;

    @SuppressWarnings("JavaJniMissingFunction")
    private static native void setNativeLogHandler(HippyLogAdapter handler);

    /**
     * @param params 创建实例需要的参数 创建一个HippyEngine实例
     */
    public static HippyEngine create(EngineInitParams params) {
        if (params == null) {
            throw new RuntimeException("Hippy: initParams must no be null");
        }
        LogUtils.enableDebugLog(BuildConfig.DEBUG);
        LibraryLoader.loadLibraryIfNeeded(params.soLoader);
        if (sLogAdapter == null && params.logAdapter != null) {
            setNativeLogHandler(params.logAdapter);
        }
        ContextHolder.initAppContext(params.context);
        BuglyUtils.registerSdkAppIdIfNeeded(params.context);
        params.check();
        HippyEngine hippyEngine;
        if (params.groupId == -1) {
            hippyEngine = new HippyNormalEngineManager(params, null);
        } else {
            hippyEngine = new HippySingleThreadEngineManager(params, null);
        }

        return hippyEngine;
    }

    /**
     * listen engine state. no need to make this method public
     */
    protected void listen(EngineListener listener) {
        // 通知listener都要在UI线程
        if (UIThreadUtils.isOnUiThread()) {
            listenInUIThread(listener);
        } else {
            final EngineListener listenerFinal = listener;
            UIThreadUtils.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    listenInUIThread(listenerFinal);
                }
            });
        }
    }

    /**
     * listen engine state in UI thread
     */
    private void listenInUIThread(EngineListener listener) {
        // 1. 若mCurrentState是结束态，无论成功还是失败，要直接通知结果并返回。
        // 2. 若mCurrentState是初始化过程中的状态，则把listener添加到mEventListeners后返回
        if (mCurrentState == EngineState.INITED) {
            listener.onInitialized(EngineInitStatus.STATUS_OK, null);
        } else if (mCurrentState == EngineState.INITERRORED || mCurrentState == EngineState.DESTROYED) {
            listener.onInitialized(EngineInitStatus.STATUS_WRONG_STATE, "engine state=" + mCurrentState);
        } else // 说明mCurrentState是初始化过程中的状态
        {
            mEventListeners.add(listener);
        }
    }

    @SuppressWarnings("unused")
    public EngineState getEngineState() {
        return mCurrentState;
    }

    /**
     * get group id
     */
    public int getGroupId() {
        return mGroupId;
    }

    /**
     * get engine id
     */
    public int getEngineId() {
        return engineId;
    }

    public abstract void initEngine(EngineListener listener);

    // 是否调试模式
    @SuppressWarnings("BooleanMethodIsAlwaysInverted")
    public abstract boolean isDebugMode();

    /**
     * destroy the hippy engine All hippy instance will be destroyed
     */
    @SuppressWarnings("EmptyMethod")
    public abstract void destroyEngine();

    /**
     * 加载hippy业务模块 ,函数组
     *
     * @param loadParams 加载hippy业务模块时需要的参数
     */
    public abstract ViewGroup loadModule(ModuleLoadParams loadParams);

    public abstract ViewGroup loadModule(ModuleLoadParams loadParams, ModuleListener listener);

    public abstract void destroyModule(@Nullable ViewGroup rootView, @NonNull Callback<Boolean> callback);

    public abstract void onEngineResume();

    public abstract void onEnginePause();

    public abstract void sendEvent(String event, Object params);

    public abstract void sendEvent(String event, Object params, BridgeTransferType transferType);

    public abstract void preloadModule(HippyBundleLoader loader);

    public abstract boolean onBackPressed(BackPressHandler handler);

    public abstract HippyEngineContext getEngineContext();

    public abstract void addControllers(@NonNull List<HippyAPIProvider> providers);

    public abstract void addModules(@NonNull List<HippyAPIProvider> providers);

    public abstract void recordSnapshot(@NonNull View rootView, @NonNull final Callback<byte[]> callback);

    public abstract View replaySnapshot(@NonNull Context context, byte[] buffer);

    public abstract View replaySnapshot(@NonNull Context context, @NonNull Map<String, Object> snapshotMap);

    public abstract void removeSnapshotView();

    /**
     * Generate screenshots of specified views
     *
     * @param context host container activity, if this parameter is null, the context of the target view will be
     *         used, if all context is not of activity type, an exception will be thrown
     * @param id the target view id
     * @param callback the result callback {@link ScreenshotBuildCallback}
     * @throws IllegalArgumentException
     */
    public abstract void getScreenshotBitmapForView(@Nullable Context context, int id,
            @NonNull ScreenshotBuildCallback callback);

    /**
     * Generate screenshots of specified views
     *
     * @param context host container activity, if this parameter is null, the context of the target view will be
     *         used, if all context is not of activity type, an exception will be thrown
     * @param view the target view
     * @param callback the result callback {@link ScreenshotBuildCallback}
     * @throws IllegalArgumentException
     */
    public abstract void getScreenshotBitmapForView(@Nullable Context context, @NonNull View view,
            @NonNull ScreenshotBuildCallback callback);

    public interface ScreenshotBuildCallback {

        void onScreenshotBuildCompleted(Bitmap bitmap, int result);
    }

    public interface BackPressHandler {

        void handleBackPress();
    }

    public enum EngineState {
        UNINIT,
        INITING,
        ONRESTART,
        INITERRORED,
        INITED,
        DESTROYED
    }

    // Hippy 引擎初始化时的参数设置
    @SuppressWarnings("deprecation")
    public static class EngineInitParams {

        // 必须 宿主（Hippy的使用者）的Context
        public Context context;
        // 可选参数 核心的jsbundle的assets路径（assets路径和文件路径二选一，优先使用assets路径），debugMode = false时有效
        public String coreJSAssetsPath;
        // 可选参数 核心的jsbundle的文件路径（assets路径和文件路径二选一，优先使用assets路径）,debugMode = false时有效
        public String coreJSFilePath;
        // 可选参数 指定需要预加载的业务模块bundle assets路径
        public HippyBundleLoader jsPreloadAssetsPath;
        // 可选参数 指定需要预加载的业务模块bundle 文件路径
        public HippyBundleLoader jsPreloadFilePath;
        public boolean debugMode = false;
        // 可选参数 是否开启调试模式，默认为false，不开启
        // 可选参数 Hippy Server的jsbundle名字，默认为"index.bundle"。debugMode = true时有效
        public String debugBundleName = "index.bundle";
        // 可选参数 Hippy Server的Host。默认为"localhost:38989"。debugMode = true时有效
        public String debugServerHost = "localhost:38989";
        // optional args, Hippy Server url using remote debug in no usb (if not empty will replace debugServerHost
        // and debugBundleName). debugMode = true take effect
        public String remoteServerUrl = "";
        // 可选参数 自定义的，用来提供Native modules、JavaScript modules、View controllers的管理器。1个或多个
        public List<HippyAPIProvider> providers;
        public List<Processor> processors;
        //Optional  is use V8 serialization or json
        public boolean enableV8Serialization = true;
        // 可选参数 是否打印引擎的完整的log。默认为false
        public boolean enableLog = false;
        // 可选参数 code cache的名字，如果设置为空，则不启用code cache，默认为 ""
        public String codeCacheTag = "";

        public ImageDecoderAdapter imageDecoderAdapter;
        //可选参数 接收RuntimeId
        public HippyThirdPartyAdapter thirdPartyAdapter;

        // 可选参数 接收异常
        public HippyExceptionHandlerAdapter exceptionHandler;
        // 可选参数 设置相关
        public HippySharedPreferencesAdapter sharedPreferencesAdapter;
        // 可选参数 Http request adapter
        public HippyHttpAdapter httpAdapter;
        // 可选参数 Storage adapter 设置相关
        public HippyStorageAdapter storageAdapter;
        // 可选参数 Executor Supplier adapter
        public HippyExecutorSupplierAdapter executorSupplier;
        // 可选参数 Engine Monitor adapter
        public HippyEngineMonitorAdapter engineMonitor;
        // 可选参数 font scale adapter
        public HippyFontScaleAdapter fontScaleAdapter;
        // 可选参数 so加载位置
        public HippySoLoaderAdapter soLoader;
        // 可选参数 device adapter
        public HippyDeviceAdapter deviceAdapter;
        // 设置Hippy引擎的组，同一组的HippyEngine，会共享C层的v8 引擎实例。 默认值为-1（无效组，即不属于任何group组）
        public int groupId = -1;
        // 可选参数 日志输出
        @SuppressWarnings("DeprecatedIsStillUsed")
        @Deprecated
        public HippyLogAdapter logAdapter;
        public V8InitParams v8InitParams;
        public boolean enableTurbo;

        protected void check() {
            if (context == null) {
                throw new IllegalArgumentException(
                        EngineInitParams.class.getName() + " context must not be null!");
            }
            if (sharedPreferencesAdapter == null) {
                sharedPreferencesAdapter = new DefaultSharedPreferencesAdapter(context);
            }
            if (exceptionHandler == null) {
                exceptionHandler = new DefaultExceptionHandler();
            }
            if (httpAdapter == null) {
                httpAdapter = new DefaultHttpAdapter();
            }
            if (executorSupplier == null) {
                executorSupplier = new DefaultExecutorSupplierAdapter();
            }
            if (storageAdapter == null) {
                storageAdapter = new DefaultStorageAdapter(context, executorSupplier.getDBExecutor());
            }
            if (engineMonitor == null) {
                engineMonitor = new DefaultEngineMonitorAdapter();
            }
            if (fontScaleAdapter == null) {
                fontScaleAdapter = new DefaultFontScaleAdapter();
            }
            if (soLoader == null) {
                soLoader = new DefaultSoLoaderAdapter();
            }
            if (deviceAdapter == null) {
                deviceAdapter = new DefaultDeviceAdapter();
            }
            if (logAdapter == null) {
                logAdapter = new DefaultLogAdapter();
            }
            if (providers == null) {
                providers = new ArrayList<>();
            }
            providers.add(0, new HippyCoreAPI());
            if (!debugMode) {
                if (TextUtils.isEmpty(coreJSAssetsPath) && TextUtils.isEmpty(coreJSFilePath)) {
                    throw new RuntimeException(
                            "Hippy: debugMode=true, initParams.coreJSAssetsPath and coreJSFilePath both null!");
                }
            }
        }
    }

    // Hippy 业务模块jsbundle加载时的参数设置
    @SuppressWarnings("deprecation")
    public static class ModuleLoadParams {

        // 必须参数 挂载HippyRootView的Activity or Dialog的Context。注意，只有Context为当前Activity时，调试模式才能使用
        public Context context;
        /**
         * 必须参数 业务模块jsbundle中定义的组件名称。componentName对应的是js文件中的"appName"，比如： var hippy = new Hippy({ appName: "Demo",
         * entryPage: App });
         */
        public String componentName;

        // 可选参数 二选一设置 自己开发的业务模块的jsbundle的assets路径（assets路径和文件路径二选一，优先使用assets路径）
        public String jsAssetsPath;
        // 可选参数 二选一设置 自己开发的业务模块的文件路径（assets路径和文件路径二选一，优先使用assets路径）
        public String jsFilePath;
        // 可选参数 传递给前端的rootview：比如：Hippy.entryPage: class App extends Component
        public HippyMap jsParams;
        // 可选参数 目前只有一个用处：映射："CustomViewCreator" <==> 宿主自定义的一个HippyCustomViewCreator(这个creator还得通过ModuleParams.Builder
        // .setCustomViewCreator来指定才行)
        public HashMap<String, Object> nativeParams;
        // 可选参数 Bundle加载器，老式用法，不建议使用（若一定要使用，则会覆盖jsAssetsPath，jsFilePath的值）。参见jsAssetsPath，jsFilePath
        // 可选参数 code cache的名字，如果设置为空，则不启用code cache，默认为 ""
        public String codeCacheTag = "";
        @SuppressWarnings("DeprecatedIsStillUsed")
        @Deprecated
        public HippyBundleLoader bundleLoader;

        public ModuleLoadParams() {
        }

        public ModuleLoadParams(ModuleLoadParams params) {
            context = params.context;
            jsAssetsPath = params.jsAssetsPath;
            jsFilePath = params.jsFilePath;
            componentName = params.componentName;
            jsParams = params.jsParams;
            nativeParams = params.nativeParams;
            codeCacheTag = params.codeCacheTag;
            bundleLoader = params.bundleLoader;
        }
    }

    /**
     * 引擎初始化过程中的错误码，对于hippy sdk开发者调查hippy sdk的使用者在使用过程中遇到的问题，很必须。
     */

    public enum EngineInitStatus {
        STATUS_OK(0),                     // 初始化成功
        STATUS_ERR_BRIDGE(-101),          // 初始化过程，initBridge错误
        STATUS_ERR_DEVSERVER(-102),       // 初始化过程，devServer错误
        STATUS_WRONG_STATE(-103),         // 状态错误。调用init函数时，引擎不在未初始化的状态
        STATUS_INIT_EXCEPTION(-104);      // 初始化过程，抛出了未知的异常，详情需要查看传回的Throwable

        private final int iValue;

        EngineInitStatus(int value) {
            iValue = value;
        }

        @SuppressWarnings("unused")
        public int value() {
            return iValue;
        }
    }

    public enum ModuleLoadStatus {
        STATUS_OK(0),                     // 加载正常
        STATUS_ENGINE_UNINIT(-201),       // 引擎未完成初始化就加载JSBundle
        STATUS_VARIABLE_NULL(-202),       // check变量(bundleUniKey, loader, rootView)引用为空
        STATUS_ERR_RUN_BUNDLE(-203),      // 业务JSBundle执行错误
        STATUS_REPEAT_LOAD(-204);         // 重复加载同一JSBundle

        private final int iValue;

        ModuleLoadStatus(int value) {
            iValue = value;
        }

        @SuppressWarnings("unused")
        public int value() {
            return iValue;
        }
    }

    /**
     * Hippy引擎初始化结果listener
     */
    public interface EngineListener {

        /**
         * callback after initialization
         *
         * @param statusCode status code from initializing procedure
         * @param msg Message from initializing procedure
         */
        void onInitialized(EngineInitStatus statusCode, String msg);
    }

    @SuppressWarnings("unused")
    public interface ModuleListener {

        void onLoadCompleted(ModuleLoadStatus statusCode, String msg);

        @SuppressWarnings("SameReturnValue")
        boolean onJsException(HippyJsException exception);

        void onFirstViewAdded();
    }
}
