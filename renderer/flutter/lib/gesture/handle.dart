import '../common.dart';
import '../engine.dart';
import '../module.dart';
import '../style.dart';
import '../util.dart';

class NativeGestureHandle {
  static const String kTag = "NativeGestureHandle";
  static const String kKeyEventName = "name";
  static const String kKeyTagId = "id";
  static const String kKeyPageX = "page_x";
  static const String kKeyPageY = "page_y";

  static void handleClick(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnClick);
    params.push(kKeyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
    LogUtils.d(kTag, "send msg: ${NodeProps.kOnClick}");
  }

  static void handleLongClick(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnLongClick);
    params.push(kKeyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleAttachedToWindow(EngineContext context, int tagId) {
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(tagId, NodeProps.kOnAttachedToWindow, null);
  }

  static void handleDetachedFromWindow(EngineContext context, int tagId) {
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(tagId, NodeProps.kOnDetachedFromWindow, null);
  }

  static void handlePressIn(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnPressIn);
    params.push(kKeyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
    LogUtils.d(kTag, "send msg: ${NodeProps.kOnPressIn}");
  }

  static void handlePressOut(EngineContext context, int tagId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnPressOut);
    params.push(kKeyTagId, tagId);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
    LogUtils.d(kTag, "send msg: ${NodeProps.kOnPressIn}");
  }

  static void handleTouchDown(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnTouchDown);
    params.push(kKeyTagId, tagId);
    params.push(kKeyPageX, x);
    params.push(kKeyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleTouchMove(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnTouchMove);
    params.push(kKeyTagId, tagId);
    params.push(kKeyPageX, x);
    params.push(kKeyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleTouchEnd(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnTouchEnd);
    params.push(kKeyTagId, tagId);
    params.push(kKeyPageX, x);
    params.push(kKeyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }

  static void handleTouchCancel(
      EngineContext context, int tagId, double x, double y, int viewId) {
    var params = VoltronMap();
    params.push(kKeyEventName, NodeProps.kOnTouchCancel);
    params.push(kKeyTagId, tagId);
    params.push(kKeyPageX, x);
    params.push(kKeyPageY, y);
    context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveNativeGesture(params);
  }
}
