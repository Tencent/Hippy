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
import 'package:voltron_renderer/voltron_renderer.dart';

import 'bridge_define.dart';
import 'voltron_bridge.dart';

/// 管理dart to c++方法调用以及c++ to dart方法注册逻辑
class _BridgeFFIManager {
  static _BridgeFFIManager? _instance;

  factory _BridgeFFIManager() => _getInstance();

  static _BridgeFFIManager get instance => _getInstance();

  final DynamicLibrary _library = loadLibrary("voltron_core", isStatic: false);

  // ffi bridge native侧的一些初始化
  late InitBridgeFfiDartType initBridge;

  // 初始化js framework
  late InitJsFrameworkFfiDartType initJsFramework;

  // 从本地文件中执行bundle
  late RunScriptFromFileFfiDartType runScriptFromFile;

  // 从apk资源文件中执行bundle
  late RunScriptFromAssetsFfiDartType runScriptFromAsset;

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

  // 销毁
  late DestroyFfiDartType destroy;

  late NotifyNetworkEventFfiDartType notifyNetworkEvent;

  // 向c侧注册dart方法
  late RegisterCallNativeFfiDartType registerCallNative;
  late RegisterReportJsonFfiDartType registerReportJson;
  late RegisterReportJsFfiDartType registerReportJs;
  late RegisterDestroyFfiDartType registerDestroy;
  late RemoveRootFfiDartType removeRoot;

  // 注册回调port和post指针
  late RegisterDartPostCObjectDartType registerDartPostCObject;

  // 执行回调任务
  late ExecuteCallbackDartType executeCallback;

  static _BridgeFFIManager _getInstance() {
    // 只能有一个实例
    _instance ??= _BridgeFFIManager._internal();

    return _instance!;
  }

