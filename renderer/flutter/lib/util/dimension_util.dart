import 'package:flutter/widgets.dart';
import '../common/voltron_map.dart';
import 'screen_util.dart';

VoltronMap getDimensions(int windowWidth, int windowHeight,
    bool shouldUseScreenDisplay, BuildContext? context) {
  var dimensionMap = VoltronMap();
  var windowDisplayMetricsMap = VoltronMap();

  final densityApi = ScreenUtil.getInstance().densityApi;

  final screenDensity = ScreenUtil.getInstance().screenDensity;
  final screenFontScale = ScreenUtil.getInstance().fontScale;
  final screenWidthPixels =
      (ScreenUtil.getInstance().screenWidth * screenDensity).floor();
  final screenHeightPixels = (ScreenUtil.getInstance().screenHeight *
          ScreenUtil.getInstance().screenDensity)
      .floor();
  // 状态栏高度这里需要传入像素值
  final statusBarHeight =
      ScreenUtil.getInstance().statusBarHeight * screenDensity;
  final bottomBarHeight =
      ScreenUtil.getInstance().bottomBarHeight * screenDensity;

  var screenDisplayMetricsMap = VoltronMap();
  screenDisplayMetricsMap.push("width", screenWidthPixels);
  screenDisplayMetricsMap.push("height", screenHeightPixels);
  screenDisplayMetricsMap.push("scale", screenDensity);
  screenDisplayMetricsMap.push("fontScale", screenFontScale);
  screenDisplayMetricsMap.push("densityDpi", densityApi);
  screenDisplayMetricsMap.push("statusBarHeight", statusBarHeight);
  screenDisplayMetricsMap.push("bottomBarHeight", bottomBarHeight);

  dimensionMap.push("screenPhysicalPixels", screenDisplayMetricsMap);

  if (!shouldUseScreenDisplay && context != null) {
    final density = ScreenUtil.getScreenDensity(context);
    final widthPixels = ScreenUtil.getScreenW(context) * density;
    final heightPixels = ScreenUtil.getScreenH(context) * density;

    windowDisplayMetricsMap.push(
        "width", windowWidth >= 0 ? windowWidth : widthPixels);
    windowDisplayMetricsMap.push(
        "height", windowHeight >= 0 ? windowHeight : heightPixels);
    windowDisplayMetricsMap.push("scale", density);
    windowDisplayMetricsMap.push("fontScale", ScreenUtil.getFontScale(context));
    windowDisplayMetricsMap.push("densityDpi", densityApi);
    windowDisplayMetricsMap.push("statusBarHeight", statusBarHeight);
    windowDisplayMetricsMap.push("bottomBarHeight", bottomBarHeight);
  } else {
    windowDisplayMetricsMap.push(
        "width", windowWidth >= 0 ? windowWidth : screenWidthPixels);
    windowDisplayMetricsMap.push(
        "height", windowHeight >= 0 ? windowHeight : screenHeightPixels);
    windowDisplayMetricsMap.push("scale", screenDensity);
    windowDisplayMetricsMap.push("fontScale", screenFontScale);
    windowDisplayMetricsMap.push("densityDpi", densityApi);
    windowDisplayMetricsMap.push("statusBarHeight", statusBarHeight);
    windowDisplayMetricsMap.push("bottomBarHeight", bottomBarHeight);
  }

  dimensionMap.push("windowPhysicalPixels", windowDisplayMetricsMap);

  return dimensionMap;
}
