//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2022 THL A29 Limited, a Tencent company.
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
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ModalController extends GroupController<ModalRenderViewModel, ModalRenderNode> {
  static const String kClassName = "Modal";

  static const String kEventOnRequestClose = "requestclose";
  static const String kEventOnShow = "show";

  @override
  ModalRenderNode createRenderNode(
    int id,
    VoltronMap? props,
    String name,
    RenderTree tree,
    ControllerManager controllerManager,
    bool lazy,
  ) {
    return ModalRenderNode(id, kClassName, tree, controllerManager, props);
  }

  @override
  ModalRenderViewModel createRenderViewModel(ModalRenderNode node, RenderContext context) {
    return ModalRenderViewModel(
      id: node.id,
      className: node.name,
      instanceId: node.rootId,
      context: context,
    );
  }

  @override
  Widget createWidget(BuildContext context, ModalRenderViewModel viewModel) {
    return ModalWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.kAnimationSwitch: ControllerMethodProp(setAnimationSwitch, true),
        NodeProps.kAnimationType: ControllerMethodProp(setAnimationType, "none"),
        NodeProps.kAnimationDuration: ControllerMethodProp(setAnimationDuration, 200),
        NodeProps.kBarrierColorReact: ControllerMethodProp(setBarrierColorReact, 0x01ffffff),
        NodeProps.kBarrierColorVue: ControllerMethodProp(setBarrierColorVue, 0x01ffffff),
        NodeProps.kImmersionStatusBar: ControllerMethodProp(setEnterImmersionStatusBar, false),
        NodeProps.kDarkStatusBarText:
            ControllerMethodProp(setImmersionStatusBarTextDarkColor, false),
        NodeProps.kTransparent: ControllerMethodProp(setTransparent, false),
      };

  @override
  String get name => kClassName;

  @ControllerProps(NodeProps.kAnimationSwitch)
  void setAnimationSwitch(ModalRenderViewModel renderViewModel, bool animationSwitch) {
    renderViewModel.animationSwitch = animationSwitch;
  }

  @ControllerProps(NodeProps.kAnimationType)
  void setAnimationType(ModalRenderViewModel renderViewModel, String animationType) {
    renderViewModel.animationType = animationType;
  }

  @ControllerProps(NodeProps.kAnimationDuration)
  void setAnimationDuration(ModalRenderViewModel renderViewModel, int animationDuration) {
    renderViewModel.animationDuration = animationDuration;
  }

  @ControllerProps(NodeProps.kBarrierColorReact)
  void setBarrierColorReact(ModalRenderViewModel renderViewModel, int barrierColor) {
    renderViewModel.barrierColor = barrierColor;
  }

  @ControllerProps(NodeProps.kBarrierColorVue)
  void setBarrierColorVue(ModalRenderViewModel renderViewModel, int barrierColor) {
    renderViewModel.barrierColor = barrierColor;
  }

  @ControllerProps(NodeProps.kImmersionStatusBar)
  void setEnterImmersionStatusBar(ModalRenderViewModel renderViewModel, bool immersionStatusBar) {
    renderViewModel.immersionStatusBar = immersionStatusBar;
  }

  @ControllerProps(NodeProps.kDarkStatusBarText)
  void setImmersionStatusBarTextDarkColor(
      ModalRenderViewModel renderViewModel, bool statusBarTextDarkColor) {
    renderViewModel.statusBarTextDarkColor = statusBarTextDarkColor;
  }

  @ControllerProps(NodeProps.kTransparent)
  void setTransparent(ModalRenderViewModel renderViewModel, bool transparent) {
    renderViewModel.transparent = transparent;
  }
}
