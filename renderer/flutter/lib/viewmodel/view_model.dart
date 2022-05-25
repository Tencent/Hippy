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

import 'package:flutter/material.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:gradient_like_css/gradient_like_css.dart';

import '../common.dart';
import '../gesture.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../util/gradient_util.dart';
import '../viewmodel.dart';
import '../widget.dart';

int _kRenderModelInstanceId = 1;

class RenderViewModel extends ChangeNotifier {
  ContextWrapper? _wrapper;

  String display = '';

  double? _x;
  double? _y;
  double? _width;
  double? _height;

  // 调试时候查看是否是同一个viewModel实例
  final int _modelId = _kRenderModelInstanceId++;

  final String _className;
  final int _id;
  final int _instanceId;

  RenderViewModel? parent;

  set wrapper(ContextWrapper? wrapper) {
    _wrapper = wrapper;
  }

  BuildContext? get currentContext => _wrapper?.call();

  BoundingClientRect? get boundingClientRect {
    final renderBox = currentContext?.findRenderObject() as RenderBox?;
    if (renderBox == null) {
      return null;
    }

    return BoundingClientRect(renderBox);
  }

  // 无障碍话label
  String? accessibilityLabel;

  // 背景色
  Color? backgroundColor;
  Object? backgroundImage = '';
  String backgroundImgSize = enumValueToString(ImageResizeMode.auto);

  String backgroundPositionX = "";
  String backgroundPositionY = "";
  String backgroundImgRepeat = "";

  // 透明度
  double? opacity;

  bool isDestroy = false;
  bool isDispose = false;

  // 圆角相关
  double? borderRadius;
  double? topLeftBorderRadius;
  double? topRightBorderRadius;
  double? bottomRightBorderRadius;
  double? bottomLeftBorderRadius;
  double? borderWidth;
  double? borderLeftWidth;
  double? borderTopWidth;
  double? borderRightWidth;
  double? borderBottomWidth;
  int? borderColor;
  int? borderLeftColor;
  int? borderTopColor;
  int? borderRightColor;
  int? borderBottomColor;
  String? borderStyle;
  String overflow = enumValueToString(ContainOverflow.visible);

  // voltron box-shadow
  VoltronArray? boxShadow;

  // hippy linear-gradient
  VoltronMap? linearGradient;

  // hippy box-shadow
  double? shadowOffsetX;
  double? shadowOffsetY;
  double? shadowOpacity;
  double? shadowRadius;
  double? shadowSpread;
  int? shadowColor;

  // focus相关
  int? nextFocusUpId;
  int? nexFocusDownId;
  int? nextFocusLeftId;
  int? nextFocusRightId;
  bool? focusable;

  int zIndex = 0;

  Map<String, Object> _extraInfo = {};

  // 手势事件相关
  late NativeGestureDispatcher _dispatcher;

  bool get isShow => display != 'none';

  int get id => _id;

  String get idDesc => '$name($id)-$_modelId';

  int get rootId => _instanceId;

  String get name => _className;

  ContextWrapper? get contextWrapper => _wrapper;

  Map<String, Object> get extraInfo => _extraInfo;

  double? get layoutX => _x;

  double? get layoutY => _y;

  double? get width => _width;

  double? get height => _height;

  bool get noPosition => _x == null || _y == null || _x == double.nan || _y == double.nan;

  bool get noSize =>
      _width == null ||
      _height == null ||
      (_width ?? 0.0).isNaN ||
      (_height ?? 0.0).isNaN ||
      _width == double.nan ||
      _height == double.nan ||
      (_width ?? 0.0) <= 0.0 ||
      (_height ?? 0.0) <= 0.0;

  // transform
  Matrix4? transform;
  TransformOrigin transformOrigin = TransformOrigin(null);

  NativeGestureDispatcher get gestureDispatcher => _dispatcher;

  List<RenderViewModel>? get children => null;

  final RenderContext _renderContext;

  RenderContext get context => _renderContext;

  Key get renderKey => ValueKey('$_className[$_id]');

  int get childCount => 0;

