//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
// All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import 'dart:async';

import 'package:flutter/gestures.dart';

import 'type.dart';

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
      if (_gestureCallback.needHandle(GestureType.pressIn)) {
        _noPressIn = false;
        _lastPressInX = event.position.dx;
        _lastPressInY = event.position.dy;
        _handler.sendDelayMessage(GestureType.pressIn, () {
          _gestureCallback.handle(GestureType.pressIn, -1, -1);
        });
        handle = true;
      } else {
        _noPressIn = true;
      }

      if (_gestureCallback.needHandle(GestureType.touchDown)) {
        _gestureCallback.handle(
            GestureType.touchDown, event.position.dx, event.position.dy);
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(GestureType.touchMove)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(GestureType.touchEnd)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(GestureType.touchCancel)) {
        handle = true;
      }
    } else if (event is PointerMoveEvent) {
      // move
      if (_gestureCallback.needHandle(GestureType.touchMove)) {
        _gestureCallback.handle(
            GestureType.touchMove, event.position.dx, event.position.dy);
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(GestureType.touchEnd)) {
        handle = true;
      }

      if (!handle && _gestureCallback.needHandle(GestureType.touchCancel)) {
        handle = true;
      }

      if (!_noPressIn) {
        var distX = (event.position.dx - _lastPressInX).abs();
        var distY = (event.position.dy - _lastPressInY).abs();
        if (distX > kTouchSlop || distY > kTouchSlop) {
          _handler.removeMessage(GestureType.pressIn);
          _noPressIn = true;
        }
      }
    } else if (event is PointerUpEvent) {
      // up
      if (_gestureCallback.needHandle(GestureType.touchEnd)) {
        _gestureCallback.handle(
            GestureType.touchEnd, event.position.dx, event.position.dy);
        handle = true;
      }

      if (_noPressIn && _gestureCallback.needHandle(GestureType.pressOut)) {
        _gestureCallback.handle(
            GestureType.pressOut, event.position.dx, event.position.dy);
        handle = true;
      } else if (!_noPressIn &&
          _gestureCallback.needHandle(GestureType.pressOut)) {
        _handler.sendDelayMessage(GestureType.pressOut, () {
          _gestureCallback.handle(GestureType.pressOut, -1, -1);
        });
        handle = true;
      }
    } else if (event is PointerCancelEvent) {
      // cancel
      if (_gestureCallback.needHandle(GestureType.touchCancel)) {
        _gestureCallback.handle(
            GestureType.touchCancel, event.position.dx, event.position.dy);
        handle = true;
      }

      if (_noPressIn && _gestureCallback.needHandle(GestureType.pressOut)) {
        _gestureCallback.handle(
            GestureType.pressOut, event.position.dx, event.position.dy);
        handle = true;
      } else if (!_noPressIn &&
          _gestureCallback.needHandle(GestureType.pressOut)) {
        _handler.removeMessage(GestureType.pressIn);
        _handler.sendDelayMessage(GestureType.pressOut, () {
          _gestureCallback.handle(GestureType.pressOut, -1, -1);
        });
        handle = true;
      }
    }
    return handle;
  }
}

abstract class GestureHandleCallback {
  bool needHandle(GestureType type);

  void handle(GestureType type, double x, double y);
}

class _GestureHandler {
  static const Duration kTapTimeout = kDoubleTapTimeout;
  Map<GestureType, Timer> messageMap = {};

  _GestureHandler();

  void sendDelayMessage(GestureType type, GestureExecutor executor) {
    removeMessage(type);

    messageMap[type] = Timer(kTapTimeout, () {
      executor();
      removeMessage(type);
    });
  }

  void removeMessage(GestureType type) {
    var oldMessage = messageMap[type];
    if (oldMessage != null) {
      oldMessage.cancel();
      messageMap.remove(type);
    }
  }
}

typedef GestureExecutor = void Function();
