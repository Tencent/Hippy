import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';

import '../common/destroy.dart';
import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../dom/dom_node.dart';
import '../engine/api_provider.dart';
import '../engine/engine_context.dart';
import '../module/promise.dart';
import '../util/log_util.dart';
import '../widget/root.dart';
import 'node.dart';
import 'view_model.dart';

class RenderManager implements Destroyable {
  final List<RenderNode> _uiUpdateNodes = [];
  final List<RenderNode> _nullUiUpdateNodes = [];

  final ControllerManager _controllerManager;

  ControllerManager get controllerManager => _controllerManager;

  RenderManager(EngineContext context, List<APIProvider>? packages)
      : _controllerManager = ControllerManager(context, packages);

  void createRootNode(int instanceId) {
    controllerManager.createRootNode(instanceId);
  }

  void createNode(RootWidgetViewModel rootWidgetViewModel, int id, int pId,
      int childIndex, String name, VoltronMap? props) {
    var parentNode = controllerManager.findNode(rootWidgetViewModel.id, pId);
    var tree = controllerManager.findTree(rootWidgetViewModel.id);
    if (parentNode != null && tree != null) {
      var isLazy = controllerManager.isControllerLazy(name);
      var uiNode = controllerManager.createRenderNode(
          id, props, name, tree, isLazy || parentNode.isLazyLoad);

      LogUtils.dRender(
          "createNode ID:$id pID:$pId index:$childIndex className:$name finish:${uiNode.hashCode}");
      parentNode.addChild(uiNode, childIndex);
      addUpdateNodeIfNeeded(parentNode);
      addUpdateNodeIfNeeded(uiNode);
    } else {
      LogUtils.dRender(
          "createNode error ID:$id pID:$pId index:$childIndex className:$name, tree: ${tree?.id ?? null}, parent: ${parentNode?.id ?? null}");
    }
  }

  void addUpdateNodeIfNeeded(RenderNode? renderNode) {
    if (renderNode != null && !_uiUpdateNodes.contains(renderNode)) {
      _uiUpdateNodes.add(renderNode);
    }
  }

  void addNullUINodeIfNeeded(RenderNode renderNode) {
    if (!_nullUiUpdateNodes.contains(renderNode)) {
      _nullUiUpdateNodes.add(renderNode);
    }
  }

  void updateLayout(
      int instanceId, int id, double x, double y, double w, double h) {
    var uiNode = controllerManager.findNode(instanceId, id);
    LogUtils.dLayout(
        "updateLayout ID:$id, ($x, $y, $w, $h), uiNode:${uiNode?.id}, ${uiNode?.hashCode}");
    if (uiNode != null) {
      uiNode.updateLayout(x, y, w, h);

      addUpdateNodeIfNeeded(uiNode);
    }
  }

  RenderNode? getNode(int? instanceId, int? nodeId) {
    if (instanceId == null || nodeId == null) {
      return null;
    }

    final node = controllerManager.findNode(instanceId, nodeId);
    return node;
  }

  RenderNode? getNodeFirstChild(int? instanceId, int? nodeId) {
    final node = getNode(instanceId, nodeId);
    if (node == null || node.children.isEmpty) {
      return null;
    }

    return node.children[0];
  }

  RenderBox? getRenderBox(int? instanceId, int? nodeId) {
    final node = getNode(instanceId, nodeId);
    final renderBox =
        node?.renderViewModel.currentContext?.findRenderObject() as RenderBox?;

    return renderBox;
  }

  BoundingClientRect? getBoundingClientRect(int? instanceId, int? nodeId) {
    final node = getNode(instanceId, nodeId);
    final boundingClientRect = node?.renderViewModel.boundingClientRect;

    return boundingClientRect;
  }

