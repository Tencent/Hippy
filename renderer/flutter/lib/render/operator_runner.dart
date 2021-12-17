import '../common.dart';
import '../engine.dart';
import '../module.dart';
import '../style.dart';
import '../voltron_render.dart';
import 'manager.dart';

typedef RenderOpTaskGenerator = RenderOpTask Function(
    int instanceId, int nodeId, Map params);

const int kInvalidIndex = -1;
const int kInvalidId = -1;

extension IdIntEx on int {
  bool isValidId() {
    return this != kInvalidId;
  }
}

class RenderOperatorRunner implements Destroyable {
  final EngineContext _engineContext;

  final Map<int, RenderOpTaskGenerator> _taskGeneratorMap = {
    _RenderOpType.addNode.index: (instanceId, nodeId, params) =>
        _AddNodeOpTask(instanceId, nodeId, params),
    _RenderOpType.deleteNode.index: (instanceId, nodeId, params) =>
        _DeleteNodeOpTask(instanceId, nodeId),
    _RenderOpType.moveNode.index: (instanceId, nodeId, params) =>
        _MoveNodeOpTask(instanceId, nodeId, params),
    _RenderOpType.updateNode.index: (instanceId, nodeId, params) =>
        _UpdateNodeOpTask(instanceId, nodeId, params),
    _RenderOpType.updateLayout.index: (instanceId, nodeId, params) =>
        _UpdateLayoutOpTask(instanceId, nodeId, params),
    _RenderOpType.batch.index: (instanceId, nodeId, params) =>
        _BatchOpTask(instanceId),
    _RenderOpType.dispatchUiFunc.index: (instanceId, nodeId, params) =>
        _CallUiFunctionOpTask(instanceId, nodeId, params),
    _RenderOpType.addEvent.index: (instanceId, nodeId, params) =>
        _AddEventOpTask(instanceId, nodeId, params),
    _RenderOpType.removeEvent.index: (instanceId, nodeId, params) =>
        _RemoveEventOpTask(instanceId, nodeId, params),
    _RenderOpType.layoutBefore.index: (instanceId, nodeId, params) =>
        _LayoutBeforeOpTask(instanceId),
    _RenderOpType.layoutFinish.index: (instanceId, nodeId, params) =>
        _LayoutFinishOpTask(instanceId),
  };

  RenderOperatorRunner(this._engineContext);

  void consumeRenderOp(int instanceId, List renderOpList) {
    if (renderOpList.isNotEmpty) {
      for (var op in renderOpList) {
        try {
          _parseOp(op as List, instanceId)?._run();
          // ignore: avoid_catching_errors
        } on Error catch (e) {
          LogUtils.dRender('consume render op error, op:$op, error:$e');
        }
      }
    }
  }

  RenderOpTask? _parseOp(List opData, int instanceId) {
    var type = opData[0] as int;
    var nodeId = opData[1] as int;
    var args = opData.length > 2 ? opData[2] as Map : {};
    return _taskGeneratorMap[type]?.call(instanceId, nodeId, args)
      ?.._engineContext = _engineContext;
  }

  @override
  void destroy() {}
}

abstract class RenderOpTask {
  final int _instanceId;

  RenderOpTask(this._instanceId);

  late EngineContext _engineContext;

  RenderManager get renderManager => _engineContext.renderManager;

  void _run();
}

abstract class _NodeOpTask extends RenderOpTask {
  final int _nodeId;
  final Map _params;

  _NodeOpTask(int instanceId, this._nodeId, this._params) : super(instanceId);
}

