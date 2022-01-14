import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import '../module.dart';

class JSNativeEventHandler with NativeEventHandler {
  final EngineContext _engineContext;

  JSNativeEventHandler(this._engineContext);

  @override
  void receiveNativeEvent(String eventName, Object? param) {
    _engineContext.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeEvent(eventName, param);
  }

  @override
  void receiveNativeGesture(VoltronMap param) {
    _engineContext.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(param);
  }

  @override
  void receiveUIComponentEvent(int tagId, String eventName, Object? param) {
    _engineContext.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(tagId, eventName, param);
  }
}
