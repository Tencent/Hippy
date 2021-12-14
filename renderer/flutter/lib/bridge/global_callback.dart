import 'dart:collection';

typedef CallbackType = void Function(int value);

class _GlobalCallbackManager {
  static _GlobalCallbackManager? _instance;

  factory _GlobalCallbackManager() => _getInstance();

  static _GlobalCallbackManager get instance => _getInstance();

  final HashMap<int, _GlobalCallback> _callbackMap = HashMap();

  static _GlobalCallbackManager _getInstance() {
    // 只能有一个实例
    if (_instance == null) {
      _instance = _GlobalCallbackManager._internal();
    }

    return _instance!;
  }

  _GlobalCallbackManager._internal();

  void _addCallback(_GlobalCallback _globalCallback) {
    _callbackMap[_globalCallback._callbackId] = _globalCallback;
  }

  void _removeCallback(_GlobalCallback _globalCallback) {
    _callbackMap.remove(_globalCallback);
  }
}

class _GlobalCallback {
  static int _id = 0;
  final int _callbackId = _id++;
  final CallbackType _callback;

  _GlobalCallback.newCallback(this._callback) {
    _GlobalCallbackManager.instance._addCallback(this);
  }

  void _doAction(int value) {
    _callback(value);
    _GlobalCallbackManager.instance._removeCallback(this);
  }
}

int generateCallback(CallbackType callback) {
  return _GlobalCallback.newCallback(callback)._callbackId;
}

void globalCallback(int callbackId, int value) {
  print('call callback');
  _GlobalCallbackManager.instance._callbackMap[callbackId]?._doAction(value);
}
