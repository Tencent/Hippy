//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'dart:collection';

import 'package:voltron_renderer/voltron_renderer.dart';

import '../adapter.dart';
import '../bridge.dart';
import '../channel.dart';
import '../engine.dart';
import '../inspector.dart';
import '../module.dart';

class VoltronJSEngine implements OnResumeAndPauseListener, DevServerCallback {
  static const String _kTag = "EngineManagerImpl";

  static bool _hasInit = false;

  final List<EngineListener> _eventListenerList = [];

  final HashMap<int, ModuleLoadParams> _moduleLoadParamsMap = HashMap();

  ModuleListener? _moduleListener;
  EngineState _currentState = EngineState.unInit;

  // Engine的ID，唯一
  late int _id;

  int get id => _id;

  // global configuration
  late GlobalConfigs _globalConfigs;

  // core bundle loader
  late VoltronBundleLoader? _coreBundleLoader;

  // preload bundle loader
  VoltronBundleLoader? _preloadBundleLoader;

  // providers
  List<APIProvider>? _apiProviders;

  //Dev support manager
  late DevSupportManager _devSupportManager;

  EngineContext? _engineContext;

  // 从网络上加载jsbundle
  late bool _debugMode;

  late IntegratedMode _integratedMode;

  // Server的jsbundle名字，调试模式下有效
  late String _serverBundleName;

  // Server的host，调试模式下有效
  late String _serverHost;

  // Hippy Server url using remote debug in no usb，only take effect in debugMode = true
  late String _remoteServerUrl;

  bool _devManagerInitFlag = false;

  bool _hasReportEngineLoadResult = false;

  late int _groupId;

  VoltronThirdPartyAdapter? _thirdPartyAdapter;

  late TimeMonitor _startTimeMonitor;

  late EngineMonitor _engineMonitor;

  EngineContext? get engineContext => _engineContext;

  EngineState get engineState => _currentState;

  static VoltronJSEngine create(EngineInitParams params) {
    params.check();
    LogUtils.enableDebugLog(params.enableLog);
    LogUtils.setLogMethod(params.logListener);

    return VoltronJSEngine(params, null);
  }

  VoltronJSEngine(EngineInitParams params, VoltronBundleLoader? preloadBundleLoader) {
    // create core bundle loader
    VoltronBundleLoader? coreBundleLoader;
    if (!isEmpty(params.coreJSAssetsPath)) {
      if (params.coreAssetsLoader != null) {
        coreBundleLoader = params.coreAssetsLoader;
      } else {
        coreBundleLoader = AssetBundleLoader(
          params.coreJSAssetsPath!,
          canUseCodeCache: !isEmpty(params.codeCacheTag),
          codeCacheTag: params.codeCacheTag,
        );
      }
    } else if (!isEmpty(params.coreJSFilePath)) {
      if (params.coreFileLoader != null) {
        coreBundleLoader = params.coreFileLoader;
      } else {
        coreBundleLoader = FileBundleLoader(
          params.coreJSFilePath,
          canUseCodeCache: !isEmpty(params.codeCacheTag),
          codeCacheTag: params.codeCacheTag,
        );
      }
    }

    try {
      LogUtils.d(_kTag, "init ffi function binding start");
      _initBridge();
      LogUtils.d(_kTag, "init ffi function binding done");
    } catch (e) {
      _currentState = EngineState.initError;
      if (e is Error) {
        LogUtils.e(_kTag, "init ffi function binding fail, error: ${e.stackTrace}");
      }
    }

    _id = VoltronApi.getVoltronEngineIndex();

    LogUtils.d(_kTag, "get voltron engine index: ${_id}");

    CookieManager.getInstance().setCookieDelegate(
      params.cookieDelegateType,
      originDelegate: params.originDelegate,
    );

    var configs = GlobalConfigs(params);
    _globalConfigs = configs;
    _coreBundleLoader = coreBundleLoader;
    _preloadBundleLoader = preloadBundleLoader;
    _apiProviders = params.providers;
    _debugMode = params.debugMode;
    _integratedMode = params.integratedMode;
    _serverBundleName = params.debugMode ? params.debugBundleName : "";
    _startTimeMonitor = TimeMonitor(true);
    _engineMonitor = params.engineMonitor!;
    _serverHost = params.debugServerHost;
    _remoteServerUrl = params.remoteServerUrl ?? '';
    _groupId = params.groupId;
    _thirdPartyAdapter = params.thirdPartyAdapter;
  }

