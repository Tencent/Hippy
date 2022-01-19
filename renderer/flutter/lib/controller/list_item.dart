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
import '../viewmodel.dart';
import '../widget.dart';

class ListItemViewController
    extends GroupController<ListItemViewModel, ListItemRenderNode> {
  static const String kClassName = "ListViewItem";

  @override
  Widget createWidget(BuildContext context, ListItemViewModel viewModel) {
    return ListItemWidget(viewModel);
  }

  @override
  ListItemViewModel createRenderViewModel(
      ListItemRenderNode node, RenderContext context) {
    return ListItemViewModel(
        node.id, node.rootId, node.name, node.shouldSticky, context);
  }

  @override
  String get name => kClassName;

  @override
  ListItemRenderNode createRenderNode(int id, VoltronMap? props, String name,
      RenderTree tree, ControllerManager controllerManager, bool lazy) {
    return ListItemRenderNode(id, name, tree, controllerManager, props, lazy);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};
}
