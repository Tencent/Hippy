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
import 'dart:io';

import 'package:voltron_renderer/voltron_renderer.dart';

import 'js_dimension_checker.dart';
import 'js_engine_context.dart';
import 'js_instance_context.dart';

class JSRenderContext extends RenderContext<JSLoadInstanceContext> {
  JSRenderContext(
    RenderContextProxy proxy,
    int id,
    List<ViewControllerGenerator>? generators,
    EngineMonitor engineMonitor,
    bool debugMode,
    VoltronRenderBridgeManager? voltronRenderBridgeManager,
    DomHolder? domHolder,
    HashMap<int, RootWidgetViewModel>? rootViewModelMap,
  ) : super(
          id,
          generators,
          engineMonitor,
          debugMode,
          voltronRenderBridgeManager,
          domHolder,
          rootViewModelMap,
          proxy,
        );

  @override
  String convertRelativePath(int rootId, String path) {
    var instanceContext = getLoadContext(rootId);
    if (instanceContext != null && path.startsWith("hpfile://")) {
      var relativePath = path.replaceFirst("hpfile://./", "");
      var bundleLoaderPath = instanceContext.bundleLoader?.path;
      if (bundleLoaderPath != null) {
        path = bundleLoaderPath.substring(
                0, bundleLoaderPath.lastIndexOf(Platform.pathSeparator) + 1) +
            relativePath;
      }
    }
    return path;
  }
}
