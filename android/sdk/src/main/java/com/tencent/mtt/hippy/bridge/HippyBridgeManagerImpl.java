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

import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyEngine.BridgeTransferType;
import com.tencent.mtt.hippy.HippyEngine.ModuleLoadStatus;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.monitor.HippyEngineMonitorEvent;
import com.tencent.mtt.hippy.adapter.thirdparty.HippyThirdPartyAdapter;
import com.tencent.mtt.hippy.bridge.bundleloader.HippyBundleLoader;
import com.tencent.mtt.hippy.common.Callback;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.HippyModuleManager;
import com.tencent.mtt.hippy.serialization.compatible.Serializer;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeDirectWriter;
import com.tencent.mtt.hippy.serialization.nio.writer.SafeHeapWriter;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.DimensionsUtil;
import com.tencent.mtt.hippy.utils.UIThreadUtils;

import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import org.json.JSONObject;

@SuppressWarnings({"unused", "deprecation"})
public class HippyBridgeManagerImpl implements HippyBridgeManager, HippyBridge.BridgeCallback,
    Handler.Callback {

  static final int MSG_CODE_INIT_BRIDGE = 10;
  static final int MSG_CODE_RUN_BUNDLE = 11;
  static final int MSG_CODE_CALL_FUNCTION = 12;
  static final int MSG_CODE_DESTROY_BRIDGE = 13;

  static final int FUNCTION_ACTION_LOAD_INSTANCE = 1;
  static final int FUNCTION_ACTION_RESUME_INSTANCE = 2;
  static final int FUNCTION_ACTION_PAUSE_INSTANCE = 3;
  static final int FUNCTION_ACTION_DESTROY_INSTANCE = 4;
  static final int FUNCTION_ACTION_CALLBACK = 5;
  static final int FUNCTION_ACTION_CALL_JSMODULE = 6;

  public static final int BRIDGE_TYPE_SINGLE_THREAD = 2;
  public static final int BRIDGE_TYPE_NORMAL = 1;

  final HippyEngineContext mContext;
  final HippyBundleLoader mCoreBundleLoader;
  HippyBridge mHippyBridge;
  volatile boolean mIsInit = false;
  Handler mHandler;
  final int mBridgeType;
  final boolean enableV8Serialization;
  ArrayList<String> mLoadedBundleInfo = null;
  private final boolean mIsDevModule;
  private final String mDebugServerHost;
  private final int mGroupId;
  private final HippyThirdPartyAdapter mThirdPartyAdapter;
  private StringBuilder mStringBuilder;
  private SafeHeapWriter safeHeapWriter;
  private SafeDirectWriter safeDirectWriter;
  private Serializer serializer;

  HippyEngine.ModuleListener mLoadModuleListener;

  public HippyBridgeManagerImpl(HippyEngineContext context, HippyBundleLoader coreBundleLoader,
      int bridgeType,
      boolean enableV8Serialization, boolean isDevModule, String debugServerHost, int groupId,
      HippyThirdPartyAdapter thirdPartyAdapter) {
    mContext = context;
    mCoreBundleLoader = coreBundleLoader;
    mBridgeType = bridgeType;
    mIsDevModule = isDevModule;
    mDebugServerHost = debugServerHost;
    mGroupId = groupId;
    mThirdPartyAdapter = thirdPartyAdapter;
    this.enableV8Serialization = enableV8Serialization;

    if (enableV8Serialization) {
      serializer = new Serializer();
    } else {
      mStringBuilder = new StringBuilder(1024);
    }
  }

  private void handleCallFunction(Message msg) {
    String action = null;
    int instanceId = 0;
    switch (msg.arg2) {
      case FUNCTION_ACTION_LOAD_INSTANCE: {
        if (msg.obj instanceof HippyMap) {
          instanceId = ((HippyMap)msg.obj).getInt("id");
          HippyRootView rootView = mContext.getInstance(instanceId);
          if (rootView != null) {
            rootView.startMonitorEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_RUN_BUNDLE);
          }
        }
        action = "loadInstance";
        break;
      }
      case FUNCTION_ACTION_RESUME_INSTANCE: {
        action = "resumeInstance";
        break;
      }
      case FUNCTION_ACTION_PAUSE_INSTANCE: {
        action = "pauseInstance";
        break;
      }
      case FUNCTION_ACTION_DESTROY_INSTANCE: {
        action = "destroyInstance";
        break;
      }
      case FUNCTION_ACTION_CALLBACK: {
        action = "callBack";
        break;
      }
      case FUNCTION_ACTION_CALL_JSMODULE: {
        action = "callJsModule";
        break;
      }
    }

    final int actinCode = msg.arg2;
    final int rootViewId = instanceId;
    NativeCallback callback = new NativeCallback(mHandler) {
      @Override
      public void Call(long result, Message message, String action, String reason) {
        if (result != 0) {
          String info = "CallFunction error: actinCode=" + actinCode
              + ", result=" + result + ", reason=" + reason;
          reportException(new Throwable(info));
        } else if (actinCode == FUNCTION_ACTION_LOAD_INSTANCE) {
          HippyRootView rootView = mContext.getInstance(rootViewId);
          if (rootView != null) {
            rootView.startMonitorEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_CREATE_VIEW);
          }
        }
      }
    };

    if (msg.arg1 == BridgeTransferType.BRIDGE_TRANSFER_TYPE_NIO.value()) {
      ByteBuffer buffer;
      if (enableV8Serialization) {
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
        byte[] bytes = new byte[0];
        bytes = ArgumentUtils.objectToJsonOpt((HippyMap) msg.obj, mStringBuilder).getBytes(
            StandardCharsets.UTF_16LE);
        buffer = ByteBuffer.allocateDirect(bytes.length);
        buffer.put(bytes);
      }

      mHippyBridge.callFunction(action, callback, buffer);
    } else {
      if (enableV8Serialization) {
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
        mHippyBridge.callFunction(action, callback, buffer.array(), offset, length);
      } else {
        mStringBuilder.setLength(0);
        byte[] bytes = new byte[0];
        bytes = ArgumentUtils.objectToJsonOpt((HippyMap) msg.obj, mStringBuilder).getBytes(
            StandardCharsets.UTF_16LE);
        mHippyBridge.callFunction(action, callback, bytes);
      }
    }
  }

  private void handleDestroyBridge(Message msg) {
    if (mThirdPartyAdapter != null) {
      mThirdPartyAdapter.onRuntimeDestroy();
    }

    @SuppressWarnings("unchecked") final com.tencent.mtt.hippy.common.Callback<Boolean> destroyCallback = (com.tencent.mtt.hippy.common.Callback<Boolean>) msg.obj;
    mHippyBridge.destroy(new NativeCallback(mHandler) {
      @Override
      public void Call(long result, Message message, String action, String reason) {
        boolean success = result == 0;
        mHippyBridge.onDestroy();
        if (destroyCallback != null) {
          RuntimeException exception = null;
          if (!success) {
            exception = new RuntimeException("destroy error: result=" + result + ", reason=" + reason);
          }

          destroyCallback.callback(success, exception);
        }
      }
    });
  }

  @Override
  public boolean handleMessage(@SuppressWarnings("NullableProblems") Message msg) {
    try {
      switch (msg.what) {
        case MSG_CODE_INIT_BRIDGE: {
          mContext.getStartTimeMonitor()
              .startEvent(HippyEngineMonitorEvent.ENGINE_LOAD_EVENT_INIT_BRIDGE);
          @SuppressWarnings("unchecked") final com.tencent.mtt.hippy.common.Callback<Boolean> callback = (com.tencent.mtt.hippy.common.Callback<Boolean>) msg.obj;
          try {
            mHippyBridge = new HippyBridgeImpl(mContext, HippyBridgeManagerImpl.this,
                mBridgeType == BRIDGE_TYPE_SINGLE_THREAD, enableV8Serialization, this.mIsDevModule,
                this.mDebugServerHost);

            mHippyBridge.initJSBridge(getGlobalConfigs(), new NativeCallback(mHandler) {
              @Override
              public void Call(long result, Message message, String action, String reason) {
                if (result != 0) {
                  String info = "initJSBridge error: result=" + result + ", reason=" + reason;
                  reportException(new Throwable(info));
                }

                if (mThirdPartyAdapter != null) {
                  mThirdPartyAdapter.onRuntimeInit(mHippyBridge.getV8RuntimeId());
                }
                mContext.getStartTimeMonitor()
                    .startEvent(HippyEngineMonitorEvent.ENGINE_LOAD_EVENT_LOAD_COMMONJS);

                if (mCoreBundleLoader != null) {
                  mCoreBundleLoader.load(mHippyBridge, new NativeCallback(mHandler) {
                    @Override
                    public void Call(long result, Message message, String action, String reason) {
                      mIsInit = result == 0;
                      RuntimeException exception = null;
                      if (!mIsInit) {
                        exception = new RuntimeException(
                            "load coreJsBundle failed, check your core jsBundle:" + reason);
                      }
                      callback.callback(mIsInit, exception);
                    }
                  });
                } else {
                  mIsInit = true;
                  callback.callback(mIsInit, null);
                }
              }
            }, mGroupId);
          } catch (Throwable e) {
            mIsInit = false;
            callback.callback(false, e);
          }
          return true;
        }
        case MSG_CODE_RUN_BUNDLE: {
          HippyRootView rootView = null;
          if (msg.arg2 > 0) {
            rootView = mContext.getInstance(msg.arg2);
            if (rootView != null && rootView.getTimeMonitor() != null) {
              rootView.getTimeMonitor()
                  .startEvent(HippyEngineMonitorEvent.MODULE_LOAD_EVENT_LOAD_BUNDLE);
            }
          }
          HippyBundleLoader loader = (HippyBundleLoader) msg.obj;

          if (!mIsInit) {
            notifyModuleLoaded(ModuleLoadStatus.STATUS_ENGINE_UNINIT,
                "load module error. HippyBridge mIsInit:" + mIsInit, null);
            return true;
          }
          if (loader == null) {
            notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL,
                "load module error. loader:" + null, null);
            return true;
          }

          final String bundleUniKey = loader.getBundleUniKey();
          final HippyRootView localRootView = rootView;

          if (mLoadedBundleInfo != null && !TextUtils.isEmpty(bundleUniKey) && mLoadedBundleInfo
              .contains(bundleUniKey)) {
            notifyModuleLoaded(ModuleLoadStatus.STATUS_REPEAT_LOAD,
                "repeat load module. loader.getBundleUniKey=" + bundleUniKey, localRootView);
            return true;
          }

          if (!TextUtils.isEmpty(bundleUniKey)) {
            if (mLoadedBundleInfo == null) {
              mLoadedBundleInfo = new ArrayList<>();
            }
            mLoadedBundleInfo.add(bundleUniKey);

            loader.load(mHippyBridge, new NativeCallback(mHandler) {
              @Override
              public void Call(long result, Message message, String action, String reason) {
                if (result == 0) {
                  notifyModuleLoaded(ModuleLoadStatus.STATUS_OK, null, localRootView);
                } else {
                  notifyModuleLoaded(ModuleLoadStatus.STATUS_ERR_RUN_BUNDLE,
                      "load module error. loader.load failed. check the file!!", null);
                }
              }
            });
          } else {
            notifyModuleLoaded(ModuleLoadStatus.STATUS_VARIABLE_NULL,
                "can not load module. loader.getBundleUniKey=null", null);
          }

          return true;
        }
        case MSG_CODE_CALL_FUNCTION: {
          if (mIsInit) {
            handleCallFunction(msg);
          }

          return true;
        }
        case MSG_CODE_DESTROY_BRIDGE: {
          handleDestroyBridge(msg);
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
    mHandler = new Handler(mContext.getThreadExecutor().getJsThread().getLooper(), this);
    Message message = mHandler.obtainMessage(MSG_CODE_INIT_BRIDGE, callback);
    mHandler.sendMessage(message);
  }

  @Override
  public void runBundle(int id, HippyBundleLoader loader, HippyEngine.ModuleListener listener,
      HippyRootView hippyRootView) {
    if (!mIsInit) {
      mLoadModuleListener = listener;
      notifyModuleLoaded(ModuleLoadStatus.STATUS_ENGINE_UNINIT,
          "load module error. HippyBridge not initialized", hippyRootView);
      return;
    }

    mLoadModuleListener = listener;
    Message message = mHandler.obtainMessage(MSG_CODE_RUN_BUNDLE, 0, id, loader);
    mHandler.sendMessage(message);
  }

  public void notifyModuleJsException(final HippyJsException exception) {
    if (UIThreadUtils.isOnUiThread()) {
      if (mLoadModuleListener != null && mLoadModuleListener.onJsException(exception)) {
        mLoadModuleListener = null;
      }
    } else {
      UIThreadUtils.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          if (mLoadModuleListener != null && mLoadModuleListener.onJsException(exception)) {
            mLoadModuleListener = null;
          }
        }
      });
    }
  }

  private void notifyModuleLoaded(final ModuleLoadStatus statusCode, final String msg,
      final HippyRootView hippyRootView) {
    if (UIThreadUtils.isOnUiThread()) {
      if (mLoadModuleListener != null) {
        mLoadModuleListener.onLoadCompleted(statusCode, msg, hippyRootView);
        //mLoadModuleListener = null;
      }
    } else {
      UIThreadUtils.runOnUiThread(new Runnable() {
        @Override
        public void run() {
          if (mLoadModuleListener != null) {
            mLoadModuleListener.onLoadCompleted(statusCode, msg, hippyRootView);
            //mLoadModuleListener = null;
          }
        }
      });
    }
  }

  @Override
  public void loadInstance(String name, int id, HippyMap params) {
    if (!mIsInit) {
      return;
    }

    HippyMap map = new HippyMap();
    map.pushString("name", name);
    map.pushInt("id", id);
    map.pushMap("params", params);
    Message message = mHandler
        .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_LOAD_INSTANCE, map);
    mHandler.sendMessage(message);
  }

  @Override
  public void resumeInstance(int id) {
    if (!mIsInit) {
      return;
    }

    Message message = mHandler
        .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_RESUME_INSTANCE, id);
    mHandler.sendMessage(message);
  }

  @Override
  public void pauseInstance(int id) {
    if (!mIsInit) {
      return;
    }

    Message message = mHandler
        .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_PAUSE_INSTANCE, id);
    mHandler.sendMessage(message);
  }

  @Override
  public void destroyInstance(int id) {
    if (!mIsInit) {
      return;
    }

    Message message = mHandler
        .obtainMessage(MSG_CODE_CALL_FUNCTION, 0, FUNCTION_ACTION_DESTROY_INSTANCE, id);
    mHandler.sendMessage(message);
  }

  @Override
  public void execCallback(Object params, BridgeTransferType transferType) {
    if (!mIsInit) {
      return;
    }

    Message message = mHandler
        .obtainMessage(MSG_CODE_CALL_FUNCTION, transferType.value(), FUNCTION_ACTION_CALLBACK,
            params);
    mHandler.sendMessage(message);
  }

  @Override
  public void destroyBridge(Callback<Boolean> callback) {
    assert (mHandler != null);
    //noinspection ConstantConditions
    if (mHandler == null) {
      return;
    }

    Message message = mHandler.obtainMessage(MSG_CODE_DESTROY_BRIDGE, callback);
    mHandler.sendMessage(message);
  }

  @Override
  public void destroy() {
    mIsInit = false;
    mLoadModuleListener = null;
    if (mHandler != null) {
      mHandler.removeMessages(MSG_CODE_INIT_BRIDGE);
      mHandler.removeMessages(MSG_CODE_RUN_BUNDLE);
      mHandler.removeMessages(MSG_CODE_CALL_FUNCTION);
    }
  }

  @Override
  public void callJavaScriptModule(String moduleName, String methodName, Object param,
      BridgeTransferType transferType) {
    if (!mIsInit) {
      return;
    }

    HippyMap map = new HippyMap();
    map.pushString("moduleName", moduleName);
    map.pushString("methodName", methodName);
    map.pushObject("params", param);

    Message message = mHandler
        .obtainMessage(MSG_CODE_CALL_FUNCTION, transferType.value(), FUNCTION_ACTION_CALL_JSMODULE,
            map);
    mHandler.sendMessage(message);
  }

  @Override
  public void callNatives(String moduleName, String moduleFunc, String callId, HippyArray params) {
    if (mIsInit && mContext != null && mContext.getModuleManager() != null) {
      HippyModuleManager manager = mContext.getModuleManager();
      if (manager != null) {
        HippyCallNativeParams callNativeParams = HippyCallNativeParams
            .obtain(moduleName, moduleFunc, callId, params);
        manager.callNatives(callNativeParams);
      }
    }
  }

  @Override
  public void reportException(Throwable e) {
    if (mContext == null || e == null) {
      return;
    }

    mContext.handleException(e);
  }

  @Override
  public void reportException(String message, String stackTrace) {
    if (mContext == null) {
      return;
    }

    mContext.handleException(new HippyJsException(message, stackTrace));
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
    globalParams.pushMap("Dimensions", dimensionMap);

    String packageName = "";
    String versionName = "";
    String pageUrl = "";

    HippyMap extraDataMap = new HippyMap();
    if (mThirdPartyAdapter != null) {
      packageName = mThirdPartyAdapter.getPackageName();
      versionName = mThirdPartyAdapter.getAppVersion();
      pageUrl = mThirdPartyAdapter.getPageUrl();
      JSONObject jObject = mThirdPartyAdapter.getExtraData();
      extraDataMap.pushJSONObject(jObject);
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
    globalParams.pushMap("Platform", platformParams);

    HippyMap tkd = new HippyMap();
    tkd.pushString("url", (pageUrl == null) ? "" : pageUrl);
    tkd.pushString("appName", (packageName == null) ? "" : packageName);
    tkd.pushString("appVersion", (versionName == null) ? "" : versionName);
    tkd.pushMap("extra", extraDataMap);
    globalParams.pushMap("tkd", tkd);

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
}
