//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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

import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:voltron_renderer/common.dart';

import '../render.dart';
import '../viewmodel.dart';
import 'dispatcher.dart';

class NativeScrollGestureDispatcher extends NativeGestureDispatcher {
  late int _rootId;
  late RenderContext _context;

  bool scrollBeginDragEventEnable = false;
  bool scrollEndDragEventEnable = false;
  bool momentumScrollBeginEventEnable = false;
  bool momentumScrollEndEventEnable = false;
  bool scrollEventEnable = false;
  bool endReachedEventEnable = false;
  bool scrollEnable = true;
  int scrollEventThrottle = 400;
  int preloadItemNumber = 0;
  bool appearEventEnable = false;
  bool disAppearEventEnable = false;
  bool willAppearEventEnable = false;
  bool willDisAppearEventEnable = false;
  Set<int> appearEventEnableIdList = {};
  Set<int> disAppearEventEnableIdList = {};
  Set<int> willAppearEventEnableIdList = {};
  Set<int> willDisAppearEventEnableIdList = {};
  Stopwatch stopwatch = Stopwatch();

  NativeScrollGestureDispatcher({
    required int rootId,
    required int id,
    required RenderContext context,
  }) : super(rootId: rootId, id: id, context: context) {
    _rootId = rootId;
    _context = context;
  }

  @override
  bool get enableScroll => scrollEnable;

  bool get exposureEventEnabled =>
      appearEventEnable ||
      disAppearEventEnable ||
      willAppearEventEnable ||
      willDisAppearEventEnable ||
      appearEventEnableIdList.isNotEmpty ||
      disAppearEventEnableIdList.isNotEmpty ||
      willAppearEventEnableIdList.isNotEmpty ||
      willDisAppearEventEnableIdList.isNotEmpty;

  bool get needListenScroll =>
      scrollBeginDragEventEnable ||
      scrollEndDragEventEnable ||
      momentumScrollBeginEventEnable ||
      momentumScrollEndEventEnable ||
      scrollEventEnable ||
      endReachedEventEnable ||
      exposureEventEnabled;

  void handleScrollBegin(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    if (scrollBeginDragEventEnable) {
      _ScrollEventHelper.emitScrollBeginDragEvent(
        view,
        scrollX,
        scrollY,
      );
    }
  }

  void handleScrollEnd(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    if (scrollEndDragEventEnable) {
      _ScrollEventHelper.emitScrollEndDragEvent(
        view,
        scrollX,
        scrollY,
      );
    }
  }

  void handleScrollMomentumBegin(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    if (momentumScrollBeginEventEnable) {
      _ScrollEventHelper.emitScrollMomentumBeginEvent(
        view,
        scrollX,
        scrollY,
      );
    }
  }

  void handleScrollReachedEnd(RenderViewModel view) {
    view.context.renderBridgeManager.sendComponentEvent(
      _rootId,
      view.id,
      "endreached",
      {},
    );
  }

  void handleScrollMomentumEnd(
    RenderViewModel viewModel,
    double scrollX,
    double scrollY,
  ) {
    if (momentumScrollEndEventEnable) {
      _ScrollEventHelper.emitScrollMomentumEndEvent(
        viewModel,
        scrollX,
        scrollY,
      );
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

  void sendExposureEvent(
      RenderViewModel listViewModel, RenderViewModel listItemViewModel, String eventName) {
    _context.renderBridgeManager.sendComponentEvent(
      _rootId,
      listItemViewModel.id,
      eventName,
      {},
    );
  }
}

class _ScrollEventHelper {
  static const String kEventTypeBeginDrag = "scrollBeginDrag";
  static const String kEventTypeEndDrag = "scrollEndDrag";
  static const String kEventTypeScroll = "scroll";
  static const String kEventTypeMomentumBegin = "momentumScrollBegin";
  static const String kEventTypeMomentumEnd = "momentumScrollEnd";

  static void emitScrollEvent(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    _doEmitScrollEvent(
      view,
      kEventTypeScroll,
      scrollX,
      scrollY,
    );
  }

  static void emitScrollBeginDragEvent(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    _doEmitScrollEvent(
      view,
      kEventTypeBeginDrag,
      scrollX,
      scrollY,
    );
  }

  static void emitScrollEndDragEvent(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    _doEmitScrollEvent(
      view,
      kEventTypeEndDrag,
      scrollX,
      scrollY,
    );
  }

  static void emitScrollMomentumBeginEvent(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    _doEmitScrollEvent(
      view,
      kEventTypeMomentumBegin,
      scrollX,
      scrollY,
    );
  }

  static void emitScrollMomentumEndEvent(
    RenderViewModel view,
    double scrollX,
    double scrollY,
  ) {
    _doEmitScrollEvent(
      view,
      kEventTypeMomentumEnd,
      scrollX,
      scrollY,
    );
  }

  static void _doEmitScrollEvent(
    RenderViewModel viewModel,
    String scrollEventType,
    double scrollX,
    double scrollY,
  ) {
    var contentInset = {};
    contentInset["top"] = 0;
    contentInset["bottom"] = 0;
    contentInset["left"] = 0;
    contentInset["right"] = 0;

    var contentOffset = {};
    contentOffset["x"] = scrollX;
    contentOffset["y"] = scrollY;

    var firstChildSize = _firstChildSize(viewModel);
    var currentSize = _currentSize(viewModel);
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

    var params = VoltronMap.fromMap(event);

    viewModel.context.renderBridgeManager.sendComponentEvent(
      viewModel.rootId,
      viewModel.id,
      scrollEventType,
      params,
    );
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
