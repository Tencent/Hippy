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
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

@GenerateMocks([VoltronRenderBridgeManager, DimensionChecker])
import 'render_context.mocks.dart';

class MockLoadInstanceContext extends Mock implements LoadInstanceContext {}

class MockEngineContext extends Mock with RenderContextProxy {
  void addEngineLifecycleEventListener(
    EngineLifecycleEventListener listener,
  ) {}

  void addInstanceLifecycleEventListener(
    InstanceLifecycleEventListener listener,
  ) {}

  DimensionChecker get dimensionChecker => MockDimensionChecker();

  double get fontScale => 1.0;

  void removeEngineLifecycleEventListener(
    EngineLifecycleEventListener listener,
  ) {}

  void removeInstanceLifecycleEventListener(
    InstanceLifecycleEventListener listener,
  ) {}

  void handleNativeException(
    Error error,
    bool haveCaught,
  ) {}
}

const int mockInstanceId = 1;

List<ViewControllerGenerator> controllerGeneratorList = [
  ViewControllerGenerator(
    DivController.kClassName,
    (object) => DivController(),
  ),
  ViewControllerGenerator(
    TextController.kClassName,
    (object) => TextController(),
  ),
  ViewControllerGenerator(
    ListViewController.kClassName,
    (object) => ListViewController(),
  ),
  ViewControllerGenerator(
    ListItemViewController.kClassName,
    (object) => ListItemViewController(),
  ),
  ViewControllerGenerator(
    ListPullHeaderViewController.kClassName,
    (object) => ListPullHeaderViewController(),
  ),
  ViewControllerGenerator(
    ListPullFooterViewController.kClassName,
    (object) => ListPullFooterViewController(),
  ),
  ViewControllerGenerator(
    RefreshWrapperController.kClassName,
    (object) => RefreshWrapperController(),
  ),
  ViewControllerGenerator(
    RefreshItemController.kClassName,
    (object) => RefreshItemController(),
  ),
  ViewControllerGenerator(
    ScrollViewController.kClassName,
    (object) => ScrollViewController(),
  ),
  ViewControllerGenerator(
    ImageController.kClassName,
    (object) => ImageController(),
  ),
  ViewControllerGenerator(
    TextInputController.kClassName,
    (object) => TextInputController(),
  ),
  ViewControllerGenerator(
    ModalController.kClassName,
    (object) => ModalController(),
  ),
  ViewControllerGenerator(
    ViewPagerController.kClassName,
    (object) => ViewPagerController(),
  ),
  ViewControllerGenerator(
    ViewPagerItemController.kClassName,
    (object) => ViewPagerItemController(),
  ),
  ViewControllerGenerator(
    WebViewViewController.kClassName,
    (object) => WebViewViewController(),
  ),
  ViewControllerGenerator(
    WaterfallViewController.kClassName,
    (object) => WaterfallViewController(),
  ),
  ViewControllerGenerator(
    WaterfallItemViewController.kClassName,
    (object) => WaterfallItemViewController(),
  ),
  ViewControllerGenerator(
    RootNodeController.kClassName,
    (object) => RootNodeController(),
  ),
];

class MockRenderContext extends RenderContext {
  MockRenderContext(
    VoltronRenderBridgeManager? initRenderBridgeManager,
    DomHolder? initDomHolder,
    HashMap<int, RootWidgetViewModel>? initRootViewModelMap,
  ) : super(
          0,
          controllerGeneratorList,
          EngineMonitor(),
          false,
          initRenderBridgeManager,
          initDomHolder,
          initRootViewModelMap,
          MockEngineContext(),
        );

  @override
  String convertRelativePath(int rootId, String path) {
    return path;
  }
}

RenderContext getRenderContext() {
  var renderBridgeManager = MockVoltronRenderBridgeManager();
  when(renderBridgeManager.createDomInstance()).thenReturn(mockInstanceId);
  when(renderBridgeManager.createNativeRenderManager()).thenReturn(mockInstanceId);
  when(renderBridgeManager.notifyRender(any)).thenAnswer((_) => Future.value(1));
  var renderContext = MockRenderContext(renderBridgeManager, null, HashMap());
  return renderContext;
}
