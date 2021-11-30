import 'dart:ui';

import 'package:flutter/cupertino.dart';

import '../common/voltron_map.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../render/view_model.dart';
import '../util/enum_util.dart';
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
      {required int id, required EngineContext context})
      : super(id: id, context: context);

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
  static const String eventTypeBeginDrag = "onScrollBeginDrag";
  static const String eventTypeEndDrag = "onScrollEndDrag";
  static const String eventTypeScroll = "onScroll";
  static const String eventTypeMomentumBegin = "onMomentumScrollBegin";
  static const String eventTypeMomentumEnd = "onMomentumScrollEnd";

  static void emitScrollEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, eventTypeScroll, scrollX, scrollY);
  }

  static void emitScrollBeginDragEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, eventTypeBeginDrag, scrollX, scrollY);
  }

  static void emitScrollEndDragEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, eventTypeEndDrag, scrollX, scrollY);
  }

  static void emitScrollMomentumBeginEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, eventTypeMomentumBegin, scrollX, scrollY);
  }

  static void emitScrollMomentumEndEvent(
      RenderViewModel view, double scrollX, double scrollY) {
    _doEmitScrollEvent(view, eventTypeMomentumEnd, scrollX, scrollY);
  }

  static void _doEmitScrollEvent(RenderViewModel view, String scrollEventType,
      double scrollX, double scrollY) {
    var contentInset = VoltronMap();
    contentInset.push("top", 0);
    contentInset.push("bottom", 0);
    contentInset.push("left", 0);
    contentInset.push("right", 0);

    var contentOffset = VoltronMap();
    contentOffset.push("x", scrollX);
    contentOffset.push("y", scrollY);

    var firstChildSize = _firstChildSize(view);
    var currentSize = _currentSize(view);
    var contentSize = VoltronMap();
    contentSize.push("width", firstChildSize.width);
    contentSize.push("height", firstChildSize.height);

    var layoutMeasurement = VoltronMap();
    layoutMeasurement.push("width", currentSize.width);
    layoutMeasurement.push("height", currentSize.height);

    var event = VoltronMap();
    event.push("contentInset", contentInset);
    event.push("contentOffset", contentOffset);
    event.push("contentSize", contentSize);
    event.push("layoutMeasurement", layoutMeasurement);

    view.context.moduleManager
        .getJavaScriptModule<EventDispatcher>(
            enumValueToString(JavaScriptModuleType.EventDispatcher))
        ?.receiveUIComponentEvent(view.id, scrollEventType, event);
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
