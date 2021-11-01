import '../common/voltron_map.dart';

import '../engine/engine_context.dart';

class Promise {
  static const int promiseCodeSuccess = 0;
  static const int promiseCodeNormanError = 1;
  static const int promiseCodeOtherError = 2;
  static const String callIdNoCallback = "-1";

  final EngineContext _context;
  final String _moduleName;
  final String _moduleFunc;
  final String _callId;

  bool _hasCall = false;

  bool get hasCall => _hasCall;

  Promise(this._context, this._moduleName, this._moduleFunc, this._callId);

  bool isCallback() => _callId != callIdNoCallback;

  void resolve(Object? value) {
    doCallback(promiseCodeSuccess, value);
  }

  void reject(Object error) {
    doCallback(promiseCodeOtherError, error);
  }

  void doCallback(int code, Object? obj) {
    if (callIdNoCallback == _callId) {
      return;
    }
    var map = VoltronMap();
    map.push("result", code);
    map.push("moduleName", _moduleName);
    map.push("moduleFunc", _moduleFunc);
    map.push("callId", _callId);
    map.push("params", obj);
    _context.bridgeManager.execCallback(map);
    _hasCall = true;
  }
}
