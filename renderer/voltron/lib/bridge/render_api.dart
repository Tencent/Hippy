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

import 'dart:convert';
import 'dart:ffi';

import 'package:ffi/ffi.dart';
import 'package:flutter/services.dart';
import 'package:voltron_ffi/voltron_ffi.dart';

import '../style.dart';
import '../util.dart';
import 'render_bridge.dart';
import 'render_bridge_define.dart';

/// 管理dart to c++方法调用以及c++ to dart方法注册逻辑
class _RenderBridgeFFIManager {
  static final _RenderBridgeFFIManager _instance = _RenderBridgeFFIManager._internal();
  static const String _kRenderRegisterHeader = 'voltron_renderer_register';

  factory _RenderBridgeFFIManager() => _instance;

  static _RenderBridgeFFIManager get instance => _instance;

  final _library = FfiManager().library;

  // 调用c++ dom相关方法
  late CallNativeFunctionFfiDartType callNativeFunction;

  // 调用c++ dom相关的事件
  late CallNativeEventFfiDartType callNativeEvent;

  // 更新节点宽高
  late UpdateNodeSizeFfiDartType updateNodeSize;

  // 创建voltron native render manager
  late CreateVoltronRenderDartType createNativeRender;

  // 销毁voltron native render manager
  late DestroyVoltronRenderDartType destroyNativeRender;

  // 向native注册或者删除rootView
  late AddRootFfiDartType addRoot;
  late RemoveRootFfiDartType removeRoot;

  late CreateDomFfiDartType createDom;
  late DestroyDomFfiDartType destroyDom;
  late CreateWorkerFfiDartType createWorker;
  late DestroyWorkerFfiDartType destroyWorker;

  _RenderBridgeFFIManager._internal() {
    createNativeRender =
        _library.lookupFunction<CreateVoltronRenderNativeType, CreateVoltronRenderDartType>(
      'CreateVoltronRenderProvider',
    );

    destroyNativeRender =
        _library.lookupFunction<DestroyVoltronRenderNativeType, DestroyVoltronRenderDartType>(
      'DestroyVoltronRenderProvider',
    );

    createDom = _library.lookupFunction<CreateDomFfiNativeType, CreateDomFfiDartType>(
      'CreateDomInstance',
    );

    destroyDom = _library.lookupFunction<DestroyDomFfiNativeType, DestroyDomFfiDartType>(
      'DestroyDomInstance',
    );

    createWorker = _library.lookupFunction<CreateWorkerFfiNativeType, CreateWorkerFfiDartType>(
      'CreateWorkerManager',
    );

    destroyWorker = _library.lookupFunction<DestroyWorkerFfiNativeType, DestroyWorkerFfiDartType>(
      'DestroyWorkerManager',
    );

    addRoot = _library.lookupFunction<AddRootFfiNativeType, AddRootFfiDartType>(
      'AddRoot',
    );
    removeRoot = _library.lookupFunction<RemoveRootFfiNativeType, RemoveRootFfiDartType>(
      'RemoveRoot',
    );

    callNativeFunction =
        _library.lookupFunction<CallNativeFunctionFfiNativeType, CallNativeFunctionFfiDartType>(
      "CallNativeFunctionFFI",
    );

    callNativeEvent =
        _library.lookupFunction<CallNativeEventFfiNativeType, CallNativeEventFfiDartType>(
      "CallNativeEventFFI",
    );

    updateNodeSize =
        _library.lookupFunction<UpdateNodeSizeFfiNativeType, UpdateNodeSizeFfiDartType>(
      'UpdateNodeSize',
    );
  }
}

/// 封装dart to c++的api调用，处理各种中间数据
class VoltronRenderApi {
  static Future init() async {
    _RenderBridgeFFIManager();
    initBridge();
  }

  static int createNativeRender() {
    return _RenderBridgeFFIManager.instance.createNativeRender();
  }

  static Future destroyNativeRender(int nativeRenderId) async {
    _RenderBridgeFFIManager.instance.destroyNativeRender(nativeRenderId);
  }

  static int createDomInstance(int workManagerId) {
    return _RenderBridgeFFIManager.instance.createDom(workManagerId);
  }

  static void destroyDomInstance(int domInstanceId) {
    _RenderBridgeFFIManager.instance.destroyDom(domInstanceId);
  }

  static int createWorkerManager() {
    return _RenderBridgeFFIManager.instance.createWorker();
  }

  static void destroyWorkerManager(int workerManagerId) {
    _RenderBridgeFFIManager.instance.destroyWorker(workerManagerId);
  }

  static void addRoot(int domInstanceId, int rootId) {
    _RenderBridgeFFIManager.instance.addRoot(domInstanceId, rootId);
  }

  static void removeRoot(int domInstanceId, int rootId) {
    _RenderBridgeFFIManager.instance.removeRoot(domInstanceId, rootId);
  }