  Future<dynamic> initEngine(EngineListener listener) async {
    _startTimeMonitor.startEvent(EngineMonitorEventKey.engineLoadEventInitEngine);
    try {
      // 初始化UI宽高信息， 必须放到第一位，否则可能run app之后没有UI界面宽高信息
      LogUtils.d(_kTag, "init screen info start");
      await ScreenUtil.getInstance().initScreen(
          screenInfoSource: _integratedMode == IntegratedMode.flutterApp
              ? ScreenInfoSource.flutter
              : ScreenInfoSource.native);
      LogUtils.d(_kTag, "init screen info done");
    } catch (e) {
      _currentState = EngineState.initError;
      if (e is Error) {
        LogUtils.e(_kTag, "init screen info fail, error:${e.stackTrace}");
      }
    }

    try {
      // 初始化平台相关信息和UI宽高信息， 必须放到第一位，否则可能run app之后平台信息还未初始化完成，或者没有UI界面宽高信息
      LogUtils.d(_kTag, "init platform info start");
      await PlatformManager.getInstance().initPlatform();
      LogUtils.d(_kTag, "init platform info done");
    } catch (e) {
      _currentState = EngineState.initError;
      if (e is Error) {
        LogUtils.e(_kTag, "init platform info fail, error:${e.stackTrace}");
      }
    }

    if (_currentState != EngineState.unInit) {
      _listen(listener);
      return;
    }

    _currentState = EngineState.onInit;
    _eventListenerList.add(listener);

    _globalConfigs.monitorAdapter?.reportEngineLoadStart();

    try {
      _devSupportManager = DevSupportManager(
        _globalConfigs,
        _debugMode,
        _serverHost,
        _serverBundleName,
        _remoteServerUrl,
      );
      _devSupportManager.setDevCallback(this);
      if (_debugMode) {
        String url = _devSupportManager.createResourceUrl(_serverBundleName);
        _coreBundleLoader = HttpBundleLoader(url);
        (_coreBundleLoader as HttpBundleLoader).setIsDebugMode(_debugMode);
      }
      LogUtils.d(_kTag, "start restartEngineInBackground...");
      await _restartEngineInBackground(false);
    } catch (e) {
      _currentState = EngineState.initError;
      if (e is Error) {
        LogUtils.e(_kTag, "${e.stackTrace}");
      }
      _notifyEngineInitialized(
        EngineInitStatus.initException,
        StateError(e.toString()),
      );
    }
  }

  // listen engine state. no need to make this method
  void _listen(EngineListener listener) {
    // 1. 若mCurrentState是结束态，无论成功还是失败，要直接通知结果并返回。
    // 2. 若mCurrentState是初始化过程中的状态，则把listener添加到mEventListeners后返回
    if (_currentState == EngineState.inited) {
      listener(EngineInitStatus.ok, null);
    } else if (_currentState == EngineState.initError || _currentState == EngineState.destroyed) {
      listener(EngineInitStatus.wrongState, "engine state=$_currentState");
    } else {
      // 说明mCurrentState是初始化过程中的状态
      _eventListenerList.add(listener);
    }
  }

  void _notifyEngineInitialized(EngineInitStatus statusCode, Error? e) {
    var preloadBundleLoader = _preloadBundleLoader;
    if (preloadBundleLoader != null) {
      LogUtils.d(_kTag, "preload bundle loader");
      preloadModule(preloadBundleLoader);
    }

    if (_currentState != EngineState.destroyed) {
      _startTimeMonitor.end();
      _reportEngineLoadResult(
          _currentState == EngineState.inited
              ? EngineMonitor.kEngineLoadResultSuccess
              : EngineMonitor.kEngineLoadResultError,
          e);
    }
    for (var listener in _eventListenerList) {
      listener(statusCode, e?.toString());
    }
    _eventListenerList.clear();
  }

  void _notifyModuleLoaded(
    final ModuleLoadStatus statusCode,
    final String? msg,
    final RootWidgetViewModel rootView,
  ) {
    if (statusCode != ModuleLoadStatus.ok) {
      rootView.onLoadError(statusCode.value);
    }
    var moduleListener = _moduleListener;
    if (moduleListener != null) {
      moduleListener(statusCode, msg);
    }
  }

  void preloadModule(VoltronBundleLoader loader) {
    _engineContext?.bridgeManager.runBundle(-1, loader, null, null);
  }

  void _reportEngineLoadResult(int code, Error? e) {
    if (!_hasReportEngineLoadResult) {
      _hasReportEngineLoadResult = true;
      _globalConfigs.monitorAdapter?.reportEngineLoadResult(
        code,
        _startTimeMonitor.totalTime,
        _startTimeMonitor.events,
        e,
      );
    }
  }

