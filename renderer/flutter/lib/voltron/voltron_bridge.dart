import 'dart:async';
import 'dart:collection';
import 'dart:convert';
import 'dart:core';
import 'dart:ffi';
import 'dart:io';
import 'dart:isolate';
import 'dart:typed_data';

import 'package:ffi/ffi.dart';
import 'package:flutter/services.dart' show StandardMessageCodec, rootBundle;
import 'package:path_provider/path_provider.dart';

// ignore: import_of_legacy_library_into_null_safe
import 'package:web_socket_channel/io.dart';

import '../adapter/monitor.dart';
import '../adapter/third_party.dart';
import '../channel/platform_manager.dart';
import '../common/destroy.dart';
import '../common/voltron_array.dart';
import '../common/voltron_buffer.dart';
import '../common/voltron_map.dart';
import '../engine/bundle.dart';
import '../engine/engine_context.dart';
import '../engine/engine_define.dart';
import '../ffi/ffi_util.dart';
import '../module/module.dart';
import '../module/network.dart';
import '../serialization/deserializer.dart';
import '../serialization/reader/binary_reader.dart';
import '../serialization/string/internalized_string_table.dart';
import '../util/dimension_util.dart';
import '../util/file_util.dart';
import '../util/log_util.dart';
import '../util/string_util.dart';
import '../widget/root.dart';
import 'bridge_define.dart';
import 'global_callback.dart';
import 'inspector/inspector.dart';

typedef TestFunctionDartType = void Function();
typedef TestFunctionNativeType = Void Function();

class _BridgeFFIManager {
  static _BridgeFFIManager? _instance;

  factory _BridgeFFIManager() => _getInstance();

  static _BridgeFFIManager get instance => _getInstance();

  final DynamicLibrary _library =
      loadLibrary("rendercore", isStatic: Platform.isAndroid ? false : false);

  final _interactiveCppRequests = ReceivePort()..listen(requestExecuteCallback);

  // 初始化js framework
  late InitJsFrameworkFfiDartType initJsFramework;

  // 从本地文件中执行bundle
  late RunScriptFromFileFfiDartType runScriptFromFile;

  // 从apk资源文件中执行bundle
  late RunScriptFromAssetsFfiDartType runScriptFromAsset;

  // 调用js方法
  late CallFunctionFfiDartType callFunction;

  // 调用c++ dom相关方法
  late CallNativeFunctionFfiDartType callNativeFunction;

  // 执行native的任务
  late RunNativeRunnableFfiDartType runNativeRunnable;
  late GetCrashMessageFfiType getCrashMessage;

  // 消费native dom传入的renderOp队列
  late ConsumeRenderOpFfiDartType consumeRenderOp;

  // 更新节点宽高
  late UpdateNodeSizeFfiDartType updateNodeSize;

  // 初始化native dom
  late InitDomFfiDartType initDom;

  // 销毁
  late DestroyFfiDartType destroy;

  // 向c侧注册dart方法
  late RegisterCallNativeFfiDartType registerCallNative;
  late RegisterCallbackFfiDartType registerCallback;
  late RegisterPostCodeCacheFfiDartType registerPostCodeCache;
  late RegisterReportJsonFfiDartType registerReportJson;
  late RegisterReportJsFfiDartType registerReportJs;
  late RegisterCheckCodeCacheFfiDartType registerCheckCodeCache;
  late RegisterSendResponseFfiDartType registerSendResponse;
  late RegisterSendNotificationFfiDartType registerSendNotification;
  late RegisterDestroyFfiDartType registerDestroy;
  late RegisterPostRenderOpFfiDartType registerPostRenderOp;

  // 注册回调port和post指针
  late RegisterDartPostCObjectDartType registerDartPostCObject;

  // 执行回调任务
  late ExecuteCallbackDartType executeCallback;

  late TestFunctionDartType testFunc;

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

    callNativeFunction = _library.lookupFunction<
        CallNativeFunctionFfiNativeType,
        CallNativeFunctionFfiDartType>("CallNativeFunctionFFI");