class _AddNodeOpTask extends _NodeOpTask {
  _AddNodeOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    var className = _params[_RenderOpParamsKey.kClassNameKey] ?? '';
    var childIndex =
        _params[_RenderOpParamsKey.kChildIndexKey] ?? kInvalidIndex;
    var parentId = _params[_RenderOpParamsKey.kParentNodeIdKey] ?? kInvalidId;
    var styleMap = _params[_RenderOpParamsKey.kStylesKey] ?? {};
    var propMap = _params[_RenderOpParamsKey.kPropsKey] ?? {};
    var composePropMap = VoltronMap.fromMap(propMap);
    composePropMap.push(NodeProps.style, VoltronMap.fromMap(styleMap));
    renderManager.addUITask(() {
      renderManager.createNode(_instanceId, _nodeId, parentId, childIndex,
          className, composePropMap);
    });
  }
}

class _DeleteNodeOpTask extends _NodeOpTask {
  _DeleteNodeOpTask(int instanceId, int nodeId) : super(instanceId, nodeId, {});

  @override
  void _run() {
    renderManager.addUITask(() {
      renderManager.deleteNode(_instanceId, _nodeId);
    });
  }
}

class _UpdateNodeOpTask extends _NodeOpTask {
  _UpdateNodeOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    var propMap = _params[_RenderOpParamsKey.kPropsKey] ?? {};
    renderManager.addUITask(() {
      renderManager.updateNode(
          _instanceId, _nodeId, VoltronMap.fromMap(propMap));
    });
  }
}

class _UpdateLayoutOpTask extends _NodeOpTask {
  _UpdateLayoutOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    var layoutNodeList =
    (_params[_RenderOpParamsKey.kLayoutNodesKey] ?? []) as List;
    var parseLayoutNodeList = <_LayoutNodeInfo>[];
    if (layoutNodeList.isNotEmpty) {
      for (var layoutNode in layoutNodeList) {
        if (layoutNode is List) {
          var nodeId = (layoutNode[0] ?? kInvalidId) as int;
          if (nodeId.isValidId()) {
            var left = layoutNode[1] ?? 0;
            var top = layoutNode[2] ?? 0;
            var width = layoutNode[3] ?? 0;
            var height = layoutNode[4] ?? 0;
            parseLayoutNodeList.add(_LayoutNodeInfo(nodeId,
                left: left, top: top, width: width, height: height));
          }
        }
      }
    }
    if (parseLayoutNodeList.isNotEmpty) {
      renderManager.addUITask(() {
        for (var parseLayoutNode in parseLayoutNodeList) {
          renderManager.updateLayout(
              _instanceId,
              parseLayoutNode.nodeId,
              parseLayoutNode.left,
              parseLayoutNode.top,
              parseLayoutNode.width,
              parseLayoutNode.height);
        }
      });
    }
  }
}

class _LayoutNodeInfo {
  final int nodeId;
  final double left;
  final double top;
  final double width;
  final double height;

  _LayoutNodeInfo(this.nodeId,
      {this.left = 0, this.top = 0, this.width = 0, this.height = 0});
}


class _MoveNodeOpTask extends _NodeOpTask {
  _MoveNodeOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    var moveIdList = _params[_RenderOpParamsKey.kMoveIdListKey] ?? [];
    var movePid = _params[_RenderOpParamsKey.kMovePidKey];

    renderManager.addUITask(() {
      renderManager.moveNode(_instanceId, moveIdList, movePid, _nodeId);
    });
  }
}

class _BatchOpTask extends RenderOpTask {
  _BatchOpTask(int instanceId) : super(instanceId);

  @override
  void _run() {
    renderManager.renderBatchEnd();
  }
}

class _LayoutBeforeOpTask extends RenderOpTask {
  _LayoutBeforeOpTask(int instanceId) : super(instanceId);

  @override
  void _run() {
    renderManager.layoutBefore();
  }
}

class _LayoutFinishOpTask extends RenderOpTask {
  _LayoutFinishOpTask(int instanceId) : super(instanceId);

  @override
  void _run() {
    renderManager.addUITask(() {
      renderManager.layoutBatch();
    });
  }
}

