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
  static const String kClick = 'click';
  static const String kLongClick = 'longclick';
  static const String kPressIn = 'pressin';
  static const String kPressOut = 'pressout';
  static const String kTouchDown = 'touchstart';
  static const String kTouchEnd = 'touchend';
  static const String kTouchMove = 'touchmove';
  static const String kTouchCancel = 'touchcancel';

  static void handleClick(EngineContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kClick, {});
    LogUtils.d(kTag, "send msg: $kClick");
  }

  static void handleLongClick(EngineContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kLongClick, {});
  }

  static void handleAttachedToWindow(
      EngineContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, NodeProps.kOnAttachedToWindow, {});
  }

  static void handleDetachedFromWindow(
      EngineContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, NodeProps.kOnDetachedFromWindow, {});
  }

  static void handlePressIn(EngineContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kPressIn, {});
    LogUtils.d(kTag, "send msg: $kPressIn");
  }

  static void handlePressOut(EngineContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kPressOut, {});
    LogUtils.d(kTag, "send msg: $kPressOut");
  }

  static void handleTouchDown(
      EngineContext context, int nodeId, int rootId, double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchDown, {kKeyPageX: x, kKeyPageY: y});
  }

  static void handleTouchMove(
      EngineContext context, int nodeId, int rootId, double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchMove, {kKeyPageX: x, kKeyPageY: y});
  }

  static void handleTouchEnd(
      EngineContext context, int nodeId, int rootId, double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchEnd, {kKeyPageX: x, kKeyPageY: y});
  }

  static void handleTouchCancel(EngineContext context, int nodeId, int rootId,
      double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchCancel, {kKeyPageX: x, kKeyPageY: y});
  }
}
