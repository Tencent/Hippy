import '../common.dart';
import '../engine.dart';
import 'module.dart';

class Dimensions extends JavaScriptModule {
  static const String moduleName = "Dimensions";

  Dimensions(EngineContext context) : super(context);

  void set(VoltronMap dimension) {
    context.bridgeManager.callJavaScriptModule(moduleName, "set", dimension);
  }
}
