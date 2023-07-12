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

import 'dart:convert';
import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';
import 'package:voltron_renderer/common/voltron_map.dart';

import '../common/promise.dart';
import '../common/voltron_array.dart';
import '../viewmodel/view_model.dart';
import 'log_util.dart';

/// devtools utils for screenshot
class DevtoolsUtil {
  static const String kTag = "DevtoolsUtil";
  static const String kGetScreenShot = "getScreenShot";
  static const String kAddFrameCallback = "addFrameCallback";
  static const String kRemoveFrameCallback = "removeFrameCallback";
  static const String kGetLocationOnScreen = "getLocationOnScreen";
  static const String kScreenShot = "screenShot";
  static const String kScreenWidth = "width";
  static const String kScreenHeight = "height";
  static const String kScreenScale = "screenScale";
  static const String kFrameCallbackId = "frameCallbackId";
  static const String kXOnScreen = "xOnScreen";
  static const String kYOnScreen = "yOnScreen";
  static const String kViewWidth = "viewWidth";
  static const String kViewHeight = "viewHeight";
  static final Map _callbacks = <int, Promise>{};

  static void onPostFrame(Duration timeStamp) {
    _callbacks.forEach((key, value) {
      value.resolve(VoltronMap());
    });
    if (_callbacks.isNotEmpty) {
      SchedulerBinding.instance.addPostFrameCallback(onPostFrame);
    }
  }

  static void addFrameCallback(RenderViewModel viewModel, VoltronArray array, Promise? promise) {
    if (array.size() > 0) {
      final paramsMap = array.get<VoltronMap>(0);
      final callbackId = paramsMap?.get<int>(kFrameCallbackId);
      _callbacks[callbackId] = promise;
      SchedulerBinding.instance.addPostFrameCallback(onPostFrame);
    }
  }

  static void removeFrameCallback(RenderViewModel viewModel, VoltronArray array, Promise? promise) {
    if (array.size() > 0) {
      final paramsMap = array.get<VoltronMap>(0);
      final callbackId = paramsMap?.get<int>(kFrameCallbackId);
      _callbacks.remove(callbackId);
    }
  }

  static Future<void> getScreenShot(RenderViewModel viewModel, VoltronArray array, Promise? promise) async {
    if (promise == null) {
      return;
    }

    /// find rootKey
    final globalKey = viewModel.context.getInstance(viewModel.rootId)?.rootKey;
    final renderObject = globalKey?.currentContext?.findRenderObject();
    if (globalKey == null) {
      LogUtils.e(kTag, "getScreenShot globalKey == null");
      return;
    }

    /// catch screenshot and encode base64
    final boundary = renderObject as RenderRepaintBoundary;
    final image = await boundary.toImage();
    final byteData = await image.toByteData(format: ImageByteFormat.png);
    final pngByteList = byteData?.buffer.asUint8List();
    final base64Content = pngByteList == null ? "" : base64Encode(pngByteList);

    /// promise callback
    final resultMap = VoltronMap();
    resultMap.push(kScreenShot, base64Content);

    final mediaQuery = MediaQueryData.fromWindow(window);
    final deviceWidth = mediaQuery.size.width.round();
    final deviceHeight = mediaQuery.size.height.round();
    resultMap.push(kScreenWidth, deviceWidth);
    resultMap.push(kScreenHeight, deviceHeight);
    resultMap.push(kScreenScale, 1.0);
    promise.resolve(resultMap);
  }

  static Future<void> getLocationOnScreen(
      RenderViewModel viewModel, VoltronArray array, Promise? promise) async {
    if (promise == null) {
      return;
    }
    var rootViewModel = viewModel.context.rootViewModelMap[viewModel.rootId];
    var renderObject =
        viewModel.currentContext?.findRenderObject() as RenderBox?;
    var rootRenderObject =
        rootViewModel?.currentContext?.findRenderObject() as RenderBox?;
    var x = 0.0;
    var y = 0.0;
    var width = 0.0;
    var height = 0.0;
    if (renderObject == null || rootRenderObject == null) {
      promise.reject("this view or root view is null");
    } else {
      var rootPosition = rootRenderObject.localToGlobal(Offset.zero);
      var rootX = rootPosition.dx;
      var rootY = rootPosition.dy;

      var position = renderObject.localToGlobal(Offset.zero);
      var size = renderObject.size;

      x = position.dx - rootX;
      y = position.dy - rootY;
      width = size.width;
      height = size.height;
    }

    final resultMap = VoltronMap();
    resultMap.push(kXOnScreen, x.toInt());
    resultMap.push(kYOnScreen, y.toInt());
    resultMap.push(kViewWidth, width.toInt());
    resultMap.push(kViewHeight, height.toInt());
    promise.resolve(resultMap);
  }
}