  void updateNode(int instanceId, int id, VoltronMap map) {
    LogUtils.dRender("update node ID:$id, param:($map)");
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.updateNode(map);
      addUpdateNodeIfNeeded(uiNode);
    }
  }

  void moveNode(int instanceId, List<int> moveIds, int oldPId, int newPId) {
    var parentNode = controllerManager.findNode(instanceId, oldPId);
    var newParent = controllerManager.findNode(instanceId, newPId);
    if (parentNode != null && newParent != null) {
      var arrayList = <RenderNode>[];

      var i = 0;
      for (var moveId in moveIds) {
        var renderNode = controllerManager.findNode(instanceId, moveId);
        if (renderNode != null) {
          LogUtils.dRender(
              "move node ID:$moveId from ${parentNode.id} to ${newParent.id}");
          arrayList.add(renderNode);
          parentNode.removeChild(renderNode, needRemoveChild: false);
          newParent.addChild(renderNode, i);
          i++;
        }
      }

      parentNode.move(arrayList, newParent);
      addUpdateNodeIfNeeded(newParent);
    }
  }

  void updateExtra(int instanceId, int id, Object object) {
    LogUtils.dRender("updateExtra ID:$id");
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.updateExtra(object);

      addUpdateNodeIfNeeded(uiNode);
    }
  }

  void deleteNode(int instanceId, int id) {
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.isDelete = true;

      var parent = uiNode.parent;
      if (parent != null) {
        parent.addDeleteId(id, uiNode);
        addUpdateNodeIfNeeded(parent);
      } else if (uiNode.isRoot) {
        addUpdateNodeIfNeeded(uiNode);
      }
      _deleteSelfFromParent(uiNode);
      LogUtils.dRender("delete node ID:$id finish, ${uiNode.hashCode}");
    } else {
      LogUtils.w("RenderManager", "delete node id:$id error, node not found");
    }
  }

  void _deleteSelfFromParent(RenderNode? node) {
    if (node != null) {
      var childCount = node.childCount;
      for (var i = 0; i < childCount; i++) {
        _deleteSelfFromParent(node.getChildAt(0));
      }
      node.parent?.removeChild(node);
    }
  }

  void dispatchUIFunction(int instanceId, int id, String funcName,
      VoltronArray array, Promise promise) {
    var renderNode = controllerManager.findNode(instanceId, id);
    if (renderNode != null) {
      renderNode.dispatchUIFunction(funcName, array, promise);
      addNullUINodeIfNeeded(renderNode);
    } else {
      LogUtils.e("RenderManager", "dispatchUIFunction Node Null");
    }
  }

  void batch() {
    LogUtils.d("RenderManager", "do batch size: ${_uiUpdateNodes.length}");
    //		mContext.getGlobalConfigs().getLogAdapter().log(TAG,"do batch size " + mShouldUpdateNodes.size());

    for (var renderNode in _uiUpdateNodes) {
      renderNode.createViewModel();
    }

    for (var renderNode in _uiUpdateNodes) {
      renderNode.update();
    }

    for (var renderNode in _uiUpdateNodes) {
      renderNode.batchComplete();
    }

    _uiUpdateNodes.clear();
    // measureInWindow and dispatch ui function
    for (var renderNode in _nullUiUpdateNodes) {
      renderNode.createViewModel();
    }

    for (var renderNode in _nullUiUpdateNodes) {
      renderNode.update();
    }

    for (var renderNode in _nullUiUpdateNodes) {
      renderNode.batchComplete();
    }

    _nullUiUpdateNodes.clear();
  }

  DomNode createStyleNode(
      String name, String tagName, bool isVirtual, int id, int instanceId) {
    DomNode domNode = _controllerManager.createStyleNode(
        name, tagName, instanceId, id, isVirtual);
    return domNode;
  }

  RenderNode? getRenderNode(int instanceId, int id) {
    return _controllerManager.findNode(instanceId, id);
  }

  void measureInWindow(int instanceId, int id, Promise? promise) {
    if (promise != null) {
      var renderNode = getRenderNode(instanceId, id);
      if (renderNode == null) {
        promise.reject("this view is null");
      } else {
        renderNode.measureInWindow(promise);
        addNullUINodeIfNeeded(renderNode);
      }
    }
  }

  @override
  void destroy() {
    controllerManager.destroy();
  }
}
