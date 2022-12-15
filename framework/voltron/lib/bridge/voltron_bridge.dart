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
import 'dart:convert';
import 'dart:core';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui';

import 'package:path_provider/path_provider.dart';
import 'package:voltron_ffi/voltron_ffi.dart';
import 'package:voltron_renderer/voltron_renderer.dart';
import 'package:voltron_vfs/voltron_vfs.dart';

import '../adapter.dart';
import '../bridge.dart';
import '../channel.dart';
import '../devtools/network_inspector.dart';
import '../engine.dart';
import '../module.dart';

const bool useNewCommType = false;

typedef Callback = void Function(dynamic param, Error? e);

/// voltron外层业务逻辑对c++调用逻辑的bridge封装
class VoltronBridgeManager implements Destroyable {
  static const String _kTag = 'Voltron_bridge';

  static const String kDefaultLocalHost = "localhost:38989";

  static const int kBridgeTypeSingleThread = 2;
  static const int kBridgeTypeNormal = 1;
  static const int kBridgeTypeRemoteDebug = 0;

  static String? sCodeCacheRootDir;
  static HashMap<int, VoltronBridgeManager> bridgeMap = HashMap();

  final EngineContext _context;
  final VoltronBundleLoader? _coreBundleLoader;
  final VoltronThirdPartyAdapter? _thirdPartyAdapter;
  bool _isFrameWorkInit = false;
  final bool _isDevModule;
  final String _debugServerHost;

  bool get isDevModule => _isDevModule;
  final bool _isSingleThread;
  final int _groupId;
  final List<String> _loadBundleInfo = [];

  int _v8RuntimeId = 0;
  final int _engineId;

  ModuleListener? _loadModuleListener;

  VoltronBundleLoader? get coreBundleLoader => _coreBundleLoader;

  VoltronBridgeManager(
    EngineContext context,
    VoltronBundleLoader? coreBundleLoader,
    int groupId,
    int id, {
    VoltronThirdPartyAdapter? thirdPartyAdapter,
    int bridgeType = kBridgeTypeNormal,
    bool isDevModule = false,
    String debugServerHost = '',
  })  : _context = context,
        _coreBundleLoader = coreBundleLoader,
        _groupId = groupId,
        _engineId = id,
        _isDevModule = isDevModule,
        _debugServerHost = debugServerHost,
        _thirdPartyAdapter = thirdPartyAdapter,
        _isSingleThread = bridgeType == kBridgeTypeSingleThread {
    initCodeCacheDir();
  }

  Future<int> _handleVoltronInspectorInit() async {
    int devtoolsId = 0;
    if (_isDevModule) {
      assert(_context.devtoolsManager != null);
      var tracingDataDir = await _context.devSupportManager.getTracingDataDir();
      devtoolsId = await _context.devtoolsManager!.create(
        workerManagerId: _context.renderContext.workerManagerId,
        dataDir: tracingDataDir,
        wsUrl: _context.devSupportManager.createDebugUrl(_debugServerHost),
      );
      final networkModule = _context.moduleManager.nativeModule[NetworkModule.kNetworkModuleName];
      if (networkModule is NetworkModule) {
        networkModule.requestWillBeSentHook = NetworkInspector().onRequestWillBeSent;
        networkModule.responseReceivedHook = NetworkInspector().onResponseReceived;
      }
    }
    return devtoolsId;
  }

  void bindDomAndRender({
    required int domInstanceId,
    required int engineId,
    required int renderManagerId,
  }) {
    VoltronApi.bindDomAndRender(
      domInstanceId,
      engineId,
      renderManagerId,
    );
  }

  void connectRootViewAndRuntime(
    int engineId,
    int rootId,
  ) {
    VoltronApi.connectRootViewAndRuntime(
      engineId,
      rootId,
    );
  }

