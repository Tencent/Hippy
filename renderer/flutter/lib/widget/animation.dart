import 'package:flutter/material.dart';

import '../common.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'div.dart';

/// 动画组件
class AnimationWidget extends StatelessWidget {
  final Widget child;
  final RenderViewModel viewModel;
  final bool isStackLayout;
  AnimationWidget(this.child, this.viewModel, [this.isStackLayout = false]);

  @override
  Widget build(BuildContext context) {
    final animation = AnimationUtil.getCssAnimation(viewModel.animation);
    final transition = AnimationUtil.getCssAnimation(viewModel.transition);
    if (transition != null || animation != null) {
      return AnimationChild(
          child, animation, transition, viewModel, isStackLayout);
    }

    if (isStackLayout) {
      return StackChild(viewModel: viewModel, child: child);
    } else {
      return CommonChild(viewModel: viewModel, child: child);
    }
  }
}

/// 动画子组件(包含动画属性的计算和controller的操作)
class AnimationChild extends StatefulWidget {
  final Widget child;
  final CssAnimation? animation;
  final CssAnimation? transition;
  final RenderViewModel viewModel;
  final bool isStackLayout;

  AnimationChild(this.child, this.animation, this.transition, this.viewModel,
      [this.isStackLayout = false]);
  @override
  _AnimationChildState createState() => _AnimationChildState();
}

class _AnimationChildState extends State<AnimationChild>
    with TickerProviderStateMixin {
  AnimationController? _animationController;
  AnimationController? _transitionController;

  /// key: animationPropertyName, value: Animation<dynamic>
  VoltronMap? _animationMap;

  @override
  void initState() {
    super.initState();
    // animation只有在初始化组件时起效
    _updateAnimationController();
    _updateTransitionController();
    _updateAnimationMap();
  }

  @override
  void didUpdateWidget(covariant AnimationChild oldWidget) {
    super.didUpdateWidget(oldWidget);
    _updateTransitionController();
    _updateAnimationMap();
  }

  @override
  void dispose() {
    _animationController
      ?..removeListener(_onAnimationControllerUpdate)
      ..removeStatusListener(_onAnimationControllerStatusChange)
      ..dispose();
    _transitionController
      ?..removeListener(_onAnimationControllerUpdate)
      ..removeStatusListener(_onTransitionControllerStatusChange)
      ..dispose();
    super.dispose();
  }

  void _updateAnimationController() {
    final animation = widget.animation;
    if (animation == null) {
      return;
    }

    final controller = AnimationController(
      duration: animation.totalDuration,
      vsync: this,
    )
      ..addListener(_onAnimationControllerUpdate)
      ..addStatusListener(_onAnimationControllerStatusChange);
    if (animation.canRepeat) {
      controller.repeat();
    } else {
      controller.forward();
    }
    _animationController = controller;
  }

  void _updateTransitionController() {
    final transition = widget.transition;
    if (transition == null) {
      return;
    }

    final controller = _transitionController;
    if (controller != null && controller.status == AnimationStatus.forward) {
      controller
        ..stop()
        ..removeListener(_onAnimationControllerUpdate)
        ..removeStatusListener(_onTransitionControllerStatusChange);
    }
    final newController = AnimationController(
      duration: transition.totalDuration,
      vsync: this,
    )
      ..addListener(_onAnimationControllerUpdate)
      ..addStatusListener(_onTransitionControllerStatusChange);
    newController.forward();
    _transitionController = newController;
  }

  void _updateAnimationMap() {
    final animationMap = VoltronMap();
    final propertyList = NodeProps.animationSupportPropertyList;
    for (final property in propertyList) {
      /// animation的动画属性优先于transition的动画属性
      var animation =
          _getAnimation(property, _animationController, widget.animation);
      if (animation == null) {
        animation =
            _getAnimation(property, _transitionController, widget.transition);
      }
      if (animation != null) {
        animationMap.push(property, animation);
      }
    }

    _animationMap = animationMap;
  }

  void _onAnimationControllerUpdate() {
    setState(() {});
  }

  void _onTransitionControllerStatusChange(AnimationStatus status) {
    // 当transition动画播放完毕，且不需要重复播放时，更新动画属性状态，避免动画被二次播放
    final transition = widget.transition;
    final needUpdateAnimation = status == AnimationStatus.completed;
    if (transition != null && needUpdateAnimation) {
      transition.updateAllTransitionAnimationValue();
    }
  }

  void _onAnimationControllerStatusChange(AnimationStatus status) {
    final controller = _animationController;
    final animation = widget.animation;
    if (status != AnimationStatus.completed ||
        controller == null ||
        animation == null) {
      return;
    }
    // 1 动画尚未播放完成的处理
    if (animation.playCount > 1) {
      controller
        ..stop()
        ..reset()
        ..forward();
      animation.playCount -= 1;
      return;
    }
    // 2 动画播放完成的处理
    final viewModel = widget.viewModel;
    final animationFillMode = viewModel.animationFillMode;
    if (animationFillMode == AnimationFillMode.kForwards) {
      // 2.1 forwards行为，设置isDisableDom都为true
      AnimationUtil.handleUpdateAllDomNodePropertyIsDisableSetting(
          viewModel.animationPropertyOptionMap);
    } else {
      // 2.2 非forwards行为，清空相关的动画属性，并同步更新animationEndPropertyMap的属性到对应的domNode样式中
      viewModel.clearAnimation();
      final style = VoltronMap.copy(viewModel.animationEndPropertyMap);
      if (!style.isEmpty) {
        AnimationUtil.updateDomNodeStyleByAnimationStyle(
            widget.viewModel, style);
      }
    }
  }

  Animation? _getAnimation(
      String key, AnimationController? controller, CssAnimation? cssAnimation) {
    final tweenSequence = cssAnimation?.animationTweenSequenceMap
        .get<AnimationTweenSequence>(key);
    final sequenceItemList =
        AnimationUtil.getTweenSequenceItemList(key, tweenSequence);
    if (tweenSequence == null ||
        sequenceItemList.isEmpty ||
        controller == null) {
      return null;
    }

    final curvedAnimation = CurvedAnimation(
        parent: controller,
        curve: Interval(tweenSequence.startInterval, tweenSequence.endInterval,
            curve: tweenSequence.curve));
    final animation = TweenSequence(sequenceItemList).animate(curvedAnimation);
    return animation;
  }

  /// 获取当前Voltron支持的动画属性Map
  VoltronMap? _getAnimationProperty(VoltronMap? animationMap) {
    final animationProperty = VoltronMap();
    if (animationMap == null) {
      return null;
    }

    for (final property in animationMap.keySet()) {
      final propertyValue =
          animationMap.get<Animation<dynamic>>(property)?.value;
      animationProperty.push(property, propertyValue);
    }
    return animationProperty;
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = widget.viewModel;
    // TODO: 减少animation的重复获取计算
    // TODO: margin(final margin = EdgeInsets.only(top: layoutY, left: layoutX);)
    final animationProperty = _getAnimationProperty(_animationMap);
    return widget.isStackLayout
        ? StackChild(
            animationProperty: animationProperty,
            viewModel: viewModel,
            child: widget.child)
        : CommonChild(
            animationProperty: animationProperty,
            viewModel: viewModel,
            child: widget.child);
  }
}

