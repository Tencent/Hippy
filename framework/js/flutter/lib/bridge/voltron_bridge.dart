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
import 'dart:convert';
import 'dart:core';
import 'dart:io';
import 'dart:typed_data';
import 'dart:ui';

import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:voltron_renderer/voltron_renderer.dart';
// ignore: import_of_legacy_library_into_null_safe
import 'package:web_socket_channel/io.dart';

import '../adapter.dart';
import '../channel.dart';
import '../engine.dart';
import '../module.dart';
import 'bridge_define.dart';
import 'voltron_api.dart';


const bool useNewCommType = false;

typedef Callback = void Function(dynamic param, Error? e);

/// voltron外层业务逻辑对c++调用逻辑的bridge封装
class VoltronBridgeManager implements Destroyable {
  static const String _kTag = 'Voltron_bridge';

  static const int kBridgeTypeSingleThread = 2;
  static const int kBridgeTypeNormal = 1;
  static const int kBridgeTypeRemoteDebug = 0;

  static String? sCodeCacheRootDir;
  static int sBridgeNum = 0;
  static HashMap<int, VoltronBridgeManager> bridgeMap = HashMap();

  final EngineContext _context;
  final VoltronBundleLoader? _coreBundleLoader;
  final VoltronThirdPartyAdapter? _thirdPartyAdapter;
  bool _isFrameWorkInit = false;
  bool _isBridgeInit = false;
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

  VoltronBundleLoader? get coreBundleLoader => _coreBundleLoader;

  VoltronBridgeManager(EngineContext context,
      VoltronBundleLoader? coreBundleLoader, int groupId, int id,
      {VoltronThirdPartyAdapter? thirdPartyAdapter,
      int bridgeType = kBridgeTypeNormal,
      bool isDevModule = false})
      : _context = context,
        _coreBundleLoader = coreBundleLoader,
        _groupId = groupId,
        _engineId = id,
        _isDevModule = isDevModule,
        _thirdPartyAdapter = thirdPartyAdapter,
        _isSingleThread = bridgeType == kBridgeTypeSingleThread {
    sBridgeNum++;
    initCodeCacheDir();
    _context.renderContext.bridgeManager.init();
  }

  Future<dynamic> initBridge(Callback callback) async {
    try {
      _context.startTimeMonitor
          .startEvent(EngineMonitorEventKey.engineLoadEventInitBridge);
      _v8RuntimeId = await VoltronApi.initJsFrameWork(
          getGlobalConfigs(),
          _isSingleThread,
          _isDevModule,
          _groupId,
          _engineId, (value) {
        var thirdPartyAdapter = _thirdPartyAdapter;
        if (thirdPartyAdapter != null) {
          thirdPartyAdapter.setVoltronBridgeId(value);
        }

        _context.startTimeMonitor
            .startEvent(EngineMonitorEventKey.engineLoadEventLoadCommonJs);
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
        LogUtils.e(_kTag, '${e.stackTrace}');
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
          ?.startEvent(EngineMonitorEventKey.moduleLoadEventLoadBundle);
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
        LogUtils.i(_kTag, "load module success");
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

  Future<dynamic> loadInstance(String name, int id, VoltronMap? params) async {
    if (!_isFrameWorkInit) {
      return;
    }

    LogUtils.i(_kTag, "loadInstance start");

    var map = VoltronMap();
    map.push("name", name);
    map.push("id", id);
    map.push("params", params);


    var rootView = _context.getInstance(id);
    var rootSize = Size.zero;
    if (rootView != null) {
      rootSize = getSizeFromKey(rootView.rootKey);
      if (rootView.timeMonitor != null) {
        rootView.timeMonitor
            ?.startEvent(EngineMonitorEventKey.moduleLoadEventRunBundle);
      }
    }

    await VoltronApi.createInstance(_engineId, id, rootSize, map, (value) {
      var curRootView = _context.getInstance(id);
      if (curRootView != null && curRootView.timeMonitor != null) {
        curRootView.timeMonitor
            ?.startEvent(EngineMonitorEventKey.moduleLoadEventCreateView);
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
    if (!_isFrameWorkInit) {
      return;
    }
    await VoltronApi.destroyInstance(_engineId, id, (value) {});
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
    await callJsFunction(params, action);
  }

  void sendWebSocketMessage(dynamic msg) {
    if (kDebugMode) {
      print('utf8: $msg');
    }
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
    await VoltronApi.destroy(_engineId, (value) {});
    _context.renderContext.destroy();
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
      LogUtils.i(_kTag,
          "runScriptFromAssets ======core====== $codeCacheTag${", canUseCodeCache == $canUseCodeCache"}");
      var codeCacheDir =
          sCodeCacheRootDir! + codeCacheTag + Platform.pathSeparator;
      await VoltronApi.runScriptFromAsset(
          _engineId, fileName, codeCacheDir, canUseCodeCache, (value) {
        callback(value);
      });
    } else {
      LogUtils.i(_kTag, "runScriptFromAssets codeCacheTag is null");
      await VoltronApi.runScriptFromAsset(
          _engineId, fileName, "$codeCacheTag${Platform.pathSeparator}", false,
          (value) {
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
      LogUtils.i(_kTag,
          "runScriptFromAssetsWithData ======core====== $codeCacheTag${", canUseCodeCache == $canUseCodeCache"}");
      var codeCacheDir =
          sCodeCacheRootDir! + codeCacheTag + Platform.pathSeparator;
      await VoltronApi.runScriptFromAssetWithData(
          _engineId, fileName, codeCacheDir, canUseCodeCache, assetsData,
          (value) {
        callback(value);
      });
    } else {
      LogUtils.i(_kTag, "runScriptFromAssetsWithData codeCacheTag is null");
      await VoltronApi.runScriptFromAssetWithData(_engineId, fileName,
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
      LogUtils.i(_kTag,
          "runScriptFromFile ======core====== $codeCacheTag${", canUseCodeCache == $canUseCodeCache"}");
      var codeCacheDir =
          sCodeCacheRootDir! + codeCacheTag + Platform.pathSeparator;

      await VoltronApi.runScriptFromFile(
          _engineId, filePath, scriptName, codeCacheDir, canUseCodeCache,
          (value) {
        callback(value);
      });
    } else {
      LogUtils.i(_kTag, 'runScriptFromFile codeCacheTag is null');

      var codeCacheDir = '$codeCacheTag${Platform.pathSeparator}';
      await VoltronApi.runScriptFromFile(
          _engineId, filePath, scriptName, codeCacheDir, false, (value) {
        callback(value);
      });
    }

    return true;
  }

  void callNatives(String moduleName, String moduleFunc, String callId,
      Uint8List paramsList, bool bridgeParseJson) {
    LogUtils.dBridge('call native ($moduleName.$moduleFunc)');

    if (_isBridgeInit) {
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
          "call native ($moduleName.$moduleFunc), params($paramsArray)");
      _context.moduleManager.callNatives(
          CallNativeParams.obtain(moduleName, moduleFunc, callId, paramsArray));
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

  void _sendDebugInfo(Map info) {
    _webSocketChannel?.sink.add(json.encode({'debugInfo': info}));
  }
}
