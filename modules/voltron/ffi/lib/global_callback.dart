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
import 'dart:ffi';

import 'package:voltron_ffi/define.dart';

import 'ffi_util.dart';

class _GlobalCallbackManager {
  static _GlobalCallbackManager? _instance;

  factory _GlobalCallbackManager() => _getInstance();

  static _GlobalCallbackManager get instance => _getInstance();

  final HashMap<int, _GlobalCallback> _callbackMap = HashMap();

  static _GlobalCallbackManager _getInstance() {
    // 只能有一个实例
    _instance ??= _GlobalCallbackManager._internal();

    return _instance!;
  }

  _GlobalCallbackManager._internal();

  void _addCallback(_GlobalCallback globalCallback) {
    _callbackMap[globalCallback._callbackId] = globalCallback;
  }

  void _removeCallback(_GlobalCallback globalCallback) {
    _callbackMap.remove(globalCallback);
  }
}

class _GlobalCallback {
  static int _id = 0;
  final int _callbackId = _id++;
  final CommonCallback _callback;

  _GlobalCallback.newCallback(this._callback) {
    _GlobalCallbackManager.instance._addCallback(this);
  }

  void _doAction(dynamic value) {
    _callback(value);
    _GlobalCallbackManager.instance._removeCallback(this);
  }
}

int generateCallback(CommonCallback callback) {
  return _GlobalCallback.newCallback(callback)._callbackId;
}

void globalCallback(int callbackId, Pointer<Uint8> result, int length) {
  _GlobalCallbackManager.instance._callbackMap[callbackId]?._doAction(decodeObject(result, length));
}
