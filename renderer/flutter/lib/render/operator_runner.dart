import '../common/destroy.dart';
import '../engine/engine_context.dart';
import '../flutter_render.dart';
import 'manager.dart';

typedef RenderOpTaskGenerator = RenderOpTask Function(
    int instanceId, int nodeId, Map params);

const int kInvalidIndex = -1;
const int kInvalidId = -1;

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
        _BatchOpTask(instanceId)
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

    renderManager.addUITask(() {
      // todo 创建的时候区分styleMap和非styleMap
      renderManager.createNode(_instanceId, _nodeId, parentId, childIndex.index,
          className, VoltronMap.fromMap(propMap));
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
    renderManager.updateNode(_instanceId, _nodeId, VoltronMap.fromMap(propMap));
  }
}

class _UpdateLayoutOpTask extends _NodeOpTask {
  _UpdateLayoutOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    // addUITask(() {
    //   var newLeft = x;
    //   var newTop = y;
    //
    //   _renderManager.updateLayout(domStyle.rootId, domStyle.id, newLeft,
    //       newTop, domStyle.layoutWidth, domStyle.layoutHeight);
    // });
  }
}

class _MoveNodeOpTask extends _NodeOpTask {
  _MoveNodeOpTask(int instanceId, int nodeId, Map params)
      : super(instanceId, nodeId, params);

  @override
  void _run() {
    var moveIdList = _params[_RenderOpParamsKey.kMoveIdListKey] ?? [];
    var movePid = _params[_RenderOpParamsKey.kMovePidKey];

    renderManager.addUITask(() {
      renderManager.moveNode(
          _instanceId, moveIdList, movePid, _nodeId);
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

enum _RenderOpType {
  addNode,
  deleteNode,
  moveNode,
  updateNode,
  updateLayout,
  batch,
}

class _RenderOpParamsKey {
  static const String kParentNodeIdKey = "pid";
  static const String kChildIndexKey = "index";
  static const String kClassNameKey = "name";
  static const String kFuncNameKey = "func_name";
  static const String kFunParamsKey = "func_params";
  static const String kFunIdKey = "callback_id";
  static const String kPropsKey = "props";
  static const String kStylesKey = "styles";
  static const String kMoveIdListKey = "move_id";
  static const String kMovePidKey = "move_pid";
}
