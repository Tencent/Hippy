package com.tencent.mtt.hippy.example;

import android.content.Context;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import androidx.annotation.NonNull;
import androidx.lifecycle.Lifecycle;
import androidx.lifecycle.LifecycleOwner;
import com.tencent.mtt.hippy.HippyAPIProvider;
import com.tencent.mtt.hippy.HippyEngine;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.adapter.DefaultLogAdapter;
import com.tencent.mtt.hippy.adapter.exception.HippyExceptionHandlerAdapter;
import com.tencent.mtt.hippy.common.HippyJsException;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.example.adapter.MyImageLoader;
import com.tencent.mtt.hippy.example.util.LifecycleEvent;
import com.tencent.mtt.hippy.utils.LogUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Hippy初始化及加载js文件的封装
 *
 * @author 793383996
 * Copyright (C) 2023 THL A29 Limited, a Tencent company.
 * All rights reserved.
*/
public class HippyHandler extends LifecycleEvent {
  private static final String TAG = "HippyHandler";
  private HippyEngine mHippyEngine;

  public void createAssetsJS(
      @NonNull Lifecycle lifecycle,
      @NonNull Context context,
      @NonNull String assetsFileName,
      @NonNull OnCreateViewComplete complete) {
    create(lifecycle, context, assetsFileName, "", complete);
  }

  public void createJSFile(
      @NonNull Lifecycle lifecycle,
      @NonNull Context context,
      @NonNull String jsFilePath,
      @NonNull OnCreateViewComplete complete) {
    create(lifecycle, context, "", jsFilePath, complete);
  }

