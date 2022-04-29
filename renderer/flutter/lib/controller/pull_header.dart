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

class ListPullHeaderViewController extends BaseGroupController<ListPullHeaderViewModel> {
  static const String kClassName = "PullHeaderView";

  static const String collapsePullHeader = "collapsePullHeader";
  static const String expandPullHeader = "expandPullHeader";

  static const String onHeaderReleased = 'onHeaderReleased';
  static const String onHeaderPulling = 'onHeaderPulling';

  @override
  ListPullHeaderViewModel createRenderViewModel(RenderNode node, RenderContext context) {
    return ListPullHeaderViewModel(
      node.id,
      node.rootId,
      node.name,
      context,
    );
  }

  @override
  Widget createWidget(
    BuildContext context,
    ListPullHeaderViewModel viewModel,
  ) {
    return ListPullHeaderWidget(viewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};

  @override
  String get name => kClassName;

  @override
  void dispatchFunction(ListPullHeaderViewModel viewModel, String functionName, VoltronArray array,
      {Promise? promise}) {
    if (collapsePullHeader == functionName) {
      var listViewModel = viewModel.parent;
      if (listViewModel is ListViewModel) {
        listViewModel.refreshEventDispatcher.refreshComplected();
      }
    }
  }
}
