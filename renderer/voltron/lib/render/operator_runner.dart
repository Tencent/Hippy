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

import 'dart:typed_data';

import '../voltron_renderer.dart';

typedef RenderOpTaskGenerator = RenderOpTask Function(int instanceId, int nodeId, Map params);

const int kInvalidIndex = -1;
const int kInvalidId = -1;

extension IdIntEx on int {
  bool isValidId() {
    return this != kInvalidId;
  }
}

class RenderOperatorRunner implements Destroyable {
  late RenderContext _renderContext;

  final Map<int, RenderOpTaskGenerator> _taskGeneratorMap = {
    _RenderOpType.addNode.index: _AddNodeOpTask.new,
    _RenderOpType.deleteNode.index: (instanceId, nodeId, params) =>
        _DeleteNodeOpTask(instanceId, nodeId),
    _RenderOpType.recombineNode.index: _RecombineNodeOpTask.new,
    _RenderOpType.moveNode.index: _MoveNodeOpTask.new,
    _RenderOpType.updateNode.index: _UpdateNodeOpTask.new,
    _RenderOpType.updateLayout.index: _UpdateLayoutOpTask.new,
    _RenderOpType.batch.index: (instanceId, nodeId, params) => _BatchOpTask(instanceId),
    _RenderOpType.dispatchUiFunc.index: _CallUiFunctionOpTask.new,
    _RenderOpType.addEvent.index: _AddEventOpTask.new,
    _RenderOpType.removeEvent.index: _RemoveEventOpTask.new,
  };

  RenderOperatorRunner();

  void bindRenderContext(RenderContext renderContext) {
    _renderContext = renderContext;
  }

  void consumeRenderOp(int instanceId, List renderOpList) {
    if (renderOpList.isNotEmpty) {
      for (var op in renderOpList) {
        try {
          _parseOp(op as List, instanceId)?._run();
          // ignore: avoid_catching_errors
        } on Error catch (e) {
          LogUtils.dOperate('consume render op error, op:$op, error:$e');
        }
      }
    }
  }

  RenderOpTask? _parseOp(List opData, int instanceId) {
    var type = opData[0] as int;
    var nodeId = opData[1] as int;
    var args = opData.length > 2 ? opData[2] as Map : {};
    return _taskGeneratorMap[type]?.call(instanceId, nodeId, args)
      ?.._renderContext = _renderContext;
  }

  @override
  void destroy() {}
}

abstract class RenderOpTask {
  final int _instanceId;

  RenderOpTask(this._instanceId);

  late RenderContext _renderContext;

  VirtualNodeManager get virtualNodeManager => _renderContext.virtualNodeManager;

  RenderManager get renderManager => _renderContext.renderManager;

  VoltronRenderBridgeManager get bridgeManager => _renderContext.renderBridgeManager;

  void _run();
}

abstract class _NodeOpTask extends RenderOpTask {
  final int _nodeId;
  final Map _params;

  _NodeOpTask(int instanceId, this._nodeId, this._params) : super(instanceId);
}

class _AddNodeOpTask extends _NodeOpTask {
  _AddNodeOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    var className = _params[_RenderOpParamsKey.kClassNameKey] ?? '';
    var childIndex = _params[_RenderOpParamsKey.kChildIndexKey] ?? kInvalidIndex;
    var parentId = _params[_RenderOpParamsKey.kParentNodeIdKey] ?? kInvalidId;
    var styleMap = _params[_RenderOpParamsKey.kStylesKey] ?? {};
    var propMap = _params[_RenderOpParamsKey.kPropsKey] ?? {};
    LogUtils.dOperate(
        'addNode ID:$_nodeId, className:$className, childIndex:$childIndex, parentId: $parentId, styleMap: ${styleMap.toString()}, propMap: ${propMap.toString()}');
    var composePropMap = VoltronMap.fromMap(propMap);
    composePropMap.pushAll(VoltronMap.fromMap(styleMap));
    onCreateNode(_nodeId, className);
    virtualNodeManager.createNode(
      _instanceId,
      _nodeId,
      parentId,
      childIndex,
      className,
      composePropMap,
    );
    if (virtualNodeManager.hasVirtualParent(_nodeId)) return;
    renderManager.addUITask(() {
      renderManager.createNode(
        _instanceId,
        _nodeId,
        parentId,
        childIndex,
        className,
        composePropMap,
      );
    });
  }

  void onCreateNode(int id, String className) {
    if (className == ModalController.kClassName) {
      var width = ScreenUtil.getInstance().screenWidth;
      var height = ScreenUtil.getInstance().screenHeight;
      if (width > 0 && height > 0) {
        bridgeManager.updateNodeSize(
          _instanceId,
          nodeId: _nodeId,
          width: width,
          height: height,
        );
      }
    }
  }
}

