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

import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ViewPagerController extends BaseGroupController<ViewPagerRenderViewModel> {
  static const String kClassName = "ViewPager";
  static const kInitialPage = "initialPage";
  static const kPageMargin = "pageMarginFact";
  static const kBounces = "bounces";
  static const kDirection = "direction";

  static const String kFuncSetPage = "setPage";
  static const String kFuncSetPageWidthOutAnim = "setPageWithoutAnimation";

  @override
  ViewPagerRenderViewModel createRenderViewModel(
    RenderNode node,
    RenderContext context,
  ) {
    return ViewPagerRenderViewModel(
      id: node.id,
      instanceId: node.rootId,
      className: node.name,
      context: context,
    );
  }

  @override
  Widget createWidget(
    BuildContext context,
    ViewPagerRenderViewModel viewModel,
  ) {
    return ViewPagerWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        kInitialPage: ControllerMethodProp(setInitialPage, 0),
        kBounces: ControllerMethodProp(setBounces, false),
        kDirection: ControllerMethodProp(setDirection, ''),
        NodeProps.kScrollEnable: ControllerMethodProp(setScrollEnabled, true),
        kPageMargin: ControllerMethodProp(setPageMargin, 0.0),
      };

  @override
  String get name => kClassName;

  @ControllerProps(kInitialPage)
  void setInitialPage(ViewPagerRenderViewModel renderViewModel, int initialPage) {
    renderViewModel.initialPage = initialPage;
  }

  @ControllerProps(kBounces)
  void setBounces(ViewPagerRenderViewModel renderViewModel, bool flag) {
    renderViewModel.bounces = flag;
  }

  @ControllerProps(kDirection)
  void setDirection(ViewPagerRenderViewModel renderViewModel, String direction) {
    if (direction == 'vertical') {
      renderViewModel.isVertical = true;
    } else {
      renderViewModel.isVertical = false;
    }
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

  @override
  void dispatchFunction(
      ViewPagerRenderViewModel? viewModel, String functionName, VoltronArray array,
      {Promise? promise}) {
    if (viewModel == null) {
      return;
    }

    if (functionName == kFuncSetPage) {
      Object selected = array.get(0);
      if (selected is int && selected >= 0 && selected < viewModel.children.length) {
        viewModel.pageController?.animateToPage(
          selected,
          duration: const Duration(milliseconds: 300),
          curve: Curves.linearToEaseOut,
        );
      }
    } else if (functionName == kFuncSetPageWidthOutAnim) {
      Object selected = array.get(0);
      if (selected is int && selected >= 0 && selected < viewModel.children.length) {
        viewModel.pageController?.jumpToPage(
          selected,
        );
      }
    }
  }
}

class ViewPagerItemController extends BaseViewController<ViewPagerItemRenderViewModel> {
  static const String kClassName = "ViewPagerItem";

  @override
  ViewPagerItemRenderViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return ViewPagerItemRenderViewModel(
        id: node.id, instanceId: node.rootId, className: node.name, context: context);
  }

  @override
  Widget createWidget(BuildContext context, ViewPagerItemRenderViewModel viewModel) {
    return ViewPagerItemWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp => {};

  @override
  String get name => kClassName;
}
