import 'dart:ui';

import 'package:flutter/cupertino.dart';

import '../common.dart';
import '../engine.dart';
import '../module.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'dispatcher.dart';

class NativeScrollGestureDispatcher extends NativeGestureDispatcher {
  bool scrollBeginDragEventEnable = false;
  bool scrollEndDragEventEnable = false;
  bool momentumScrollBeginEventEnable = false;
  bool momentumScrollEndEventEnable = false;
  bool scrollEventEnable = true;
  bool scrollEnable = true;
  int scrollEventThrottle = 400;
  int preloadItemNumber = 0;
  Stopwatch stopwatch = Stopwatch();

  NativeScrollGestureDispatcher(
      {required int rootId, required int id, required EngineContext context})
      : super(rootId: rootId, id: id, context: context);

  @override
  bool get enableScroll => scrollEnable;

  bool get needListenScroll =>
      scrollBeginDragEventEnable ||
      scrollEndDragEventEnable ||
      momentumScrollBeginEventEnable ||
      momentumScrollEndEventEnable ||
      scrollEventEnable;

  void handleScrollBegin(RenderViewModel view, double scrollX, double scrollY) {
    if (scrollBeginDragEventEnable) {
      _ScrollEventHelper.emitScrollBeginDragEvent(view, scrollX, scrollY);
    }
  }

  void handleScrollEnd(RenderViewModel view, double scrollX, double scrollY) {
    if (scrollEndDragEventEnable) {
      _ScrollEventHelper.emitScrollEndDragEvent(view, scrollX, scrollY);
    }
  }

  void handleScrollMomentumBegin(
      RenderViewModel view, double scrollX, double scrollY) {
    if (momentumScrollBeginEventEnable) {
      _ScrollEventHelper.emitScrollMomentumBeginEvent(view, scrollX, scrollY);
    }
  }

  void handleScrollReachedEnd(RenderViewModel view) {
    view.context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(view.id, "onEndReached", null);
  }

  void handleScrollMomentumEnd(
      RenderViewModel view, double scrollX, double scrollY) {
    if (momentumScrollEndEventEnable) {
      _ScrollEventHelper.emitScrollMomentumEndEvent(view, scrollX, scrollY);
    }
  }

  void handleScroll(RenderViewModel view, double scrollX, double scrollY) {
    if (scrollEventEnable) {
      var costTime = 0;
      if (stopwatch.isRunning) {
        costTime = stopwatch.elapsedMilliseconds;
        if (costTime < scrollEventThrottle && costTime != 0) {
          return;
        }
      }

      _ScrollEventHelper.emitScrollEvent(view, scrollX, scrollY);
      stopwatch.reset();
      stopwatch.start();
    }
  }
}

class _ScrollEventHelper {
  static const String kEventTypeBeginDrag = "onScrollBeginDrag";
  static const String kEventTypeEndDrag = "onScrollEndDrag";
  static const String kEventTypeScroll = "onScroll";
  static const String kEventTypeMomentumBegin = "onMomentumScrollBegin";
  static const String kEventTypeMomentumEnd = "onMomentumScrollEnd";

  static void emitScrollEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, kEventTypeScroll, scrollX, scrollY);
  }

  static void emitScrollBeginDragEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, kEventTypeBeginDrag, scrollX, scrollY);
  }

  static void emitScrollEndDragEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, kEventTypeEndDrag, scrollX, scrollY);
  }

  static void emitScrollMomentumBeginEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, kEventTypeMomentumBegin, scrollX, scrollY);
  }

  static void emitScrollMomentumEndEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, kEventTypeMomentumEnd, scrollX, scrollY);
  }

  static void _doEmitScrollEvent(RenderViewModel view, String scrollEventType,
      double scrollX, double scrollY) {
    var contentInset = {};
    contentInset["top"] = 0;
    contentInset["bottom"] = 0;
    contentInset["left"] = 0;
    contentInset["right"] = 0;

    var contentOffset = {};
    contentOffset["x"] = scrollX;
    contentOffset["y"] = scrollY;

    var firstChildSize = _firstChildSize(view);
    var currentSize = _currentSize(view);
    var contentSize = {};
    contentSize["width"] = firstChildSize.width;
    contentSize["height"] = firstChildSize.height;

    var layoutMeasurement = {};
    layoutMeasurement['width'] = currentSize.width;
    layoutMeasurement['height'] = currentSize.height;

    var event = {};
    event["contentInset"] = contentInset;
    event["contentOffset"] = contentOffset;
    event["contentSize"] = contentSize;
    event["layoutMeasurement"] = layoutMeasurement;

    view.context.bridgeManager.execNativeEvent(view.rootId, view.id, scrollEventType, event);
  }

  static Size _firstChildSize(RenderViewModel viewModel) {
    var firstChild = viewModel.getChildAt(0);
    return findSizeOfModel(firstChild);
  }

  static Size _currentSize(RenderViewModel viewModel) {
    return findSizeOfModel(viewModel);
  }

  static Size findSizeOfModel(RenderViewModel? viewModel) {
    var width = viewModel?.width;
    var height = viewModel?.height;
    if (width != null && height != null) {
      return Size(width, height);
    }
    return Size.zero;
  }
}
