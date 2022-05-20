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

import '../adapter.dart';
import 'js_init_params.dart';

class GlobalConfigs implements Destroyable {
  // device adapter
  DeviceAdapter? _deviceAdapter;

  // Engine Monitor adapter
  EngineMonitor? _engineMonitor;

  // Crash Handler
  ExceptionHandlerAdapter? _exceptionHandlerAdapter;

  // Http request adapter
  HttpAdapter? _httpAdapter;

  // Storage adapter
  StorageAdapter? _storageAdapter;

  // font scale adapter
  FontScaleAdapter? _fontScaleAdapter;

  // SharedPreferences
  ShredPreferenceAdapter? _sharedPreferencesAdapter;

  ShredPreferenceAdapter? get sharedPreferencesAdapter =>
      _sharedPreferencesAdapter;

  DeviceAdapter? get deviceAdapter => _deviceAdapter;

  EngineMonitor? get engineMonitor => _engineMonitor;

  ExceptionHandlerAdapter? get exceptionHandlerAdapter =>
      _exceptionHandlerAdapter;

  HttpAdapter? get httpAdapter => _httpAdapter;

  StorageAdapter? get storageAdapter => _storageAdapter;

  FontScaleAdapter? get fontScaleAdapter => _fontScaleAdapter;

  EngineMonitor? get monitorAdapter => _engineMonitor;

  GlobalConfigs(EngineInitParams params) {
    _sharedPreferencesAdapter = params.sharedPreferencesAdapter;
    _exceptionHandlerAdapter = params.exceptionHandler;
    _httpAdapter = params.httpAdapter;
    _storageAdapter = params.storageAdapter;
    _engineMonitor = params.engineMonitor;
    _fontScaleAdapter = params.fontScaleAdapter;
    _deviceAdapter = params.deviceAdapter;
  }

  @override
  void destroy() {
    try {
      _httpAdapter?.destroy();
      _storageAdapter?.destroy();
    } catch (e) {
      LogUtils.e("GlobalConfigs", "destroy error: $e");
    }
  }
}
