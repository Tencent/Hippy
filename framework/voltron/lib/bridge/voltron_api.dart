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
import 'dart:core';
import 'dart:ffi';
import 'dart:io';
import 'dart:typed_data';

import 'package:ffi/ffi.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:voltron_ffi/voltron_ffi.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import 'bridge_define.dart';
import 'voltron_bridge.dart';

/// 管理dart to c++方法调用以及c++ to dart方法注册逻辑
class _BridgeFFIManager {
  static const String _kVoltronCoreRegisterHeader = 'voltron_core';
  static _BridgeFFIManager? _instance;

  factory _BridgeFFIManager() => _getInstance();

  static _BridgeFFIManager get instance => _getInstance();

  final DynamicLibrary _library = FfiManager().library;

  // 初始化js framework
  late InitJsFrameworkFfiDartType initJsFramework;

  // 执行js bundle
  late RunScriptFromUriFfiDartType runScriptFromUri;

  // 调用js方法
  late CallFunctionFfiDartType callFunction;

  late GetCrashMessageFfiType getCrashMessage;

  // 初始化native dom
  late LoadInstanceFfiDartType loadInstance;

  // 销毁native dom
  late UnloadInstanceFfiDartType unloadInstance;

  // 绑定dom和render manager
  late BindDomAndRenderDartType bindDomAndRender;

  // 链接rootView和jsRuntime
  late ConnectRootViewAndRuntimeDartType connectRootViewAndRuntime;

  // devtools 请求拦截
  late OnNetworkRequestInvokeDartType onNetworkRequestInvoke;
  late OnNetworkResponseInvokeDartType onNetworkResponseInvoke;

  // 销毁
  late DestroyFfiDartType destroy;

  late CreateDevtoolsDartType createDevtools;

  late DestroyDevtoolsDartType destroyDevtools;

  late NotifyNetworkEventFfiDartType notifyNetworkEvent;

  // 执行回调任务
  late ExecuteCallbackDartType executeCallback;

  // 获取引擎自增id
  late GetVoltronEngineIndexFfiDartType getVoltronEngineIndex;

  static _BridgeFFIManager _getInstance() {
    // 只能有一个实例
    _instance ??= _BridgeFFIManager._internal();

    return _instance!;
  }

  _BridgeFFIManager._internal() {
    initJsFramework =
        _library.lookupFunction<InitJsFrameworkFfiNativeType, InitJsFrameworkFfiDartType>(
      "InitJSFrameworkFFI",
    );

    runScriptFromUri =
        _library.lookupFunction<RunScriptFromUriFfiNativeType, RunScriptFromUriFfiDartType>(
      "RunScriptFromUriFFI",
    );

    notifyNetworkEvent =
        _library.lookupFunction<NotifyNetworkEventFfiNativeType, NotifyNetworkEventFfiDartType>(
      "NotifyNetworkEvent",
    );

    loadInstance = _library.lookupFunction<LoadInstanceFfiNativeType, LoadInstanceFfiDartType>(
      'LoadInstanceFFI',
    );

    bindDomAndRender =
        _library.lookupFunction<BindDomAndRenderNativeType, BindDomAndRenderDartType>(
      'DoBindDomAndRender',
    );

    connectRootViewAndRuntime = _library
        .lookupFunction<ConnectRootViewAndRuntimeNativeType, ConnectRootViewAndRuntimeDartType>(
      'DoConnectRootViewAndRuntime',
    );

    unloadInstance =
        _library.lookupFunction<UnloadInstanceFfiNativeType, UnloadInstanceFfiDartType>(
      'UnloadInstanceFFI',
    );

    callFunction = _library.lookupFunction<CallFunctionFfiNativeType, CallFunctionFfiDartType>(
      "CallFunctionFFI",
    );

    getCrashMessage = _library.lookupFunction<GetCrashMessageFfiType, GetCrashMessageFfiType>(
      "GetCrashMessageFFI",
    );

    destroy = _library.lookupFunction<DestroyFfiNativeType, DestroyFfiDartType>(
      "DestroyFFI",
    );

    onNetworkRequestInvoke =
        _library.lookupFunction<OnNetworkRequestInvokeNativeType, OnNetworkRequestInvokeDartType>(
      'OnNetworkRequestInvoke',
    );
    onNetworkResponseInvoke =
        _library.lookupFunction<OnNetworkResponseInvokeNativeType, OnNetworkResponseInvokeDartType>(
      'OnNetworkResponseInvoke',
    );

    createDevtools = _library.lookupFunction<CreateDevtoolsFfiNativeType, CreateDevtoolsDartType>(
      "CreateDevtoolsFFI",
    );
    destroyDevtools =
        _library.lookupFunction<DestroyDevtoolsFfiNativeType, DestroyDevtoolsDartType>(
      "DestroyDevtoolsFFI",
    );

    getVoltronEngineIndex = _library
        .lookupFunction<GetVoltronEngineIndexFfiNativeType, GetVoltronEngineIndexFfiDartType>(
      'GetVoltronEngineIndexFFI',
    );
  }
}

