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

import '../voltron_renderer.dart';

abstract class RenderContext<T extends LoadInstanceContext> with RenderContextProxy {
  final RenderContextProxy _proxy;

  // VoltronRenderBridgeManager 主要负责 renderer 侧 c++ 方法处理，注意区分于 framework 中的 VoltronBridgeManager
  late VoltronRenderBridgeManager _renderBridgeManager;

  VoltronRenderBridgeManager get renderBridgeManager => _renderBridgeManager;

  // RenderManager 负责所有的元素创建，更新，销毁，事件处理等
  late RenderManager _renderManager;

  RenderManager get renderManager => _renderManager;

  // Virtual Node Manager, text, inline image ...
  late VirtualNodeManager _virtualNodeManager;

  VirtualNodeManager get virtualNodeManager => _virtualNodeManager;

  // DomHolder 用于链接c++ DomManager
  late DomHolder _domHolder;

  DomHolder get domHolder => _domHolder;

  /// for performance
  final EngineMonitor _engineMonitor;

  EngineMonitor get engineMonitor => _engineMonitor;

  /// record framework JSLoadInstanceContext
  final HashMap<int, T> _loadContextMap = HashMap();

  final HashMap<int, RootWidgetViewModel> _rootViewModelMap = HashMap();

  HashMap<int, RootWidgetViewModel> get rootViewModelMap => _rootViewModelMap;

  @override
  double get fontScale => _proxy.fontScale;

  DimensionChecker get dimensionChecker => _proxy.dimensionChecker;

  /// voltron engine id
  late int _engineId;

  int get engineId => _engineId;

  RenderContext(
    int id,
    List<ViewControllerGenerator>? generators,
    EngineMonitor engineMonitor,
    bool debugMode,
    VoltronRenderBridgeManager? initRenderBridgeManager,
    DomHolder? initDomHolder,
    HashMap<int, RootWidgetViewModel>? initRootViewModelMap,
    RenderContextProxy this._proxy,
  )   : _engineMonitor = engineMonitor,
        _engineId = id {
    /// step 1, create renderBridgeManager for ffi
    _renderBridgeManager = initRenderBridgeManager ?? VoltronRenderBridgeManager(id);

    /// don't forget to bind current renderContext
    _renderBridgeManager.bindRenderContext(this);

    /// step 2, make sure workerManagerId is valid, use old value when reload
    if (!debugMode) {
      _renderBridgeManager.initRenderApi();
    }

    /// step 3, make sure dom holder is valid, use old value when reload
    if (debugMode && initDomHolder != null) {
      _domHolder = initDomHolder;
      LogUtils.dBridge('reuse dom manager id:${_domHolder.id}');
    } else {
      var domInstanceId = _renderBridgeManager.createDomInstance();
      _domHolder = DomHolder(domInstanceId);
      LogUtils.dBridge('create dom manager id:$domInstanceId');
    }

    /// don't forget to bind current renderContext
    _domHolder.bindRenderContext(this);

    /// step 4, create renderManager and virtualNodeManager
    _renderManager = RenderManager(this, generators);
    _virtualNodeManager = VirtualNodeManager(this);

    /// step 5, is reload, add all old rootViewModel
    if (initRootViewModelMap != null && initRootViewModelMap.isNotEmpty) {
      _rootViewModelMap.addAll(initRootViewModelMap);
    }
  }

  String convertRelativePath(int rootId, String path);

  @override
  void removeInstanceLifecycleEventListener(InstanceLifecycleEventListener listener) =>
      _proxy.removeInstanceLifecycleEventListener(listener);

  @override
  void addEngineLifecycleEventListener(EngineLifecycleEventListener listener) =>
      _proxy.addEngineLifecycleEventListener(listener);

  @override
  void removeEngineLifecycleEventListener(EngineLifecycleEventListener listener) =>
      _proxy.removeEngineLifecycleEventListener(listener);

  @override
  void addInstanceLifecycleEventListener(InstanceLifecycleEventListener listener) =>
      _proxy.addInstanceLifecycleEventListener(listener);

  @override
  void handleNativeException(Error error, bool haveCaught) =>
      _proxy.handleNativeException(error, haveCaught);

  /// framework JSLoadInstanceContext
  T? getLoadContext(int rootId) {
    return _loadContextMap[rootId];
  }

  void forEachInstance(Function(RootWidgetViewModel) call) {
    _rootViewModelMap.values.forEach(call);
  }

  void addRootViewModel(RootWidgetViewModel rootWidgetViewModel) {
    _rootViewModelMap[rootWidgetViewModel.id] = rootWidgetViewModel;
  }

  RootWidgetViewModel? getInstance(int id) {
    return _rootViewModelMap[id];
  }

  void destroyRootView(int id, bool isReload) {
    var removeViewModel = _rootViewModelMap[id];
    if (removeViewModel != null) {
      _loadContextMap.remove(id);
      _renderManager.onInstanceDestroy(id);
      _renderManager.deleteNode(id, id);
      _domHolder.removeRoot(_domHolder.id, id);
    }
    if (!isReload) _rootViewModelMap.remove(id);
  }

  void createRootView(T loadContext, RootWidgetViewModel viewModel) {
    _loadContextMap[viewModel.id] = loadContext;
    _domHolder.addRoot(_domHolder.id, viewModel.id);
  }

  void destroy(bool isReload) {
    _renderManager.destroy();
    _virtualNodeManager.destroy();
    if (!isReload) {
      _domHolder.destroy();
      _renderBridgeManager.destroy();
    }
  }
}