  RenderViewModel? childFromId(int id) => null;

  RenderViewModel(
    this._id,
    this._instanceId,
    this._className,
    RenderContext context,
  ) : _renderContext = context {
    _dispatcher = createDispatcher();
  }

  RenderViewModel.copy(
    this._id,
    this._instanceId,
    this._className,
    this._renderContext,
    RenderViewModel viewModel,
  ) {
    display = viewModel.display;
    _x = viewModel.layoutX;
    _y = viewModel.layoutY;
    _width = viewModel.width;
    _height = viewModel.height;
    parent = viewModel.parent;
    _dispatcher = viewModel.gestureDispatcher;
    accessibilityLabel = viewModel.accessibilityLabel;
    backgroundColor = viewModel.backgroundColor;
    backgroundImage = viewModel.backgroundImage;
    backgroundImgSize = viewModel.backgroundImgSize;
    backgroundPositionX = viewModel.backgroundPositionX;
    backgroundPositionY = viewModel.backgroundPositionY;
    backgroundImgRepeat = viewModel.backgroundImgRepeat;
    opacity = viewModel.opacity;
    borderRadius = viewModel.borderRadius;
    topLeftBorderRadius = viewModel.topLeftBorderRadius;
    topRightBorderRadius = viewModel.topRightBorderRadius;
    bottomRightBorderRadius = viewModel.bottomRightBorderRadius;
    bottomLeftBorderRadius = viewModel.bottomLeftBorderRadius;
    borderWidth = viewModel.borderWidth;
    borderLeftWidth = viewModel.borderLeftWidth;
    borderTopWidth = viewModel.borderTopWidth;
    borderRightWidth = viewModel.borderRightWidth;
    borderBottomWidth = viewModel.borderBottomWidth;
    borderColor = viewModel.borderColor;
    borderLeftColor = viewModel.borderLeftColor;
    borderTopColor = viewModel.borderTopColor;
    borderRightColor = viewModel.borderRightColor;
    borderBottomColor = viewModel.borderBottomColor;
    borderStyle = viewModel.borderStyle;
    overflow = viewModel.overflow;
    boxShadow = viewModel.boxShadow;
    shadowOffsetX = viewModel.shadowOffsetX;
    shadowOffsetY = viewModel.shadowOffsetY;
    shadowOpacity = viewModel.shadowOpacity;
    shadowRadius = viewModel.shadowRadius;
    shadowSpread = viewModel.shadowSpread;
    shadowColor = viewModel.shadowColor;
    linearGradient = viewModel.linearGradient;
    nextFocusUpId = viewModel.nextFocusUpId;
    nexFocusDownId = viewModel.nexFocusDownId;
    nextFocusLeftId = viewModel.nextFocusLeftId;
    nextFocusRightId = viewModel.nextFocusRightId;
    focusable = viewModel.focusable;
    zIndex = viewModel.zIndex;
    _extraInfo = viewModel.extraInfo;
    _wrapper = viewModel.contextWrapper;
    transform = viewModel.transform?.clone();
    transformOrigin = viewModel.transformOrigin.copy();
    backgroundColor = viewModel.backgroundColor;
  }