  Future<void> _restartEngineInBackground(bool isReload) async {
    if (_currentState == EngineState.destroyed) {
      var errorMsg = "restartEngineInBackground... error STATUS_WRONG_STATE, state=$_currentState";
      LogUtils.e(_kTag, errorMsg);
      _notifyEngineInitialized(EngineInitStatus.wrongState, StateError(errorMsg));
      return;
    }
    _startTimeMonitor.begin();
    _startTimeMonitor.startEvent(EngineMonitorEventKey.engineLoadEventInitInstance);

    if (_currentState != EngineState.onInit) {
      _currentState = EngineState.onRestart;
    }

    _engineContext?.destroy(isReload);

    _engineContext = EngineContext(
      _apiProviders,
      _coreBundleLoader,
      bridgeType,
      _debugMode,
      _integratedMode,
      _serverHost,
      _groupId,
      _thirdPartyAdapter,
      _globalConfigs,
      _id,
      _startTimeMonitor,
      _engineMonitor,
      _devSupportManager,
      _engineContext?.renderContext.renderBridgeManager,
      _engineContext?.renderContext.domHolder,
      _engineContext?.renderContext.rootViewModelMap,
    );
    await _engineContext!.bridgeManager.initBridge((param, e) {
      if (_currentState != EngineState.onInit && _currentState != EngineState.onRestart) {
        LogUtils.e(
          _kTag,
          "initBridge callback error STATUS_WRONG_STATE, state=$_currentState",
        );
        _notifyEngineInitialized(EngineInitStatus.wrongState, e);
        return;
      }
      _startTimeMonitor.startEvent(EngineMonitorEventKey.engineLoadEventNotifyEngineInited);

      if (_currentState == EngineState.onRestart) {
        _engineContext!.renderContext.rootViewModelMap.forEach((id, viewModel) {
          _loadJSInstance(viewModel);
        });
      }

      var state = _currentState;
      _currentState = param ? EngineState.inited : EngineState.initError;
      if (state != EngineState.onRestart) {
        LogUtils.d(_kTag, "restartEngineInBackground ok");
        _notifyEngineInitialized(param ? EngineInitStatus.ok : EngineInitStatus.errBridge, e);
      } else {
        LogUtils.e(_kTag, "initBridge callback error STATUS_WRONG_STATE, state=$_currentState");
        _notifyEngineInitialized(EngineInitStatus.wrongState, e);
        _startTimeMonitor.end();
      }
    });
  }

  int get bridgeType => VoltronBridgeManager.kBridgeTypeNormal;

  Future<dynamic> _loadJSInstance(RootWidgetViewModel rootWidgetViewModel) async {
    var loadContext = JSLoadInstanceContext(_moduleLoadParamsMap[rootWidgetViewModel.id]!);
    _engineContext?.renderContext.createRootView(
      loadContext,
      rootWidgetViewModel,
    );
    LogUtils.dBridge(
      "loadJSInstance engineId: ${_engineContext?.engineId ?? 0}, rootWidgetViewModel.id: ${rootWidgetViewModel.id}",
    );
    _engineContext?.bridgeManager
        .connectRootViewAndRuntime(_engineContext?.engineId ?? 0, rootWidgetViewModel.id);

    LogUtils.d(_kTag, "in internalLoadInstance");
    for (var listener in _engineContext!.instanceLifecycleEventListener) {
      listener.onInstanceLoad(rootWidgetViewModel.id);
    }
    rootWidgetViewModel.attachToEngine(_engineContext!.renderContext);

    rootWidgetViewModel.updateRootSize();
    var loadInstanceContext = _engineContext!.renderContext.getLoadContext(
      rootWidgetViewModel.id,
    );
    if (loadInstanceContext == null) {
      _notifyModuleLoaded(
        ModuleLoadStatus.varialeNull,
        "load module error. loader null",
        rootWidgetViewModel,
      );
      return;
    }
    var launchParams = loadInstanceContext.launchParams;
    var name = loadInstanceContext.name;
    var loader = loadInstanceContext.bundleLoader;
    if (!_debugMode && loader != null) {
      rootWidgetViewModel.timeMonitor?.startEvent(
        EngineMonitorEventKey.moduleLoadEventWaitLoadBundle,
      );
      await _engineContext?.bridgeManager.runBundle(
        rootWidgetViewModel.id,
        loader,
        _moduleListener,
        rootWidgetViewModel,
      );
    }
    LogUtils.d(
      _kTag,
      "in internalLoadInstance ready loadInstance, $_debugMode",
    );
    await _engineContext?.bridgeManager.loadInstance(
      name,
      rootWidgetViewModel.id,
      launchParams,
    );
    LogUtils.dBridge("load module success");
    if (_debugMode || loader == null) {
      _notifyModuleLoaded(
        ModuleLoadStatus.ok,
        null,
        rootWidgetViewModel,
      );
    }
  }

