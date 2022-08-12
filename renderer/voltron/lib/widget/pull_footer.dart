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

import '../viewmodel.dart';
import 'base.dart';
import 'div.dart';

class ListPullFooterWidget extends FRStatefulWidget {
  final ListPullFooterViewModel _viewModel;

  ListPullFooterWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ListPullFooterWidgetState();
  }
}

class _ListPullFooterWidgetState extends FRState<ListPullFooterWidget> {
  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ListPullFooterViewModel, ListPullFooterViewModel>(
        selector: (context, itemViewModel) {
          return ListPullFooterViewModel.copy(
            itemViewModel.id,
            itemViewModel.rootId,
            itemViewModel.name,
            itemViewModel.context,
            itemViewModel,
          );
        },
        builder: (context, viewModel, child) {
          return BoxWidget(
            viewModel,
            child: Selector0<DivContainerViewModel>(
              selector: (context) => DivContainerViewModel(viewModel),
              builder: (context, viewModel, _) => DivContainerWidget(viewModel),
            ),
          );
        },
      ),
    );
  }
}
