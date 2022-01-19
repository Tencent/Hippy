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

import 'dart:collection';

import '../util.dart';
import '../widget.dart';
import 'node.dart';

class RenderTree {
  final int _id;
  RenderNode? _rootNode;
  final RootWidgetViewModel _rootWidgetViewModel;

  final HashMap<int, RenderNode> _nodeMap = HashMap();

  bool _hasNotifyViewAdd = false;

  RenderTree(this._id, this._rootWidgetViewModel);

  void init(RenderNode rootNode) {
    _rootNode = rootNode;
    registerNode(rootNode);
  }

  RenderNode? getRenderNode(int nodeId) => _nodeMap[nodeId];

  RenderNode? getRenderViewModel(int nodeId) => _nodeMap[nodeId];

  int get id => _id;

  RenderNode? get rootNode => _rootNode;

  void registerNode(RenderNode node) {
    if (node.id != id && !_hasNotifyViewAdd) {
      _hasNotifyViewAdd = true;
      _rootWidgetViewModel.onViewAdd();
    }
    _nodeMap[node.id] = node;
    LogUtils.dRenderNode(
        "$hashCode render tree add node(${node.id}, ${node.hashCode})");
  }

  void unregisterNode(RenderNode node) {
    LogUtils.dRenderNode(
        "$hashCode render tree remove node(${node.id}, ${node.hashCode})");
    _nodeMap.remove(node.id);
  }

  void removeNodeById(int id) {
    _nodeMap.remove(id);
  }

  void clear() {
    rootNode?.deleteAllChild();
    _nodeMap.clear();
  }
}
