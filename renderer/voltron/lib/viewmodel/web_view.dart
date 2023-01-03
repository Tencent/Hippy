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

import 'package:webview_flutter/webview_flutter.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import 'group.dart';

class WebViewModel extends GroupViewModel {
  String src = '';
  String? userAgent;
  String method = 'get';
  bool onLoadStartEventEnable = false;
  bool onErrorEventEnable = false;
  bool onLoadEndEventEnable = false;
  bool onLoadEventEnable = false;

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
    onLoadStartEventEnable = viewModel.onLoadStartEventEnable;
    onLoadEndEventEnable = viewModel.onLoadEndEventEnable;
    onErrorEventEnable = viewModel.onErrorEventEnable;
    onLoadEventEnable = viewModel.onLoadEventEnable;
  }

  @override
  bool operator ==(Object other) {
    return other is WebViewModel &&
        src == other.src &&
        onLoadStartEventEnable == other.onLoadStartEventEnable &&
        onLoadEndEventEnable == other.onLoadEndEventEnable &&
        onErrorEventEnable == other.onErrorEventEnable &&
        onLoadEventEnable == other.onLoadEventEnable &&
        super == (other);
  }

  @override
  int get hashCode =>
      super.hashCode |
      src.hashCode |
      onLoadStartEventEnable.hashCode |
      onLoadEndEventEnable.hashCode |
      onErrorEventEnable.hashCode |
      onLoadEventEnable.hashCode;

  void sendEvent(String eventName, VoltronMap params) {
    context.renderBridgeManager.sendComponentEvent(rootId, id, eventName, params);
  }

  void onLoadStart(String url) {
    var params = VoltronMap();
    params.push('url', url);
    sendEvent(WebViewViewController.kEventOnLoadStart, VoltronMap());
  }

  void onLoad(String url) {
    var params = VoltronMap();
    params.push('url', src);
    sendEvent(WebViewViewController.kEventOnLoad, params);
  }

  void onLoadEnd(String url, bool success, String msg) {
    var params = VoltronMap();
    params.push('success', success);
    params.push('url', url);
    params.push('error', msg);
    sendEvent(WebViewViewController.kEventOnLoadEnd, params);
  }

  void onLoadError(WebResourceError error) {
    if (Platform.isIOS) {
      var params = VoltronMap();
      params.push('url', error.failingUrl);
      params.push('success', false);
      params.push('error', error.toString());
      sendEvent(WebViewViewController.kEventOnLoadEnd, params);
    }
    var params = VoltronMap();
    params.push('errorCode', error.errorCode);
    params.push('error', error.description);
    sendEvent(WebViewViewController.kEventOnError, params);
  }
}
