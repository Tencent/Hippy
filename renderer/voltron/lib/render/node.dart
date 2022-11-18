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

import 'package:flutter/cupertino.dart';
import 'package:voltron_renderer/render.dart';

import '../common.dart';
import '../controller.dart';
import '../style.dart';
import '../util.dart';
import '../viewmodel.dart';
import '../widget.dart';

class RootRenderNode extends RenderNode {
  RootRenderNode(
    int id,
    String className,
    RenderTree root,
    ControllerManager controllerManager,
    VoltronMap? props,
  ) : super(id, className, root, controllerManager, props);

  @override
  RenderViewModel createRenderViewModel(RenderContext context) {
    return RootRenderViewModel(id, rootId, name, context, context.getInstance(id));
  }

  @override
  void addEvent(Set<String> eventNameList) {
    super.addEvent(eventNameList);
    for (var event in eventNameList) {
      if (event == ChoreographerUtil.kDoFrame.toLowerCase()) {
        ChoreographerUtil.registerDoFrameListener(renderContext.engineId, rootId);
      }
    }
  }

  @override
  void removeEvent(Set<String> eventNameList) {
    super.removeEvent(eventNameList);
    for (var event in eventNameList) {
      if (event == ChoreographerUtil.kDoFrame.toLowerCase()) {
        ChoreographerUtil.unregisterDoFrameListener(renderContext.engineId, rootId);
      }
    }
  }
}

class RootRenderViewModel extends GroupViewModel {
  final RootWidgetViewModel? _rootWidgetViewModel;

  RootRenderViewModel(
    int id,
    int instanceId,
    String className,
    RenderContext context,
    this._rootWidgetViewModel,
  ) : super(id, instanceId, className, context);

  @override
  void update() {
    _rootWidgetViewModel?.notifyChange();
  }
}

class RenderNode extends StyleNode {
  // 唯一标识
  final int _id;

  /// 布局属性
  double _x = 0;
  double _y = 0;
  double _width = 0;
  double _height = 0;

  /// 基础参数
  final String _className;
  final VoltronMap? _props;
  VoltronMap? _propToUpdate;

  /// 额外参数
  Object? _extra;
  Object? _extraToUpdate;

  /// 树结构相关
  final RenderTree _root;
  RenderNode? _parent;
  final List<RenderNode> _children = [];
  final List<RenderNode> _childrenPendingList = [];
  final List<MoveHolder> _moveHolders = [];
  final Set<EventHolder> _eventHolders = {};
  final Set<int> _deleteIds = {};
  RenderViewModel? _viewModel;

  /// 更新相关属性

  final List<UIFunction> _uiFunction = [];

  bool _hasPropsNeedToApply = true;

  /// 外部依赖

  final ControllerManager _controllerManager;

  /// 控制值
  bool _hasUpdateLayout = false;
  bool isDelete = false;
  bool _isRootHasDelete = false;
  bool _isLazyLoad = false;
  bool _notifyManageChildren = false;

  int get indexFromParent => _parent?._children.indexOf(this) ?? 0;

  RenderContext get renderContext => _controllerManager.context;

  @override
  int get id => _id;

  int get rootId => _root.id;

  @override
  String get name => _className;

  RenderNode? get parent => _parent;

  RenderTree get root => _root;

  @override
  double get layoutX => _x;

  @override
  double get layoutY => _y;

  @override
  double get layoutWidth => _width;

  @override
  double get layoutHeight => _height;

  RenderViewModel? get viewModel => _viewModel;

  bool get shouldCreateView => !_isLazyLoad && _viewModel == null;

  bool get isLazyLoad => _isLazyLoad;

  int get childCount => _children.length;

  bool get hasCustomLayout => false;

  List<RenderNode> get children => _children;

  VoltronViewController findController() {
    var controller = _controllerManager.findController(name);
    assert(controller != null);
    return controller!;
  }

  set isLazyLoad(bool isLazy) {
    setLazy(this, isLazy);
  }

  void setLazy(RenderNode node, bool isLazy) {
    node._isLazyLoad = isLazy;
    for (var childNode in node._children) {
      setLazy(childNode, isLazy);
    }
  }

  VoltronMap? get props => _props;

  bool get isRoot => name == NodeProps.kRootNode;

  RenderNode(
    this._id,
    this._className,
    this._root,
    this._controllerManager,
    this._props, [
    this._isLazyLoad = false,
    this._parent,
  ]) : super(_className);

  @override
  String toString() {
    var buffer = StringBuffer();
    buffer.write(printChild(this));
    return buffer.toString();
  }

