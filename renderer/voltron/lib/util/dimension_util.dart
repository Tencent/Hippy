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

import 'package:flutter/widgets.dart';

import '../common.dart';
import 'screen_util.dart';

VoltronMap getDimensions(
    int windowWidth, int windowHeight, bool shouldUseScreenDisplay, BuildContext? context) {
  var dimensionMap = VoltronMap();
  var windowDisplayMetricsMap = VoltronMap();

  final screenDensity = ScreenUtil.getInstance().screenDensity;
  final screenWidthPixels = (ScreenUtil.getInstance().screenWidth * screenDensity).floor();
  final screenHeightPixels =
      (ScreenUtil.getInstance().screenHeight * ScreenUtil.getInstance().screenDensity).floor();
  // 状态栏高度这里需要传入像素值
  var statusBarHeight = ScreenUtil.getInstance().statusBarHeight;
  var bottomBarHeight = ScreenUtil.getInstance().bottomBarHeight;

  var screenDisplayMetricsMap = VoltronMap();
  screenDisplayMetricsMap.push("width", screenWidthPixels);
  screenDisplayMetricsMap.push("height", screenHeightPixels);
  screenDisplayMetricsMap.push("scale", screenDensity);
  screenDisplayMetricsMap.push("fontScale", screenDensity);
  screenDisplayMetricsMap.push("statusBarHeight", statusBarHeight);
  screenDisplayMetricsMap.push("bottomBarHeight", bottomBarHeight);
  screenDisplayMetricsMap.push("navigationBarHeight", bottomBarHeight * screenDensity);

  dimensionMap.push("screenPhysicalPixels", screenDisplayMetricsMap);

  if (!shouldUseScreenDisplay && context != null) {
    final density = ScreenUtil.getScreenDensity(context);
    final widthPixels = ScreenUtil.getScreenW(context) * density;
    final heightPixels = ScreenUtil.getScreenH(context) * density;

    windowDisplayMetricsMap.push("width", windowWidth >= 0 ? windowWidth : widthPixels);
    windowDisplayMetricsMap.push("height", windowHeight >= 0 ? windowHeight : heightPixels);
    windowDisplayMetricsMap.push("scale", density);
    windowDisplayMetricsMap.push("fontScale", screenDensity);
    windowDisplayMetricsMap.push("statusBarHeight", statusBarHeight * screenDensity);
    windowDisplayMetricsMap.push("bottomBarHeight", bottomBarHeight);
    windowDisplayMetricsMap.push("navigationBarHeight", bottomBarHeight * screenDensity);
  } else {
    windowDisplayMetricsMap.push("width", windowWidth >= 0 ? windowWidth : screenWidthPixels);
    windowDisplayMetricsMap.push("height", windowHeight >= 0 ? windowHeight : screenHeightPixels);
    windowDisplayMetricsMap.push("scale", screenDensity);
    windowDisplayMetricsMap.push("fontScale", screenDensity);
    windowDisplayMetricsMap.push("statusBarHeight", statusBarHeight * screenDensity);
    windowDisplayMetricsMap.push("bottomBarHeight", bottomBarHeight);
    windowDisplayMetricsMap.push("navigationBarHeight", bottomBarHeight * screenDensity);
  }

  dimensionMap.push("windowPhysicalPixels", windowDisplayMetricsMap);

  return dimensionMap;
}
