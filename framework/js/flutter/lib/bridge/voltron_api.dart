import 'dart:convert';
import 'dart:core';
import 'dart:ffi';
import 'dart:isolate';
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

  final _interactiveCppRequests = ReceivePort()..listen(requestExecuteCallback);

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
  late InitDomFfiDartType initDom;

  // 销毁
  late DestroyFfiDartType destroy;

  // 向c侧注册dart方法
  late RegisterCallNativeFfiDartType registerCallNative;
  late RegisterReportJsonFfiDartType registerReportJson;
  late RegisterReportJsFfiDartType registerReportJs;
  late RegisterSendResponseFfiDartType registerSendResponse;
  late RegisterSendNotificationFfiDartType registerSendNotification;
  late RegisterDestroyFfiDartType registerDestroy;

  // 注册回调port和post指针
  late RegisterDartPostCObjectDartType registerDartPostCObject;

  // 执行回调任务
  late ExecuteCallbackDartType executeCallback;

  static _BridgeFFIManager _getInstance() {
    // 只能有一个实例
    if (_instance == null) {
      _instance = _BridgeFFIManager._internal();
    }

    return _instance!;
  }

  _BridgeFFIManager._internal() {
    registerDartPostCObject = _library.lookupFunction<
        RegisterDartPostCObjectNativeType,
        RegisterDartPostCObjectDartType>("VoltronRegisterDartPostCObject");

    executeCallback = _library.lookupFunction<ExecuteCallbackNativeType,
        ExecuteCallbackDartType>('VoltronExecuteCallback');

    initJsFramework = _library.lookupFunction<InitJsFrameworkFfiNativeType,
        InitJsFrameworkFfiDartType>("InitJSFrameworkFFI");

    runScriptFromFile = _library.lookupFunction<RunScriptFromFileFfiNativeType,
        RunScriptFromFileFfiDartType>("RunScriptFromFileFFI");

    initDom = _library
        .lookupFunction<InitDomFfiNativeType, InitDomFfiDartType>('InitDomFFI');

    runScriptFromAsset = _library.lookupFunction<
        RunScriptFromAssetsFfiNativeType,
        RunScriptFromAssetsFfiDartType>("RunScriptFromAssetsFFI");

    callFunction = _library.lookupFunction<CallFunctionFfiNativeType,
        CallFunctionFfiDartType>("CallFunctionFFI");


    getCrashMessage =
        _library.lookupFunction<GetCrashMessageFfiType, GetCrashMessageFfiType>(
            "GetCrashMessageFFI");

    destroy = _library
        .lookupFunction<DestroyFfiNativeType, DestroyFfiDartType>("DestroyFFI");

    registerCallNative = _library.lookupFunction<
        RegisterCallNativeFfiNativeType,
        RegisterCallNativeFfiDartType>("RegisterCallFunc");
    registerReportJson = _library.lookupFunction<
        RegisterReportJsonFfiNativeType,
        RegisterReportJsonFfiDartType>("RegisterCallFunc");
    registerReportJs = _library.lookupFunction<RegisterReportJsFfiNativeType,
        RegisterReportJsFfiDartType>("RegisterCallFunc");
    registerSendResponse = _library.lookupFunction<
        RegisterSendResponseFfiNativeType,
        RegisterSendResponseFfiDartType>("RegisterCallFunc");
    registerSendNotification = _library.lookupFunction<
        RegisterSendNotificationFfiNativeType,
        RegisterSendNotificationFfiDartType>("RegisterCallFunc");
    registerDestroy = _library.lookupFunction<RegisterDestroyFfiNativeType,
        RegisterDestroyFfiDartType>("RegisterCallFunc");
  }
}

/// 封装dart to c++的api调用，处理各种中间数据
class VoltronApi {
  // ------------------ dart call native方法 start ---------------------
  static Future<int> initJsFrameWork(
      String globalConfig,
      bool singleThreadMode,
      bool bridgeParamJson,
      bool isDevModule,
      int groupId,
      int engineId,
      CommonCallback callback) async {
    var globalConfigPtr = globalConfig.toNativeUtf16();
    globalConfig.toNativeUtf16();
    var result = _BridgeFFIManager.instance.initJsFramework(
        globalConfigPtr,
        singleThreadMode ? 1 : 0,
        bridgeParamJson ? 1 : 0,
        isDevModule ? 1 : 0,
        groupId,
        engineId, generateCallback((value) {
      callback(value);
    }));
    free(globalConfigPtr);
    return result;
  }

