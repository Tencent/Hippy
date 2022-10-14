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
import 'package:provider/provider.dart';

import '../viewmodel.dart';
import '../util.dart';
import '../widget.dart';

class ListItemWidget extends FRStatefulWidget {
  final ListItemViewModel _viewModel;

  ListItemWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return _ListItemWidgetState();
  }
}

class _ListItemWidgetState extends FRState<ListItemWidget> {
  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build list item widget",
    );
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<ListItemViewModel, ListItemViewModel>(
        selector: (context, itemViewModel) {
          var parentViewModel = itemViewModel.parent;
          if (parentViewModel is ListViewModel) {}
          return ListItemViewModel.copy(
            itemViewModel.id,
            itemViewModel.rootId,
            itemViewModel.name,
            itemViewModel.shouldSticky,
            itemViewModel.context,
            itemViewModel,
          );
        },
        builder: (context, model, oldWidget) {
          return _boxContent();
        },
      ),
    );
  }

  Widget _boxContent() {
    return Consumer<ListItemViewModel>(
      builder: (context, viewModel, child) {
        return BoxWidget(
          viewModel,
          child: Selector<ListItemViewModel, DivContainerViewModel>(
            selector: (context, viewModel) => DivContainerViewModel(viewModel),
            builder: (context, viewModel, _) {
              LogUtils.dWidget(
                "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build list item inner widget",
              );
              return DivContainerWidget(viewModel);
            },
          ),
        );
      },
    );
  }
}
