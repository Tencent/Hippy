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

import 'dart:io';

import 'package:flutter/widgets.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../viewmodel.dart';
import 'base.dart';
import 'div.dart';

class WebViewWidget extends FRStatefulWidget {
  final WebViewModel _viewModel;

  WebViewWidget(this._viewModel) : super(_viewModel);

  @override
  State<StatefulWidget> createState() {
    return WebViewWidgetState();
  }
}

class WebViewWidgetState extends FRState<WebViewWidget> {
  @override
  void initState() {
    super.initState();
    // Enable virtual display.
    if (Platform.isAndroid) WebView.platform = AndroidWebView();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider.value(
      value: widget._viewModel,
      child: Selector<WebViewModel, WebViewModel>(
        selector: (context, viewModel) {
          return WebViewModel.copy(
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

  Widget _webWidget(WebViewModel viewModel) {
    return WebView(
      initialUrl: viewModel.src,
      userAgent: viewModel.userAgent,
      javascriptMode: JavascriptMode.unrestricted,
      onPageStarted: viewModel.onLoadStart,
      onProgress: (progress) {
        viewModel.onLoad();
      },
      onPageFinished: (url) {
        viewModel.onLoadEnd(url);
      },
      onWebResourceError: viewModel.onLoadError,
    );
  }
}
