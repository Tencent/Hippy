import 'package:voltron_renderer/render.dart';

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

  static void handleClick(RenderContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kClick, {});
    LogUtils.d(kTag, "send msg: $kClick");
  }

  static void handleLongClick(RenderContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kLongClick, {});
  }

  static void handleAttachedToWindow(RenderContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kShow, {});
  }

  static void handleDetachedFromWindow(RenderContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kDismiss, {});
  }

  static void handlePressIn(RenderContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kPressIn, {});
    LogUtils.d(kTag, "send msg: $kPressIn");
  }

  static void handlePressOut(RenderContext context, int nodeId, int rootId) {
    context.bridgeManager
        .execNativeEvent(rootId, nodeId, kPressOut, {});
    LogUtils.d(kTag, "send msg: $kPressOut");
  }

  static void handleTouchDown(RenderContext context, int nodeId, int rootId, double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchDown, {kKeyPageX: x, kKeyPageY: y});
  }

  static void handleTouchMove(RenderContext context, int nodeId, int rootId, double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchMove, {kKeyPageX: x, kKeyPageY: y});
  }

  static void handleTouchEnd(RenderContext context, int nodeId, int rootId, double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchEnd, {kKeyPageX: x, kKeyPageY: y});
  }

  static void handleTouchCancel(RenderContext context, int nodeId, int rootId,
      double x, double y) {
    context.bridgeManager.execNativeEvent(
        rootId, nodeId, kTouchCancel, {kKeyPageX: x, kKeyPageY: y});
  }
}
