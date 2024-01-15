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

import 'package:voltron/voltron.dart';

typedef ModuleExecutor = Function();

// 对外暴露接口
class VoltronJSLoaderManager {
  late VoltronJSEngine _engine;

  final List<ModuleExecutor> pendingExecutor = [];

  VoltronJSLoaderManager._internal(EngineInitParams params) {
    _engine = VoltronJSEngine.create(params);
  }

  /// 自定义so或者dylib库路径和名称，可用于动态加载library库
  /// 此方法需要在创建引擎前调用
  /// 注意，调用此方法需要自己判断当前机器的cpu架构，否则会导致加载失败
  /// 另外调用此方法需要保证路径和名称正确性，否则会导致加载失败
  static void initCustomLibrary({required String path, required String name}) {
    if (path.isNotEmpty) {
      FfiManager.libPath = path;
    }
    if (name.isNotEmpty) {
      FfiManager.libraryName = name;
    }
  }

  // 框架初始化
  static VoltronJSLoaderManager createLoaderManager(
    EngineInitParams params,
    EngineListener listener,
  ) {
    // create voltron engine
    var render = VoltronJSLoaderManager._internal(params);
    // init voltron engine
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

  VoltronJSLoader createLoader(
    ModuleLoadParams loadParams, {
    ModuleListener? moduleListener,
    OnLoadCompleteListener? onLoadCompleteListener,
  }) {
    return VoltronJSLoader._internal(
      this,
      loadParams,
      moduleListener: moduleListener,
      onLoadCompleteListener: onLoadCompleteListener,
    );
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
        LogUtils.dBridge("start to run executor");
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
  final int engineId;
  RootWidgetViewModel? _instance;

  VoltronJSLoader._internal(
    this._jsLoaderManager,
    this._loadParams, {
    ModuleListener? moduleListener,
    OnLoadCompleteListener? onLoadCompleteListener,
  })  : engineId = _jsLoaderManager.engineId,
        _moduleListener = moduleListener,
        _onLoadCompleteListener = onLoadCompleteListener;

  @override
  bool back(BackPressHandler handler) {
    return _jsLoaderManager._engine.onBackPressed(handler);
  }

  void destroy() {
    var originViewModel = _instance;
    _instance = null;
    if (originViewModel != null) {
      _jsLoaderManager._execute(() {
        _jsLoaderManager._engine.destroyInstance(originViewModel);
      });
    }
  }

  @override
  void load(RootWidgetViewModel viewModel) {
    LogUtils.dBridge("load module ready");
    _instance = viewModel;
    _jsLoaderManager._execute(() {
      _jsLoaderManager._engine.loadModule(
        _loadParams,
        viewModel,
        listener: _moduleListener,
        onLoadCompleteListener: _onLoadCompleteListener,
      );
    });
  }
}