    runNativeRunnable = _library.lookupFunction<RunNativeRunnableFfiNativeType,
        RunNativeRunnableFfiDartType>("RunNativeRunnableFFI");

    getCrashMessage =
        _library.lookupFunction<GetCrashMessageFfiType, GetCrashMessageFfiType>(
            "GetCrashMessageFFI");

    consumeRenderOp = _library.lookupFunction<ConsumeRenderOpFfiNativeType,
        ConsumeRenderOpFfiDartType>('ConsumeRenderOpQueue');

    updateNodeSize = _library.lookupFunction<UpdateNodeSizeFfiNativeType,
        UpdateNodeSizeFfiDartType>('UpdateNodeSize');

    destroy = _library
        .lookupFunction<DestroyFfiNativeType, DestroyFfiDartType>("DestroyFFI");

    registerCallNative = _library.lookupFunction<
        RegisterCallNativeFfiNativeType,
        RegisterCallNativeFfiDartType>("RegisterCallFunc");
    registerCallback = _library.lookupFunction<RegisterCallbackFfiNativeType,
        RegisterCallbackFfiDartType>("RegisterCallFunc");
    registerPostCodeCache = _library.lookupFunction<
        RegisterPostCodeCacheFfiNativeType,
        RegisterPostCodeCacheFfiDartType>("RegisterCallFunc");
    registerReportJson = _library.lookupFunction<
        RegisterReportJsonFfiNativeType,
        RegisterReportJsonFfiDartType>("RegisterCallFunc");
    registerReportJs = _library.lookupFunction<RegisterReportJsFfiNativeType,
        RegisterReportJsFfiDartType>("RegisterCallFunc");
    registerCheckCodeCache = _library.lookupFunction<
        RegisterCheckCodeCacheFfiNativeType,
        RegisterCheckCodeCacheFfiDartType>("RegisterCallFunc");
    registerSendResponse = _library.lookupFunction<
        RegisterSendResponseFfiNativeType,
        RegisterSendResponseFfiDartType>("RegisterCallFunc");
    registerSendNotification = _library.lookupFunction<
        RegisterSendNotificationFfiNativeType,
        RegisterSendNotificationFfiDartType>("RegisterCallFunc");
    registerDestroy = _library.lookupFunction<RegisterDestroyFfiNativeType,
        RegisterDestroyFfiDartType>("RegisterCallFunc");
    registerPostRenderOp = _library.lookupFunction<
        RegisterPostRenderOpFfiNativeType,
        RegisterPostRenderOpFfiDartType>("RegisterCallFunc");
    testFunc = _library
        .lookupFunction<TestFunctionNativeType, TestFunctionDartType>("Test");
  }
}

