import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../dom/prop.dart';
import '../dom/style_node.dart';
import '../engine/api_provider.dart';
import '../engine/engine_context.dart';
import '../module/promise.dart';
import '../render/controller.dart';
import '../render/div.dart';
import '../render/group.dart';
import '../render/node.dart';
import '../render/tree.dart';
import '../render/view_model.dart';
import '../util/animation_util.dart';
import '../util/log_util.dart';
import '../voltron/lifecycle.dart';
import 'registry.dart';
import 'update.dart';

class ControllerManager implements InstanceLifecycleEventListener {
  final EngineContext _context;
  final ControllerRegistry _controllerRegistry;

  ControllerManager(this._context, List<APIProvider>? packages)
      : _controllerRegistry = ControllerRegistry() {
    _context.addInstanceLifecycleEventListener(this);
    processControllers(packages);
  }

  void processControllers(List<APIProvider>? packages) {
    if (packages == null) {
      return;
    }

    for (var provider in packages) {
      var controllerFactoryList = provider.controllerGeneratorList;
      if (controllerFactoryList.isNotEmpty) {
        for (var factory in controllerFactoryList) {
          _controllerRegistry.addControllerHolder(factory.name,
              ControllerHolder(factory.generateController, factory.isLazy));
        }
      }
    }
  }

  EngineContext get context => _context;

  void destroy() {
    _context.removeInstanceLifecycleEventListener(this);
    _controllerRegistry.forEachRenderTree(deleteRoot);
  }

  void deleteRoot(int id, [RenderTree? renderTree]) {
    final _renderTree =
        renderTree == null ? _controllerRegistry.getRenderTree(id) : renderTree;
    if (_renderTree != null) {
      _renderTree.clear();
      _controllerRegistry.removeRenderTree(_renderTree);
    }
  }

  void deleteChild(
      RenderViewModel? parentViewModel, RenderViewModel? childViewModel,
      {int childIndex = -1}) {
    if (parentViewModel is GroupViewModel && childViewModel != null) {
      deleteChildRecursive(parentViewModel, childViewModel, childIndex);
    }
  }

  void deleteChildRecursive(
      GroupViewModel? viewParent, RenderViewModel? child, int childIndex) {
    if (viewParent == null || child == null) {
      return;
    }
    var childName = child.name;

    var childViewController = _controllerRegistry.getViewController(childName);
    if (childViewController != null) {
      childViewController.onViewDestroy(child);
    }

    if (child is GroupViewModel) {
      for (var i = child.childCount - 1; i >= 0; i--) {
        var nextChild = child.getChildAt(i);
        if (nextChild != null) {
          deleteChildRecursive(child, nextChild, -1);
        }
      }
    }

    viewParent.removeViewModel(child);
  }

  void createViewModel(RenderNode node, VoltronMap? initialProps) {
    var controller = findController(node.name);
    if (controller != null && node.checkRenderViewModel()) {
      ControllerUpdateUtil.updateProps(controller, node, initialProps);
      controller.onAfterUpdateProps(node);
    }
  }

  StyleNode createStyleNode(
      String name, String tagName, int instanceId, int id, bool isVirtual) {
    return findController(name)
            ?.createStyleNode(name, tagName, instanceId, id, isVirtual) ??
        StyleNode(instanceId, id, name, tagName);
  }

  bool hasNode(RenderNode node) {
    return findNode(node.rootId, node.id) == node;
  }

  RenderNode? findNode(int instanceId, int id) {
    if (instanceId < 0) {
      return null;
    }
    return _controllerRegistry.getRenderNode(instanceId, id);
  }

  RenderTree? findTree(int instanceId) {
    if (instanceId < 0) {
      return null;
    }
    return _controllerRegistry.getRenderTree(instanceId);
  }

  VoltronViewController? findController(String name) {
    if (name == NodeProps.rootNode) {
      return null;
    }
    var controller = _controllerRegistry.getViewController(name);
    if (controller == null) {
      return _controllerRegistry.getViewController(DivController.className);
    }

    return controller;
  }