  _BridgeFFIManager._internal() {
    initBridge = _library.lookupFunction<InitBridgeFfiNativeType, InitBridgeFfiDartType>(
      "InitBridge",
    );
    initJsFramework =
        _library.lookupFunction<InitJsFrameworkFfiNativeType, InitJsFrameworkFfiDartType>(
      "InitJSFrameworkFFI",
    );

    runScriptFromFile =
        _library.lookupFunction<RunScriptFromFileFfiNativeType, RunScriptFromFileFfiDartType>(
      "RunScriptFromFileFFI",
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

    runScriptFromAsset =
        _library.lookupFunction<RunScriptFromAssetsFfiNativeType, RunScriptFromAssetsFfiDartType>(
      "RunScriptFromAssetsFFI",
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

    registerCallNative =
        _library.lookupFunction<RegisterCallNativeFfiNativeType, RegisterCallNativeFfiDartType>(
      "RegisterCallFunc",
    );
    registerReportJson =
        _library.lookupFunction<RegisterReportJsonFfiNativeType, RegisterReportJsonFfiDartType>(
      "RegisterCallFunc",
    );
    registerReportJs =
        _library.lookupFunction<RegisterReportJsFfiNativeType, RegisterReportJsFfiDartType>(
      "RegisterCallFunc",
    );
    registerDestroy =
        _library.lookupFunction<RegisterDestroyFfiNativeType, RegisterDestroyFfiDartType>(
      "RegisterCallFunc",
    );
    removeRoot = _library.lookupFunction<RemoveRootFfiNativeType, RemoveRootFfiDartType>(
      "RemoveRoot",
    );
  }
}

/// 封装dart to c++的api调用，处理各种中间数据
class VoltronApi {
  // jsc暂时不支持通过bson通信
  static bool get enableVoltronBuffer => (Platform.isIOS || Platform.isMacOS) ? false : true;

  // ------------------ dart call native方法 start ---------------------
  static Future<int> initJsFrameWork(
      {String globalConfig = '',
      bool singleThreadMode = false,
      bool isDevModule = false,
      required int groupId,
      required int engineId,
      required int workerManagerId,
      required int domId,
      required CommonCallback callback,
      String dataDir = '',
      String wsUrl = ''}) async {
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
        engineId, generateCallback((value) {
      callback(value);
    }), dataDir.toNativeUtf16(), wsUrl.toNativeUtf16());
    free(globalConfigPtr);
    return result;
  }

  static void removeRoot(
    int domId,
    int rootId,
  ) {
    _BridgeFFIManager.instance.removeRoot(
      domId,
      rootId,
    );
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

  static Future<bool> runScriptFromFile(
    int engineId,
    String filePath,
    String scriptName,
    String codeCacheDir,
    bool canUseCodeCache,
    CommonCallback callback,
  ) async {
    var filePathPtr = filePath.toNativeUtf16();
    var scriptNamePtr = scriptName.toNativeUtf16();
    var codeCacheDirPtr = codeCacheDir.toNativeUtf16();
    var result = _BridgeFFIManager.instance.runScriptFromFile(
      engineId,
      filePathPtr,
      scriptNamePtr,
      codeCacheDirPtr,
      canUseCodeCache ? 1 : 0,
      generateCallback((value) {
        callback(value);
      }),
    );
    free(filePathPtr);
    free(scriptNamePtr);
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

  static Future<dynamic> runScriptFromAssetWithData(
    int engineId,
    String assetName,
    String codeCacheDir,
    bool canUseCodeCache,
    ByteData assetData,
    CommonCallback callback,
  ) async {
    var stopwatch = Stopwatch();

    stopwatch.reset();
    stopwatch.start();
    var assetNamePtr = assetName.toNativeUtf16();
    var assetStrPtr = strByteDataToPointer(assetData);
    var codeCacheDirPtr = codeCacheDir.toNativeUtf16();
    stopwatch.stop();

    LogUtils.profile("loadBundleEncodeStringUtf8", stopwatch.elapsedMilliseconds);

    stopwatch.reset();
    stopwatch.start();
    _BridgeFFIManager.instance.runScriptFromAsset(
      engineId,
      assetNamePtr,
      codeCacheDirPtr,
      canUseCodeCache ? 1 : 0,
      assetStrPtr,
      generateCallback((value) {
        stopwatch.stop();
        LogUtils.profile("runScriptFromAssetCore", stopwatch.elapsedMilliseconds);
        callback(value);
      }),
    );
    free(assetNamePtr);
    free(codeCacheDirPtr);
  }

  static Future<dynamic> runScriptFromAsset(
    int engineId,
    String assetName,
    String codeCacheDir,
    bool canUseCodeCache,
    CommonCallback callback,
  ) async {
    ByteData? assetData;
    var stopwatch = Stopwatch();
    stopwatch.start();
    try {
      assetData = await rootBundle.load(assetName);
    } catch (e) {
      LogUtils.e("Voltron_bridge", "load asset error:$e");
      rethrow;
    }
    stopwatch.stop();
    LogUtils.profile("loadBundleFromAsset", stopwatch.elapsedMilliseconds);
    runScriptFromAssetWithData(
      engineId,
      assetName,
      codeCacheDir,
      canUseCodeCache,
      assetData,
      callback,
    );
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

  static Future<dynamic> destroy(int engineId, CommonCallback callback, bool isReload) async {
    _BridgeFFIManager.instance.destroy(
      engineId,
      generateCallback((value) {
        callback(value);
      }),
      isReload ? 1 : 0,
    );
  }

// ------------------ dart call native方法 end ---------------------

  // 初始化bridge层
  static Future<dynamic> initBridge() async {
    _BridgeFFIManager.instance.initBridge();

    // 注册callNative回调
    var callNativeFunc = Pointer.fromFunction<CallNativeFfiNativeType>(callNative);
    _BridgeFFIManager.instance.registerCallNative(
      LoaderFuncType.callNative.index + kRenderFuncTypeSize,
      callNativeFunc,
    );

    // 注册reportJsonException回调
    var reportJsonExceptionFunc =
        Pointer.fromFunction<ReportJsonExceptionNativeType>(reportJsonException);
    _BridgeFFIManager.instance.registerReportJson(
      LoaderFuncType.reportJsonException.index + kRenderFuncTypeSize,
      reportJsonExceptionFunc,
    );

    // 注册reportJSException回调
    var reportJSExceptionFunc =
        Pointer.fromFunction<ReportJsExceptionNativeType>(reportJSException);
    _BridgeFFIManager.instance.registerReportJs(
      LoaderFuncType.reportJsException.index + kRenderFuncTypeSize,
      reportJSExceptionFunc,
    );

    // 注册onDestroy回调
    var onDestroyFunc = Pointer.fromFunction<DestroyFunctionNativeType>(onDestroy);
    _BridgeFFIManager.instance.registerDestroy(
      LoaderFuncType.destroy.index + kRenderFuncTypeSize,
      onDestroyFunc,
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

void reportJsonException(int engineId, Pointer<Utf8> jsonValue) {
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

VoltronBridgeManager? getCurrentBridge(int engineId) {
  var bridge = VoltronBridgeManager.bridgeMap[engineId];
  bridge ??= VoltronBridgeManager.bridgeMap[0];
  return bridge;
}

void onDestroy(int engineId) {
  // empty
}

// ------------------ native call dart方法 end ---------------------
