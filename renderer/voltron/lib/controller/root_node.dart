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

import '../controller.dart';
import '../render.dart';
import '../viewmodel.dart';

class RootNodeController extends BaseViewController<RootRenderViewModel> {
  static const String kClassName = 'RootNode';
  static const String kDoFrame = 'frameupdate';

  @override
  String get name => kClassName;

  @override
  RootRenderViewModel createRenderViewModel(
      RenderNode node, RenderContext context) {
    return RootRenderViewModel(
        node.id, node.rootId, node.name, context, context.getInstance(node.id));
  }

  @override
  Widget createWidget(BuildContext context, RenderViewModel viewModel) {
    return Container();
  }

  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    final extraMap = <String, ControllerMethodProp>{};
    return extraMap;
  }

  @override
  void handleExtraEvent(
      RenderViewModel renderViewModel, EventHolder eventHolder) {
    if (eventHolder.eventName == kDoFrame) {
      final id = renderViewModel.id;
      final renderManager = renderViewModel.context.renderManager;
      if (eventHolder.isAdd) {
        renderManager.addAnimationNodeId(id);
      } else {
        renderManager.removeAnimationNodeId(id);
      }
    }
  }
}
