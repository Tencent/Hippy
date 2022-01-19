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

import 'package:flutter/widgets.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import '../module.dart';

class JSDimensionChecker with DimensionChecker {
  final EngineContext _engineContext;

  JSDimensionChecker(this._engineContext);

  void checkUpdateDimension(
      BuildContext uiContext,
      VoltronMap dimensionMap,
      int windowWidth,
      int windowHeight,
      bool shouldUseScreenDisplay,
      bool systemUiVisibilityChanged) {
    // 如果windowHeight是无效值，则允许客户端定制
    if (windowHeight < 0) {
      var deviceAdapter = _engineContext.globalConfigs.deviceAdapter;
      if (deviceAdapter != null) {
        deviceAdapter.reviseDimensionIfNeed(uiContext, dimensionMap,
            shouldUseScreenDisplay, systemUiVisibilityChanged);
      }
    }
    _engineContext.moduleManager
        .getJavaScriptModule<Dimensions>(
            enumValueToString(JavaScriptModuleType.Dimensions))
        ?.set(dimensionMap);
  }
}