/// 封装dart to c++的api调用，处理各种中间数据
class VoltronApi {
  // jsc暂时不支持通过bson通信
  static bool get enableVoltronBuffer => (Platform.isIOS || Platform.isMacOS) ? false : true;

  static int getVoltronEngineIndex() {
    return _BridgeFFIManager.instance.getVoltronEngineIndex();
  }

  // ------------------ dart call native方法 start ---------------------
  static Future<int> initJsFrameWork({
    String globalConfig = '',
    bool singleThreadMode = false,
    bool isDevModule = false,
    required int groupId,
    required int engineId,
    required int workerManagerId,
    required int domId,
    required CommonCallback callback,
    required int devtoolsId,
  }) async {
    var globalConfigPtr = globalConfig.toNativeUtf16();
    globalConfig.toNativeUtf16();
    var result = _BridgeFFIManager.instance.initJsFramework(
      globalConfigPtr,
      singleThreadMode ? 1 : 0,
      enableVoltronBuffer ? 0 : 1,
      isDevModule ? 1 : 0,
      groupId,
      workerManagerId,
      domId,
      engineId,
      generateCallback(
        (value) {
          callback(value);
        },
      ),
      devtoolsId,
    );
    free(globalConfigPtr);
    return result;
  }

  static void bindDomAndRender(
    int domInstanceId,
    int engineId,
    int renderManagerId,
  ) {
    _BridgeFFIManager.instance.bindDomAndRender(
      domInstanceId,
      engineId,
      renderManagerId,
    );
  }

  static void connectRootViewAndRuntime(
    int engineId,
    int rootId,
  ) {
    _BridgeFFIManager.instance.connectRootViewAndRuntime(
      engineId,
      rootId,
    );
  }

  static VoltronPair<Pointer<Uint8>, Uint8List> _parseParams(Object params) {
    if (enableVoltronBuffer) {
      var paramsBuffer = params.encode();
      assert(paramsBuffer.isNotEmpty);
      final paramsPointer = malloc<Uint8>(paramsBuffer.length);
      final nativeParams = paramsPointer.asTypedList(paramsBuffer.length);
      nativeParams.setRange(0, paramsBuffer.length, paramsBuffer);
      return VoltronPair(paramsPointer, nativeParams);
    } else {
      var paramsJson = objectToJson(params);
      assert(paramsJson.isNotEmpty);
      final units = utf8.encode(paramsJson);
      final Pointer<Uint8> result = malloc<Uint8>(units.length + 1);
      final Uint8List nativeString = result.asTypedList(units.length + 1);
      nativeString.setAll(0, units);
      nativeString[units.length] = 0;
      return VoltronPair(result, nativeString);
    }
  }

  static Future<bool> runScriptFromUri(
    int engineId,
    int vfsId,
    String uri,
    String codeCacheDir,
    bool canUseCodeCache,
    bool isLocalFile,
    CommonCallback callback,
  ) async {
    var uriPtr = uri.toNativeUtf16();
    var codeCacheDirPtr = codeCacheDir.toNativeUtf16();
    var result = _BridgeFFIManager.instance.runScriptFromUri(
      engineId,
      vfsId,
      uriPtr,
      codeCacheDirPtr,
      canUseCodeCache ? 1 : 0,
      isLocalFile ? 1 : 0,
      generateCallback(
        (value) {
          callback(value);
        },
      ),
    );
    free(uriPtr);
    free(codeCacheDirPtr);
    return result == 1;
  }

