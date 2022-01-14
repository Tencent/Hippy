import 'dart:collection';

import '../bridge.dart';
import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../gesture.dart';
import '../render.dart';
import '../widget.dart';

abstract class RenderContext<T extends LoadInstanceContext> with Destroyable {
  late VoltronRenderBridgeManager _bridgeManager;
  late RenderManager _renderManager;
  final EngineMonitor _engineMonitor;
  final HashMap<int, RootWidgetViewModel> _instanceMap = HashMap();
  final HashMap<int, T> _loadContextMap = HashMap();

  NativeEventHandler get eventHandler;
  double get fontScale;
  DimensionChecker get dimensionChecker;

  // UI Manager
  RenderManager get renderManager => _renderManager;

  EngineMonitor get engineMonitor => _engineMonitor;

  VoltronRenderBridgeManager get bridgeManager => _bridgeManager;

  T? getLoadContext(int rootId) {
    return _loadContextMap[rootId];
  }

  void forEachInstance(Function(RootWidgetViewModel) call) {
    _instanceMap.values.forEach(call);
  }

  RenderContext(int id, List<ViewControllerGenerator>? generators,
      EngineMonitor engineMonitor)
      : _engineMonitor = engineMonitor {
    _bridgeManager = VoltronRenderBridgeManager(id, this);
    _renderManager = RenderManager(this, generators);
  }

  String convertRelativePath(int rootId, String path);

  void removeInstanceLifecycleEventListener(
      InstanceLifecycleEventListener listener);

  void addEngineLifecycleEventListener(EngineLifecycleEventListener listener);

  void removeEngineLifecycleEventListener(
      EngineLifecycleEventListener listener);

  void addInstanceLifecycleEventListener(
      InstanceLifecycleEventListener listener);

  void handleNativeException(Error error, bool haveCaught);

  RootWidgetViewModel? getInstance(int id) {
    return _instanceMap[id];
  }

  void destroyInstance(int id) {
    _instanceMap.remove(id);
    _loadContextMap.remove(id);
  }

  void createInstance(int id, T loadContext, RootWidgetViewModel viewModel) {
    _instanceMap[viewModel.id] = viewModel;
    _loadContextMap[id] = loadContext;
  }

  @override
  void destroy() {
    _renderManager.destroy();
    _bridgeManager.destroy();
    _instanceMap.clear();
  }
}
