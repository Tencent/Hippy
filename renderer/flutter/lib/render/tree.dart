import 'dart:collection';

import '../util/log_util.dart';
import '../widget/root.dart';
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
    addNode(rootNode);
  }

  RenderNode? getRenderNode(int nodeId) => _nodeMap[nodeId];

  RenderNode? getRenderViewModel(int nodeId) => _nodeMap[nodeId];

  int get id => _id;

  RenderNode? get rootNode => _rootNode;

  // ignore: avoid_returning_this
  RenderTree addNode(RenderNode node) {
    if (node.id != id && !_hasNotifyViewAdd) {
      _hasNotifyViewAdd = true;
      _rootWidgetViewModel.onViewAdd();
    }
    _nodeMap[node.id] = node;
    LogUtils.dRenderNode(
        "$hashCode render tree add node(${node.id}, ${node.hashCode})");
    return this;
  }

  // ignore: avoid_returning_this
  RenderTree removeNode(RenderNode node) {
    LogUtils.dRenderNode(
        "$hashCode render tree remove node(${node.id}, ${node.hashCode})");
    _nodeMap.remove(node.id);
    return this;
  }

  // ignore: avoid_returning_this
  RenderTree removeNodeById(int id) {
    _nodeMap.remove(id);
    return this;
  }

  // ignore: avoid_returning_this
  RenderTree clear() {
    rootNode?.deleteAllChild();
    _nodeMap.clear();
    return this;
  }
}