class _DeleteNodeOpTask extends _NodeOpTask {
  _DeleteNodeOpTask(int instanceId, int nodeId) : super(instanceId, nodeId, {});

  @override
  void _run() {
    LogUtils.dOperate('deleteNode ID:$_nodeId}');
    if (virtualNodeManager.hasVirtualParent(_nodeId)) {
      virtualNodeManager.deleteNode(_nodeId);
      return;
    }
    virtualNodeManager.deleteNode(_nodeId);
    renderManager.addUITask(() {
      renderManager.deleteNode(_instanceId, _nodeId);
    });
  }
}

class _UpdateNodeOpTask extends _NodeOpTask {
  _UpdateNodeOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    var propMap = _params[_RenderOpParamsKey.kPropsKey] ?? {};
    LogUtils.dOperate('updateNode ID:$_nodeId, propMap:${propMap.toString()}');
    virtualNodeManager.updateNode(_nodeId, VoltronMap.fromMap(propMap));
    if (virtualNodeManager.hasVirtualParent(_nodeId)) return;
    renderManager.addUITask(() {
      renderManager.updateNode(
        _instanceId,
        _nodeId,
        VoltronMap.fromMap(propMap),
      );
    });
  }
}

class _UpdateLayoutOpTask extends _NodeOpTask {
  _UpdateLayoutOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    var layoutNodeList = (_params[_RenderOpParamsKey.kLayoutNodesKey] ?? []) as List;
    for (var layoutNode in layoutNodeList) {
      if (layoutNode is List) {
        var nodeId = (layoutNode[0] ?? kInvalidId) as int;
        if (nodeId.isValidId()) {
          var left = layoutNode[1] ?? 0;
          var top = layoutNode[2] ?? 0;
          var width = layoutNode[3] ?? 0;
          var height = layoutNode[4] ?? 0;
          LogUtils.dOperate(
              'updateLayout ID:$nodeId, top:$top, left:$left, width: $width, height: $height');
          if (virtualNodeManager.hasVirtualParent(nodeId)) continue;
          final TextExtra? supplier = virtualNodeManager.updateLayout(nodeId, width, layoutNode);
          renderManager.addUITask(() {
            if (supplier != null) {
              renderManager.updateExtra(_instanceId, nodeId, supplier);
            }
            renderManager.updateLayout(
              _instanceId,
              nodeId,
              left,
              top,
              width,
              height,
            );
          });
        }
      }
    }
  }
}

class _RecombineNodeOpTask extends _NodeOpTask {
  _RecombineNodeOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    var moveIdList = _params[_RenderOpParamsKey.kMoveIdListKey] ?? [];
    var movePid = _params[_RenderOpParamsKey.kMovePidKey];
    var moveIndex = _params[_RenderOpParamsKey.kMoveIndexKey];
    LogUtils.dOperate(
      'recombineNode ID:$_nodeId, movePid:$movePid, moveIdList:${moveIdList.toString()}, moveIndex:$moveIndex',
    );
    renderManager.addUITask(() {
      renderManager.recombineNode(_instanceId, moveIdList, movePid, moveIndex, _nodeId);
    });
  }
}

