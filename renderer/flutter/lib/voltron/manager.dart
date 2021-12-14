import '../engine/engine_define.dart';
import '../engine/init_params.dart';
import '../engine/module_params.dart';
import '../engine/voltron_engine.dart';
import '../util/log_util.dart';
import '../widget/root.dart';

typedef ModuleExecutor = Function();

// 对外暴露接口
class VoltronRenderManager {
  late VoltronEngine _engine;

  final List<ModuleExecutor> pendingExecutor = [];

  VoltronRenderManager(EngineInitParams params) {
    _engine = VoltronEngine.create(params);
  }

  int get engineId => _engine.id;

  void _init(EngineListener listener) {
    _engine.initEngine(listener);
  }

  void destroy() {
    _engine.destroyEngine();
  }

  void sendData(String event, Object params) {
    _engine.sendEvent(event, params);
  }

  // 框架初始化
  static VoltronRenderManager initRender(
      EngineInitParams params, EngineListener listener) {
    var render = VoltronRenderManager(params);
    render._init((status, msg) {
      LogUtils.i("flutter_render", "init engine status($status), msg($msg)");
      listener(status, msg);

      // engine初始化成功
      if (render.pendingExecutor.isNotEmpty) {
        for (var executor in render.pendingExecutor) {
          executor();
        }
      }
      render.pendingExecutor.clear();
    });
    return render;
  }

  Future<dynamic> loadModule(
      ModuleLoadParams loadParams, RootWidgetViewModel viewModel,
      {ModuleListener? moduleListener,
      OnLoadCompleteListener? onLoadCompleteListener}) async {
    _execute(() {
      _engine.loadModule(loadParams, viewModel,
          listener: moduleListener,
          onLoadCompleteListener: onLoadCompleteListener);
    });
  }

  Future<dynamic> destroyInstance(RootWidgetViewModel viewModel) async {
    _execute(() {
      _engine.destroyInstance(viewModel);
    });
  }

  bool onBackPress(BackPressHandler handler) {
    return _engine.onBackPressed(handler);
  }

  void _execute(ModuleExecutor executor) {
    switch (_engine.engineState) {
      case EngineState.unInit:
      case EngineState.onInit:
      case EngineState.onRestart:
        LogUtils.w("flutter_render", "run executor failed, add to pending");
        pendingExecutor.add(executor);
        break;
      case EngineState.initError:
      case EngineState.destroyed:
      case EngineState.inited:
        LogUtils.i("flutter_render", "run executor success");
        executor();
        break;
    }
  }
}
