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

import 'package:flutter/material.dart';
import 'package:voltron/engine.dart';
import 'package:voltron/module.dart';
import '../view/base_voltron_page.dart';

class TestModule extends VoltronNativeModule {
  static const String kModuleName = "TestModule";

  static const String kDebugMethodName = "debug";
  static const String kRemoteDebugMethodName = "remoteDebug";

  TestModule(EngineContext context) : super(context);

  @VoltronMethod(kDebugMethodName)
  bool debug(int instanceId, JSPromise promise) {
    var rootBuildContext = context.renderContext.getInstance(instanceId)?.currentContext;
    if (rootBuildContext != null) {
      Navigator.push(
        rootBuildContext,
        MaterialPageRoute(
          builder: (context) => BaseVoltronPage(
            debugMode: true,
            remoteServerUrl: 'http://localhost:38989/index.bundle',
          ),
        ),
      );
    }
    return true;
  }

  @VoltronMethod(kDebugMethodName)
  bool remoteDebug(int instanceId, String bundleUrl, JSPromise promise) {
    var rootBuildContext = context.renderContext.getInstance(instanceId)?.currentContext;
    if (rootBuildContext != null) {
      Navigator.push(
        rootBuildContext,
        MaterialPageRoute(
          builder: (context) => BaseVoltronPage(
            debugMode: true,
            remoteServerUrl: bundleUrl,
          ),
        ),
      );
    }
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kDebugMethodName: debug,
        kRemoteDebugMethodName: remoteDebug,
      };

  @override
  String get moduleName => kModuleName;
}
