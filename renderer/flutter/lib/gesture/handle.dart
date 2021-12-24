import '../common.dart';
import '../engine.dart';
import '../module.dart';
import '../style.dart';
import '../util.dart';

class NativeGestureHandle {
  // hippy 3.0重构了底层touch event的使用方式
  // 但是同时也保留了对旧的方式的支持
  // 由于android新的touch使用方式没有调通，直接执行会js error
  // 使用这个参数控制新旧逻辑的切换
  static const bool kUseOldTouch = true;

  static const String kTag = "NativeGestureHandle";
  static const String kKeyEventName = "name";
  static const String kKeyTagId = "id";
  static const String kKeyPageX = "page_x";
  static const String kKeyPageY = "page_y";
  static const String kClick = 'click';
  static const String kLongClick = 'longclick';
  static const String kPressIn = 'pressin';
  static const String kPressOut = 'pressout';
  static const String kTouchDown = 'touchstart';
  static const String kTouchEnd = 'touchend';
  static const String kTouchMove = 'touchmove';
  static const String kTouchCancel = 'touchcancel';
  static const String kShow = 'show';
  static const String kDismiss = 'dismiss';

  static void handleClick(EngineContext context, int nodeId, int rootId) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnClick);
      params.push(kKeyTagId, nodeId);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager
          .execNativeEvent(rootId, nodeId, kClick, {});
    }
    LogUtils.d(kTag, "send msg: $kClick");
  }

  static void handleLongClick(EngineContext context, int nodeId, int rootId) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnLongClick);
      params.push(kKeyTagId, nodeId);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager
          .execNativeEvent(rootId, nodeId, kLongClick, {});
    }
  }

  static void handleAttachedToWindow(
      EngineContext context, int nodeId, int rootId) {
    if (kUseOldTouch) {
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveUIComponentEvent(nodeId, NodeProps.kOnAttachedToWindow, null);
    } else {
      context.bridgeManager
          .execNativeEvent(rootId, nodeId, kShow, {});
    }
  }

  static void handleDetachedFromWindow(
      EngineContext context, int nodeId, int rootId) {
    if (kUseOldTouch) {
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveUIComponentEvent(nodeId, NodeProps.kOnDetachedFromWindow, null);
    } else {
      context.bridgeManager
          .execNativeEvent(rootId, nodeId, kDismiss, {});
    }
  }

  static void handlePressIn(EngineContext context, int nodeId, int rootId) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnPressIn);
      params.push(kKeyTagId, nodeId);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager
          .execNativeEvent(rootId, nodeId, kPressIn, {});
    }
    LogUtils.d(kTag, "send msg: $kPressIn");
  }

  static void handlePressOut(EngineContext context, int nodeId, int rootId) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnPressOut);
      params.push(kKeyTagId, nodeId);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager
          .execNativeEvent(rootId, nodeId, kPressOut, {});
    }
    LogUtils.d(kTag, "send msg: $kPressOut");
  }

  static void handleTouchDown(
      EngineContext context, int nodeId, int rootId, double x, double y) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnTouchDown);
      params.push(kKeyTagId, nodeId);
      params.push(kKeyPageX, x);
      params.push(kKeyPageY, y);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager.execNativeEvent(
          rootId, nodeId, kTouchDown, {kKeyPageX: x, kKeyPageY: y});
    }
  }

  static void handleTouchMove(
      EngineContext context, int nodeId, int rootId, double x, double y) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnTouchMove);
      params.push(kKeyTagId, nodeId);
      params.push(kKeyPageX, x);
      params.push(kKeyPageY, y);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager.execNativeEvent(
          rootId, nodeId, kTouchMove, {kKeyPageX: x, kKeyPageY: y});
    }
  }

  static void handleTouchEnd(
      EngineContext context, int nodeId, int rootId, double x, double y) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnTouchEnd);
      params.push(kKeyTagId, nodeId);
      params.push(kKeyPageX, x);
      params.push(kKeyPageY, y);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager.execNativeEvent(
          rootId, nodeId, kTouchEnd, {kKeyPageX: x, kKeyPageY: y});
    }
  }

  static void handleTouchCancel(EngineContext context, int nodeId, int rootId,
      double x, double y) {
    if (kUseOldTouch) {
      var params = VoltronMap();
      params.push(kKeyEventName, NodeProps.kOnTouchCancel);
      params.push(kKeyTagId, nodeId);
      params.push(kKeyPageX, x);
      params.push(kKeyPageY, y);
      context.moduleManager
          .getJavaScriptModule<EventDispatcher>(
          enumValueToString(JavaScriptModuleType.EventDispatcher))
          ?.receiveNativeGesture(params);
    } else {
      context.bridgeManager.execNativeEvent(
          rootId, nodeId, kTouchCancel, {kKeyPageX: x, kKeyPageY: y});
    }
  }
}
