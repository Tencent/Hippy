import 'dart:collection';

import 'package:flutter/cupertino.dart';

import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../controller/controller.dart';
import '../controller/manager.dart';
import '../engine/engine_context.dart';
import '../module/promise.dart';
import '../style/flex_define.dart';
import '../style/flex_output.dart';
import '../style/prop.dart';
import '../style/style_node.dart';
import '../style/update.dart';
import '../util/diff.dart';
import '../util/log_util.dart';
import '../util/screen_util.dart';
import '../viewmodel/group.dart';
import '../viewmodel/view_model.dart';
import '../widget/root.dart';
import 'tree.dart';


class RootRenderNode extends RenderNode {
  RootRenderNode(int id, String className, RenderTree root,
      ControllerManager controllerManager, VoltronMap? props)
      : super(id, className, root, controllerManager, props);

  @override
  RenderViewModel createRenderViewModel(EngineContext context) {
    return RootRenderViewModel(
        id, rootId, name, context, context.getInstance(id));
  }
}

class RootRenderViewModel extends GroupViewModel {
  final RootWidgetViewModel? _rootWidgetViewModel;

  RootRenderViewModel(int id, int instanceId, String className,
      EngineContext context, this._rootWidgetViewModel)
      : super(id, instanceId, className, context);

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
  VoltronMap? _props;
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
  RenderViewModel? _viewModel;

  /// 更新相关属性
  final HashMap<int, int> _deleteIdIndexMap = HashMap();
  final List<JSPromise> _measureInWindows = [];
  final List<UIFunction> _uiFunction = [];

  /// 外部依赖

  final ControllerManager _controllerManager;

  /// 控制值
  bool _hasUpdateLayout = false;
  bool isDelete = false;
  bool _isRootHasDelete = false;
  bool _isLazyLoad = false;
  bool _notifyManageChildren = false;

  int get indexFromParent => _parent?._children.indexOf(this) ?? 0;

  int get id => _id;

  int get rootId => _root.id;

  String get name => _className;

  RenderNode? get parent => _parent;

  RenderTree get root => _root;

  double get layoutX => _x;

  double get layoutY => _y;

  double get layoutWidth => _width;

  double get layoutHeight => _height;

  bool get shouldCreateView => !_isLazyLoad && _viewModel == null;

  bool get isLazyLoad => _isLazyLoad;

  int get childCount => _children.length;

  bool get hasCustomLayout => false;

  bool get isVirtual => false;

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

  bool get isRoot => name == NodeProps.rootNode;

  RenderNode(this._id, this._className, this._root, this._controllerManager,
      this._props,
      [this._isLazyLoad = false, this._parent])
      : super(_className) {
    if (hasCustomLayout) {
      _controllerManager.context.bridgeManager
          .setNodeHasCustomLayout(rootId, _id);
    }
  }

  int calculateLayout(FlexLayoutParams layoutParams) {
    return FlexOutput.makeMeasureResult(
        layoutParams.width, layoutParams.height);
  }

  void layoutBefore(EngineContext context) {
    // empty
  }

  void layoutAfter(EngineContext context) {
    // empty
  }

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

  void addDeleteId(int id, RenderNode node) {
    if (_shouldUpdateView()) {
      _deleteIdIndexMap[id] = node.id;
    }
  }

  RenderViewModel get renderViewModel {
    if (_viewModel == null) {
      _viewModel = createRenderViewModel(_controllerManager.context);
    }
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
    renderViewModel;
    for (var renderNode in _children) {
      renderNode.createViewModelRecursive();
    }

    _hasUpdateLayout = true;
    _extraToUpdate = _extra;
  }

