import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../engine.dart';
import '../module.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'manager.dart';
import 'props.dart';

abstract class BaseViewController<T extends RenderViewModel>
    extends VoltronViewController<T, RenderNode> {
  @override
  RenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return RenderNode(id, name, tree, controllerManager, props);
  }
}

abstract class VoltronViewController<T extends RenderViewModel,
    R extends RenderNode> implements ControllerMethodPropConsumer<T> {
  String get name;

  ControllerMethodPropProvider generateProvider() {
    final provider = ControllerMethodPropProvider();
    provider.pushAll(_baseRegisteredMethodProp);
    provider.pushAll(extendRegisteredMethodProp);
    return provider;
  }

  Map<String, ControllerMethodProp> get _baseRegisteredMethodProp => {
        NodeProps.kTransform: ControllerMethodProp(setTransform, null),
        NodeProps.kTransformOrigin:
            ControllerMethodProp(setTransformOrigin, null),
        NodeProps.kPropAccessibilityLabel:
            ControllerMethodProp(setAccessibilityLabel, ""),
        NodeProps.kBackgroundColor:
            ControllerMethodProp(setBackgroundColor, Colors.transparent.value),
        NodeProps.kOpacity: ControllerMethodProp(setOpacity, 1.0),
        NodeProps.kBorderRadius: ControllerMethodProp(setBorderRadius, 0.0),
        NodeProps.kBorderTopLeftRadius:
            ControllerMethodProp(setTopLeftBorderRadius, 0.0),
        NodeProps.kBorderTopRightRadius:
            ControllerMethodProp(setTopRightBorderRadius, 0.0),
        NodeProps.kBorderBottomRightRadius:
            ControllerMethodProp(setBottomRightBorderRadius, 0.0),
        NodeProps.kBorderBottomLeftRadius:
            ControllerMethodProp(setBottomLeftBorderRadius, 0.0),
        NodeProps.kBorderWidth: ControllerMethodProp(setBorderWidth, 0.0),
        NodeProps.kNextFocusDownId:
            ControllerMethodProp(setNextFocusDownId, 0.0),
        NodeProps.kNextFocusUpId: ControllerMethodProp(setNextFocusUpId, 0.0),
        NodeProps.kNextFocusLeftId:
            ControllerMethodProp(setNextFocusLeftId, 0.0),
        NodeProps.kNextFocusRightId:
            ControllerMethodProp(setNextFocusRightId, 0.0),
        NodeProps.kBorderLeftWidth:
            ControllerMethodProp(setLeftBorderWidth, 0.0),
        NodeProps.kBorderTopWidth: ControllerMethodProp(setTopBorderWidth, 0.0),
        NodeProps.kBorderRightWidth:
            ControllerMethodProp(setRightBorderWidth, 0.0),
        NodeProps.kBorderBottomWidth:
            ControllerMethodProp(setBottomBorderWidth, 0.0),
        NodeProps.kBorderColor:
            ControllerMethodProp(setBorderColor, Colors.transparent.value),
        NodeProps.kBorderLeftColor:
            ControllerMethodProp(setBorderLeftColor, Colors.transparent.value),
        NodeProps.kBorderTopColor:
            ControllerMethodProp(setBorderTopColor, Colors.transparent.value),
        NodeProps.kBorderRightColor:
            ControllerMethodProp(setBorderRightColor, Colors.transparent.value),
        NodeProps.kBorderBottomColor: ControllerMethodProp(
            setBorderBottomColor, Colors.transparent.value),
        NodeProps.kBoxShadow: ControllerMethodProp(setBoxShadow, null),
        NodeProps.kTransition: ControllerMethodProp(setTransition, null),
        NodeProps.kAnimation: ControllerMethodProp(setAnimation, null),
        NodeProps.kAnimationEndPropertyMap:
            ControllerMethodProp(setAnimationEndPropertyMap, null),
        NodeProps.kAnimationPropertyOptionMap:
            ControllerMethodProp(setAnimationPropertyOptionMap, null),
        NodeProps.kFocusable: ControllerMethodProp(setFocusable, false),
        NodeProps.kRequestFocus: ControllerMethodProp(requestFocus, false),
        NodeProps.kOnClick: ControllerMethodProp(setClickable, false),
        NodeProps.kOnLongClick: ControllerMethodProp(setLongClickable, false),
        NodeProps.kOnPressIn: ControllerMethodProp(setCanPressIn, false),
        NodeProps.kOnPressOut: ControllerMethodProp(setCanPressOut, false),
        NodeProps.kOnTouchDown: ControllerMethodProp(setTouchDownHandle, false),
        NodeProps.kOnTouchMove: ControllerMethodProp(setTouchMoveHandle, false),
        NodeProps.kOnTouchEnd: ControllerMethodProp(setTouchEndHandle, false),
        NodeProps.kOnTouchCancel:
            ControllerMethodProp(setTouchCancelHandle, false),
        NodeProps.kOnAttachedToWindow:
            ControllerMethodProp(setAttachedToWindowHandle, false),
        NodeProps.kOnDetachedFromWindow:
            ControllerMethodProp(setDetachedFromWindowHandle, false),
        NodeProps.kZIndex: ControllerMethodProp(setZIndex, 0)
      };

  Map<String, ControllerMethodProp> get extendRegisteredMethodProp;

  @ControllerProps(NodeProps.kTransform)
  void setTransform(T viewModel, VoltronArray? transformArray) {
    final transform = TransformUtil.getTransformMatrix4(transformArray);
    viewModel.transform = transform;
    viewModel.updateAnimation<Matrix4?>(NodeProps.kTransform, transform);
  }

  @ControllerProps(NodeProps.kTransformOrigin)
  void setTransformOrigin(T viewModel, VoltronMap? transformOriginMap) {
    final transformOrigin = TransformOrigin(transformOriginMap);
    viewModel.transformOrigin = transformOrigin;
    viewModel.updateAnimation<TransformOrigin>(
        NodeProps.kTransformOrigin, transformOrigin);
  }

  /// zIndex
  @ControllerProps(NodeProps.kZIndex)
  void setZIndex(T viewModel, int zIndex) {
    viewModel.zIndex = zIndex;
  }

  @ControllerProps(NodeProps.kPropAccessibilityLabel)
  void setAccessibilityLabel(T viewModel, String? accessibilityLabel) {
    viewModel.accessibilityLabel =
        accessibilityLabel == null ? "" : accessibilityLabel;
  }

  @ControllerProps(NodeProps.kBackgroundColor)
  void setBackgroundColor(T viewModel, int? backgroundColor) {
    final color = backgroundColor == null ? null : Color(backgroundColor);
    viewModel.backgroundColor = color;
    viewModel.updateAnimation<Color?>(NodeProps.kBackgroundColor, color);
  }

  @ControllerProps(NodeProps.kOpacity)
  void setOpacity(T viewModel, double opacity) {
    viewModel.opacity = opacity;
    viewModel.updateAnimation<double>(NodeProps.kOpacity, opacity);
  }

  @ControllerProps(NodeProps.kBorderRadius)
  void setBorderRadius(T viewModel, double borderRadius) {
    viewModel.borderRadius = borderRadius;
  }

  @ControllerProps(NodeProps.kBorderTopLeftRadius)
  void setTopLeftBorderRadius(T viewModel, double topLeftBorderRadius) {
    viewModel.topLeftBorderRadius = topLeftBorderRadius;
  }

  @ControllerProps(NodeProps.kBorderTopRightRadius)
  void setTopRightBorderRadius(T viewModel, double topRightBorderRadius) {
    viewModel.topRightBorderRadius = topRightBorderRadius;
  }

  @ControllerProps(NodeProps.kBorderBottomRightRadius)
  void setBottomRightBorderRadius(T viewModel, double bottomRightBorderRadius) {
    viewModel.bottomRightBorderRadius = bottomRightBorderRadius;
  }

  @ControllerProps(NodeProps.kBorderBottomLeftRadius)
  void setBottomLeftBorderRadius(T viewModel, double bottomLeftBorderRadius) {
    viewModel.bottomLeftBorderRadius = bottomLeftBorderRadius;
  }

  @ControllerProps(NodeProps.kBorderWidth)
  void setBorderWidth(T viewModel, double borderWidth) {
    viewModel.borderWidth = borderWidth;
  }

  @ControllerProps(NodeProps.kNextFocusDownId)
  void setNextFocusDownId(T viewModel, int id) {
    viewModel.nexFocusDownId = id;
  }

  @ControllerProps(NodeProps.kNextFocusUpId)
  void setNextFocusUpId(T viewModel, int id) {
    viewModel.nextFocusUpId = id;
  }

  @ControllerProps(NodeProps.kNextFocusLeftId)
  void setNextFocusLeftId(T viewModel, int id) {
    viewModel.nextFocusLeftId = id;
  }

  @ControllerProps(NodeProps.kNextFocusRightId)
  void setNextFocusRightId(T viewModel, int id) {
    viewModel.nextFocusRightId = id;
  }

  @ControllerProps(NodeProps.kBorderLeftWidth)
  void setLeftBorderWidth(T viewModel, double width) {
    viewModel.borderLeftWidth = width;
  }

  @ControllerProps(NodeProps.kBorderTopWidth)
  void setTopBorderWidth(T viewModel, double width) {
    viewModel.borderTopWidth = width;
  }

  @ControllerProps(NodeProps.kBorderRightWidth)
  void setRightBorderWidth(T viewModel, double width) {
    viewModel.borderRightWidth = width;
  }

  @ControllerProps(NodeProps.kBorderBottomWidth)
  void setBottomBorderWidth(T viewModel, double width) {
    viewModel.borderBottomWidth = width;
  }

  @ControllerProps(NodeProps.kBorderColor)
  void setBorderColor(T viewModel, int color) {
    viewModel.borderColor = color;
  }

  @ControllerProps(NodeProps.kBorderLeftColor)
  void setBorderLeftColor(T viewModel, int color) {
    viewModel.borderLeftColor = color;
  }

  @ControllerProps(NodeProps.kBorderTopColor)
  void setBorderTopColor(T viewModel, int color) {
    viewModel.borderTopColor = color;
  }

  @ControllerProps(NodeProps.kBorderRightColor)
  void setBorderRightColor(T viewModel, int color) {
    viewModel.borderRightColor = color;
  }

  @ControllerProps(NodeProps.kBorderBottomColor)
  void setBorderBottomColor(T viewModel, int color) {
    viewModel.borderBottomColor = color;
  }

  @ControllerProps(NodeProps.kBoxShadow)
  void setBoxShadow(T viewModel, VoltronArray? data) {
    viewModel.boxShadow = data;
  }

  @ControllerProps(NodeProps.kTransition)
  void setTransition(T viewModel, VoltronArray? value) {
    final transitionMap = AnimationUtil.getTransitionMap(value);
    if (transitionMap == null) {
      return;
    }

    viewModel.transition =
        CssAnimation.initByTransition(transitionMap, viewModel);
  }

  @ControllerProps(NodeProps.kAnimation)
  void setAnimation(T viewModel, VoltronMap? value) {
    final animationPropertyMap =
        value?.get<VoltronMap>(NodeProps.kAnimationKeyFramePropertyMap);
    if (value == null || animationPropertyMap == null) {
      return;
    }

    final propertyMapSortList =
        AnimationUtil.getAnimationPropertyListSortByKeyframeSelector(
            animationPropertyMap);
    viewModel.animation =
        CssAnimation.initByAnimation(value, propertyMapSortList, viewModel);
    viewModel.animationFillMode =
        value.get<String>(NodeProps.kAnimationFillModel) ??
            AnimationFillMode.kNone;
  }

  @ControllerProps(NodeProps.kAnimationEndPropertyMap)
  void setAnimationEndPropertyMap(T viewModel, VoltronMap? value) {
    viewModel.animationEndPropertyMap = VoltronMap.copy(value);
  }

  @ControllerProps(NodeProps.kAnimationPropertyOptionMap)
  void setAnimationPropertyOptionMap(T viewModel, VoltronMap? value) {
    viewModel.animationPropertyOptionMap = VoltronMap.copy(value);
  }

  @ControllerProps(NodeProps.kFocusable)
  void setFocusable(T viewModel, bool focusable) {
    viewModel.setFocusable(focusable);
  }

  @ControllerProps(NodeProps.kRequestFocus)
  void requestFocus(T viewModel, bool request) {
    viewModel.requestFocus(request);
  }

  @ControllerProps(NodeProps.kOnClick)
  void setClickable(T viewModel, bool flag) {
    viewModel.setClickable(flag);
  }

  @ControllerProps(NodeProps.kOnLongClick)
  void setLongClickable(T viewModel, bool flag) {
    viewModel.setLongClickable(flag);
  }

  @ControllerProps(NodeProps.kOnPressIn)
  void setCanPressIn(T viewModel, bool flag) {
    viewModel.setCanPressIn(flag);
  }

  @ControllerProps(NodeProps.kOnPressOut)
  void setCanPressOut(T viewModel, bool flag) {
    viewModel.setCanPressOut(flag);
  }

  @ControllerProps(NodeProps.kOnTouchDown)
  void setTouchDownHandle(T viewModel, bool flag) {
    viewModel.setTouchDownHandle(flag);
  }

  @ControllerProps(NodeProps.kOnTouchMove)
  void setTouchMoveHandle(T viewModel, bool flag) {
    viewModel.setTouchMoveHandle(flag);
  }

  @ControllerProps(NodeProps.kOnTouchEnd)
  void setTouchEndHandle(T viewModel, bool flag) {
    viewModel.setTouchEndHandle(flag);
  }

  @ControllerProps(NodeProps.kOnTouchCancel)
  void setTouchCancelHandle(T viewModel, bool flag) {
    viewModel.setTouchCancelHandle(flag);
  }

  @ControllerProps(NodeProps.kOnAttachedToWindow)
  void setAttachedToWindowHandle(T viewModel, bool flag) {
    viewModel.setAttachedToWindowHandle(flag);
  }

  @ControllerProps(NodeProps.kOnDetachedFromWindow)
  void setDetachedFromWindowHandle(T viewModel, bool flag) {
    viewModel.setDetachedFromWindowHandle(flag);
  }

  @override
  @mustCallSuper
  void setCustomProp(RenderNode node, String propName, Object prop) {
    DomUpdateUtil.updateStyleProp(node, propName, prop);
  }

  void onAfterUpdateProps(EngineContext context, R renderNode) {}

  Widget createWidget(BuildContext context, T viewModel);

  void updateLayout(EngineContext context, R node) {
    if (shouldInterceptLayout(node)) {
      return;
    }

    var layoutX = node.layoutX;
    var layoutY = node.layoutY;
    var layoutWidth = node.layoutWidth;
    var layoutHeight = node.layoutHeight;
    node.renderViewModel
        .updateLayout(layoutX, layoutY, layoutWidth, layoutHeight);
  }

  bool shouldInterceptLayout(R node) {
    return false;
  }

  void updateExtra(T renderViewModel, Object updateExtra) {}

  R createRenderNode(int id, VoltronMap? props, String name, RenderTree tree,
      ControllerManager controllerManager, bool lazy);

  T createRenderViewModel(R node, EngineContext context);

  // dispatch the js call UI Function.
  // @param node node实例
  // @param functionName 函数名
  // @param array 函数参数
  // @param promise 回调
  void dispatchFunction(T viewModel, String functionName, VoltronArray array,
      {Promise? promise}) {}

  void onBatchComplete(R node) {}

  void onManageChildComplete(R node) {}

  void onViewDestroy(RenderViewModel child) {
    child.onViewModelDestroy();
  }
}
