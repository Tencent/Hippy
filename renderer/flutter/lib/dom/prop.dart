import 'dart:collection';

import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../util/enum_util.dart';
import '../util/string_util.dart';

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

abstract class StyleMethodPropConsumer {
  MethodPropProvider get provider;
}

class NodeProps {
  static const int transparent = 0;
  static const String alignItems = "alignItems";
  static const String alignSelf = "alignSelf";
  static const String overflow = "overflow";
  static const String bottom = "bottom";
  static const String collapsable = "collapsable";
  static const String flex = "flex";
  static const String flexGrow = "flexGrow";
  static const String flexShrink = "flexShrink";
  static const String flexBasis = "flexBasis";
  static const String flexDirection = "flexDirection";
  static const String flexWrap = "flexWrap";
  static const String height = "height";
  static const String justifyContent = "justifyContent";
  static const String left = "left";
  static const String display = "display";
  static const String onLayout = "onLayout";
  static const String itemSticky = "sticky";

  static const String margin = "margin";
  static const String marginVertical = "marginVertical";
  static const String marginHorizontal = "marginHorizontal";
  static const String marginLeft = "marginLeft";
  static const String marginRight = "marginRight";
  static const String marginTop = "marginTop";
  static const String marginBottom = "marginBottom";

  static const String padding = "padding";
  static const String paddingVertical = "paddingVertical";
  static const String paddingHorizontal = "paddingHorizontal";
  static const String paddingLeft = "paddingLeft";
  static const String paddingRight = "paddingRight";
  static const String paddingTop = "paddingTop";
  static const String paddingBottom = "paddingBottom";

  static const String position = "position";
  static const String right = "right";
  static const String top = "top";
  static const String width = "width";

  static const String minWidth = "minWidth";
  static const String maxWidth = "maxWidth";
  static const String minHeight = "minHeight";
  static const String maxHeight = "maxHeight";

  static const String borderWidth = "borderWidth";
  static const String borderLeftWidth = "borderLeftWidth";
  static const String borderTopWidth = "borderTopWidth";
  static const String borderRightWidth = "borderRightWidth";
  static const String borderBottomWidth = "borderBottomWidth";

  static const String borderColor = "borderColor";
  static const String borderLeftColor = "borderLeftColor";
  static const String borderTopColor = "borderTopColor";
  static const String borderRightColor = "borderRightColor";
  static const String borderBottomColor = "borderBottomColor";
  static const String borderStyles = "borderStyle";

  static const String boxShadow = "boxShadow";

  static const String enabled = "enabled";
  static const String opacity = "opacity";
  static const String backgroundColor = "backgroundColor";
  static const String backgroundColors = "backgroundColors";
  static const String colors = "colors";
  static const String color = "color";
  static const String backgroundImage = "backgroundImage";
  static const String backgroundPositionX = "backgroundPositionX";
  static const String backgroundPositionY = "backgroundPositionY";
  static const String backgroundSize = "backgroundSize";
  static const String backgroundRepeat = "backgroundRepeat";
  static const String fontSize = "fontSize";
  static const String letterSpacing = "letterSpacing";
  static const String fontWeight = "fontWeight";
  static const String fontStyle = "fontStyle";
  static const String fontFamily = "fontFamily";
  static const String textOverflow = "textOverflow";
  static const String lineHeight = "lineHeight";
  static const String numberOfLines = "numberOfLines";
  static const String ellipsizeMode = "ellipsizeMode";
  static const String on = "on";
  static const String resizeMode = "resizeMode";
  static const String resizeMethod = "resizeMethod";
  static const String text = "text";
  static const String textAlign = "textAlign";
  static const String whiteSpace = "whiteSpace";
  static const String textAlignVertical = "textAlignVertical";
  static const String textDecorationLine = "textDecorationLine";
  static const String propShadowOffset = "textShadowOffset";
  static const String propShadowOffsetWidth = "width";
  static const String propShadowOffsetHeight = "height";
  static const String propShadowRadius = "textShadowRadius";
  static const String propShadowColor = "textShadowColor";
  static const String propEnableScale = "enableScale";
  static const String src = "src";
  static const String source = "source";
  static const String tintColor = "tintColor";
  static const String bounceTime = "bounceTime";
  static const String capInsets = "capInsets";
  static const String defaultSource = "defaultSource";
  static const String level = "level";
  static const String version = "version";

  static const String onClick = "onClick";
  static const String onLongClick = "onLongClick";
  static const String onPressIn = "onPressIn";
  static const String onPressOut = "onPressOut";
  static const String onTouchDown = "onTouchDown";
  static const String onTouchMove = "onTouchMove";
  static const String onTouchEnd = "onTouchEnd";
  static const String onTouchCancel = "onTouchCancel";
  static const String onInterceptTouchEvent = "onInterceptTouchEvent";
  static const String onInterceptPullUpEvent = "onInterceptPullUpEvent";
  static const String onAttachedToWindow = "onAttachedToWindow";
  static const String onDetachedFromWindow = "onDetachedFromWindow";

