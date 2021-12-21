import '../adapter.dart';
import '../bridge.dart';
import '../channel.dart';
import '../common.dart';
import '../inspector.dart';
import '../module.dart';
import '../util.dart';
import '../widget.dart';
import 'api_provider.dart';
import 'bundle.dart';
import 'engine_context.dart';
import 'engine_define.dart';
import 'global_config.dart';
import 'init_params.dart';
import 'module_params.dart';

class VoltronEngine implements OnSizeChangedListener, OnResumeAndPauseListener {
  static const String _kTag = "EngineManagerImpl";
  // flutter的engine ID从100000开始
  static int sIdCounter = 100000;
  static bool _sHasInitBridge = false;

  final List<EngineListener> _eventListenerList = [];
  ModuleListener? _moduleListener;
  EngineState _currentState = EngineState.unInit;

  // Engine的ID，唯一
  final int _id = sIdCounter++;

  int get id => _id;

  // global configuration
  late GlobalConfigs _globalConfigs;

  // core bundle loader
  VoltronBundleLoader? _coreBundleLoader;

  // preload bundle loader
  VoltronBundleLoader? _preloadBundleLoader;

  // providers
  List<APIProvider>? _apiProviders;

  //Dev support manager
  DevSupportManager? _devSupportManager;

  EngineContext? _engineContext;

  // 从网络上加载jsbundle
  late bool _debugMode;

  // Server的jsbundle名字，调试模式下有效
  // ignore: unused_field
  late String _serverBundleName;

  // Server的host，调试模式下有效
  // ignore: unused_field
  late String _serverHost;

  bool _enableVoltronBuffer = false;

  bool _devManagerInited = false;
  bool _hasReportEngineLoadResult = false;
  late int _groupId;
  VoltronThirdPartyAdapter? _thirdPartyAdapter;

  late TimeMonitor _startTimeMonitor;

  late EngineMonitorAdapter _engineMonitor;

  EngineContext? get engineContext => _engineContext;

  EngineState get engineState => _currentState;

  static VoltronEngine create(EngineInitParams params) {
    params.check();
    LogUtils.enableDebugLog(params.enableLog);
    LogUtils.setLogMethod(params.logListener);

    return VoltronEngine(params, null);
  }

