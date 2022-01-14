import '../common.dart';

mixin NativeEventHandler {
  void receiveNativeGesture(VoltronMap param);
//   {
//   _context.moduleManager
//       .getJavaScriptModule<EventDispatcher>(
//   enumValueToString(JavaScriptModuleType.EventDispatcher))
//       ?.receiveUIComponentEvent(_id, type, null);
// }

  void receiveUIComponentEvent(int tagId, String eventName, Object? param);

  void receiveNativeEvent(String eventName, Object? param);
}