  Future<dynamic> loadModule(
    ModuleLoadParams loadParams,
    RootWidgetViewModel viewModel, {
    ModuleListener? listener,
    ModuleErrorBuilder? moduleStatusBuilder,
    OnLoadCompleteListener? onLoadCompleteListener,
  }) async {
    LogUtils.dBridge("load module start");
    loadParams.jsParams ??= VoltronMap();
    if (!isEmpty(loadParams.jsAssetsPath)) {
      loadParams.jsParams!.push("sourcePath", loadParams.jsAssetsPath);
    } else if (!isEmpty(loadParams.jsFilePath)) {
      loadParams.jsParams!.push("sourcePath", loadParams.jsFilePath);
    } else if (!isEmpty(loadParams.jsHttpPath)) {
      loadParams.jsParams!.push("sourcePath", loadParams.jsHttpPath);
    }
    _engineContext!.renderContext.addRootViewModel(viewModel);
    _moduleLoadParamsMap[viewModel.id] = loadParams;
    _moduleListener = listener;
    _engineContext?.engineMonitor.initLoadParams(loadParams.jsParams!);
    if (onLoadCompleteListener != null) {
      viewModel.onLoadCompleteListener = onLoadCompleteListener;
    }
    var timeMonitor = TimeMonitor(true);
    viewModel.timeMonitor = timeMonitor;
    timeMonitor.begin();
    timeMonitor.startEvent(EngineMonitorEventKey.moduleLoadEventWaitEngine);
    viewModel.onResumeAndPauseListener = this;
    _devSupportManager.attachToHost(viewModel);
    if (!_devManagerInitFlag && _debugMode) {
      _devManagerInitFlag = true;
    }
    LogUtils.d(_kTag, "internalLoadInstance start...");
    if (_currentState == EngineState.inited) {
      _loadJSInstance(viewModel);
    } else {
      _notifyModuleLoaded(
        ModuleLoadStatus.engineUninit,
        "error wrong state, Engine state not INITED, state: $_currentState",
        viewModel,
      );
    }
  }

  @override
  void onInstancePause(int id) {
    var iterator = _engineContext?.instanceLifecycleEventListener.iterator;
    if (iterator != null) {
      while (iterator.moveNext()) {
        iterator.current.onInstancePause(id);
      }
    }
    _engineContext?.bridgeManager.pauseInstance(id);
  }

  @override
  void onInstanceResume(int id) {
    var iterator = _engineContext?.instanceLifecycleEventListener.iterator;
    if (iterator != null) {
      while (iterator.moveNext()) {
        iterator.current.onInstanceResume(id);
      }
    }
    _engineContext?.bridgeManager.resumeInstance(id);
  }

  void destroyEngine() {
    _currentState = EngineState.destroyed;
    _engineContext?.renderContext.forEachInstance(destroyInstance);
    _eventListenerList.clear();
    _engineContext?.destroyBridge((res) {
      _engineContext?.destroy(false);
    }, false);
    _globalConfigs.destroy();
  }

  void destroyInstance(RootWidgetViewModel? rootWidget) {
    if (rootWidget == null) {
      return;
    }
    rootWidget.onResumeAndPauseListener = null;
    _devSupportManager.detachFromHost(rootWidget);

    _engineContext?.bridgeManager.unloadInstance(rootWidget.id);
    var listeners = engineContext?.instanceLifecycleEventListener;
    listeners?.forEach((element) {
      element.onInstanceDestroy(rootWidget.id);
    });
    engineContext?.renderContext.destroyRootView(id, false);
    rootWidget.destroy();
  }

  void sendEvent(String event, Object params) {
    final dispatcher = _engineContext?.moduleManager
        .getJavaScriptModule(enumValueToString(JavaScriptModuleType.EventDispatcher));
    if (dispatcher is EventDispatcher) {
      dispatcher.receiveNativeEvent(event, params);
    }
  }

  bool onBackPressed(BackPressHandler handler) {
    var module = _engineContext?.moduleManager
        .getNativeModule<DeviceEventModule>(DeviceEventModule.kDeviceModuleName);
    if (module != null) {
      return module.onBackPressed(handler);
    }
    return false;
  }

  static void _initBridge() {
    if (!_hasInit) {
      VoltronApi.initBridge();
      _hasInit = true;
    }
  }

  @override
  void onDevBundleReload() {
    _engineContext?.destroyBridge((res) {
      _restartEngineInBackground(true);
    }, true);
  }
}
