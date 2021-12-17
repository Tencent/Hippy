import 'dart:async';

import 'package:flutter/cupertino.dart';
import 'package:flutter/gestures.dart';

import '../style.dart';

class NativeGestureProcessor {
  static const int pressIn = 1;
  static const int pressOut = 2;

  static const double touchSlop = kTouchSlop;

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
      if (_gestureCallback.needHandle(NodeProps.onPressIn)) {
        _noPressIn = false;
        _lastPressInX = event.position.dx;
        _lastPressInY = event.position.dy;
        _handler.sendDelayMessage(NodeProps.onPressIn, () {
          _gestureCallback.handle(NodeProps.onPressIn, -1, -1);
        });
        handle = true;
      } else {
        _noPressIn = true;
      }

      if (_gestureCallback.needHandle(NodeProps.onTouchDown)) {
        _gestureCallback.handle(
            NodeProps.onTouchDown, event.position.dx, event.position.dy);
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.onTouchMove)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.onTouchEnd)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.onTouchCancel)) {
        handle = true;
      }
    } else if (event is PointerMoveEvent) {
      // move
      if (_gestureCallback.needHandle(NodeProps.onTouchMove)) {
        _gestureCallback.handle(
            NodeProps.onTouchMove, event.position.dx, event.position.dy);
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.onTouchEnd)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(NodeProps.onTouchCancel)) {
        handle = true;
      }

      if (!_noPressIn) {
        var distX = (event.position.dx - _lastPressInX).abs();
        var distY = (event.position.dy - _lastPressInY).abs();
        if (distX > touchSlop || distY > touchSlop) {
          _handler.removeMessage(NodeProps.onPressIn);
          _noPressIn = true;
        }
      }
    } else if (event is PointerUpEvent) {
      // up
      if (_gestureCallback.needHandle(NodeProps.onTouchEnd)) {
        _gestureCallback.handle(
            NodeProps.onTouchEnd, event.position.dx, event.position.dy);
        handle = true;
      }

      if (_noPressIn && _gestureCallback.needHandle(NodeProps.onPressOut)) {
        _gestureCallback.handle(
            NodeProps.onPressOut, event.position.dx, event.position.dy);
        handle = true;
      } else if (!_noPressIn &&
          _gestureCallback.needHandle(NodeProps.onPressOut)) {
        _handler.sendDelayMessage(NodeProps.onPressOut, () {
          _gestureCallback.handle(NodeProps.onPressOut, -1, -1);
        });
        handle = true;
      }
    } else if (event is PointerCancelEvent) {
      // cancel
      if (_gestureCallback.needHandle(NodeProps.onTouchCancel)) {
        _gestureCallback.handle(
            NodeProps.onTouchCancel, event.position.dx, event.position.dy);
        handle = true;
      }

      if (_noPressIn && _gestureCallback.needHandle(NodeProps.onPressOut)) {
        _gestureCallback.handle(
            NodeProps.onPressOut, event.position.dx, event.position.dy);
        handle = true;
      } else if (!_noPressIn &&
          _gestureCallback.needHandle(NodeProps.onPressOut)) {
        _handler.removeMessage(NodeProps.onPressIn);
        _handler.sendDelayMessage(NodeProps.onPressOut, () {
          _gestureCallback.handle(NodeProps.onPressOut, -1, -1);
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
  static const Duration tapTimeout = kDoubleTapTimeout;
  Map<String, Timer> messageMap = {};

  _GestureHandler();

  void sendDelayMessage(String type, GestureExecutor executor) {
    removeMessage(type);

    messageMap[type] = Timer(tapTimeout, () {
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
