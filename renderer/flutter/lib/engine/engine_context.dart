import 'dart:collection';

import '../adapter/monitor.dart';
import '../adapter/third_party.dart';
import '../common/destroy.dart';
import '../inspector/dev.dart';
import '../module/module.dart';
import '../render/manager.dart';
import '../render/operator_runner.dart';
import '../voltron/lifecycle.dart';
import '../bridge/voltron_bridge.dart';
import '../widget/root.dart';
import 'api_provider.dart';
import 'bundle.dart';
import 'global_config.dart';

class EngineContext implements Destroyable {
  // UI Manager
  late RenderManager _renderManager;

  late RenderOperatorRunner _operatorRunner;

  final List<EngineLifecycleEventListener> _engineLifecycleEventListeners = [];

  // All CompoundView Instance Status Listener
  final List<InstanceLifecycleEventListener> _instanceLifecycleEventListeners =
      [];

  // Module Manager
  late ModuleManager _moduleManager;

  // Bridge Manager
  late VoltronBridgeManager _bridgeManager;

  final EngineMonitorAdapter _engineMonitor;

  // global configuration
  late final GlobalConfigs _globalConfigs;

  // Dev support manager
  DevSupportManager? _devSupportManager;

  final TimeMonitor _startTimeMonitor;

  // Engine的ID，唯一
  final int _id;

  final bool _isDevMode;

  final HashMap<int, RootWidgetViewModel> _instanceMap = HashMap();

  GlobalConfigs get globalConfigs => _globalConfigs;

  ModuleManager get moduleManager => _moduleManager;

  VoltronBridgeManager get bridgeManager => _bridgeManager;

  DevSupportManager? get devSupportManager => _devSupportManager;

  RenderManager get renderManager => _renderManager;

  TimeMonitor get startTimeMonitor => _startTimeMonitor;

  EngineMonitorAdapter get engineMonitor => _engineMonitor;

  RenderOperatorRunner get opRunner => _operatorRunner;

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
      EngineMonitorAdapter engineMonitor)
      : _globalConfigs = globalConfigs,
        _id = id,
        _isDevMode = isDevModule,
        _startTimeMonitor = monitor,
        _engineMonitor = engineMonitor {
    _moduleManager = ModuleManager(this, apiProviders);
    _bridgeManager = VoltronBridgeManager(this, coreLoader, groupId, _id,
        enableVoltronBuffer: enableVoltronBuffer,
        thirdPartyAdapter: thirdPartyAdapter,
        bridgeType: bridgeType,
        isDevModule: isDevModule);
    _renderManager = RenderManager(this, apiProviders);
    _operatorRunner = RenderOperatorRunner(this);
  }

  RootWidgetViewModel? getInstance(int id) {
    return _instanceMap[id];
  }

  void addInstanceLifecycleEventListener(
      InstanceLifecycleEventListener listener) {
    if (!_instanceLifecycleEventListeners.contains(listener)) {
      _instanceLifecycleEventListeners.add(listener);
    }
  }

  Map<int, RootWidgetViewModel> get instanceMap => _instanceMap;

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

  void handleException(Error error) {
    var devSupportManager = _devSupportManager;
    if (_isDevMode && devSupportManager != null) {
      devSupportManager.handleException(error);
    } else {
      // todo exception adapter 处理
    }
  }

  int get engineId => _id;

  @override
  void destroy() {
    _bridgeManager.destroy();
    _moduleManager.destroy();
    _renderManager.destroy();
    _instanceLifecycleEventListeners.clear();
    _engineLifecycleEventListeners.clear();
  }
}