  @override
  bool operator ==(Object other) {
    var sizeEqual = false;
    if (other is RenderViewModel) {
      var x = _x;
      var layoutX = other.layoutX;
      var y = _y;
      var layoutY = other.layoutY;
      var w = width;
      var layoutW = other.width;
      var h = height;
      var layoutH = other.height;
      var xEqual = x == layoutX || (x != null && x.isNaN && layoutX != null && layoutX.isNaN);
      var yEqual = y == layoutY || (y != null && y.isNaN && layoutY != null && layoutY.isNaN);
      var wEqual = w == layoutW || (w != null && w.isNaN && layoutW != null && layoutW.isNaN);
      var hEqual = h == layoutH || (h != null && h.isNaN && layoutH != null && layoutH.isNaN);
      sizeEqual = xEqual && yEqual && wEqual && hEqual;
    }

    return other is RenderViewModel &&
        display == other.display &&
        sizeEqual &&
        accessibilityLabel == other.accessibilityLabel &&
        backgroundColor == other.backgroundColor &&
        overflow == other.overflow &&
        backgroundImage == other.backgroundImage &&
        backgroundImgSize == other.backgroundImgSize &&
        backgroundImgRepeat == other.backgroundImgRepeat &&
        backgroundPositionX == other.backgroundPositionX &&
        backgroundPositionY == other.backgroundPositionY &&
        opacity == other.opacity &&
        borderRadius == other.borderRadius &&
        topLeftBorderRadius == other.topLeftBorderRadius &&
        topRightBorderRadius == other.topRightBorderRadius &&
        bottomRightBorderRadius == other.bottomRightBorderRadius &&
        bottomLeftBorderRadius == other.bottomLeftBorderRadius &&
        borderWidth == other.borderWidth &&
        borderLeftWidth == other.borderLeftWidth &&
        borderTopWidth == other.borderTopWidth &&
        borderRightWidth == other.borderRightWidth &&
        borderBottomWidth == other.borderBottomWidth &&
        borderColor == other.borderColor &&
        borderLeftColor == other.borderLeftColor &&
        borderTopColor == other.borderTopColor &&
        borderRightColor == other.borderRightColor &&
        borderBottomColor == other.borderBottomColor &&
        borderStyle == other.borderStyle &&
        overflow == other.overflow &&
        boxShadow == other.boxShadow &&
        shadowOffsetX == other.shadowOffsetX &&
        shadowOffsetY == other.shadowOffsetY &&
        shadowOpacity == other.shadowOpacity &&
        shadowRadius == other.shadowRadius &&
        shadowSpread == other.shadowSpread &&
        shadowColor == other.shadowColor &&
        linearGradient == other.linearGradient &&
        nextFocusUpId == other.nextFocusUpId &&
        nexFocusDownId == other.nexFocusDownId &&
        nextFocusLeftId == other.nextFocusLeftId &&
        nextFocusRightId == other.nextFocusRightId &&
        focusable == other.focusable &&
        zIndex == other.zIndex &&
        transform == other.transform &&
        transformOrigin == other.transformOrigin;
  }

  @override
  int get hashCode =>
      display.hashCode |
      _x.hashCode |
      _y.hashCode |
      width.hashCode |
      height.hashCode |
      parent.hashCode |
      accessibilityLabel.hashCode |
      backgroundColor.hashCode |
      overflow.hashCode |
      backgroundImage.hashCode |
      backgroundImgSize.hashCode |
      backgroundImgRepeat.hashCode |
      backgroundPositionX.hashCode |
      backgroundPositionY.hashCode |
      opacity.hashCode |
      borderRadius.hashCode |
      topLeftBorderRadius.hashCode |
      topRightBorderRadius.hashCode |
      topRightBorderRadius.hashCode |
      bottomRightBorderRadius.hashCode |
      bottomLeftBorderRadius.hashCode |
      borderWidth.hashCode |
      borderLeftWidth.hashCode |
      borderTopWidth.hashCode |
      borderRightWidth.hashCode |
      borderBottomWidth.hashCode |
      borderColor.hashCode |
      borderLeftColor.hashCode |
      borderTopColor.hashCode |
      borderRightColor.hashCode |
      borderBottomColor.hashCode |
      borderStyle.hashCode |
      overflow.hashCode |
      boxShadow.hashCode |
      shadowOffsetX.hashCode |
      shadowOffsetY.hashCode |
      shadowOpacity.hashCode |
      shadowRadius.hashCode |
      shadowSpread.hashCode |
      shadowColor.hashCode |
      linearGradient.hashCode |
      nextFocusUpId.hashCode |
      nexFocusDownId.hashCode |
      nextFocusLeftId.hashCode |
      nextFocusRightId.hashCode |
      focusable.hashCode |
      zIndex.hashCode |
      transform.hashCode |
      transformOrigin.hashCode;

  RenderViewModel? getChildAt(int index) {
    return null;
  }