  VoltronEngine(
      EngineInitParams params, VoltronBundleLoader? preloadBundleLoader) {
    // create core bundle loader
    VoltronBundleLoader? coreBundleLoader;
    if (!isEmpty(params.coreJSAssetsPath)) {
      if (params.coreAssetsLoader != null) {
        coreBundleLoader = params.coreAssetsLoader;
      } else {
        coreBundleLoader = AssetBundleLoader(params.coreJSAssetsPath!,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      }
    } else if (!isEmpty(params.coreJSFilePath)) {
      if (params.coreFileLoader != null) {
        coreBundleLoader = params.coreFileLoader;
      } else {
        coreBundleLoader = FileBundleLoader(params.coreJSFilePath,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      }
    }

    var configs = GlobalConfigs(params);
    _globalConfigs = configs;
    _coreBundleLoader = coreBundleLoader;
    _preloadBundleLoader = preloadBundleLoader;
    _apiProviders = params.providers;
    _debugMode = params.debugMode;
    _serverBundleName = params.debugMode ? params.debugBundleName : "";
    _startTimeMonitor = TimeMonitor(true);
    _engineMonitor = params.engineMonitor!;
    _enableVoltronBuffer = params.enableBuffer;
    _serverHost = params.debugServerHost;
    _groupId = params.groupId;
    _thirdPartyAdapter = params.thirdPartyAdapter;
  }

  Future<dynamic> initEngine(EngineListener listener) async {
    // 初始化平台相关信息， 必须放到第一位，否则可能run app之后平台信息还未初始化完成
    await PlatformManager.getInstance().initPlatform();
    LogUtils.d(_kTag, "initEngine getPlatform");
    await _initBridge();
    LogUtils.d(_kTag, "initEngine initBridge done");
    if (_currentState != EngineState.unInit) {
      _listen(listener);
      return;
    }

    _currentState = EngineState.onInit;
    _eventListenerList.add(listener);

    _globalConfigs.monitorAdapter?.reportEngineLoadStart();

    try {
      // _devSupportManager = DevSupportManager(
      //     _globalConfigs, _debugMode, _serverHost, _serverBundleName);
      // // todo 完善调试能力
      // // _devSupportManager.setDevCallback(this);
      // if (_debugMode) {
      //   _devSupportManager.init(null);
      //   return;
      // }

      LogUtils.d(_kTag, "start restartEngineInBackground...");
      await _restartEngineInBackground();
    } catch (e) {
      _currentState = EngineState.initError;
      if (e is Error) {
        LogUtils.e(_kTag, "${e.stackTrace}");
      }
      _notifyEngineInitialized(
          EngineStatus.initException, StateError(e.toString()));
    }
  }

  // listen engine state. no need to make this method
  void _listen(EngineListener listener) {
    // 1. 若mCurrentState是结束态，无论成功还是失败，要直接通知结果并返回。
    // 2. 若mCurrentState是初始化过程中的状态，则把listener添加到mEventListeners后返回
    if (_currentState == EngineState.inited) {
      listener(EngineStatus.ok, null);
    } else if (_currentState == EngineState.initError ||
        _currentState == EngineState.destroyed) {
      listener(EngineStatus.wrongState, "engine state=$_currentState");
    } else {
      // 说明mCurrentState是初始化过程中的状态
      _eventListenerList.add(listener);
    }
  }

  void _notifyEngineInitialized(EngineStatus statusCode, Error? e) {
    var preloadBundleLoader = _preloadBundleLoader;
    if (preloadBundleLoader != null) {
      LogUtils.d(_kTag, "preload bundle loader");
      preloadModule(preloadBundleLoader);
    }

    if (_currentState != EngineState.destroyed) {
      _startTimeMonitor.end();
      _reportEngineLoadResult(
          _currentState == EngineState.inited
              ? EngineMonitorAdapter.kEngineLoadResultSuccess
              : EngineMonitorAdapter.kEngineLoadResultError,
          e);
    }
    for (var listener in _eventListenerList) {
      listener(statusCode, e == null ? null : e.toString());
    }
    _eventListenerList.clear();
  }

  void _notifyModuleLoaded(final EngineStatus statusCode, final String? msg,
      final RootWidgetViewModel rootView) {
    if (statusCode != EngineStatus.ok) {
      rootView.onLoadError();
    }
    var moduleListener = _moduleListener;
    if (moduleListener != null) {
      moduleListener(statusCode, msg, rootView);
      _moduleListener = null;
    }
  }

  void preloadModule(VoltronBundleLoader loader) {
    _engineContext?.bridgeManager.runBundle(-1, loader, null, null);
  }

  void _reportEngineLoadResult(int code, Error? e) {
    if (!_hasReportEngineLoadResult) {
      _hasReportEngineLoadResult = true;
      _globalConfigs.monitorAdapter?.reportEngineLoadResult(
          code, _startTimeMonitor.totalTime, _startTimeMonitor.events, e);
    }
  }

  Future<dynamic> _restartEngineInBackground() async {
    if (_currentState == EngineState.destroyed) {
      var errorMsg =
          "restartEngineInBackground... error STATUS_WRONG_STATE, state=$_currentState";
      LogUtils.e(_kTag, errorMsg);
      _notifyEngineInitialized(EngineStatus.wrongState, StateError(errorMsg));
      return;
    }
    _startTimeMonitor.begin();
    _startTimeMonitor
        .startEvent(EngineMonitorEvent.engineLoadEventInitInstance);
    if (_currentState != EngineState.onInit) {
      _currentState = EngineState.onRestart;
    }
    resetEngine();

    _engineContext = EngineContext(
      _apiProviders,
      _coreBundleLoader,
      bridgeType,
      _enableVoltronBuffer,
      _debugMode,
      _groupId,
      _thirdPartyAdapter,
      _globalConfigs,
      _id,
      _startTimeMonitor,
      _engineMonitor,
    );
    await _engineContext!.bridgeManager.initBridge((param, e) {
      if (_currentState != EngineState.onInit &&
          _currentState != EngineState.onRestart) {
        LogUtils.e(_kTag,
            "initBridge callback error STATUS_WRONG_STATE, state=$_currentState");
        _notifyEngineInitialized(EngineStatus.wrongState, e);
        return;
      }
      _startTimeMonitor
          .startEvent(EngineMonitorEvent.engineLoadEventNotifyEngineInited);

      for (var rootWidget in _engineContext!.instanceMap.values) {
        _internalLoadInstance(rootWidget);
      }

      var state = _currentState;
      _currentState = param ? EngineState.inited : EngineState.initError;
      if (state != EngineState.onRestart) {
        _notifyEngineInitialized(
            param ? EngineStatus.ok : EngineStatus.errBridge, e);
      } else {
        LogUtils.e(_kTag,
            "initBridge callback error STATUS_WRONG_STATE, state=$_currentState");
        _notifyEngineInitialized(EngineStatus.wrongState, e);
        _startTimeMonitor.end();
      }
    });
  }

  int get bridgeType => VoltronBridgeManager.kBridgeTypeNormal;

  void resetEngine() {
    _engineContext?.destroy();
  }

  Future<dynamic> _internalLoadInstance(RootWidgetViewModel instance) async {
    var engineContext = _engineContext;
    if (engineContext == null) {
      _notifyModuleLoaded(
          EngineStatus.variableUnInit,
          "load module error. engineContext= $_engineContext, RootView instance= $instance",
          instance);
      return;
    }
    // 在通知创建dart侧的 renderManager之前，需要先初始化native的domManager
    await engineContext.bridgeManager.initDom(instance.id);
    LogUtils.d(_kTag, "in internalLoadInstance");
    for (var listener in engineContext.instanceLifecycleEventListener) {
      listener.onInstanceLoad(instance.id);
    }
    instance.attachToEngine(engineContext);
    var launchParams = instance.launchParams;
    var loader = instance.instanceContext?.bundleLoader;
    if (loader != null) {
      instance.timeMonitor
          ?.startEvent(EngineMonitorEvent.moduleLoadEventWaitLoadBundle);
      await engineContext.bridgeManager
          .runBundle(instance.id, loader, _moduleListener, instance);
    } else {
      _notifyModuleLoaded(EngineStatus.variableUnInit,
          "load module error. loader null", instance);
      return;
    }
    LogUtils.d(
        _kTag, "in internalLoadInstance before loadInstance, $_debugMode");
    await engineContext.bridgeManager
        .loadInstance(instance.name, instance.id, launchParams);
    // if (_debugMode) _notifyModuleLoaded(EngineStatus.ok, null, instance);
  }

  Future<dynamic> loadModule(
      ModuleLoadParams loadParams, RootWidgetViewModel viewModel,
      {ModuleListener? listener,
      OnLoadCompleteListener? onLoadCompleteListener}) async {
    // assert(!_debugMode && (!isEmpty(loadParams.jsAssetsPath) || !isEmpty(loadParams.jsFilePath)));

    if (loadParams.jsParams == null) loadParams.jsParams = VoltronMap();
    if (loadParams.instanceContext != null) {
      loadParams.instanceContext!.moduleParams = loadParams;
    }
    if (!isEmpty(loadParams.jsAssetsPath)) {
      loadParams.jsParams!.push("sourcePath", loadParams.jsAssetsPath);
    } else if (!isEmpty(loadParams.jsFilePath)) {
      loadParams.jsParams!.push("sourcePath", loadParams.jsFilePath);
    } else if (!isEmpty(loadParams.jsHttpPath)) {
      loadParams.jsParams!.push("sourcePath", loadParams.jsHttpPath);
    }
    _moduleListener = listener;

    _engineContext!.engineMonitor.initLoadParams(loadParams.jsParams!);
    if (_currentState == EngineState.destroyed) {
      _notifyModuleLoaded(EngineStatus.wrongState,
          "load module error wrong state, Engine destroyed", viewModel);
      return;
    }
    if (onLoadCompleteListener != null) {
      viewModel.onLoadCompleteListener = onLoadCompleteListener;
    }
    var timeMonitor = TimeMonitor(true);
    viewModel.timeMonitor = timeMonitor;
    timeMonitor.begin();
    timeMonitor.startEvent(EngineMonitorEvent.moduleLoadEventWaitEngine);
    viewModel.onResumeAndPauseListener = this;
    viewModel.onSizeChangedListener = this;
    viewModel.attachEngineManager(this);
    var engineContext = _engineContext;
    if (engineContext != null) {
      engineContext.instanceMap[viewModel.id] = viewModel;
    }
    _devSupportManager?.attachToHost(viewModel);
    if (!_devManagerInited && _debugMode) {
      _devManagerInited = true;
    }

    LogUtils.d(_kTag, "internalLoadInstance start...");
    if (_currentState == EngineState.inited) {
      _internalLoadInstance(viewModel);
    } else {
      _notifyModuleLoaded(
          EngineStatus.wrongState,
          "error wrong state, Engine state not INITED, state: $_currentState",
          viewModel);
    }
  }

  @override
  void onInstancePause(int id) {
    var engineContext = _engineContext;
    if (engineContext == null) {
      return;
    }
    var iterator = engineContext.instanceLifecycleEventListener.iterator;
    while (iterator.moveNext()) {
      iterator.current.onInstancePause(id);
    }

    engineContext.bridgeManager.pauseInstance(id);
  }

  @override
  void onInstanceResume(int id) {
    var engineContext = _engineContext;
    if (engineContext == null) {
      return;
    }
    var iterator = engineContext.instanceLifecycleEventListener.iterator;
    while (iterator.moveNext()) {
      iterator.current.onInstanceResume(id);
    }

    engineContext.bridgeManager.resumeInstance(id);
  }

  @override
  void onSizeChanged(int rootId, double width, double height, double oldWidth,
      double oldHeight) async {
    await _engineContext?.bridgeManager
        .updateNodeSize(rootId, width: width, height: height);
  }

  void destroyEngine() {
    _currentState = EngineState.destroyed;
    var engineContext = _engineContext;
    if (engineContext == null) {
      return;
    }

    var iterator = engineContext.instanceMap.values.iterator;
    while (iterator.moveNext()) {
      destroyInstance(iterator.current);
    }

    _eventListenerList.clear();
    resetEngine();
    _globalConfigs.destroy();
  }

  void destroyInstance(RootWidgetViewModel? rootWidget) {
    if (rootWidget == null) {
      return;
    }
    rootWidget.onResumeAndPauseListener = null;
    rootWidget.onSizeChangedListener = null;
    _devSupportManager?.detachFromHost(rootWidget);

    var engineContext = _engineContext;
    if (engineContext != null) {
      engineContext.bridgeManager.destroyInstance(rootWidget.id);
    }
    if (engineContext != null) {
      var iterator = engineContext.instanceLifecycleEventListener.iterator;
      while (iterator.moveNext()) {
        iterator.current.onInstanceDestroy(rootWidget.id);
      }
    }
    rootWidget.destroy();
    engineContext?.instanceMap.remove(rootWidget.id);
  }

  void sendEvent(String event, Object params) {
    var engineContext = _engineContext;
    if (engineContext != null) {
      final dispatcher = engineContext.moduleManager.getJavaScriptModule(
          enumValueToString(JavaScriptModuleType.EventDispatcher));
      if (dispatcher is EventDispatcher) {
        dispatcher.receiveNativeEvent(event, params);
      }
    }
  }

  bool onBackPressed(BackPressHandler handler) {
    var module = _engineContext?.moduleManager
        .getNativeModule<DeviceEventModule>(
            DeviceEventModule.kDeviceModuleName);
    if (module != null) {
      return module.onBackPressed(handler);
    }
    return false;
  }

  static Future<dynamic> _initBridge() async {
    if (!_sHasInitBridge) {
      LogUtils.d(_kTag, "_initBridge");
      await VoltronApi.initBridge();
      _sHasInitBridge = true;
    }
  }
}

typedef BackPressHandler = Function();
