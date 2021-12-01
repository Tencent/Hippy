import '../common/voltron_map.dart';

import '../engine/engine_context.dart';

class _JSPromiseImpl extends JSPromise {
  final String _moduleName;
  final String _moduleFunc;

  bool get hasCall => _hasCall;

  _JSPromiseImpl(EngineContext context, this._moduleName, this._moduleFunc, String callId): super(context, callId);

  void call(int code, Object? obj) {
    var map = VoltronMap();
    map.push("result", code);
    map.push("moduleName", _moduleName);
    map.push("moduleFunc", _moduleFunc);
    map.push("callId", _callId);
    map.push("params", obj);
    _context.bridgeManager.execJsCallback(map);
  }

}

class _NativePromiseImpl extends Promise {
  bool keep = true;

  _NativePromiseImpl(EngineContext context, String callId)
      : super(context, callId);

  void resolve(Object? value) {
    if (!isCallback()) {
      return;
    }

    _context.bridgeManager.execNativeCallback(_callId, value ?? 'unknown');
  }
}

abstract class Promise {
  static const String callIdNoCallback = "-1";

  final EngineContext _context;
  final String _callId;

  bool _hasCall = false;

  bool get hasCall => _hasCall;

  Promise(this._context, this._callId);

  factory Promise.native(EngineContext context,
      {required String callId}) =>
      _NativePromiseImpl(context, callId);

  bool isCallback() => _callId != callIdNoCallback;

  void resolve(Object? value);
}

abstract class JSPromise extends Promise {
  static const int promiseCodeSuccess = 0;
  static const int promiseCodeNormanError = 1;
  static const int promiseCodeOtherError = 2;

  JSPromise(EngineContext context, String callId): super(context, callId);

  factory JSPromise.js(EngineContext context,
          {required String module,
          required String method,
          required String callId}) =>
      _JSPromiseImpl(context, module, method, callId);

  void resolve(Object? value) {
    _doCallback(promiseCodeSuccess, value);
  }


  void reject(Object error) {
    _doCallback(promiseCodeOtherError, error);
  }

  void error(int code, Object error) {
    _doCallback(code, error);
  }

  void _doCallback(int code, Object? obj) {
    if (!isCallback()) {
      return;
    }
    call(code, obj);
    _hasCall = true;
  }

  void call(int code, Object? obj);
}