class _CallUiFunctionOpTask extends _NodeOpTask {
  _CallUiFunctionOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    String funcName = _params[_RenderOpParamsKey.kFuncNameKey] ?? '';
    if (funcName.isNotEmpty) {
      Map funcParams = _params[_RenderOpParamsKey.kFuncParamsKey] ?? {};
      var realParams = VoltronArray.fromList(
          funcParams[_RenderOpParamsKey.kParamsKey] ?? []);
      String callbackId =
          _params[_RenderOpParamsKey.kFuncIdKey] ?? Promise.callIdNoCallback;
      var promise = Promise.native(_engineContext, callId: callbackId);
      renderManager.addNulUITask(() {
        renderManager.dispatchUIFunction(
            _instanceId, _nodeId, funcName, realParams, promise);
      });
    }
  }
}

class _AddEventOpTask extends _NodeOpTask {
  _AddEventOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    String eventName = _params[_RenderOpParamsKey.kFuncNameKey] ?? '';
    if (eventName.isNotEmpty) {
      String callbackId =
          _params[_RenderOpParamsKey.kFuncIdKey] ?? Promise.callIdNoCallback;
      var promise = Promise.native(_engineContext, callId: callbackId);

      switch (eventName) {
        case _RenderOpParamsKey.kAddClickFuncType: // 点击事件
          renderManager.addNulUITask(() {
            renderManager.setEventListener(
                _instanceId, _nodeId, EventType.click, promise);
          });
          break;
        case _RenderOpParamsKey.kAddLongClickFuncType: // 长按事件
          renderManager.addNulUITask(() {
            renderManager.setEventListener(
                _instanceId, _nodeId, EventType.longClick, promise);
          });
          break;
        case _RenderOpParamsKey.kAddTouchFuncType: // 触摸事件
          Map funcParams = _params[_RenderOpParamsKey.kFuncParamsKey] ?? {};
          int touchType = funcParams[_RenderOpParamsKey.kTouchTypeKey] ?? -1;
          if (touchType == _TouchType.start.index) {
            renderManager.addNulUITask(() {
              renderManager.setEventListener(
                  _instanceId, _nodeId, EventType.touchStart, promise);
            });
          } else if (touchType == _TouchType.move.index) {
            renderManager.addNulUITask(() {
              renderManager.setEventListener(
                  _instanceId, _nodeId, EventType.touchMove, promise);
            });
          } else if (touchType == _TouchType.end.index) {
            renderManager.addNulUITask(() {
              renderManager.setEventListener(
                  _instanceId, _nodeId, EventType.touchEnd, promise);
            });
          } else if (touchType == _TouchType.cancel) {
            renderManager.addNulUITask(() {
              renderManager.setEventListener(
                  _instanceId, _nodeId, EventType.touchCancel, promise);
            });
          }
          break;
        case _RenderOpParamsKey.kAddShowFuncType: // 显示隐藏事件
          Map funcParams = _params[_RenderOpParamsKey.kFuncParamsKey] ?? {};
          int showType = funcParams[_RenderOpParamsKey.kShowEventKey] ?? -1;
          if (showType == _ShowType.show.index) {
            renderManager.addNulUITask(() {
              renderManager.setEventListener(
                  _instanceId, _nodeId, EventType.show, promise);
            });
          } else if (showType == _ShowType.dismiss.index) {
            renderManager.addNulUITask(() {
              renderManager.setEventListener(
                  _instanceId, _nodeId, EventType.dismiss, promise);
            });
          }
          break;
      }
    }
  }
}

