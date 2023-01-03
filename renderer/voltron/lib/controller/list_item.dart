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

import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../render.dart';
import '../viewmodel.dart';
import '../widget.dart';

class ListItemViewController extends GroupController<ListItemViewModel, ListItemRenderNode> {
  static const String kClassName = "ListViewItem";

  static const String kEventOnAppear = "appear";
  static const String kEventOnDisAppear = "disappear";
  static const String kEventOnWillAppear = "willappear";
  static const String kEventOnWillDisAppear = "willdisappear";

  @override
  Widget createWidget(BuildContext context, ListItemViewModel viewModel) {
    return ListItemWidget(viewModel);
  }

  @override
  ListItemViewModel createRenderViewModel(
    ListItemRenderNode node,
    RenderContext context,
  ) {
    return ListItemViewModel(
      node.id,
      node.rootId,
      node.name,
      node.shouldSticky,
      context,
    );
  }

  @override
  String get name => kClassName;

  @override
  ListItemRenderNode createRenderNode(
    int id,
    VoltronMap? props,
    String name,
    RenderTree tree,
    ControllerManager controllerManager,
    bool lazy,
  ) {
    return ListItemRenderNode(
      id,
      name,
      tree,
      controllerManager,
      props,
      lazy,
    );
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};

  @override
  void updateEvents(
    ListItemViewModel renderViewModel,
    Set<EventHolder> holders,
  ) {
    super.updateEvents(renderViewModel, holders);
    if (holders.isNotEmpty) {
      var pv = renderViewModel.parent;
      if (pv is ListViewModel) {
        for (var holder in holders) {
          switch (holder.eventName) {
            case kEventOnAppear:
              if (holder.isAdd) {
                pv.scrollGestureDispatcher.appearEventEnableIdList.add(renderViewModel.id);
              } else {
                pv.scrollGestureDispatcher.appearEventEnableIdList.remove(renderViewModel.id);
              }
              break;
            case kEventOnDisAppear:
              if (holder.isAdd) {
                pv.scrollGestureDispatcher.disAppearEventEnableIdList.add(renderViewModel.id);
              } else {
                pv.scrollGestureDispatcher.disAppearEventEnableIdList.remove(renderViewModel.id);
              }
              break;
            case kEventOnWillAppear:
              if (holder.isAdd) {
                pv.scrollGestureDispatcher.willAppearEventEnableIdList.add(renderViewModel.id);
              } else {
                pv.scrollGestureDispatcher.willAppearEventEnableIdList.remove(renderViewModel.id);
              }
              break;
            case kEventOnWillDisAppear:
              if (holder.isAdd) {
                pv.scrollGestureDispatcher.willDisAppearEventEnableIdList.add(renderViewModel.id);
              } else {
                pv.scrollGestureDispatcher.willDisAppearEventEnableIdList
                    .remove(renderViewModel.id);
              }
              break;
          }
        }
      }
    }
  }
}
