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
import 'package:qr_flutter/qr_flutter.dart';

import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class QrController extends BaseViewController<QrRenderViewModel> {
  static const String kClassName = "QrImage";

  @override
  Widget createWidget(BuildContext context, QrRenderViewModel viewModel) {
    return QrWidget(viewModel);
  }

  @override
  QrRenderViewModel createRenderViewModel(
      RenderNode node, RenderContext context) {
    return QrRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.kText] = ControllerMethodProp(setText, '');
    extraMap[NodeProps.kLevel] =
        ControllerMethodProp(setLevel, QrErrorCorrectLevel.L);
    extraMap[NodeProps.kVersion] =
        ControllerMethodProp(setVersion, QrVersions.auto);

    return extraMap;
  }

  @ControllerProps(NodeProps.kText)
  void setText(QrRenderViewModel viewModel, String text) {
    viewModel.text = text;
  }

  @ControllerProps(NodeProps.kLevel)
  void setLevel(QrRenderViewModel viewModel, String level) {
    switch (level) {
      case 'l':
        viewModel.level = QrErrorCorrectLevel.L;
        break;
      case 'm':
        viewModel.level = QrErrorCorrectLevel.M;
        break;
      case 'q':
        viewModel.level = QrErrorCorrectLevel.Q;
        break;
      case 'h':
        viewModel.level = QrErrorCorrectLevel.H;
        break;
      default:
        viewModel.level = QrErrorCorrectLevel.L;
    }
  }

  @ControllerProps(NodeProps.kVersion)
  void setVersion(QrRenderViewModel viewModel, int version) {
    viewModel.version = version;
  }

  @override
  String get name => kClassName;
}
