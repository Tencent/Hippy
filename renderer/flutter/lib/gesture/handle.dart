import '../common/voltron_map.dart';
import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../util/enum_util.dart';
import '../util/log_util.dart';

class NativeGestureHandle {
  static const String tag = "NativeGestureHandle";
  static const String keyEventName = "name";
  static const String keyTagId = "id";
  static const String keyPageX = "page_x";
  static const String keyPageY = "page_y";

  static void handleClick(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onClick);
    params.push(keyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
    LogUtils.d(tag, "send msg: ${NodeProps.onClick}");
  }

  static void handleLongClick(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onLongClick);
    params.push(keyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleAttachedToWindow(EngineContext context, int tagId) {
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(tagId, NodeProps.onAttachedToWindow, null);
  }

  static void handleDetachedFromWindow(EngineContext context, int tagId) {
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(tagId, NodeProps.onDetachedFromWindow, null);
  }

  static void handlePressIn(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onPressIn);
    params.push(keyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
    LogUtils.d(tag, "send msg: ${NodeProps.onPressIn}");
  }

  static void handlePressOut(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onPressOut);
    params.push(keyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
    LogUtils.d(tag, "send msg: ${NodeProps.onPressIn}");
  }

  static void handleTouchDown(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onTouchDown);
    params.push(keyTagId, tagId);
    params.push(keyPageX, x);
    params.push(keyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleTouchMove(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onTouchMove);
    params.push(keyTagId, tagId);
    params.push(keyPageX, x);
    params.push(keyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleTouchEnd(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onTouchEnd);
    params.push(keyTagId, tagId);
    params.push(keyPageX, x);
    params.push(keyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleTouchCancel(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(keyEventName, NodeProps.onTouchCancel);
    params.push(keyTagId, tagId);
    params.push(keyPageX, x);
    params.push(keyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }
}