  static const String borderRadius = "borderRadius";
  static const String borderTopLeftRadius = "borderTopLeftRadius";
  static const String borderTopRightRadius = "borderTopRightRadius";
  static const String borderBottomLeftRadius = "borderBottomLeftRadius";
  static const String borderBottomRightRadius = "borderBottomRightRadius";

  static const onScrollBeginDrag = "onScrollBeginDrag";
  static const onScrollEndDrag = "onScrollEndDrag";
  static const onMomentumScrollBegin = "onMomentumScrollBegin";
  static const onMomentumScrollEnd = "onMomentumScrollEnd";
  static const onScrollEnable = "onScrollEnable";
  static const scrollEnable = "scrollEnabled";
  static const scrollEventThrottle = "scrollEventThrottle";

  static const String onLoad = "onLoad";
  static const String onLoadEnd = "onLoadEnd";
  static const String onLoadStart = "onLoadStart";
  static const String onError = "onError";

  static const String onRefresh = "onRefresh";

  static const String transform = "transform";
  static const String transformOrigin = "transformOrigin";
  static const String zIndex = "zIndex";

  static const double fontSizeSp = 14.0;

  static const String viewClassName = "View";
  static const String textClassName = "Text";

  /// 节点样式，包含内联样式
  static const String style = "style";
  static const String attributes = 'attributes';
  static const String props = "props";
  static const String rootNode = "RootNode";
  static const String customProp = "customProp";

  static const String propAccessibilityLabel = "accessibilityLabel";
  static const String focusable = "focusable";
  static const String nextFocusDownId = "nextFocusDownId";
  static const String nextFocusUpId = "nextFocusUpId";
  static const String nextFocusLeftId = "nextFocusLeftId";
  static const String nextFocusRightId = "nextFocusRightId";
  static const String requestFocus = "requestFocus";

  static const String visible = "visible";
  static const String repeatCount = "repeatCount";

  /// 动画相关
  // animation
  static const String animation = 'animation';
  static const String animationKeyFramePropertyMap = 'animationPropertyMap';
  static const String animationKeyFramePropertyName = 'propertyName';
  static const String animationKeyFramePropertyValue = 'value';
  static const String animationKeyFrameFrom = 'from';
  static const String animationKeyFrameTo = 'to';
  static const String animationKeyFrameZeroPercent = '0%';
  static const String animationKeyFrameHundredPercent = '100%';

  /// keyframe selector的百分比数字
  static const String animationKeyFrameSelectorPercent =
      'animationKeyFrameSelectorPercent';

  /// 需要根据animation规则操作的属性Map
  static const String animationPropertyOptionMap = 'animationPropertyOptionMap';

  /// animation动画播放结束后，animationFillModel为'none'时，需要设置的属性集
  static const String animationEndPropertyMap = 'animationEndPropertyMap';
  static const String animationDuration = 'animationDuration';
  static const String animationTimingFunction = 'animationTimingFunction';
  static const String animationDelay = 'animationDelay';
  static const String animationIterationCount = 'animationIterationCount';
  static const String animationDirection = 'animationDirection';
  static const String animationFillModel = 'animationFillModel';
  static const String animationPlayState = 'animationPlayState';
  // transition
  static const String transition = 'transition';
  static const String transitionPropertyAll = 'all';
  static const String transitionProperty = 'transitionProperty';
  static const String transitionDuration = 'transitionDuration';
  static const String transitionTimingFunction = 'transitionTimingFunction';
  static const String transitionDelay = 'transitionDelay';

  /// 当前voltron支持的动画属性集合
  static const List<String> animationSupportPropertyList = [
    width,
    height,
    top,
    right,
    bottom,
    left,
    opacity,
    backgroundColor,
    transform,
    transformOrigin,
  ];

  static final HashSet<String> _justLayoutPropSet = HashSet<String>();
  static HashSet<String> get justLayoutPropSet {
    if (_justLayoutPropSet.isEmpty) {
      _justLayoutPropSet.addAll({
        alignSelf,
        alignItems,
        collapsable,
        flex,
        flexDirection,
        flexWrap,
        justifyContent,
        //position
        position,
        right,
        top,
        bottom,
        left,
        //dimensions
        width,
        height,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        //margin
        margin,
        marginVertical,
        marginHorizontal,
        marginLeft,
        marginRight,
        marginTop,
        marginBottom,
        //padding
        padding,
        paddingVertical,
        paddingHorizontal,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom
      });
    }
    return _justLayoutPropSet;
  }

  static final HashSet<String> _touchEventPropSet = HashSet<String>();