  void createViewModel() {
    if (_deleteIdIndexMap.isNotEmpty) {
      for (final deleteId in _deleteIdIndexMap.values) {
        _controllerManager.deleteChild(
            _viewModel, _viewModel?.childFromId(deleteId));
      }
      _deleteIdIndexMap.clear();
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

    return null;
  }

  bool _shouldUpdateView() {
    return _controllerManager.hasNode(this);
  }

  void deleteAllChild() {
    if (_children.isNotEmpty) {
      for (var childNode in _children) {
        childNode.deleteAllChild();
        _root.removeNode(childNode);
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
      _root.removeNode(node);
    }
  }

  RenderViewModel createRenderViewModel(EngineContext context) {
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
      _children.insert(index, node);
      node._parent = this;
      root.addNode(node);
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
        "($hashCode) Id:$id updateStyle, ${_shouldUpdateView()}");

    if (_shouldUpdateView()) {
      if (_childrenPendingList.isNotEmpty) {
        _childrenPendingList.sort((o1, o2) {
          return o1.indexFromParent.compareTo(o2.indexFromParent);
        });

        for (var i = 0; i < _childrenPendingList.length; i++) {
          var renderNode = _childrenPendingList[i];
          _controllerManager.addChild(
              this, renderNode, renderNode.indexFromParent);
        }
        _childrenPendingList.clear();
        _notifyManageChildren = true;
      }

      if (_propToUpdate != null) {
        _controllerManager.updateWidget(this, _propToUpdate);
        _propToUpdate = null;
      }

      if (_moveHolders.isNotEmpty) {
        for (var moveHolder in _moveHolders) {
          moveHolder._moveRenders.sort((o1, o2) {
            return o1.indexFromParent.compareTo(o2.indexFromParent);
          });

          for (var node in moveHolder._moveRenders) {
            _controllerManager.move(
                node, moveHolder._moveToNode, node.indexFromParent);
          }
        }
        _moveHolders.clear();
      }

      _viewModel?.sortChildren();

      LogUtils.dRenderNode(
          "($hashCode) Id:$id start update layout:$_hasUpdateLayout");
      if (_hasUpdateLayout && !isRoot) {
        _controllerManager.updateLayout(this);
        LogUtils.dRenderNode("($hashCode) Id:$id updateLayout");
        _hasUpdateLayout = false;
      }

      var extraToUpdate = _extraToUpdate;
      if (extraToUpdate != null) {
        _controllerManager.updateExtra(this, extraToUpdate);
        _extraToUpdate = null;
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
              uiFunction._promise);
        }
        _uiFunction.clear();
      }
      if (_measureInWindows.isNotEmpty) {
        for (var i = 0; i < _measureInWindows.length; i++) {
          var promise = _measureInWindows[i];
          _measureInWindow(promise);
        }
        _measureInWindows.clear();
      }
      renderViewModel.update();

      if (_notifyManageChildren) {
        manageChildrenComplete();
        _notifyManageChildren = false;
      }
    }
    LogUtils.dRenderNode("($hashCode)  Id:$id end updateStyle");
  }

  void updateLayout(double x, double y, double w, double h) {
    LogUtils.dLayout("update ($hashCode id:$id) layout : ($x, $y), ($w, $h)");
    _x = x;
    _y = y;
    _width = w;
    _height = h;
    _hasUpdateLayout = true;
  }

  void updateStyle(VoltronMap map) {
    DomUpdateUtil.updateStyle(this, map);
  }

  void updateNode(VoltronMap map) {
    var propToUpdate = _propToUpdate;
    if (propToUpdate != null) {
      //mProps do not syc to UI
      var paramsMap = diffProps(_propToUpdate, map, 0);
      if (paramsMap.size() > 0) {
        for (var key in paramsMap.keySet()) {
          if (key == NodeProps.style) {
            var styles = paramsMap.get(key);
            if (styles != null) {
              var stylesToUpdate = propToUpdate.get(key);
              if (stylesToUpdate == null) {
                stylesToUpdate = VoltronMap();
              }
              for (String styleKey in styles.keySet()) {
                stylesToUpdate.push(styleKey, styles.get(styleKey));
              }

              updateStyle(stylesToUpdate);
            }
          } else {
            propToUpdate.push(key, paramsMap.get(key));
          }
        }
      }
    } else {
      _propToUpdate = diffProps(_props, map, 0);
    }

    _props = map;
  }

  void measureInWindow(JSPromise promise) {
    if (!_measureInWindows.contains(promise)) {
      _measureInWindows.add(promise);
    }
  }

  void updateExtra(Object object) {
    _extra = object;
    _extraToUpdate = object;
  }

  void dispatchUIFunction(
      String funcName, VoltronArray array, Promise promise) {
    _uiFunction.add(UIFunction(funcName, array, promise));
  }

  void _measureInWindow(JSPromise promise) {
    var renderObject =
        _viewModel?.currentContext?.findRenderObject() as RenderBox?;
    if (renderObject == null) {
      promise.reject("this view is null");
    } else {
      var position = renderObject.localToGlobal(Offset(0, 0));
      var size = renderObject.size;

      var x = position.dx;
      var y = position.dy;
      var width = size.width;
      var height = size.height;

      var statusBarHeight = ScreenUtil.getInstance().statusBarHeight;
      var bottomBarHeight = ScreenUtil.getInstance().bottomBarHeight;

      // todo 暂时不确定localToGlobal拿到的y值是否包含statusBar，这里先不减掉
      // // We need to remove the status bar from the height.  getLocationOnScreen will include the
      // // status bar.
      // if (statusBarHeight > 0) {
      //   y -= statusBarHeight;
      // }

      var paramsMap = VoltronMap();
      paramsMap.push("x", x);
      paramsMap.push("y", y);
      paramsMap.push("width", width);
      paramsMap.push("height", height);
      paramsMap.push("statusBarHeight", statusBarHeight);
      paramsMap.push("bottomBarHeight", bottomBarHeight);
      promise.resolve(paramsMap);
    }
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
