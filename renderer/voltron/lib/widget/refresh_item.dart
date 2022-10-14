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
import 'package:provider/provider.dart';

import '../viewmodel.dart';
import '../util.dart';
import '../widget.dart';

class RefreshWrapperItemWidget extends FRStatefulWidget {
  final RefreshWrapperItemRenderViewModel _viewModel;

  RefreshWrapperItemWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _RefreshWrapperItemWidgetState();
  }
}

class _RefreshWrapperItemWidgetState extends FRState<RefreshWrapperItemWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build refresh item widget",
    );
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: _boxContent(),
    );
  }

  Widget _boxContent() {
    return Consumer<RefreshWrapperItemRenderViewModel>(
      builder: (context, viewModel, _) {
        return BoxWidget(
          viewModel,
          child: Selector<RefreshWrapperItemRenderViewModel, DivContainerViewModel>(
            selector: (context, viewModel) => DivContainerViewModel(viewModel),
            builder: (context, viewModel, _) {
              LogUtils.dWidget(
                "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build refresh item inner widget",
              );
              return DivContainerWidget(viewModel);
            },
          ),
        );
      },
    );
  }
}
