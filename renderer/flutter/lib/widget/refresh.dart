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

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:pull_to_refresh/pull_to_refresh.dart';

import '../controller.dart';
import '../viewmodel.dart';
import 'base.dart';
import 'div.dart';

class RefreshWrapperWidget extends FRStatefulWidget {
  final RefreshWrapperRenderViewModel _viewModel;

  RefreshWrapperWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _RefreshWrapperWidgetState();
  }
}

class _RefreshWrapperWidgetState extends FRState<RefreshWrapperWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<RefreshWrapperRenderViewModel, RefreshWrapperRenderViewModel>(
        selector: (context, viewModel) {
          return RefreshWrapperRenderViewModel.copy(
            viewModel.id,
            viewModel.rootId,
            viewModel.name,
            viewModel.context,
            viewModel,
          );
        },
        builder: (context, viewModel, _) {
          return PositionWidget(
            viewModel,
            child: Selector0<RefreshWrapperRenderContentViewModel>(
              selector: (context) => viewModel.refreshWrapperRenderContentViewModel,
              builder: (context, viewModel, _) => refreshWrapper(viewModel),
            ),
          );
        },
      ),
    );
  }

  Widget refreshWrapper(RefreshWrapperRenderContentViewModel viewModel) {
    var content = viewModel.content;
    if (content == null) {
      return Container();
    }

    var headerModel = viewModel.header;
    Widget? header;
    if (headerModel != null) {
      header = generateByViewModel(context, headerModel);
    }
    var listChild = content;
    listChild.pushExtraInfo(RefreshWrapperController.kWrapperKey, ({
      required context,
      required child,
      footerModel,
    }) {
      Widget? footer;
      if (footerModel != null) {
        footer = generateByViewModel(context, footerModel);
      }
      return RefreshConfiguration(
        headerTriggerDistance: headerModel?.height ?? 0,
        footerTriggerDistance: footerModel?.height ?? 0,
        child: SmartRefresher(
          enablePullDown: true,
          enablePullUp: footerModel != null,
          controller: viewModel.dispatcher.refreshController,
          onRefresh: () {
            viewModel.dispatcher.startRefresh();
          },
          header: header == null
              ? null
              : CustomHeader(
                  height: headerModel?.height ?? 0,
                  builder: (context, status) => header!,
                ),
          footer: footer == null
              ? null
              : CustomFooter(
                  height: footerModel?.height ?? 0,
                  builder: (context, status) => footer!,
                  loadStyle: LoadStyle.HideAlways,
                ),
          onLoading: () {
            viewModel.dispatcher.loadingCompleted();
          },
          child: child,
        ),
      );
    });
    var list = generateByViewModel(context, listChild);
    var stack = Stack(
      children: [list],
    );
    return stack;
  }
}
