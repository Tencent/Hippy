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

import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class WebViewViewWidget extends FRStatefulWidget {
  final WebViewViewModel _viewModel;

  WebViewViewWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return WebViewWidgetState();
  }
}

class WebViewWidgetState extends FRState<WebViewViewWidget> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build web view widget",
    );
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<WebViewViewModel, WebViewViewModel>(
        selector: (context, viewModel) {
          return WebViewViewModel.copy(
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
            child: _webWidget(viewModel),
          );
        },
      ),
    );
  }

  Widget _webWidget(WebViewViewModel viewModel) {
    LogUtils.dWidget(
      "ID:${widget._viewModel.id}, node:${widget._viewModel.idDesc}, build web view inner widget",
    );
    return WebViewWidget(
      controller: widget._viewModel.controller,
    );
  }
}
