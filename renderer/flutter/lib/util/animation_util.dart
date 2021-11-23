import 'package:flutter/animation.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../dom/prop.dart';
import '../render/node.dart';
import '../render/view_model.dart';
import 'transform_util.dart';

/// 动画工具类
class AnimationUtil {
  /// ------------
  /// Animation相关
  /// ------------
  /// 动画属性初始值
  static final Map<String, dynamic> _animationSupportPropertyInitValueMap = {
    NodeProps.width: 0.0,
    NodeProps.height: 0.0,
    NodeProps.top: 0.0,
    NodeProps.left: 0.0,
    NodeProps.opacity: 1.0,
    NodeProps.backgroundColor: Colors.transparent,
    NodeProps.transform:
        Matrix4.fromList([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
    NodeProps.transformOrigin: TransformOrigin(null),
  };

  /// 格式化style中的animation属性，将from,to转换成百分比的形式：from => 0%, to => 100%
  static void _handleFormatStyleAnimation(VoltronMap animationPropertyMap) {
    animationPropertyMap.replaceKey(NodeProps.animationKeyFrameZeroPercent,
        NodeProps.animationKeyFrameFrom);
    animationPropertyMap.replaceKey(NodeProps.animationKeyFrameHundredPercent,
        NodeProps.animationKeyFrameTo);
  }

  /// 属性初始值的补缺处理
  static void _handleSupplyPropertyInitValue(
      VoltronMap? propertyMap, Map<String, dynamic> initValueMap) {
    if (propertyMap == null) {
      return;
    }

    for (final entry in initValueMap.entries) {
      final key = entry.key;
      final value = entry.value;
      if (!propertyMap.containsKey(key)) {
        propertyMap.push(key, value);
      }
    }
  }

  /// 动画帧0%(from)和100%(to)的样式补缺处理，假如缺失，则将style的初始动画属性值，赋值给animation
  static void _handleSupplyAnimationStartAndEndStyle(
      VoltronMap animationPropertyMap, VoltronMap style) {
    // 1.结合style的属性值，获取当前节点的动画属性初始值
    final styleWithAnimationProperty =
        style.getByKeyList(NodeProps.animationSupportPropertyList);
    _handleSupplyPropertyInitValue(
        styleWithAnimationProperty, _animationSupportPropertyInitValueMap);
    final initValueMap = styleWithAnimationProperty.data;
    // 2.处理0%(from)的样式补缺
    animationPropertyMap.pushIfNotExist(
        NodeProps.animationKeyFrameZeroPercent, VoltronMap());
    final zeroPercentProperty = animationPropertyMap
        .get<VoltronMap>(NodeProps.animationKeyFrameZeroPercent);
    _handleSupplyPropertyInitValue(zeroPercentProperty, initValueMap);
    // 3.100%(to)的样式补缺
    animationPropertyMap.pushIfNotExist(
        NodeProps.animationKeyFrameHundredPercent, VoltronMap());
    final hundredPercentProperty = animationPropertyMap
        .get<VoltronMap>(NodeProps.animationKeyFrameHundredPercent);
    _handleSupplyPropertyInitValue(hundredPercentProperty, initValueMap);
  }

  /// 根据动画运动方向，获取animation设定的开始style
  static VoltronMap? _getAnimationStartStyleMap(
      VoltronMap animation, VoltronMap animationPropertyMap) {
    final animationDirection =
        animation.get<String>(NodeProps.animationDirection) ??
            AnimationDirection.normal;
    final startStyleMapStrategyMap = {
      AnimationDirection.normal: () => animationPropertyMap
          .get<VoltronMap>(NodeProps.animationKeyFrameZeroPercent),
      AnimationDirection.reverse: () => animationPropertyMap
          .get<VoltronMap>(NodeProps.animationKeyFrameHundredPercent),
    };
    final animationStartStyleMap =
        startStyleMapStrategyMap[animationDirection]?.call();

    return animationStartStyleMap;
  }

  /// 根据动画运动方向，获取animation设定的结束style
  static VoltronMap? _getAnimationEndStyleMap(
      VoltronMap animation, VoltronMap animationPropertyMap) {
    final animationDirection =
        animation.get<String>(NodeProps.animationDirection) ??
            AnimationDirection.normal;
    final endStyleMapStrategyMap = {
      AnimationDirection.normal: () => animationPropertyMap
          .get<VoltronMap>(NodeProps.animationKeyFrameHundredPercent),
      AnimationDirection.reverse: () => animationPropertyMap
          .get<VoltronMap>(NodeProps.animationKeyFrameZeroPercent),
    };
    final animationEndStyleMap =
        endStyleMapStrategyMap[animationDirection]?.call();

    return animationEndStyleMap;
  }

  /// 根据animation的规则，获取相关需要根据规则操作的动画属性Map(key: String, value: AnimationPropertyOption(如：禁止设置属性值))
  static VoltronMap? _getAnimationPropertyOptionMap(VoltronMap animation,
      VoltronMap? animationStartStyleMap, VoltronMap? animationEndStyleMap) {
    final propertyKeyList = <String>[];
    final animationPlayState =
        animation.get<String>(NodeProps.animationPlayState) ??
            AnimationPlayState.running;
    final animationFillMode =
        animation.get<String>(NodeProps.animationFillModel) ??
            AnimationFillMode.none;
    final isAnimationPlayStatePaused =
        animationPlayState == AnimationPlayState.paused;
    if (isAnimationPlayStatePaused && animationStartStyleMap != null) {
      // 1.当前的animation-play-state: paused，且animation设定的开始style不为空，则开始的style需要根据规则操作
      propertyKeyList.addAll(animationStartStyleMap.keySet());
    } else if (animationFillMode == AnimationFillMode.forwards &&
        animationEndStyleMap != null) {
      // 2.当前的animation-fill-mode: forwards，且animation设定的结束style不为空，则结束的style需要根据规则操作
      propertyKeyList.addAll(animationEndStyleMap.keySet());
    }
    final map = VoltronMap();
    for (final key in propertyKeyList) {
      map.push(key, AnimationPropertyOption(isAnimationPlayStatePaused));
    }
    if (propertyKeyList.contains(NodeProps.width)) {
      // 1.如果宽度不变，布局的left也会被锁定，不然会影响布局
      map.push(
          NodeProps.left, AnimationPropertyOption(isAnimationPlayStatePaused));
    } else if (propertyKeyList.contains(NodeProps.height)) {
      // 2.如果高度不变，布局的top也会被锁定，不然会影响布局
      map.push(
          NodeProps.top, AnimationPropertyOption(isAnimationPlayStatePaused));
    }

    return map;
  }

  /// 更新animation动画播放结束后，当animationFillModel为'none'时，需要设置的属性集animationEndPropertyMap
  static void _handleUpdateAnimationEndPropertyMap(
      VoltronMap animation, VoltronMap style) {
    // 当animationFillModel不为forwards的时候，动画播完完，相关的属性，需要重置为原始的属性(由NodeProps.animationEndPropertyMap记录)
    final animationFillMode =
        animation.get<String>(NodeProps.animationFillModel) ??
            AnimationFillMode.none;
    if (animationFillMode == AnimationFillMode.forwards) {
      return;
    }

    final animationEndPropertyMap = VoltronMap();
    for (final property in NodeProps.animationSupportPropertyList) {
      final value = style.get(property);
      animationEndPropertyMap.push(property, value);
    }
    style.push(NodeProps.animationEndPropertyMap, animationEndPropertyMap);
  }

  /// 将animation的初始style，同步更新到property的style中
  static void _handleSyncAnimationStartStyleToStyle(VoltronMap animation,
      VoltronMap style, VoltronMap? animationStartStyleMap) {
    final keyList = animationStartStyleMap?.keySet() ?? [];
    for (final key in keyList) {
      final originValue = style.get(key);
      final newValue = animationStartStyleMap?.get(key);
      if (newValue != originValue) {
        style.push(key, newValue);
      }
    }
  }

  /// 根据animation规则，同步更新相关的animation和transition相关属性到style中，并将节点更新对比的diffStyle也同步更新到style中
  static void handleSyncAnimationStyle(
      VoltronMap? property, VoltronMap? diffProperty) {
    final style = property?.get<VoltronMap>(NodeProps.style);
    final diffStyle = diffProperty?.get<VoltronMap>(NodeProps.style);
    final animation = style?.get<VoltronMap>(NodeProps.animation);
    final animationPropertyMap =
        animation?.get<VoltronMap>(NodeProps.animationKeyFramePropertyMap);
    if (style == null || animation == null || animationPropertyMap == null) {
      return;
    }

    // 1.格式化animation的属性
    _handleFormatStyleAnimation(animationPropertyMap);
    // 2.同步更新style中的animationPropertyOptionMap属性
    final animationStartStyleMap =
        _getAnimationStartStyleMap(animation, animationPropertyMap);
    final animationEndStyleMap =
        _getAnimationEndStyleMap(animation, animationPropertyMap);
    style.push(
        NodeProps.animationPropertyOptionMap,
        _getAnimationPropertyOptionMap(
            animation, animationStartStyleMap, animationEndStyleMap));
    // 3.更新style中的animationEndPropertyMap，用于动画播放结束后的属性还原
    _handleUpdateAnimationEndPropertyMap(animation, style);
    // 4.将animation的初始style，重置组件的初始属性
    _handleSyncAnimationStartStyleToStyle(
        animation, style, animationStartStyleMap);
    // 5.animation的起始样式补缺
    _handleSupplyAnimationStartAndEndStyle(animationPropertyMap, style);
    // 6.当diffStyle不为空时，同步更新到style中，使updateNodeStyle能够生效
    if (diffStyle != null) {
      style.pushAll(diffStyle);
    }
  }

  /// 获取animation根据keyframeSelector(如：0%，10%，...，100%)数值排序的属性集
  static List<VoltronMap> getAnimationPropertyListSortByKeyframeSelector(
      VoltronMap animationPropertyMap) {
    final numberReg = RegExp('100|([0-9][0-9]?)');
    final list = <VoltronMap>[];
    for (final entry in animationPropertyMap.entrySet()) {
      final percent = numberReg.firstMatch(entry.key)?.group(0);
      final value = entry.value;
      if (percent == null) {
        continue;
      }
      if (value is VoltronMap) {
        final newValue = VoltronMap.copy(value);
        newValue.push<double>(
            NodeProps.animationKeyFrameSelectorPercent, double.parse(percent));
        list.add(newValue);
      }
    }
    list.sort((a, b) {
      final aPercent =
          a.get<double>(NodeProps.animationKeyFrameSelectorPercent) ?? 0.0;
      final bPercent =
          b.get<double>(NodeProps.animationKeyFrameSelectorPercent) ?? 0.0;
      return aPercent.compareTo(bPercent);
    });

    return list;
  }

  static Color? _getColor(dynamic value) {
    if (value is Color) {
      return value;
    } else if (!(value is num)) {
      return null;
    }

    return Color(value.toInt());
  }

  static Matrix4? _getTransform(dynamic value) {
    if (value is Matrix4) {
      return value;
    } else if (!(value is VoltronArray)) {
      return null;
    }

    return TransformUtil.getTransformMatrix4(value);
  }

  static TransformOrigin? _getTransformOrigin(dynamic value) {
    if (value is TransformOrigin) {
      return value;
    } else if (!(value is VoltronMap)) {
      return null;
    }

    return TransformOrigin(value);
  }

  /// 获取格式化后的动画属性值，将CSS的动画属性值，转换为Flutter的动画属性值
  static dynamic _getFormatAnimationPropertyValue(String key, dynamic value) {
    final strategyMap = {
      NodeProps.backgroundColor: _getColor,
      NodeProps.transform: _getTransform,
      NodeProps.transformOrigin: _getTransformOrigin,
    };

    return strategyMap[key]?.call(value) ?? value;
  }

  /// 根据相关参数，更新animation的AnimationTweenSequence
  static void handleUpdateAnimationTweenSequence(
      VoltronMap animationTweenSequenceMap,
      VoltronMap propertyMap,
      double startInterval,
      double endInterval,
      Curve curve,
      [bool needUpdateNextStartValue = true]) {
    for (final entry in propertyMap.entrySet()) {
      final key = entry.key;
      if (!NodeProps.animationSupportPropertyList.contains(key)) {
        continue;
      }

      // 1.获取对应key值的动画播放序列最后一帧，以及格式化后的动画属性值
      final animationTweenSequence =
          animationTweenSequenceMap.get<AnimationTweenSequence>(key) ??
              AnimationTweenSequence(
                  VoltronArray(), startInterval, endInterval, curve);
      final itemList = animationTweenSequence.itemList;
      final lastItem = itemList.getLastItemByOrder<AnimationTween>();
      final value = _getFormatAnimationPropertyValue(key, entry.value);
      // 2.动画序列假如最后一帧为空帧 或 满帧，插入新的一帧
      if (lastItem == null ||
          (lastItem.startValue != null && lastItem.endValue != null)) {
        itemList.push(AnimationTween(value, null));
      }
      // 3.动画序列，当前帧插入endValue和weight值
      else {
        final lastTwoTotalWeight =
            itemList.getLastItemByOrder<AnimationTween>(2)?.totalWeight ?? 0;
        final lastOneTotalWeight = propertyMap
                .get<double>(NodeProps.animationKeyFrameSelectorPercent) ??
            100.0;
        lastItem.weight = lastOneTotalWeight - lastTwoTotalWeight;
        lastItem.totalWeight = lastOneTotalWeight;
        lastItem.endValue = value;
        // 假如是更新到当前项的endValue，需要同步更新下一项的startValue，保证动画的连贯性
        if (needUpdateNextStartValue) {
          itemList.push(AnimationTween(value, null));
        }
      }
      animationTweenSequenceMap.pushIfNotExist(key, animationTweenSequence);
    }
  }

  /// 剔除animationTweenSequenceMap中的无效动画
  static void handleRemoveInvalidAnimationTweenSequence(
      VoltronMap animationTweenSequenceMap) {
    final invalidKeyList = <String>[];
    for (final entry in animationTweenSequenceMap.data.entries) {
      final key = entry.key;
      final value = entry.value;
      if (!(value is AnimationTweenSequence) || value.itemList.size() != 1) {
        continue;
      }
      // 当AnimationTweenSequence中的itemList长度为1，且初始值相等，则视为无效动画剔除之
      final lastItem = value.itemList.getLastItemByOrder<AnimationTween>();
      if (lastItem?.startValue == lastItem?.endValue) {
        invalidKeyList.add(key);
      }
    }
    animationTweenSequenceMap.removeAll(invalidKeyList);
  }

  /// 更新对应属性的AnimationPropertyOption中的isRenderNodeInitValue选项
  static void handleUpdateAllDomNodePropertyIsDisableSetting(
      VoltronMap? animationPropertyOptionMap,
      [bool flag = true]) {
    if (animationPropertyOptionMap == null) {
      return;
    }

    for (final item in animationPropertyOptionMap.valueSet()) {
      if (item is AnimationPropertyOption) {
        item.isDomNodeDisableSetting = flag;
      }
    }
  }

  /// 根据animation规则，获取可以更新的domNode的style
  static VoltronMap getDomNodeStyleByAnimationRule(VoltronMap property,
      RenderNode? renderNode, VoltronMap? forceUpdateProps) {
    final style = property.get<VoltronMap>(NodeProps.style);
    if (style == null && forceUpdateProps != null) {
      property.push(NodeProps.style, forceUpdateProps);
    } else if (style != null) {
      style.pushAll(forceUpdateProps);
    }
    // 1.动画播放完 或 没有相关的动画设置属性，返回property
    final isAnimationDisable =
        renderNode?.renderViewModel.animation?.isDisable ?? false;
    final animationPropertyOptionMap =
        renderNode?.renderViewModel.animationPropertyOptionMap;
    if (style == null ||
        isAnimationDisable ||
        animationPropertyOptionMap == null) {
      return property;
    }
    // 2.遍历剔除被禁止设置属性值的Dom节点样式
    final keySet = style.keySet();
    for (final key in keySet) {
      final flag = animationPropertyOptionMap
              .get<AnimationPropertyOption>(key)
              ?.isDomNodeDisableSetting ??
          false;
      if (flag) {
        style.remove(key);
      }
    }
    return property;
  }

  /// 根据animation规则，获取可以更新的renderNode的style
  static VoltronMap getRenderNodeStyleByAnimationRule(VoltronMap property) {
    final style = property.get<VoltronMap>(NodeProps.style);
    if (style == null) {
      return property;
    }

    // 当animation没有更新，animationEndPropertyMap也无需要更新
    if (style.get(NodeProps.animation) == null &&
        style.get(NodeProps.animationEndPropertyMap) != null) {
      style.remove(NodeProps.animationEndPropertyMap);
    }
    return property;
  }

  /// 根据animation的style，更新相关domNode的style
  static void updateDomNodeStyleByAnimationStyle(
      RenderViewModel viewModel, VoltronMap animationStyle) {
    final nodeId = viewModel.id;
    final rootId = viewModel.rootId;
    final context = viewModel.context;
    final rootWidgetViewModel = context.getInstance(rootId);
    final node = context.domManager.getNode(nodeId);
    if (node != null && rootWidgetViewModel != null) {
      final totalProps = VoltronMap.copy(node.totalProps);
      context.domManager
          .updateNode(nodeId, totalProps, rootWidgetViewModel, animationStyle);
      context.domManager.batch();
    }
  }

  /// 获取CssAnimation，如果animation的isDisable为true，则返回null，否则返回对应的animation
  static CssAnimation? getCssAnimation(CssAnimation? animation) {
    final isDisable = animation?.isDisable == true;
    if (isDisable) {
      return null;
    }

    return animation;
  }

  /// -------------
  /// Transition相关
  /// -------------
  /// 根据前端传入的transitionList，进行transition属性的解析合并，并返回对应的transitionMap
  static VoltronMap? getTransitionMap(VoltronArray? transitionList) {
    final list = transitionList?.data ?? [];
    if (list.isEmpty) {
      return null;
    }

    // 前设置的transition属性，会被后设置的transition属性给覆盖
    final transitionMap = VoltronMap();
    for (final item in list) {
      if (item is VoltronMap) {
        final property = item.get<String>(NodeProps.transitionProperty);
        if (property == '' || property == null) {
          return null;
        }

        // all特殊属性处理
        if (property == NodeProps.transitionPropertyAll) {
          for (final childProperty in NodeProps.animationSupportPropertyList) {
            _updateTransition(transitionMap, childProperty, item);
          }
        } else {
          _updateTransition(transitionMap, property, item);
        }
      }
    }
    return transitionMap;
  }

  /// 更新transition中对应的属性值
  static void _updateTransition(
      VoltronMap transitionMap, String transitionProperty, VoltronMap params) {
    final transition = transitionMap.get<Transition>(transitionProperty);
    if (transition != null) {
      // 1.transition动画属性已经存在时，则更新属性
      transition.update(params);
    } else {
      // 2.transition动画属性不存在时，则新建动画属性
      transitionMap.push<Transition>(
          transitionProperty, Transition(transitionProperty, params));
    }
  }

  /// 获取运行完所有transition动画所需要的时间(包含动画延迟播放的时间)
  static int getTransitionTotalDuration(VoltronMap transitionMap) {
    var totalDuration = 0;
    for (final key in transitionMap.keySet()) {
      var transition = transitionMap.get<Transition>(key);
      var duration = transition?.transitionDuration ?? 0;
      var delay = transition?.transitionDelay ?? 0;
      var newTotalDuration = duration + delay;
      if (totalDuration < newTotalDuration) {
        totalDuration = newTotalDuration;
      }
    }

    return totalDuration;
  }

  /// ------------------------
  /// Animation和Transition相关
  /// ------------------------
  static TweenSequenceItem? _getTweenSequenceItem(String key,
      AnimationTween animationTween, AnimationTween? lastAnimationTween) {
    // 如果当前项的起始值为空，就采用上一项的终值
    final weight = animationTween.weight;
    final startValue =
        animationTween.startValue ?? lastAnimationTween?.endValue;
    final endValue = animationTween.endValue ?? lastAnimationTween?.endValue;
    final hasAnimationValue = startValue != null && endValue != null;
    if (weight == null || !hasAnimationValue) {
      return null;
    }

    final tweenStrategyMap = <String, Tween Function()>{
      NodeProps.backgroundColor: () =>
          ColorTween(begin: startValue, end: endValue),
      NodeProps.transform: () => Matrix4Tween(begin: startValue, end: endValue),
      NodeProps.transformOrigin: () =>
          TransformOriginTween(begin: startValue, end: endValue),
    };
    final tween = tweenStrategyMap[key]?.call() ??
        Tween(begin: startValue, end: endValue);
    return TweenSequenceItem(tween: tween, weight: weight);
  }

  static List<TweenSequenceItem> getTweenSequenceItemList(
      String key, AnimationTweenSequence? tweenSequence) {
    final originItemList = tweenSequence?.itemList.toList();
    if (originItemList == null) {
      return [];
    }

    AnimationTween? lastOriginItem;
    final itemList = <TweenSequenceItem>[];
    for (final originItem in originItemList) {
      final newItem = _getTweenSequenceItem(key, originItem, lastOriginItem);
      if (newItem != null) {
        itemList.add(newItem);
      }
      lastOriginItem = originItem;
    }
    return itemList;
  }
}

/// 动画属性根据animation规则的相关选项
class AnimationPropertyOption {
  /// DomNode是否禁止设置属性值（作用于DomTree，影响当前元素的位置布局）
  bool isDomNodeDisableSetting = false;

  /// 是否已经初始化RenderNode的属性值(根据第一个非0的帧属性值，进行等比缩放或加减处理)
  bool hasInitRenderNodeValue = false;

  AnimationPropertyOption([this.isDomNodeDisableSetting = false]);

  @override
  bool operator ==(Object other) {
    return other is AnimationPropertyOption &&
        isDomNodeDisableSetting == other.isDomNodeDisableSetting &&
        hasInitRenderNodeValue == other.hasInitRenderNodeValue;
  }

  @override
  int get hashCode =>
      isDomNodeDisableSetting.hashCode | hasInitRenderNodeValue.hashCode;
}

/// TransformOriginTween
class TransformOriginTween extends Tween<TransformOrigin?> {
  /// Creates a transform origin tween.
  ///
  /// The [begin] and [end] properties may be null; the null value
  /// is treated as meaning the center.
  TransformOriginTween({
    TransformOrigin? begin,
    TransformOrigin? end,
  }) : super(begin: begin, end: end);

  /// Returns the value this variable has at the given animation clock value.
  @override
  TransformOrigin? lerp(double t) {
    final offset = Offset.lerp(begin?.offset, end?.offset, t);
    final alignment = Alignment.lerp(begin?.alignment, end?.alignment, t);
    final origin = TransformOrigin(null);
    if (offset != null) {
      origin.offset = offset;
    }
    if (alignment != null) {
      origin.alignment = alignment;
    }
    return origin;
  }
}
