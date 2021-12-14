import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../engine/engine_context.dart';
import '../render/modal.dart';
import '../render/tree.dart';
import '../viewmodel/modal.dart';
import '../widget/modal.dart';
import 'group.dart';

class ModalController
    extends GroupController<ModalRenderViewModel, ModalRenderNode> {
  static const String className = "Modal";

  static const String animationSwitch = "animated";
  static const String animationType = "animationType";
  static const String animationDuration = 'animationDuration';
  static const String barrierColorReact = 'barrierColor';
  static const String barrierColorVue = 'barrier-color';
  static const String immersionStatusBar = "immersionStatusBar";
  static const String darkStatusBarText = "darkStatusBarText";
  static const String transparent = "transparent";
  static const String resizeToAvoidBottomInset = "resizeToAvoidBottomInset";

  @override
  ModalRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ModalRenderNode(id, className, tree, controllerManager, props);
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
        animationSwitch: ControllerMethodProp(setAnimationSwitch, true),
        animationType: ControllerMethodProp(setAnimationType, "none"),
        animationDuration: ControllerMethodProp(setAnimationDuration, 200),
        barrierColorReact:
            ControllerMethodProp(setBarrierColorReact, 0x01ffffff),
        barrierColorVue: ControllerMethodProp(setBarrierColorVue, 0x01ffffff),
        immersionStatusBar:
            ControllerMethodProp(setEnterImmersionStatusBar, false),
        darkStatusBarText:
            ControllerMethodProp(setImmersionStatusBarTextDarkColor, false),
        transparent: ControllerMethodProp(setTransparent, false),
        resizeToAvoidBottomInset:
            ControllerMethodProp(setResizeToAvoidBottomInset, true)
      };

  @override
  String get name => className;

  @ControllerProps(animationSwitch)
  void setAnimationSwitch(
      ModalRenderViewModel renderViewModel, bool animationSwitch) {
    renderViewModel.animationSwitch = animationSwitch;
  }

  @ControllerProps(animationType)
  void setAnimationType(
      ModalRenderViewModel renderViewModel, String animationType) {
    renderViewModel.animationType = animationType;
  }

  @ControllerProps(animationDuration)
  void setAnimationDuration(
      ModalRenderViewModel renderViewModel, int animationDuration) {
    renderViewModel.animationDuration = animationDuration;
  }

  @ControllerProps(barrierColorReact)
  void setBarrierColorReact(
      ModalRenderViewModel renderViewModel, int barrierColor) {
    renderViewModel.barrierColor = barrierColor;
  }

  @ControllerProps(barrierColorVue)
  void setBarrierColorVue(
      ModalRenderViewModel renderViewModel, int barrierColor) {
    renderViewModel.barrierColor = barrierColor;
  }

  @ControllerProps(immersionStatusBar)
  void setEnterImmersionStatusBar(
      ModalRenderViewModel renderViewModel, bool immersionStatusBar) {
    renderViewModel.immersionStatusBar = immersionStatusBar;
  }

  @ControllerProps(darkStatusBarText)
  void setImmersionStatusBarTextDarkColor(
      ModalRenderViewModel renderViewModel, bool statusBarTextDarkColor) {
    renderViewModel.statusBarTextDarkColor = statusBarTextDarkColor;
  }

  @ControllerProps(transparent)
  void setTransparent(ModalRenderViewModel renderViewModel, bool transparent) {
    renderViewModel.transparent = transparent;
  }

  @ControllerProps(resizeToAvoidBottomInset)
  void setResizeToAvoidBottomInset(
      ModalRenderViewModel renderViewModel, bool resizeToAvoidBottomInset) {
    renderViewModel.resizeToAvoidBottomInset = resizeToAvoidBottomInset;
  }
}
