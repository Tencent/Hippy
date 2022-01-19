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

import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';

class _JSPromiseImpl extends JSPromise {
  final String _moduleName;
  final String _moduleFunc;
  final EngineContext _context;

  bool get hasCall => _hasCall;

  _JSPromiseImpl(
      this._context, this._moduleName, this._moduleFunc, String callId)
      : super(callId);

  void call(int code, Object? obj) {
    var map = VoltronMap();
    map.push("result", code);
    map.push("moduleName", _moduleName);
    map.push("moduleFunc", _moduleFunc);
    map.push("callId", callId);
    map.push("params", obj);
    _context.bridgeManager.execJsCallback(map);
  }
}

abstract class JSPromise extends Promise {
  static const int kPromiseCodeSuccess = 0;
  static const int kPromiseCodeNormanError = 1;
  static const int kPromiseCodeOtherError = 2;
  bool get hasCall => _hasCall;
  bool _hasCall = false;

  JSPromise(String callId) : super(callId);

  factory JSPromise.js(EngineContext context,
          {required String module,
          required String method,
          required String callId}) =>
      _JSPromiseImpl(context, module, method, callId);

  void resolve(Object? value) {
    _doCallback(kPromiseCodeSuccess, value);
  }

  void reject(Object error) {
    _doCallback(kPromiseCodeOtherError, error);
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
