import '../common/error.dart';

class ExceptionHandlerAdapter {
  void handleJsException(JsError exception) {}

  void handleNativeException(Error error, bool haveCaught) {}

  void handleBackgroundTracing(String details) {}
}
