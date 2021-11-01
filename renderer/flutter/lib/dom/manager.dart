import 'dart:collection';

import 'package:flutter/cupertino.dart';

import '../common/destroy.dart';
import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../engine/engine_context.dart';
import '../module/event_dispatcher.dart';
import '../module/module.dart';
import '../module/promise.dart';
import '../render/manager.dart';
import '../util/animation_util.dart';
import '../util/diff.dart';
import '../util/enum_util.dart';
import '../util/log_util.dart';
import '../util/num_util.dart';
import '../util/render_util.dart';
import '../util/time_util.dart';
import '../voltron/lifecycle.dart';
import '../widget/root.dart';
import 'dom_node.dart';
import 'interceptor.dart';
import 'prop.dart';
import 'registry.dart';
import 'style_node.dart';
import 'update.dart';

typedef IDomExecutor = void Function();
typedef TDOMManagerBatchHook = void Function(EngineContext context);

class DomManager
    implements
        Destroyable,
        InstanceLifecycleEventListener,
        EngineLifecycleEventListener {
  bool _hasAddFrameCallback = false;
  static const String tag = "DomManager";
  final HashMap<int, bool> _tagsWithLayoutVisited = HashMap();

  bool _isDispatchUiFrameEnqueued = false;
  bool _renderBatchStarted = false;
  bool _isDestroyed = false;
  bool _enginePaused = false;

  final DomNodeRegistry _nodeRegistry = DomNodeRegistry();
  final RenderManager _renderManager;

  final List<IDomExecutor> _uiTasks = [];
  final List<IDomExecutor> _paddingNullUiTasks = [];
  final List<IDomExecutor> _dispatchRunnable = [];
  final List<DomActionInterceptor> _actionInterceptors = [];

  final EngineContext _context;

  final List<IDomExecutor> _pageUpdateTasks = [];

  /// 批量更新的钩子
  TDOMManagerBatchHook? batchHook;

  DomManager(this._context) : _renderManager = _context.renderManager {
    _context.addEngineLifecycleEventListener(this);
    _context.addInstanceLifecycleEventListener(this);
  }

  @override
  void destroy() {
    _isDestroyed = true;
    _nodeRegistry.clear();

    _context.removeInstanceLifecycleEventListener(this);
    _uiTasks.clear();
    _paddingNullUiTasks.clear();

    _context.removeEngineLifecycleEventListener(this);

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

  bool isJustLayout(Object obj) {
    if (!(obj is VoltronMap)) {
      return true;
    }
    var props = obj;
    if (props.get(NodeProps.collapsable) != null &&
        props.get(NodeProps.collapsable) == false) {
      return false;
    }

    final sets = props.keySet();

    for (var key in sets) {
      if (!NodeProps.isJustLayout(props, key)) {
        return false;
      }
    }
    return true;
  }

  bool isTouchEvent(VoltronMap? props) {
    if (props == null) {
      return false;
    }
    final sets = props.keySet();
    for (var key in sets) {
      if (NodeProps.isTouchEventProp(key)) {
        return true;
      }
    }
    return false;
  }

  void addActionInterceptor(DomActionInterceptor interceptor) {
    _actionInterceptors.add(interceptor);
  }

  void removeActionInterceptor(DomActionInterceptor interceptor) {
    _actionInterceptors.remove(interceptor);
  }

  void createRootNode(int instanceId) {
    var viewModel = _context.getInstance(instanceId);
    if (viewModel != null) {
      var renderSize = getSizeFromKey(viewModel.rootKey);
      DomNode node = StyleNode(instanceId, instanceId, NodeProps.rootNode, '');
      node.styleWidth = renderSize.width;
      node.styleHeight = renderSize.height;
      _nodeRegistry.addRootNode(node);
      _renderManager.createRootNode(instanceId);
      var executor = viewModel.executor;
      if (executor != null) {
        _pageUpdateTasks.add(executor);
      }

      _pageUpdateTasks.add(viewModel.viewExecutor);
    } else {
      LogUtils.e(tag, "createRootNode  RootView Null error");
    }
  }

  void onInstanceLoad(final int instanceId) {
    createRootNode(instanceId);
  }

  @override
  void onEnginePause() {
    _enginePaused = true;
  }

  @override
  void onEngineResume() {
    _enginePaused = false;
  }

  @override
  void onInstanceDestroy(int instanceId) {
    var viewModel = _context.getInstance(instanceId);
    if (viewModel != null) {
      if (viewModel.executor != null) {
        _pageUpdateTasks.remove(viewModel.executor);
      }

      _pageUpdateTasks.remove(viewModel.viewExecutor);
    }
  }

  @override
  void onInstancePause(int instanceId) {}

  @override
  void onInstanceResume(int instanceId) {}

  bool hasRenderBatchStart() {
    return _renderBatchStarted;
  }

  void markNodeDirtyWhenForceUpdate(DomNode? node) {
    if (node != null) {
      var childCount = node.childCount;
      for (var i = 0; i < childCount; i++) {
        markNodeDirtyWhenForceUpdate(node.getChildAt(i));
      }

      if (node.enableScale) {
        node.dirty();
      }
    }
  }

  void forceUpdateNode(int rootId) {
    var node = _nodeRegistry.getNode(rootId);
    markNodeDirtyWhenForceUpdate(node);
    doBatch();
  }

  void updateNodeSize(int rootId, double width, double height) {
    var node = _nodeRegistry.getNode(rootId);

    if (node != null) {
      node.styleWidth = width;
      node.styleHeight = height;
      doBatch();
    }
  }

  void doBatch() {
    if (!_renderBatchStarted) {
      batch();
    }
  }

  void renderBatchStart(String renderID) {
    LogUtils.d(tag, "renderBatchStart $renderID");
    _renderBatchStarted = true;
  }

  void renderBatchEnd(String renderID) {
    LogUtils.d(tag, "renderBatchEnd $renderID");
    _renderBatchStarted = false;
    batch();
  }

  void batchByAnimation() {
    doBatch();
  }

  DomNode? findNativeViewParent(DomNode domNode) {
    var nativeParent = domNode.parent;
    while (nativeParent != null && nativeParent.isJustLayout == true) {
      nativeParent = nativeParent.parent;
    }
    return nativeParent;
  }

  ViewIndex findNativeViewIndex(
      DomNode nativeParentNode, DomNode node, int index) {
    for (var i = 0; i < nativeParentNode.childCount; i++) {
      var childNode = nativeParentNode.getChildAt(i);
      if (childNode == node) {
        return ViewIndex(true, index);
      }

      if (childNode.isJustLayout) {
        var viewIndex = findNativeViewIndex(childNode, node, index);
        if (viewIndex.result) {
          return viewIndex;
        } else {
          index = viewIndex.index;
        }
      } else {
        index++;
      }
    }
    return ViewIndex(false, index);
  }

  void createNode(final RootWidgetViewModel rootView, final int id, int pid,
      int index, final String className, String tagName, VoltronMap? map) {
    final parentNode = _nodeRegistry.getNode(pid);
    if (parentNode != null) {
      if (_actionInterceptors.isNotEmpty) {
        for (var interceptor in _actionInterceptors) {
          map = interceptor.onCreateNode(id, rootView, map);
        }
      }
      var props = map;
      var isVirtual = false;
      if (parentNode.name == NodeProps.textClassName) {
        isVirtual = true;
      }

      var node = _context.renderManager
          .createStyleNode(className, tagName, isVirtual, id, rootView.id);

      node.isLazy = parentNode.isLazy ||
          _context.renderManager.controllerManager.isControllerLazy(className);
      node.totalProps = VoltronMap.copy(props);
      AnimationUtil.handleSyncAnimationStyle(props, null);

      var isLayoutOnly = (NodeProps.viewClassName == node.name) &&
          isJustLayout(props?.get(NodeProps.style)) &&
          !isTouchEvent(props);
      LogUtils.d(tag,
          "dom create node id: $id className: $className pid:$pid index:$index isJustLayout: $isLayoutOnly isVirtual:$isVirtual");
      node.updateProps(props);
      DomUpdateUtil.updateStyle(node, props);

      //add to parent
      var realIndex = index;
      if (realIndex > parentNode.childCount) {
        realIndex = parentNode.childCount;
        LogUtils.e(tag, "createNode  addChild  error index > parent.size");
      }
      parentNode.addChildAt(node, realIndex);

      //add to registry
      _nodeRegistry.addNode(node);

      node.isJustLayout = isLayoutOnly;

      if (!isLayoutOnly && !node.isVirtual()) {
        final nativeParentNode = findNativeViewParent(node);
        if (nativeParentNode == null) {
          return;
        }
        final childIndex = findNativeViewIndex(nativeParentNode, node, 0);
        final newProps = map;

        addUITask(() {
          _renderManager.createNode(rootView, id, nativeParentNode.id,
              childIndex.index, className, newProps);
        });
      }
    } else {
      LogUtils.e(tag, "Create Node DomManager Parent IS Null");
    }
  }

  void addUITask(IDomExecutor executor) {
    _uiTasks.add(executor);
  }

  void addNulUITask(IDomExecutor executor) {
    if (_renderBatchStarted) {
      _paddingNullUiTasks.add(executor);
    } else {
      addDispatchTask(executor);
    }
  }

  void addDispatchTask(IDomExecutor executor) {
    if (_isDestroyed) {
      return;
    }

    _dispatchRunnable.add(executor);

    if (!_isDispatchUiFrameEnqueued) {
      _isDispatchUiFrameEnqueued = true;
    }

    postFrameCallback();
  }

  void batch({bool canInvokeHook = true}) {
    _nodeRegistry.foreachRootTag((rootTag, flag) {
      var rootNode = _nodeRegistry.getNode(rootTag);
      if (rootNode != null) {
        applyLayoutBefore(rootNode);

        LogUtils.d(tag, " dom start  calculateLayout");

        rootNode.calculateLayout();

        applyLayoutAfter(rootNode);
        applyLayoutUpdateRecursive(rootNode);

        LogUtils.d(tag, "dom end  calculateLayout");
      }
    });

    _tagsWithLayoutVisited.clear();
    LogUtils.d(tag, "dom batch complete");

    for (final task in _uiTasks) {
      addDispatchTask(task);
    }
    for (final task in _paddingNullUiTasks) {
      addDispatchTask(task);
    }

    _paddingNullUiTasks.clear();
    _uiTasks.clear();
    if (canInvokeHook) {
      batchHook?.call(_context);
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

  void applyLayoutBefore(DomNode? domNode) {
    if (domNode != null && domNode.hasUpdates()) {
      for (var i = 0; i < domNode.childCount; i++) {
        applyLayoutBefore(domNode.getChildAt(i));
      }
      domNode.layoutBefore(_context);
    }
  }

  void applyLayoutAfter(DomNode? domNode) {
    if (domNode != null && domNode.hasUpdates()) {
      for (var i = 0; i < domNode.childCount; i++) {
        applyLayoutAfter(domNode.getChildAt(i));
      }
      domNode.layoutAfter(_context);
    }
  }

  void applyLayoutUpdateRecursive(final DomNode domStyle) {
    LogUtils.dLayout(
        "apply layout update ${domStyle.id}, (${domStyle.layoutX}, ${domStyle.layoutY}, ${domStyle.layoutWidth}, ${domStyle.layoutHeight})");
    if (domStyle.hasUpdates()) {
      for (var i = 0; i < domStyle.childCount; i++) {
        applyLayoutUpdateRecursive(domStyle.getChildAt(i));
      }

      domStyle.updateData(_context);

      if (!domStyle.isRoot) _applyLayout(domStyle);
      if (domStyle.shouldNotifyOnLayout) {
        notifyLayout(domStyle);
      }
      domStyle.markUpdateSeen();
    }
  }

  void _applyLayout(DomNode domStyle) {
    var tag = domStyle.id;
    if (_tagsWithLayoutVisited[tag] == true) {
      return;
    }
    _tagsWithLayoutVisited[tag] = true;

    var x = domStyle.layoutX;
    var y = domStyle.layoutY;

    var parent = domStyle.parent;
    while (parent != null && parent.isJustLayout == true) {
      x += parent.layoutX;
      y += parent.layoutY;
      parent = parent.parent;
    }

    _applyLayoutXY(domStyle, x, y);
  }

  void _applyLayoutXY(final DomNode domStyle, final double x, final double y) {
    LogUtils.dLayout(
        "_applyLayoutXY ID:${domStyle.id}, ($x, $y), (${domStyle.layoutWidth}, ${domStyle.layoutHeight}), isJustLayout:${domStyle.isJustLayout}");
    if (!domStyle.isJustLayout && !domStyle.isVirtual()) {
      if (domStyle.shouldUpdateLayout(x, y)) {
        addUITask(() {
          var newLeft = x;
          var newTop = y;

          _renderManager.updateLayout(domStyle.rootId, domStyle.id, newLeft,
              newTop, domStyle.layoutWidth, domStyle.layoutHeight);
        });
      }
      return;
    }

    for (var i = 0; i < domStyle.childCount; i++) {
      var child = domStyle.getChildAt(i);
      var childTag = child.id;
      if (_tagsWithLayoutVisited[childTag] == true) {
        continue;
      }
      _tagsWithLayoutVisited[childTag] = true;

      var childX = child.layoutX;
      var childY = child.layoutY;

      childX += x;
      childY += y;

      _applyLayoutXY(child, childX, childY);
    }
  }

  void notifyLayout(DomNode domStyle) {
    final module = _context.moduleManager.getJavaScriptModule(
        enumValueToString(JavaScriptModuleType.EventDispatcher));
    if (module is EventDispatcher) {
      if (!isDoubleNan(domStyle.layoutX) &&
          !isDoubleNan(domStyle.layoutY) &&
          !isDoubleNan(domStyle.layoutWidth) &&
          !isDoubleNan(domStyle.layoutHeight)) {
        var onLayoutMap = VoltronMap();
        onLayoutMap.push("x", domStyle.layoutX.toInt());
        onLayoutMap.push("y", domStyle.layoutY.toInt());
        onLayoutMap.push("width", domStyle.layoutWidth.toInt());
        onLayoutMap.push("height", domStyle.layoutHeight.toInt());

        var event = VoltronMap();

        event.push("layout", onLayoutMap);
        event.push("target", domStyle.id);

        module.receiveUIComponentEvent(domStyle.id, "onLayout", event);
      }
    }
  }

  DomNode? getNode(int? nodeId) {
    final node = _nodeRegistry.getNode(nodeId);

    return node;
  }

  DomNode? getNodeFirstChild(int? nodeId) {
    final node = _nodeRegistry.getNodeFirstChild(nodeId);

    return node;
  }

  void updateNode(
      final int id, VoltronMap map, RootWidgetViewModel rootViewModel,
      [VoltronMap? forceUpdateProps]) {
    var node = _nodeRegistry.getNode(id);

    if (node != null) {
      if (_actionInterceptors.isNotEmpty) {
        for (var interceptor in _actionInterceptors) {
          map = interceptor.onUpdateNode(id, rootViewModel, map);
        }
      }
      var props = map;
      var diffProperty = diffProps(node.totalProps, props, 0);
      final renderNode = _renderManager.getNode(rootViewModel.id, id);
      final validDiffProperty = AnimationUtil.getDomNodeStyleByAnimationRule(
          diffProperty, renderNode, forceUpdateProps);
      if (validDiffProperty.size() > 0) {
        node.totalProps = VoltronMap.copy(props);
        AnimationUtil.handleSyncAnimationStyle(props, validDiffProperty);
        DomUpdateUtil.updateStyle(node, validDiffProperty);

        var layoutOnlyHasChanged = node.isJustLayout &&
            (!isJustLayout(props.get(NodeProps.style)) || isTouchEvent(props));
        if (layoutOnlyHasChanged) {
          changeJustLayout2View(node, props, rootViewModel);
        } else if (!node.isJustLayout) {
          if (!node.isVirtual()) {
            addUITask(() {
              _renderManager.updateNode(rootViewModel.id, id, props);
            });
          }
        }
      } else {
        LogUtils.e(tag,
            "update error because no change, id:$id , root:${rootViewModel.id}");
      }
    } else {
      LogUtils.e(
          tag, "update error node is null id:$id , root:${rootViewModel.id}");
    }
  }

  void changeJustLayout2View(final DomNode node, final VoltronMap paramsMap,
      final RootWidgetViewModel rootWidgetViewModel) {
    //step1: create child
    final reallyParent = findNativeViewParent(node);
    if (reallyParent == null) {
      return;
    }

    final viewIndex = findNativeViewIndex(reallyParent, node, 0);

    if (!node.isVirtual()) {
      final newProps = paramsMap;
      addUITask(() {
        _renderManager.createNode(rootWidgetViewModel, node.id, reallyParent.id,
            viewIndex.index, node.name, newProps);
      });
    }

    //step2: move child
    final moveIds = <int>[];
    node.markUpdated();
    findMoveChildren(node, moveIds);
    node.isJustLayout = false;

    if (!node.isVirtual()) {
      addUITask(() {
        _renderManager.moveNode(
            rootWidgetViewModel.id, moveIds, reallyParent.id, node.id);
      });
    }
    //step3:updateStyle Layout
    applyLayoutUpdateRecursive(node);
    _tagsWithLayoutVisited.clear();
  }

  void findMoveChildren(DomNode node, List<int> remove) {
    for (var i = 0; i < node.childCount; i++) {
      var childNode = node.getChildAt(i);

      if (childNode.isJustLayout) {
        findMoveChildren(childNode, remove);
      } else {
        childNode.markUpdated();
        remove.add(childNode.id);
      }
    }
  }

  void _deleteDomNode(DomNode node) {
    //这里来拦截所有deleteNode(包括它的子node)操作
    for (var interceptor in _actionInterceptors) {
      interceptor.onDeleteNode(node.id);
    }

    var count = node.childCount;
    for (var i = 0; i < count; i++) {
      _deleteDomNode(node.getChildAt(i));
    }
    if (node.isRoot) {
      _nodeRegistry.removeRootNode(node.id);
    }
    _nodeRegistry.removeNode(node.id);
  }

  void deleteNode(final int instanceId, final int id) {
    LogUtils.dDom("delete node inner, page($instanceId), node($id)");
    var node = _nodeRegistry.getNode(id);
    if (node != null) {
      if (node.isJustLayout) {
        deleteJustLayoutChild(node);
      } else {
        if (!node.isVirtual()) {
          addUITask(() {
            _renderManager.deleteNode(instanceId, id);
          });
        }
      }
      var parentNode = node.parent;
      if (parentNode != null) {
        var index = parentNode.indexOf(node);
        parentNode.removeChildAt(index);
      }
      _deleteDomNode(node);
    }
  }

  void deleteJustLayoutChild(DomNode node) {
    for (var i = 0; i < node.childCount; i++) {
      LogUtils.dDom("delete just layout child:$node");
      final childNode = node.getChildAt(i);
      if (childNode.isJustLayout) {
        deleteJustLayoutChild(childNode);
      } else {
        if (!childNode.isVirtual()) {
          addUITask(() {
            _renderManager.deleteNode(childNode.rootId, childNode.id);
          });
        }
      }
    }
  }

  void flushPendingBatches() {
    if (_enginePaused) {
      _isDispatchUiFrameEnqueued = false;
    } else {
      postFrameCallback();
    }

    var iterator = _dispatchRunnable.iterator;
    var shouldBatch = _dispatchRunnable.isNotEmpty;
    var startTime = currentTimeMillis();
    var deleteList = <IDomExecutor>[];
    while (iterator.moveNext()) {
      var iDomExecutor = iterator.current;
      if (!_isDestroyed) {
        try {
          iDomExecutor();
        } catch (e) {
          LogUtils.e(tag, "exec dom executor error:$e");
        }
      }
      deleteList.add(iDomExecutor);
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
      _renderManager.batch();
    }
  }

  void dispatchUIFunction(final int id, final String functionName,
      final VoltronArray array, final Promise promise) {
    var node = _nodeRegistry.getNode(id);
    if (node == null) {
      return;
    }

    addNulUITask(() {
      _renderManager.dispatchUIFunction(
          node.rootId, id, functionName, array, promise);
    });
  }

  void measureInWindow(final int id, final Promise promise) {
    var node = _nodeRegistry.getNode(id);
    if (node == null) {
      return;
    }

    addNulUITask(() {
      _renderManager.measureInWindow(node.rootId, id, promise);
    });
  }
}

class ViewIndex {
  final bool result;
  final int index;

  const ViewIndex(this.result, this.index);
}
