import '../engine.dart';
import '../util.dart';
import 'module.dart';
import 'promise.dart';

class ConsoleModule extends VoltronNativeModule {
  static const String kConsoleModuleName = "ConsoleModule";
  static const String kConsoleLog = "log";
  static const String kConsoleWarn = "warn";
  static const String kConsoleInfo = "info";
  static const String kConsoleError = "error";

  ConsoleModule(EngineContext context) : super(context);

  @VoltronMethod(kConsoleLog)
  bool log(String message, JSPromise promise) {
    LogUtils.d("Voltron_console", message);
    return false;
  }

  @VoltronMethod(kConsoleWarn)
  bool warn(String message, JSPromise promise) {
    LogUtils.w("Voltron_console", message);
    return false;
  }

  @VoltronMethod(kConsoleInfo)
  bool info(String message, JSPromise promise) {
    LogUtils.i("Voltron_console", message);
    return false;
  }

  @VoltronMethod(kConsoleError)
  bool error(String message, JSPromise promise) {
    LogUtils.e("Voltron_console", message);
    return false;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kConsoleLog: log,
        kConsoleWarn: warn,
        kConsoleInfo: info,
        kConsoleError: error
      };

  @override
  String get moduleName => kConsoleModuleName;
}