  Future<dynamic> initBridge(Callback callback) async {
    try {
      int devtoolsId = await _handleVoltronInspectorInit();
      _context.startTimeMonitor.startEvent(EngineMonitorEventKey.engineLoadEventInitBridge);
      _v8RuntimeId = await VoltronApi.initJsFrameWork(
        globalConfig: getGlobalConfigs(),
        singleThreadMode: _isSingleThread,
        isDevModule: _isDevModule,
        groupId: _groupId,
        engineId: _engineId,
        workerManagerId: _context.renderContext.workerManagerId,
        domId: _context.renderContext.domHolder.id,
        callback: (value) async {
          _isFrameWorkInit = true;
          _thirdPartyAdapter?.setVoltronBridgeId(value);

          _context.onRuntimeInitialized(_v8RuntimeId);

          _context.startTimeMonitor.startEvent(
            EngineMonitorEventKey.engineLoadEventLoadCommonJs,
          );
          var coreBundleLoader = _coreBundleLoader;
          if (coreBundleLoader != null) {
            try {
              await coreBundleLoader.load(this, (ret, e) {
                _isFrameWorkInit = ret == 1;
                Error? error;
                if (!_isFrameWorkInit) {
                  error = StateError(
                    "load coreJsBundle failed,check your core jsBundle",
                  );
                } else {
                  bridgeMap[_engineId] = this;
                  _context.renderContext.renderBridgeManager.init();
                }
                callback(_isFrameWorkInit, error);
              });
            } catch (e) {
              if (e is Error) {
                LogUtils.e(_kTag, '${e.stackTrace}');
              }
              callback(_isFrameWorkInit, StateError(e.toString()));
            }
          } else {
            _isFrameWorkInit = true;
            bridgeMap[_engineId] = this;
            _context.renderContext.renderBridgeManager.init();
            callback(_isFrameWorkInit, null);
          }
        },
        devtoolsId: devtoolsId,
      );
    } catch (e) {
      _isFrameWorkInit = false;
      if (e is Error) {
        LogUtils.e(_kTag, '${e.stackTrace}');
      }
      callback(false, StateError(e.toString()));
    }
  }

  Future<dynamic> runBundle(
    int id,
    VoltronBundleLoader? loader,
    ModuleListener? moduleListener,
    RootWidgetViewModel? rootViewModel,
  ) async {
    if (!_isFrameWorkInit) {
      _loadModuleListener = moduleListener;
      _notifyModuleLoaded(
        ModuleLoadStatus.engineUninit,
        "load module error. VoltronBridge not initialized",
        rootViewModel,
      );
      return;
    }
    _loadModuleListener = moduleListener;
    if (rootViewModel != null) {
      rootViewModel.timeMonitor?.startEvent(
        EngineMonitorEventKey.moduleLoadEventLoadBundle,
      );
    }
    if (loader == null) {
      _notifyModuleLoaded(
        ModuleLoadStatus.varialeNull,
        "load module error. jsBundleLoader==null",
        rootViewModel,
      );
      return;
    }

    final bundleUniKey = loader.bundleUniKey;
    if (isEmpty(bundleUniKey)) {
      _notifyModuleLoaded(
        ModuleLoadStatus.varialeNull,
        "load module error. loader.getBundleUniKey=null",
        rootViewModel,
      );
      return;
    }
    if (_loadBundleInfo.contains(bundleUniKey)) {
      _notifyModuleLoaded(
        ModuleLoadStatus.repeatLoad,
        "load module error. loader.getBundleUniKey=$bundleUniKey",
        rootViewModel,
      );
      return true;
    }
    await loader.load(this, (param, e) {
      var success = param == 1;
      if (success) {
        LogUtils.i(_kTag, "load module success");
        _loadBundleInfo.add(bundleUniKey!);
        if (rootViewModel != null) {
          _notifyModuleLoaded(
            ModuleLoadStatus.ok,
            null,
            rootViewModel,
          );
        } else {
          _notifyModuleLoaded(
            ModuleLoadStatus.errRunBundle,
            "load module error. loader.load failed. check the file.",
            rootViewModel,
          );
        }
      } else {
        _notifyModuleLoaded(
          ModuleLoadStatus.errRunBundle,
          "load module error. loader.load failed. check the file.",
          rootViewModel,
        );
      }
    });
  }

