import '../common.dart';
import '../engine.dart';
import 'module.dart';
import 'promise.dart';

class ExceptionModule extends VoltronNativeModule {
  static const String kExceptionModuleName = "ExceptionModule";
  static const String kHandleExceptionModule = "handleException";
  static const String kHandleExceptionBackgroundTracing =
      "handleBackgroundTracing";

  ExceptionModule(EngineContext context) : super(context);

  @override
  Map<String, Function> get extraFuncMap => {
        kHandleExceptionModule: handleException,
      };

  @override
  String get moduleName => kExceptionModuleName;

  @VoltronMethod(kHandleExceptionModule)
  bool handleException(
      String title, String details, int exceptionId, JSPromise promise) {
    context.handleException(JsError(title, details));
    return false;
  }

  @VoltronMethod(kHandleExceptionBackgroundTracing)
  bool handleBackgroundTracing(String details, JSPromise promise) {
    context.globalConfigs.exceptionHandlerAdapter
        ?.handleBackgroundTracing(details);
    return false;
  }
}
