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

typedef ModuleExecutor = Function();

// 对外暴露接口
class VoltronJSLoaderManager {
  late VoltronJSEngine _engine;

  final List<ModuleExecutor> pendingExecutor = [];

  VoltronJSLoaderManager._internal(EngineInitParams params) {
    _engine = VoltronJSEngine.create(params);
  }

  // 框架初始化
  static VoltronJSLoaderManager createLoaderManager(
      EngineInitParams params, EngineListener listener) {
    var render = VoltronJSLoaderManager._internal(params);
    render._init((status, msg) {
      LogUtils.i("flutter_render", "init engine status($status), msg($msg)");
      listener(status, msg);

      // engine初始化成功
      if (render.pendingExecutor.isNotEmpty) {
        for (var executor in render.pendingExecutor) {
          executor();
        }
      }
      render.pendingExecutor.clear();
    });
    return render;
  }

  VoltronJSLoader createLoader(ModuleLoadParams loadParams,
      {ModuleListener? moduleListener,
      OnLoadCompleteListener? onLoadCompleteListener}) {
    return VoltronJSLoader._internal(this, loadParams,
        moduleListener: moduleListener,
        onLoadCompleteListener: onLoadCompleteListener);
  }

  int get engineId => _engine.id;

  void _init(EngineListener listener) {
    _engine.initEngine(listener);
  }

  void destroy() {
    _engine.destroyEngine();
  }

  void sendData(String event, Object params) {
    _engine.sendEvent(event, params);
  }

  void _execute(ModuleExecutor executor) {
    switch (_engine.engineState) {
      case EngineState.unInit:
      case EngineState.onInit:
      case EngineState.onRestart:
        LogUtils.w("flutter_render", "run executor failed, add to pending");
        pendingExecutor.add(executor);
        break;
      case EngineState.initError:
      case EngineState.destroyed:
      case EngineState.inited:
        LogUtils.i("flutter_render", "run executor success");
        executor();
        break;
    }
  }

}

class VoltronJSLoader with RendererLoader {
  final VoltronJSLoaderManager _jsLoaderManager;
  final ModuleListener? _moduleListener;
  final OnLoadCompleteListener? _onLoadCompleteListener;
  final ModuleLoadParams _loadParams;
  RootWidgetViewModel? _instance;

  VoltronJSLoader._internal(this._jsLoaderManager, this._loadParams,
      {ModuleListener? moduleListener,
      OnLoadCompleteListener? onLoadCompleteListener})
      : _moduleListener = moduleListener,
        _onLoadCompleteListener = onLoadCompleteListener;

  @override
  bool back(BackPressHandler handler) {
    return _jsLoaderManager._engine.onBackPressed(handler);
  }

  @override
  void destroy() {
    var originViewModel = _instance;
    if (originViewModel != null) {
      _jsLoaderManager._execute(() {
        _jsLoaderManager._engine.destroyInstance(originViewModel);
      });
    }
    _instance = null;
  }

  @override
  void load(RootWidgetViewModel viewModel) {
    _instance = viewModel;
    _jsLoaderManager._execute(() {
      _jsLoaderManager._engine.loadModule(_loadParams, viewModel,
          listener: _moduleListener,
          onLoadCompleteListener: _onLoadCompleteListener);
    });
  }

}
