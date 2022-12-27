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

class WaterfallViewController extends BaseGroupController<WaterfallViewModel> {
  static const String kClassName = "WaterfallView";

  /// 3.0 bind events
  static const String kEventOnScroll = "scroll";
  static const String kEventOnMomentumScrollBegin = "momentumscrollbegin";
  static const String kEventOnMomentumScrollEnd = "momentumscrollend";
  static const String kEventOnScrollBeginDrag = "scrollbegindrag";
  static const String kEventOnScrollEndDrag = "scrollenddrag";
  static const String kEventOnEndReached = "endreached";

  @override
  WaterfallViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return WaterfallViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(BuildContext context, WaterfallViewModel viewModel) {
    return WaterfallWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {
        NodeProps.numberOfColumns: ControllerMethodProp(setNumberOfColumns, 1),
        NodeProps.numberOfItems: ControllerMethodProp(setNumberOfItems, 0),
        NodeProps.columnSpacing: ControllerMethodProp(setColumnSpacing, 0.0),
        NodeProps.interItemSpacing: ControllerMethodProp(setInterItemSpacing, 0.0),
        NodeProps.contentInset: ControllerMethodProp(setContentInset, null),
        NodeProps.containBannerView: ControllerMethodProp(setContainBannerView, false),
        NodeProps.containPullFooter: ControllerMethodProp(setContainPullFooter, false),
      };

  @ControllerProps(NodeProps.numberOfColumns)
  void setNumberOfColumns(WaterfallViewModel renderViewModel, int numberOfColumns) {
    renderViewModel.numberOfColumns = numberOfColumns;
  }

  @ControllerProps(NodeProps.numberOfItems)
  void setNumberOfItems(WaterfallViewModel renderViewModel, int numberOfItems) {
    renderViewModel.numberOfItems = numberOfItems;
  }

  @ControllerProps(NodeProps.columnSpacing)
  void setColumnSpacing(WaterfallViewModel renderViewModel, double columnSpacing) {
    renderViewModel.columnSpacing = columnSpacing;
  }

  @ControllerProps(NodeProps.interItemSpacing)
  void setInterItemSpacing(WaterfallViewModel renderViewModel, double interItemSpacing) {
    renderViewModel.interItemSpacing = interItemSpacing;
  }

  @ControllerProps(NodeProps.contentInset)
  void setContentInset(WaterfallViewModel renderViewModel, VoltronMap? contentInset) {
    if (contentInset != null) {
      var top = contentInset.get<double>('top');
      var right = contentInset.get<double>('right');
      var bottom = contentInset.get<double>('bottom');
      var left = contentInset.get<double>('left');
      if (top != null || right != null || bottom != null || left != null) {
        renderViewModel.contentInset = EdgeInsets.only(
          top: top ?? 0.0,
          right: right ?? 0.0,
          bottom: bottom ?? 0.0,
          left: left ?? 0.0,
        );
      }
    }
  }

  @ControllerProps(NodeProps.containBannerView)
  void setContainBannerView(WaterfallViewModel renderViewModel, bool containBannerView) {
    renderViewModel.containBannerView = containBannerView;
  }

  @ControllerProps(NodeProps.containPullFooter)
  void setContainPullFooter(WaterfallViewModel renderViewModel, bool containPullFooter) {
    renderViewModel.containPullFooter = containPullFooter;
  }

  /// 2.0 bind events
  @ControllerProps(NodeProps.kOnScrollBeginDrag)
  void setScrollBeginDragEventEnable(WaterfallViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollBeginDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEndDrag)
  void setScrollEndDragEventEnable(WaterfallViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEndDragEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollBegin)
  void setMomentumScrollBeginEventEnable(WaterfallViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollBeginEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnMomentumScrollEnd)
  void setMomentumScrollEndEventEnable(WaterfallViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.momentumScrollEndEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnScrollEnable)
  void setScrollEventEnable(WaterfallViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.scrollEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnEndReached)
  void setOnEndReached(WaterfallViewModel renderViewModel, bool flag) {
    renderViewModel.scrollGestureDispatcher.endReachedEventEnable = true;
  }

  @override
  void updateEvents(
    WaterfallViewModel renderViewModel,
    Set<EventHolder> holders,
  ) {
    super.updateEvents(renderViewModel, holders);
    if (holders.isNotEmpty) {
      for (var holder in holders) {
        switch (holder.eventName) {
          case kEventOnScroll:
            setScrollEventEnable(renderViewModel, holder.isAdd);
            break;
          case kEventOnScrollBeginDrag:
            setScrollBeginDragEventEnable(renderViewModel, holder.isAdd);
            break;
          case kEventOnScrollEndDrag:
            setScrollEndDragEventEnable(renderViewModel, holder.isAdd);
            break;
          case kEventOnMomentumScrollBegin:
            setMomentumScrollBeginEventEnable(renderViewModel, holder.isAdd);
            break;
          case kEventOnMomentumScrollEnd:
            setMomentumScrollEndEventEnable(renderViewModel, holder.isAdd);
            break;
          case kEventOnEndReached:
            setOnEndReached(renderViewModel, holder.isAdd);
            break;
        }
      }
    }
  }

  @override
  String get name => kClassName;
}
