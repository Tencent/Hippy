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

abstract class VoltronViewController<T extends RenderViewModel, R extends RenderNode>
    implements ControllerMethodPropConsumer<T> {
  String get name;

  ControllerMethodPropProvider generateProvider() {
    final provider = ControllerMethodPropProvider();
    provider.pushAll(_baseRegisteredMethodProp);
    provider.pushAll(extendRegisteredMethodProp);
    return provider;
  }

  Map<String, ControllerMethodProp> get _baseRegisteredMethodProp => {
        NodeProps.transform: ControllerMethodProp(setTransform, null),
        NodeProps.transformOrigin:
            ControllerMethodProp(setTransformOrigin, null),
        NodeProps.propAccessibilityLabel:
            ControllerMethodProp(setAccessibilityLabel, ""),
        NodeProps.backgroundColor:
            ControllerMethodProp(setBackgroundColor, Colors.transparent.value),
        NodeProps.opacity: ControllerMethodProp(setOpacity, 1.0),
        NodeProps.borderRadius: ControllerMethodProp(setBorderRadius, 0.0),
        NodeProps.borderTopLeftRadius:
            ControllerMethodProp(setTopLeftBorderRadius, 0.0),
        NodeProps.borderTopRightRadius:
            ControllerMethodProp(setTopRightBorderRadius, 0.0),
        NodeProps.borderBottomRightRadius:
            ControllerMethodProp(setBottomRightBorderRadius, 0.0),
        NodeProps.borderBottomLeftRadius:
            ControllerMethodProp(setBottomLeftBorderRadius, 0.0),
        NodeProps.borderWidth: ControllerMethodProp(setBorderWidth, 0.0),
        NodeProps.nextFocusDownId:
            ControllerMethodProp(setNextFocusDownId, 0.0),
        NodeProps.nextFocusUpId: ControllerMethodProp(setNextFocusUpId, 0.0),
        NodeProps.nextFocusLeftId:
            ControllerMethodProp(setNextFocusLeftId, 0.0),
        NodeProps.nextFocusRightId:
            ControllerMethodProp(setNextFocusRightId, 0.0),
        NodeProps.borderLeftWidth:
            ControllerMethodProp(setLeftBorderWidth, 0.0),
        NodeProps.borderTopWidth: ControllerMethodProp(setTopBorderWidth, 0.0),
        NodeProps.borderRightWidth:
            ControllerMethodProp(setRightBorderWidth, 0.0),
        NodeProps.borderBottomWidth:
            ControllerMethodProp(setBottomBorderWidth, 0.0),
        NodeProps.borderColor:
            ControllerMethodProp(setBorderColor, Colors.transparent.value),
        NodeProps.borderLeftColor:
            ControllerMethodProp(setBorderLeftColor, Colors.transparent.value),
        NodeProps.borderTopColor:
            ControllerMethodProp(setBorderTopColor, Colors.transparent.value),
        NodeProps.borderRightColor:
            ControllerMethodProp(setBorderRightColor, Colors.transparent.value),
        NodeProps.borderBottomColor: ControllerMethodProp(
            setBorderBottomColor, Colors.transparent.value),
        NodeProps.boxShadow: ControllerMethodProp(setBoxShadow, null),
        NodeProps.transition: ControllerMethodProp(setTransition, null),
        NodeProps.animation: ControllerMethodProp(setAnimation, null),
        NodeProps.animationEndPropertyMap:
            ControllerMethodProp(setAnimationEndPropertyMap, null),
        NodeProps.animationPropertyOptionMap:
            ControllerMethodProp(setAnimationPropertyOptionMap, null),
        NodeProps.focusable: ControllerMethodProp(setFocusable, false),
        NodeProps.requestFocus: ControllerMethodProp(requestFocus, false),
        NodeProps.onClick: ControllerMethodProp(setClickable, false),
        NodeProps.onLongClick: ControllerMethodProp(setLongClickable, false),
        NodeProps.onPressIn: ControllerMethodProp(setCanPressIn, false),
        NodeProps.onPressOut: ControllerMethodProp(setCanPressOut, false),
        NodeProps.onTouchDown: ControllerMethodProp(setTouchDownHandle, false),
        NodeProps.onTouchMove: ControllerMethodProp(setTouchMoveHandle, false),
        NodeProps.onTouchEnd: ControllerMethodProp(setTouchEndHandle, false),
        NodeProps.onTouchCancel:
            ControllerMethodProp(setTouchCancelHandle, false),
        NodeProps.onAttachedToWindow:
            ControllerMethodProp(setAttachedToWindowHandle, false),
        NodeProps.onDetachedFromWindow:
            ControllerMethodProp(setDetachedFromWindowHandle, false),
        NodeProps.zIndex: ControllerMethodProp(setZIndex, 0)
      };

  Map<String, ControllerMethodProp> get extendRegisteredMethodProp;

  @ControllerProps(NodeProps.transform)
  void setTransform(T viewModel, VoltronArray? transformArray) {
    final transform = TransformUtil.getTransformMatrix4(transformArray);
    viewModel.transform = transform;
    viewModel
        .updateAnimation<Matrix4?>(NodeProps.transform, transform);
  }

  @ControllerProps(NodeProps.transformOrigin)
  void setTransformOrigin(T viewModel, VoltronMap? transformOriginMap) {
    final transformOrigin = TransformOrigin(transformOriginMap);
    viewModel.transformOrigin = transformOrigin;
    viewModel.updateAnimation<TransformOrigin>(
        NodeProps.transformOrigin, transformOrigin);
  }

  /// zIndex
  @ControllerProps(NodeProps.zIndex)
  void setZIndex(T viewModel, int zIndex) {
    viewModel.zIndex = zIndex;
  }

  @ControllerProps(NodeProps.propAccessibilityLabel)
  void setAccessibilityLabel(T viewModel, String? accessibilityLabel) {
    viewModel.accessibilityLabel =
        accessibilityLabel == null ? "" : accessibilityLabel;
  }

  @ControllerProps(NodeProps.backgroundColor)
  void setBackgroundColor(T viewModel, int? backgroundColor) {
    final color = backgroundColor == null ? null : Color(backgroundColor);
    viewModel.backgroundColor = color;
    viewModel
        .updateAnimation<Color?>(NodeProps.backgroundColor, color);
  }

  @ControllerProps(NodeProps.opacity)
  void setOpacity(T viewModel, double opacity) {
    viewModel.opacity = opacity;
    viewModel.updateAnimation<double>(NodeProps.opacity, opacity);
  }

  @ControllerProps(NodeProps.borderRadius)
  void setBorderRadius(T viewModel, double borderRadius) {
    viewModel.borderRadius = borderRadius;
  }

  @ControllerProps(NodeProps.borderTopLeftRadius)
  void setTopLeftBorderRadius(T viewModel, double topLeftBorderRadius) {
    viewModel.topLeftBorderRadius = topLeftBorderRadius;
  }

  @ControllerProps(NodeProps.borderTopRightRadius)
  void setTopRightBorderRadius(T viewModel, double topRightBorderRadius) {
    viewModel.topRightBorderRadius = topRightBorderRadius;
  }

  @ControllerProps(NodeProps.borderBottomRightRadius)
  void setBottomRightBorderRadius(T viewModel, double bottomRightBorderRadius) {
    viewModel.bottomRightBorderRadius = bottomRightBorderRadius;
  }

  @ControllerProps(NodeProps.borderBottomLeftRadius)
  void setBottomLeftBorderRadius(T viewModel, double bottomLeftBorderRadius) {
    viewModel.bottomLeftBorderRadius = bottomLeftBorderRadius;
  }

  @ControllerProps(NodeProps.borderWidth)
  void setBorderWidth(T viewModel, double borderWidth) {
    viewModel.borderWidth = borderWidth;
  }

  @ControllerProps(NodeProps.nextFocusDownId)
  void setNextFocusDownId(T viewModel, int id) {
    viewModel.nexFocusDownId = id;
  }

  @ControllerProps(NodeProps.nextFocusUpId)
  void setNextFocusUpId(T viewModel, int id) {
    viewModel.nextFocusUpId = id;
  }

  @ControllerProps(NodeProps.nextFocusLeftId)
  void setNextFocusLeftId(T viewModel, int id) {
    viewModel.nextFocusLeftId = id;
  }

  @ControllerProps(NodeProps.nextFocusRightId)
  void setNextFocusRightId(T viewModel, int id) {
    viewModel.nextFocusRightId = id;
  }

  @ControllerProps(NodeProps.borderLeftWidth)
  void setLeftBorderWidth(T viewModel, double width) {
    viewModel.borderLeftWidth = width;
  }

  @ControllerProps(NodeProps.borderTopWidth)
  void setTopBorderWidth(T viewModel, double width) {
    viewModel.borderTopWidth = width;
  }

  @ControllerProps(NodeProps.borderRightWidth)
  void setRightBorderWidth(T viewModel, double width) {
    viewModel.borderRightWidth = width;
  }

  @ControllerProps(NodeProps.borderBottomWidth)
  void setBottomBorderWidth(T viewModel, double width) {
    viewModel.borderBottomWidth = width;
  }

  @ControllerProps(NodeProps.borderColor)
  void setBorderColor(T viewModel, int color) {
    viewModel.borderColor = color;
  }

  @ControllerProps(NodeProps.borderLeftColor)
  void setBorderLeftColor(T viewModel, int color) {
    viewModel.borderLeftColor = color;
  }

  @ControllerProps(NodeProps.borderTopColor)
  void setBorderTopColor(T viewModel, int color) {
    viewModel.borderTopColor = color;
  }

  @ControllerProps(NodeProps.borderRightColor)
  void setBorderRightColor(T viewModel, int color) {
    viewModel.borderRightColor = color;
  }

  @ControllerProps(NodeProps.borderBottomColor)
  void setBorderBottomColor(T viewModel, int color) {
    viewModel.borderBottomColor = color;
  }

  @ControllerProps(NodeProps.boxShadow)
  void setBoxShadow(T viewModel, VoltronArray? data) {
    viewModel.boxShadow = data;
  }

  @ControllerProps(NodeProps.transition)
  void setTransition(T viewModel, VoltronArray? value) {
    final transitionMap = AnimationUtil.getTransitionMap(value);
    if (transitionMap == null) {
      return;
    }

    viewModel.transition =
        CssAnimation.initByTransition(transitionMap, viewModel);
  }

  @ControllerProps(NodeProps.animation)
  void setAnimation(T viewModel, VoltronMap? value) {
    final animationPropertyMap =
        value?.get<VoltronMap>(NodeProps.animationKeyFramePropertyMap);
    if (value == null || animationPropertyMap == null) {
      return;
    }

    final propertyMapSortList =
        AnimationUtil.getAnimationPropertyListSortByKeyframeSelector(
            animationPropertyMap);
    viewModel.animation = CssAnimation.initByAnimation(
        value, propertyMapSortList, viewModel);
    viewModel.animationFillMode =
        value.get<String>(NodeProps.animationFillModel) ??
            AnimationFillMode.none;
  }

  @ControllerProps(NodeProps.animationEndPropertyMap)
  void setAnimationEndPropertyMap(T viewModel, VoltronMap? value) {
    viewModel.animationEndPropertyMap = VoltronMap.copy(value);
  }

  @ControllerProps(NodeProps.animationPropertyOptionMap)
  void setAnimationPropertyOptionMap(T viewModel, VoltronMap? value) {
    viewModel.animationPropertyOptionMap = VoltronMap.copy(value);
  }

  @ControllerProps(NodeProps.focusable)
  void setFocusable(T viewModel, bool focusable) {
    viewModel.setFocusable(focusable);
  }

  @ControllerProps(NodeProps.requestFocus)
  void requestFocus(T viewModel, bool request) {
    viewModel.requestFocus(request);
  }

  @ControllerProps(NodeProps.onClick)
  void setClickable(T viewModel, bool flag) {
    viewModel.setClickable(flag);
  }

  @ControllerProps(NodeProps.onLongClick)
  void setLongClickable(T viewModel, bool flag) {
    viewModel.setLongClickable(flag);
  }

  @ControllerProps(NodeProps.onPressIn)
  void setCanPressIn(T viewModel, bool flag) {
    viewModel.setCanPressIn(flag);
  }

  @ControllerProps(NodeProps.onPressOut)
  void setCanPressOut(T viewModel, bool flag) {
    viewModel.setCanPressOut(flag);
  }

  @ControllerProps(NodeProps.onTouchDown)
  void setTouchDownHandle(T viewModel, bool flag) {
    viewModel.setTouchDownHandle(flag);
  }

  @ControllerProps(NodeProps.onTouchMove)
  void setTouchMoveHandle(T viewModel, bool flag) {
    viewModel.setTouchMoveHandle(flag);
  }

  @ControllerProps(NodeProps.onTouchEnd)
  void setTouchEndHandle(T viewModel, bool flag) {
    viewModel.setTouchEndHandle(flag);
  }

  @ControllerProps(NodeProps.onTouchCancel)
  void setTouchCancelHandle(T viewModel, bool flag) {
    viewModel.setTouchCancelHandle(flag);
  }

  @ControllerProps(NodeProps.onAttachedToWindow)
  void setAttachedToWindowHandle(T viewModel, bool flag) {
    viewModel.setAttachedToWindowHandle(flag);
  }

  @ControllerProps(NodeProps.onDetachedFromWindow)
  void setDetachedFromWindowHandle(T viewModel, bool flag) {
    viewModel.setDetachedFromWindowHandle(flag);
  }

  @override
  @mustCallSuper
  void setCustomProp(RenderNode node, String propName, Object prop) {
    DomUpdateUtil.updateStyleProp(node, propName, prop);
  }

  void onAfterUpdateProps(R renderNode) {}

  Widget createWidget(BuildContext context, T viewModel);

  void updateLayout(R node) {
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
