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
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.text.TextUtils;

import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.FrameLayout.LayoutParams;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorAdapter;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorEvent;
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
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.dom.node.DomNode;
import com.tencent.mtt.hippy.dom.node.DomNodeRecord;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.modules.HippyModuleManagerImpl;
import com.tencent.mtt.hippy.modules.javascriptmodules.EventDispatcher;
import com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.utils.TimeMonitor;
import com.tencent.mtt.hippy.utils.UIThreadUtils;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

@SuppressWarnings({"deprecation", "unused"})
public abstract class HippyEngineManagerImpl extends HippyEngineManager implements
    DevServerCallBack, HippyRootView.OnSizeChangedListener,
    HippyRootView.OnResumeAndPauseListener, ThreadExecutor.UncaughtExceptionHandler {

  static final String TAG = "HippyEngineManagerImpl";

  static final int MSG_ENGINE_INIT_TIMEOUT = 100;
  /**
   * All HippyCompoundView Instance collections,multi-thread read and write
   */
  final CopyOnWriteArrayList<HippyRootView> mInstances = new CopyOnWriteArrayList<>();
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
  // 从网络上加载jsbundle
  final boolean mDebugMode;
  // Hippy Server的jsbundle名字，调试模式下有效
  final String mServerBundleName;
  // Hippy Server的host，调试模式下有效
  private final String mServerHost;
  // Hippy Debug ws name as the componentName when you need differ engine to debug
  private final String mDebugComponentName;
  // Hippy Server url using remote debug in no usb，only take effect in debugMode = true
  private final String mRemoteServerUrl;

  final boolean enableV8Serialization;

  boolean mDevManagerInited = false;
  final TimeMonitor mStartTimeMonitor;
  boolean mHasReportEngineLoadResult = false;
  private final HippyThirdPartyAdapter mThirdPartyAdapter;
  private final V8InitParams v8InitParams;
  private Object mRestoreSyncObject = new Object();
  private boolean mRestoreSucceed = false;

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
    this.mDebugComponentName = params.debugComponentName;
    this.mRemoteServerUrl = params.remoteServerUrl;
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
          mServerBundleName, mRemoteServerUrl);
      mDevSupportManager.setDevCallback(this);

      if (mDebugMode) {
        mDevSupportManager.setDebugComponentName(mDebugComponentName);
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
    for (HippyRootView rootView : mInstances) {
      destroyInstance(rootView);
    }

    mEventListeners.clear();
    resetEngine();

    if (mGlobalConfigs != null) {
      mGlobalConfigs.destroyIfNeed();
    }
    mExtendDatas.clear();
  }

  @Override
  public HippyInstanceContext preCreateInstanceContext(Context context) {
    return new HippyInstanceContext(context);
  }

  @Override
  public HippyRootView loadModule(ModuleLoadParams loadParams) {
    return loadModule(loadParams, null, null);
  }

  @Override
  public HippyRootView loadModule(ModuleLoadParams loadParams, ModuleListener listener) {
    return loadModule(loadParams, listener, null);
  }

  @Override
  public HippyRootView loadModule(ModuleLoadParams loadParams, ModuleListener listener,
      HippyRootView.OnLoadCompleteListener onLoadCompleteListener) {
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
    if (mEngineContext != null) {
      mEngineContext.setComponentName(loadParams.componentName);
      mEngineContext.setNativeParams(loadParams.nativeParams);
    }
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
    mModuleListener = listener;

    HippyRootView view = new HippyRootView(loadParams);

    if (mCurrentState == EngineState.DESTROYED) {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_ENGINE_UNINIT,
          "load module error wrong state, Engine destroyed", view);
      return view;
    }
    if (onLoadCompleteListener != null) {
      view.setOnLoadCompleteListener(onLoadCompleteListener);
    }
    view.setTimeMonitor(new TimeMonitor(!mDebugMode));
    view.getTimeMonitor().begine();
    view.getTimeMonitor().startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_WAIT_ENGINE);
    view.setOnResumeAndPauseListener(this);
    view.setOnSizeChangedListener(this);
    view.attachEngineManager(this);
    mInstances.add(view);
    mDevSupportManager.attachToHost(view);
    if (!mDevManagerInited && mDebugMode) {
      mDevManagerInited = true;
    }

    LogUtils.d(TAG, "internalLoadInstance start...");
    if (mCurrentState == EngineState.INITED) {
      internalLoadInstance(view);
    } else {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_ENGINE_UNINIT,
          "error wrong state, Engine state not INITED, state:" + mCurrentState, view);
    }

    return view;
  }

  @Deprecated
  @Override
  public HippyRootView loadInstance(HippyRootViewParams params) {
    return loadInstance(params, null, null);
  }

  @Deprecated
  @Override
  public HippyRootView loadInstance(HippyRootViewParams params, ModuleListener listener) {
    return loadInstance(params, listener, null);
  }

  @Deprecated
  @Override
  public HippyRootView loadInstance(HippyRootViewParams params, ModuleListener listener,
      HippyRootView.OnLoadCompleteListener onLoadCompleteListener) {
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
    return loadModule(loadParams, listener, onLoadCompleteListener);
  }

  @Override
  public void destroyModule(HippyRootView moduleView) {
    if (moduleView == null || !mInstances.contains(moduleView)) {
      return;
    }
    moduleView.setOnResumeAndPauseListener(null);
    moduleView.setOnSizeChangedListener(null);
    if (mDevSupportManager != null) {
      mDevSupportManager.detachFromHost(moduleView);
    }

    if (mEngineContext != null && mEngineContext.getBridgeManager() != null) {
      mEngineContext.getBridgeManager().destroyInstance(moduleView.getId());
    }
    if (mEngineContext != null && mEngineContext.mInstanceLifecycleEventListeners != null) {
      for (HippyInstanceLifecycleEventListener hippyInstanceLifecycleEventListener : mEngineContext.mInstanceLifecycleEventListeners) {
        hippyInstanceLifecycleEventListener.onInstanceDestroy(moduleView.getId());
      }
    }
    moduleView.destroy();
    mInstances.remove(moduleView);
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
    if (mEngineContext != null && mEngineContext.mEngineLifecycleEventListeners != null) {
      for (HippyRootView rootView : mInstances) {
        rootView.onResume();
      }

      Iterator<HippyEngineLifecycleEventListener> iterator = mEngineContext.mEngineLifecycleEventListeners
          .iterator();
      HippyEngineLifecycleEventListener listener;
      while (iterator.hasNext()) {
        listener = iterator.next();
        if (listener instanceof DomManager) {
          continue;
        }
        listener.onEngineResume();
      }

      // dom要最后恢复执行，才能保证UI状态
      DomManager domManager = mEngineContext.getDomManager();
      if (domManager != null) {
        domManager.onEngineResume();
      }
    }
  }

  @Override
  public void onEnginePause() {
    if (mEngineContext != null && mEngineContext.mEngineLifecycleEventListeners != null) {
      for (HippyRootView rootView : mInstances) {
        rootView.onPause();
      }

      // dom要最先暂停执行，才能保证UI状态
      DomManager domManager = mEngineContext.getDomManager();
      if (domManager != null) {
        domManager.onEnginePause();
      }

      Iterator<HippyEngineLifecycleEventListener> iterator = mEngineContext.mEngineLifecycleEventListeners
          .iterator();
      HippyEngineLifecycleEventListener listener;
      while (iterator.hasNext()) {
        listener = iterator.next();
        if (listener instanceof DomManager) {
          continue;
        }
        listener.onEnginePause();
      }
    }
  }

  @Override
  public void onFontChanged(final int rootId) {
    final DomManager domManager = mEngineContext.getDomManager();
    getThreadExecutor().postOnDomThread(new Runnable() {
      @Override
      public void run() {
        domManager.onFontChanged(rootId);
      }
    });
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
      mEngineContext.getBridgeManager().runBundle(-1, loader, null, null);
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

  private void addNodeRecordOfChild(ArrayList<DomNodeRecord> recordList, DomNode parent, int index, int rootId) {
    int count = parent.getChildCount();
    for (int i = 0; i < count; i++) {
      DomNode child = parent.getChildAt(i);
      if (child == null) {
        continue;
      }
      DomNodeRecord record = new DomNodeRecord();
      record.rootId = rootId;
      record.id = child.getId();
      record.index = i;
      record.pid = parent.getId();
      record.className = child.getViewClass();
      record.props = child.getTotalProps();
      recordList.add(record);
      addNodeRecordOfChild(recordList, child, i, rootId);
    }
  }

  public void saveInstanceState() {
    saveInstanceState(null);
  }

  public void saveInstanceState(final Object params) {
    final DomManager domManager = mEngineContext.getDomManager();
    if (mEngineContext == null || domManager == null || mThirdPartyAdapter == null) {
      return;
    }

    getThreadExecutor().postOnDomThread(new Runnable() {
      @Override
      public void run() {
        int rootId = domManager.getRootNodeId();
        DomNode rootNode = domManager.getNode(rootId);
        if (rootNode == null) {
          LogUtils.e(TAG, "saveInstanceState root node is null!");
          return;
        }
        ArrayList<DomNodeRecord> recordList = new ArrayList<>();
        DomNodeRecord rootRecord = new DomNodeRecord();
        rootRecord.rootId = rootNode.getId();
        rootRecord.id = rootNode.getId();
        rootRecord.className = rootNode.getViewClass();
        rootRecord.props = new HippyMap();
        rootRecord.props.pushInt(NodeProps.WIDTH, Math.round(rootNode.getStyleWidth()));
        rootRecord.props.pushInt(NodeProps.HEIGHT, Math.round(rootNode.getStyleHeight()));
        recordList.add(rootRecord);
        int count = rootNode.getChildCount();
        for (int i = 0; i < count; i++) {
          DomNode child = rootNode.getChildAt(i);
          if (child == null) {
            continue;
          }
          DomNodeRecord record = new DomNodeRecord();
          record.rootId = rootId;
          record.id = child.getId();
          record.index = i;
          record.pid = rootId;
          record.className = child.getViewClass();
          record.props = child.getTotalProps();
          recordList.add(record);
          addNodeRecordOfChild(recordList, child, i, rootId);
        }
        mThirdPartyAdapter.saveInstanceState(recordList, params);
      }
    });
  }

  @Nullable
  public HippyRootView restoreInstanceState(final ArrayList<DomNodeRecord> domNodeRecordList,
          HippyEngine.ModuleLoadParams loadParams, final boolean isSync) {
    if (domNodeRecordList == null || domNodeRecordList.isEmpty() || mEngineContext == null) {
      return null;
    }
    mRestoreSucceed = false;
    final long start = System.currentTimeMillis();
    final DomManager domManager = mEngineContext.getDomManager();
    final RenderManager renderManager = mEngineContext.getRenderManager();
    final HippyInstanceContext context = new HippyInstanceContext(loadParams.context, loadParams);
    context.setEngineContext(mEngineContext);
    final HippyRootView tempRootView = new HippyRootView(context, loadParams);
    tempRootView.setOnSizeChangedListener(this);
    final int tempRootId = tempRootView.getId();
    renderManager.getControllerManager().addFakeRootView(tempRootView);

    getThreadExecutor().postOnDomThread(new Runnable() {
      @Override
      public void run() {
        try {
          domManager.renderBatchStart();
          for (int i = 0; i < domNodeRecordList.size(); i++) {
            DomNodeRecord domNodeRecord = domNodeRecordList.get(i);
            if (domNodeRecord == null || domNodeRecord.id < 0) {
              continue;
            }
            if (i == 0) {
              int width = 0;
              int height = 0;
              if (domNodeRecord.className.equals(NodeProps.ROOT_NODE) && domNodeRecord.props != null) {
                width = domNodeRecord.props.getInt(NodeProps.WIDTH);
                height = domNodeRecord.props.getInt(NodeProps.HEIGHT);
              }
              domManager.createFakeRootNode(tempRootId, width, height);
              if (domNodeRecord.className.equals(NodeProps.ROOT_NODE)) {
                continue;
              }
            }
            int pid = domNodeRecord.pid;
            if (pid % 10 == 0) {
              pid = tempRootId;
            } else {
              pid = 0 - pid;
            }
            int id = 0 - domNodeRecord.id;
            domManager.createNode(tempRootView, tempRootId, id, pid, domNodeRecord.index,
                    domNodeRecord.className, domNodeRecord.tagName, domNodeRecord.props);
          }
          domManager.screenshotBatchEnd(isSync);
          if (isSync) {
            synchronized (mRestoreSyncObject) {
              mRestoreSucceed = true;
              mRestoreSyncObject.notify();
            }
          }
        } catch (Exception e) {
          LogUtils.w("restoreInstanceState", "dom restore exception: " + e.getMessage());
          domManager.screenshotBatchStop(isSync);
          if (isSync) {
            synchronized (mRestoreSyncObject) {
              mRestoreSyncObject.notify();
            }
          }
        }
      }
    });
    if (isSync) {
      try {
        synchronized (mRestoreSyncObject) {
          mRestoreSyncObject.wait();
          LogUtils.d("restoreInstanceState", "dom batch end: " + (System.currentTimeMillis() - start));
          if (!mRestoreSucceed) {
            LogUtils.w("restoreInstanceState", "restore dom node failed!!");
            destroyInstanceState(tempRootView);
            return null;
          }
        }
        domManager.flushPendingBatches();
        LogUtils.d("restoreInstanceState", "render batch end: " + (System.currentTimeMillis() - start));
      } catch (Exception e) {
        LogUtils.w("restoreInstanceState", "render restore exception: " + e.getMessage());
        destroyInstanceState(tempRootView);
        return null;
      }
    }
    return tempRootView;
  }

  public void destroyInstanceState(HippyRootView rootView) {
    if (rootView == null || mEngineContext == null) {
      return;
    }

    rootView.setOnSizeChangedListener(null);
    final int rootId = rootView.getId();
    final DomManager domManager = mEngineContext.getDomManager();
    getThreadExecutor().postOnDomThread(new Runnable() {
      @Override
      public void run() {
        domManager.deleteNode(rootId);
      }
    });

    if (mInstances.contains(rootView)) {
      mInstances.remove(rootView);
    }
  }

  public void runScript(@NonNull String script) {
    if (mEngineContext != null) {
      mEngineContext.runScript(script);
    }
  }

  private void notifyModuleLoaded(final ModuleLoadStatus statusCode, final String msg,
      final HippyRootView hippyRootView) {
    if (mModuleListener != null) {
      if (UIThreadUtils.isOnUiThread()) {
        if (mModuleListener != null) {
          mModuleListener.onLoadCompleted(statusCode, msg, hippyRootView);
          mModuleListener = null;
        }
      } else {
        UIThreadUtils.runOnUiThread(new Runnable() {
          @Override
          public void run() {
            if (mModuleListener != null) {
              mModuleListener.onLoadCompleted(statusCode, msg, hippyRootView);
              mModuleListener = null;
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
    mStartTimeMonitor.begine();
    mStartTimeMonitor.startEvent(HippyEngineMonitorEvent.ENGINE_LOAD_EVENT_INIT_INSTANCE);
    if (mCurrentState != EngineState.INITING) {
      mCurrentState = EngineState.ONRESTART;
    }
    resetEngine();

    mEngineContext = new HippyEngineContextImpl(mDebugMode, mServerHost);
    mEngineContext.getBridgeManager().initBridge(new Callback<Boolean>() {
      @Override
      public void callback(Boolean param, Throwable e) {
        if (mCurrentState != EngineState.INITING && mCurrentState != EngineState.ONRESTART) {
          LogUtils.e(TAG, "initBridge callback error STATUS_WRONG_STATE, state=" + mCurrentState);
          notifyEngineInitialized(EngineInitStatus.STATUS_WRONG_STATE, e);
          return;
        }
        mStartTimeMonitor
            .startEvent(HippyEngineMonitorEvent.ENGINE_LOAD_EVENT_NOTIFY_ENGINE_INITED);
        for (HippyRootView rootView : mInstances) {
          internalLoadInstance(rootView);
        }

        EngineState state = mCurrentState;
        mCurrentState = param ? EngineState.INITED : EngineState.INITERRORED;
        if (state != EngineState.ONRESTART) {
          notifyEngineInitialized(
              param ? EngineInitStatus.STATUS_OK : EngineInitStatus.STATUS_ERR_BRIDGE, e);
        } else {
          LogUtils.e(TAG, "initBridge callback error STATUS_WRONG_STATE, state=" + mCurrentState);
          notifyEngineInitialized(EngineInitStatus.STATUS_WRONG_STATE, e);
          mStartTimeMonitor.end();
        }
      }
    });
  }

  private void resetEngine() {
    if (mEngineContext != null) {
      mEngineContext.destroy();
    }
  }

  private void internalLoadInstance(HippyRootView instance) {
    if (mEngineContext == null || instance == null) {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL,
          "load module error. mEngineContext=" + mEngineContext + ", HippyRootView instance="
              + instance, instance);
      return;
    }
    LogUtils.d(TAG, "in internalLoadInstance");
    if (mEngineContext.mInstanceLifecycleEventListeners != null) {
      for (HippyInstanceLifecycleEventListener listener : mEngineContext.mInstanceLifecycleEventListeners) {
        listener.onInstanceLoad(instance.getId());
      }
    }
    instance.attachToEngine(mEngineContext);
    HippyMap launchParams = instance.getLaunchParams();
    HippyBundleLoader loader = ((HippyInstanceContext) instance.getContext()).getBundleLoader();

    if (!mDebugMode) {
      if (loader != null) {
        if (instance.getTimeMonitor() != null) {
          instance.getTimeMonitor()
                  .startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_WAIT_LOAD_BUNDLE);
        }
        mEngineContext.getBridgeManager()
            .runBundle(instance.getId(), loader, mModuleListener, instance);
      } else {
        notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL, "load module error. loader==null",
            instance);
        return;
      }
    }
    LogUtils.d(TAG, "in internalLoadInstance before loadInstance");
    mEngineContext.getBridgeManager()
        .loadInstance(instance.getName(), instance.getId(), launchParams);
    if (mDebugMode) {
      notifyModuleLoaded(ModuleLoadStatus.STATUS_OK, null, instance);
    }
  }

  @Override
  public void onInstanceResume(int id) {
    if (mEngineContext == null) {
      return;
    }
    if (mEngineContext.mInstanceLifecycleEventListeners != null) {
      for (HippyInstanceLifecycleEventListener hippyInstanceLifecycleEventListener : mEngineContext.mInstanceLifecycleEventListeners) {
        hippyInstanceLifecycleEventListener.onInstanceResume(id);
      }
    }

    if (mEngineContext.getBridgeManager() != null) {
      mEngineContext.getBridgeManager().resumeInstance(id);
    }
  }

  @Override
  public void onInstancePause(int id) {
    if (mEngineContext == null) {
      return;
    }
    if (mEngineContext.mInstanceLifecycleEventListeners != null) {
      for (HippyInstanceLifecycleEventListener hippyInstanceLifecycleEventListener : mEngineContext.mInstanceLifecycleEventListeners) {
        hippyInstanceLifecycleEventListener.onInstancePause(id);
      }
    }

    if (mEngineContext.getBridgeManager() != null) {
      mEngineContext.getBridgeManager().pauseInstance(id);
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

  @Override
  public void onSizeChanged(final HippyRootView rootView, final int width, final int height,
      int oldWidth, int oldHeight) {
    getThreadExecutor().postOnDomThread(new Runnable() {
      @Override
      public void run() {
        if (mEngineContext != null && mEngineContext.getDomManager() != null) {
          mEngineContext.getDomManager().updateNodeSize(rootView.getId(), width, height);
        }
      }
    });
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

  public class HippyEngineContextImpl implements HippyEngineContext {

    /**
     * UI Manager
     */
    final RenderManager mRenderManager;

    volatile CopyOnWriteArrayList<HippyEngineLifecycleEventListener> mEngineLifecycleEventListeners;

    /**
     * All HippyCompoundView Instance Status Listener collections,multi-thread read and write
     */
    volatile CopyOnWriteArrayList<HippyInstanceLifecycleEventListener> mInstanceLifecycleEventListeners;

    /**
     * Module Manager
     */
    private final HippyModuleManager mModuleManager;
    /**
     * Bridge Manager
     */
    private final HippyBridgeManager mBridgeManager;
    /**
     * Dom Manager
     */
    private final DomManager mDomManager;

    private String mComponentName;
    private Map<String, Object> mNativeParams;

    public HippyEngineContextImpl(boolean isDevModule, String debugServerHost) {
      mModuleManager = new HippyModuleManagerImpl(this, mAPIProviders);
      mBridgeManager = new HippyBridgeManagerImpl(this, mCoreBundleLoader,
          HippyEngineManagerImpl.this.getBridgeType(), enableV8Serialization,
          isDevModule, debugServerHost, mGroupId, mThirdPartyAdapter, v8InitParams);
      mRenderManager = new RenderManager(this, mAPIProviders);
      mDomManager = new DomManager(this);
    }

    public void setComponentName(String componentName) {
      mComponentName = componentName;
    }

    public void setNativeParams(Map<String, Object> nativeParams) {
      mNativeParams = nativeParams;
    }

    @Override
    @Nullable
    public Map<String, Object> getNativeParams() {
      return mNativeParams;
    }

    @Override
    public String getComponentName() {
      return mComponentName;
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
    public DomManager getDomManager() {
      return mDomManager;
    }

    @Override
    public RenderManager getRenderManager() {
      return mRenderManager;
    }

    @Override
    public HippyRootView getInstance(int id) {
      for (HippyRootView rootView : mInstances) {
        if (rootView.getId() == id) {
          return rootView;
        }
      }
      return null;
    }

    @Override
    public void addInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
      if (mInstanceLifecycleEventListeners == null) {
        synchronized (HippyEngineContextImpl.class) {
          if (mInstanceLifecycleEventListeners == null) {
            mInstanceLifecycleEventListeners = new CopyOnWriteArrayList<>();
          }
        }
      }
      mInstanceLifecycleEventListeners.add(listener);
    }

    @Override
    public void removeInstanceLifecycleEventListener(HippyInstanceLifecycleEventListener listener) {
      if (mInstanceLifecycleEventListeners != null) {
        mInstanceLifecycleEventListeners.remove(listener);
      }
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
    public TimeMonitor getStartTimeMonitor() {
      return HippyEngineManagerImpl.this.mStartTimeMonitor;
    }

    @Override
    public int getEngineId() {
      return HippyEngineManagerImpl.this.getId();
    }

    @Override
    public void addApiProviders(List<HippyAPIProvider> apiProviders) {
      mModuleManager.addModules(apiProviders);
      mRenderManager.getControllerManager().addControllers(apiProviders);
    }

    public void destroyBridge(Callback<Boolean> callback) {
      mBridgeManager.destroyBridge(callback);
    }

    void runScript(@NonNull String script) {
      mBridgeManager.runScript(script);
    }

    public void destroy() {
      if (mBridgeManager != null) {
        mBridgeManager.destroy();
      }
      if (mModuleManager != null) {
        mModuleManager.destroy();
      }
      if (mDomManager != null) {
        mDomManager.destroy();
      }
      if (mRenderManager != null) {
        mRenderManager.destroy();
      }
      if (mInstanceLifecycleEventListeners != null) {
        mInstanceLifecycleEventListeners.clear();
      }
      if (mEngineLifecycleEventListeners != null) {
        mEngineLifecycleEventListeners.clear();
      }
      if (mNativeParams != null) {
        mNativeParams.clear();
      }
    }
  }
}
