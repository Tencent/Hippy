import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../module.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';
import 'group.dart';

class ViewPagerController
    extends BaseGroupController<ViewPagerRenderViewModel> {
  static const String kClassName = "ViewPager";
  static const kInitialPage = "initialPage";
  static const kPageMargin = "pageMarginFact";

  static const String kFuncSetPage = "setPage";
  static const String kFuncSetPageWidthOutAnim = "setPageWithoutAnimation";

  @override
  ViewPagerRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return ViewPagerRenderViewModel(
        id: node.id,
        instanceId: node.rootId,
        className: node.name,
        context: context);
  }

  @override
  Widget createWidget(
      BuildContext context, ViewPagerRenderViewModel renderViewModel) {
    return ViewPagerWidget(renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        kInitialPage: ControllerMethodProp(setInitialPage, 0),
        NodeProps.kScrollEnable: ControllerMethodProp(setScrollEnabled, true),
        kPageMargin: ControllerMethodProp(setPageMargin, 0.0),
        NodeProps.kOverflow: ControllerMethodProp(setOverflow, "visible")
      };

  @override
  String get name => kClassName;

  @ControllerProps(kInitialPage)
  void setInitialPage(
      ViewPagerRenderViewModel renderViewModel, int initialPage) {
    renderViewModel.initialPage = initialPage;
  }

  @ControllerProps(NodeProps.kScrollEnable)
  void setScrollEnabled(ViewPagerRenderViewModel renderViewModel, bool value) {
    renderViewModel.scrollEnabled = value;
  }

  /// 在Android和iOS中这个属性为pageMargin，传入的是绝对值
  /// flutter中该属性传入的是比例，属性为pageMarginFact
  @ControllerProps(kPageMargin)
  void setPageMargin(ViewPagerRenderViewModel renderViewModel, double margin) {
    renderViewModel.pageMargin = margin;
  }

  @ControllerProps(NodeProps.kOverflow)
  void setOverflow(ViewPagerRenderViewModel renderViewModel, String overflow) {
    renderViewModel.overflow = overflow;
  }

  @override
  void dispatchFunction(ViewPagerRenderViewModel? renderViewModel,
      String functionName, VoltronArray array,
      {Promise? promise}) {
    if (renderViewModel == null) {
      return;
    }

    if (functionName == kFuncSetPage) {
      Object selected = array.get(0);
      if (selected is int &&
          selected >= 0 &&
          selected < renderViewModel.children.length) {
        renderViewModel.pageController?.animateToPage(selected,
            duration: Duration(milliseconds: 300),
            curve: Curves.linearToEaseOut);
      }
    } else if (functionName == kFuncSetPageWidthOutAnim) {
      Object selected = array.get(0);
      if (selected is int &&
          selected >= 0 &&
          selected < renderViewModel.children.length) {
        renderViewModel.pageController?.animateToPage(selected,
            duration: Duration(milliseconds: 40),
            curve: Curves.linearToEaseOut);
      }
    }
  }
}

class ViewPagerItemController
    extends BaseViewController<ViewPagerItemRenderViewModel> {
  static const String kClassName = "ViewPagerItem";

  @override
  ViewPagerItemRenderViewModel createRenderViewModel(
      RenderNode node, EngineContext context) {
    return ViewPagerItemRenderViewModel(
        id: node.id,
        instanceId: node.rootId,
        className: node.name,
        context: context);
  }

  @override
  Widget createWidget(
      BuildContext context, ViewPagerItemRenderViewModel renderViewModel) {
    return ViewPagerItemWidget(renderViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp => {};

  @override
  String get name => kClassName;

  @override
  bool shouldInterceptLayout(RenderNode node) {
    return true;
  }
}
