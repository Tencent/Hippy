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

import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import 'monitor.dart';
import 'promise.dart';

// ignore: constant_identifier_names
enum JavaScriptModuleType { EventDispatcher, Dimensions }

class ModuleManager implements Destroyable {
  static const kTag = "ModuleManager";

  bool _isDestroyed = false;

  final EngineContext _context;

  final HashMap<String, VoltronNativeModule> _nativeModule = HashMap();
  final HashMap<String, JavaScriptModule> _jsModule = HashMap();
  final HashMap<String, String> _controllerGenerator = HashMap();
  final ModuleAnrMonitor _anrMonitor;

  HashMap get nativeModule => _nativeModule;

  HashMap get jsModule => _jsModule;

  HashMap get controllerGenerator => _controllerGenerator;

  ModuleManager(this._context, List<APIProvider>? packages)
      : _anrMonitor = ModuleAnrMonitor(_context) {
    if (packages == null) {
      return;
    }

    for (var provider in packages) {
      final nativeModuleGeneratorList = provider.nativeModuleGeneratorList;
      final jsModuleGeneratorList = provider.javaScriptModuleGeneratorList;
      final controllerGeneratorList = provider.controllerGeneratorList;

      for (var element in nativeModuleGeneratorList) {
        _nativeModule[element.name] = element.generateModule(_context);
      }

      for (var element in jsModuleGeneratorList) {
        _jsModule[element.name] = element.generateJsModule(_context);
      }

      // 只用来记录，方便给后续 checkApi 检查
      for (var element in controllerGeneratorList) {
        _controllerGenerator[element.name] = '';
      }
    }
  }

  void callNatives(CallNativeParams params) {
    if (_isDestroyed) {
      return;
    }

    final moduleInfo = _nativeModule[params._moduleName];
    if (moduleInfo == null) {
      var promise = JSPromise.js(
        _context,
        module: params._moduleName,
        method: params._moduleFunc,
        callId: params._callId,
      );
      // 这里跟hippy不一致，我们要主动暴露模块未找到的错误
      promise.error(
        JSPromise.kPromiseCodeOtherError,
        "module can not be found",
      );
      return;
    }

    _doCallNative(moduleInfo, params);
  }

  void _doCallNative(VoltronNativeModule module, CallNativeParams params) {
    var id = _anrMonitor.startMonitor(params._moduleName, params._moduleFunc);
    var promise = JSPromise.js(_context,
        module: params._moduleName, method: params._moduleFunc, callId: params._callId);
    try {
      module.initialize();
      var function = module.funcMap[params._moduleFunc];
      if (function == null) {
        promise.error(
          JSPromise.kPromiseCodeNormanError,
          "module function can not be found",
        );
        return;
      }
      _invokeMethod(
        _context,
        module,
        params._params ?? VoltronArray(),
        promise,
        function,
      );
    } catch (e) {
      promise.error(JSPromise.kPromiseCodeNormanError, e.toString());
      LogUtils.e(
        kTag,
        "call(${params._moduleName}.${params._moduleFunc} error:$e)",
      );
    } finally {
      params.onDispose();
    }

    if (id >= 0) {
      _anrMonitor.endMonitor(id);
    }
  }

  void _invokeMethod(EngineContext context, VoltronNativeModule receiver, VoltronArray args,
      JSPromise promise, Function function) {
    final params = _prepareArguments(args, promise);
    final result = Function.apply(function, params);
    if (!promise.hasCall && !result) {
      promise.resolve("");
    }
  }

  List<Object> _prepareArguments(VoltronArray args, JSPromise promise) {
    var length = args.size() + 1;
    var resultArguments = List<Object>.filled(length, Object());
    resultArguments[length - 1] = promise;
    for (var i = 0; i < args.size(); i++) {
      resultArguments[i] = args.get(i);
    }
    return resultArguments;
  }

  @override
  void destroy() {
    _anrMonitor.checkMonitor();

    _isDestroyed = true;

    _nativeModule.forEach((name, module) {
      module.destroy();
    });

    _nativeModule.clear();

    _jsModule.forEach((name, module) {
      module.destroy();
    });
    _jsModule.clear();
  }

  T? getJavaScriptModule<T extends JavaScriptModule>(String type) {
    final module = _jsModule[type];
    if (module is T) {
      return module;
    }
    return null;
  }

  T? getNativeModule<T extends VoltronNativeModule>(String type) {
    final module = _nativeModule[type];
    if (module is T) {
      return module;
    }
    return null;
  }
}

class CallNativeParams {
  static const int poolSize = 20;
  static final ListQueue<CallNativeParams> sInstancePool = ListQueue(poolSize);

  String _moduleName = '';
  String _moduleFunc = '';
  String _callId = '';
  VoltronArray? _params;

  CallNativeParams();

  static CallNativeParams obtain(
      String moduleName, String moduleFunc, String callId, VoltronArray params) {
    CallNativeParams? instance;
    if (!sInstancePool.isEmpty) {
      instance = sInstancePool.removeFirst();
    }
    instance ??= CallNativeParams();
    instance._init(moduleName, moduleFunc, callId, params);
    return instance;
  }

  void _init(String moduleName, String moduleFunc, String callId, VoltronArray params) {
    _moduleName = moduleName;
    _moduleFunc = moduleFunc;
    _callId = callId;
    _params = params;
  }

  void onDispose() {
    _params = null;
    if (sInstancePool.length < poolSize) {
      sInstancePool.add(this);
    }
  }
}

abstract class JavaScriptModule implements Destroyable {
  final EngineContext context;

  JavaScriptModule(this.context);

  @override
  void destroy() {}

  void receiveNativeGesture(VoltronMap params) {}
}

abstract class VoltronNativeModule implements Destroyable {
  static const String kModuleAddListener = "addListener";
  static const String kModuleRemoveListener = "removeListener";
  final EngineContext context;

  final HashMap<String, int> _eventMap = HashMap();

  final Map<String, Function> _funcMap = {};

  @VoltronMethod(kModuleAddListener)
  void addListener(String name, JSPromise promise) {
    var count = 0;
    if (_eventMap.containsKey(name)) {
      count = _eventMap[name]!;
    }
    count++;

    if (count == 1) {
      handleAddListener(name);
    }
    _eventMap.remove(name);
    _eventMap[name] = count;
  }

  @VoltronMethod(kModuleRemoveListener)
  void removeListener(String name, JSPromise promise) {
    if (!_eventMap.containsKey(name)) {
      return;
    }
    var count = _eventMap[name]!;
    if (count == 1) {
      handleRemoveListener(name);
      _eventMap.remove(name);
    } else {
      count--;
      _eventMap.remove(name);
      _eventMap[name] = count;
    }
  }

  void handleAddListener(String name) {
    // empty
  }

  void handleRemoveListener(String name) {
    // empty
  }

  VoltronNativeModule(this.context);

  String get moduleName;

  Map<String, Function> get funcMap {
    if (_funcMap.isEmpty) {
      _funcMap.addAll({kModuleAddListener: addListener, kModuleRemoveListener: removeListener});
      _funcMap.addAll(extraFuncMap);
    }
    return _funcMap;
  }

  Map<String, Function> get extraFuncMap;

  void initialize() {}

  @override
  void destroy() {}
}

/// 注解module名字
class NativeModule {
  final String name;

  const NativeModule(this.name);
}

/// 注解module方法的名字
class VoltronMethod {
  final String name;

  const VoltronMethod(this.name);
}
