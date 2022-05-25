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

import 'dart:collection';

import 'package:flutter/widgets.dart';

import '../common.dart';
import '../util.dart';

class StyleMethodProp {
  final Function(StyleMethodPropConsumer consumer, Object? value) method;
  final Object? defaultValue;

  const StyleMethodProp(this.method, this.defaultValue);
}

abstract class MethodPropProvider {
  final Map<String, StyleMethodProp> _styleMethodMap = {};

  Map<String, StyleMethodProp> get styleMethodMap => _styleMethodMap;

  void pushMethodProp(String name, StyleMethodProp? prop) {
    if (prop == null) {
      throw ArgumentError("push style method prop error , prop is null");
    }
    _styleMethodMap[name] = prop;
  }
}

mixin StyleMethodPropConsumer {
  MethodPropProvider get provider;
}

class NodeProps {
  static const int kTransparent = 0;
  static const String kAlignItems = "alignItems";
  static const String kAlignSelf = "alignSelf";
  static const String kOverflow = "overflow";
  static const String kBottom = "bottom";
  static const String kCollapsable = "collapsable";
  static const String kFlex = "flex";
  static const String kFlexGrow = "flexGrow";
  static const String kFlexShrink = "flexShrink";
  static const String kFlexBasis = "flexBasis";
  static const String kFlexDirection = "flexDirection";
  static const String kFlexWrap = "flexWrap";
  static const String kHeight = "height";
  static const String kJustifyContent = "justifyContent";
  static const String kLeft = "left";
  static const String kDisplay = "display";
  static const String kOnLayout = "onLayout";
  static const String kItemSticky = "sticky";

  static const String kMargin = "margin";
  static const String kMarginVertical = "marginVertical";
  static const String kMarginHorizontal = "marginHorizontal";
  static const String kMarginLeft = "marginLeft";
  static const String kMarginRight = "marginRight";
  static const String kMarginTop = "marginTop";
  static const String kMarginBottom = "marginBottom";

  static const String kPadding = "padding";
  static const String kPaddingVertical = "paddingVertical";
  static const String kPaddingHorizontal = "paddingHorizontal";
  static const String kPaddingLeft = "paddingLeft";
  static const String kPaddingRight = "paddingRight";
  static const String kPaddingTop = "paddingTop";
  static const String kPaddingBottom = "paddingBottom";

  static const String kPosition = "position";
  static const String kRight = "right";
  static const String kTop = "top";
  static const String kWidth = "width";

  static const String kMinWidth = "minWidth";
  static const String kMaxWidth = "maxWidth";
  static const String kMinHeight = "minHeight";
  static const String kMaxHeight = "maxHeight";

  static const String kBorderWidth = "borderWidth";
  static const String kBorderLeftWidth = "borderLeftWidth";
  static const String kBorderTopWidth = "borderTopWidth";
  static const String kBorderRightWidth = "borderRightWidth";
  static const String kBorderBottomWidth = "borderBottomWidth";

  static const String kBorderColor = "borderColor";
  static const String kBorderLeftColor = "borderLeftColor";
  static const String kBorderTopColor = "borderTopColor";
  static const String kBorderRightColor = "borderRightColor";
  static const String kBorderBottomColor = "borderBottomColor";
  static const String kBorderStyle = "borderStyle";

  // hippy linear-gradient
  static const String linearGradient = "linearGradient";

  // hippy box-shadow
  static const String shadowOffset = "shadowOffset";
  static const String shadowOffsetX = "shadowOffsetX";
  static const String shadowOffsetY = "shadowOffsetY";
  static const String shadowOpacity = "shadowOpacity";
  static const String shadowRadius = "shadowRadius";
  static const String shadowSpread = "shadowSpread";
  static const String shadowColor = "shadowColor";

  // voltron box-shadow
  static const String kBoxShadow = "boxShadow";