  String printChild(RenderNode renderNode) {
    var buffer = StringBuffer();
    buffer.write(" [Id:${renderNode.id}${renderNode.name}");
    for (var child in renderNode._children) {
      buffer.write(printChild(child));
    }
    buffer.write("]");
    return buffer.toString();
  }

  void addDeleteId(int id) {
    if (_shouldUpdateView()) {
      _deleteIds.add(id);
    }
  }

  RenderViewModel get renderViewModel {
    _viewModel ??= createRenderViewModel(_controllerManager.context);
    return _viewModel!;
  }

  RenderBox? get renderBox {
    return renderViewModel.currentContext?.findRenderObject() as RenderBox?;
  }

  BoundingClientRect? get boundingClientRect {
    return renderViewModel.boundingClientRect;
  }

  bool checkRenderViewModel() {
    if (_viewModel == null) {
      _viewModel = createRenderViewModel(_controllerManager.context);
      return true;
    }
    return false;
  }

  void createViewModelRecursive() {
    for (var renderNode in _children) {
      renderNode.createViewModelRecursive();
    }

    _hasUpdateLayout = true;
    _extraToUpdate = _extra;
  }

  void createViewModel() {
    if (_deleteIds.isNotEmpty) {
      for (final deleteId in _deleteIds) {
        _controllerManager.deleteChild(
          _viewModel,
          _viewModel?.childFromId(deleteId),
        );
      }
      _deleteIds.clear();
      _notifyManageChildren = true;
    }

    if (isDelete && isRoot && !_isRootHasDelete) {
      _isRootHasDelete = true;
      _controllerManager.deleteRoot(_root.id, _root);
    }

    var parent = _parent;
    if (shouldCreateView && !isRoot && parent != null) {
      _propToUpdate = null;
      parent.addChildToPendingList(this);
      return _controllerManager.createViewModel(this, props);
    }

    return;
  }

  bool _shouldUpdateView() {
    return _controllerManager.hasNode(this);
  }

  void deleteAllChild() {
    if (_children.isNotEmpty) {
      for (var childNode in _children) {
        childNode.deleteAllChild();
        _root.unregisterNode(childNode);
      }
      _children.clear();
    }
  }

  void deleteChild(RenderNode node, {bool needRemoveChild = true}) {
    if (_children.contains(node)) {
      if (needRemoveChild) {
        node.deleteAllChild();
      }
      _children.remove(node);
      _root.unregisterNode(node);
    }
  }

  RenderViewModel createRenderViewModel(RenderContext context) {
    return findController().createRenderViewModel(this, context);
  }

  void updateRecursive() {
    update();
    for (var node in _children) {
      node.updateRecursive();
    }
  }

  void addChild(RenderNode? node, int index) {
    if (node != null) {
      _notifyManageChildren = true;
      if (index < 0 || index >= _children.length) {
        _children.add(node);
      } else {
        _children.insert(index, node);
      }

      node._parent = this;
      root.registerNode(node);
    }
  }

  void addChildToPendingList(RenderNode renderNode) {
    _childrenPendingList.add(renderNode);
  }

  void removeChild(RenderNode? node, {bool needRemoveChild = true}) {
    if (node != null) {
      _notifyManageChildren = true;
      deleteChild(node, needRemoveChild: needRemoveChild);
    }
  }

  void addEvent(Set<String> eventNameList) {
    _eventHolders.addAll(eventNameList.map(EventHolder.new));
  }

  void removeEvent(Set<String> eventNameList) {
    _eventHolders.addAll(eventNameList.map((e) => EventHolder(e, isAdd: false)));
  }

  RenderNode? getChildAt(int index) {
    if (0 <= index && index < childCount) {
      return _children[index];
    }

    return null;
  }

  void batchComplete() {
    if (!_isLazyLoad && !isDelete) {
      _controllerManager.batchComplete(this);
    }
  }

