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

import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class WebViewViewController extends BaseViewController<WebViewModel> {
  static const String kClassName = "WebView";

  static const String kUserAgent = "userAgent";
  static const String kMethod = "method";
  static const String kOnLoad = "onLoad";
  static const String kOnLoadStart = "onLoadStart";
  static const String kOnLoadEnd = "onLoadEnd";
  static const String kOnError = "onError";

  @override
  WebViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return WebViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(BuildContext context, WebViewModel viewModel) {
    return WebViewWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.kSource] = ControllerMethodProp(setSource, null);
    extraMap[kUserAgent] = ControllerMethodProp(setUserAgent, '');
    extraMap[kMethod] = ControllerMethodProp(setMethod, '');
    extraMap[kOnLoad] = ControllerMethodProp(setOnLoad, false);
    extraMap[kOnLoadStart] = ControllerMethodProp(setOnLoadStart, false);
    extraMap[kOnLoadEnd] = ControllerMethodProp(setOnLoadEnd, false);
    extraMap[kOnError] = ControllerMethodProp(setOnError, false);

    return extraMap;
  }

  @ControllerProps(NodeProps.kSource)
  void setSource(WebViewModel renderViewModel, VoltronMap source) {
    String src = source.get('uri');
    if (src != renderViewModel.src) {
      renderViewModel.src = src;
    }
  }

  @ControllerProps(kUserAgent)
  void setUserAgent(WebViewModel renderViewModel, String ua) {
    if (ua != renderViewModel.userAgent) {
      renderViewModel.userAgent = ua;
    }
  }

  @ControllerProps(kMethod)
  void setMethod(WebViewModel renderViewModel, String method) {
    renderViewModel.method = method;
  }

  @ControllerProps(kOnLoadStart)
  void setOnLoadStart(WebViewModel renderViewModel, bool flag) {
    renderViewModel.onLoadStartEnable = flag;
  }

  @ControllerProps(kOnError)
  void setOnError(WebViewModel renderViewModel, bool flag) {
    renderViewModel.onErrorEnable = flag;
  }

  @ControllerProps(kOnLoadEnd)
  void setOnLoadEnd(WebViewModel renderViewModel, bool flag) {
    renderViewModel.onLoadEndEnable = flag;
  }

  @ControllerProps(kOnLoad)
  void setOnLoad(WebViewModel renderViewModel, bool flag) {
    renderViewModel.onLoadEnable = flag;
  }

  @override
  String get name => kClassName;
}