  static Future updateNodeSize(
    int renderManagerId,
    int rootId,
    int nodeId,
    double width,
    double height,
  ) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    _RenderBridgeFFIManager.instance.updateNodeSize(renderManagerId, rootId, nodeId, width, height);
    stopwatch.stop();
    LogUtils.profile("update node size cost", stopwatch.elapsedMilliseconds);
  }

  static Pointer<Utf16> strByteDataToPointer(ByteData data) {
    var units = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
    var result = utf8.decode(units);
    return result.toNativeUtf16();
  }

  static Future<dynamic> callNativeFunction(
    int engineId,
    int renderManagerId,
    String callId,
    Object params,
    bool keep,
  ) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var callIdU16 = callId.toNativeUtf16();
    var encodeParamsByteData = const StandardMessageCodec().encodeMessage(params);
    if (encodeParamsByteData != null) {
      var length = encodeParamsByteData.lengthInBytes;
      final result = malloc<Uint8>(length);
      final nativeParams = result.asTypedList(length);
      nativeParams.setRange(
        0,
        length,
        encodeParamsByteData.buffer.asUint8List(),
      );
      _RenderBridgeFFIManager.instance.callNativeFunction(
        engineId,
        renderManagerId,
        callIdU16,
        result,
        length,
        keep ? 1 : 0,
      );
      free(result);
      stopwatch.stop();
      LogUtils.profile("callNativeFunction", stopwatch.elapsedMilliseconds);
    } else {
      LogUtils.e(
        'Voltron::Bridge',
        'call native function error, invalid params',
      );
    }

    free(callIdU16);
  }

  static Future callNativeEvent(
    int renderManagerId,
    int rootId,
    int nodeId,
    String eventName,
    bool useCapture,
    bool useBubble,
    Object params,
  ) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var eventU16 = eventName.toNativeUtf16();
    LogUtils.i('Voltron::Bridge', 'ID:$nodeId, call native event $eventName');
    var encodeParamsByteData = const StandardMessageCodec().encodeMessage(params);
    if (encodeParamsByteData != null) {
      var length = encodeParamsByteData.lengthInBytes;
      final result = malloc<Uint8>(length);
      final nativeParams = result.asTypedList(length);
      nativeParams.setRange(
        0,
        length,
        encodeParamsByteData.buffer.asUint8List(),
      );
      _RenderBridgeFFIManager.instance.callNativeEvent(
        renderManagerId,
        rootId,
        nodeId,
        eventU16,
        useCapture,
        useBubble,
        result,
        length,
      );
      free(result);
      stopwatch.stop();
      LogUtils.profile("callNativeEvent", stopwatch.elapsedMilliseconds);
    } else {
      LogUtils.e('Voltron::Bridge', 'call native event error, invalid params');
    }

    free(eventU16);
  }

// ------------------ dart call native方法 end ---------------------

  // 初始化bridge层
  static void initBridge() async {
    // 添加自定义c++ call dart方法注册器
    FfiManager().addFuncExRegister(
      _RenderBridgeFFIManager._kRenderRegisterHeader,
      'RegisterRenderCallFunc',
    );

    // 添加postRenderOp回调
    var postRenderRegisterFunc = FfiManager().library.lookupFunction<
        AddCallFuncNativeType<PostRenderOpNativeType>,
        AddCallFuncDartType<PostRenderOpNativeType>>(FfiManager().registerFuncName);

    var postRenderOpFunc = Pointer.fromFunction<PostRenderOpNativeType>(postRenderOp);
    FfiManager().addRegisterFunc(
      _RenderBridgeFFIManager._kRenderRegisterHeader,
      RenderFuncType.postRenderOp.index,
      postRenderOpFunc,
      postRenderRegisterFunc,
    );

    // 添加layout回调
    var calculateNodeLayoutRegisterFunc = FfiManager().library.lookupFunction<
        AddCallFuncNativeType<CalculateNodeLayoutNativeType>,
        AddCallFuncDartType<CalculateNodeLayoutNativeType>>(FfiManager().registerFuncName);
    var calculateNodeLayoutFunc =
        Pointer.fromFunction<CalculateNodeLayoutNativeType>(calculateNodeLayout);
    FfiManager().addRegisterFunc(
      _RenderBridgeFFIManager._kRenderRegisterHeader,
      RenderFuncType.calculateNodeLayout.index,
      calculateNodeLayoutFunc,
      calculateNodeLayoutRegisterFunc,
    );
  }
}

// ------------------ native call dart方法 start ---------------------

void postRenderOp(
  int engineId,
  int rootId,
  Pointer<Void> data,
  int len,
) {
  var dataList = data.cast<Uint8>().asTypedList(len);
  if (dataList.isNotEmpty) {
    var renderOpList = const StandardMessageCodec().decodeMessage(dataList.buffer.asByteData());
    final bridge = VoltronRenderBridgeManager.bridgeMap[engineId];
    if (bridge != null) {
      bridge.postRenderOp(rootId, renderOpList);
    }
  }
}

Pointer<Int64> calculateNodeLayout(
  int engineId,
  int rootId,
  int nodeId,
  double width,
  int widthMode,
  double height,
  int heightMode,
) {
  try {
    final bridge = VoltronRenderBridgeManager.bridgeMap[engineId];
    var layoutParams = FlexLayoutParams(width, height, widthMode, heightMode);
    var result = layoutParams.defaultOutput();
    if (bridge != null) {
      result = bridge.calculateNodeLayout(rootId, nodeId, layoutParams);
    }

    final resultPtr = malloc<Int64>(1);
    resultPtr.asTypedList(1)[0] = result;
    return resultPtr;
  } catch (err) {
    LogUtils.d('calculateNodeLayout', err.toString());
  }
  return Pointer.fromAddress(0);
}

// ------------------ native call dart方法 end ---------------------
