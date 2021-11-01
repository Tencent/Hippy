import '../engine/engine_context.dart';
import '../util/log_util.dart';
import 'module.dart';
import 'promise.dart';

class ConsoleModule extends VoltronNativeModule {
  static const String consoleModuleName = "ConsoleModule";
  static const String consoleLog = "log";
  static const String consoleWarn = "warn";
  static const String consoleInfo = "info";
  static const String consoleError = "error";

  ConsoleModule(EngineContext context) : super(context);

  @VoltronMethod(consoleLog)
  bool log(String message, Promise promise) {
    LogUtils.d("Voltron_console", message);
    return false;
  }

  @VoltronMethod(consoleWarn)
  bool warn(String message, Promise promise) {
    LogUtils.w("Voltron_console", message);
    return false;
  }

  @VoltronMethod(consoleInfo)
  bool info(String message, Promise promise) {
    LogUtils.i("Voltron_console", message);
    return false;
  }

  @VoltronMethod(consoleError)
  bool error(String message, Promise promise) {
    LogUtils.e("Voltron_console", message);
    return false;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        consoleLog: log,
        consoleWarn: warn,
        consoleInfo: info,
        consoleError: error
      };

  @override
  String get moduleName => consoleModuleName;
}
