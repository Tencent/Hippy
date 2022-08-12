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
  static const String kScreenShot = "screenShot";
  static const String kScreenWidth = "width";
  static const String kScreenHeight = "height";
  static const String kScreenScale = "screenScale";
  static const String kFrameCallbackId = "frameCallbackId";
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
}