/// 普通布局子组件
class CommonChild extends StatelessWidget {
  final VoltronMap? animationProperty;
  final RenderViewModel viewModel;
  final Widget child;
  CommonChild(
      {this.animationProperty, required this.viewModel, required this.child});

  @override
  Widget build(BuildContext context) {
    final viewModelMargin = EdgeInsets.only(
        top: viewModel.layoutY ?? 0.0, left: viewModel.layoutX ?? 0.0);
    final animationMargin =
        animationProperty?.get<EdgeInsets>(NodeProps.kMargin);

    return Container(
      alignment: Alignment.topLeft,
      margin: animationMargin ?? viewModelMargin,
      child: BoxWidget(viewModel,
          child: child, animationProperty: animationProperty),
    );
  }
}

/// 层叠式布局子组件
class StackChild extends StatelessWidget {
  final VoltronMap? animationProperty;
  final RenderViewModel viewModel;
  final Widget child;
  StackChild(
      {this.animationProperty, required this.viewModel, required this.child});

  @override
  Widget build(BuildContext context) {
    final animationTop = animationProperty?.get<double>(NodeProps.kTop);
    final animationLeft = animationProperty?.get<double>(NodeProps.kLeft);

    return Positioned(
      top: animationTop ?? viewModel.layoutY,
      left: animationLeft ?? viewModel.layoutX,
      child: BoxWidget(viewModel,
          child: child, animationProperty: animationProperty),
    );
  }
}
