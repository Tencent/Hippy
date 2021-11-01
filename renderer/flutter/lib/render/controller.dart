import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../dom/style_node.dart';
import '../module/promise.dart';
import '../util/animation_util.dart';
import '../util/transform_util.dart';
import 'node.dart';
import 'tree.dart';
import 'view_model.dart';

abstract class VoltronViewController<T extends RenderNode>
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
  void setTransform(T node, VoltronArray? transformArray) {
    final transform = TransformUtil.getTransformMatrix4(transformArray);
    node.renderViewModel.transform = transform;
    node.renderViewModel
        .updateAnimation<Matrix4?>(NodeProps.transform, transform);
  }

  @ControllerProps(NodeProps.transformOrigin)
  void setTransformOrigin(T node, VoltronMap? transformOriginMap) {
    final transformOrigin = TransformOrigin(transformOriginMap);
    node.renderViewModel.transformOrigin = transformOrigin;
    node.renderViewModel.updateAnimation<TransformOrigin>(
        NodeProps.transformOrigin, transformOrigin);
  }

  /// zIndex
  @ControllerProps(NodeProps.zIndex)
  void setZIndex(T view, int zIndex) {
    view.renderViewModel.zIndex = zIndex;
  }

  @ControllerProps(NodeProps.propAccessibilityLabel)
  void setAccessibilityLabel(T node, String? accessibilityLabel) {
    node.renderViewModel.accessibilityLabel =
        accessibilityLabel == null ? "" : accessibilityLabel;
  }

  @ControllerProps(NodeProps.backgroundColor)
  void setBackgroundColor(T node, int? backgroundColor) {
    final color = backgroundColor == null ? null : Color(backgroundColor);
    node.renderViewModel.backgroundColor = color;
    node.renderViewModel
        .updateAnimation<Color?>(NodeProps.backgroundColor, color);
  }

  @ControllerProps(NodeProps.opacity)
  void setOpacity(T node, double opacity) {
    node.renderViewModel.opacity = opacity;
    node.renderViewModel.updateAnimation<double>(NodeProps.opacity, opacity);
  }

  @ControllerProps(NodeProps.borderRadius)
  void setBorderRadius(T node, double borderRadius) {
    node.renderViewModel.borderRadius = borderRadius;
  }

  @ControllerProps(NodeProps.borderTopLeftRadius)
  void setTopLeftBorderRadius(T node, double topLeftBorderRadius) {
    node.renderViewModel.topLeftBorderRadius = topLeftBorderRadius;
  }

  @ControllerProps(NodeProps.borderTopRightRadius)
  void setTopRightBorderRadius(T node, double topRightBorderRadius) {
    node.renderViewModel.topRightBorderRadius = topRightBorderRadius;
  }

  @ControllerProps(NodeProps.borderBottomRightRadius)
  void setBottomRightBorderRadius(T node, double bottomRightBorderRadius) {
    node.renderViewModel.bottomRightBorderRadius = bottomRightBorderRadius;
  }

  @ControllerProps(NodeProps.borderBottomLeftRadius)
  void setBottomLeftBorderRadius(T node, double bottomLeftBorderRadius) {
    node.renderViewModel.bottomLeftBorderRadius = bottomLeftBorderRadius;
  }

  @ControllerProps(NodeProps.borderWidth)
  void setBorderWidth(T node, double borderWidth) {
    node.renderViewModel.borderWidth = borderWidth;
  }

  @ControllerProps(NodeProps.nextFocusDownId)
  void setNextFocusDownId(T node, int id) {
    node.renderViewModel.nexFocusDownId = id;
  }

  @ControllerProps(NodeProps.nextFocusUpId)
  void setNextFocusUpId(T node, int id) {
    node.renderViewModel.nextFocusUpId = id;
  }

  @ControllerProps(NodeProps.nextFocusLeftId)
  void setNextFocusLeftId(T node, int id) {
    node.renderViewModel.nextFocusLeftId = id;
  }

  @ControllerProps(NodeProps.nextFocusRightId)
  void setNextFocusRightId(T node, int id) {
    node.renderViewModel.nextFocusRightId = id;
  }

  @ControllerProps(NodeProps.borderLeftWidth)
  void setLeftBorderWidth(T node, double width) {
    node.renderViewModel.borderLeftWidth = width;
  }

  @ControllerProps(NodeProps.borderTopWidth)
  void setTopBorderWidth(T node, double width) {
    node.renderViewModel.borderTopWidth = width;
  }

  @ControllerProps(NodeProps.borderRightWidth)
  void setRightBorderWidth(T node, double width) {
    node.renderViewModel.borderRightWidth = width;
  }

  @ControllerProps(NodeProps.borderBottomWidth)
  void setBottomBorderWidth(T node, double width) {
    node.renderViewModel.borderBottomWidth = width;
  }

  @ControllerProps(NodeProps.borderColor)
  void setBorderColor(T node, int color) {
    node.renderViewModel.borderColor = color;
  }

  @ControllerProps(NodeProps.borderLeftColor)
  void setBorderLeftColor(T node, int color) {
    node.renderViewModel.borderLeftColor = color;
  }

  @ControllerProps(NodeProps.borderTopColor)
  void setBorderTopColor(T node, int color) {
    node.renderViewModel.borderTopColor = color;
  }

  @ControllerProps(NodeProps.borderRightColor)
  void setBorderRightColor(T node, int color) {
    node.renderViewModel.borderRightColor = color;
  }

  @ControllerProps(NodeProps.borderBottomColor)
  void setBorderBottomColor(T node, int color) {
    node.renderViewModel.borderBottomColor = color;
  }

  @ControllerProps(NodeProps.boxShadow)
  void setBoxShadow(T node, VoltronArray? data) {
    node.renderViewModel.boxShadow = data;
  }

  @ControllerProps(NodeProps.transition)
  void setTransition(T node, VoltronArray? value) {
    final transitionMap = AnimationUtil.getTransitionMap(value);
    if (transitionMap == null) {
      return;
    }

    node.renderViewModel.transition =
        CssAnimation.initByTransition(transitionMap, node.renderViewModel);
  }

  @ControllerProps(NodeProps.animation)
  void setAnimation(T node, VoltronMap? value) {
    final animationPropertyMap =
        value?.get<VoltronMap>(NodeProps.animationKeyFramePropertyMap);
    if (value == null || animationPropertyMap == null) {
      return;
    }

    final propertyMapSortList =
        AnimationUtil.getAnimationPropertyListSortByKeyframeSelector(
            animationPropertyMap);
    node.renderViewModel.animation = CssAnimation.initByAnimation(
        value, propertyMapSortList, node.renderViewModel);
    node.renderViewModel.animationFillMode =
        value.get<String>(NodeProps.animationFillModel) ??
            AnimationFillMode.none;
    node.renderViewModel.domTreeCssAnimation =
        DomTreeCssAnimation.initByAnimation(value, propertyMapSortList);
  }

  @ControllerProps(NodeProps.animationEndPropertyMap)
  void setAnimationEndPropertyMap(T node, VoltronMap? value) {
    node.renderViewModel.animationEndPropertyMap = VoltronMap.copy(value);
  }

  @ControllerProps(NodeProps.animationPropertyOptionMap)
  void setAnimationPropertyOptionMap(T node, VoltronMap? value) {
    node.renderViewModel.animationPropertyOptionMap = VoltronMap.copy(value);
  }

  @ControllerProps(NodeProps.focusable)
  void setFocusable(T node, bool focusable) {
    node.renderViewModel.setFocusable(focusable);
  }

  @ControllerProps(NodeProps.requestFocus)
  void requestFocus(T node, bool request) {
    node.renderViewModel.requestFocus(request);
  }

  @ControllerProps(NodeProps.onClick)
  void setClickable(T node, bool flag) {
    node.renderViewModel.setClickable(flag);
  }

  @ControllerProps(NodeProps.onLongClick)
  void setLongClickable(T node, bool flag) {
    node.renderViewModel.setLongClickable(flag);
  }

  @ControllerProps(NodeProps.onPressIn)
  void setCanPressIn(T node, bool flag) {
    node.renderViewModel.setCanPressIn(flag);
  }

  @ControllerProps(NodeProps.onPressOut)
  void setCanPressOut(T node, bool flag) {
    node.renderViewModel.setCanPressOut(flag);
  }

  @ControllerProps(NodeProps.onTouchDown)
  void setTouchDownHandle(T node, bool flag) {
    node.renderViewModel.setTouchDownHandle(flag);
  }

  @ControllerProps(NodeProps.onTouchMove)
  void setTouchMoveHandle(T node, bool flag) {
    node.renderViewModel.setTouchMoveHandle(flag);
  }

  @ControllerProps(NodeProps.onTouchEnd)
  void setTouchEndHandle(T node, bool flag) {
    node.renderViewModel.setTouchEndHandle(flag);
  }

  @ControllerProps(NodeProps.onTouchCancel)
  void setTouchCancelHandle(T node, bool flag) {
    node.renderViewModel.setTouchCancelHandle(flag);
  }

  @ControllerProps(NodeProps.onAttachedToWindow)
  void setAttachedToWindowHandle(T node, bool flag) {
    node.renderViewModel.setAttachedToWindowHandle(flag);
  }

  @ControllerProps(NodeProps.onDetachedFromWindow)
  void setDetachedFromWindowHandle(T node, bool flag) {
    node.renderViewModel.setDetachedFromWindowHandle(flag);
  }

  @override
  void setCustomProp(T node, String propName, Object prop) {}

  void onAfterUpdateProps(T renderNode) {}

  StyleNode createStyleNode(
      String name, String tagName, int instanceId, int id, bool isVirtual) {
    return StyleNode(instanceId, id, name, tagName);
  }

  Widget createWidget(BuildContext context, T renderNode);

  void updateLayout(T node) {
    if (shouldInterceptLayout(node)) {
      return;
    }

    var layoutX = node.layoutX;
    var layoutY = node.layoutY;
    var layoutWidth = node.layoutWidth;
    var layoutHeight = node.layoutHeight;
    if (layoutX == null ||
        layoutY == null ||
        layoutWidth == null ||
        layoutHeight == null) {
      return;
    }
    node.renderViewModel
        .updateLayout(layoutX, layoutY, layoutWidth, layoutHeight);
  }

  bool shouldInterceptLayout(T node) {
    return false;
  }

  void updateExtra(T node, Object updateExtra) {}

  T createRenderNode(int id, VoltronMap? props, String name, RenderTree tree,
      ControllerManager controllerManager, bool lazy);

  // dispatch the js call UI Function.
  // @param node node实例
  // @param functionName 函数名
  // @param array 函数参数
  // @param promise 回调
  void dispatchFunction(T node, String functionName, VoltronArray array,
      {Promise? promise}) {}

  void onBatchComplete(T node) {}

  void onManageChildComplete(T node) {}

  void onViewDestroy(RenderViewModel child) {
    child.onViewModelDestroy();
  }
}
