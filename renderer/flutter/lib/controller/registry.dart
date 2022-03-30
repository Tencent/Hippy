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

import '../render.dart';
import 'controller.dart';

class ControllerRegistry {
  final HashMap<int, RenderTree> _renderTree = HashMap();
  final HashMap<String, ControllerHolder> _controllers = HashMap();

  ControllerRegistry();

  void addControllerHolder(String name, ControllerHolder holder) {
    _controllers[name] = holder;
  }

  ControllerHolder? getControllerHolder(String name) {
    return _controllers[name];
  }

  VoltronViewController? getViewController(String name) {
    return _controllers[name]?.viewController;
  }

  RenderTree? getRenderTree(int rootId) {
    return _renderTree[rootId];
  }

  void forEachRenderTree(void func(int key, RenderTree value)) {
    if (_renderTree.isNotEmpty) {
      final entryPtr = _renderTree.entries.iterator;
      if (entryPtr.moveNext()) {
        func(entryPtr.current.key, entryPtr.current.value);
      }
    }
  }

  int get rootCount => _renderTree.length;

  RenderNode? getRenderNode(int rootId, int nodeId) {
    return getRenderTree(rootId)?.getRenderNode(nodeId);
  }

  // ignore: avoid_returning_this
  ControllerRegistry addRenderTree(RenderTree renderTree) {
    if (!_renderTree.containsKey(renderTree.id)) {
      _renderTree[renderTree.id] = renderTree;
    }
    return this;
  }

  // ignore: avoid_returning_this
  ControllerRegistry removeRenderNode(int instanceId, int id) {
    _renderTree[instanceId]?.removeNodeById(id);
    return this;
  }

  // ignore: avoid_returning_this
  ControllerRegistry removeRenderTree(RenderTree tree) {
    _renderTree.remove(tree.id);
    return this;
  }
}

class ControllerHolder {
  final VoltronViewController viewController;
  final bool isLazy;

  const ControllerHolder(this.viewController, this.isLazy);
}
