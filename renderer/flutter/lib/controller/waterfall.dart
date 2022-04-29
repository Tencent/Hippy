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

class WaterfallViewController extends BaseViewController<WaterfallViewModel> {
  static const String kClassName = "WaterfallView";

  static const String numberOfColumns = "numberOfColumns";
  static const String numberOfItems = "numberOfItems";
  static const String columnSpacing = "columnSpacing";
  static const String interItemSpacing = "interItemSpacing";
  static const String contentInset = "contentInset";
  static const String preloadItemNumber = "preloadItemNumber";
  static const String onEndReached = "onEndReached";
  static const String containBannerView = "containBannerView";
  static const String containPullHeader = "containPullHeader";
  static const String containPullFooter = "containPullFooter";

  @override
  WaterfallViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return WaterfallViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(BuildContext context, WaterfallViewModel viewModel) {
    return WaterfallWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[numberOfColumns] = ControllerMethodProp(setNumberOfColumns, 1);
    extraMap[numberOfItems] = ControllerMethodProp(setNumberOfItems, 0);
    extraMap[columnSpacing] = ControllerMethodProp(setColumnSpacing, 0.0);
    extraMap[interItemSpacing] = ControllerMethodProp(setInterItemSpacing, 0.0);
    extraMap[contentInset] = ControllerMethodProp(setContentInset, null);
    extraMap[containBannerView] = ControllerMethodProp(setContainBannerView, false);
    extraMap[containPullFooter] = ControllerMethodProp(setContainPullFooter, false);
    return extraMap;
  }

  @ControllerProps(numberOfColumns)
  void setNumberOfColumns(WaterfallViewModel renderViewModel, int numberOfColumns) {
    renderViewModel.numberOfColumns = numberOfColumns;
  }

  @ControllerProps(numberOfItems)
  void setNumberOfItems(WaterfallViewModel renderViewModel, int numberOfItems) {
    renderViewModel.numberOfItems = numberOfItems;
  }

  @ControllerProps(columnSpacing)
  void setColumnSpacing(WaterfallViewModel renderViewModel, double columnSpacing) {
    renderViewModel.columnSpacing = columnSpacing;
  }

  @ControllerProps(interItemSpacing)
  void setInterItemSpacing(WaterfallViewModel renderViewModel, double interItemSpacing) {
    renderViewModel.interItemSpacing = interItemSpacing;
  }

  @ControllerProps(contentInset)
  void setContentInset(WaterfallViewModel renderViewModel, VoltronMap contentInset) {
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

  @ControllerProps(containBannerView)
  void setContainBannerView(WaterfallViewModel renderViewModel, bool containBannerView) {
    renderViewModel.containBannerView = containBannerView;
  }

  @ControllerProps(containPullFooter)
  void setContainPullFooter(WaterfallViewModel renderViewModel, bool containPullFooter) {
    renderViewModel.containPullFooter = containPullFooter;
  }

  @override
  String get name => kClassName;
}