  static const String kEnabled = "enabled";
  static const String kOpacity = "opacity";
  static const String kBackgroundColor = "backgroundColor";
  static const String kBackgroundColors = "backgroundColors";
  static const String kColors = "colors";
  static const String kColor = "color";
  static const String kBackgroundImage = "backgroundImage";
  static const String kBackgroundPositionX = "backgroundPositionX";
  static const String kBackgroundPositionY = "backgroundPositionY";
  static const String kBackgroundSize = "backgroundSize";
  static const String kBackgroundRepeat = "backgroundRepeat";
  static const String kFontSize = "fontSize";
  static const String kLetterSpacing = "letterSpacing";
  static const String kFontWeight = "fontWeight";
  static const String kFontStyle = "fontStyle";
  static const String kFontFamily = "fontFamily";
  static const String kTextOverflow = "textOverflow";
  static const String kLineHeight = "lineHeight";
  static const String kNumberOfLines = "numberOfLines";
  static const String kEllipsizeMode = "ellipsizeMode";
  static const String kOn = "on";
  static const String kResizeMode = "resizeMode";
  static const String kResizeMethod = "resizeMethod";
  static const String kText = "text";
  static const String kTextAlign = "textAlign";
  static const String kWhiteSpace = "whiteSpace";
  static const String kTextAlignVertical = "textAlignVertical";
  static const String kTextDecorationLine = "textDecorationLine";
  static const String kTextDecorationStyle = "textDecorationStyle";
  static const String kTextDecorationColor = "textDecorationColor";
  static const String kPropShadowOffset = "textShadowOffset";
  static const String kPropShadowOffsetWidth = "width";
  static const String kPropShadowOffsetHeight = "height";
  static const String kPropShadowRadius = "textShadowRadius";
  static const String kPropShadowColor = "textShadowColor";
  static const String kPropEnableScale = "enableScale";
  static const String kSrc = "src";
  static const String kSource = "source";
  static const String kTintColor = "tintColor";
  static const String kBounceTime = "bounceTime";
  static const String kCapInsets = "capInsets";
  static const String kDefaultSource = "defaultSource";
  static const String kLevel = "level";
  static const String kVersion = "version";

  static const String kOnInterceptTouchEvent = "onInterceptTouchEvent";
  static const String kOnInterceptPullUpEvent = "onInterceptPullUpEvent";

  static const String kBorderRadius = "borderRadius";
  static const String kBorderTopLeftRadius = "borderTopLeftRadius";
  static const String kBorderTopRightRadius = "borderTopRightRadius";
  static const String kBorderBottomLeftRadius = "borderBottomLeftRadius";
  static const String kBorderBottomRightRadius = "borderBottomRightRadius";

  static const String kOnScrollBeginDrag = "onScrollBeginDrag";
  static const String kOnScrollEndDrag = "onScrollEndDrag";
  static const String kOnMomentumScrollBegin = "onMomentumScrollBegin";
  static const String kOnMomentumScrollEnd = "onMomentumScrollEnd";
  static const String kOnScrollEnable = "onScrollEnable";
  static const String kScrollEnable = "scrollEnabled";
  static const String kScrollEventThrottle = "scrollEventThrottle";

  static const String kOnLoad = "onLoad";
  static const String kOnLoadEnd = "onLoadEnd";
  static const String kOnLoadStart = "onLoadStart";
  static const String kOnError = "onError";
  static const String kOnProgress = "onProgress";

  static const String kOnRefresh = "onRefresh";

  static const String kTransform = "transform";
  static const String kTransformOrigin = "transformOrigin";
  static const String kZIndex = "zIndex";

  static const double kDefaultFontSizeSp = 14.0;

  static const String kViewClassName = "View";
  static const String kTextClassName = "Text";
  static const String kImageClassName = "Text";

  /// 节点样式，包含内联样式
  static const String kStyle = "style";
  static const String kAttributes = 'attributes';
  static const String kProps = "props";
  static const String kRootNode = "RootNode";
  static const String kCustomProp = "customProp";

  static const String kPropAccessibilityLabel = "accessibilityLabel";
  static const String kFocusable = "focusable";
  static const String kNextFocusDownId = "nextFocusDownId";
  static const String kNextFocusUpId = "nextFocusUpId";
  static const String kNextFocusLeftId = "nextFocusLeftId";
  static const String kNextFocusRightId = "nextFocusRightId";
  static const String kRequestFocus = "requestFocus";

  static const String kVisible = "visible";
  static const String kRepeatCount = "repeatCount";

  static final HashSet<String> _justLayoutPropSet = HashSet<String>();
  static HashSet<String> get justLayoutPropSet {
    if (_justLayoutPropSet.isEmpty) {
      _justLayoutPropSet.addAll({
        kAlignSelf,
        kAlignItems,
        kCollapsable,
        kFlex,
        kFlexDirection,
        kFlexWrap,
        kJustifyContent,
        //position
        kPosition,
        kRight,
        kTop,
        kBottom,
        kLeft,
        //dimensions
        kWidth,
        kHeight,
        kMinWidth,
        kMaxWidth,
        kMinHeight,
        kMaxHeight,
        //margin
        kMargin,
        kMarginVertical,
        kMarginHorizontal,
        kMarginLeft,
        kMarginRight,
        kMarginTop,
        kMarginBottom,
        //padding
        kPadding,
        kPaddingVertical,
        kPaddingHorizontal,
        kPaddingLeft,
        kPaddingRight,
        kPaddingTop,
        kPaddingBottom
      });
    }
    return _justLayoutPropSet;
  }