  private void create(
      @NonNull Lifecycle lifecycle,
      @NonNull Context context,
      @NonNull String assetsFileName,
      @NonNull String jsFilePath,
      @NonNull OnCreateViewComplete complete) {
    lifecycle.addObserver(this);

    HippyEngine.EngineInitParams initParams = new HippyEngine.EngineInitParams();
    // 必须：宿主（Hippy的使用者）的Context
    // 若存在多个Activity加载多个业务jsbundle的情况，则这里初始化引擎时建议使用Application的Context
    initParams.context = context;
    // 必须：图片加载器
    initParams.imageLoader = new MyImageLoader(context);
    initParams.debugServerHost = "localhost:38989";
    // 可选：是否设置为debug模式，默认为false。调试模式下，所有jsbundle都是从debug server上下载
    initParams.debugMode = HippyEngine.DebugMode.None;
    // 可选：是否打印引擎的完整的log。默认为false
    initParams.enableLog = true;
    initParams.logAdapter = new DefaultLogAdapter();
    // 可选：debugMode = false 时必须设置coreJSAssetsPath或coreJSFilePath（debugMode =
    // true时，所有jsbundle都是从debug server上下载）
    initParams.coreJSAssetsPath = "vendor.android.js";
    initParams.codeCacheTag = "common";

    // 可选：异常处理器
    initParams.exceptionHandler =
        new HippyExceptionHandlerAdapter() {
          // JavaScript执行异常
          @Override
          public void handleJsException(HippyJsException exception) {
            LogUtils.e("hippy", exception.getMessage() + exception.getStack());
          }

          // Native代码执行异常：包括sdk和业务定制代码
          @Override
          public void handleNativeException(Exception exception, boolean haveCaught) {
              LogUtils.e("hippy", exception.getMessage());
          }

          // JavaScript代码Trace，业务层一般不需要
          @Override
          public void handleBackgroundTracing(String details) {
              LogUtils.e("hippy", details);
          }
        };
    List<HippyAPIProvider> providers = new ArrayList<>();
    providers.add(new MyAPIProvider());
    // 可选：自定义的，用来提供Native modules、JavaScript modules、View controllers的管理器。1个或多个
    initParams.providers = providers;

    // 可选： 是否启用turbo能力
    initParams.enableTurbo = true;

    initParams.v8InitParams = new HippyEngine.V8InitParams();

    initParams.v8InitParams.type = HippyEngine.V8SnapshotType.NoSnapshot.ordinal();
    initParams.v8InitParams.blob = null;

    // 根据EngineInitParams创建引擎实例
    mHippyEngine = HippyEngine.create(initParams);

    mHippyEngine.initEngine(
        new HippyEngine.EngineListener() {
          // Hippy引擎初始化完成
          /**
           * @param statusCode status code from initializing procedure
           * @param msg Message from initializing procedure
           */
          @Override
          public void onInitialized(HippyEngine.EngineInitStatus statusCode, String msg) {
            if (!mIsAlive) {
              Log.d(TAG, "onInitialized: not alive");
              return;
            }
            if (statusCode != HippyEngine.EngineInitStatus.STATUS_OK)
              LogUtils.e(TAG, "hippy engine init failed code:" + statusCode + ", msg=" + msg);
            // else
            {
              // 2/3. 加载hippy前端模块

              HippyEngine.ModuleLoadParams loadParams = new HippyEngine.ModuleLoadParams();
              // 必须：该Hippy模块将要挂在的Activity or Dialog的context
              loadParams.context = context;
              /*
              必须：指定要加载的Hippy模块里的组件（component）。componentName对应的是js文件中的"appName"，比如：
              var hippy = new Hippy({
                  appName: "Demo",
                  entryPage: App
              });
              */
              loadParams.componentName = "Demo";

              loadParams.codeCacheTag = "Demo";
              /*
               可选：二选一设置。自己开发的业务模块的jsbundle的assets路径（assets路径和文件路径二选一，优先使用assets路径）
               debugMode = false 时必须设置jsAssetsPath或jsFilePath（debugMode = true时，所有jsbundle都是从debug server上下载）
              */
              if (!TextUtils.isEmpty(assetsFileName)) {
                loadParams.jsAssetsPath = assetsFileName; // "index.android.js";
              } else if (!TextUtils.isEmpty(jsFilePath)) {
                /*
                 可选：二选一设置。自己开发的业务模块的jsbundle的文件路径
                 （assets路径和文件路径二选一，优先使用assets路径）
                 debugMode = false 时必须设置jsAssetsPath或jsFilePath
                 （debugMode = true时，所有jsbundle都是从debug server上下载）
                */
                loadParams.jsFilePath = jsFilePath;
              }

              // 可选：发送给Hippy前端模块的参数
              loadParams.jsParams = new HippyMap();
              loadParams.jsParams.pushString(
                  "msgFromNative", "Hi js developer, I come from native code!");

              HippyEngine.ModuleListener listener =
                  new HippyEngine.ModuleListener() {
                    @Override
                    public void onLoadCompletedInCurrentThread(
                        HippyEngine.ModuleLoadStatus statusCode,
                        String msg,
                        HippyRootView hippyRootView) {}

                    @Override
                    public void onLoadCompleted(
                        HippyEngine.ModuleLoadStatus statusCode,
                        String msg,
                        HippyRootView hippyRootView) {
                      if (statusCode != HippyEngine.ModuleLoadStatus.STATUS_OK) {
                          LogUtils.e(TAG, "loadModule failed code:" + statusCode + ", msg=" + msg);
                      }
                    }

                    @Override
                    public boolean onJsException(HippyJsException exception) {
                      return true;
                    }
                  };
              // 加载Hippy前端模块
              View mHippyRootView = mHippyEngine.loadModule(loadParams, listener, null);
              complete.setContentView(mHippyRootView);
              Log.d(TAG, "onInitialized: setContentView ");
            }
          }
        });
  }

  @Override
  protected void onResume(LifecycleOwner owner) {
    Log.d(TAG, "onResume: ");
    super.onResume(owner);
    if (mHippyEngine != null) {
      mHippyEngine.onEngineResume();
    }
  }

  @Override
  protected void onStop(LifecycleOwner owner) {
    Log.d(TAG, "onStop: ");
    super.onResume(owner);
    if (mHippyEngine != null) {
      mHippyEngine.onEnginePause();
    }
  }

  @Override
  protected void onDestroy(LifecycleOwner owner) {
    Log.d(TAG, "onDestroy: ");
    super.onResume(owner);
    if (mHippyEngine != null) {
      mHippyEngine.onEngineResume();
    }
  }

  public void onBackPressed(OnHippyBackPressed pressed) {
    Log.d(TAG, "onBackPressed: ");
    boolean handled = false;
    if (mHippyEngine != null) {
      handled = mHippyEngine.onBackPressed(pressed::onBackPressed);
    }
    if (!handled) {
      pressed.onBackPressed();
    }
  }

  interface OnCreateViewComplete {
    void setContentView(View view);
  }

  interface OnHippyBackPressed {
    void onBackPressed();
  }
}
