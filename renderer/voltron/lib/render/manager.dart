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
import 'package:voltron_renderer/gesture/event_render_delegate.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'node.dart';
import 'render_context.dart';

typedef IRenderExecutor = void Function();

const String _kTag = "RenderManager";

mixin EngineLifecycleDelegate {
  bool _enginePaused = false;

  bool get isPause => _enginePaused;

  void onEnginePause() {
    _enginePaused = true;
  }

  void onEngineResume() {
    _enginePaused = false;
  }
}

mixin InstanceLifeCycleDelegate {
  void onInstanceDestroy(int instanceId);

  void onInstancePause(int instanceId) {}

  void onInstanceResume(int instanceId) {}

  void onInstanceLoad(final int instanceId) {}

  void createRootNode(int instanceId);
}

mixin RenderExecutorDelegate {
  bool _isDestroyed = false;
  bool _isDispatchUiFrameEnqueued = false;

  final List<IRenderExecutor> _uiTasks = [];
  final List<IRenderExecutor> _paddingNullUiTasks = [];
  final List<IRenderExecutor> _dispatchRunnable = [];
  final List<IRenderExecutor> _pageUpdateTasks = [];

  bool get isPause;

  void doRenderBatch();

  void destroy() {
    _isDestroyed = true;

    _uiTasks.clear();
    _paddingNullUiTasks.clear();

    _isDispatchUiFrameEnqueued = false;
  }

  void updatePage() {
    if (_pageUpdateTasks.isNotEmpty) {
      for (var task in _pageUpdateTasks) {
        task();
      }
    }
  }

  void addUITask(IRenderExecutor executor) {
    _uiTasks.add(executor);
  }

  void addNulUITask(IRenderExecutor executor) {
    _paddingNullUiTasks.add(executor);
  }

  void addDispatchTask(IRenderExecutor executor) {
    if (_isDestroyed) {
      return;
    }

    _dispatchRunnable.add(executor);

    if (!_isDispatchUiFrameEnqueued) {
      _isDispatchUiFrameEnqueued = true;
    }
  }

  void renderBatchEnd() {
    for (final task in _uiTasks) {
      addDispatchTask(task);
    }
    for (final task in _paddingNullUiTasks) {
      addDispatchTask(task);
    }

    _paddingNullUiTasks.clear();
    _uiTasks.clear();

    if (_dispatchRunnable.isNotEmpty) {
      if (!_isDestroyed) {
        updatePage();
        executeUITask();
      }
    }
  }

  void executeUITask() {
    var start = DateTime.now().millisecondsSinceEpoch;
    var size = _dispatchRunnable.length;
    var count = 0;
    while (count < size) {
      var task = _dispatchRunnable[count];
      try {
        task();
      } catch (e) {
        LogUtils.e(_kTag, "exec render executor error:$e");
      }
      count++;
    }
    _dispatchRunnable.clear();
    LogUtils.dRender(
      "executeUITask: size: ${size}, time: ${(DateTime.now().millisecondsSinceEpoch - start)}ms",
    );
    if (size > 0) {
      doRenderBatch();
    }
  }
}

