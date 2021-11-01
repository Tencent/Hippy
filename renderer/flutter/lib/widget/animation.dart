import 'package:flutter/material.dart';

import '../common/voltron_link.dart';
import '../common/voltron_map.dart';
import '../dom/prop.dart';
import '../render/view_model.dart';
import '../util/animation_util.dart';
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
  VoltronLinkNode<VoltronMap>? _domTreeCssAnimationLinkNode;

  @override
  void initState() {
    super.initState();
    _domTreeCssAnimationLinkNode =
        widget.viewModel.domTreeCssAnimation?.headNode;
    // animation只有在初始化组件时起效
    _handleUpdateAnimationController();
    _handleUpdateTransitionController();
  }

  @override
  void didUpdateWidget(covariant AnimationChild oldWidget) {
    super.didUpdateWidget(oldWidget);
    _handleUpdateTransitionController();
  }

  @override
  void dispose() {
    _animationController
      ?..removeListener(_handleAnimationDomNodeStyleUpdate)
      ..removeListener(_handleAnimationControllerUpdate)
      ..removeStatusListener(_handleAnimationControllerStatusChange)
      ..dispose();
    _transitionController
      ?..removeListener(_handleAnimationControllerUpdate)
      ..removeStatusListener(_handleTransitionControllerStatusChange)
      ..dispose();
    super.dispose();
  }

  void _handleUpdateAnimationController() {
    final animation = widget.animation;
    if (animation == null) {
      return;
    }

    final controller = AnimationController(
      duration: animation.totalDuration,
      vsync: this,
    )
      ..addListener(_handleAnimationDomNodeStyleUpdate)
      ..addListener(_handleAnimationControllerUpdate)
      ..addStatusListener(_handleAnimationControllerStatusChange);
    controller.forward();
    _animationController = controller;
  }

  void _handleUpdateTransitionController() {
    final transition = widget.transition;
    if (transition == null) {
      return;
    }

    final controller = _transitionController;
    if (controller != null && controller.status == AnimationStatus.forward) {
      controller
        ..stop()
        ..removeListener(_handleAnimationControllerUpdate)
        ..removeStatusListener(_handleTransitionControllerStatusChange);
    }
    final newController = AnimationController(
      duration: transition.totalDuration,
      vsync: this,
    )
      ..addListener(_handleAnimationControllerUpdate)
      ..addStatusListener(_handleTransitionControllerStatusChange);
    newController.forward();
    _transitionController = newController;
  }

  void _handleAnimationDomNodeStyleUpdate() {
    final valueOffset = 0.1;
    final controller = _animationController;
    final controllerValue = controller?.value;
    final linkNodeValue = _domTreeCssAnimationLinkNode?.value;
    final linkNodeNextValue = _domTreeCssAnimationLinkNode?.next?.value;
    final percent =
        linkNodeValue?.get<double>(NodeProps.animationKeyFrameSelectorPercent);
    if (controllerValue == null ||
        percent == null ||
        linkNodeNextValue == null) {
      return;
    }
    final lower = percent / 100.0 - valueOffset;
    if (controllerValue < lower) {
      return;
    }

    AnimationUtil.updateDomNodeStyleByAnimationStyle(
        widget.viewModel, linkNodeNextValue);
    _domTreeCssAnimationLinkNode = _domTreeCssAnimationLinkNode?.next;
  }

  void _handleAnimationControllerUpdate() {
    // TODO: 性能优化，两个controller同时播放，看是否能够合并时间，每次只setState一个动画的controller
    setState(() {});
  }

  void _handleTransitionControllerStatusChange(AnimationStatus status) {
    // 当transition动画播放完毕，且不需要重复播放时，更新动画属性状态，避免动画被二次播放
    final transition = widget.transition;
    final needUpdateAnimation = status == AnimationStatus.completed;
    if (transition != null && needUpdateAnimation) {
      transition.updateAllTransitionAnimationValue();
    }
  }

  void _handleAnimationControllerStatusChange(AnimationStatus status) {
    final controller = _animationController;
    final animation = widget.animation;
    if (status != AnimationStatus.completed ||
        controller == null ||
        animation == null) {
      return;
    }

    controller.removeListener(_handleAnimationDomNodeStyleUpdate);
    if (animation.canRepeat || animation.playCount > 1) {
      controller.reset();
      controller.forward();
      animation.playCount -= 1;
      return;
    }

    final viewModel = widget.viewModel;
    final animationFillMode = viewModel.animationFillMode;
    if (animationFillMode == AnimationFillMode.forwards) {
      // 1.forwards行为，设置isDisableDom都为true
      AnimationUtil.handleUpdateAllDomNodePropertyIsDisableSetting(
          viewModel.animationPropertyOptionMap);
    } else {
      // 2.非forwards行为，清空相关的动画属性，并同步更新animationEndPropertyMap的属性到对应的domNode样式中
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
  VoltronMap _getAnimationProperty(
      CssAnimation? animation,
      CssAnimation? transition,
      AnimationController? animationController,
      AnimationController? transitionController) {
    final animationProperty = VoltronMap();
    final propertyList = NodeProps.animationSupportPropertyList;
    for (final property in propertyList) {
      /// animation的动画属性优先于transition的动画属性
      var propertyValue =
          _getAnimation(property, animationController, animation)?.value;
      if (propertyValue == null) {
        propertyValue =
            _getAnimation(property, transitionController, transition)?.value;
      }
      animationProperty.push(property, propertyValue);
    }

    return animationProperty;
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = widget.viewModel;
    final animation = widget.animation;
    final transition = widget.transition;
    // TODO: 减少animation的重复获取计算
    // TODO: margin(final margin = EdgeInsets.only(top: layoutY, left: layoutX);)
    final animationProperty = _getAnimationProperty(
        animation, transition, _animationController, _transitionController);

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
        animationProperty?.get<EdgeInsets>(NodeProps.margin);

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
    final animationTop = animationProperty?.get<double>(NodeProps.top);
    final animationLeft = animationProperty?.get<double>(NodeProps.left);

    return Positioned(
      top: animationTop ?? viewModel.layoutY,
      left: animationLeft ?? viewModel.layoutX,
      child: BoxWidget(viewModel,
          child: child, animationProperty: animationProperty),
    );
  }
}