class _MoveNodeOpTask extends _NodeOpTask {
  _MoveNodeOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    var moveId = _params[_RenderOpParamsKey.kNodeIdKey] ?? [];
    var movePid = _params[_RenderOpParamsKey.kParentNodeIdKey];
    var moveIndex = _params[_RenderOpParamsKey.kChildIndexKey];
    LogUtils.dOperate(
      'moveNode ID:$_nodeId, movePid:$movePid, moveIndex:$moveIndex',
    );
    var virtualParent = virtualNodeManager.virtualNodes[movePid];
    if (virtualParent == null) {
      renderManager.addUITask(() {
        renderManager.moveNode(_instanceId, moveId, movePid, moveIndex);
      });
    } else {
      virtualNodeManager.moveNode(moveId, virtualParent, moveIndex);
    }
  }
}

class _BatchOpTask extends RenderOpTask {
  _BatchOpTask(int instanceId) : super(instanceId);

  @override
  void _run() {
    LogUtils.dOperate('batch');
    Map<int, TextData>? layoutToUpdate = virtualNodeManager.endBatch();
    if (layoutToUpdate != null) {
      layoutToUpdate.forEach((int id, TextData textData) {
        renderManager.addUITask(() {
          renderManager.updateExtra(_instanceId, id, textData);
        });
      });
    }
    renderManager.renderBatchEnd();
  }
}

class _CallUiFunctionOpTask extends _NodeOpTask {
  _CallUiFunctionOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    String funcName = _params[_RenderOpParamsKey.kFuncNameKey] ?? '';
    if (funcName.isNotEmpty) {
      Uint8List funcParams = _params[_RenderOpParamsKey.kFuncParamsKey] ?? [];
      var realParams = funcParams.decodeType<VoltronArray>() ?? VoltronArray();
      String callbackId = _params[_RenderOpParamsKey.kFuncIdKey] ?? Promise.kCallIdNoCallback;
      var promise = NativePromise(_renderContext, callId: callbackId);
      LogUtils.dOperate(
          'callUIFunction ID:$_nodeId, funcName:$funcName, realParams: ${realParams.toString()}');
      renderManager.addNulUITask(() {
        renderManager.dispatchUIFunction(
          _instanceId,
          _nodeId,
          funcName,
          realParams,
          promise,
        );
      });
      renderManager.renderBatchEnd();
    }
  }
}

class _AddEventOpTask extends _NodeOpTask {
  _AddEventOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    String eventName = _params[_RenderOpParamsKey.kFuncNameKey] ?? '';
    LogUtils.dOperate('addEvent ID:$_nodeId, eventName:$eventName');
    virtualNodeManager.addEvent(_instanceId, _nodeId, eventName);
    if (virtualNodeManager.hasVirtualParent(_nodeId)) return;
    renderManager.addNulUITask(() {
      renderManager.setEventListener(_instanceId, _nodeId, eventName);
    });
  }
}

class _RemoveEventOpTask extends _NodeOpTask {
  _RemoveEventOpTask(int instanceId, int nodeId, Map params) : super(instanceId, nodeId, params);

  @override
  void _run() {
    String eventName = _params[_RenderOpParamsKey.kFuncNameKey] ?? '';
    LogUtils.dOperate('removeEvent ID:$_nodeId, eventName:$eventName');
    virtualNodeManager.removeEvent(_instanceId, _nodeId, eventName);
    if (virtualNodeManager.hasVirtualParent(_nodeId)) return;
    renderManager.addNulUITask(() {
      renderManager.removeEventListener(_instanceId, _nodeId, eventName);
    });
  }
}

enum EventType { click, longClick, touchStart, touchMove, touchEnd, touchCancel, show, dismiss }

enum _RenderOpType {
  addNode,
  deleteNode,
  // 旧版本的moveNode，其实是updateNode内部的衍生操作
  recombineNode,
  moveNode,
  updateNode,
  updateLayout,
  batch,
  dispatchUiFunc,
  addEvent,
  removeEvent,
}

class _RenderOpParamsKey {
  static const String kNodeIdKey = "id";
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
  static const String kMoveIndexKey = "move_index";
  static const String kLayoutNodesKey = "layout_nodes";
}
