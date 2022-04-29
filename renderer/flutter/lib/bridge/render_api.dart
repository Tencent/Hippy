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

import 'dart:convert';
import 'dart:ffi';
import 'dart:isolate';

import 'package:ffi/ffi.dart';
import 'package:flutter/services.dart';

import '../style.dart';
import '../util.dart';
import 'global_callback.dart';
import 'render_bridge.dart';
import 'render_bridge_define.dart';

/// 管理dart to c++方法调用以及c++ to dart方法注册逻辑
class _RenderBridgeFFIManager {
  static _RenderBridgeFFIManager? _instance;

  factory _RenderBridgeFFIManager() => _getInstance();

  static _RenderBridgeFFIManager get instance => _getInstance();

  final DynamicLibrary _library = loadLibrary("voltron_core", isStatic: false);

  final _interactiveCppRequests = ReceivePort()..listen(requestExecuteCallback);

  // 调用c++ dom相关方法
  late CallNativeFunctionFfiDartType callNativeFunction;

  // 调用c++ dom相关的事件
  late CallNativeEventFfiDartType callNativeEvent;

  // 更新节点宽高
  late UpdateNodeSizeFfiDartType updateNodeSize;

  late NotifyDomDartType notifyDom;

  // 向c侧注册dart方法
  late RegisterCallbackFfiDartType registerCallback;
  late RegisterPostRenderOpFfiDartType registerPostRenderOp;
  late RegisterCalculateNodeLayoutFfiDartType registerCalculateNode;

  // 注册回调port和post指针
  late RegisterDartPostCObjectDartType registerDartPostCObject;

  // 执行回调任务
  late ExecuteCallbackDartType executeCallback;

  static _RenderBridgeFFIManager _getInstance() {
    // 只能有一个实例
    _instance ??= _RenderBridgeFFIManager._internal();
    return _instance!;
  }

  _RenderBridgeFFIManager._internal() {
    registerDartPostCObject = _library.lookupFunction<
        RegisterDartPostCObjectNativeType,
        RegisterDartPostCObjectDartType>("VoltronRegisterDartPostCObject");

    executeCallback = _library.lookupFunction<ExecuteCallbackNativeType,
        ExecuteCallbackDartType>('VoltronExecuteCallback');

    callNativeFunction = _library.lookupFunction<
        CallNativeFunctionFfiNativeType,
        CallNativeFunctionFfiDartType>("CallNativeFunctionFFI");

    callNativeEvent = _library.lookupFunction<CallNativeEventFfiNativeType,
        CallNativeEventFfiDartType>("CallNativeEventFFI");

    updateNodeSize = _library.lookupFunction<UpdateNodeSizeFfiNativeType,
        UpdateNodeSizeFfiDartType>('UpdateNodeSize');

    notifyDom = _library.lookupFunction<NotifyDomNativeType, NotifyDomDartType>(
        'NotifyRenderManager');

    registerCallback = _library.lookupFunction<RegisterCallbackFfiNativeType,
        RegisterCallbackFfiDartType>("RegisterCallFunc");
    registerPostRenderOp = _library.lookupFunction<
        RegisterPostRenderOpFfiNativeType,
        RegisterPostRenderOpFfiDartType>("RegisterCallFunc");
    registerCalculateNode = _library.lookupFunction<
        RegisterCalculateNodeLayoutFfiNativeType,
        RegisterCalculateNodeLayoutFfiDartType>("RegisterCallFunc");
  }
}

/// 封装dart to c++的api调用，处理各种中间数据
class VoltronRenderApi {
  static Future init() async {
    _RenderBridgeFFIManager._getInstance();
    await initBridge();
  }

  static Future updateNodeSize(
      int engineId, int rootId, int nodeId, double width, double height) async {
    var stopwatch = Stopwatch();

    stopwatch.start();
    _RenderBridgeFFIManager.instance
        .updateNodeSize(engineId, rootId, nodeId, width, height);
    stopwatch.stop();
    LogUtils.profile("update node size cost", stopwatch.elapsedMilliseconds);
  }

  static Pointer<Utf16> strByteDataToPointer(ByteData data) {
    var units = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
    var result = utf8.decode(units);
    return result.toNativeUtf16();
  }

