import '../common/voltron_map.dart';
import '../engine/engine_context.dart';
import 'module.dart';

class Dimensions extends JavaScriptModule {
  static const String moduleName = "Dimensions";

  Dimensions(EngineContext context) : super(context);

  void set(VoltronMap dimension) {
    context.bridgeManager.callJavaScriptModule(moduleName, "set", dimension);
  }
}