void testNativeCall() {
  _BridgeFFIManager.instance.testFunc();
}

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

  static Future consumeRenderOpQueue(int engineId) async {
    var stopwatch = Stopwatch();

    stopwatch.start();
    _BridgeFFIManager.instance.consumeRenderOp(engineId);
    stopwatch.stop();
    LogUtils.profile("consume render op cost", stopwatch.elapsedMilliseconds);
  }

  static Future updateNodeSize(
      int engineId, int rootId, int nodeId, double width, double height) async {
    var stopwatch = Stopwatch();

    stopwatch.start();
    _BridgeFFIManager.instance
        .updateNodeSize(engineId, rootId, nodeId, width, height);
    stopwatch.stop();
    LogUtils.profile("update node size cost", stopwatch.elapsedMilliseconds);
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
    var assetStrPtr = byteDataToPointer(assetData);
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

  static Pointer<Utf16> byteDataToPointer(ByteData data) {
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

  static Future<dynamic> callNativeFunction(
      int engineId, String callId, Object params, bool keep) async {
    var stopwatch = Stopwatch();
    stopwatch.start();
    var callIdU16 = callId.toNativeUtf16();
    var encodeParamsByteData = StandardMessageCodec().encodeMessage(params);
    if (encodeParamsByteData != null) {
      var length = encodeParamsByteData.lengthInBytes;
      final result = malloc<Uint8>(length);
      final nativeParams = result.asTypedList(length);
      nativeParams.setRange(
          0, length, encodeParamsByteData.buffer.asUint8List());
      _BridgeFFIManager.instance.callNativeFunction(
          engineId, callIdU16, result, length, keep ? 1 : 0);
      free(result);
      stopwatch.stop();
      LogUtils.profile("callNativeFunction", stopwatch.elapsedMilliseconds);
    } else {
      LogUtils.e(
          'Voltron::Bridge', 'call native function error, invalid params');
    }

    free(callIdU16);
  }

  static Future<dynamic> runNativeRunnable(int engineId, int rootId,
      String codeCachePath, int runnableId, CommonCallback callback) async {
    var codeCachePathPtr = codeCachePath.toNativeUtf16();
    _BridgeFFIManager.instance
        .runNativeRunnable(engineId, rootId, codeCachePathPtr, runnableId,
            generateCallback((value) {
      callback(value);
    }));
    free(codeCachePathPtr);
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

    // 注册全局回调
    var globalCallbackFunc =
        Pointer.fromFunction<GlobalCallback>(globalCallback);
    _BridgeFFIManager.instance
        .registerCallback(FuncType.globalCallback.index, globalCallbackFunc);

    // 注册callNative回调
    var callNativeFunc =
        Pointer.fromFunction<CallNativeFfiNativeType>(callNative);
    _BridgeFFIManager.instance
        .registerCallNative(FuncType.callNative.index, callNativeFunc);

    // 注册postCodeCache回调
    var postCodeCacheFunc =
        Pointer.fromFunction<PostCodeCacheRunnableNativeType>(
            postCodeCacheRunnable);
    _BridgeFFIManager.instance.registerPostCodeCache(
        FuncType.postCodeCacheRunnable.index, postCodeCacheFunc);

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

    // 注册checkCodeCacheSanity回调
    var checkCodeCacheSanityFunc =
        Pointer.fromFunction<CheckCodeCacheSanityNativeType>(
            checkCodeCacheSanity);
    _BridgeFFIManager.instance.registerCheckCodeCache(
        FuncType.checkCodeCacheSanity.index, checkCodeCacheSanityFunc);

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

    // 注册postRenderOp回调
    var postRenderOpFunc =
        Pointer.fromFunction<PostRenderOpNativeType>(postRenderOp);
    _BridgeFFIManager.instance
        .registerPostRenderOp(FuncType.postRenderOp.index, postRenderOpFunc);
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
    int rootId,
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

void postCodeCacheRunnable(int engineId, int rootId,
    Pointer<Utf8> codeCacheDirChar, int runnableId, int needClearException) {
  var codeCacheDir = codeCacheDirChar.toDartString();
  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.runCacheRunnable(rootId, codeCacheDir, runnableId);
  }
}

void reportJsonException(int engineId, int rootId, Pointer<Utf8> jsonValue) {
  var exception = jsonValue.toDartString();
  LogUtils.e("Voltron_bridge",
      "reportJsonException\n !!!!!!!!!!!!!!!!!!! \n Error($exception)");

  final bridge = VoltronBridgeManager.bridgeMap[rootId];
  if (bridge != null) {
    bridge.reportException(exception, "");
  }
}

void reportJSException(int engineId, int rootId,
    Pointer<Utf16> descriptionStream, Pointer<Utf16> stackStream) {
  var exception = descriptionStream.toDartString();
  var stackTrace = stackStream.toDartString();
  LogUtils.e("Voltron_bridge",
      "reportJsException\n !!!!!!!!!!!!!!!!!!! \n Error($exception)\n StackTrace($stackTrace)");

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.reportException(exception, stackTrace);
  }
}

void checkCodeCacheSanity(int engineId, int rootId, Pointer<Utf8> scriptMd5) {
  var filePath = scriptMd5.toDartString();

  final bridge = VoltronBridgeManager.bridgeMap[engineId];
  if (bridge != null) {
    bridge.deleteCodeCache(filePath);
  }
}

void sendResponse(int engineId, int rootId, Pointer<Uint16> source, int len) {
  var bytes = source.asTypedList(len);
  var msg = utf8.decode(bytes);

  final bridge = getCurrentBridge(engineId);
  if (bridge != null) {
    bridge.sendWebSocketMessage(msg);
  }
}

VoltronBridgeManager? getCurrentBridge(int rootId) {
  var bridge = VoltronBridgeManager.bridgeMap[rootId];
  if (bridge == null) {
    bridge = VoltronBridgeManager.bridgeMap[0];
  }
  return bridge;
}

void sendNotification(
    int engineId, int rootId, Pointer<Uint16> source, int len) {
  var bytes = source.asTypedList(len);
  var msg = utf8.decode(bytes);
  print('sendNotification utf8: $msg');

  final bridge = getCurrentBridge(engineId);
  if (bridge != null) {
    bridge.sendWebSocketMessage(msg);
  }
}

void onDestroy(int engineId, int rootId) {
  // empty
}

void postRenderOp(int engineId, int rootId, Pointer<Void> data, int len) {
  var dataList = data.cast<Uint8>().asTypedList(len);
  if (dataList.isNotEmpty) {
    var renderOpList =
        StandardMessageCodec().decodeMessage(dataList.buffer.asByteData());
    final bridge = VoltronBridgeManager.bridgeMap[engineId];
    if (bridge != null) {
      bridge.postRenderOp(renderOpList);
    }
  }
}

// ------------------ native call dart方法 end ---------------------

const bool useNewCommType = false;

typedef Callback = void Function(dynamic param, Error? e);

class VoltronBridgeManager implements Destroyable {
  static const int bridgeTypeSingleThread = 2;
  static const int bridgeTypeNormal = 1;
  static const int bridgeTypeRemoteDebug = 0;

  static String? sCodeCacheRootDir;
  static int sBridgeNum = 0;
  static HashMap<int, VoltronBridgeManager> bridgeMap = HashMap();

  final EngineContext _context;
  final VoltronBundleLoader? _coreBundleLoader;
  final VoltronThirdPartyAdapter? _thirdPartyAdapter;
  bool _isFrameWorkInit = false;
  bool _isBridgeInit = false;
  final bool _enableVoltronBuffer;
  final bool _isDevModule;

  bool get isDevModule => _isDevModule;
  final bool _isSingleThread;
  final int _groupId;
  final List<String> _loadBundleInfo = [];

  late int _v8RuntimeId;
  final int _engineId;
  IOWebSocketChannel? _webSocketChannel;

  ModuleListener? _loadModuleListener;

  final VoltronBuffer _voltronBuffer = VoltronBuffer();

  final Deserializer _deserializer = Deserializer(InternalizedStringTable());

  VoltronBundleLoader? get coreBundleLoader => _coreBundleLoader;

  VoltronBridgeManager(EngineContext context,
      VoltronBundleLoader? coreBundleLoader, int groupId, int id,
      {VoltronThirdPartyAdapter? thirdPartyAdapter,
      int bridgeType = bridgeTypeNormal,
      bool enableVoltronBuffer = false,
      bool isDevModule = false})
      : _context = context,
        _coreBundleLoader = coreBundleLoader,
        _groupId = groupId,
        _engineId = id,
        _isDevModule = isDevModule,
        _enableVoltronBuffer = enableVoltronBuffer,
        _thirdPartyAdapter = thirdPartyAdapter,
        _isSingleThread = bridgeType == bridgeTypeSingleThread {
    sBridgeNum++;
    initCodeCacheDir();
  }

  void _handleVoltronInspectorInit() {
    // todo 处理调试器初始化
    // if (_isDevModule) {
    //   bridgeMap[0] = this;
    //   final webSocketUri = Uri.parse(
    //       'ws://localhost:38989/debugger-proxy?role=android_client&id=$_platformRuntimeId');
    //   _webSocketChannel = IOWebSocketChannel.connect(webSocketUri);
    //   _sendDebugInfo({'platformRuntimeId': _platformRuntimeId});
    //   final networkModel =
    //       _context.moduleManager.nativeModule[NetworkModule.networkModuleName];
    //   // 1.Inspector拦截网络请求和响应
    //   if (networkModel is NetworkModule) {
    //     networkModel.requestWillBeSentHook = Inspector().requestWillBeSent;
    //     networkModel.responseReceivedHook = Inspector().responseReceived;
    //   }
    //   // 2、同步更新dom元素的数据
    //   _context.domManager.batchHook = Inspector().updateDocument;
    //   _webSocketChannel?.stream.listen((message) {
    //     try {
    //       // 优先处理VoltronInspector定义的事件。处理不成功，如果为安卓客户端，就通过V8转发事件信息
    //       final isSuccessful =
    //           Inspector().receiveFromFrontend(_context, json.decode(message));
    //       if (!isSuccessful && PlatformManager.getInstance().isAndroid) {
    //         VoltronApi.callFunction(
    //             _v8RuntimeId, "onWebsocketMsg", message, (value) {});
    //       }
    //     } catch (e) {
    //       LogUtils.e('Voltron_bridge', 'receive web socket message error: $e');
    //     }
    //   });
    // }
  }

  Future<dynamic> initBridge(Callback callback) async {
    try {
      _handleVoltronInspectorInit();
      _context.startTimeMonitor
          .startEvent(EngineMonitorEvent.engineLoadEventInitBridge);
      _v8RuntimeId = await VoltronApi.initJsFrameWork(
          getGlobalConfigs(),
          _isSingleThread,
          !_enableVoltronBuffer,
          _isDevModule,
          _groupId,
          _engineId, (value) {
        var thirdPartyAdapter = _thirdPartyAdapter;
        if (thirdPartyAdapter != null) {
          thirdPartyAdapter.setVoltronBridgeId(value);
        }

        _context.startTimeMonitor
            .startEvent(EngineMonitorEvent.engineLoadEventLoadCommonJs);
        var coreBundleLoader = _coreBundleLoader;
        if (coreBundleLoader != null) {
          coreBundleLoader.load(this, (param, e) {
            _isFrameWorkInit = param == 1;
            Error? error;
            if (!_isFrameWorkInit) {
              error = StateError(
                  "load coreJsBundle failed,check your core jsBundle");
            } else {
              bridgeMap[_engineId] = this;
            }
            callback(_isFrameWorkInit, error);
          });
        } else {
          _isFrameWorkInit = true;
          callback(_isFrameWorkInit, null);
          bridgeMap[_engineId] = this;
        }
      });
      _sendDebugInfo({'v8RuntimeId': _v8RuntimeId});
      _isBridgeInit = true;
    } catch (e) {
      _isFrameWorkInit = false;
      _isBridgeInit = false;
      if (e is Error) {
        LogUtils.e('Voltron_bridge', '${e.stackTrace}');
      }
      callback(false, StateError(e.toString()));
    }
  }

  Future<dynamic> runBundle(int id, VoltronBundleLoader? loader,
      ModuleListener? moduleListener, RootWidgetViewModel? rootWidget) async {
    if (!_isFrameWorkInit) {
      _loadModuleListener = moduleListener;
      notifyModuleLoaded(EngineStatus.wrongState,
          "load module error. VoltronBridge not initialized", rootWidget);
      return;
    }

    _loadModuleListener = moduleListener;

    if (rootWidget != null) {
      rootWidget.timeMonitor
          ?.startEvent(EngineMonitorEvent.moduleLoadEventLoadBundle);
    }
    if (loader == null) {
      notifyModuleLoaded(
          EngineStatus.wrongState,
          "load module error. VoltronBridge isInit:$_isFrameWorkInit, loader: $loader",
          null);
      return;
    }

    final bundleUniKey = loader.bundleUniKey;
    if (isEmpty(bundleUniKey)) {
      notifyModuleLoaded(EngineStatus.variableUnInit,
          "load module error. loader.getBundleUniKey=null", null);
      return;
    }
    if (_loadBundleInfo.contains(bundleUniKey)) {
      notifyModuleLoaded(EngineStatus.variableUnInit,
          "load module error. loader.getBundleUniKey=$bundleUniKey", null);
      return true;
    }

    _sendDebugInfo({'rawPath': loader.rawPath});
    await loader.load(this, (param, e) {
      var success = param == 1;
      if (success) {
        LogUtils.i("Voltron_bridge", "load module success");
        _loadBundleInfo.add(bundleUniKey!);
        if (rootWidget != null) {
          notifyModuleLoaded(EngineStatus.ok, null, rootWidget);
        } else {
          notifyModuleLoaded(EngineStatus.wrongState,
              "load module error. loader.load failed. check the file.", null);
        }
      } else {
        notifyModuleLoaded(EngineStatus.wrongState,
            "load module error. loader.load failed. check the file.", null);
      }
    });
  }

  Future initDom(int instanceId) async {
    await VoltronApi.initDom(_engineId, instanceId);
  }

  Future updateNodeSize(int instanceId,
      {int nodeId = 0, double width = 0, double height = 0}) async {
    await VoltronApi.updateNodeSize(
        _engineId, instanceId, nodeId, width, height);
  }

  Future<dynamic> loadInstance(String name, int id, VoltronMap? params) async {
    if (!_isFrameWorkInit) {
      return;
    }

    LogUtils.i("VoltronBridge", "loadInstance start");

    var map = VoltronMap();
    map.push("name", name);
    map.push("id", id);
    map.push("params", params);

    var action = "loadInstance";
    var paramsJsonStr = objectToJson(map);

    if (isEmpty(paramsJsonStr)) {
      return;
    }

    var rootView = _context.getInstance(id);
    if (rootView != null && rootView.timeMonitor != null) {
      rootView.timeMonitor
          ?.startEvent(EngineMonitorEvent.moduleLoadEventRunBundle);
    }

    await VoltronApi.callFunction(_engineId, action, paramsJsonStr, (value) {
      var curRootView = _context.getInstance(id);
      if (curRootView != null && curRootView.timeMonitor != null) {
        curRootView.timeMonitor
            ?.startEvent(EngineMonitorEvent.moduleLoadEventCreateView);
      }
    });
  }

  Future<dynamic> resumeInstance(int id) async {
    var action = "resumeInstance";
    await callJsFunction(id, action);
  }

  Future<dynamic> pauseInstance(int id) async {
    var action = "pauseInstance";
    await callJsFunction(id, action);
  }

  Future<dynamic> destroyInstance(int id) async {
    var action = "destroyInstance";
    await callJsFunction(id, action);
  }

  Future<dynamic> callJsFunction(Object params, String action) async {
    LogUtils.dBridge("call function ($action), params($params)");

    if (!_isFrameWorkInit) {
      return;
    }

    var paramsJsonStr = objectToJson(params);
    if (isEmpty(paramsJsonStr)) {
      return;
    }

    await VoltronApi.callFunction(_engineId, action, paramsJsonStr, (value) {});
  }

  Future<dynamic> callNativeFunction(String callbackId, Object params) async {

  }

  Future<dynamic> execJsCallback(Object params) async {
    var action = "callBack";
    await callJsFunction(params, action);
  }

  Future<dynamic> execNativeCallback(String callbackId, Object params) async {
    await callNativeFunction(callbackId, params);
  }

  void sendWebSocketMessage(dynamic msg) {
    print('utf8: $msg');
    _webSocketChannel?.sink.add(msg);
  }

  @override
  void destroy() {
    _destroyInner();
  }

  Future<dynamic> _destroyInner() async {
    _webSocketChannel?.sink.close();
    _webSocketChannel = null;
    if (!_isFrameWorkInit) {
      return;
    }

    _isFrameWorkInit = false;
    _isBridgeInit = false;
    sBridgeNum--;
    _voltronBuffer.release();
    bridgeMap.remove(_engineId);
    await VoltronApi.destroy(_engineId, _isSingleThread, (value) {});
  }

  Future consumeRenderOp() async {
    await VoltronApi.consumeRenderOpQueue(_engineId);
  }

  Future<dynamic> callJavaScriptModule(
      String moduleName, String methodName, Object params) async {
    if (!_isFrameWorkInit) {
      return;
    }

    var map = VoltronMap();
    map.push("moduleName", moduleName);
    map.push("methodName", methodName);
    map.push("params", params);
    var action = "callJsModule";
    await callJsFunction(map, action);
  }

  String getGlobalConfigs() {
    var globalParams = VoltronMap();
    var dimensionMap = getDimensions(-1, -1, false, null);

    // windowHeight是无效值，则允许客户端定制
    var deviceAdapter = _context.globalConfigs.deviceAdapter;
    if (deviceAdapter != null) {
      deviceAdapter.reviseDimensionIfNeed(null, dimensionMap, false, false);
    }
    globalParams.push("Dimensions", dimensionMap);
    var platformParams = VoltronMap();
    platformParams.push("OS", PlatformManager.getInstance().os);
    platformParams.push("APILevel", PlatformManager.getInstance().apiLevel);
    globalParams.push("Platform", platformParams);
    return objectToJson(globalParams);
  }

  void notifyModuleLoaded(EngineStatus statusCode, final String? msg,
      final RootWidgetViewModel? rootWidget) {
    var loadModuleListener = _loadModuleListener;
    if (loadModuleListener != null) {
      loadModuleListener(statusCode, msg, rootWidget);
      _loadModuleListener = null;
    }
  }

  Future<bool> runScriptFromAssets(String fileName, bool canUseCodeCache,
      String codeCacheTag, CommonCallback callback) async {
    if (!_isBridgeInit) {
      return false;
    }

    if (!isEmpty(codeCacheTag) && !isEmpty(sCodeCacheRootDir)) {
      LogUtils.i("VoltronEngineMonitor",
          "runScriptFromAssets ======core====== $codeCacheTag${", canUseCodeCache == $canUseCodeCache"}");
      var codeCacheDir =
          sCodeCacheRootDir! + codeCacheTag + Platform.pathSeparator;
      await VoltronApi.runScriptFromAsset(
          _v8RuntimeId, fileName, codeCacheDir, canUseCodeCache, (value) {
        callback(value);
      });
    } else {
      LogUtils.i(
          "VoltronEngineMonitor", "runScriptFromAssets codeCacheTag is null");
      await VoltronApi.runScriptFromAsset(_v8RuntimeId, fileName,
          "$codeCacheTag${Platform.pathSeparator}", false, (value) {
        callback(value);
      });
    }
    return true;
  }

  Future<bool> runScriptFromAssetsWithData(
      String fileName,
      bool canUseCodeCache,
      String codeCacheTag,
      ByteData assetsData,
      CommonCallback callback) async {
    if (!_isBridgeInit) {
      return false;
    }

    if (!isEmpty(codeCacheTag) && !isEmpty(sCodeCacheRootDir)) {
      LogUtils.i("VoltronEngineMonitor",
          "runScriptFromAssetsWithData ======core====== $codeCacheTag${", canUseCodeCache == $canUseCodeCache"}");
      var codeCacheDir =
          sCodeCacheRootDir! + codeCacheTag + Platform.pathSeparator;
      await VoltronApi.runScriptFromAssetWithData(
          _v8RuntimeId, fileName, codeCacheDir, canUseCodeCache, assetsData,
          (value) {
        callback(value);
      });
    } else {
      LogUtils.i("VoltronEngineMonitor",
          "runScriptFromAssetsWithData codeCacheTag is null");
      await VoltronApi.runScriptFromAssetWithData(_v8RuntimeId, fileName,
          "$codeCacheTag${Platform.pathSeparator}", false, assetsData, (value) {
        callback(value);
      });
    }
    return true;
  }

  Future<bool> runScriptFromFile(
      String filePath,
      String scriptName,
      bool canUseCodeCache,
      String codeCacheTag,
      CommonCallback callback) async {
    if (!_isBridgeInit) {
      return false;
    }
    if (!isEmpty(codeCacheTag) && !isEmpty(sCodeCacheRootDir)) {
      LogUtils.i("VoltronEngineMonitor",
          "runScriptFromFile ======core====== $codeCacheTag${", canUseCodeCache == $canUseCodeCache"}");
      var codeCacheDir =
          sCodeCacheRootDir! + codeCacheTag + Platform.pathSeparator;

      await VoltronApi.runScriptFromFile(
          _v8RuntimeId, filePath, scriptName, codeCacheDir, canUseCodeCache,
          (value) {
        callback(value);
      });
    } else {
      LogUtils.i(
          "VoltronEngineMonitor", "runScriptFromFile codeCacheTag is null");

      var codeCacheDir = "$codeCacheTag${Platform.pathSeparator}";
      await VoltronApi.runScriptFromFile(
          _v8RuntimeId, filePath, scriptName, codeCacheDir, false, (value) {
        callback(value);
      });
    }

    return true;
  }

  void postRenderOp(dynamic renderOp) {
    LogUtils.dBridge("call post render op ($renderOp)");
    if (_isBridgeInit) {
      _context.moduleManager.consumeRenderOp(_engineId, renderOp);
    }
  }

  void callNatives(String moduleName, String moduleFunc, String callId,
      Uint8List paramsList, bool bridgeParseJson) {
    LogUtils.dBridge("call native ($moduleName.$moduleFunc)");

    if (_isBridgeInit) {
      VoltronArray paramsArray;
      Object? params;

      if (bridgeParseJson) {
        var strParam = utf8.decode(paramsList);
        if (!isEmpty(strParam)) {
          params = parseJsonString(strParam);
        }
      } else {
        _deserializer.reader = BinaryReader(paramsList.buffer.asByteData());
        _deserializer.reset();
        _deserializer.readHeader();
        params = _deserializer.readValue();
      }
      if (params is VoltronArray) {
        paramsArray = params;
      } else {
        paramsArray = VoltronArray();
      }

      LogUtils.dBridge(
          "call native ($moduleName.$moduleFunc), params($paramsArray)");
      _context.moduleManager.callNatives(
          CallNativeParams.obtain(moduleName, moduleFunc, callId, paramsArray));
    }
  }

  void reportException(String exception, String stackTrace) {}

  Future<dynamic> runCacheRunnable(
      int rootId, String path, int nativeId) async {
    if (isEmpty(path)) {
      return;
    }

    var dir =
        Directory(path.substring(0, path.lastIndexOf(Platform.pathSeparator)));
    await deleteDirWithFile(dir);
    await dir.create();
    var file = File(path);
    await file.create();

    VoltronApi.runNativeRunnable(_engineId, rootId, path, nativeId, (value) {});
  }

  Future<dynamic> deleteDirWithFile(Directory dir) async {
    if (!(await dir.exists())) return;

    final children = dir.listSync();
    for (final file in children) {
      if (file is File) {
        await file.delete();
      } else if (file is Directory) {
        await deleteDirWithFile(file);
      }
    }
    dir.delete();
  }

  Future<dynamic> deleteCodeCache(String fileName) async {
    var originSCodeCacheRootDir = sCodeCacheRootDir;
    if (originSCodeCacheRootDir == null) {
      return;
    }

    var codeCacheDir = Directory(originSCodeCacheRootDir);
    if (await codeCacheDir.exists()) {
      final needFilterDeleteFiles = codeCacheDir.listSync();

      FileSystemEntity? deleteFile;

      if (needFilterDeleteFiles.isNotEmpty) {
        for (var i = 0; i < needFilterDeleteFiles.length; i++) {
          final file = needFilterDeleteFiles[i];
          if (file is Directory) {
            var childFiles = file.listSync();
            if (childFiles.isNotEmpty) {
              var zeroChild = childFiles[0];
              var zeroFileName = fileNameByFile(zeroChild);
              if (zeroFileName == fileName) {
                deleteFile = zeroChild;
              }
            }
          }
        }
      }

      await deleteFile?.delete();
    }
  }

  Future<dynamic> initCodeCacheDir() async {
    if (sCodeCacheRootDir == null) {
      var appDir = await getApplicationSupportDirectory();
      var voltronCacheDir = await createDir(appDir, "voltron");
      if (voltronCacheDir != null) {
        sCodeCacheRootDir = voltronCacheDir.absolute.path;
      }
    }
  }

  void _sendDebugInfo(Map info) {
    _webSocketChannel?.sink.add(json.encode({'debugInfo': info}));
  }
}
