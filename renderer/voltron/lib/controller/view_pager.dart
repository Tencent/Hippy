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

import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ViewPagerController extends BaseGroupController<ViewPagerRenderViewModel> {
  static const String kClassName = "ViewPager";

  /// 3.0 bind events
  static const String kEventOnPageSelected = 'pageselected';
  static const String kEventOnPageScroll = 'pagescroll';
  static const String kEventOnPageScrollStateChanged = 'pagescrollstatechanged';

  /// func
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
        NodeProps.kInitialPage: ControllerMethodProp(setInitialPage, 0),
        NodeProps.kBounces: ControllerMethodProp(setBounces, false),
        NodeProps.kDirection: ControllerMethodProp(setDirection, ''),
        NodeProps.kScrollEnable: ControllerMethodProp(setScrollEnabled, true),
        NodeProps.kPageMargin: ControllerMethodProp(setPageMargin, 0.0),
        NodeProps.kOnPageSelected: ControllerMethodProp(setOnPageSelected, true),
        NodeProps.kOnPageScroll: ControllerMethodProp(setOnPageScroll, true),
        NodeProps.kOnPageScrollStateChanged:
            ControllerMethodProp(setOnPageScrollStateChanged, true),
      };

  @override
  String get name => kClassName;

  @ControllerProps(NodeProps.kInitialPage)
  void setInitialPage(ViewPagerRenderViewModel renderViewModel, int initialPage) {
    renderViewModel.initialPage = initialPage;
  }

  @ControllerProps(NodeProps.kBounces)
  void setBounces(ViewPagerRenderViewModel renderViewModel, bool flag) {
    renderViewModel.bounces = flag;
  }

  @ControllerProps(NodeProps.kDirection)
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
  @ControllerProps(NodeProps.kPageMargin)
  void setPageMargin(ViewPagerRenderViewModel renderViewModel, double margin) {
    renderViewModel.pageMargin = margin;
  }

  @ControllerProps(NodeProps.kOnPageSelected)
  void setOnPageSelected(ViewPagerRenderViewModel renderViewModel, bool enable) {
    renderViewModel.onPageSelectedEventEnable = enable;
  }

  @ControllerProps(NodeProps.kOnPageScroll)
  void setOnPageScroll(ViewPagerRenderViewModel renderViewModel, bool enable) {
    renderViewModel.onPageScrollEventEnable = enable;
  }

  @ControllerProps(NodeProps.kOnPageScrollStateChanged)
  void setOnPageScrollStateChanged(ViewPagerRenderViewModel renderViewModel, bool enable) {
    renderViewModel.onPageScrollStateChangedEventEnable = enable;
  }

  @override
  void updateEvents(
    ViewPagerRenderViewModel renderViewModel,
    Set<EventHolder> holders,
  ) {
    super.updateEvents(renderViewModel, holders);
    if (holders.isNotEmpty) {
      for (var holder in holders) {
        switch (holder.eventName) {
          case kEventOnPageSelected:
            setOnPageSelected(renderViewModel, holder.isAdd);
            break;
          case kEventOnPageScroll:
            setOnPageScroll(renderViewModel, holder.isAdd);
            break;
          case kEventOnPageScrollStateChanged:
            setOnPageScrollStateChanged(renderViewModel, holder.isAdd);
            break;
        }
      }
    }
  }

  @override
  void dispatchFunction(
    ViewPagerRenderViewModel? viewModel,
    String functionName,
    VoltronArray array, {
    Promise? promise,
  }) {
    if (viewModel == null) {
      return;
    }

    if (functionName == kFuncSetPage) {
      int? selected = array.get<int>(0);
      if (selected != null && selected >= 0 && selected < viewModel.children.length) {
        viewModel.pageController?.animateToPage(
          selected,
          duration: const Duration(milliseconds: 300),
          curve: Curves.linearToEaseOut,
        );
      }
    } else if (functionName == kFuncSetPageWidthOutAnim) {
      int? selected = array.get<int>(0);
      if (selected != null && selected >= 0 && selected < viewModel.children.length) {
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
      id: node.id,
      instanceId: node.rootId,
      className: node.name,
      context: context,
    );
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