  static HashSet<String> get touchEventPropSet {
    if (_touchEventPropSet.isEmpty) {
      _touchEventPropSet.addAll({
        onClick,
        onLongClick,
        onPressIn,
        onPressOut,
        onTouchCancel,
        onTouchDown,
        onTouchEnd,
        onTouchMove
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
      case opacity:
        return map.isNull(opacity) || map.get<double>(opacity) == 1;
      case borderRadius:
        if (map.containsKey(backgroundColor) &&
            map.get<int>(backgroundColor) != transparent) {
          return false;
        }
        if (map.containsKey(borderWidth) &&
            !map.isNull(borderWidth) &&
            map.get<double>(borderWidth) != 0) {
          return false;
        }
        return true;
      case borderLeftColor:
        return map.get<int>(borderLeftColor) == transparent;
      case borderRightColor:
        return map.get<int>(borderRightColor) == transparent;
      case borderTopColor:
        return map.get<int>(borderTopColor) == transparent;
      case borderBottomColor:
        return map.get<int>(borderBottomColor) == transparent;
      case borderWidth:
        return map.isNull(borderWidth) || map.get<double>(borderWidth) == 0;
      case borderLeftWidth:
        return map.isNull(borderLeftWidth) ||
            map.get<double>(borderLeftWidth) == 0;
      case borderTopWidth:
        return map.isNull(borderTopWidth) ||
            map.get<double>(borderTopWidth) == 0;
      case borderRightWidth:
        return map.isNull(borderRightWidth) ||
            map.get<double>(borderRightWidth) == 0;
      case borderBottomWidth:
        return map.isNull(borderBottomWidth) ||
            map.get<double>(borderBottomWidth) == 0;
      case overflow:
        return map.isNull(overflow) || visible == map.get<String>(overflow);
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
  static const String linear = 'linear';
  // 规定慢速开始，然后变快，然后慢速结束的过渡效果（cubic-bezier(0.25,0.1,0.25,1)）
  static const String ease = 'ease';
  // 规定以慢速开始的过渡效果（等于 cubic-bezier(0.42,0,1,1)）
  static const String easeIn = 'ease-in';
  // 规定以慢速结束的过渡效果（等于 cubic-bezier(0,0,0.58,1)）
  static const String easeOut = 'ease-out';
  // 规定以慢速开始和结束的过渡效果（等于 cubic-bezier(0.42,0,0.58,1)）
  static const String easeInOut = 'ease-in-out';
}

Curve resizeModeToCurve(String timingFunction) {
  final strategyMap = {
    TimingFunction.linear: Curves.linear,
    TimingFunction.ease: Curves.ease,
    TimingFunction.easeIn: Curves.easeIn,
    TimingFunction.easeOut: Curves.easeOut,
    TimingFunction.easeInOut: Curves.easeInOut,
  };

  return strategyMap[timingFunction] ?? Curves.linear;
}

/// 动画的播放次数
class AnimationIterationCount {
  // 一个数字，定义应该播放多少次动画
  static const String n = 'n';
  // 指定动画应该播放无限次（永远）
  static const String infinite = 'infinite';
}

/// 指定是否应该轮流反向播放动画。
class AnimationDirection {
  // 动画按正常播放(默认值)
  static const String normal = 'normal';
  // 动画反向播放
  static const String reverse = 'reverse';
  // 动画在奇数次（1、3、5...）正向播放，在偶数次（2、4、6...）反向播放 (TODO: 暂不支持)
  static const String alternate = 'alternate';
  // 动画在奇数次（1、3、5...）反向播放，在偶数次（2、4、6...）正向播放 (TODO: 暂不支持)
  static const String alternateReverse = 'alternateReverse';
}

/// 规定当动画不播放时（当动画完成时，或当动画有一个延迟未开始播放时），要应用到元素的样式
class AnimationFillMode {
  // 动画在动画执行之前和之后不会应用任何样式到目标元素(默认值)
  static const String none = 'none';
  // 在动画结束后（由 animation-iteration-count 决定），动画将应用该属性值
  static const String forwards = 'forwards';
  // 动画将应用在 animation-delay 定义期间启动动画的第一次迭代的关键帧中定义的属性值。
  // 这些都是 from 关键帧中的值（当 animation-direction 为 "normal" 或 "alternate" 时）
  // 或 to 关键帧中的值（当 animation-direction 为 "reverse" 或 "alternate-reverse" 时）。
  static const String backwards = 'backwards';
  // 动画遵循 forwards 和 backwards 的规则。也就是说，动画会在两个方向上扩展动画属性。
  static const String both = 'both';
}

/// 指定动画是否正在运行或已暂停
class AnimationPlayState {
  // 运行的动画(默认)
  static const String running = 'running';
  // 暂停动画
  static const String paused = 'paused';
}
