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
import 'dart:ui';

import 'package:webview_flutter/webview_flutter.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import 'group.dart';

class WebViewViewModel extends GroupViewModel {
  String tempUrl = '';
  String? tempUserAgent;
  String method = 'get';
  bool onLoadStartEventEnable = false;
  bool onErrorEventEnable = false;
  bool onLoadEndEventEnable = false;
  bool onLoadEventEnable = false;
  bool isNotifyLoad = false;

  set src(String url) {
    if (tempUrl != url) {
      controller.loadRequest(Uri.parse(url));
      tempUrl = url;
    }
  }

  String get src {
    return tempUrl;
  }

  set userAgent(String? userAgent) {
    if (tempUserAgent != userAgent) {
      controller.setUserAgent(userAgent);
      tempUserAgent = userAgent;
    }
  }

  String? get userAgent {
    return tempUserAgent;
  }

  late WebViewController controller;

  WebViewViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
  ) : super(id, instanceId, className, context) {
    controller = createWebViewController();
  }

  WebViewViewModel.copy(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    WebViewViewModel viewModel,
  ) : super.copy(id, instanceId, className, context, viewModel) {
    tempUrl = viewModel.tempUrl;
    tempUserAgent = viewModel.tempUserAgent;
    controller = viewModel.controller;
    onLoadStartEventEnable = viewModel.onLoadStartEventEnable;
    onLoadEndEventEnable = viewModel.onLoadEndEventEnable;
    onErrorEventEnable = viewModel.onErrorEventEnable;
    onLoadEventEnable = viewModel.onLoadEventEnable;
  }

  @override
  bool operator ==(Object other) {
    return other is WebViewViewModel &&
        tempUrl == other.tempUrl &&
        tempUserAgent == other.tempUserAgent &&
        controller == other.controller &&
        onLoadStartEventEnable == other.onLoadStartEventEnable &&
        onLoadEndEventEnable == other.onLoadEndEventEnable &&
        onErrorEventEnable == other.onErrorEventEnable &&
        onLoadEventEnable == other.onLoadEventEnable &&
        super == (other);
  }

  @override
  int get hashCode =>
      super.hashCode |
      tempUrl.hashCode |
      tempUserAgent.hashCode |
      controller.hashCode |
      onLoadStartEventEnable.hashCode |
      onLoadEndEventEnable.hashCode |
      onErrorEventEnable.hashCode |
      onLoadEventEnable.hashCode;

  WebViewController createWebViewController() {
    return WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..setNavigationDelegate(
        NavigationDelegate(
          onProgress: (int progress) {
            if (!isNotifyLoad) {
              isNotifyLoad = true;
              onLoad(src);
            }
            // Update loading bar.
          },
          onPageStarted: onLoadStart,
          onPageFinished: (String url) {
            onLoadEnd(url, true, '');
          },
          onWebResourceError: (WebResourceError error) {
            var isForMainFrame = error.isForMainFrame ?? false;
            if (isForMainFrame) {
              onLoadEnd(src, true, '');
              onLoadError(error);
            }
          },
        ),
      );
  }

  void sendEvent(String eventName, VoltronMap params) {
    context.renderBridgeManager.sendComponentEvent(rootId, id, eventName, params);
  }

  void onLoadStart(String url) {
    isNotifyLoad = false;
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
    var params = VoltronMap();
    params.push('errorCode', error.errorCode);
    params.push('error', error.description);
    sendEvent(WebViewViewController.kEventOnError, params);
  }
}
