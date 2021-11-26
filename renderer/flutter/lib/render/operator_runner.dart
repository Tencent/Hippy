
import '../common/destroy.dart';
import '../engine/engine_context.dart';
import '../flutter_render.dart';

typedef RenderOpTaskGenerator = RenderOpTask Function(int nodeId, Map params);

class RenderOperatorRunner implements Destroyable {
  final EngineContext _engineContext;

  final Map<int, RenderOpTaskGenerator> _taskGeneratorMap = {
    _RenderOpType.addNode.index: (nodeId, params) => _AddNodeOpTask(nodeId, params),
    _RenderOpType.deleteNode.index: (nodeId, params) => _DeleteNodeOpTask(nodeId),
    _RenderOpType.moveNode.index: (nodeId, params) => _MoveNodeOpTask(nodeId, params),
    _RenderOpType.updateNode.index: (nodeId, params) => _UpdateNodeOpTask(nodeId, params),
    _RenderOpType.updateLayout.index: (nodeId, params) => _UpdateLayoutOpTask(nodeId, params),
    _RenderOpType.batch.index: (nodeId, params) => _BatchOpTask()
  };

  RenderOperatorRunner(this._engineContext);

  void consumeRenderOp(List renderOpList) {
    if (renderOpList.isNotEmpty) {
      for (var op in renderOpList) {
        _parseOp(op)?._run();
      }
    }
  }

  RenderOpTask? _parseOp(dynamic opData) {
    try {
      if (opData is List && opData.length >= 2) {
        var type = opData[0] as int;
        var nodeId = opData[1] as int;
        var args = opData.length > 2 ? opData[2] as Map : {};
        return _taskGeneratorMap[type]?.call(nodeId, args)
          ?.._engineContext = _engineContext;
      } else {
        LogUtils.dRender(
            'parse render op error, op:$opData, error: Unknown op');
      }
      // ignore: avoid_catching_errors
    } on Error catch (e) {
      LogUtils.dRender('parse render op error, op:$opData, error:$e');
    }
    return null;
  }

  @override
  void destroy() {}
}

mixin RenderOpTask {
  late EngineContext _engineContext;

  EngineContext get engineContext => _engineContext;

  void _run();
}

abstract class _NodeOpTask with RenderOpTask {
  final int _nodeId;
  final Map? _params;

  _NodeOpTask(this._nodeId, this._params);
}

class _AddNodeOpTask extends _NodeOpTask {
  _AddNodeOpTask(int nodeId, Map params): super(nodeId, params);

  @override
  void _run() {}
}

class _DeleteNodeOpTask extends _NodeOpTask {
  _DeleteNodeOpTask(int nodeId): super(nodeId, null);

  @override
  void _run() {}
}

class _UpdateNodeOpTask extends _NodeOpTask {
  _UpdateNodeOpTask(int nodeId, Map params): super(nodeId, params);

  @override
  void _run() {}
}

class _UpdateLayoutOpTask extends _NodeOpTask {
  _UpdateLayoutOpTask(int nodeId, Map params): super(nodeId, params);

  @override
  void _run() {}
}

class _MoveNodeOpTask extends _NodeOpTask {
  _MoveNodeOpTask(int nodeId, Map params) : super(nodeId, params);

  @override
  void _run() {}
}

class _BatchOpTask with RenderOpTask {
  @override
  void _run() {
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
