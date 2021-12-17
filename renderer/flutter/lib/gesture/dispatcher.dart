import 'dart:collection';

import 'package:flutter/cupertino.dart';

import '../engine.dart';
import '../style.dart';
import 'handle.dart';
import 'processor.dart';

class NativeGestureDispatcher implements GestureHandleCallback {
  static const String tag = "NativeGestureDispatcher";

  final int _id;
  final EngineContext _context;
  NativeGestureProcessor? _gestureProcessor;

  bool clickable = false;
  bool longClickable = false;
  bool interceptTouchEvent = false;

  bool listenAttachedToWindow = false;
  bool listenDetachedFromWindow = false;

  bool get enableScroll => false;

  bool get canClick => clickable;
  bool get canLongClick => longClickable;

  final HashSet<String> _gestureTypes = HashSet();

  NativeGestureDispatcher({required int id, required EngineContext context})
      : _id = id,
        _context = context;

  @override
  void handle(String type, double x, double y) {
    if (type == NodeProps.onPressIn) {
      NativeGestureHandle.handlePressIn(_context, _id);
    } else if (type == NodeProps.onPressOut) {
      NativeGestureHandle.handlePressOut(_context, _id);
    } else if (type == NodeProps.onTouchDown) {
      NativeGestureHandle.handleTouchDown(_context, _id, x, y, _id);
    } else if (type == NodeProps.onTouchMove) {
      NativeGestureHandle.handleTouchMove(_context, _id, x, y, _id);
    } else if (type == NodeProps.onTouchEnd) {
      NativeGestureHandle.handleTouchEnd(_context, _id, x, y, _id);
    } else if (type == NodeProps.onTouchCancel) {
      NativeGestureHandle.handleTouchCancel(_context, _id, x, y, _id);
    }
  }

  @override
  bool needHandle(String type) {
    var result = _gestureTypes.contains(type);
    if (!result &&
        !(type == NodeProps.onInterceptTouchEvent) &&
        !(type == NodeProps.onInterceptPullUpEvent)) {
      if (needHandle(NodeProps.onInterceptTouchEvent) ||
          needHandle(NodeProps.onInterceptPullUpEvent)) {
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

  void handleClick() {
    if (clickable) {
      NativeGestureHandle.handleClick(_context, _id);
    }
  }

  void handleLongClick() {
    if (longClickable) {
      NativeGestureHandle.handleLongClick(_context, _id);
    }
  }

  void handleOnAttached() {
    if (listenAttachedToWindow) {
      NativeGestureHandle.handleAttachedToWindow(_context, _id);
    }
  }

  void handleOnDetached() {
    if (listenDetachedFromWindow) {
      NativeGestureHandle.handleDetachedFromWindow(_context, _id);
    }
  }

  void handleOnTouchEvent(PointerEvent event) {
    if (_gestureProcessor == null) {
      _gestureProcessor = NativeGestureProcessor(callback: this);
    }
    _gestureProcessor!.onTouchEvent(event);
  }

  void addGestureType(String type) {
    print('addGestureType:$type');
    _gestureTypes.add(type);
  }

  void removeGestureType(String type) {
    _gestureTypes.remove(type);
  }
}
