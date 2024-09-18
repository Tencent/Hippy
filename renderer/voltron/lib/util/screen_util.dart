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

import 'dart:async';
import 'dart:io';
import 'dart:ui' as ui show window;

import 'package:flutter/material.dart';
import 'package:voltron_screen_info/voltron_screen_info.dart';

enum ScreenInfoSource {
  flutter,
  native,
}

class ScreenUtil {
  double _screenWidth = 0.0;
  double _screenHeight = 0.0;
  double _windowWidth = 0.0;
  double _windowHeight = 0.0;
  double _scale = 0.0;
  double _fontScale = 0.0;
  int _densityDpi = 0;
  double _statusBarHeight = 0.0;
  double _navigationBarHeight = 0.0;
  Brightness _brightness = Brightness.light;

  Completer ensureSizeCompleter = Completer<void>();

  static final ScreenUtil _singleton = ScreenUtil();

  static ScreenUtil getInstance() {
    return _singleton;
  }

  Future<void> initScreen({ScreenInfoSource screenInfoSource = ScreenInfoSource.flutter}) async {
    if (screenInfoSource == ScreenInfoSource.flutter) {
      // use ui.window, better used in flutter app
      await _initFromUIWindow();
    } else if (screenInfoSource == ScreenInfoSource.native) {
      // use method channel, faster when use cached flutter engine in native app
      await _initFromMethodChannel();
    }
  }

  Future<void> ensurePhysicalSizeReady() {
    if (ui.window.physicalSize.width > 0 && ui.window.physicalSize.height > 0) {
      return Future.value();
    }
    var ob = ScreenObserver(onScreenReady: () {
      ensureSizeCompleter.complete();
    });
    WidgetsBinding.instance.addObserver(ob);
    return ensureSizeCompleter.future.then((value) => WidgetsBinding.instance.removeObserver(ob));
  }

  Future<void> _initFromUIWindow() async {
    await ensurePhysicalSizeReady();
    var mediaQuery = MediaQueryData.fromWindow(ui.window);
    _screenWidth = mediaQuery.size.width;
    _screenHeight = mediaQuery.size.height;
    _windowWidth = _screenWidth;
    _windowHeight = _windowHeight;
    _scale = mediaQuery.devicePixelRatio;
    _fontScale = mediaQuery.textScaleFactor;
    _statusBarHeight = mediaQuery.padding.top;
    // 这里跟Hippy Native保持一致，只取安卓值即可
    if (Platform.isAndroid) {
      _navigationBarHeight = mediaQuery.padding.bottom;
    }
    _brightness = mediaQuery.platformBrightness;
  }

  Future<void> _initFromMethodChannel() async {
    var voltronScreenInfoPlugin = VoltronScreenInfoPlugin();
    if (Platform.isAndroid) {
      var androidScreenInfo = await voltronScreenInfoPlugin.androidInfo;
      _screenWidth = androidScreenInfo.screenWidth;
      _screenHeight = androidScreenInfo.screenHeight;
      _windowWidth = androidScreenInfo.screenWidth;
      _windowHeight = androidScreenInfo.screenHeight;
      _scale = androidScreenInfo.scale;
      _fontScale = androidScreenInfo.fontScale;
      _densityDpi = androidScreenInfo.densityDpi;
      _statusBarHeight = androidScreenInfo.statusBarHeight;
      _navigationBarHeight = androidScreenInfo.navigationBarHeight;
      _brightness = androidScreenInfo.nightMode ? Brightness.dark : Brightness.light;
    } else if (Platform.isIOS) {
      var iosScreenInfo = await voltronScreenInfoPlugin.iosInfo;
      _screenWidth = iosScreenInfo.screenWidth;
      _screenHeight = iosScreenInfo.screenHeight;
      _windowWidth = iosScreenInfo.screenWidth;
      _windowHeight = iosScreenInfo.screenHeight;
      _scale = iosScreenInfo.scale;
      _fontScale = iosScreenInfo.fontScale;
      _statusBarHeight = iosScreenInfo.statusBarHeight;
      _brightness = iosScreenInfo.nightMode ? Brightness.dark : Brightness.light;
    }
  }

  /// screen width
  /// 屏幕 宽 dp
  double get screenWidth => _screenWidth;

  /// screen height
  /// 屏幕 高 dp
  double get screenHeight => _screenHeight;

  /// screen width
  /// 屏幕 宽 dp
  double get windowWidth => _windowWidth;

  /// screen width
  /// 屏幕 宽 dp
  double get windowHeight => _windowHeight;

  /// screen density
  /// 屏幕 像素密度
  double get scale => _scale;

  double get fontScale => _fontScale;

  /// only in android
  int get densityDpi => _densityDpi;

  /// status bar Height
  /// 状态栏高度 dp
  double get statusBarHeight => _statusBarHeight;

  /// bottom bar Height dp
  double get navigationBarHeight => _navigationBarHeight;

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

class ScreenObserver extends WidgetsBindingObserver {
  bool isReady = false;
  Function onScreenReady;

  ScreenObserver({required this.onScreenReady});

  void didChangeMetrics() {
    if (ui.window.physicalSize.width > 0 && ui.window.physicalSize.height > 0 && !isReady) {
      isReady = true;
      onScreenReady();
    }
  }
}