  static Future<bool> runScriptFromFile(
      int engineId,
      String filePath,
      String scriptName,
      String codeCacheDir,
      bool canUseCodeCache,
      CommonCallback callback) async {
    var filePathPtr = filePath.toNativeUtf16();
    var scriptNamePtr = scriptName.toNativeUtf16();
    var codeCacheDirPtr = codeCacheDir.toNativeUtf16();
    var result = _BridgeFFIManager.instance.runScriptFromFile(
        engineId,
        filePathPtr,
        scriptNamePtr,
        codeCacheDirPtr,
        canUseCodeCache ? 1 : 0, generateCallback((value) {
      callback(value);
    }));
    free(filePathPtr);
    free(scriptNamePtr);
    free(codeCacheDirPtr);
    return result == 1;
  }

  static Future<dynamic> runScriptFromAssetWithData(
      int engineId,
      String assetName,
      String codeCacheDir,
      bool canUseCodeCache,
      ByteData assetData,
      CommonCallback callback) async {
    var stopwatch = Stopwatch();

    stopwatch.reset();
    stopwatch.start();
    var assetNamePtr = assetName.toNativeUtf16();
    var assetStrPtr = strByteDataToPointer(assetData);
    var codeCacheDirPtr = codeCacheDir.toNativeUtf16();
    stopwatch.stop();

    LogUtils.profile(
        "loadBundleEncodeStringUtf8", stopwatch.elapsedMilliseconds);

    stopwatch.reset();
    stopwatch.start();
    _BridgeFFIManager.instance.runScriptFromAsset(
        engineId,
        assetNamePtr,
        codeCacheDirPtr,
        canUseCodeCache ? 1 : 0,
        assetStrPtr, generateCallback((value) {
      stopwatch.stop();
      LogUtils.profile("runScriptFromAssetCore", stopwatch.elapsedMilliseconds);
      callback(value);
    }));
    free(assetNamePtr);
    free(codeCacheDirPtr);
  }

  static Future<dynamic> runScriptFromAsset(
      int engineId,
      String assetName,
      String codeCacheDir,
      bool canUseCodeCache,
      CommonCallback callback) async {
    ByteData? assetData;
    var stopwatch = Stopwatch();
    stopwatch.start();
    try {
      assetData = await rootBundle.load(assetName);
    } catch (e) {
      LogUtils.e("Voltron_bridge", "load asset error:$e");
    }
    stopwatch.stop();
    LogUtils.profile("loadBundleFromAsset", stopwatch.elapsedMilliseconds);

    if (assetData != null) {
      runScriptFromAssetWithData(engineId, assetName, codeCacheDir,
          canUseCodeCache, assetData, callback);
    }
  }

  static Pointer<Utf16> strByteDataToPointer(ByteData data) {
    var units = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
    var result = utf8.decode(units);
    return result.toNativeUtf16();
  }

  static Future initDom(int engineId, int rootId) async {
    _BridgeFFIManager.instance.initDom(engineId, rootId);
  }

  static Future<dynamic> callFunction(int engineId, String action,
      String params, CommonCallback callback) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var actionPtr = action.toNativeUtf16();
    var paramsPtr = params.toNativeUtf16();
    stopwatch.stop();
    LogUtils.profile("callFunction", stopwatch.elapsedMilliseconds);
    _BridgeFFIManager.instance.callFunction(engineId, actionPtr, paramsPtr,
        generateCallback((value) {
          stopwatch.stop();
          LogUtils.profile("callFunction", stopwatch.elapsedMilliseconds);
          callback(value);
        }));
    free(actionPtr);
    free(paramsPtr);
  }

  static Future<String> getCrashMessage() async {
    final crashMessage = _BridgeFFIManager.instance.getCrashMessage();
    return crashMessage.toDartString();
  }

  static Future<dynamic> destroy(
      int engineId, bool singleThreadMode, CommonCallback callback) async {
    _BridgeFFIManager.instance.destroy(engineId, singleThreadMode ? 1 : 0,
        generateCallback((value) {
          callback(value);
        }));
  }

