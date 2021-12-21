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
