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
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ModalController
    extends GroupController<ModalRenderViewModel, ModalRenderNode> {
  static const String kClassName = "Modal";

  static const String kAnimationSwitch = "animated";
  static const String kAnimationType = "animationType";
  static const String kAnimationDuration = 'animationDuration';
  static const String kBarrierColorReact = 'barrierColor';
  static const String kBarrierColorVue = 'barrier-color';
  static const String kImmersionStatusBar = "immersionStatusBar";
  static const String kDarkStatusBarText = "darkStatusBarText";
  static const String kTransparent = "transparent";
  static const String kResizeToAvoidBottomInset = "resizeToAvoidBottomInset";

  @override
  ModalRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ModalRenderNode(id, kClassName, tree, controllerManager, props);
  }

  @override
  ModalRenderViewModel createRenderViewModel(
      ModalRenderNode node, RenderContext context) {
    return ModalRenderViewModel(
        id: node.id,
        className: node.name,
        instanceId: node.rootId,
        context: context);
  }

  @override
  Widget createWidget(
      BuildContext context, ModalRenderViewModel viewModel) {
    return ModalContainerWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        kAnimationSwitch: ControllerMethodProp(setAnimationSwitch, true),
        kAnimationType: ControllerMethodProp(setAnimationType, "none"),
        kAnimationDuration: ControllerMethodProp(setAnimationDuration, 200),
        kBarrierColorReact:
            ControllerMethodProp(setBarrierColorReact, 0x01ffffff),
        kBarrierColorVue: ControllerMethodProp(setBarrierColorVue, 0x01ffffff),
        kImmersionStatusBar:
            ControllerMethodProp(setEnterImmersionStatusBar, false),
        kDarkStatusBarText:
            ControllerMethodProp(setImmersionStatusBarTextDarkColor, false),
        kTransparent: ControllerMethodProp(setTransparent, false),
        kResizeToAvoidBottomInset:
            ControllerMethodProp(setResizeToAvoidBottomInset, true)
      };

  @override
  String get name => kClassName;

  @ControllerProps(kAnimationSwitch)
  void setAnimationSwitch(
      ModalRenderViewModel renderViewModel, bool animationSwitch) {
    renderViewModel.animationSwitch = animationSwitch;
  }

  @ControllerProps(kAnimationType)
  void setAnimationType(
      ModalRenderViewModel renderViewModel, String animationType) {
    renderViewModel.animationType = animationType;
  }

  @ControllerProps(kAnimationDuration)
  void setAnimationDuration(
      ModalRenderViewModel renderViewModel, int animationDuration) {
    renderViewModel.animationDuration = animationDuration;
  }

  @ControllerProps(kBarrierColorReact)
  void setBarrierColorReact(
      ModalRenderViewModel renderViewModel, int barrierColor) {
    renderViewModel.barrierColor = barrierColor;
  }

  @ControllerProps(kBarrierColorVue)
  void setBarrierColorVue(
      ModalRenderViewModel renderViewModel, int barrierColor) {
    renderViewModel.barrierColor = barrierColor;
  }

  @ControllerProps(kImmersionStatusBar)
  void setEnterImmersionStatusBar(
      ModalRenderViewModel renderViewModel, bool immersionStatusBar) {
    renderViewModel.immersionStatusBar = immersionStatusBar;
  }

  @ControllerProps(kDarkStatusBarText)
  void setImmersionStatusBarTextDarkColor(
      ModalRenderViewModel renderViewModel, bool statusBarTextDarkColor) {
    renderViewModel.statusBarTextDarkColor = statusBarTextDarkColor;
  }

  @ControllerProps(kTransparent)
  void setTransparent(ModalRenderViewModel renderViewModel, bool transparent) {
    renderViewModel.transparent = transparent;
  }

  @ControllerProps(kResizeToAvoidBottomInset)
  void setResizeToAvoidBottomInset(
      ModalRenderViewModel renderViewModel, bool resizeToAvoidBottomInset) {
    renderViewModel.resizeToAvoidBottomInset = resizeToAvoidBottomInset;
  }
}