  Future<dynamic> loadInstance(String name, int id, VoltronMap? params) async {
    if (!_isFrameWorkInit) {
      return;
    }

    LogUtils.i(_kTag, "loadInstance($id) start");

    var map = VoltronMap();
    map.push("name", name);
    map.push("id", id);
    map.push("params", params);

    await VoltronApi.loadInstance(_engineId, map);
  }

  Future<dynamic> resumeInstance(int id) async {
    var action = "resumeInstance";
    await callJsFunction(id, action);
  }

  Future<dynamic> pauseInstance(int id) async {
    var action = "pauseInstance";
    await callJsFunction(id, action);
  }

  Future<dynamic> unloadInstance(int id) async {
    if (!_isFrameWorkInit) {
      return;
    }

    LogUtils.i(_kTag, "unloadInstance($id) start");
    var map = VoltronMap();
    map.push("id", id);

    await VoltronApi.unloadInstance(_engineId, map);
  }

  Future<dynamic> destroyBridge(DestoryBridgeCallback<bool> callback, bool isReload) async {
    _thirdPartyAdapter?.onRuntimeDestroy();
    await VoltronApi.destroy(
      _engineId,
      (value) {
        onDestroy();
        callback(value == 0);
      },
      true,
    );
  }

  Future<dynamic> callJsFunction(Object params, String action) async {
    LogUtils.dBridge("call function ($action), params($params)");

    if (!_isFrameWorkInit) {
      return;
    }

    await VoltronApi.callFunction(_engineId, action, params, (value) {});
  }

  Future<dynamic> execJsCallback(Object params) async {
    var action = "callBack";
    await callJsFunction(params.toVoltronObject(), action);
  }

  @override
  void destroy() {
    _isFrameWorkInit = false;
    bridgeMap.remove(_engineId);
  }

  Future<dynamic> callJavaScriptModule(String moduleName, String methodName, Object params) async {
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
    var platformManager = PlatformManager.getInstance();
    var dimensionMap = getDimensions(-1, -1, false, null);
    // windowHeight是无效值，则允许客户端定制
    var deviceAdapter = _context.globalConfigs.deviceAdapter;
    if (deviceAdapter != null) {
      deviceAdapter.reviseDimensionIfNeed(null, dimensionMap, false, false);
    }
    var packageName = _thirdPartyAdapter?.getPackageName() ?? '';
    var versionName = _thirdPartyAdapter?.getAppVersion() ?? '';
    var pageUrl = _thirdPartyAdapter?.getPageUrl() ?? '';
    var extraData = VoltronMap();
    var jObject = _thirdPartyAdapter?.getExtraData() ?? {};
    jObject.forEach((key, value) {
      extraData.push(key, value);
    });
    globalParams.push("Dimensions", dimensionMap);
    var localization = VoltronMap();
    localization.push('country', platformManager.country);
    localization.push('language', platformManager.language);
    localization.push('direction', platformManager.direction);
    if (Platform.isAndroid) {
      var platformParams = VoltronMap();
      platformParams.push<String>("OS", "android");
      platformParams.push("APILevel", platformManager.apiLevel);
      platformParams.push("PackageName", packageName);
      platformParams.push("VersionName", versionName);
      platformParams.push<bool>(
          "NightMode", ScreenUtil.getInstance().brightness == Brightness.dark);
      platformParams.push("Localization", localization);
      globalParams.push("Platform", platformParams);
      var tkd = VoltronMap();
      tkd.push("url", pageUrl);
      tkd.push("appName", packageName);
      tkd.push("appVersion", versionName);
      tkd.push("extra", extraData);
      globalParams.push("tkd", tkd);
    } else if (Platform.isIOS) {
      globalParams.push<String>("OS", "ios");
      globalParams.push<String>("OSVersion", platformManager.osVersion);
      globalParams.push<String>("Device", platformManager.device);
      globalParams.push<String>("SDKVersion", '');
      globalParams.push<String>("AppVersion", platformManager.appVersion);
      globalParams.push("Localization", localization);
    }
    if (_context.devSupportManager.supportDev()) {
      var debugParams = VoltronMap();
      debugParams.push<String>(
        "debugClientId",
        _context.devSupportManager.getDevInstanceUUID(),
      );
      globalParams.push<VoltronMap>("Debug", debugParams);
    }
    return objectToJson(globalParams);
  }