  static Future notifyDom(int engineId) async {
    _RenderBridgeFFIManager.instance.notifyDom(engineId);
  }

  static Future<dynamic> callNativeFunction(
      int engineId, int rootId, String callId, Object params, bool keep) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var callIdU16 = callId.toNativeUtf16();
    var encodeParamsByteData =
        const StandardMessageCodec().encodeMessage(params);
    if (encodeParamsByteData != null) {
      var length = encodeParamsByteData.lengthInBytes;
      final result = malloc<Uint8>(length);
      final nativeParams = result.asTypedList(length);
      nativeParams.setRange(
          0, length, encodeParamsByteData.buffer.asUint8List());
      _RenderBridgeFFIManager.instance.callNativeFunction(
          engineId, rootId, callIdU16, result, length, keep ? 1 : 0);
      free(result);
      stopwatch.stop();
      LogUtils.profile("callNativeFunction", stopwatch.elapsedMilliseconds);
    } else {
      LogUtils.e(
          'Voltron::Bridge', 'call native function error, invalid params');
    }

    free(callIdU16);
  }

  static Future callNativeEvent(int engineId, int rootId, int nodeId,
      String eventName, Object params) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var eventU16 = eventName.toNativeUtf16();
    LogUtils.i('Voltron::Bridge', 'call native event $eventName');
    var encodeParamsByteData =
        const StandardMessageCodec().encodeMessage(params);
    if (encodeParamsByteData != null) {
      var length = encodeParamsByteData.lengthInBytes;
      final result = malloc<Uint8>(length);
      final nativeParams = result.asTypedList(length);
      nativeParams.setRange(
          0, length, encodeParamsByteData.buffer.asUint8List());
      _RenderBridgeFFIManager.instance
          .callNativeEvent(engineId, rootId, nodeId, eventU16, result, length);
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
  static Future<dynamic> initBridge() async {
    // 先注册回调的post指针和port端口号
    final nativePort = _RenderBridgeFFIManager
        .instance._interactiveCppRequests.sendPort.nativePort;
    _RenderBridgeFFIManager.instance
        .registerDartPostCObject(NativeApi.postCObject, nativePort);

    // 注册全局回调
    var globalCallbackFunc =
        Pointer.fromFunction<GlobalCallback>(globalCallback);
    _RenderBridgeFFIManager.instance.registerCallback(
        RenderFuncType.globalCallback.index, globalCallbackFunc);

    // 注册postRenderOp回调
    var postRenderOpFunc =
        Pointer.fromFunction<PostRenderOpNativeType>(postRenderOp);
    _RenderBridgeFFIManager.instance.registerPostRenderOp(
        RenderFuncType.postRenderOp.index, postRenderOpFunc);

    // 注册layout回调
    var calculateNodeLayoutFunc =
        Pointer.fromFunction<CalculateNodeLayoutNativeType>(
            calculateNodeLayout);
    _RenderBridgeFFIManager.instance.registerCalculateNode(
        RenderFuncType.calculateNodeLayout.index, calculateNodeLayoutFunc);
  }
}

// ------------------ native call dart方法 start ---------------------

// 提供全局listen port，从c ffi侧传入work方法指针后，直接调用executeCallback执行
void requestExecuteCallback(dynamic message) {
  final int workAddress = message;
  final work = Pointer<Work>.fromAddress(workAddress);
  _RenderBridgeFFIManager.instance.executeCallback(work);
}

void postRenderOp(int engineId, int rootId, Pointer<Void> data, int len) {
  var dataList = data.cast<Uint8>().asTypedList(len);
  if (dataList.isNotEmpty) {
    var renderOpList = const StandardMessageCodec()
        .decodeMessage(dataList.buffer.asByteData());
    final bridge = VoltronRenderBridgeManager.bridgeMap[engineId];
    if (bridge != null) {
      bridge.postRenderOp(rootId, renderOpList);
    }
  }
}

Pointer<Int64> calculateNodeLayout(int engineId, int rootId, int nodeId,
    double width, int widthMode, double height, int heightMode) {
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