  /// network notification, when network a request will be sent to server
  static void notifyRequestWillBeSent(
    int engineId,
    String requestId,
    String requestContent,
  ) {
    var contentPtr = requestContent.toNativeUtf16();
    var requestIdPtr = requestId.toNativeUtf16();
    _BridgeFFIManager.instance.notifyNetworkEvent(
      engineId,
      requestIdPtr,
      NetworkEventType.requestWillBeSent.index,
      contentPtr,
      nullptr,
    );
    free(contentPtr);
    free(requestIdPtr);
  }

  /// network notification, when a network request response received
  static void notifyResponseReceived(
    int engineId,
    String requestId,
    String responseContent,
    String bodyData,
  ) {
    var contentPtr = responseContent.toNativeUtf16();
    var requestIdPtr = requestId.toNativeUtf16();
    var extraPtr = bodyData.toNativeUtf16();
    _BridgeFFIManager.instance.notifyNetworkEvent(
      engineId,
      requestIdPtr,
      NetworkEventType.responseReceived.index,
      contentPtr,
      extraPtr,
    );
    free(requestIdPtr);
    free(contentPtr);
    free(extraPtr);
  }

  /// network notification, when a network request will response Finished
  static void notifyLoadingFinished(
    int engineId,
    String requestId,
    String loadingFinishContent,
  ) {
    var contentPtr = loadingFinishContent.toNativeUtf16();
    var requestIdPtr = requestId.toNativeUtf16();
    _BridgeFFIManager.instance.notifyNetworkEvent(
      engineId,
      requestIdPtr,
      NetworkEventType.loadingFinished.index,
      contentPtr,
      nullptr,
    );
    free(contentPtr);
    free(requestIdPtr);
  }

  static Pointer<Utf16> strByteDataToPointer(ByteData data) {
    var units = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
    var result = utf8.decode(units);
    return result.toNativeUtf16();
  }

  static Future loadInstance(
    int engineId,
    VoltronMap params,
  ) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var paramsPair = _parseParams(params);
    stopwatch.stop();
    LogUtils.profile("loadInstance parse params", stopwatch.elapsedMilliseconds);
    _BridgeFFIManager.instance.loadInstance(
      engineId,
      paramsPair.left,
      paramsPair.right.length,
    );
    stopwatch.stop();
    LogUtils.profile("loadInstance", stopwatch.elapsedMilliseconds);
    free(paramsPair.left);
  }

  static Future unloadInstance(
    int engineId,
    VoltronMap params,
  ) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var paramsPair = _parseParams(params);
    stopwatch.stop();
    LogUtils.profile("unloadInstance parse params", stopwatch.elapsedMilliseconds);
    _BridgeFFIManager.instance.unloadInstance(
      engineId,
      paramsPair.left,
      paramsPair.right.length,
    );
    stopwatch.stop();
    LogUtils.profile("unloadInstance", stopwatch.elapsedMilliseconds);
  }

  static Future<dynamic> callFunction(
    int engineId,
    String action,
    Object params,
    CommonCallback callback,
  ) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var actionPtr = action.toNativeUtf16();
    var paramsPair = _parseParams(params);
    stopwatch.stop();
    LogUtils.profile("callFunction", stopwatch.elapsedMilliseconds);
    _BridgeFFIManager.instance.callFunction(
      engineId,
      actionPtr,
      paramsPair.left,
      paramsPair.right.length,
      generateCallback((value) {
        stopwatch.stop();
        LogUtils.profile("callFunction", stopwatch.elapsedMilliseconds);
        callback(value);
      }),
    );
    free(actionPtr);
    free(paramsPair.left);
  }

  static Future<String> getCrashMessage() async {
    final crashMessage = _BridgeFFIManager.instance.getCrashMessage();
    return crashMessage.toDartString();
  }

  static Future<dynamic> destroy(
    int engineId,
    CommonCallback callback,
    bool isReload,
  ) async {
    _BridgeFFIManager.instance.destroy(
      engineId,
      generateCallback((value) {
        callback(value);
      }),
      isReload ? 1 : 0,
    );
  }

  static Future<int> createDevtools({
    required int workerManagerId,
    String dataDir = '',
    String wsUrl = '',
  }) async {
    return _BridgeFFIManager.instance.createDevtools(
      workerManagerId,
      dataDir.toNativeUtf16(),
      wsUrl.toNativeUtf16(),
    );
  }

  static Future<dynamic> destroyDevtools(
    int devtoolsId,
    bool isReload,
  ) async {
    _BridgeFFIManager.instance.destroyDevtools(
      devtoolsId,
      isReload ? 1 : 0,
    );
  }