class _RemoveEventOpTask extends _NodeOpTask {
  _RemoveEventOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    String eventName = _params[_RenderOpParamsKey.kFuncNameKey] ?? '';
    if (eventName.isNotEmpty) {
      switch (eventName) {
        case _RenderOpParamsKey.kRemoveClickFuncType: // 点击事件
          renderManager.addNulUITask(() {
            renderManager.removeEventListener(
                _instanceId, _nodeId, EventType.click);
          });
          break;
        case _RenderOpParamsKey.kRemoveLongClickFuncType: // 长按事件
          renderManager.addNulUITask(() {
            renderManager.removeEventListener(
                _instanceId, _nodeId, EventType.longClick);
          });
          break;
        case _RenderOpParamsKey.kRemoveTouchFuncType: // 触摸事件
          Map funcParams = _params[_RenderOpParamsKey.kFuncParamsKey] ?? {};
          int touchType = funcParams[_RenderOpParamsKey.kTouchTypeKey] ?? -1;
          if (touchType == _TouchType.start.index) {
            renderManager.addNulUITask(() {
              renderManager.removeEventListener(
                  _instanceId, _nodeId, EventType.touchStart);
            });
          } else if (touchType == _TouchType.move.index) {
            renderManager.addNulUITask(() {
              renderManager.removeEventListener(
                  _instanceId, _nodeId, EventType.touchMove);
            });
          } else if (touchType == _TouchType.end.index) {
            renderManager.addNulUITask(() {
              renderManager.removeEventListener(
                  _instanceId, _nodeId, EventType.touchEnd);
            });
          } else if (touchType == _TouchType.cancel) {
            renderManager.addNulUITask(() {
              renderManager.removeEventListener(
                  _instanceId, _nodeId, EventType.touchCancel);
            });
          }
          break;
        case _RenderOpParamsKey.kRemoveShowFuncType: // 显示隐藏事件
          Map funcParams = _params[_RenderOpParamsKey.kFuncParamsKey] ?? {};
          int showType = funcParams[_RenderOpParamsKey.kShowEventKey] ?? -1;
          if (showType == _ShowType.show.index) {
            renderManager.addNulUITask(() {
              renderManager.removeEventListener(
                  _instanceId, _nodeId, EventType.show);
            });
          } else if (showType == _ShowType.dismiss.index) {
            renderManager.addNulUITask(() {
              renderManager.removeEventListener(
                  _instanceId, _nodeId, EventType.dismiss);
            });
          }
          break;
      }
    }
  }
}

enum EventType {
  click,
  longClick,
  touchStart,
  touchMove,
  touchEnd,
  touchCancel,
  show,
  dismiss
}

enum _TouchType { start, move, end, cancel }

enum _ShowType { show, dismiss }

enum _RenderOpType {
  addNode,
  deleteNode,
  moveNode,
  updateNode,
  updateLayout,
  layoutBefore,
  layoutFinish,
  batch,
  dispatchUiFunc,
  addEvent,
  removeEvent,
}

class _RenderOpParamsKey {
  static const String kParamsKey = 'params';

  static const String kParentNodeIdKey = "pid";
  static const String kChildIndexKey = "index";
  static const String kClassNameKey = "name";
  static const String kFuncNameKey = "func_name";
  static const String kFuncParamsKey = "func_params";
  static const String kFuncIdKey = "callback_id";
  static const String kPropsKey = "props";
  static const String kStylesKey = "styles";
  static const String kMoveIdListKey = "move_id";
  static const String kMovePidKey = "move_pid";
  static const String kLayoutNodesKey = "layout_nodes";

  static const String kTouchTypeKey = "touch_type";
  static const String kTouchX = "x";
  static const String kTouchY = "y";

  static const String kShowEventKey = "show";

  static const String kCallUiFuncType = "call_ui";
  static const String kAddClickFuncType = "add_click";
  static const String kAddLongClickFuncType = "add_long_click";
  static const String kAddTouchFuncType = "add_touch";
  static const String kAddShowFuncType = "add_show";
  static const String kRemoveClickFuncType = "remove_click";
  static const String kRemoveLongClickFuncType = "remove_long_click";
  static const String kRemoveTouchFuncType = "remove_touch";
  static const String kRemoveShowFuncType = "remove_show";
}