  void update() {
    LogUtils.dRenderNode(
      "ID:$id, updateStyle start, shouldUpdateView: ${_shouldUpdateView()}",
    );

    if (_shouldUpdateView()) {
      if (_childrenPendingList.isNotEmpty) {
        _childrenPendingList.sort((o1, o2) {
          return o1.indexFromParent.compareTo(o2.indexFromParent);
        });

        for (var i = 0; i < _childrenPendingList.length; i++) {
          var renderNode = _childrenPendingList[i];
          _controllerManager.addChild(this, renderNode, renderNode.indexFromParent);
        }
        _childrenPendingList.clear();
        _notifyManageChildren = true;
      }

      if (_propToUpdate != null) {
        _controllerManager.updateWidget(this, _propToUpdate);
        _propToUpdate = null;
        _hasPropsNeedToApply = true;
      }

      if (_moveHolders.isNotEmpty) {
        for (var moveHolder in _moveHolders) {
          moveHolder._moveRenders.sort((o1, o2) {
            return o1.indexFromParent.compareTo(o2.indexFromParent);
          });

          for (var node in moveHolder._moveRenders) {
            _controllerManager.move(node, moveHolder._moveToNode, node.indexFromParent);
          }
        }
        _moveHolders.clear();
      }

      _viewModel?.sortChildren();

      LogUtils.dRenderNode(
        "ID:$id, update style, update layout start, hasUpdateLayout:$_hasUpdateLayout",
      );
      if (_hasUpdateLayout && !isRoot) {
        _controllerManager.updateLayout(this);
        LogUtils.dRenderNode(
          "ID:$id, update style, update layout end, newLayout:[$layoutX, $layoutY, $_width, $_height]",
        );
        _hasUpdateLayout = false;
      }

      var extraToUpdate = _extraToUpdate;
      if (extraToUpdate != null) {
        _controllerManager.updateExtra(this, extraToUpdate);
        _extraToUpdate = null;
      }

      if (_eventHolders.isNotEmpty) {
        _controllerManager.updateEvents(this, _eventHolders);
        _eventHolders.clear();
      }

      if (_uiFunction.isNotEmpty) {
        for (var i = 0; i < _uiFunction.length; i++) {
          var uiFunction = _uiFunction[i];
          _controllerManager.dispatchUIFunction(
            rootId,
            id,
            name,
            uiFunction._functionName,
            uiFunction._params,
            uiFunction._promise,
          );
        }
        _uiFunction.clear();
      }

      if (_notifyManageChildren) {
        manageChildrenComplete();
        _notifyManageChildren = false;
      }
    }
    LogUtils.dRenderNode("ID:$id, update style end");
  }

  void applyProps() {
    if (_hasPropsNeedToApply) {
      _controllerManager.applyProps(this);
      _hasPropsNeedToApply = false;
    }
  }

  void updateRender() {
    renderViewModel.update();
  }

  void updateLayout(double x, double y, double w, double h) {
    _x = x;
    _y = y;
    _width = w;
    _height = h;
    _hasUpdateLayout = true;
  }

  void _updateStyle(VoltronMap map) {
    DomUpdateUtil.updateStyle(this, map);
  }

  void updateNode(VoltronMap map) {
    var propToUpdate = _propToUpdate;
    if (propToUpdate != null) {
      //mProps do not syc to UI
      var paramsMap = combineProps(propToUpdate, map);
      if (paramsMap.size() > 0) {
        for (var key in paramsMap.keySet()) {
          if (key == NodeProps.kStyle) {
            var styles = paramsMap.get<VoltronMap>(key);
            if (styles != null) {
              var stylesToUpdate = propToUpdate.get<VoltronMap>(key) ?? VoltronMap();
              for (String styleKey in styles.keySet()) {
                stylesToUpdate.push(styleKey, styles.get(styleKey));
              }

              _updateStyle(stylesToUpdate);
            }
          } else {
            propToUpdate.push(key, paramsMap.get(key));
          }
        }
      }
    } else {
      var curProps = _props;
      if (curProps != null) {
        _propToUpdate = combineProps(curProps, map);
      }
    }
  }

  void updateExtra(Object object) {
    _extra = object;
    _extraToUpdate = object;
  }

  void dispatchUIFunction(
    String funcName,
    VoltronArray array,
    Promise promise,
  ) {
    _uiFunction.add(UIFunction(funcName, array, promise));
  }

  void manageChildrenComplete() {
    if (!isLazyLoad && !isDelete) {
      _controllerManager.manageChildComplete(this);
    }
  }

  void move(List<RenderNode> moveRenders, RenderNode moveToRender) {
    if (_shouldUpdateView()) {
      _moveHolders.add(MoveHolder(moveRenders, moveToRender));
    }
  }
}

class UIFunction {
  final String _functionName;
  final VoltronArray _params;
  final Promise _promise;

  const UIFunction(this._functionName, this._params, this._promise);
}

class MoveHolder {
  final List<RenderNode> _moveRenders;
  final RenderNode _moveToNode;

  MoveHolder(this._moveRenders, this._moveToNode);
}

@immutable
class EventHolder {
  final String eventName;
  final bool isAdd;

  const EventHolder(this.eventName, {this.isAdd = true});

  @override
  bool operator ==(Object other) {
    return other is EventHolder && eventName == other.eventName && isAdd == other.isAdd;
  }

  @override
  int get hashCode => super.hashCode | eventName.hashCode | isAdd.hashCode;
}