  void _notifyModuleLoaded(
    ModuleLoadStatus statusCode,
    final String? msg,
    final RootWidgetViewModel? rootWidgetViewModel,
  ) {
    if (statusCode != ModuleLoadStatus.ok) {
      rootWidgetViewModel?.onLoadError(statusCode.value);
    }
    var loadModuleListener = _loadModuleListener;
    if (loadModuleListener != null) {
      loadModuleListener(statusCode, msg);
    }
  }

  Future<bool> runScriptFromUri(String uri, bool canUseCodeCache,
      String codeCacheTag, CommonCallback callback) async {
    if (!_isFrameWorkInit) {
      return false;
    }
    if (!isEmpty(codeCacheTag) && !isEmpty(sCodeCacheRootDir)) {
      LogUtils.i(_kTag,
          "runScriptFromUri ======core====== $codeCacheTag${", canUseCodeCache == $canUseCodeCache"}");
      var codeCacheDir = sCodeCacheRootDir! + codeCacheTag + Platform.pathSeparator;

      await VoltronApi.runScriptFromUri(
          _engineId, _context.vfsManager.id, uri, codeCacheDir, canUseCodeCache, isAssetsUrl(uri), (value) {
        callback(value);
      });
    } else {
      LogUtils.i(_kTag, 'runScriptFromUri codeCacheTag is null');

      var codeCacheDir = '$codeCacheTag${Platform.pathSeparator}';
      await VoltronApi.runScriptFromUri(
          _engineId, _context.vfsManager.id, uri, codeCacheDir, false, isAssetsUrl(uri), (value) {
        callback(value);
      });
    }

    return true;
  }

  void callNatives(
    String moduleName,
    String moduleFunc,
    String callId,
    Uint8List paramsList,
    bool bridgeParseJson,
  ) {
    LogUtils.dBridge('call native ($moduleName.$moduleFunc)');

    if (_isFrameWorkInit) {
      var paramsArray = VoltronArray();

      if (bridgeParseJson) {
        var strParam = utf8.decode(paramsList);
        if (!isEmpty(strParam)) {
          paramsArray = strParam.decodeType<VoltronArray>() ?? VoltronArray();
        }
      } else {
        paramsArray = paramsList.decodeType<VoltronArray>() ?? VoltronArray();
      }

      LogUtils.dBridge(
        "call native ($moduleName.$moduleFunc), params($paramsArray)",
      );
      _context.moduleManager.callNatives(
        CallNativeParams.obtain(moduleName, moduleFunc, callId, paramsArray),
      );
    }
  }

  void reportException(String exception, String stackTrace) {}

  Future<dynamic> initCodeCacheDir() async {
    if (sCodeCacheRootDir == null) {
      var appDir = await getApplicationSupportDirectory();
      var voltronCacheDir = await createDir(appDir, "voltron");
      if (voltronCacheDir != null) {
        sCodeCacheRootDir = voltronCacheDir.absolute.path;
      }
    }
  }

  void onDestroy() {
    if (!_isFrameWorkInit) {
      return;
    }
    _isFrameWorkInit = false;
    _v8RuntimeId = 0;
  }
}
