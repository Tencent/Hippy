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

import 'dart:ui' as ui show window;

import 'package:flutter/material.dart';

class ScreenUtil {
  double _screenWidth = 0.0;
  double _screenHeight = 0.0;
  double _screenDensity = 0.0;
  double _statusBarHeight = 0.0;
  double _bottomBarHeight = 0.0;
  double _appBarHeight = 0.0;
  double _fontScale = 0.0;
  MediaQueryData? _mediaQueryData;
  Size? _physicalSize;
  Brightness _brightness = Brightness.light;

  static final ScreenUtil _singleton = ScreenUtil();

  static ScreenUtil getInstance() {
    _singleton._init();
    return _singleton;
  }

  void _init() {
    var mediaQuery = MediaQueryData.fromWindow(ui.window);
    _physicalSize = ui.window.physicalSize;
    if (_mediaQueryData != mediaQuery) {
      _mediaQueryData = mediaQuery;
      _screenWidth = mediaQuery.size.width;
      _screenHeight = mediaQuery.size.height;
      _screenDensity = mediaQuery.devicePixelRatio;
      _statusBarHeight = mediaQuery.padding.top;
      _bottomBarHeight = mediaQuery.padding.bottom;
      _fontScale = mediaQuery.textScaleFactor;
      _appBarHeight = kToolbarHeight;
      _brightness = mediaQuery.platformBrightness;
    }
  }

  /// screen width
  /// 屏幕 宽 dp
  double get screenWidth => _screenWidth;

  /// screen height
  /// 屏幕 高 dp
  double get screenHeight => _screenHeight;

  /// appBar height
  /// appBar 高 dp
  double get appBarHeight => _appBarHeight;

  /// screen density
  /// 屏幕 像素密度
  double get screenDensity => _screenDensity;

  /// status bar Height
  /// 状态栏高度 dp
  double get statusBarHeight => _statusBarHeight;

  /// bottom bar Height dp
  double get bottomBarHeight => _bottomBarHeight;

  /// media Query Data
  MediaQueryData? get mediaQueryData => _mediaQueryData;

  double get fontScale => _fontScale;

  Size? get physicalSize => _physicalSize;

  Brightness get brightness => _brightness;

  /// screen width
  /// 当前屏幕 宽 dp
  static double getScreenW(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery.size.width;
  }

  /// screen height
  /// 当前屏幕 高 dp
  static double getScreenH(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery.size.height;
  }

  /// screen density
  /// 当前屏幕 像素密度
  static double getScreenDensity(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery.devicePixelRatio;
  }

  /// screen density
  /// 当前屏幕 字体scale大小
  static double getFontScale(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery.textScaleFactor;
  }

  /// status bar Height
  /// 当前状态栏高度
  static double getStatusBarH(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery.padding.top;
  }

  /// status bar Height
  /// 当前BottomBar高度
  static double getBottomBarH(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery.padding.bottom;
  }

  /// 当前MediaQueryData
  static MediaQueryData getMediaQueryData(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery;
  }

  /// Orientation
  /// 设备方向(portrait, landscape)
  static Orientation getOrientation(BuildContext context) {
    var mediaQuery = MediaQuery.of(context);
    return mediaQuery.orientation;
  }
}
