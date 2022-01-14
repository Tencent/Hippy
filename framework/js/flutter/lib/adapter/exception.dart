import 'package:voltron_renderer/voltron_renderer.dart';

class ExceptionHandlerAdapter {
  void handleJsException(JsError exception) {}

  void handleNativeException(Error error, bool haveCaught) {}

  void handleBackgroundTracing(String details) {}
}