class RenderManager
    with
        EngineLifecycleDelegate,
        InstanceLifeCycleDelegate,
        RenderExecutorDelegate,
        EventRenderDelegate
    implements Destroyable, InstanceLifecycleEventListener, EngineLifecycleEventListener {
  final List<RenderNode> _uiUpdateNodes = [];
  final List<RenderNode> _nullUiUpdateNodes = [];
  final Set<RenderNode> _updateRenderNodes = {};

  final ControllerManager _controllerManager;
  final RenderContext renderContext;
  final int _nativeRenderManagerId;

  int get nativeRenderManagerId => _nativeRenderManagerId;

  ControllerManager get controllerManager => _controllerManager;

  RenderManager(
    this.renderContext,
    List<ViewControllerGenerator>? generators,
  )   : _controllerManager = ControllerManager(renderContext, generators),
        _nativeRenderManagerId = renderContext.renderBridgeManager.createNativeRenderManager() {
    renderContext.addEngineLifecycleEventListener(this);
    renderContext.addInstanceLifecycleEventListener(this);
  }

  @override
  void onInstanceLoad(final int instanceId) {
    createRootNode(instanceId);
    createInstance(instanceId);
  }

  @override
  void createRootNode(int instanceId) async {
    var viewModel = renderContext.getInstance(instanceId);
    if (viewModel != null) {
      controllerManager.createRootNode(instanceId);
      var executor = viewModel.executor;
      if (executor != null) {
        _pageUpdateTasks.add(executor);
      }

      _pageUpdateTasks.add(viewModel.viewExecutor);
    } else {
      LogUtils.e(_kTag, "createRootNode  RootView Null error");
    }
  }

  void createNode(
    int instanceId,
    int id,
    int pId,
    int childIndex,
    String name,
    VoltronMap? props,
  ) {
    // 父节点为0标识根节点，根节点id跟instanceId相同
    if (pId == 0) {
      pId = instanceId;
    }
    var parentNode = controllerManager.findNode(instanceId, pId);
    var tree = controllerManager.findTree(instanceId);
    if (parentNode != null && tree != null) {
      var isLazy = controllerManager.isControllerLazy(name);
      var uiNode = controllerManager.createRenderNode(
        id,
        props,
        name,
        tree,
        isLazy || parentNode.isLazyLoad,
      );
      LogUtils.dRender(
        " ID:$id, createNode, pID:$pId, index:$childIndex, className:$name finish:${uiNode.hashCode} prop:$props",
      );
      uiNode?.addEvent(nodeEvents(instanceId, id));
      parentNode.addChild(uiNode, childIndex);
      addUpdateNodeIfNeeded(parentNode);
      addUpdateNodeIfNeeded(uiNode);
    } else {
      LogUtils.dRender(
        "ID:$id, createNode error, pID:$pId index:$childIndex className:$name, tree: ${tree?.id}, parent: ${parentNode?.id}",
      );
    }
  }

  VirtualNode? createVirtualNode(
    int id,
    int pid,
    int index,
    String className,
    VoltronMap props,
  ) {
    return controllerManager.createVirtualNode(
      id,
      pid,
      index,
      className,
      props,
    );
  }

  void addUpdateNodeIfNeeded(RenderNode? renderNode) {
    if (renderNode != null && !_uiUpdateNodes.contains(renderNode)) {
      _uiUpdateNodes.add(renderNode);
    }
  }

  void updateRender() {
    LogUtils.d(_kTag, "update render size: ${_updateRenderNodes.length}");
    if (_updateRenderNodes.isNotEmpty) {
      for (var node in _updateRenderNodes) {
        node.updateRender();
      }
    }
    _updateRenderNodes.clear();
  }

  void addNullUINodeIfNeeded(RenderNode renderNode) {
    if (!_nullUiUpdateNodes.contains(renderNode)) {
      _nullUiUpdateNodes.add(renderNode);
    }
  }

  double correctPixel(double len) {
    var density = ScreenUtil.getInstance().scale;
    // 兼容测试用例
    density = density <= 0 ? 1.0 : density;
    return (len * density).roundToDouble() / density;
  }

  void updateLayout(
    int instanceId,
    int id,
    double x,
    double y,
    double w,
    double h,
  ) {
    var uiNode = controllerManager.findNode(instanceId, id);
    w = correctPixel(w);
    h = correctPixel(h);
    LogUtils.dLayout(
      "ID:$id, updateLayout, x:$x, y:$y, w:$w, h:$h",
    );
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
    final renderBox = node?.renderViewModel.currentContext?.findRenderObject() as RenderBox?;

    return renderBox;
  }

  BoundingClientRect? getBoundingClientRect(int? instanceId, int? nodeId) {
    final node = getNode(instanceId, nodeId);
    final boundingClientRect = node?.renderViewModel.boundingClientRect;

    return boundingClientRect;
  }

  void updateNode(int instanceId, int id, VoltronMap map) {
    LogUtils.dRender("ID:$id, update node, param:($map)");
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.updateNode(map);
      addUpdateNodeIfNeeded(uiNode);
    }
  }

  /// 用于跨父节点移动子节点
  void recombineNode(
    int instanceId,
    List<int> moveIds,
    int oldPId,
    int moveIndex,
    int newPId,
  ) {
    var parentNode = controllerManager.findNode(instanceId, oldPId);
    var newParent = controllerManager.findNode(instanceId, newPId);
    if (parentNode != null && newParent != null) {
      var arrayList = <RenderNode>[];

      var i = 0;
      for (var moveId in moveIds) {
        var renderNode = controllerManager.findNode(instanceId, moveId);
        if (renderNode != null) {
          LogUtils.dRender(
            "ID:$moveId, move node ID:$moveId from ${parentNode.id} to ${newParent.id}",
          );
          arrayList.add(renderNode);
          parentNode.removeChild(renderNode, needRemoveChild: false);
          newParent.addChild(renderNode, i + moveIndex);
          i++;
        }
      }
      parentNode.move(arrayList, newParent);
      addUpdateNodeIfNeeded(newParent);
    }
  }

  /// 用于同父节点下移动子节点
  void moveNode(
    int instanceId,
    int nodeId,
    int pId,
    int index,
  ) {
    var parentNode = controllerManager.findNode(instanceId, pId);
    var renderNode = controllerManager.findNode(instanceId, nodeId);
    if (parentNode != null && renderNode != null) {
      parentNode.moveChild(renderNode, index);
      parentNode.move([renderNode], parentNode);
      addUpdateNodeIfNeeded(parentNode);
    }
  }

  void updateExtra(int instanceId, int id, Object object) {
    LogUtils.dRender("ID:$id, updateExtra");
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.updateExtra(object);

      addUpdateNodeIfNeeded(uiNode);
    }
  }

  void setEventListener(int instanceId, int id, String eventName) {
    LogUtils.dRender("ID:$id, set event, event:$eventName");
    bool needAdd = addEvent(instanceId, id, eventName);
    if (needAdd) {
      var uiNode = controllerManager.findNode(instanceId, id);
      if (uiNode != null) {
        uiNode.addEvent({eventName});
        addNullUINodeIfNeeded(uiNode);
      }
    }
  }

  void removeEventListener(int instanceId, int id, String eventName) {
    LogUtils.dRender("remove event ID:$id, event:$eventName");
    bool needRemove = removeEvent(instanceId, id, eventName);
    if (needRemove) {
      var uiNode = controllerManager.findNode(instanceId, id);
      if (uiNode != null) {
        uiNode.removeEvent({eventName});
        addNullUINodeIfNeeded(uiNode);
      }
    }
  }

  void deleteNode(int instanceId, int id) {
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.isDelete = true;

      var parent = uiNode.parent;
      if (parent != null) {
        if (uiNode.shouldCreateView) {
          _uiUpdateNodes.remove(uiNode);
        } else {
          parent.addDeleteId(id);
          addUpdateNodeIfNeeded(parent);
        }
      } else if (uiNode.isRoot) {
        addUpdateNodeIfNeeded(uiNode);
      }
      _deleteSelfFromParent(uiNode);
      LogUtils.dRender("ID:$id, delete node success");
    } else {
      LogUtils.dRender("ID:$id, delete node error, node not found");
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

  void dispatchUIFunction(
    int instanceId,
    int id,
    String funcName,
    VoltronArray array,
    Promise promise,
  ) {
    var renderNode = controllerManager.findNode(instanceId, id);
    if (renderNode != null) {
      renderNode.dispatchUIFunction(funcName, array, promise);
      addNullUINodeIfNeeded(renderNode);
    } else {
      LogUtils.e(_kTag, "dispatchUIFunction Node Null");
    }
  }

  RenderNode? getRenderNode(int instanceId, int id) {
    return _controllerManager.findNode(instanceId, id);
  }

  @override
  void destroy() {
    super.destroy();
    renderContext.renderBridgeManager.destroyNativeRenderManager();
    controllerManager.destroy();
    renderContext.removeInstanceLifecycleEventListener(this);
    renderContext.removeEngineLifecycleEventListener(this);
  }

  @override
  void doRenderBatch() {
    LogUtils.d(_kTag, "do batch size: ${_uiUpdateNodes.length}");
    _updateRenderNodes.addAll(_uiUpdateNodes);
    // _updateRenderNodes.addAll(_nullUiUpdateNodes);

    for (var renderNode in _uiUpdateNodes) {
      renderNode.createViewModel();
    }

    for (var renderNode in _uiUpdateNodes) {
      renderNode.update();
    }

    for (var renderNode in _uiUpdateNodes) {
      renderNode.applyProps();
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

    updateRender();
  }

  @override
  void onInstanceDestroy(int instanceId) {
    var viewModel = renderContext.getInstance(instanceId);
    if (viewModel != null) {
      if (viewModel.executor != null) {
        _pageUpdateTasks.remove(viewModel.executor);
      }

      _pageUpdateTasks.remove(viewModel.viewExecutor);
    }
    destroyInstance(instanceId);
  }
}