  T? getExtraInfo<T>(String key) {
    var value = _extraInfo[key];
    if (value is T) {
      return value;
    }
    return null;
  }

  void pushExtraInfo(String key, Object value) {
    _extraInfo[key] = value;
  }

  NativeGestureDispatcher createDispatcher() {
    return NativeGestureDispatcher(rootId: rootId, id: id, context: _renderContext);
  }

  void updateLayout(double x, double y, double width, double height) {
    LogUtils.dRender("render view model, before update layout($this)");
    _x = x;
    _y = y;
    _width = width;
    _height = height;
    LogUtils.dRender("render view model, after update layout($this)");
  }

  void update() {
    notifyListeners();
  }

  void onInit() {
    // empty
  }

  bool handleGestureBySelf() {
    return false;
  }

  void setFocusable(bool focusable) {}

  void requestFocus(bool focusable) {}

  void sortChildren() {}

  void setClickable(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.click, flag);
    }
  }

  void setLongClickable(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.longClick, flag);
    }
  }

  void setCanPressIn(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.pressIn, flag);
    }
  }

  void setCanPressOut(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.pressOut, flag);
    }
  }

  void setTouchDownHandle(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.touchDown, flag);
    }
  }

  void setTouchMoveHandle(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.touchMove, flag);
    }
  }

  void setTouchEndHandle(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.touchEnd, flag);
    }
  }

  void setTouchCancelHandle(bool flag) {
    if (!handleGestureBySelf()) {
      setGestureType(GestureType.touchCancel, flag);
    }
  }

  void setAttachedToWindowHandle(bool flag) {
    if (!handleGestureBySelf()) {
      _dispatcher.listenAttachedToWindow = flag;
    }
  }

  void setDetachedFromWindowHandle(bool flag) {
    if (!handleGestureBySelf()) {
      _dispatcher.listenDetachedFromWindow = flag;
    }
  }

  bool interceptChildPosition() {
    return false;
  }

  void setGestureType(GestureType type, bool flag) {
    if (flag) {
      _dispatcher.addGestureType(type);
    } else {
      _dispatcher.removeGestureType(type);
    }
  }

  @mustCallSuper
  void onViewModelDestroy() {
    isDestroy = true;
    if (!isDispose) {
      doDispose();
    }
  }

  @mustCallSuper
  void doDispose() {
    if (!isDispose) {
      super.dispose();
      _extraInfo.clear();
      isDispose = true;
    }
  }

  @mustCallSuper
  void onDispose() {
    if (isDestroy) {
      doDispose();
    }
  }

  @override
  void removeListener(VoidCallback listener) {
    if (!isDispose) {
      super.removeListener(listener);
    }
  }

  @override
  String toString() {
    return "$idDesc: (x[$_x], y[$_y], w[$_width], h[$_height])";
  }

  /// if not a container with child(exp View, ScrollView), add padding for border in box model
  bool get withBoxPadding => true;

  EdgeInsets? getInnerBoxMargin() {
    var computedBorderTopWidth = 0.0;
    var computedBorderRightWidth = 0.0;
    var computedBorderBottomWidth = 0.0;
    var computedBorderLeftWidth = 0.0;
    var originBorderWidth = borderWidth;
    if (originBorderWidth != null && originBorderWidth > 0) {
      computedBorderTopWidth = originBorderWidth;
      computedBorderRightWidth = originBorderWidth;
      computedBorderBottomWidth = originBorderWidth;
      computedBorderLeftWidth = originBorderWidth;
    }
    var originBorderTopWidth = borderTopWidth;
    var originBorderRightWidth = borderRightWidth;
    var originBorderBottomWidth = borderBottomWidth;
    var originBorderLeftWidth = borderLeftWidth;
    if (originBorderTopWidth != null && originBorderTopWidth > 0) {
      computedBorderTopWidth = originBorderTopWidth;
    }
    if (originBorderRightWidth != null && originBorderRightWidth > 0) {
      computedBorderRightWidth = originBorderRightWidth;
    }
    if (originBorderBottomWidth != null && originBorderBottomWidth > 0) {
      computedBorderBottomWidth = originBorderBottomWidth;
    }
    if (originBorderLeftWidth != null && originBorderLeftWidth > 0) {
      computedBorderLeftWidth = originBorderLeftWidth;
    }
    if (computedBorderTopWidth > 0 ||
        computedBorderRightWidth > 0 ||
        computedBorderBottomWidth > 0 ||
        computedBorderLeftWidth > 0) {
      return EdgeInsets.only(
        top: computedBorderTopWidth,
        right: computedBorderRightWidth,
        bottom: computedBorderBottomWidth,
        left: computedBorderLeftWidth,
      );
    }
    return null;
  }

  Decoration? getForegroundDecoration() {
    var border = getBorder();
    var radius = getBorderRadius();
    var showRadius = radius != null && (border == null || border.isUniform);
    return BoxDecoration(
      borderRadius: showRadius ? radius : null,
      border: border,
    );
  }

  Decoration? getDecoration({Color? backgroundColor}) {
    return toDecoration(decorationColor: backgroundColor);
  }

  BorderRadius? get toBorderRadius {
    return getBorderRadius();
  }

  Object? _getGradientSide(String? side) {
    if (side == 'top left') {
      return Alignment.topLeft;
    } else if (side == 'top') {
      return Alignment.topCenter;
    } else if (side == 'top right') {
      return Alignment.topRight;
    } else if (side == 'left') {
      return Alignment.centerLeft;
    } else if (side == 'right') {
      return Alignment.centerRight;
    } else if (side == 'bottom left') {
      return Alignment.bottomLeft;
    } else if (side == 'bottom') {
      return Alignment.bottomCenter;
    } else if (side == 'bottom right') {
      return Alignment.bottomRight;
    } else if (side is String) {
      var deg = int.tryParse(side.replaceAll('deg', ''));
      if (deg != null) {
        return deg;
      }
    }
    return null;
  }

  List<String>? _getGradientStops(String? stops) {
    if (stops == null) return null;
    return stops.split(',').map((item) {
      var reg = RegExp(r'([^\d]+)(\d+)px', caseSensitive: false);
      if (reg.hasMatch(item)) {
        return item.replaceAllMapped(reg, (m) {
          var px = m.group(2);
          if (px != null) {
            var percent = ((double.tryParse(px) ?? 0) / width!) * 100;
            return '${m[1]!}$percent%';
          }
          return item;
        });
      }
      return item;
    }).toList();
  }

  Gradient? _generateHippyGradient() {
    var linearGradientMap = linearGradient;
    var w = width;
    var h = height;
    if (linearGradientMap != null && w != null && h != null) {
      var angle = linearGradientMap.get<String>("angle");
      var colorStopList = linearGradientMap.get<VoltronArray>("colorStopList");
      if (angle != null && colorStopList != null) {
        return GradientUtil.generateHippyLinearGradient(w, h, angle, colorStopList);
      }
    }
    return null;
  }

  Gradient? _generateGradient() {
    var data = backgroundImage;
    if (data is! VoltronMap) {
      /// check if it is hippy linear gradient
      return _generateHippyGradient();
    }
    var type = data.get<String>('type');
    if (type == null) {
      /// check if it is hippy linear gradient
      return _generateHippyGradient();
    } else if (type == 'linear-gradient') {
      var gradientData = data.get<VoltronMap>('data');
      var side = _getGradientSide(gradientData?.get<String>('side'));
      var stops = _getGradientStops(gradientData?.get<String>('stops'));
      if (stops != null) {
        return CssLike.linearGradient(side, stops);
      }
    }
    return null;
  }

  List<BoxShadow>? _generateBoxShadow() {
    var result = <BoxShadow>[];
    // voltron box-shadow
    var localBoxShadow = boxShadow;
    // hippy box-shadow
    var localBoxShadowOffsetX = shadowOffsetX;
    var localBoxShadowOffsetY = shadowOffsetY;
    var localBoxShadowOpacity = shadowOpacity;
    var localBoxShadowRadius = shadowRadius;
    var localBoxShadowSpread = shadowSpread;
    var localBoxShadowColor = shadowColor;
    if (localBoxShadow != null) {
      // voltron box-shadow
      localBoxShadow.toList().forEach((item) {
        if (item is Map) {
          var color = item['color'];
          if (color != null) {
            var blurRadius = item['blurRadius'] ?? 0;
            var spreadRadius = item['spreadRadius'] ?? 0;
            var x = item['offset']['x'] ?? 0;
            var y = item['offset']['y'] ?? 0;
            result.add(BoxShadow(
              color: Color(color.toInt()),
              offset: Offset(x.toDouble(), y.toDouble()),
              blurRadius: blurRadius.toDouble(),
              spreadRadius: spreadRadius.toDouble(),
            ));
          }
        }
      });
    } else if (localBoxShadowRadius != null && localBoxShadowColor != null) {
      // hippy box-shadow
      result.add(
        BoxShadow(
          color: Color(localBoxShadowColor).withOpacity(localBoxShadowOpacity ?? 1),
          offset: Offset(localBoxShadowOffsetX ?? 0, localBoxShadowOffsetY ?? 0),
          blurRadius: localBoxShadowRadius,
          spreadRadius: localBoxShadowSpread ?? 0.0,
        ),
      );
    }
    return result.isEmpty ? null : result;
  }

  Decoration? toDecoration({
    Color? decorationColor,
  }) {
    var radius = getBorderRadius();
    var color = decorationColor ?? backgroundColor;
    var boxShadow = _generateBoxShadow();
    var gradient = _generateGradient();
    var image = _generateBackgroundImage();
    return BoxDecoration(
      borderRadius: radius,
      image: image,
      color: color,
      gradient: gradient,
      boxShadow: boxShadow,
    );
  }

  BorderRadius? getBorderRadius() {
    var topLeftRadius = _generateSideBorderRadius(topLeftBorderRadius);
    var topRightRadius = _generateSideBorderRadius(topRightBorderRadius);
    var bottomLeftRadius = _generateSideBorderRadius(bottomLeftBorderRadius);
    var bottomRightRadius = _generateSideBorderRadius(bottomRightBorderRadius);
    if (topLeftRadius == Radius.zero &&
        topRightRadius == Radius.zero &&
        bottomLeftRadius == Radius.zero &&
        bottomRightRadius == Radius.zero) {
      return null;
    }

    return BorderRadius.only(
      topLeft: topLeftRadius,
      topRight: topRightRadius,
      bottomLeft: bottomLeftRadius,
      bottomRight: bottomRightRadius,
    );
  }

  Radius _generateSideBorderRadius(double? radius) {
    if (radius != null && radius > 0) {
      return Radius.circular(radius);
    }

    var originBorderRadius = borderRadius;
    if (originBorderRadius != null && originBorderRadius > 0) {
      return Radius.circular(originBorderRadius);
    }

    return Radius.zero;
  }

  DecorationImage? _generateBackgroundImage() {
    var bgImg = backgroundImage;
    if (bgImg is! String || bgImg == '') return null;
    var imgFit = resizeModeToBoxFit(backgroundImgSize);
    const alignMap = {'left': -1.0, 'center': 0.0, 'right': 1.0, 'top': -1.0, 'bottom': 1.0};
    var alignX = alignMap[backgroundPositionX] ?? -1.0;
    var alignY = alignMap[backgroundPositionY] ?? -1.0;
    var alignment = Alignment(alignX, alignY);
    // 背景图不为空使用背景图
    return DecorationImage(
      alignment: alignment,
      image: getImage(bgImg),
      repeat: resizeModeToImageRepeat(backgroundImgRepeat),
      scale: 1.0,
      fit: imgFit,
    );
  }

  BorderStyle parseBorderStyle(String? borderStyle) {
    if (borderStyle == 'solid') {
      return BorderStyle.solid;
    } else if (borderStyle == 'none') {
      return BorderStyle.none;
    }
    return BorderStyle.solid;
  }

  BorderSide _generateBorderSide(double? sideWidth, int? sideColor) {
    var originSideWidth = sideWidth;
    var originSideColor = sideColor;
    var originBorderWidth = borderWidth ?? 0.0;
    var originBorderColor = borderColor ?? 0;

    var computedSideWidth = originBorderWidth;
    var computedBorderColor = originBorderColor;

    if (originSideWidth != null && originSideWidth > 0) {
      computedSideWidth = originSideWidth;
    }

    if (originSideColor != null && originSideColor > 0) {
      computedBorderColor = originSideColor;
    }

    BorderStyle computedBorderStyle = parseBorderStyle(borderStyle);

    if (computedSideWidth > 0 && computedBorderStyle != BorderStyle.none) {
      return BorderSide(
        width: computedSideWidth,
        color: Color(computedBorderColor),
        style: computedBorderStyle,
      );
    }
    return BorderSide.none;
  }

  Border? getBorder() {
    var topSide = _generateBorderSide(borderTopWidth, borderTopColor);
    var bottomSide = _generateBorderSide(borderBottomWidth, borderBottomColor);
    var leftSide = _generateBorderSide(borderLeftWidth, borderLeftColor);
    var rightSide = _generateBorderSide(borderRightWidth, borderRightColor);
    if (isNoneSide(topSide) &&
        isNoneSide(bottomSide) &&
        isNoneSide(leftSide) &&
        isNoneSide(rightSide)) {
      return null;
    }

    return Border(
      top: _generateBorderSide(borderTopWidth, borderTopColor),
      left: _generateBorderSide(borderLeftWidth, borderLeftColor),
      bottom: _generateBorderSide(borderBottomWidth, borderBottomColor),
      right: _generateBorderSide(borderRightWidth, borderRightColor),
    );
  }

  bool isNoneSide(BorderSide side) {
    return side == BorderSide.none;
  }

  bool get isOverflowClip {
    var radius = getBorderRadius();
    var isOverflowHidden = overflow == enumValueToString(ContainOverflow.hidden);
    var isOverflowScroll = this is ScrollViewRenderViewModel;
    return (isOverflowHidden || isOverflowScroll) && radius != null;
  }
}

