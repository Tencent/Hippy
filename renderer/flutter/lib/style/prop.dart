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
  static const String kBorderStyles = "borderStyle";

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

  static const String kOnClick = "onClick";
  static const String kOnLongClick = "onLongClick";
  static const String kOnPressIn = "onPressIn";
  static const String kOnPressOut = "onPressOut";
  static const String kOnTouchDown = "onTouchDown";
  static const String kOnTouchMove = "onTouchMove";
  static const String kOnTouchEnd = "onTouchEnd";
  static const String kOnTouchCancel = "onTouchCancel";
  static const String kOnInterceptTouchEvent = "onInterceptTouchEvent";
  static const String kOnInterceptPullUpEvent = "onInterceptPullUpEvent";
  static const String kOnAttachedToWindow = "onAttachedToWindow";
  static const String kOnDetachedFromWindow = "onDetachedFromWindow";

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

  static const String kOnRefresh = "onRefresh";

  static const String kTransform = "transform";
  static const String kTransformOrigin = "transformOrigin";
  static const String kZIndex = "zIndex";

  static const double kDefaultFontSizeSp = 14.0;

  static const String kViewClassName = "View";
  static const String kTextClassName = "Text";

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

  /// 动画相关
  // animation
  static const String kAnimation = 'animation';
  static const String kAnimationKeyFramePropertyMap = 'animationPropertyMap';
  static const String kAnimationKeyFramePropertyName = 'propertyName';
  static const String kAnimationKeyFramePropertyValue = 'value';
  static const String kAnimationKeyFrameFrom = 'from';
  static const String kAnimationKeyFrameTo = 'to';
  static const String kAnimationKeyFrameZeroPercent = '0%';
  static const String kAnimationKeyFrameHundredPercent = '100%';

  /// keyframe selector的百分比数字
  static const String kAnimationKeyFrameSelectorPercent =
      'animationKeyFrameSelectorPercent';

  /// 需要根据animation规则操作的属性Map
  static const String kAnimationPropertyOptionMap =
      'animationPropertyOptionMap';

  /// animation动画播放结束后，animationFillModel为'none'时，需要设置的属性集
  static const String kAnimationEndPropertyMap = 'animationEndPropertyMap';
  static const String kAnimationDuration = 'animationDuration';
  static const String kAnimationTimingFunction = 'animationTimingFunction';
  static const String kAnimationDelay = 'animationDelay';
  static const String kAnimationIterationCount = 'animationIterationCount';
  static const String kAnimationDirection = 'animationDirection';
  static const String kAnimationFillModel = 'animationFillModel';
  static const String kAnimationPlayState = 'animationPlayState';
  // transition
  static const String kTransition = 'transition';
  static const String kTransitionPropertyAll = 'all';
  static const String kTransitionProperty = 'transitionProperty';
  static const String kTransitionDuration = 'transitionDuration';
  static const String kTransitionTimingFunction = 'transitionTimingFunction';
  static const String kTransitionDelay = 'transitionDelay';

  /// 当前voltron支持的动画属性集合
  static const List<String> animationSupportPropertyList = [
    kWidth,
    kHeight,
    kTop,
    kRight,
    kBottom,
    kLeft,
    kOpacity,
    kBackgroundColor,
    kTransform,
    kTransformOrigin,
  ];

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

  static final HashSet<String> _touchEventPropSet = HashSet<String>();

  static HashSet<String> get touchEventPropSet {
    if (_touchEventPropSet.isEmpty) {
      _touchEventPropSet.addAll({
        kOnClick,
        kOnLongClick,
        kOnPressIn,
        kOnPressOut,
        kOnTouchCancel,
        kOnTouchDown,
        kOnTouchEnd,
        kOnTouchMove
      });
    }
    return _touchEventPropSet;
  }

  static bool isTouchEventProp(String prop) => touchEventPropSet.contains(prop);

  static bool isJustLayout(VoltronMap map, String prop) {
    if (justLayoutPropSet.contains(prop)) {
      return true;
    }

    switch (prop) {
      case kOpacity:
        return map.isNull(kOpacity) || map.get<double>(kOpacity) == 1;
      case kBorderRadius:
        if (map.containsKey(kBackgroundColor) &&
            map.get<int>(kBackgroundColor) != kTransparent) {
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
        return map.isNull(kBorderLeftWidth) ||
            map.get<double>(kBorderLeftWidth) == 0;
      case kBorderTopWidth:
        return map.isNull(kBorderTopWidth) ||
            map.get<double>(kBorderTopWidth) == 0;
      case kBorderRightWidth:
        return map.isNull(kBorderRightWidth) ||
            map.get<double>(kBorderRightWidth) == 0;
      case kBorderBottomWidth:
        return map.isNull(kBorderBottomWidth) ||
            map.get<double>(kBorderBottomWidth) == 0;
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

/// 动画相关
/// 过渡效果的速度曲线
class TimingFunction {
  // 规定以相同速度开始至结束的过渡效果（等于 cubic-bezier(0,0,1,1)）
  static const String kLinear = 'linear';
  // 规定慢速开始，然后变快，然后慢速结束的过渡效果（cubic-bezier(0.25,0.1,0.25,1)）
  static const String kEase = 'ease';
  // 规定以慢速开始的过渡效果（等于 cubic-bezier(0.42,0,1,1)）
  static const String kEaseIn = 'ease-in';
  // 规定以慢速结束的过渡效果（等于 cubic-bezier(0,0,0.58,1)）
  static const String kEaseOut = 'ease-out';
  // 规定以慢速开始和结束的过渡效果（等于 cubic-bezier(0.42,0,0.58,1)）
  static const String kEaseInOut = 'ease-in-out';
}

Curve resizeModeToCurve(String timingFunction) {
  final strategyMap = {
    TimingFunction.kLinear: Curves.linear,
    TimingFunction.kEase: Curves.ease,
    TimingFunction.kEaseIn: Curves.easeIn,
    TimingFunction.kEaseOut: Curves.easeOut,
    TimingFunction.kEaseInOut: Curves.easeInOut,
  };

  return strategyMap[timingFunction] ?? Curves.linear;
}

/// 动画的播放次数
class AnimationIterationCount {
  // 一个数字，定义应该播放多少次动画
  static const String n = 'n';
  // 指定动画应该播放无限次（永远）
  static const String kInfinite = 'infinite';
}

/// 指定是否应该轮流反向播放动画。
class AnimationDirection {
  // 动画按正常播放(默认值)
  static const String kNormal = 'normal';
  // 动画反向播放
  static const String kReverse = 'reverse';
  // 动画在奇数次（1、3、5...）正向播放，在偶数次（2、4、6...）反向播放 (TODO: 暂不支持)
  static const String kAlternate = 'alternate';
  // 动画在奇数次（1、3、5...）反向播放，在偶数次（2、4、6...）正向播放 (TODO: 暂不支持)
  static const String kAlternateReverse = 'alternateReverse';
}

/// 规定当动画不播放时（当动画完成时，或当动画有一个延迟未开始播放时），要应用到元素的样式
class AnimationFillMode {
  // 动画在动画执行之前和之后不会应用任何样式到目标元素(默认值)
  static const String kNone = 'none';
  // 在动画结束后（由 animation-iteration-count 决定），动画将应用该属性值
  static const String kForwards = 'forwards';
  // 动画将应用在 animation-delay 定义期间启动动画的第一次迭代的关键帧中定义的属性值。
  // 这些都是 from 关键帧中的值（当 animation-direction 为 "normal" 或 "alternate" 时）
  // 或 to 关键帧中的值（当 animation-direction 为 "reverse" 或 "alternate-reverse" 时）。
  static const String kBackwards = 'backwards';
  // 动画遵循 forwards 和 backwards 的规则。也就是说，动画会在两个方向上扩展动画属性。
  static const String kBoth = 'both';
}

/// 指定动画是否正在运行或已暂停
class AnimationPlayState {
  // 运行的动画(默认)
  static const String kRunning = 'running';
  // 暂停动画
  static const String lPaused = 'paused';
}
