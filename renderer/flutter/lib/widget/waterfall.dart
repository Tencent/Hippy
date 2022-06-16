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
import 'package:provider/provider.dart';
import 'package:waterfall_flow/waterfall_flow.dart';

import '../viewmodel.dart';
import '../widget.dart';

class WaterfallWidget extends FRStatefulWidget {
  final WaterfallViewModel _viewModel;

  WaterfallWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _WaterfallWidgetState();
  }
}

class _WaterfallWidgetState extends FRState<WaterfallWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<WaterfallViewModel, WaterfallViewModel>(
        selector: (context, viewModel) {
          return WaterfallViewModel.copy(
            viewModel.id,
            viewModel.rootId,
            viewModel.name,
            viewModel.context,
            viewModel,
          );
        },
        builder: (context, viewModel, child) {
          return PositionWidget(
            viewModel,
            child: _waterfall(viewModel),
          );
        },
      ),
    );
  }

  Widget generateWaterfallFlow(WaterfallViewModel viewModel) {
    Widget waterfallFlow = SliverWaterfallFlow(
      gridDelegate: SliverWaterfallFlowDelegateWithFixedCrossAxisCount(
        crossAxisCount: viewModel.numberOfColumns,
        mainAxisSpacing: viewModel.interItemSpacing,
        crossAxisSpacing: viewModel.columnSpacing,
      ),
      delegate: SliverChildBuilderDelegate(
        (c, index) {
          var child = viewModel.realItemList[index];
          return ClipRRect(
            clipBehavior: Clip.hardEdge,
            child: generateByViewModel(context, child),
          );
        },
        childCount: viewModel.realItemList.length,
      ),
    );
    var contentInset = viewModel.contentInset;
    if (contentInset != null) {
      waterfallFlow = SliverPadding(
        padding: contentInset,
        sliver: waterfallFlow,
      );
    }
    return waterfallFlow;
  }

  Widget _waterfall(WaterfallViewModel viewModel) {
    var slivers = <Widget>[];
    var containBannerView = viewModel.containBannerView;
    var bannerViewModel = viewModel.bannerViewModel;
    if (containBannerView && bannerViewModel != null) {
      slivers.add(SliverToBoxAdapter(
        child: generateByViewModel(context, bannerViewModel),
      ));
    }
    var waterfallFlow = generateWaterfallFlow(viewModel);
    slivers.add(waterfallFlow);
    Widget waterfall = CustomScrollView(
      slivers: slivers,
    );
    var delegate = viewModel.refreshWrapper;
    if (delegate != null) {
      waterfall = delegate(
        context: context,
        child: waterfall,
        footerModel: viewModel.footerViewModel,
      );
    }
    waterfall = ScrollNotificationListener(
      child: waterfall,
      viewModel: viewModel,
      scrollGestureDispatcher: viewModel.scrollGestureDispatcher,
    );
    return waterfall;
  }
}
