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

import 'package:voltron/adapter/resource_loader.dart';
import 'package:voltron/devtools/devtools_manager.dart';
import 'package:voltron_renderer/voltron_renderer.dart';
import 'package:voltron_vfs/voltron_vfs.dart';

import '../adapter.dart';
import '../bridge.dart';
import '../engine.dart';
import '../inspector.dart';
import '../module.dart';
import 'js_dimension_checker.dart';

class EngineContext with RenderContextProxy {
  final List<EngineLifecycleEventListener> _engineLifecycleEventListeners = [];

  // All CompoundView Instance Status Listener
  final List<InstanceLifecycleEventListener> _instanceLifecycleEventListeners = [];

  // Module Manager
  late ModuleManager _moduleManager;

  late final JSDimensionChecker _dimensionChecker;

  // Bridge Manager
  late VoltronBridgeManager _bridgeManager;

  // global configuration
  late final GlobalConfigs _globalConfigs;

  // Dev support manager
  late DevSupportManager _devSupportManager;

  DevtoolsManager? _devtoolsManager;

  // vfs manager
  late VfsManager _vfsManager;

  final TimeMonitor _startTimeMonitor;

  late JSRenderContext _renderContext;

  // Engine的ID，唯一
  final int _id;

  final bool _isDevMode;

  final String _debugServerHost;

  GlobalConfigs get globalConfigs => _globalConfigs;

  ModuleManager get moduleManager => _moduleManager;

  VoltronBridgeManager get bridgeManager => _bridgeManager;

  DevSupportManager get devSupportManager => _devSupportManager;

  RenderManager get renderManager => _renderContext.renderManager;

  DevtoolsManager? get devtoolsManager => _devtoolsManager;

  TimeMonitor get startTimeMonitor => _startTimeMonitor;

  EngineMonitor get engineMonitor => _renderContext.engineMonitor;

  JSRenderContext get renderContext => _renderContext;

  VfsManager get vfsManager => _vfsManager;

  EngineContext(
    List<APIProvider>? apiProviders,
    VoltronBundleLoader? coreLoader,
    int bridgeType,
    bool isDevModule,
    IntegratedMode integratedMode,
    String serverHost,
    int groupId,
    VoltronThirdPartyAdapter? thirdPartyAdapter,
    GlobalConfigs globalConfigs,
    int id,
    TimeMonitor monitor,
    EngineMonitor engineMonitor,
    DevSupportManager devSupportManager,
    VoltronRenderBridgeManager? voltronRenderBridgeManager,
    DomHolder? domHolder,
    HashMap<int, RootWidgetViewModel>? rootViewModelMap,
  )   : _globalConfigs = globalConfigs,
        _id = id,
        _isDevMode = isDevModule,
        _debugServerHost = serverHost,
        _startTimeMonitor = monitor {
    _renderContext = JSRenderContext(
      this,
      _id,
      processControllers(apiProviders),
      engineMonitor,
      isDevModule,
      voltronRenderBridgeManager,
      domHolder,
      rootViewModelMap,
    );
    if (_isDevMode) {
      _devtoolsManager = DevtoolsManager(true);
    }
    _moduleManager = ModuleManager(this, apiProviders);
    _dimensionChecker = JSDimensionChecker(globalConfigs.deviceAdapter, _moduleManager);
    _bridgeManager = VoltronBridgeManager(
      this,
      coreLoader,
      groupId,
      _id,
      thirdPartyAdapter: thirdPartyAdapter,
      bridgeType: bridgeType,
      isDevModule: _isDevMode,
      debugServerHost: _debugServerHost,
    );
    _initVfsManager();
    _devSupportManager = devSupportManager;
  }

  List<ViewControllerGenerator>? processControllers(List<APIProvider>? packages) {
    if (packages == null) {
      return [];
    }

    var controllerGenerators = <ViewControllerGenerator>[];
    for (var provider in packages) {
      var controllerFactoryList = provider.controllerGeneratorList;
      if (controllerFactoryList.isNotEmpty) {
        controllerGenerators.addAll(controllerFactoryList);
      }
    }
    return controllerGenerators;
  }

  void _initVfsManager() {
    _vfsManager = VfsManager();
    DefaultProcessor processor =
        DefaultProcessor(VoltronResourceLoader(_globalConfigs.httpAdapter));
    _vfsManager.addProcessor(processor);
  }

  RootWidgetViewModel? getInstance(int id) {
    return renderContext.getInstance(id);
  }

  void addInstanceLifecycleEventListener(InstanceLifecycleEventListener listener) {
    if (!_instanceLifecycleEventListeners.contains(listener)) {
      _instanceLifecycleEventListeners.add(listener);
    }
  }

  List<InstanceLifecycleEventListener> get instanceLifecycleEventListener =>
      _instanceLifecycleEventListeners;

  void removeInstanceLifecycleEventListener(InstanceLifecycleEventListener listener) {
    _instanceLifecycleEventListeners.remove(listener);
  }

  void addEngineLifecycleEventListener(EngineLifecycleEventListener listener) {
    if (!_engineLifecycleEventListeners.contains(listener)) {
      _engineLifecycleEventListeners.add(listener);
    }
  }

  void removeEngineLifecycleEventListener(EngineLifecycleEventListener listener) {
    _engineLifecycleEventListeners.remove(listener);
  }

  void handleException(JsError error) {
    globalConfigs.exceptionHandlerAdapter?.handleJsException(error);
  }

  void onRuntimeInitialized(int runtimeId) {
    _bridgeManager.bindDomAndRender(
      domInstanceId: renderContext.domHolder.id,
      engineId: _id,
      renderManagerId: renderContext.renderManager.nativeRenderManagerId,
    );
  }

  @override
  double get fontScale => globalConfigs.fontScaleAdapter?.getFontScale() ?? 1.0;

  @override
  DimensionChecker get dimensionChecker => _dimensionChecker;

  @override
  void handleNativeException(Error error, bool haveCaught) {
    globalConfigs.exceptionHandlerAdapter?.handleNativeException(
      error,
      haveCaught,
    );
  }

  int get engineId => _id;

  void destroyBridge(
    DestoryBridgeCallback<bool> callback,
    bool isReload,
  ) {
    _bridgeManager.destroyBridge(callback, isReload);
  }

  void destroy(bool isReload) {
    if (isReload) {
      _renderContext.rootViewModelMap.forEach((rootId, viewModel) {
        _renderContext.destroyRootView(rootId, isReload);
        viewModel.restart();
      });
    }
    _devtoolsManager?.destroy(isReload: isReload);
    _bridgeManager.destroy();
    _moduleManager.destroy();
    _vfsManager.destroy();
    _renderContext.destroy(isReload);
    _instanceLifecycleEventListeners.clear();
    _engineLifecycleEventListeners.clear();
  }
}
