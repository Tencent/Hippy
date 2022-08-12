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

import 'dart:collection';

import '../bridge.dart';
import '../common.dart';
import '../controller.dart';
import '../engine.dart';
import '../gesture.dart';
import '../render.dart';
import '../style.dart';
import '../widget.dart';

abstract class RenderContext<T extends LoadInstanceContext> with Destroyable {
  late VoltronRenderBridgeManager _bridgeManager;
  late RenderManager _renderManager;
  late VirtualNodeManager _virtualNodeManager;
  final EngineMonitor _engineMonitor;
  final HashMap<int, RootWidgetViewModel> _instanceMap = HashMap();
  final HashMap<int, T> _loadContextMap = HashMap();

  UIComponentEventHandler get eventHandler;
  double get fontScale;
  DimensionChecker get dimensionChecker;

  // UI Manager
  VirtualNodeManager get virtualNodeManager => _virtualNodeManager;

  // UI Manager
  RenderManager get renderManager => _renderManager;

  EngineMonitor get engineMonitor => _engineMonitor;

  VoltronRenderBridgeManager get bridgeManager => _bridgeManager;

  T? getLoadContext(int rootId) {
    return _loadContextMap[rootId];
  }

  void forEachInstance(Function(RootWidgetViewModel) call) {
    _instanceMap.values.forEach(call);
  }

  RenderContext(int id, List<ViewControllerGenerator>? generators, EngineMonitor engineMonitor)
      : _engineMonitor = engineMonitor {
    _bridgeManager = VoltronRenderBridgeManager(id, this);
    _renderManager = RenderManager(this, generators);
    _virtualNodeManager = VirtualNodeManager(this);
  }

  String convertRelativePath(int rootId, String path);

  void removeInstanceLifecycleEventListener(InstanceLifecycleEventListener listener);

  void addEngineLifecycleEventListener(EngineLifecycleEventListener listener);

  void removeEngineLifecycleEventListener(EngineLifecycleEventListener listener);

  void addInstanceLifecycleEventListener(InstanceLifecycleEventListener listener);

  void handleNativeException(Error error, bool haveCaught);

  RootWidgetViewModel? getInstance(int id) {
    return _instanceMap[id];
  }

  void destroyInstance(int id) {
    _instanceMap.remove(id);
    _loadContextMap.remove(id);
  }

  void createInstance(int id, T loadContext, RootWidgetViewModel viewModel) {
    _instanceMap[viewModel.id] = viewModel;
    _loadContextMap[id] = loadContext;
  }

  @override
  void destroy() {
    _renderManager.destroy();
    _bridgeManager.destroy();
    _instanceMap.clear();
  }
}
