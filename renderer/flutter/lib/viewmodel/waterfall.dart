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
import 'package:collection/collection.dart';
import 'package:flutter/material.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../viewmodel.dart';

class WaterfallViewModel extends ScrollableModel {
  int numberOfColumns = 0;
  int numberOfItems = 0;
  double columnSpacing = 0.0;
  double interItemSpacing = 0.0;
  int preloadItemNumber = 0;
  EdgeInsets? contentInset;

  bool containBannerView = false;
  bool containPullFooter = false;

  bool onLoadFileFlag = false;
  List<WaterfallItemViewModel> realItemList = [];
  RenderViewModel? bannerViewModel;
  RenderViewModel? footerViewModel;

  RefreshWrapperDelegate? get refreshWrapper =>
      getExtraInfo<RefreshWrapperDelegate>(RefreshWrapperController.kWrapperKey);

  WaterfallViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context);

  WaterfallViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    WaterfallViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel) {
    numberOfColumns = viewModel.numberOfColumns;
    numberOfItems = viewModel.numberOfItems;
    columnSpacing = viewModel.columnSpacing;
    interItemSpacing = viewModel.interItemSpacing;
    preloadItemNumber = viewModel.preloadItemNumber;
    contentInset = viewModel.contentInset;
    realItemList = viewModel.children.whereType<WaterfallItemViewModel>().toList();
    var localContainBannerView = viewModel.containBannerView;
    if (localContainBannerView) {
      RenderViewModel? localBannerViewModel;
      try {
        localBannerViewModel =
            viewModel.children.firstWhere((element) => element is DivRenderViewModel);
        containBannerView = viewModel.containBannerView;
        bannerViewModel = localBannerViewModel;
      } catch (err) {
        containBannerView = false;
      }
    }
    var localContainPullFooter = viewModel.containPullFooter;
    var localPullFooterViewModel =
        viewModel.children.whereType<ListPullFooterViewModel>().toList()[0];
    if (localContainPullFooter) {
      footerViewModel = localPullFooterViewModel;
    }
    scrollGestureDispatcher = viewModel.scrollGestureDispatcher;
  }

  @override
  bool get useStackLayout => false;

  @override
  bool operator ==(Object other) {
    return other is WaterfallViewModel &&
        const DeepCollectionEquality().equals(children, other.children) &&
        const DeepCollectionEquality().equals(realItemList, other.realItemList) &&
        numberOfColumns == other.numberOfColumns &&
        numberOfItems == other.numberOfItems &&
        columnSpacing == other.columnSpacing &&
        interItemSpacing == other.interItemSpacing &&
        contentInset == other.contentInset &&
        preloadItemNumber == other.preloadItemNumber &&
        containBannerView == other.containBannerView &&
        containPullFooter == other.containPullFooter &&
        super == (other);
  }

  @override
  int get hashCode =>
      super.hashCode |
      children.hashCode |
      realItemList.hashCode |
      numberOfColumns.hashCode |
      numberOfItems.hashCode |
      columnSpacing.hashCode |
      interItemSpacing.hashCode |
      preloadItemNumber.hashCode |
      containBannerView.hashCode |
      containPullFooter.hashCode |
      contentInset.hashCode;

  void sendEvent(String eventName, VoltronMap params) {
    context.eventHandler.receiveUIComponentEvent(id, eventName, params);
  }
}
