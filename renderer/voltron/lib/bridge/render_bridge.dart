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

import 'dart:collection';

import '../common.dart';
import '../render.dart';
import '../style.dart';
import '../util.dart';
import 'render_api.dart';

/// voltron外层业务逻辑对c++调用逻辑的bridge封装
class VoltronRenderBridgeManager implements Destroyable {
  final int _engineId;
  final RenderContext _context;
  final RenderOperatorRunner _operatorRunner;

  bool _isBridgeInit = false;
  int _workerManagerId = 0;

  int get workerId => _workerManagerId;

  int get engineId => _engineId;

  static HashMap<int, VoltronRenderBridgeManager> bridgeMap = HashMap();

  VoltronRenderBridgeManager(
    this._engineId,
    this._context,
  )   : _operatorRunner = RenderOperatorRunner(_context),
        _workerManagerId = VoltronRenderApi.createWorkerManager();

  void init() {
    VoltronRenderApi.init();
    _isBridgeInit = true;
    bridgeMap[_engineId] = this;
  }

  int createDomInstance() {
    if (_workerManagerId == 0) {
      return 0;
    }
    return VoltronRenderApi.createDomInstance(_workerManagerId);
  }

  void destroyDomInstance(int domInstanceId) {
    VoltronRenderApi.destroyDomInstance(domInstanceId);
  }

  void addRoot(int domInstanceId, int rootId) {
    VoltronRenderApi.addRoot(domInstanceId, rootId);
  }

  void removeRoot(int domInstanceId, int rootId) {
    VoltronRenderApi.removeRoot(domInstanceId, rootId);
  }

  int createNativeRenderManager() {
    return VoltronRenderApi.createNativeRender();
  }

  Future destroyNativeRenderManager() async {
    await VoltronRenderApi.destroyNativeRender(
      _context.renderManager.getNativeId(),
    );
  }

  Future updateNodeSize(
    int rootId, {
    int nodeId = 0,
    double width = 0,
    double height = 0,
  }) async {
    if (!_isBridgeInit) {
      return false;
    }
    await VoltronRenderApi.updateNodeSize(
      _context.renderManager.getNativeId(),
      rootId,
      nodeId,
      width,
      height,
    );
  }

  Future<dynamic> callNativeFunction(
    String callbackId,
    Object params,
  ) async {
    if (!_isBridgeInit) {
      return false;
    }
    VoltronRenderApi.callNativeFunction(
      _engineId,
      _context.renderManager.getNativeId(),
      callbackId,
      params.toOriginObject(),
      true,
    );
  }

  /// dispatch root event, such as frameUpdate
  Future<dynamic> sendRootEvent(
    int rootId,
    int id,
    String event,
    Object params,
  ) async {
    if (!_isBridgeInit) {
      return false;
    }
    await VoltronRenderApi.callNativeEvent(
      _context.renderManager.getNativeId(),
      rootId,
      id,
      event,
      false,
      false,
      params.toOriginObject(),
    );
  }

  /// Dispatch UI component event, such as click, doubleClick.
  Future<dynamic> sendGestureEvent(
    int rootId,
    int id,
    String event,
    Object params,
  ) async {
    if (!_isBridgeInit) {
      return false;
    }
    await VoltronRenderApi.callNativeEvent(
      _context.renderManager.getNativeId(),
      rootId,
      id,
      event.toLowerCase(),
      true,
      true,
      params.toOriginObject(),
    );
  }

  /// Dispatch UI component event, such as onLayout, onScroll, onInitialListReady.
  Future<dynamic> sendComponentEvent(
    int rootId,
    int id,
    String event,
    Object params,
  ) async {
    if (!_isBridgeInit) {
      return false;
    }
    await VoltronRenderApi.callNativeEvent(
      _context.renderManager.getNativeId(),
      rootId,
      id,
      event.toLowerCase(),
      false,
      false,
      params.toOriginObject(),
    );
  }

  @override
  void destroy() {
    if (_workerManagerId != 0) {
      VoltronRenderApi.destroyWorkerManager(_workerManagerId);
      _workerManagerId = 0;
    }
    _isBridgeInit = false;
    bridgeMap.remove(_engineId);
  }

  void postRenderOp(int rootId, dynamic renderOp) {
    LogUtils.dBridge('call post render op ($renderOp)');
    if (_isBridgeInit) {
      if (renderOp is List) {
        _operatorRunner.consumeRenderOp(rootId, renderOp);
      }
    }
  }

  int calculateNodeLayout(
    int instanceId,
    int nodeId,
    FlexLayoutParams layoutParams,
  ) {
    LogUtils.dBridge(
      'ID:$nodeId, call calculate node layout, page:$instanceId, parent layout:$layoutParams',
    );
    if (_isBridgeInit) {
      return _context.virtualNodeManager.measure(
        instanceId,
        nodeId,
        layoutParams,
      );
    }
    return layoutParams.defaultOutput();
  }
}
