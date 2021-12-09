import 'dart:ui' as ui show window;

import 'package:flutter/material.dart';
import '../channel/platform_manager.dart';

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

  int get densityApi => PlatformManager.getInstance().densityApi;

  Size? get physicalSize => _physicalSize;

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
