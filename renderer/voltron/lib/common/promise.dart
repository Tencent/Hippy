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

import '../render.dart';

abstract class Promise {
  static const String kCallIdNoCallback = "-1";

  final String _callId;

  String get callId => _callId;

  Promise(this._callId);

  bool isCallback() => _callId != kCallIdNoCallback;

  void resolve(Object? value);
}

class NativePromise extends Promise {
  bool keep = true;
  final int _rootId;
  final RenderContext _context;

  NativePromise(RenderContext context, {required String callId, required int rootId})
      : _context = context, _rootId = rootId, super(callId);

  @override
  void resolve(Object? value) {
    if (!isCallback()) {
      return;
    }

    _context.bridgeManager.execNativeCallback(_rootId, _callId, value ?? 'unknown');
  }
}
