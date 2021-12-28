import 'package:flutter/rendering.dart';
import 'package:flutter/widgets.dart';

import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../module.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import 'node.dart';
import 'operator_runner.dart';

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
  bool _hasAddFrameCallback = false;
  bool _isDestroyed = false;
  bool _isDispatchUiFrameEnqueued = false;
  bool _renderBatchStarted = true;

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

  void doFrame() {
    if (!_isDestroyed) {
      updatePage();
      flushPendingBatches();
    }
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
    if (_renderBatchStarted) {
      _paddingNullUiTasks.add(executor);
    } else {
      addDispatchTask(executor);
    }
  }

  void addDispatchTask(IRenderExecutor executor) {
    if (_isDestroyed) {
      return;
    }

    _dispatchRunnable.add(executor);

    if (!_isDispatchUiFrameEnqueued) {
      _isDispatchUiFrameEnqueued = true;
    }

    postFrameCallback();
  }

  void postFrameCallback() {
    if (!_hasAddFrameCallback) {
      WidgetsFlutterBinding.ensureInitialized();
      WidgetsBinding.instance?.addPersistentFrameCallback((timeStamp) {
        doFrame();
      });
      _hasAddFrameCallback = true;
    }
    if (_dispatchRunnable.isNotEmpty) {
      WidgetsBinding.instance?.scheduleFrame();
    }
  }

  void _renderBatchStart() {
    _renderBatchStarted = true;
  }

  void layoutBefore() {
    _batch();
  }

  void renderBatchEnd() {
    _renderBatchStarted = false;
    _batch();
  }

  void _batch() {
    for (final task in _uiTasks) {
      addDispatchTask(task);
    }
    for (final task in _paddingNullUiTasks) {
      addDispatchTask(task);
    }

    _paddingNullUiTasks.clear();
    _uiTasks.clear();
  }

  void notifyDom();

  void flushPendingBatches() {
    if (isPause) {
      _isDispatchUiFrameEnqueued = false;
    } else {
      postFrameCallback();
    }

    var iterator = _dispatchRunnable.iterator;
    var shouldBatch = _dispatchRunnable.isNotEmpty;
    var startTime = currentTimeMillis();
    var deleteList = <IRenderExecutor>[];
    while (iterator.moveNext()) {
      var iRenderExecutor = iterator.current;
      if (!_isDestroyed) {
        try {
          iRenderExecutor();
        } catch (e) {
          LogUtils.e(_kTag, "exec render executor error:$e");
        }
      }
      deleteList.add(iRenderExecutor);
      if (_isDispatchUiFrameEnqueued) {
        if (currentTimeMillis() - startTime > 500) {
          break;
        }
      }
    }

    if (deleteList.isNotEmpty) {
      deleteList.forEach(_dispatchRunnable.remove);
    }

    if (shouldBatch) {
      doRenderBatch();
    }

    notifyDom();
  }
}

class RenderManager
    with
        EngineLifecycleDelegate,
        InstanceLifeCycleDelegate,
        RenderExecutorDelegate
    implements
        Destroyable,
        InstanceLifecycleEventListener,
        EngineLifecycleEventListener {
  final List<RenderNode> _uiUpdateNodes = [];
  final List<RenderNode> _nullUiUpdateNodes = [];
  final Set<RenderNode> _updateRenderNodes = {};

  final ControllerManager _controllerManager;
  final EngineContext context;

  ControllerManager get controllerManager => _controllerManager;

  RenderManager(this.context, List<APIProvider>? packages)
      : _controllerManager = ControllerManager(context, packages) {
    context.addEngineLifecycleEventListener(this);
    context.addInstanceLifecycleEventListener(this);
  }

  @override
  void onInstanceLoad(final int instanceId) {
    createRootNode(instanceId);
  }

  void createRootNode(int instanceId) async {
    var viewModel = context.getInstance(instanceId);
    if (viewModel != null) {
      var renderSize = getSizeFromKey(viewModel.rootKey);
      await context.bridgeManager.updateNodeSize(instanceId,
          width: renderSize.width, height: renderSize.height);
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

  void createNode(int instanceId, int id, int pId, int childIndex, String name,
      VoltronMap? props) {
    // 父节点为0标识根节点，根节点id跟instanceId相同
    if (pId == 0) {
      pId = instanceId;
    }
    var parentNode = controllerManager.findNode(instanceId, pId);
    var tree = controllerManager.findTree(instanceId);
    if (parentNode != null && tree != null) {
      var isLazy = controllerManager.isControllerLazy(name);
      var uiNode = controllerManager.createRenderNode(
          id, props, name, tree, isLazy || parentNode.isLazyLoad);
      LogUtils.dRender(
          "createNode ID:$id pID:$pId index:$childIndex className:$name finish:${uiNode.hashCode} prop:$props");
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

  @override
  void notifyDom() {
    context.bridgeManager.notifyDom();
  }

  void layoutAfter() {
    // updateRender();
  }

  void updateRender() {
    if (_updateRenderNodes.isNotEmpty) {
      for (var node in _updateRenderNodes) {
        node.updateRender();
      }
      _updateRenderNodes.clear();
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

  int calculateLayout(int instanceId, int id, FlexLayoutParams layoutParams) {
    var node = getNode(instanceId, id);
    if (node != null) {
      if (node.isVirtual) {
        // text子节点不需要单独layout，父节点内部已经完成layout了
        return layoutParams.zero();
      }
      var result = node.calculateLayout(layoutParams);
      return result;
    }
    return layoutParams.defaultOutput();
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

  void setEventListener(
      int instanceId, int id, String eventName) {
    LogUtils.dRender("set event ID:$id, event:$eventName");
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.addEvent(eventName);
    }
  }

  void removeEventListener(int instanceId, int id, String eventName) {
    LogUtils.dRender("remove event ID:$id, event:$eventName");
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.removeEvent(eventName);
    }
  }

  void deleteNode(int instanceId, int id) {
    var uiNode = controllerManager.findNode(instanceId, id);
    if (uiNode != null) {
      uiNode.isDelete = true;

      var parent = uiNode.parent;
      if (parent != null) {
        parent.addDeleteId(id);
        addUpdateNodeIfNeeded(parent);
      } else if (uiNode.isRoot) {
        addUpdateNodeIfNeeded(uiNode);
      }
      _deleteSelfFromParent(uiNode);
      LogUtils.dRender("delete node ID:$id finish, ${uiNode.hashCode}");
    } else {
      LogUtils.w(_kTag, "delete node id:$id error, node not found");
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
      LogUtils.e(_kTag, "dispatchUIFunction Node Null");
    }
  }

  RenderNode? getRenderNode(int instanceId, int id) {
    return _controllerManager.findNode(instanceId, id);
  }

  void measureInWindow(int instanceId, int id, JSPromise? promise) {
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
    context.removeInstanceLifecycleEventListener(this);
    context.removeEngineLifecycleEventListener(this);
  }

  @override
  void doRenderBatch() {
    LogUtils.d(_kTag, "do batch size: ${_uiUpdateNodes.length}");
    _updateRenderNodes.addAll(_uiUpdateNodes);
    _updateRenderNodes.addAll(_nullUiUpdateNodes);

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

    if (!_renderBatchStarted) {
      _renderBatchStart();
      updateRender();
    }
  }

  @override
  void onInstanceDestroy(int instanceId) {
    var viewModel = context.getInstance(instanceId);
    if (viewModel != null) {
      if (viewModel.executor != null) {
        _pageUpdateTasks.remove(viewModel.executor);
      }

      _pageUpdateTasks.remove(viewModel.viewExecutor);
    }
  }
}
