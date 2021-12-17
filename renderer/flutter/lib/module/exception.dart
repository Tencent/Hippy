import '../common.dart';
import '../engine.dart';
import 'module.dart';
import 'promise.dart';

class ExceptionModule extends VoltronNativeModule {
  static const String exceptionModuleName = "ExceptionModule";
  static const String handleExceptionModule = "handleException";
  static const String handleExceptionBackgroundTracing =
      "handleBackgroundTracing";

  ExceptionModule(EngineContext context) : super(context);

  @override
  Map<String, Function> get extraFuncMap => {
        handleExceptionModule: handleException,
      };

  @override
  String get moduleName => exceptionModuleName;

  @VoltronMethod(handleExceptionModule)
  bool handleException(
      String title, String details, int exceptionId, JSPromise promise) {
    context.handleException(JsError(title, details));
    return false;
  }

  @VoltronMethod(handleExceptionBackgroundTracing)
  bool handleBackgroundTracing(String details, JSPromise promise) {
    context.globalConfigs.exceptionHandlerAdapter
        ?.handleBackgroundTracing(details);
    return false;
  }
}
