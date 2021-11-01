import 'dart:collection';

import 'package:collection/collection.dart';

import '../common/voltron_map.dart';
import '../controller/manager.dart';
import '../controller/props.dart';
import '../dom/prop.dart';
import '../engine/engine_context.dart';
import '../util/enum_util.dart';
import 'controller.dart';
import 'node.dart';
import 'tree.dart';
import 'view_model.dart';

abstract class BaseGroupController<T extends GroupViewModel>
    extends GroupController<BaseGroupRenderNode<T>> {
  @override
  BaseGroupRenderNode<T> createRenderNode(
      int id,
      VoltronMap? props,
      String name,
      RenderTree tree,
      ControllerManager controllerManager,
      bool lazy) {
    return BaseGroupRenderNode(
        id, name, tree, controllerManager, props, lazy, createViewModel);
  }

  @override
  Map<String, ControllerMethodProp> get groupExtraMethodProp => {};

  GroupViewModel createViewModel(BaseGroupRenderNode renderNode);
}

abstract class GroupController<T extends GroupRenderNode>
    extends VoltronViewController<T> {
  @override
  Map<String, ControllerMethodProp> get extendRegisteredMethodProp {
    var extraMap = <String, ControllerMethodProp>{};
    extraMap[NodeProps.onInterceptTouchEvent] =
        ControllerMethodProp(setInterceptTouch, false);
    extraMap[NodeProps.onInterceptPullUpEvent] =
        ControllerMethodProp(setInterceptPullUp, false);
    extraMap.addAll(groupExtraMethodProp);

    return extraMap;
  }

  Map<String, ControllerMethodProp> get groupExtraMethodProp;

  @ControllerProps(NodeProps.onInterceptTouchEvent)
  void setInterceptTouch(T node, bool flag) {
    node.renderViewModel.interceptTouch = flag;
  }

  @ControllerProps(NodeProps.onInterceptPullUpEvent)
  void setInterceptPullUp(T node, bool flag) {
    node.renderViewModel.interceptPullUp = flag;
  }
}

abstract class GroupRenderNode<T extends GroupViewModel> extends RenderNode<T> {
  GroupRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props, bool isLazy)
      : super(id, className, root, controllerManager, props, isLazy);
}

typedef ViewModelCreator = GroupViewModel Function(
    BaseGroupRenderNode renderNode);

class BaseGroupRenderNode<V extends GroupViewModel>
    extends GroupRenderNode<GroupViewModel> {
  final ViewModelCreator? viewModelCreator;

  BaseGroupRenderNode(
      int id,
      String className,
      RenderTree root,
      ControllerManager controllerManager,
      VoltronMap? props,
      bool isLazy,
      this.viewModelCreator)
      : super(id, className, root, controllerManager, props, isLazy);

  @override
  GroupViewModel createRenderViewModel(EngineContext context) {
    var curCreator = viewModelCreator;
    if (curCreator != null) {
      var viewModel = curCreator(this);
      return viewModel;
    }
    return GroupViewModel(id, rootId, name, context);
  }
}

class GroupViewModel extends RenderViewModel {
  // touch/click intercept
  bool interceptTouch = false;

  // pull intercept
  bool interceptPullUp = false;

  final List<RenderViewModel> _children = [];

  final HashMap<int, RenderViewModel> _childrenMap = HashMap();

  List<int> _sortedIdList = [];

  @override
  List<RenderViewModel> get children => _children;

  List<int> get sortedIdList => _sortedIdList;

  HashMap<int, RenderViewModel> get childrenMap => _childrenMap;

  @override
  RenderViewModel? childFromId(int id) {
    return _childrenMap[id];
  }

  late DivContainerViewModel divContainerViewModel;

  @override
  int get childCount => _children.length;

  GroupViewModel(
      int id, int instanceId, String className, EngineContext context)
      : super(id, instanceId, className, context);

  GroupViewModel.copy(int id, int instanceId, String className,
      EngineContext context, GroupViewModel viewModel)
      : super.copy(id, instanceId, className, context, viewModel) {
    interceptTouch = viewModel.interceptTouch;
    interceptPullUp = viewModel.interceptPullUp;
    interceptTouch = viewModel.interceptTouch;
    _children.addAll(viewModel.children);
    _childrenMap.addAll(viewModel._childrenMap);
    _sortedIdList.addAll(viewModel.sortedIdList);
    divContainerViewModel = DivContainerViewModel(
        sortedIdList, childrenMap, overflow, name, context);
  }

  @override
  bool operator ==(Object other) {
    return other is GroupViewModel &&
        interceptTouch == other.interceptTouch &&
        interceptPullUp == other.interceptPullUp &&
        interceptTouch == other.interceptTouch &&
        DeepCollectionEquality().equals(_sortedIdList, other.sortedIdList) &&
        super == (other);
  }

  @override
  int get hashCode =>
      interceptTouch.hashCode |
      interceptPullUp.hashCode |
      interceptTouch.hashCode |
      _sortedIdList.hashCode |
      super.hashCode;

  @override
  RenderViewModel? getChildAt(int index) {
    if (index >= 0 && index < childCount) {
      return _children[index];
    }
    return null;
  }

  @override
  void sortChildren() {
    // 根据zIndex排序
    _sortedIdList = [];
    if (_children.length > 1) {
      var sortChildren = <RenderViewModel>[];
      sortChildren.addAll(_children);
      insertionSort<RenderViewModel>(sortChildren, compare: (model1, model2) {
        var index1 = model1.zIndex;
        var index2 = model2.zIndex;
        return index1.compareTo(index2);
      });
      for (var model in sortChildren) {
        _sortedIdList.add(model.id);
      }
    } else if (_children.length == 1) {
      _sortedIdList.add(_children[0].id);
    }
  }

  void addViewModel(RenderViewModel child, int index) {
    var oldParent = child.parent;
    if (oldParent != null && oldParent is GroupViewModel) {
      oldParent.removeViewModel(child);
    }

    child.parent = this;
    if (index > childCount || index < 0) {
      _children.add(child);
    } else {
      _children.insert(index, child);
    }
    _childrenMap[child.id] = child;
  }

  void removeViewModel(RenderViewModel child) {
    child.parent = null;
    children.remove(child);
    _childrenMap.remove(child.id);
  }

  bool isOverflowVisible() {
    return enumValueToString(ContainOverflow.visible) == overflow;
  }
}

class DivContainerViewModel {
  final List<int> sortedIdList = [];
  HashMap<int, RenderViewModel> childrenMap = HashMap();
  final String overflow;
  final String name;
  final EngineContext context;

  DivContainerViewModel(List<int> sortedIdList, this.childrenMap, this.overflow,
      this.name, this.context) {
    this.sortedIdList.addAll(sortedIdList);
  }

  bool needStack() {
    if (sortedIdList.length == 1) {
      var id = sortedIdList[0];
      var childrenViewModel = childrenMap[id];
      if (childrenViewModel != null &&
          childrenViewModel.layoutY != null &&
          childrenViewModel.layoutX != null &&
          childrenViewModel.layoutY! >= 0 &&
          childrenViewModel.layoutX! >= 0 &&
          enumValueToString(ContainOverflow.visible) != overflow) {
        return false;
      }
    }
    return true;
  }

  @override
  bool operator ==(Object other) =>
      other is DivContainerViewModel &&
      DeepCollectionEquality().equals(sortedIdList, other.sortedIdList) &&
      overflow == other.overflow;

  @override
  int get hashCode => sortedIdList.hashCode | overflow.hashCode;
}