  void updateWidget(RenderNode? node, VoltronMap? newProps) {
    if (node != null && newProps != null && newProps.size() > 0) {
      final controller = findController(node.name);

      if (controller != null) {
        final validProps =
            AnimationUtil.getRenderNodeStyleByAnimationRule(newProps);
        ControllerUpdateUtil.updateProps(controller, node, validProps);
        controller.onAfterUpdateProps(node);
      }
    }
  }

  void addChild(RenderNode parentNode, RenderNode childNode, int index) {
    var childViewModel = childNode.renderViewModel;
    var parentViewModel = parentNode.renderViewModel;

    if (parentViewModel is GroupViewModel) {
      parentViewModel.addViewModel(childViewModel, index);
    } else {
      Error exception = StateError(
          "${"child null or parent not ViewGroup pid ${parentNode.id}"} parentClass ${parentNode.name} renderNodeClass ${childNode.name}${" id ${childNode.id}"}");
      _context.globalConfigs.exceptionHandlerAdapter
          ?.handleNativeException(exception, true);
    }
  }

  void move(RenderNode node, RenderNode toNode, int index) {
    var viewModel = node.renderViewModel;

    var oldParent = viewModel.parent;
    if (oldParent != null && oldParent is GroupViewModel) {
      oldParent.removeViewModel(viewModel);
    }
    var newParent = toNode.renderViewModel;
    if (newParent is GroupViewModel) {
      newParent.addViewModel(viewModel, index);
    }

    LogUtils.d("ControllerManager",
        "move id: ${node.id} fromId:${oldParent?.id} toId:${newParent.id} ");
  }

  void updateLayout(RenderNode node) {
    final controller = findController(node.name);
    if (controller != null) {
      controller.updateLayout(node);
    }
  }

  void updateExtra(RenderNode node, Object updateExtra) {
    final controller = findController(node.name);
    if (controller != null) {
      controller.updateExtra(node, updateExtra);
    }
  }

  RenderNode? createRenderNode(
      int id, VoltronMap? props, String name, RenderTree tree, bool lazy) {
    final controller = findController(name);
    if (controller != null) {
      return controller.createRenderNode(id, props, name, tree, this, lazy);
    }
    return null;
  }

  void dispatchUIFunction(int instanceId, int id, String name,
      String functionName, VoltronArray array, Promise promise) {
    final node = findNode(instanceId, id);
    final controller = findController(name);

    if (node != null && controller != null) {
      controller.dispatchFunction(node, functionName, array,
          promise: promise.isCallback() ? promise : null);
    }
  }

  void batchComplete(RenderNode? node) {
    if (node != null) {
      final controller = findController(node.name);
      controller?.onBatchComplete(node);
    }
  }

  void manageChildComplete(RenderNode node) {
    final controller = findController(node.name);
    controller?.onManageChildComplete(node);
  }

  @override
  void onInstanceDestroy(int instanceId) {}

  @override
  void onInstanceLoad(int instanceId) {
    tryInitRoot(instanceId);
  }

  bool isControllerLazy(String name) {
    return _controllerRegistry.getControllerHolder(name)?.isLazy ?? false;
  }

  RenderNode? createRootNode(int instanceId) {
    return tryInitRoot(instanceId);
  }

  RenderNode? tryInitRoot(int instanceId) {
    var viewModel = _context.getInstance(instanceId);
    if (viewModel != null) {
      var tree = _controllerRegistry.getRenderTree(instanceId);
      if (tree == null) {
        tree = RenderTree(instanceId, viewModel);
        _controllerRegistry.addRenderTree(tree);
      }

      var node = _controllerRegistry.getRenderNode(instanceId, instanceId);
      if (node == null) {
        node = RootRenderNode(instanceId, NodeProps.rootNode, tree, this, null);
        tree.init(node);
      }

      return node;
    }

    return null;
  }

  @override
  void onInstancePause(int instanceId) {}

  @override
  void onInstanceResume(int instanceId) {}
}