class BoundingClientRect {
  late int dx;
  late int dy;
  late int width;
  late int height;
  late int top;
  late int right;
  late int bottom;
  late int left;

  BoundingClientRect(RenderBox renderBox) {
    final size = renderBox.size;
    final position = renderBox.localToGlobal(const Offset(0, 0));
    dx = position.dx.toInt();
    dy = position.dy.toInt();
    width = size.width.toInt();
    height = size.height.toInt();
    top = dy;
    right = dx + width;
    bottom = dy + height;
    left = dx;
  }

  Map toJson() => {
        'x': dx,
        'y': dy,
        'width': width,
        'height': height,
        'top': top,
        'right': right,
        'bottom': bottom,
        'left': left,
      };
}

class TransformOrigin {
  Offset offset = const Offset(0, 0);
  Alignment alignment = Alignment.center;

  TransformOrigin(VoltronMap? transformOriginMap) {
    if (transformOriginMap == null) {
      return;
    }

    final alignX = transformOriginMap.get('alignX').toDouble();
    final alignY = transformOriginMap.get('alignY').toDouble();
    final offsetX = transformOriginMap.get('offsetX').toDouble();
    final offsetY = transformOriginMap.get('offsetY').toDouble();
    final newAlignment = Alignment(alignX, alignY);
    final newOffset = Offset(offsetX, offsetY);
    offset = newOffset;
    alignment = newAlignment;
  }

  @override
  bool operator ==(Object other) {
    return other is TransformOrigin && offset == other.offset && alignment == other.alignment;
  }

  @override
  int get hashCode => offset.hashCode | alignment.hashCode;

  TransformOrigin copy() {
    final transformOrigin = TransformOrigin(null);
    transformOrigin.offset = Offset(offset.dx, offset.dy);
    transformOrigin.alignment = Alignment(alignment.x, alignment.y);
    return transformOrigin;
  }
}
