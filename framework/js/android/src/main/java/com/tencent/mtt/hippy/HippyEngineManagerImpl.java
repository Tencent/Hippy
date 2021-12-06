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
package com.tencent.mtt.hippy;

import android.content.Context;
import android.content.ContextWrapper;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.text.TextUtils;

import android.view.ViewGroup;
import com.tencent.hippy.support.HippyBaseController;
import com.tencent.hippy.support.IJSFrameworkProxy;
import com.tencent.hippy.support.INativeRendererProxy;
import com.tencent.mtt.hippy.adapter.device.HippyDeviceAdapter;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.modules.Promise.BridgeTransferType;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.adapter.thirdparty.HippyThirdPartyAdapter;
import com.tencent.mtt.hippy.bridge.HippyBridgeManager;
import com.tencent.mtt.hippy.bridge.HippyBridgeManagerImpl;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyAssetBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyFileBundleLoader;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyRemoteBundleLoader;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.common.ThreadExecutor;
import com.tencent.mtt.hippy.devsupport.DevServerCallBack;
import com.tencent.mtt.hippy.devsupport.DevSupportManager;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.HippyModuleManagerImpl;
import com.tencent.mtt.hippy.modules.javascriptmodules.Dimensions;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule;
import com.tencent.mtt.hippy.uimanager.HippyCustomViewCreator;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.ContextHolder;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.utils.TimeMonitor;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import java.io.InputStream;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@SuppressWarnings({"deprecation", "unused"})
public abstract class HippyEngineManagerImpl extends HippyEngineManager implements
    DevServerCallBack, IJSFrameworkProxy, ThreadExecutor.UncaughtExceptionHandler {

  static final String TAG = "HippyEngineManagerImpl";

  static final int MSG_ENGINE_INIT_TIMEOUT = 100;

  /**
   * global configuration
   */
  final HippyGlobalConfigs mGlobalConfigs;
  /**
   * core bundle loader
   */
  HippyBundleLoader mCoreBundleLoader;
  /**
   * preload bundle loader
   */
  final HippyBundleLoader mPreloadBundleLoader;
  /**
   * providers
   */
  final List<HippyAPIProvider> mAPIProviders;
  /**
   * Dev support manager
   */
  DevSupportManager mDevSupportManager;
  HippyEngineContextImpl mEngineContext;
  private ModuleLoadParams moduleLoadParams;
  private HippyBundleLoader jsBundleLoader;
  // 从网络上加载jsbundle
  final boolean mDebugMode;
  // Hippy Server的jsbundle名字，调试模式下有效
  final String mServerBundleName;
  // Hippy Server的host，调试模式下有效
  private final String mServerHost;
  private ViewGroup rootView;
  final boolean enableV8Serialization;

  boolean mDevManagerInited = false;
  final TimeMonitor mStartTimeMonitor;
  boolean mHasReportEngineLoadResult = false;
  private final HippyThirdPartyAdapter mThirdPartyAdapter;
  private final V8InitParams v8InitParams;

  final Handler mHandler = new Handler(Looper.getMainLooper()) {
    @Override
    public void handleMessage(Message msg) {
      if (msg.what
          == MSG_ENGINE_INIT_TIMEOUT) {
        reportEngineLoadResult(
            HippyEngineMonitorAdapter.ENGINE_LOAD_RESULE_TIMEOUT,
            null);
      }
      super.handleMessage(msg);
    }
  };

  HippyEngineManagerImpl(EngineInitParams params, HippyBundleLoader preloadBundleLoader) {
    super();

    // create core bundle loader
    HippyBundleLoader coreBundleLoader = null;
    if (!TextUtils.isEmpty(params.coreJSAssetsPath)) {
      coreBundleLoader = new HippyAssetBundleLoader(params.context, params.coreJSAssetsPath,
          !TextUtils.isEmpty(params.codeCacheTag), params.codeCacheTag);
    } else if (!TextUtils.isEmpty(params.coreJSFilePath)) {
      coreBundleLoader = new HippyFileBundleLoader(params.coreJSFilePath,
          !TextUtils.isEmpty(params.codeCacheTag), params.codeCacheTag);
    }

    this.mGlobalConfigs = new HippyGlobalConfigs(params);
    this.mCoreBundleLoader = coreBundleLoader;
    this.mPreloadBundleLoader = preloadBundleLoader;
    this.mAPIProviders = params.providers;
    this.mDebugMode = params.debugMode;
    this.mServerBundleName = params.debugMode ? params.debugBundleName : "";
    this.mStartTimeMonitor = new TimeMonitor(!params.debugMode);
    this.enableV8Serialization = params.enableV8Serialization;
    this.mServerHost = params.debugServerHost;
    this.mGroupId = params.groupId;
    this.mThirdPartyAdapter = params.thirdPartyAdapter;
    this.v8InitParams = params.v8InitParams;
  }

  /**
   * 初始化引擎。这个method，可重入。也就是允许重复调用，而不会导致异常
   */
  @Override
  public void initEngine(EngineListener listener) {
    if (mCurrentState != EngineState.UNINIT) {
      if (listener != null) {
        listen(listener);
      }
      return;
    }

    mCurrentState = EngineState.INITING;
    if (listener != null) {
      mEventListeners.add(listener);
    }

    mGlobalConfigs.getEngineMonitorAdapter().reportEngineLoadStart();
    mHandler.removeMessages(MSG_ENGINE_INIT_TIMEOUT);

    try {
      mDevSupportManager = new DevSupportManager(mGlobalConfigs, mDebugMode, mServerHost,
          mServerBundleName);
      mDevSupportManager.setDevCallback(this);

      if (mDebugMode) {
        String url = mDevSupportManager.createResourceUrl(mServerBundleName);
        mCoreBundleLoader = new HippyRemoteBundleLoader(url);
        ((HippyRemoteBundleLoader) mCoreBundleLoader).setIsDebugMode(true);
      }

      LogUtils.d(TAG, "start restartEngineInBackground...");
      restartEngineInBackground();
    } catch (Throwable e) {
      mCurrentState = EngineState.INITERRORED;
      notifyEngineInitialized(EngineInitStatus.STATUS_INIT_EXCEPTION, e);
    }
  }

  @Override
  public void destroyEngine() {
    if (mEngineContext == null) {
      return;
    }

    mEngineContext.destroyBridge(new Callback<Boolean>() {
      @Override
      public void callback(Boolean param, Throwable e) {
        UIThreadUtils.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            onDestroy();
          }
        });
      }
    });
  }

  protected void onDestroy() {
    mCurrentState = EngineState.DESTROYED;
    destroyInstance(rootView);

    if (mEngineContext != null) {
      mEngineContext.destroy();
    }

    if (moduleLoadParams != null && moduleLoadParams.nativeParams != null) {
      moduleLoadParams.nativeParams.clear();
      moduleLoadParams = null;
    }

    if (mGlobalConfigs != null) {
      mGlobalConfigs.destroyIfNeed();
    }

    moduleListener = null;
    rootView = null;
    mExtendDatas.clear();
    mEventListeners.clear();
  }

  @Override
  public void onFirstViewAdded() {
    if (moduleListener != null) {
      moduleListener.onFirstViewAdded();
    }
  }

  @Override
  public void updateDimension(boolean shouldRevise, HippyMap dimension,
      boolean shouldUseScreenDisplay, boolean systemUiVisibilityChanged) {
    if (shouldRevise && mEngineContext != null) {
      HippyDeviceAdapter deviceAdapter = mEngineContext.getGlobalConfigs().getDeviceAdapter();
      if (deviceAdapter != null) {
        deviceAdapter.reviseDimensionIfNeed(ContextHolder.getAppContext(), dimension, shouldUseScreenDisplay,
            systemUiVisibilityChanged);
      }
    }

    if (mEngineContext.getModuleManager() != null) {
      mEngineContext.getModuleManager().getJavaScriptModule(Dimensions.class).set(dimension);
    }
  }

  @Override
  public Object getImageLoaderAdapter() {
    return mEngineContext.getGlobalConfigs().getImageLoaderAdapter();
  }

  @Override
  public Object getFontScaleAdapter() {
    return mEngineContext.getGlobalConfigs().getFontScaleAdapter();
  }

  @Override
  public ThreadExecutor getJSEngineThreadExecutor() {
    return getThreadExecutor();
  }

  @Override
  public Object getCustomViewCreator() {
    if (moduleLoadParams != null && moduleLoadParams.nativeParams != null) {
      return moduleLoadParams.nativeParams.get(HippyCustomViewCreator.HIPPY_CUSTOM_VIEW_CREATOR);
    }

    return null;
  }

  @Override
  public String getBundlePath() {
    if (jsBundleLoader != null) {
      return jsBundleLoader.getPath();
    }

    return null;
  }

  @Override
  public void onSizeChanged(int w, int h, int oldw, int oldh) {
    if (mEngineContext == null) {
      return;
    }

    HippyModuleManager moduleManager = mEngineContext.getModuleManager();
    if (moduleManager != null) {
      HippyMap hippyMap = new HippyMap();
      hippyMap.pushDouble("width", PixelUtil.px2dp(w));
      hippyMap.pushDouble("height", PixelUtil.px2dp(h));
      hippyMap.pushDouble("oldWidth", PixelUtil.px2dp(oldw));
      hippyMap.pushDouble("oldHeight", PixelUtil.px2dp(oldh));
      moduleManager.getJavaScriptModule(EventDispatcher.class)
          .receiveNativeEvent("onSizeChanged", hippyMap);
    }
  }

  @Override
  public void dispatchUIComponentEvent(int id, String eventName, Object params) {
    if (mEngineContext.getModuleManager().getJavaScriptModule(EventDispatcher.class) != null) {
      mEngineContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
          .receiveUIComponentEvent(id, eventName, params);
    }
  }

  @Override
  public void dispatchNativeGestureEvent(HippyMap params) {
    if (mEngineContext.getModuleManager().getJavaScriptModule(EventDispatcher.class) != null) {
      mEngineContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
              .receiveNativeGesture(params);
    }
  }

  @Override
  public void handleNativeException(Exception exception, boolean haveCaught) {
    mGlobalConfigs.getExceptionHandler().handleNativeException(exception, haveCaught);
  }

  private void checkModuleLoadParams(ModuleLoadParams loadParams) {
    assert loadParams != null;
    if (loadParams == null) {
      throw new RuntimeException("Hippy: loadModule loadParams must no be null");
    }
    if (loadParams.context == null) {
      throw new RuntimeException("Hippy: loadModule loadParams.context must no be null");
    }
    if (!mDebugMode && TextUtils.isEmpty(loadParams.jsAssetsPath) && TextUtils
            .isEmpty(loadParams.jsFilePath)) {
      throw new RuntimeException(
              "Hippy: loadModule debugMode=true, loadParams.jsAssetsPath and jsFilePath both null!");
    }

    mEngineContext.setComponentName(loadParams.componentName);
    if (loadParams.jsParams == null) {
      loadParams.jsParams = new HippyMap();
    }
    if (loadParams.hippyContext != null) {
      loadParams.hippyContext.setModuleParams(loadParams);
    }
    if (!TextUtils.isEmpty(loadParams.jsAssetsPath)) {
      loadParams.jsParams.pushString("sourcePath", loadParams.jsAssetsPath);
    } else {
      loadParams.jsParams.pushString("sourcePath", loadParams.jsFilePath);
    }
  }

  @Override
  public ViewGroup loadModule(ModuleLoadParams loadParams) {
    return loadModule(loadParams, null);
  }

  @Override
  public ViewGroup loadModule(ModuleLoadParams loadParams, ModuleListener listener) {
    moduleListener = listener;
    this.moduleLoadParams = loadParams;

    checkModuleLoadParams(loadParams);

    if (loadParams.bundleLoader != null) {
      jsBundleLoader = loadParams.bundleLoader;
    } else {
      if (!TextUtils.isEmpty(loadParams.jsAssetsPath)) {
        jsBundleLoader = new HippyAssetBundleLoader(loadParams.context, loadParams.jsAssetsPath,
            !TextUtils.isEmpty(loadParams.codeCacheTag), loadParams.codeCacheTag);
      } else if (!TextUtils.isEmpty(loadParams.jsFilePath)) {
        jsBundleLoader = new HippyFileBundleLoader(loadParams.jsFilePath,
            !TextUtils.isEmpty(loadParams.codeCacheTag), loadParams.codeCacheTag);
      }
    }

    rootView = mEngineContext.createRootView(loadParams.context);

    if (mCurrentState == EngineState.DESTROYED) {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_ENGINE_UNINIT,
          "load module error wrong state, Engine destroyed");
      return null;
    }

    mDevSupportManager.attachToHost(loadParams.context);
    if (!mDevManagerInited && mDebugMode) {
      mDevManagerInited = true;
    }

    LogUtils.d(TAG, "internalLoadInstance start...");
    if (mCurrentState == EngineState.INITED) {
      internalLoadInstance(loadParams);
    } else {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_ENGINE_UNINIT,
          "error wrong state, Engine state not INITED, state:" + mCurrentState);
    }

    return rootView;
  }

  @Override
  public void destroyModule(ViewGroup rootView) {
    assert rootView != null;
    if (rootView == null) {
      return;
    }

    if (mDevSupportManager != null) {
      Context context = rootView.getContext();
      if (context instanceof ContextWrapper) {
        mDevSupportManager.detachFromHost(((ContextWrapper)context).getBaseContext());
      }
    }

    if (mEngineContext != null) {
      if (mEngineContext.getBridgeManager() != null) {
        mEngineContext.getBridgeManager().destroyInstance(rootView.getId());
      }
      mEngineContext.onInstanceDestroy();
    }
  }

  @Deprecated
  public HippyEngineContextImpl getCurrentEngineContext() {
    return getEngineContext();
  }

  public HippyEngineContextImpl getEngineContext() {
    return mEngineContext;
  }

  @Override
  public void onEngineResume() {
    if (mEngineContext.mEngineLifecycleEventListeners != null) {
      Iterator<HippyEngineLifecycleEventListener> iterator = mEngineContext.mEngineLifecycleEventListeners
              .iterator();
      HippyEngineLifecycleEventListener listener;
      while (iterator.hasNext()) {
        listener = iterator.next();
        listener.onEnginePause();
      }
    }

    mEngineContext.onInstancePause();
  }

  @Override
  public void onEnginePause() {
    if (mEngineContext.mEngineLifecycleEventListeners != null) {
      Iterator<HippyEngineLifecycleEventListener> iterator = mEngineContext.mEngineLifecycleEventListeners
              .iterator();
      HippyEngineLifecycleEventListener listener;
      while (iterator.hasNext()) {
        listener = iterator.next();
        listener.onEngineResume();
      }
    }

    mEngineContext.onInstanceResume();
  }

  @Override
  public void sendEvent(String event, Object params, BridgeTransferType transferType) {
    if (mEngineContext != null && mEngineContext.getModuleManager() != null) {
      mEngineContext.getModuleManager().getJavaScriptModule(EventDispatcher.class)
          .receiveNativeEvent(event, params, transferType);
    }
  }

  @Override
  public void sendEvent(String event, Object params) {
    sendEvent(event, params, BridgeTransferType.BRIDGE_TRANSFER_TYPE_NORMAL);
  }

  @Override
  public void preloadModule(HippyBundleLoader loader) {
    if (mEngineContext != null && mEngineContext.getBridgeManager() != null) {
      mEngineContext.getBridgeManager().runBundle(-1, loader, null);
    }
  }

  @Override
  public boolean onBackPressed(BackPressHandler handler) {
    if (mEngineContext != null
        && mEngineContext.getModuleManager().getNativeModule(DeviceEventModule.class) != null) {
      return mEngineContext.getModuleManager().getNativeModule(DeviceEventModule.class)
          .onBackPressed(handler);
    } else {
      return false;
    }
  }

  @Override
  public boolean onBackPress(final DeviceEventModule.InvokeDefaultBackPress invokeImp) {
    BackPressHandler handler = new BackPressHandler() {
      @Override
      public void handleBackPress() {
        if (invokeImp != null) {
          invokeImp.callSuperOnBackPress();
        }
      }
    };
    return onBackPressed(handler);
  }

  @Override
  public boolean isDebugMode() {
    return mDebugMode;
  }

  private void notifyModuleLoaded(final ModuleLoadStatus statusCode, final String msg) {
    if (moduleListener != null) {
      if (UIThreadUtils.isOnUiThread()) {
        if (moduleListener != null) {
          moduleListener.onLoadCompleted(statusCode, msg);
        }
      } else {
        UIThreadUtils.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            if (moduleListener != null) {
              moduleListener.onLoadCompleted(statusCode, msg);
            }
          }
        });
      }
    }
  }

  void notifyEngineInitialized(EngineInitStatus statusCode, Throwable e) {
    mHandler.removeMessages(MSG_ENGINE_INIT_TIMEOUT);
    if (mPreloadBundleLoader != null) {
      LogUtils.d(TAG, "preload bundle loader");
      preloadModule(mPreloadBundleLoader);
    }

    if (UIThreadUtils.isOnUiThread()) {
      mStartTimeMonitor.end();
      reportEngineLoadResult(
          mCurrentState == EngineState.INITED ? HippyEngineMonitorAdapter.ENGINE_LOAD_RESULT_SUCCESS
              : HippyEngineMonitorAdapter.ENGINE_LOAD_RESULT_ERROR, e);
      for (EngineListener listener : mEventListeners) {
        listener.onInitialized(statusCode, e == null ? null : e.toString());
      }
      mEventListeners.clear();
    } else {
      final EngineInitStatus code = statusCode;
      final Throwable error = e;
      UIThreadUtils.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          if (mCurrentState != EngineState.DESTROYED) {
            mStartTimeMonitor.end();
            reportEngineLoadResult(mCurrentState == EngineState.INITED
                ? HippyEngineMonitorAdapter.ENGINE_LOAD_RESULT_SUCCESS
                : HippyEngineMonitorAdapter.ENGINE_LOAD_RESULT_ERROR, error);
          }

          for (EngineListener listener : mEventListeners) {
            listener.onInitialized(code, error == null ? null : error.toString());
          }
          mEventListeners.clear();
        }
      });
    }
  }

  private void reportEngineLoadResult(int code, Throwable e) {
    mHandler.removeMessages(MSG_ENGINE_INIT_TIMEOUT);
    if (!mDebugMode && !mHasReportEngineLoadResult) {
      mHasReportEngineLoadResult = true;
      mGlobalConfigs.getEngineMonitorAdapter()
          .reportEngineLoadResult(code, mStartTimeMonitor.getTotalTime(),
              mStartTimeMonitor.getEvents(), e);
    }
  }

  private synchronized void restartEngineInBackground() {
    if (mCurrentState == EngineState.DESTROYED) {
      String errorMsg =
          "restartEngineInBackground... error STATUS_WRONG_STATE, state=" + mCurrentState;
      LogUtils.e(TAG, errorMsg);
      notifyEngineInitialized(EngineInitStatus.STATUS_WRONG_STATE, new Throwable(errorMsg));
      return;
    }

    if (mCurrentState != EngineState.INITING) {
      mCurrentState = EngineState.ONRESTART;
    }

    if (mEngineContext != null) {
      mEngineContext.destroy();
    }

    try {
      mEngineContext = new HippyEngineContextImpl();
    } catch (Exception e) {
      e.printStackTrace();
      notifyEngineInitialized(EngineInitStatus.STATUS_INIT_EXCEPTION, new Throwable(e.getMessage()));
      return;
    }

    mEngineContext.getBridgeManager().initBridge(new Callback<Boolean>() {
      @Override
      public void callback(Boolean param, Throwable e) {
        if (mCurrentState != EngineState.INITING && mCurrentState != EngineState.ONRESTART) {
          LogUtils.e(TAG, "initBridge callback error STATUS_WRONG_STATE, state=" + mCurrentState);
          notifyEngineInitialized(EngineInitStatus.STATUS_WRONG_STATE, e);
          return;
        }

        if (mCurrentState == EngineState.ONRESTART) {
          if (rootView == null) {
            String errorMsg =
                "initBridge callback error rootView is null, state=" + mCurrentState;
            notifyEngineInitialized(EngineInitStatus.STATUS_WRONG_STATE, new Throwable(errorMsg));
            return;
          }
          internalLoadInstance(moduleLoadParams);
        }

        EngineState state = mCurrentState;
        mCurrentState = param ? EngineState.INITED : EngineState.INITERRORED;
        if (state != EngineState.ONRESTART) {
          notifyEngineInitialized(
              param ? EngineInitStatus.STATUS_OK : EngineInitStatus.STATUS_ERR_BRIDGE, e);
        } else {
          LogUtils.e(TAG, "initBridge callback error STATUS_WRONG_STATE, state=" + mCurrentState);
          notifyEngineInitialized(EngineInitStatus.STATUS_WRONG_STATE, e);
        }
      }
    });
  }

  private void internalLoadInstance(ModuleLoadParams loadParams) {
    if (mEngineContext == null || rootView == null) {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL,
          "load module error. mEngineContext=" + mEngineContext + ", rootView=" + rootView);
      return;
    }

    int rootId = rootView.getId();
    mEngineContext.onInstanceLoad();

    HippyMap launchParams = loadParams.jsParams;
    if (!mDebugMode) {
      if (jsBundleLoader != null) {
        mEngineContext.getBridgeManager()
            .runBundle(rootId, jsBundleLoader, moduleListener);
      } else {
        notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL, "load module error. loader==null");
        return;
      }
    }
    LogUtils.d(TAG, "in internalLoadInstance before loadInstance");
    mEngineContext.getBridgeManager()
        .loadInstance(loadParams.componentName, rootId, launchParams);
    if (mDebugMode) {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_OK, null);
    }
  }

  @Override
  public void onDevBundleLoadReady(InputStream inputStream) {

  }

  @Override
  public void onDevBundleReLoad() {
    mEngineContext.destroyBridge(new Callback<Boolean>() {
      @Override
      public void callback(Boolean param, Throwable e) {
        UIThreadUtils.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            restartEngineInBackground();
          }
        });
      }
    });
  }

  @Override
  public void onInitDevError(Throwable e) {
    mCurrentState = EngineState.INITED;
    mDevManagerInited = false;
    notifyEngineInitialized(EngineInitStatus.STATUS_ERR_DEVSERVER, e);
  }

  public abstract ThreadExecutor getThreadExecutor();

  public abstract int getBridgeType();

  @Override
  public void handleThreadUncaughtException(Thread t, Throwable e, Integer groupId) {
    if (mDebugMode && mDevSupportManager != null) {
      mDevSupportManager.handleException(e);
    } else {
      mGlobalConfigs.getExceptionHandler().handleNativeException(new RuntimeException(e), false);
    }
  }

  @Deprecated
  public ViewGroup loadInstance(HippyRootViewParams params) {
    return loadInstance(params, null);
  }

  @Deprecated
  public ViewGroup loadInstance(HippyRootViewParams params, ModuleListener listener) {
    ModuleLoadParams loadParams = new ModuleLoadParams();
    loadParams.context = params.getActivity();
    loadParams.componentName = params.getName();
    // getBundleLoader可能为空，debugMode = false的时候
    HippyBundleLoader loader = params.getBundleLoader();
    if (loader instanceof HippyAssetBundleLoader) {
      loadParams.jsAssetsPath = params.getBundleLoader().getRawPath();
    } else if (loader instanceof HippyFileBundleLoader) {
      loadParams.jsFilePath = params.getBundleLoader().getRawPath();
    }
    loadParams.jsParams = params.getLaunchParams();
    loadParams.nativeParams = params.getNativeParams();
    loadParams.hippyContext = params.getInstanceContext();
    loadParams.bundleLoader = params.getBundleLoader();
    return loadModule(loadParams, listener);
  }

  public class HippyEngineContextImpl implements HippyEngineContext, HippyInstanceLifecycleEventListener {
    private String componentName;
    private final HippyModuleManager mModuleManager;
    private final HippyBridgeManager mBridgeManager;
    private INativeRendererProxy nativeRendererProxy;
    volatile CopyOnWriteArrayList<HippyEngineLifecycleEventListener> mEngineLifecycleEventListeners;

    public HippyEngineContextImpl()
        throws IllegalAccessException, InstantiationException, ClassNotFoundException {
      mModuleManager = new HippyModuleManagerImpl(this, mAPIProviders);
      mBridgeManager = new HippyBridgeManagerImpl(this, mCoreBundleLoader,
          getBridgeType(), enableV8Serialization, mDebugMode,
          mServerHost, mGroupId, mThirdPartyAdapter, v8InitParams);
      try {
        Class nativeRendererClass = Class.forName("com.tencent.renderer.NativeRenderer");
        nativeRendererProxy = (INativeRendererProxy)(nativeRendererClass.newInstance());
        List<Class<? extends HippyBaseController>> controllers = null;
        for (HippyAPIProvider hippyPackage : mAPIProviders) {
          if (controllers == null) {
            controllers = hippyPackage.getControllers();
          } else {
            controllers.addAll(hippyPackage.getControllers());
          }
        }

        nativeRendererProxy.init(getEngineId(), controllers, mDebugMode, rootView);
        nativeRendererProxy.setFrameworkProxy(HippyEngineManagerImpl.this);
      } catch (Exception e) {
        throw e;
      }
    }

    @Override
    public DomManager getDomManager() {
      if (nativeRendererProxy != null) {
        Object domManagerObj = nativeRendererProxy.getDomManagerObject();
        if (domManagerObj instanceof DomManager) {
          return (DomManager)domManagerObj;
        }
      }

      return null;
    }

    @Override
    public RenderManager getRenderManager() {
      if (nativeRendererProxy != null) {
        Object renderManagerObj = nativeRendererProxy.getRenderManagerObject();
        if (renderManagerObj instanceof RenderManager) {
          return (RenderManager)renderManagerObj;
        }
      }

      return null;
    }

    public void setComponentName(String componentName) {
      this.componentName = componentName;
    }

    public String getComponentName() {
      return componentName;
    }

    @Override
    public HippyGlobalConfigs getGlobalConfigs() {
      return mGlobalConfigs;
    }

    @Override
    public HippyModuleManager getModuleManager() {
      return mModuleManager;
    }

    @Override
    public DevSupportManager getDevSupportManager() {
      return mDevSupportManager;
    }

    @Override
    public ThreadExecutor getThreadExecutor() {
      return HippyEngineManagerImpl.this.getThreadExecutor();
    }

    @Override
    public HippyBridgeManager getBridgeManager() {
      return mBridgeManager;
    }

    @Override
    public void addEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener) {
      if (mEngineLifecycleEventListeners == null) {
        synchronized (HippyEngineContextImpl.class) {
          if (mEngineLifecycleEventListeners == null) {
            mEngineLifecycleEventListeners = new CopyOnWriteArrayList<>();
          }
        }
      }
      mEngineLifecycleEventListeners.add(listener);
    }

    @Override
    public void removeEngineLifecycleEventListener(HippyEngineLifecycleEventListener listener) {
      if (mEngineLifecycleEventListeners != null) {
        mEngineLifecycleEventListeners.remove(listener);
      }
    }

    @Override
    public void onInstanceLoad() {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.onInstanceLoad();
      }
    }

    @Override
    public void onInstanceResume() {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.onInstanceResume();
      }

      if (getBridgeManager() != null && rootView != null) {
        getBridgeManager().resumeInstance(rootView.getId());
      }
    }

    @Override
    public void onInstancePause() {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.onInstancePause();
      }

      if (getBridgeManager() != null && rootView != null) {
        getBridgeManager().pauseInstance(rootView.getId());
      }
    }

    @Override
    public void onInstanceDestroy() {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.onInstanceDestroy();
      }
    }

    @Override
    public void onRuntimeInitialized(long runtimeId) {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.onRuntimeInitialized(runtimeId);
      }
    }

    @Override
    public void handleException(Throwable throwable) {
      if (mDebugMode && mDevSupportManager != null) {
        mDevSupportManager.handleException(throwable);
      } else {
        if (throwable instanceof HippyJsException) {
          mGlobalConfigs.getExceptionHandler().handleJsException((HippyJsException) throwable);
          mEngineContext.getBridgeManager().notifyModuleJsException((HippyJsException) throwable);
        } else {
          mGlobalConfigs.getExceptionHandler()
              .handleNativeException(new RuntimeException(throwable), true);
        }
      }
    }

    @Override
    public int getEngineId() {
      return HippyEngineManagerImpl.this.getEngineId();
    }

    @Override
    public int getRootId() {
      return nativeRendererProxy.getRootId();
    }

    @Override
    public ViewGroup getRootView() {
      return rootView;
    }

    @Override
    public void createNode(int rootId, HippyArray hippyArray) {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.createNode(rootId, hippyArray);
      }
    }

    @Override
    public void updateNode(int rootId, HippyArray updateArray) {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.updateNode(rootId, updateArray);
      }
    }

    @Override
    public void deleteNode(int rootId, HippyArray deleteArray) {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.deleteNode(rootId, deleteArray);
      }
    }

    @Override
    public void callUIFunction(HippyArray hippyArray, Promise promise) {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.callUIFunction(hippyArray, promise);
      }
    }

    @Override
    public void measureInWindow(int id, Promise promise) {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.measureInWindow(id, promise);
      }
    }

    @Override
    public void startBatch() {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.startBatch();
      }
    }

    @Override
    public void endBatch() {
      if (nativeRendererProxy != null) {
        nativeRendererProxy.endBatch();
      }
    }

    public ViewGroup createRootView(Context context) {
      assert nativeRendererProxy != null;
      rootView = nativeRendererProxy.createRootView(context);
      return rootView;
    }

    public void destroyBridge(Callback<Boolean> callback) {
      mBridgeManager.destroyBridge(callback);
    }

    public void destroy() {
      if (mBridgeManager != null) {
        mBridgeManager.destroy();
      }
      if (mModuleManager != null) {
        mModuleManager.destroy();
      }
      if (nativeRendererProxy != null) {
        nativeRendererProxy.destroy();
      }
      if (mEngineLifecycleEventListeners != null) {
        mEngineLifecycleEventListeners.clear();
      }
    }
  }

}
