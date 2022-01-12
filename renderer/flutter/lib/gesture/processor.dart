import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';

import '../style.dart';

class NativeGestureProcessor {
  static const int kPressIn = 1;
  static const int kPressOut = 2;

  bool _noPressIn = false;
  final GestureHandleCallback _gestureCallback;

  final _GestureHandler _handler = _GestureHandler();

  double _lastPressInX = 0;
  double _lastPressInY = 0;

  NativeGestureProcessor({required GestureHandleCallback callback})
      : _gestureCallback = callback;

  set noPressIn(bool noPressIn) {
    _noPressIn = noPressIn;
  }

  bool onTouchEvent(PointerEvent event) {
    var handle = false;
    if (event is PointerDownEvent) {
      // down
      if (_gestureCallback.needHandle(NodeProps.kOnPressIn)) {
        _noPressIn = false;
        _lastPressInX = event.position.dx;
        _lastPressInY = event.position.dy;
        _handler.sendDelayMessage(NodeProps.kOnPressIn, () {
          _gestureCallback.handle(NodeProps.kOnPressIn, -1, -1);
        });
        handle = true;
      } else {
        _noPressIn = true;
      }

      if (_gestureCallback.needHandle(NodeProps.kOnTouchDown)) {
        _gestureCallback.handle(
            NodeProps.kOnTouchDown, event.position.dx, event.position.dy);
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.kOnTouchMove)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.kOnTouchEnd)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.kOnTouchCancel)) {
        handle = true;
      }
    } else if (event is PointerMoveEvent) {
      // move
      if (_gestureCallback.needHandle(NodeProps.kOnTouchMove)) {
        _gestureCallback.handle(
            NodeProps.kOnTouchMove, event.position.dx, event.position.dy);
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.kOnTouchEnd)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.kOnTouchCancel)) {
        handle = true;
      }

      if (!_noPressIn) {
        var distX = (event.position.dx - _lastPressInX).abs();
        var distY = (event.position.dy - _lastPressInY).abs();
        if (distX > kTouchSlop || distY > kTouchSlop) {
          _handler.removeMessage(NodeProps.kOnPressIn);
          _noPressIn = true;
        }
      }
    } else if (event is PointerUpEvent) {
      // up
      if (_gestureCallback.needHandle(NodeProps.kOnTouchEnd)) {
        _gestureCallback.handle(
            NodeProps.kOnTouchEnd, event.position.dx, event.position.dy);
        handle = true;
      }

      if (_noPressIn && _gestureCallback.needHandle(NodeProps.kOnPressOut)) {
        _gestureCallback.handle(
            NodeProps.kOnPressOut, event.position.dx, event.position.dy);
        handle = true;
      } else if (!_noPressIn &&
          _gestureCallback.needHandle(NodeProps.kOnPressOut)) {
        _handler.sendDelayMessage(NodeProps.kOnPressOut, () {
          _gestureCallback.handle(NodeProps.kOnPressOut, -1, -1);
        });
        handle = true;
      }
    } else if (event is PointerCancelEvent) {
      // cancel
      if (_gestureCallback.needHandle(NodeProps.kOnTouchCancel)) {
        _gestureCallback.handle(
            NodeProps.kOnTouchCancel, event.position.dx, event.position.dy);
        handle = true;
      }

      if (_noPressIn && _gestureCallback.needHandle(NodeProps.kOnPressOut)) {
        _gestureCallback.handle(
            NodeProps.kOnPressOut, event.position.dx, event.position.dy);
        handle = true;
      } else if (!_noPressIn &&
          _gestureCallback.needHandle(NodeProps.kOnPressOut)) {
        _handler.removeMessage(NodeProps.kOnPressIn);
        _handler.sendDelayMessage(NodeProps.kOnPressOut, () {
          _gestureCallback.handle(NodeProps.kOnPressOut, -1, -1);
        });
        handle = true;
      }
    }
    return handle;
  }
}

abstract class GestureHandleCallback {
  bool needHandle(String type);

  void handle(String type, double x, double y);
}

class _GestureHandler {
  static const Duration kTapTimeout = kDoubleTapTimeout;
  Map<String, Timer> messageMap = {};

  _GestureHandler();

  void sendDelayMessage(String type, GestureExecutor executor) {
    removeMessage(type);

    messageMap[type] = Timer(kTapTimeout, () {
      executor();
      removeMessage(type);
    });
  }

  void removeMessage(String type) {
    var oldMessage = messageMap[type];
    if (oldMessage != null) {
      oldMessage.cancel();
      messageMap.remove(type);
    }
  }
}

typedef GestureExecutor = void Function();
