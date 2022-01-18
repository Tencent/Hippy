
import 'package:voltron_renderer/voltron_renderer.dart';

import '../adapter.dart';
import '../bridge.dart';
import '../inspector.dart';
import '../module.dart';
import 'bundle.dart';
import 'global_config.dart';
import 'js_api_provider.dart';
import 'js_render_context.dart';

class EngineContext implements Destroyable {
  final List<EngineLifecycleEventListener> _engineLifecycleEventListeners = [];

  // All CompoundView Instance Status Listener
  final List<InstanceLifecycleEventListener> _instanceLifecycleEventListeners =
      [];

  // Module Manager
  late ModuleManager _moduleManager;

  // Bridge Manager
  late VoltronBridgeManager _bridgeManager;

  // global configuration
  late final GlobalConfigs _globalConfigs;

  // Dev support manager
  DevSupportManager? _devSupportManager;

  final TimeMonitor _startTimeMonitor;

  late JSRenderContext _renderContext;

  // Engine的ID，唯一
  final int _id;

  final bool _isDevMode;

  GlobalConfigs get globalConfigs => _globalConfigs;

  ModuleManager get moduleManager => _moduleManager;

  VoltronBridgeManager get bridgeManager => _bridgeManager;

  DevSupportManager? get devSupportManager => _devSupportManager;

  RenderManager get renderManager => _renderContext.renderManager;

  TimeMonitor get startTimeMonitor => _startTimeMonitor;

  EngineMonitor get engineMonitor => _renderContext.engineMonitor;

  JSRenderContext get renderContext => _renderContext;

  EngineContext(
      List<APIProvider>? apiProviders,
      VoltronBundleLoader? coreLoader,
      int bridgeType,
      bool enableVoltronBuffer,
      bool isDevModule,
      int groupId,
      VoltronThirdPartyAdapter? thirdPartyAdapter,
      GlobalConfigs globalConfigs,
      int id,
      TimeMonitor monitor,
      EngineMonitor engineMonitor)
      : _globalConfigs = globalConfigs,
        _id = id,
        _isDevMode = isDevModule,
        _startTimeMonitor = monitor {
    _renderContext = JSRenderContext(
        this, _id, processControllers(apiProviders), engineMonitor);
    _moduleManager = ModuleManager(this, apiProviders);
    _bridgeManager = VoltronBridgeManager(this, coreLoader, groupId, _id,
        enableVoltronBuffer: enableVoltronBuffer,
        thirdPartyAdapter: thirdPartyAdapter,
        bridgeType: bridgeType,
        isDevModule: isDevModule);
  }

  List<ViewControllerGenerator>? processControllers(
      List<APIProvider>? packages) {
    if (packages == null) {
      return [];
    }

    var controllerGenerators = <ViewControllerGenerator>[];
    for (var provider in packages) {
      var controllerFactoryList = provider.controllerGeneratorList;
      if (controllerFactoryList.isNotEmpty) {
        controllerGenerators.addAll(controllerFactoryList);
      }
    }
    return controllerGenerators;
  }

  RootWidgetViewModel? getInstance(int id) {
    return renderContext.getInstance(id);
  }

  void addInstanceLifecycleEventListener(
      InstanceLifecycleEventListener listener) {
    if (!_instanceLifecycleEventListeners.contains(listener)) {
      _instanceLifecycleEventListeners.add(listener);
    }
  }

  List<InstanceLifecycleEventListener> get instanceLifecycleEventListener =>
      _instanceLifecycleEventListeners;

  void removeInstanceLifecycleEventListener(
      InstanceLifecycleEventListener listener) {
    _instanceLifecycleEventListeners.remove(listener);
  }

  void addEngineLifecycleEventListener(EngineLifecycleEventListener listener) {
    if (!_engineLifecycleEventListeners.contains(listener)) {
      _engineLifecycleEventListeners.add(listener);
    }
  }

  void removeEngineLifecycleEventListener(
      EngineLifecycleEventListener listener) {
    _engineLifecycleEventListeners.remove(listener);
  }

  void handleException(JsError error) {
    var devSupportManager = _devSupportManager;
    if (_isDevMode && devSupportManager != null) {
      devSupportManager.handleException(error);
    } else {
      globalConfigs.exceptionHandlerAdapter?.handleJsException(error);
    }
  }

  int get engineId => _id;

  @override
  void destroy() {
    _bridgeManager.destroy();
    _moduleManager.destroy();
    _renderContext.destroy();
    _instanceLifecycleEventListeners.clear();
    _engineLifecycleEventListeners.clear();
  }
}
