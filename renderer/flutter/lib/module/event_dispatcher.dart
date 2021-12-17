import '../common.dart';
import '../engine.dart';
import 'module.dart';

class EventDispatcher extends JavaScriptModule {
  static const String moduleName = "EventDispatcher";

  EventDispatcher(EngineContext context) : super(context);

  void receiveNativeGesture(VoltronMap param) {
    context.bridgeManager
        .callJavaScriptModule(moduleName, "receiveNativeGesture", param);
  }

  void receiveUIComponentEvent(int tagId, String eventName, Object? param) {
    var array = VoltronArray();
    array.push(tagId);
    array.push(eventName);
    array.push(param);
    context.bridgeManager
        .callJavaScriptModule(moduleName, "receiveUIComponentEvent", array);
  }

  void receiveNativeEvent(String eventName, Object? param) {
    var array = VoltronArray();
    array.push(eventName);
    array.push(param);
    context.bridgeManager
        .callJavaScriptModule(moduleName, "receiveNativeEvent", array);
  }
}
