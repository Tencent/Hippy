//
// Tencent is pleased to support the open source community by making
// Hippy available.
//
// Copyright (C) 2019 THL A29 Limited, a Tencent company.
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

  static HashMap<int, VoltronRenderBridgeManager> bridgeMap = HashMap();

  VoltronRenderBridgeManager(
    this._engineId,
    this._context,
  ) : _operatorRunner = RenderOperatorRunner(_context);

  void init() {
    VoltronRenderApi.init();
    _isBridgeInit = true;
    bridgeMap[_engineId] = this;
  }

  Future updateNodeSize(int instanceId,
      {int nodeId = 0, double width = 0, double height = 0}) async {
    if (!_isBridgeInit) {
      return false;
    }
    await VoltronRenderApi.updateNodeSize(
      _engineId,
      instanceId,
      nodeId,
      width,
      height,
    );
  }

  Future notifyDom() async {
    if (!_isBridgeInit) {
      return;
    }
    await VoltronRenderApi.notifyDom(_engineId);
  }

  Future<dynamic> callNativeFunction(
    int rootId,
    String callbackId,
    Object params,
  ) async {
    if (!_isBridgeInit) {
      return false;
    }
    VoltronRenderApi.callNativeFunction(
      _engineId,
      rootId,
      callbackId,
      params,
      true,
    );
  }

  Future<dynamic> execNativeCallback(
    int rootId,
    String callbackId,
    Object params,
  ) async {
    if (!_isBridgeInit) {
      return false;
    }
    var convertParams = params;
    if (params is VoltronMap) {
      convertParams = params.toMap();
    } else if (params is VoltronArray) {
      convertParams = params.toList();
    }
    await callNativeFunction(
      rootId,
      callbackId,
      convertParams,
    );
  }

  Future<dynamic> execNativeEvent(int rootId, int id, String event, Object params) async {
    if (!_isBridgeInit) {
      return false;
    }
    await VoltronRenderApi.callNativeEvent(_engineId, rootId, id, event, params);
  }

  @override
  void destroy() {
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

  int calculateNodeLayout(int instanceId, int nodeId, FlexLayoutParams layoutParams) {
    LogUtils.dBridge(
        'call calculate node layout(page:$instanceId, node:$nodeId, layout:$layoutParams)');
    if (_isBridgeInit) {
      return _context.renderManager.calculateLayout(instanceId, nodeId, layoutParams);
    }
    return layoutParams.defaultOutput();
  }
}
