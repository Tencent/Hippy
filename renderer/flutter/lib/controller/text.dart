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

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../style.dart';
import '../viewmodel.dart';
import '../widget.dart';

class TextController
    extends VoltronViewController<TextRenderViewModel, TextRenderNode> {
  static const String kClassName = "Text";

  @override
  TextRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return TextRenderNode(id, name, tree, controllerManager, props);
  }

  @override
  TextRenderViewModel createRenderViewModel(
      TextRenderNode node, RenderContext context) {
    return TextRenderViewModel(node.id, node.rootId, node.name, context);
  }

  @override
  Widget createWidget(
      BuildContext context, TextRenderViewModel viewModel) {
    return TextWidget(viewModel);
  }

  @override
  void applyProps(RenderContext context, TextRenderNode node) {
    node.generateSpan(context);
  }

  @override
  void updateLayout(RenderContext context, TextRenderNode node) {
    node.updateData(context);
    super.updateLayout(context, node);
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.kStyle] = ControllerMethodProp(setStyle, VoltronMap());
    return extraMap;
  }

  @ControllerProps(NodeProps.kStyle)
  void setStyle(TextRenderViewModel renderViewModel, VoltronMap style) {
    var flexDirection = style.get<String>('flexDirection') ?? '';
    if (flexDirection.isNotEmpty) {
      renderViewModel.flexDirection =
          flexCssDirectionFromValue(flexDirection) ?? FlexCSSDirection.row;
    }

    var alignItems = style.get<String>('alignItems') ?? '';
    if (alignItems.isNotEmpty) {
      renderViewModel.alignItems =
          flexAlignFromValue(alignItems) ?? FlexAlign.flexStart;
    }
    var justifyContent = style.get<String>('justifyContent') ?? '';
    if (justifyContent.isNotEmpty) {
      renderViewModel.justifyContent =
          flexAlignFromValue(justifyContent) ?? FlexAlign.flexStart;
    }
  }

  @override
  String get name => kClassName;

  @override
  void updateExtra(TextRenderViewModel renderViewModel, Object updateExtra) {
    if (updateExtra is TextExtra && updateExtra.extra is TextData) {
      renderViewModel.padding = EdgeInsets.only(
          left: updateExtra.leftPadding,
          top: updateExtra.topPadding,
          bottom: updateExtra.bottomPadding,
          right: updateExtra.rightPadding);
      renderViewModel.data = updateExtra.extra as TextData;
      renderViewModel.update();
    }
  }
}
