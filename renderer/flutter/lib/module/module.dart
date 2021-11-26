import 'dart:collection';

import '../common/destroy.dart';
import '../common/voltron_array.dart';
import '../common/voltron_map.dart';
import '../engine/api_provider.dart';
import '../engine/engine_context.dart';
import '../util/log_util.dart';
import 'monitor.dart';
import 'promise.dart';
import '../util/extension.dart';

// ignore: constant_identifier_names
enum JavaScriptModuleType { EventDispatcher, Dimensions }

class ModuleManager implements Destroyable {
  static const tag = "ModuleManager";

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
      var promise = Promise(
          _context, params._moduleName, params._moduleFunc, params._callId);
      // 这里跟hippy不一致，我们要主动暴露模块未找到的错误
      promise.doCallback(
          Promise.promiseCodeOtherError, "module can not be found");
      return;
    }

    _doCallNative(moduleInfo, params);
  }

  void consumeRenderOp(dynamic renderOp) {
    if (renderOp is List) {

    }
  }

  void _doCallNative(VoltronNativeModule module, CallNativeParams params) {
    var id = _anrMonitor.startMonitor(params._moduleName, params._moduleFunc);
    var promise = Promise(
        _context, params._moduleName, params._moduleFunc, params._callId);
    try {
      module.initialize();
      var function = module.funcMap[params._moduleFunc];
      if (function == null) {
        promise.doCallback(
            Promise.promiseCodeNormanError, "module function can not be found");
        return;
      }
      _invokeMethod(_context, module, params._params ?? VoltronArray(), promise,
          function);
    } catch (e) {
      promise.doCallback(Promise.promiseCodeNormanError, e.toString());
      LogUtils.e(
          tag, "call(${params._moduleName}.${params._moduleFunc} error:$e)");
    } finally {
      params.onDispose();
    }

    if (id >= 0) {
      _anrMonitor.endMonitor(id);
    }
  }

  void _invokeMethod(EngineContext context, VoltronNativeModule receiver,
      VoltronArray args, Promise promise, Function function) {
    final params = _prepareArguments(args, promise);
    final result = Function.apply(function, params);
    if (!promise.hasCall && !result) {
      promise.resolve("");
    }
  }

  List<Object> _prepareArguments(VoltronArray args, Promise promise) {
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

  static CallNativeParams obtain(String moduleName, String moduleFunc,
      String callId, VoltronArray params) {
    CallNativeParams? instance;
    if (!sInstancePool.isEmpty) {
      instance = sInstancePool.removeFirst();
    }
    if (instance == null) {
      instance = CallNativeParams();
    }
    instance._init(moduleName, moduleFunc, callId, params);
    return instance;
  }

  void _init(String moduleName, String moduleFunc, String callId,
      VoltronArray params) {
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
  static const String moduleAddListener = "addListener";
  static const String moduleRemoveListener = "removeListener";
  final EngineContext context;

  final HashMap<String, int> _eventMap = HashMap();

  final Map<String, Function> _funcMap = {};

  @VoltronMethod(moduleAddListener)
  void addListener(String name) {
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

  @VoltronMethod(moduleRemoveListener)
  void removeListener(String name) {
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
      _funcMap.addAll({
        moduleAddListener: addListener,
        moduleRemoveListener: removeListener
      });
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
