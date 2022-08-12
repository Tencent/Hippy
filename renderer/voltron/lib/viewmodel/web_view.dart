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

import 'package:webview_flutter/webview_flutter.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import 'group.dart';

class WebViewModel extends GroupViewModel {
  String src = '';
  String? userAgent;
  String method = 'get';
  bool onLoadStartEnable = false;
  bool onErrorEnable = false;
  bool onLoadEndEnable = false;
  bool onLoadEnable = false;

  bool onLoadFileFlag = false;

  WebViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context);

  WebViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    WebViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel) {
    src = viewModel.src;
    onLoadStartEnable = viewModel.onLoadStartEnable;
    onLoadEndEnable = viewModel.onLoadEndEnable;
    onErrorEnable = viewModel.onErrorEnable;
    onLoadEnable = viewModel.onLoadEnable;
  }

  @override
  bool operator ==(Object other) {
    return other is WebViewModel &&
        src == other.src &&
        onLoadStartEnable == other.onLoadStartEnable &&
        onLoadEndEnable == other.onLoadEndEnable &&
        onErrorEnable == other.onErrorEnable &&
        onLoadEnable == other.onLoadEnable &&
        super == (other);
  }

  @override
  int get hashCode =>
      super.hashCode |
      src.hashCode |
      onLoadStartEnable.hashCode |
      onLoadEndEnable.hashCode |
      onErrorEnable.hashCode |
      onLoadEnable.hashCode;

  void sendEvent(String eventName, VoltronMap params) {
    context.eventHandler.receiveUIComponentEvent(id, eventName, params);
  }

  void onLoadStart(String url) {
    var params = VoltronMap();
    params.push('url', url);
    sendEvent(WebViewViewController.kOnLoadStart, VoltronMap());
  }

  void onLoad() {
    if (onLoadFileFlag) return;
    var params = VoltronMap();
    params.push('url', src);
    sendEvent(WebViewViewController.kOnLoad, params);
  }

  void onLoadEnd(String url) {
    var params = VoltronMap();
    params.push('success', true);
    params.push('url', url);
    sendEvent(WebViewViewController.kOnLoadEnd, params);
  }

  void onLoadError(WebResourceError error) {
    if (Platform.isIOS) {
      var params = VoltronMap();
      params.push('success', false);
      sendEvent(WebViewViewController.kOnLoadEnd, params);
    }
    var params = VoltronMap();
    params.push('errorCode', error.errorCode);
    params.push('error', error.description);
    sendEvent(WebViewViewController.kOnError, params);
  }
}
