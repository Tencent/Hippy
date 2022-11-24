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
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kClick,
      {},
    );
    LogUtils.d(kTag, "send msg: $kClick");
  }

  static void handleLongClick(RenderContext context, int nodeId, int rootId) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kLongClick,
      {},
    );
  }

  static void handleAttachedToWindow(RenderContext context, int nodeId, int rootId) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kShow,
      {},
    );
  }

  static void handleDetachedFromWindow(RenderContext context, int nodeId, int rootId) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kDismiss,
      {},
    );
  }

  static void handlePressIn(RenderContext context, int nodeId, int rootId) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kPressIn,
      {},
    );
    LogUtils.d(kTag, "send msg: $kPressIn");
  }

  static void handlePressOut(RenderContext context, int nodeId, int rootId) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kPressOut,
      {},
    );
    LogUtils.d(kTag, "send msg: $kPressOut");
  }

  static void handleTouchDown(RenderContext context, int nodeId, int rootId, double x, double y) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kTouchDown,
      {
        kKeyPageX: x,
        kKeyPageY: y,
      },
    );
  }

  static void handleTouchMove(
    RenderContext context,
    int nodeId,
    int rootId,
    double x,
    double y,
  ) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kTouchMove,
      {
        kKeyPageX: x,
        kKeyPageY: y,
      },
    );
  }

  static void handleTouchEnd(
    RenderContext context,
    int nodeId,
    int rootId,
    double x,
    double y,
  ) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kTouchEnd,
      {
        kKeyPageX: x,
        kKeyPageY: y,
      },
    );
  }

  static void handleTouchCancel(
    RenderContext context,
    int nodeId,
    int rootId,
    double x,
    double y,
  ) {
    context.renderBridgeManager.sendGestureEvent(
      rootId,
      nodeId,
      kTouchCancel,
      {
        kKeyPageX: x,
        kKeyPageY: y,
      },
    );
  }
}
