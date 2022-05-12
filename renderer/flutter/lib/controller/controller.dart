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

import '../voltron_renderer.dart';

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
  @override
  String get name;

  @override
  ControllerMethodPropProvider generateProvider() {
    final provider = ControllerMethodPropProvider();
    provider.pushAll(_baseRegisteredMethodProp);
    provider.pushAll(extendRegisteredMethodProp);
    return provider;
  }

  Map<String, ControllerMethodProp> get _baseRegisteredMethodProp => {
        NodeProps.kDisplay: ControllerMethodProp(setDisplay, ''),
        NodeProps.kTransform: ControllerMethodProp(setTransform, null),
        NodeProps.kTransformOrigin:
            ControllerMethodProp(setTransformOrigin, null),
        NodeProps.kPropAccessibilityLabel:
            ControllerMethodProp(setAccessibilityLabel, ""),
        NodeProps.kBackgroundColor:
            ControllerMethodProp(setBackgroundColor, Colors.transparent.value),
        NodeProps.kOpacity: ControllerMethodProp(setOpacity, 1.0),
        NodeProps.kNextFocusDownId:
            ControllerMethodProp(setNextFocusDownId, 0.0),
        NodeProps.kNextFocusUpId: ControllerMethodProp(setNextFocusUpId, 0.0),
        NodeProps.kNextFocusLeftId:
            ControllerMethodProp(setNextFocusLeftId, 0.0),
        NodeProps.kNextFocusRightId:
            ControllerMethodProp(setNextFocusRightId, 0.0),
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
        NodeProps.kBorderStyle: ControllerMethodProp(setBorderStyle, ''),
        NodeProps.kBoxShadow: ControllerMethodProp(setBoxShadow, null),
        NodeProps.kTransition: ControllerMethodProp(setTransition, null),
        NodeProps.kAnimation: ControllerMethodProp(setAnimation, null),
        NodeProps.kAnimationEndPropertyMap:
            ControllerMethodProp(setAnimationEndPropertyMap, null),
        NodeProps.kAnimationPropertyOptionMap:
            ControllerMethodProp(setAnimationPropertyOptionMap, null),
        NodeProps.kFocusable: ControllerMethodProp(setFocusable, false),
        NodeProps.kRequestFocus: ControllerMethodProp(requestFocus, false),
        NodeProps.kZIndex: ControllerMethodProp(setZIndex, 0),
        NodeProps.linearGradient: ControllerMethodProp(setLinearGradient, null),
        NodeProps.shadowOffset: ControllerMethodProp(setShadowOffset, null),
        NodeProps.shadowOffsetX: ControllerMethodProp(setShadowOffsetX, 0.0),
        NodeProps.shadowOffsetY: ControllerMethodProp(setShadowOffsetY, 0.0),
        NodeProps.shadowOpacity: ControllerMethodProp(setShadowOpacity, 0.0),
        NodeProps.shadowRadius: ControllerMethodProp(setShadowRadius, 0.0),
        NodeProps.shadowSpread: ControllerMethodProp(setShadowSpread, 0.0),
        NodeProps.shadowColor:
            ControllerMethodProp(setShadowColor, Colors.transparent.value),
      };

  Map<String, ControllerMethodProp> get extendRegisteredMethodProp;

  @ControllerProps(NodeProps.kDisplay)
  void setDisplay(T viewModel, String display) {
    viewModel.display = display;
  }

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

  @ControllerProps(NodeProps.linearGradient)
  void setLinearGradient(T viewModel, VoltronMap? value) {
    if (value != null) {
      viewModel.linearGradient = value;
    }
  }

  @ControllerProps(NodeProps.shadowOffset)
  void setShadowOffset(T viewModel, VoltronMap? shadowOffset) {
    if (shadowOffset != null) {
      viewModel.shadowOffsetX = shadowOffset.get<double>('x') ?? 0.0;
      viewModel.shadowOffsetY = shadowOffset.get<double>('y') ?? 0.0;
    }
  }

  @ControllerProps(NodeProps.shadowOffsetX)
  void setShadowOffsetX(T viewModel, double v) {
    viewModel.shadowOffsetX = v;
  }

  @ControllerProps(NodeProps.shadowOffsetY)
  void setShadowOffsetY(T viewModel, double v) {
    viewModel.shadowOffsetY = v;
  }

  @ControllerProps(NodeProps.shadowOpacity)
  void setShadowOpacity(T viewModel, double v) {
    viewModel.shadowOpacity = v;
  }

  @ControllerProps(NodeProps.shadowRadius)
  void setShadowRadius(T viewModel, double v) {
    viewModel.shadowRadius = v;
  }

  @ControllerProps(NodeProps.shadowSpread)
  void setShadowSpread(T viewModel, double v) {
    viewModel.shadowSpread = v;
  }

  @ControllerProps(NodeProps.shadowColor)
  void setShadowColor(T viewModel, int v) {
    viewModel.shadowColor = v;
  }

  @ControllerProps(NodeProps.kPropAccessibilityLabel)
  void setAccessibilityLabel(T viewModel, String? accessibilityLabel) {
    viewModel.accessibilityLabel = accessibilityLabel ?? "";
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

  @ControllerProps(NodeProps.kBorderStyle)
  void setBorderStyle(T viewModel, String borderStyle) {
    viewModel.borderStyle = borderStyle;
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

  @override
  @mustCallSuper
  void setCustomProp(RenderNode node, String propName, Object prop) {
    DomUpdateUtil.updateStyleProp(node, propName, prop);
  }

  void onAfterUpdateProps(RenderContext context, R renderNode) {}

  Widget createWidget(BuildContext context, T viewModel);

  void updateLayout(RenderContext context, R node) {
    var layoutX = node.layoutX;
    var layoutY = node.layoutY;
    var layoutWidth = node.layoutWidth;
    var layoutHeight = node.layoutHeight;
    node.renderViewModel.updateLayout(
      layoutX,
      layoutY,
      layoutWidth,
      layoutHeight,
    );
  }

  void updateExtra(T renderViewModel, Object updateExtra) {}

  void applyProps(RenderContext context, R node) {
    // empty
  }

  void updateEvents(T renderViewModel, Set<EventHolder> holders) {
    if (holders.isNotEmpty) {
      for (var holder in holders) {
        switch (holder.eventName) {
          case NativeGestureHandle.kClick:
            renderViewModel.setClickable(holder.isAdd);
            break;
          case NativeGestureHandle.kLongClick:
            renderViewModel.setLongClickable(holder.isAdd);
            break;
          case NativeGestureHandle.kTouchDown:
            renderViewModel.setTouchDownHandle(holder.isAdd);
            break;
          case NativeGestureHandle.kTouchMove:
            renderViewModel.setTouchMoveHandle(holder.isAdd);
            break;
          case NativeGestureHandle.kTouchEnd:
            renderViewModel.setTouchEndHandle(holder.isAdd);
            break;
          case NativeGestureHandle.kTouchCancel:
            renderViewModel.setTouchCancelHandle(holder.isAdd);
            break;
          case NativeGestureHandle.kShow:
            renderViewModel.setAttachedToWindowHandle(holder.isAdd);
            break;
          case NativeGestureHandle.kDismiss:
            renderViewModel.setDetachedFromWindowHandle(holder.isAdd);
            break;
          case NativeGestureHandle.kPressIn:
            renderViewModel.setCanPressIn(holder.isAdd);
            break;
          case NativeGestureHandle.kPressOut:
            renderViewModel.setCanPressOut(holder.isAdd);
            break;
        }
      }
    }
  }

  R createRenderNode(int id, VoltronMap? props, String name, RenderTree tree,
      ControllerManager controllerManager, bool lazy);

  VirtualNode? createVirtualNode(id, pid, index, className, props) {
    return null;
  }

  T createRenderViewModel(R node, RenderContext context);

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
