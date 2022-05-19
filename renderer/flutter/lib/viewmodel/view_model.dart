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

  /// 动画相关
  CssAnimation? transition;
  CssAnimation? animation;
  String? animationFillMode;

  // animation动画播放结束后，animationFillModel为'none'时，需要设置的属性集
  VoltronMap? animationEndPropertyMap;

  // 需要根据animation规则操作的动画属性Map(key: String, value: AnimationPropertyOption(如：禁止设置属性值))
  VoltronMap? animationPropertyOptionMap;

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

  bool get noPosition =>
      _x == null || _y == null || _x == double.nan || _y == double.nan;

  bool get noSize =>
      _width == null ||
      _height == null ||
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
    animation = viewModel.animation;
    transition = viewModel.transition;
    animationFillMode = viewModel.animationFillMode;
    animationEndPropertyMap = viewModel.animationEndPropertyMap;
    animationPropertyOptionMap = viewModel.animationPropertyOptionMap;
  }

  @override
  bool operator ==(Object other) {
    return other is RenderViewModel &&
        display == other.display &&
        _x == other.layoutX &&
        _y == other.layoutY &&
        width == other.width &&
        height == other.height &&
        accessibilityLabel == other.accessibilityLabel &&
        backgroundColor == other.backgroundColor &&
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
        animation == other.animation &&
        transition == other.transition &&
        animationFillMode == other.animationFillMode &&
        animationEndPropertyMap == other.animationEndPropertyMap &&
        animationPropertyOptionMap == other.animationPropertyOptionMap &&
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
      animation.hashCode |
      transition.hashCode |
      animationFillMode.hashCode |
      animationEndPropertyMap.hashCode |
      animationPropertyOptionMap.hashCode |
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
    return NativeGestureDispatcher(
        rootId: rootId, id: id, context: _renderContext);
  }

  void updateLayout(double x, double y, double width, double height) {
    LogUtils.dRender("render view model, before update layout($this)");
    _x = x;
    _y = y;
    _width = width;
    _height = height;
    updateAnimation(NodeProps.kLeft, x);
    updateAnimation(NodeProps.kTop, y);
    updateAnimation(NodeProps.kWidth, width);
    updateAnimation(NodeProps.kHeight, height);
    LogUtils.dRender("render view model, after update layout($this)");
  }

  void updateAnimation<T>(String key, T value) {
    // 1.处理css animation动画属性值的更新
    // TODO
    // final animationPropertyTweenSequenceItemList = animation?.getHasPropertyTweenSequenceItemList(key) ?? null;
    // if (animationPropertyTweenSequenceItemList != null) {
    //   AnimationUtil.handleUpdateTweenSequenceItemListFirstNotNullValue(animationPropertyTweenSequenceItemList, value);
    //   return;
    // }

    // 2.处理css transition动画属性值的更新
    transition?.updateTransitionAnimation(key, value);
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
      _dispatcher.clickable = flag;
    }
  }

  void setLongClickable(bool flag) {
    if (!handleGestureBySelf()) {
      _dispatcher.longClickable = flag;
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

  Decoration? getDecoration({Color? backgroundColor}) {
    return toDecoration(decorationColor: backgroundColor);
  }

  BorderRadius? get toBorderRadius {
    return _toRadius();
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
        return GradientUtil.generateHippyLinearGradient(
            w, h, angle, colorStopList);
      }
    }
    return null;
  }

  Gradient? _generateGradient(Object? data) {
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
          color: Color(localBoxShadowColor)
              .withOpacity(localBoxShadowOpacity ?? 1),
          offset:
              Offset(localBoxShadowOffsetX ?? 0, localBoxShadowOffsetY ?? 0),
          blurRadius: localBoxShadowRadius,
          spreadRadius: localBoxShadowSpread ?? 0.0,
        ),
      );
    }
    return result.isEmpty ? null : result;
  }

  Decoration? toDecoration({
    Color? decorationColor,
    Object? backgroundImg,
    String? backgroundImgSize,
    String? backgroundImgRepeat,
    String? backgroundImgPositionX,
    String? backgroundImgPositionY,
  }) {
    var radius = _toRadius();
    var color = decorationColor ?? backgroundColor;
    var boxShadow = _generateBoxShadow();
    var gradient = _generateGradient(backgroundImg);
    var image = _toImage(
      backgroundImg,
      backgroundImgSize,
      backgroundImgRepeat,
      backgroundImgPositionX,
      backgroundImgPositionY,
    );
    var border = _toBorder();
    var showRadius = radius != null && (border == null || border.isUniform);
    return BoxDecoration(
      borderRadius: showRadius ? radius : null,
      image: image,
      color: color,
      border: border,
      gradient: gradient,
      boxShadow: boxShadow,
    );
  }

  BorderRadius? _toRadius() {
    var topLeftRadius = _generateRadius(topLeftBorderRadius);
    var topRightRadius = _generateRadius(topRightBorderRadius);
    var bottomLeftRadius = _generateRadius(bottomLeftBorderRadius);
    var bottomRightRadius = _generateRadius(bottomRightBorderRadius);
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

  Radius _generateRadius(double? radius) {
    if (radius != null && radius > 0) {
      return Radius.circular(radius);
    }

    var originBorderRadius = borderRadius;
    if (originBorderRadius != null && originBorderRadius > 0) {
      return Radius.circular(originBorderRadius);
    }

    return Radius.zero;
  }

  DecorationImage? _toImage(
      Object? backgroundImg,
      String? backgroundImgSize,
      String? backgroundImgRepeat,
      backgroundImgPositionX,
      backgroundImgPositionY) {
    if (backgroundImg is! String || backgroundImg == '') return null;
    var imgFit = resizeModeToBoxFit(backgroundImgSize);
    const alignMap = {
      'left': -1.0,
      'center': 0.0,
      'right': 1.0,
      'top': -1.0,
      'bottom': 1.0
    };
    var alignX = alignMap[backgroundImgPositionX] ?? -1.0;
    var alignY = alignMap[backgroundImgPositionY] ?? -1.0;
    var alignment = Alignment(alignX, alignY);
    // 背景图不为空使用背景图
    return DecorationImage(
      alignment: alignment,
      image: getImage(backgroundImg),
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

  Border? _toBorder() {
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

  /// animation动画播放完毕，将isDisable的标志位设置为true，使该animation关联的属性都不起效
  void clearAnimation() {
    animation?.isDisable = true;
  }

  bool get isOverflowClip {
    var radius = _toRadius();
    var isOverflowhidden =
        overflow == enumValueToString(ContainOverflow.hidden);
    if (isOverflowhidden && radius != null) {
      return true;
    }
    return false;
  }
}

/// css的transition动画属性
class Transition {
  // 动画属性名
  String transitionProperty = '';

  // 动画持续时间(单位：毫秒)
  int transitionDuration = 0;

  // 动画效果
  Curve transitionTimingFunction = Curves.ease;

  // 动画效果延迟时间(单位：毫秒)
  int transitionDelay = 0;

  Transition(String transitionProperty, VoltronMap params) {
    transitionProperty = transitionProperty;
    transitionDuration = params.get(NodeProps.kTransitionDuration) ?? 0;
    final originTransitionTimingFunction =
        params.get(NodeProps.kTransitionTimingFunction) ?? TimingFunction.kEase;
    transitionTimingFunction =
        resizeModeToCurve(originTransitionTimingFunction);
    transitionDelay = params.get(NodeProps.kTransitionDelay) ?? 0;
  }

  @override
  bool operator ==(Object other) {
    return other is Transition &&
        transitionProperty == other.transitionProperty &&
        transitionDuration == other.transitionDuration &&
        transitionTimingFunction == other.transitionTimingFunction &&
        transitionDelay == other.transitionDelay;
  }

  @override
  int get hashCode =>
      transitionProperty.hashCode |
      transitionDuration.hashCode |
      transitionTimingFunction.hashCode |
      transitionDelay.hashCode;

  void update(VoltronMap params) {
    transitionDuration =
        params.get(NodeProps.kTransitionDuration) ?? transitionDuration;
    final originTransitionTimingFunction =
        params.get(NodeProps.kTransitionTimingFunction);
    if (originTransitionTimingFunction != null) {
      transitionTimingFunction =
          resizeModeToCurve(originTransitionTimingFunction);
    }
    transitionDelay = params.get(NodeProps.kTransitionDelay) ?? transitionDelay;
  }
}

/// 遵循W3C transition和animation动画规则的Animation属性
class CssAnimation {
  /// 是否可以重复播放
  bool canRepeat = false;

  /// 是否已经被禁止播放
  bool isDisable = false;

  /// 播放次数
  int playCount = 1;

  /// 播放方向
  String direction = AnimationDirection.kNormal;

  /// 运行完所有动画所需要的时间(包含动画延迟播放的时间)，用于计算各属性动画tween的interval
  late Duration totalDuration;

  /// 属性动画的tweenSequenceMap，用于生成AnimatedBuilder动画的计算(Map<String, AnimationTweenSequence>)
  VoltronMap animationTweenSequenceMap = VoltronMap();

  CssAnimation(this.totalDuration, this.canRepeat, this.isDisable,
      this.playCount, this.direction);

  /// 获取动画属性当前renderViewModel对应值的策略Map
  Map<String, dynamic> _getAnimationStartValueStrategyMap(
      RenderViewModel viewModel) {
    final strategyMap = {
      NodeProps.kWidth: viewModel.width,
      NodeProps.kHeight: viewModel.height,
      NodeProps.kTop: viewModel.layoutY,
      NodeProps.kLeft: viewModel.layoutX,
      NodeProps.kOpacity: viewModel.opacity,
      NodeProps.kBackgroundColor: viewModel.backgroundColor,
      NodeProps.kTransform: viewModel.transform,
      NodeProps.kTransformOrigin: viewModel.transformOrigin,
    };

    return strategyMap;
  }

  /// 获取特殊动画属性需要转换key值的策略Map
  Map<String, String> get _specialKeyStrategyMap {
    final strategyMap = {
      NodeProps.kRight: NodeProps.kLeft,
      NodeProps.kBottom: NodeProps.kTop,
    };

    return strategyMap;
  }

  CssAnimation.initByTransition(
      VoltronMap transitionMap, RenderViewModel viewModel) {
    final startValueStrategyMap = _getAnimationStartValueStrategyMap(viewModel);
    final transitionTotalDuration =
        AnimationUtil.getTransitionTotalDuration(transitionMap);
    for (final key in transitionMap.keySet()) {
      final transition = transitionMap.get<Transition>(key);
      if (transition == null) {
        continue;
      }

      final delay = transition.transitionDelay;
      final duration = transition.transitionDuration;
      final startInterval = delay / transitionTotalDuration;
      final endInterval = (delay + duration) / transitionTotalDuration;
      final curve = transition.transitionTimingFunction;
      final formatKey = _specialKeyStrategyMap[key] ?? key;
      final tweenList = VoltronArray();
      final animationTween =
          AnimationTween(startValueStrategyMap[formatKey], null, 100.0);
      tweenList.push<AnimationTween>(animationTween);
      final animationTweenSequence =
          AnimationTweenSequence(tweenList, startInterval, endInterval, curve);
      animationTweenSequenceMap.push(key, animationTweenSequence);
    }
    totalDuration = Duration(milliseconds: transitionTotalDuration);
  }

  CssAnimation.initByAnimation(VoltronMap animation,
      List<VoltronMap> propertyMapSortList, RenderViewModel viewModel) {
    final animationDirection =
        animation.get<String>(NodeProps.kAnimationDirection) ??
            AnimationDirection.kNormal;
    final animationIterationCount =
        animation.get(NodeProps.kAnimationIterationCount);
    final animationDuration =
        animation.get<int>(NodeProps.kAnimationDuration) ?? 0;
    final animationDelay = animation.get<int>(NodeProps.kAnimationDelay) ?? 0;
    final animationTotalDuration = animationDuration + animationDelay;
    final startInterval = animationDelay / animationTotalDuration;
    const endInterval = 1.0;
    final originTimingFunction =
        animation.get<String>(NodeProps.kAnimationTimingFunction) ??
            TimingFunction.kEase;
    final curve = resizeModeToCurve(originTimingFunction);
    final sortListLength = propertyMapSortList.length;

    // 1.按照百分比的排列顺序，使用快慢指针关联属性前后的变化值，同时处理CSS属性值转换为Flutter属性值
    for (var i = 0; i < sortListLength - 1; i++) {
      final startValue = propertyMapSortList[i];
      AnimationUtil.handleUpdateAnimationTweenSequence(
          animationTweenSequenceMap,
          startValue,
          startInterval,
          endInterval,
          curve);
      final endValue = propertyMapSortList[i + 1];
      AnimationUtil.handleUpdateAnimationTweenSequence(
          animationTweenSequenceMap,
          endValue,
          startInterval,
          endInterval,
          curve,
          false);
    }
    // 2.剔除无效的AnimationTweenSequence
    AnimationUtil.handleRemoveInvalidAnimationTweenSequence(
        animationTweenSequenceMap);
    totalDuration = Duration(milliseconds: animationTotalDuration);
    if (animationIterationCount == AnimationIterationCount.kInfinite) {
      canRepeat = true;
    } else if (animationIterationCount.runtimeType == int) {
      playCount = animationIterationCount;
    }
    direction = animationDirection;
  }

  CssAnimation copy() {
    final cssAnimation =
        CssAnimation(totalDuration, canRepeat, isDisable, playCount, direction);
    for (final entry in animationTweenSequenceMap.entrySet()) {
      final key = entry.key;
      final value = entry.value;
      if (value is AnimationTweenSequence) {
        cssAnimation.animationTweenSequenceMap.push(key, value.copy());
      }
    }

    return cssAnimation;
  }

  @override
  bool operator ==(Object other) {
    return other is CssAnimation &&
        totalDuration == other.totalDuration &&
        canRepeat == other.canRepeat &&
        isDisable == other.isDisable &&
        playCount == other.playCount &&
        direction == other.direction &&
        animationTweenSequenceMap == other.animationTweenSequenceMap;
  }

  @override
  int get hashCode =>
      totalDuration.hashCode |
      canRepeat.hashCode |
      isDisable.hashCode |
      playCount.hashCode |
      direction.hashCode |
      animationTweenSequenceMap.hashCode;

  VoltronArray? getHasPropertyTweenSequenceItemList(String propertyName) {
    if (isDisable) {
      return null;
    }

    final list = animationTweenSequenceMap
        .get<AnimationTweenSequence>(propertyName)
        ?.itemList;
    return list;
  }

  /// 更新transition动画属性值，按照start => end => start的循环顺序更新属性值
  void updateTransitionAnimation<T>(String key, T value) {
    final tweenSequence =
        animationTweenSequenceMap.get<AnimationTweenSequence>(key);
    final tween = tweenSequence?.itemList.getLastItemByOrder<AnimationTween>();
    if (tween == null) {
      return;
    }

    if (tween.startValue == null) {
      tween.startValue = value;
    } else if (tween.endValue == null) {
      tween.endValue = value;
    } else {
      tween.startValue = tween.endValue;
      tween.endValue = value;
    }
  }

  /// 更新所有transition动画属性值(将endValue赋值给startValue)
  void updateAllTransitionAnimationValue() {
    // 当transition动画播放完毕，且不需要重复播放时，更新动画属性状态，避免动画被二次播放
    final keyList = animationTweenSequenceMap.keySet();
    for (final key in keyList) {
      final tweenSequence =
          animationTweenSequenceMap.get<AnimationTweenSequence>(key);
      final tween =
          tweenSequence?.itemList.getLastItemByOrder<AnimationTween>();
      if (tween == null) {
        return;
      }

      final endValue = tween.endValue;
      if (endValue != null) {
        tween.startValue = endValue;
      }
    }
  }
}

/// 动画TweenSequence，用于指定动画属性连续变化值
class AnimationTweenSequence {
  /// item: AnimationTween
  VoltronArray itemList;

  /// 动画开始间隔
  double startInterval;

  /// 动画结束间隔
  double endInterval;

  /// 动画效果
  Curve curve;

  AnimationTweenSequence(
      this.itemList, this.startInterval, this.endInterval, this.curve);

  AnimationTweenSequence copy() {
    final newTweenList = VoltronArray();
    final originTweenList = itemList.toList();
    for (final item in originTweenList) {
      if (item is AnimationTween) {
        newTweenList.push(item.copy());
      }
    }

    return AnimationTweenSequence(
        newTweenList, startInterval, endInterval, curve);
  }

  @override
  bool operator ==(Object other) {
    return other is AnimationTweenSequence &&
        itemList == other.itemList &&
        startInterval == other.startInterval &&
        endInterval == other.endInterval &&
        curve == other.curve;
  }

  @override
  int get hashCode =>
      itemList.hashCode |
      startInterval.hashCode |
      endInterval.hashCode |
      curve.hashCode;
}

/// 动画Tween，用于指定动画属性的开始值、结束值和权重
class AnimationTween {
  /// 动画开始值
  dynamic startValue;

  /// 动画结束值
  dynamic endValue;

  /// Tween的权重(在限定播放时间里的播放时长权重，详见TweenSequence的weight用法)
  double? weight;

  /// 当前累计的weight值，用于animation计算下一帧动画的weight值
  double? totalWeight;

  AnimationTween(this.startValue, this.endValue, [this.weight]);

  AnimationTween copy() {
    return AnimationTween(startValue, endValue, weight);
  }

  @override
  bool operator ==(Object other) {
    return other is AnimationTween &&
        startValue == other.startValue &&
        endValue == other.endValue &&
        weight == other.weight &&
        totalWeight == other.totalWeight;
  }

  @override
  int get hashCode =>
      startValue.hashCode |
      endValue.hashCode |
      weight.hashCode |
      totalWeight.hashCode;
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
    return other is TransformOrigin &&
        offset == other.offset &&
        alignment == other.alignment;
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
