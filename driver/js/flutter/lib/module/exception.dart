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
import 'module.dart';
import 'promise.dart';

class ExceptionModule extends VoltronNativeModule {
  static const String kExceptionModuleName = "ExceptionModule";
  static const String kHandleExceptionModule = "handleException";
  static const String kHandleExceptionBackgroundTracing =
      "handleBackgroundTracing";

  ExceptionModule(EngineContext context) : super(context);

  @override
  Map<String, Function> get extraFuncMap => {
        kHandleExceptionModule: handleException,
      };

  @override
  String get moduleName => kExceptionModuleName;

  @VoltronMethod(kHandleExceptionModule)
  bool handleException(
      String title, String details, int exceptionId, JSPromise promise) {
    context.handleException(JsError(title, details));
    return false;
  }

  @VoltronMethod(kHandleExceptionBackgroundTracing)
  bool handleBackgroundTracing(String details, JSPromise promise) {
    context.globalConfigs.exceptionHandlerAdapter
        ?.handleBackgroundTracing(details);
    return false;
  }
}
