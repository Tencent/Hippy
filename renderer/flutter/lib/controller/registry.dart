import 'dart:collection';

import '../render/controller.dart';
import '../render/node.dart';
import '../render/tree.dart';

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