// ------------------ dart call native方法 end ---------------------

  // 初始化bridge层
  static void initBridge() {
    // 添加自定义c++ call dart方法注册器
    FfiManager().addFuncExRegister(
      _BridgeFFIManager._kVoltronCoreRegisterHeader,
      'RegisterVoltronCoreCallFuncEx',
    );

    // 注册callNative回调
    var callNativeRegisterFunc = FfiManager()
        .library
        .lookupFunction<AddCallFuncNativeType<CallNativeFfi>, AddCallFuncDartType<CallNativeFfi>>(
          FfiManager().registerFuncName,
        );
    var callNativeFunc = Pointer.fromFunction<CallNativeFfi>(callNative);
    FfiManager().addRegisterFunc(
      _BridgeFFIManager._kVoltronCoreRegisterHeader,
      LoaderFuncType.callNative.index,
      callNativeFunc,
      callNativeRegisterFunc,
    );

    // 注册reportJsonException回调
    var reportJsonExceptionRegisterFunc = FfiManager().library.lookupFunction<
            AddCallFuncNativeType<ReportJsonException>, AddCallFuncDartType<ReportJsonException>>(
          FfiManager().registerFuncName,
        );
    var reportJsonExceptionFunc = Pointer.fromFunction<ReportJsonException>(reportJsonException);
    FfiManager().addRegisterFunc(
      _BridgeFFIManager._kVoltronCoreRegisterHeader,
      LoaderFuncType.reportJsonException.index,
      reportJsonExceptionFunc,
      reportJsonExceptionRegisterFunc,
    );

    // 注册reportJSException回调
    var reportJsExceptionRegisterFunc = FfiManager().library.lookupFunction<
            AddCallFuncNativeType<ReportJsException>, AddCallFuncDartType<ReportJsException>>(
          FfiManager().registerFuncName,
        );
    var reportJSExceptionFunc = Pointer.fromFunction<ReportJsException>(reportJSException);
    FfiManager().addRegisterFunc(
      _BridgeFFIManager._kVoltronCoreRegisterHeader,
      LoaderFuncType.reportJsException.index,
      reportJSExceptionFunc,
      reportJsExceptionRegisterFunc,
    );
  }
}

// ------------------ native call dart方法 start ---------------------

void callNative(
  int engineId,
  Pointer<Utf16> moduleNamePtr,
  Pointer<Utf16> moduleFuncPtr,
  Pointer<Utf16> callIdPtr,
  Pointer<Void> paramsDataPtr,
  int paramsLen,
  int bridgeParamJsonInt,
) {
  var bridgeParamJson = bridgeParamJsonInt == 1;
  var moduleName = moduleNamePtr.toDartString();
  var moduleFunc = moduleFuncPtr.toDartString();
  var callId = callIdPtr.toDartString();
  var dataList = paramsDataPtr.cast<Uint8>().asTypedList(paramsLen);

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.callNatives(
      moduleName,
      moduleFunc,
      callId,
      dataList,
      bridgeParamJson,
    );
  }
}

void reportJsonException(
  int engineId,
  Pointer<Utf8> jsonValue,
) {
  var exception = jsonValue.toDartString();
  LogUtils.e("Voltron_bridge", "reportJsonException\n !!!!!!!!!!!!!!!!!!! \n Error($exception)");

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.reportException(exception, "");
  }
}

void reportJSException(
  int engineId,
  Pointer<Utf16> descriptionStream,
  Pointer<Utf16> stackStream,
) {
  var exception = descriptionStream.toDartString();
  var stackTrace = stackStream.toDartString();
  LogUtils.e(
    "Voltron_bridge",
    "reportJsException\n !!!!!!!!!!!!!!!!!!! \n Error($exception)\n StackTrace($stackTrace)",
  );

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.reportException(exception, stackTrace);
  }
}

VoltronBridgeManager? getCurrentBridge(
  int engineId,
) {
  var bridge = VoltronBridgeManager.bridgeMap[engineId];
  bridge ??= VoltronBridgeManager.bridgeMap[0];
  return bridge;
}

// ------------------ native call dart方法 end ---------------------