  static bool isJustLayout(VoltronMap map, String prop) {
    if (justLayoutPropSet.contains(prop)) {
      return true;
    }

    switch (prop) {
      case kOpacity:
        return map.isNull(kOpacity) || map.get<double>(kOpacity) == 1;
      case kBorderRadius:
        if (map.containsKey(kBackgroundColor) && map.get<int>(kBackgroundColor) != kTransparent) {
          return false;
        }
        if (map.containsKey(kBorderWidth) &&
            !map.isNull(kBorderWidth) &&
            map.get<double>(kBorderWidth) != 0) {
          return false;
        }
        return true;
      case kBorderLeftColor:
        return map.get<int>(kBorderLeftColor) == kTransparent;
      case kBorderRightColor:
        return map.get<int>(kBorderRightColor) == kTransparent;
      case kBorderTopColor:
        return map.get<int>(kBorderTopColor) == kTransparent;
      case kBorderBottomColor:
        return map.get<int>(kBorderBottomColor) == kTransparent;
      case kBorderWidth:
        return map.isNull(kBorderWidth) || map.get<double>(kBorderWidth) == 0;
      case kBorderLeftWidth:
        return map.isNull(kBorderLeftWidth) || map.get<double>(kBorderLeftWidth) == 0;
      case kBorderTopWidth:
        return map.isNull(kBorderTopWidth) || map.get<double>(kBorderTopWidth) == 0;
      case kBorderRightWidth:
        return map.isNull(kBorderRightWidth) || map.get<double>(kBorderRightWidth) == 0;
      case kBorderBottomWidth:
        return map.isNull(kBorderBottomWidth) || map.get<double>(kBorderBottomWidth) == 0;
      case kOverflow:
        return map.isNull(kOverflow) || kVisible == map.get<String>(kOverflow);
      default:
        return false;
    }
  }
}

enum ContainOverflow { hidden, visible }

enum ImageResizeMode {
  // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等ImageResizeMode于容器视图的尺寸
  // 这样图片完全被包裹在容器中，容器中可能留有空白
  contain,
  // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
  // 这样图片完全覆盖甚至超出容器，容器中不留任何空白
  cover,
  // 居中不拉伸
  center,
  // 不拉伸，居左上
  auto,
  // 拉伸图片且不维持宽高比，直到宽高都刚好填满容器
  fit
}

BoxFit resizeModeToBoxFit(String? resizeMode) {
  if (!isEmpty(resizeMode)) {
    if (enumValueToString(ImageResizeMode.contain) == resizeMode) {
      // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都小于等于容器视图的尺寸
      // 这样图片完全被包裹在容器中，容器中可能留有空白
      return BoxFit.contain;
    } else if (enumValueToString(ImageResizeMode.center) == resizeMode) {
      // 居中不拉伸
      return BoxFit.none;
    } else if (enumValueToString(ImageResizeMode.cover) == resizeMode) {
      // 在保持图片宽高比的前提下缩放图片，直到宽度和高度都大于等于容器视图的尺寸
      // 这样图片完全覆盖甚至超出容器，容器中不留任何空白
      return BoxFit.cover;
    } else if (enumValueToString(ImageResizeMode.auto) == resizeMode) {
      // 不拉伸，居左上
      return BoxFit.none;
    } else {
      // 拉伸图片且不维持宽高比，直到宽高都刚好填满容器
      return BoxFit.fill;
    }
  }

  return BoxFit.fill;
}

ImageRepeat resizeModeToImageRepeat(String? value) {
  if (value == 'no-repeat') {
    return ImageRepeat.noRepeat;
  } else if (value == 'repeat-x') {
    return ImageRepeat.repeatX;
  } else if (value == 'repeat-y') {
    return ImageRepeat.repeatY;
  }
  return ImageRepeat.repeat;
}

Clip toOverflow(String overflowString) {
  if (enumValueToString(ContainOverflow.visible) == overflowString) {
    return Clip.none;
  } else if (enumValueToString(ContainOverflow.hidden) == overflowString) {
    return Clip.hardEdge;
  }
  return Clip.hardEdge;
}
