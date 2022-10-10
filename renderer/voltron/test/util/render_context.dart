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

import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:voltron_renderer/bridge.dart';
import 'package:voltron_renderer/common.dart';
import 'package:voltron_renderer/render.dart';
import 'package:voltron_renderer/controller.dart';
import 'package:voltron_renderer/engine.dart';

@GenerateMocks([VoltronRenderBridgeManager, DimensionChecker])
import 'render_context.mocks.dart';

class MockLoadInstanceContext extends Mock implements LoadInstanceContext {}

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
    QrController.kClassName,
    (object) => QrController(),
  ),
  ViewControllerGenerator(
    RootNodeController.kClassName,
    (object) => RootNodeController(),
  ),
];

class MockRenderContext extends RenderContext {
  @override
  MockDimensionChecker dimensionChecker = MockDimensionChecker();

  MockRenderContext(VoltronRenderBridgeManager bridgeManager)
      : super(0, controllerGeneratorList, EngineMonitor(),
            bridgetManager: bridgeManager);

  @override
  void removeInstanceLifecycleEventListener(
      InstanceLifecycleEventListener listener) {}

  @override
  void addEngineLifecycleEventListener(EngineLifecycleEventListener listener) {}

  @override
  void removeEngineLifecycleEventListener(
      EngineLifecycleEventListener listener) {}

  @override
  void addInstanceLifecycleEventListener(
      InstanceLifecycleEventListener listener) {}

  @override
  void handleNativeException(Error error, bool haveCaught) {
    print(error);
  }

  @override
  String convertRelativePath(int rootId, String path) {
    return path;
  }

  @override
  double get fontScale => 1.0;
}

RenderContext getRenderContext() {
  var bridgeManager = MockVoltronRenderBridgeManager();
  when(bridgeManager.createDomInstance()).thenReturn(mockInstanceId);
  when(bridgeManager.createNativeRenderManager()).thenReturn(mockInstanceId);
  when(bridgeManager.notifyRender(any)).thenAnswer((_) => Future.value(1));
  var renderContext = MockRenderContext(bridgeManager);
  return renderContext;
}