// ------------------ dart call native方法 end ---------------------

  // 初始化bridge层
  static Future<dynamic> initBridge() async {
    // 先注册回调的post指针和port端口号
    final nativePort =
        _BridgeFFIManager.instance._interactiveCppRequests.sendPort.nativePort;
    _BridgeFFIManager.instance
        .registerDartPostCObject(NativeApi.postCObject, nativePort);

    // 注册callNative回调
    var callNativeFunc =
    Pointer.fromFunction<CallNativeFfiNativeType>(callNative);
    _BridgeFFIManager.instance
        .registerCallNative(FuncType.callNative.index, callNativeFunc);

    // 注册reportJsonException回调
    var reportJsonExceptionFunc =
    Pointer.fromFunction<ReportJsonExceptionNativeType>(
        reportJsonException);
    _BridgeFFIManager.instance.registerReportJson(
        FuncType.reportJsonException.index, reportJsonExceptionFunc);

    // 注册reportJSException回调
    var reportJSExceptionFunc =
    Pointer.fromFunction<ReportJsExceptionNativeType>(reportJSException);
    _BridgeFFIManager.instance.registerReportJs(
        FuncType.reportJsException.index, reportJSExceptionFunc);

    // 注册sendResponse回调
    var sendResponseFunc =
    Pointer.fromFunction<SendResponseNativeType>(sendResponse);
    _BridgeFFIManager.instance
        .registerSendResponse(FuncType.sendResponse.index, sendResponseFunc);

    // 注册sendNotification回调
    var sendNotificationFunc =
    Pointer.fromFunction<SendNotificationNativeType>(sendNotification);
    _BridgeFFIManager.instance.registerSendNotification(
        FuncType.sendNotification.index, sendNotificationFunc);

    // 注册onDestroy回调
    var onDestroyFunc =
    Pointer.fromFunction<DestroyFunctionNativeType>(onDestroy);
    _BridgeFFIManager.instance
        .registerDestroy(FuncType.destroy.index, onDestroyFunc);
  }
}

// ------------------ native call dart方法 start ---------------------

// 提供全局listen port，从c ffi侧传入work方法指针后，直接调用executeCallback执行
void requestExecuteCallback(dynamic message) {
  print('requestExecuteCallback');
  final int workAddress = message;
  final work = Pointer<Work>.fromAddress(workAddress);
  _BridgeFFIManager.instance.executeCallback(work);
}

void callNative(
    int engineId,
    Pointer<Utf16> moduleNamePtr,
    Pointer<Utf16> moduleFuncPtr,
    Pointer<Utf16> callIdPtr,
    Pointer<Void> paramsDataPtr,
    int paramsLen,
    int bridgeParamJsonInt) {
  var bridgeParamJson = bridgeParamJsonInt == 1;
  var moduleName = moduleNamePtr.toDartString();
  var moduleFunc = moduleFuncPtr.toDartString();
  var callId = callIdPtr.toDartString();
  var dataList = paramsDataPtr.cast<Uint8>().asTypedList(paramsLen);

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.callNatives(
        moduleName, moduleFunc, callId, dataList, bridgeParamJson);
  }
}

void reportJsonException(int engineId, Pointer<Utf8> jsonValue) {
  var exception = jsonValue.toDartString();
  LogUtils.e("Voltron_bridge",
      "reportJsonException\n !!!!!!!!!!!!!!!!!!! \n Error($exception)");

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.reportException(exception, "");
  }
}

void reportJSException(int engineId, Pointer<Utf16> descriptionStream,
    Pointer<Utf16> stackStream) {
  var exception = descriptionStream.toDartString();
  var stackTrace = stackStream.toDartString();
  LogUtils.e("Voltron_bridge",
      "reportJsException\n !!!!!!!!!!!!!!!!!!! \n Error($exception)\n StackTrace($stackTrace)");

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.reportException(exception, stackTrace);
  }
}

void sendResponse(int engineId, Pointer<Uint16> source, int len) {
  var bytes = source.asTypedList(len);
  var msg = utf8.decode(bytes);

  final bridge = getCurrentBridge(engineId);
  if (bridge != null) {
    bridge.sendWebSocketMessage(msg);
  }
}

VoltronBridgeManager? getCurrentBridge(int engineId) {
  var bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge == null) {
    bridge = VoltronBridgeManager.bridgeMap[0];
  }
  return bridge;
}

void sendNotification(int engineId, Pointer<Uint16> source, int len) {
  var bytes = source.asTypedList(len);
  var msg = utf8.decode(bytes);
  print('sendNotification utf8: $msg');

  final bridge = getCurrentBridge(engineId);
  if (bridge != null) {
    bridge.sendWebSocketMessage(msg);
  }
}

void onDestroy(int engineId) {
  // empty
}

// ------------------ native call dart方法 end ---------------------
