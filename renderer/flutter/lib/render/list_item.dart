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

import '../common.dart';
import '../controller.dart';
import '../style.dart';
import 'node.dart';
import 'tree.dart';

class ListItemRenderNode extends RenderNode {
  bool? _shouldSticky;

  bool get shouldSticky => _shouldSticky ?? false;

  ListItemRenderNode(
      int id,
      String className,
      RenderTree root,
      ControllerManager controllerManager,
      VoltronMap? propsToUpdate,
      bool isLazy)
      : super(id, className, root, controllerManager, propsToUpdate, isLazy) {
    _updateShouldSticky();
  }

  @override
  void updateNode(VoltronMap map) {
    super.updateNode(map);
    _updateShouldSticky();
  }

  void _updateShouldSticky() {
    _shouldSticky = props?.get(NodeProps.kItemSticky) ?? false;
  }
}
