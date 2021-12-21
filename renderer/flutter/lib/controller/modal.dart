import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../render.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

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
      ModalRenderNode node, EngineContext context) {
    return ModalRenderViewModel(
        id: node.id,
        className: node.name,
        instanceId: node.rootId,
        context: context);
  }

  @override
  Widget createWidget(
      BuildContext context, ModalRenderViewModel renderViewModel) {
    return ModalContainerWidget(renderViewModel);
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
