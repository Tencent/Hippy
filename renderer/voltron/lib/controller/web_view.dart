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
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class WebViewViewController extends BaseViewController<WebViewViewModel> {
  static const String kClassName = "WebView";

  // 兼容3.0新事件绑定方式
  static const String kEventOnLoad = "load";
  static const String kEventOnLoadStart = "loadstart";
  static const String kEventOnLoadEnd = "loadend";
  static const String kEventOnError = "error";

  @override
  WebViewViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return WebViewViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(BuildContext context, WebViewViewModel viewModel) {
    return WebViewViewWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.kSource] = ControllerMethodProp(setSource, null);
    extraMap[NodeProps.kUserAgent] = ControllerMethodProp(setUserAgent, '');
    extraMap[NodeProps.kMethod] = ControllerMethodProp(setMethod, '');
    extraMap[NodeProps.kOnLoad] = ControllerMethodProp(setOnLoad, true);
    extraMap[NodeProps.kOnLoadStart] = ControllerMethodProp(setOnLoadStart, true);
    extraMap[NodeProps.kOnLoadEnd] = ControllerMethodProp(setOnLoadEnd, true);
    extraMap[NodeProps.kOnError] = ControllerMethodProp(setOnError, true);

    return extraMap;
  }

  @ControllerProps(NodeProps.kSource)
  void setSource(WebViewViewModel renderViewModel, VoltronMap? source) {
    String? src = source?.get<String>('uri');
    if (src != null && src != renderViewModel.src) {
      renderViewModel.src = src;
    }
  }

  @ControllerProps(NodeProps.kUserAgent)
  void setUserAgent(WebViewViewModel renderViewModel, String ua) {
    if (ua != renderViewModel.userAgent) {
      renderViewModel.userAgent = ua;
    }
  }

  @ControllerProps(NodeProps.kMethod)
  void setMethod(WebViewViewModel renderViewModel, String method) {
    renderViewModel.method = method;
  }

  @ControllerProps(NodeProps.kOnLoadStart)
  void setOnLoadStart(WebViewViewModel renderViewModel, bool flag) {
    renderViewModel.onLoadStartEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnError)
  void setOnError(WebViewViewModel renderViewModel, bool flag) {
    renderViewModel.onErrorEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnLoadEnd)
  void setOnLoadEnd(WebViewViewModel renderViewModel, bool flag) {
    renderViewModel.onLoadEndEventEnable = flag;
  }

  @ControllerProps(NodeProps.kOnLoad)
  void setOnLoad(WebViewViewModel renderViewModel, bool flag) {
    renderViewModel.onLoadEventEnable = flag;
  }

  @override
  void updateEvents(
    WebViewViewModel renderViewModel,
    Set<EventHolder> holders,
  ) {
    super.updateEvents(renderViewModel, holders);
    if (holders.isNotEmpty) {
      for (var holder in holders) {
        switch (holder.eventName) {
          case kEventOnLoad:
            setOnLoad(renderViewModel, holder.isAdd);
            break;
          case kEventOnLoadStart:
            setOnLoadStart(renderViewModel, holder.isAdd);
            break;
          case kEventOnLoadEnd:
            setOnLoadEnd(renderViewModel, holder.isAdd);
            break;
          case kEventOnError:
            setOnError(renderViewModel, holder.isAdd);
            break;
        }
      }
    }
  }

  @override
  String get name => kClassName;
}
