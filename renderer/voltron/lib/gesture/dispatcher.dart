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

import 'dart:collection';

import 'package:flutter/cupertino.dart';

import '../render.dart';
import 'handle.dart';
import 'processor.dart';
import 'type.dart';

class NativeGestureDispatcherManager {
  static final NativeGestureDispatcherManager _singleton = NativeGestureDispatcherManager();

  static NativeGestureDispatcherManager getInstance() {
    return _singleton;
  }

  final List<PointerEvent> _pointerEventHistory = [];

  void addPointEvent(PointerEvent event) {
    var original = event.original;
    if (original != null) {
      if (!_pointerEventHistory.contains(original)) {
        _pointerEventHistory.add(original);
      }
    }
  }

  bool judgeExist(PointerEvent event) {
    var original = event.original;
    if (original != null) {
      if (_pointerEventHistory.contains(original)) {
        return true;
      } else {
        _pointerEventHistory.add(original);
        if (_pointerEventHistory.length > 50) {
          _pointerEventHistory.removeRange(0, 30);
        }
      }
    }
    return false;
  }
}

class NativeGestureDispatcher implements GestureHandleCallback {
  static const String kTag = "NativeGestureDispatcher";

  final int _id;
  final int _rootId;
  final RenderContext _context;
  NativeGestureProcessor? _gestureProcessor;

  bool interceptTouchEvent = false;

  bool listenAttachedToWindow = false;
  bool listenDetachedFromWindow = false;

  bool get enableScroll => false;

  final HashSet<GestureType> _gestureTypes = HashSet();

  NativeGestureDispatcher({
    required int rootId,
    required int id,
    required RenderContext context,
  })  : _id = id,
        _rootId = rootId,
        _context = context;

  @override
  void handle(GestureType type, double x, double y) {
    switch (type) {
      case GestureType.pressIn:
        NativeGestureHandle.handlePressIn(_context, _id, _rootId);
        break;
      case GestureType.pressOut:
        NativeGestureHandle.handlePressOut(_context, _id, _rootId);
        break;
      case GestureType.touchDown:
        NativeGestureHandle.handleTouchDown(_context, _id, _rootId, x, y);
        break;
      case GestureType.touchMove:
        NativeGestureHandle.handleTouchMove(_context, _id, _rootId, x, y);
        break;
      case GestureType.touchEnd:
        NativeGestureHandle.handleTouchEnd(_context, _id, _rootId, x, y);
        break;
      case GestureType.touchCancel:
        NativeGestureHandle.handleTouchCancel(_context, _id, _rootId, x, y);
        break;
      case GestureType.interceptTouchEvent:
        break;
      case GestureType.interceptPullUpEvent:
        break;
    }
  }

  @override
  bool needHandle(GestureType type) {
    var result = _gestureTypes.contains(type);
    if (!result &&
        !(type == GestureType.interceptTouchEvent) &&
        !(type == GestureType.interceptPullUpEvent)) {
      if (needHandle(GestureType.interceptTouchEvent) ||
          needHandle(GestureType.interceptPullUpEvent)) {
        return true;
      }
    }

    return result;
  }

  bool needListener() {
    if (_gestureTypes.isEmpty) {
      return false;
    }
    return true;
  }

  void handlePressIn() {
    if (needHandle(GestureType.pressIn)) {
      NativeGestureHandle.handlePressIn(_context, _id, _rootId);
    }
  }

  void handlePressOut() {
    if (needHandle(GestureType.pressOut)) {
      NativeGestureHandle.handlePressOut(_context, _id, _rootId);
    }
  }

  void handleClick() {
    if (needHandle(GestureType.click)) {
      NativeGestureHandle.handleClick(_context, _id, _rootId);
    }
  }

  void handleLongClick() {
    if (needHandle(GestureType.longClick)) {
      NativeGestureHandle.handleLongClick(_context, _id, _rootId);
    }
  }

  void handleOnAttached() {
    if (listenAttachedToWindow) {
      NativeGestureHandle.handleAttachedToWindow(_context, _id, _rootId);
    }
  }

  void handleOnDetached() {
    if (listenDetachedFromWindow) {
      NativeGestureHandle.handleDetachedFromWindow(_context, _id, _rootId);
    }
  }

  void handleOnTouchEvent(PointerEvent event) {
    if (NativeGestureDispatcherManager.getInstance().judgeExist(event)) {
      return;
    }
    _gestureProcessor ??= NativeGestureProcessor(callback: this);
    _gestureProcessor!.onTouchEvent(event);
  }

  void addGestureType(GestureType type) {
    _gestureTypes.add(type);
  }

  void removeGestureType(GestureType type) {
    _gestureTypes.remove(type);
  }
}
