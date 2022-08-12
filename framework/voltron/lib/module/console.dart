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

class ConsoleModule extends VoltronNativeModule {
  static const String kConsoleModuleName = "ConsoleModule";
  static const String kConsoleLog = "log";
  static const String kConsoleWarn = "warn";
  static const String kConsoleInfo = "info";
  static const String kConsoleError = "error";

  ConsoleModule(EngineContext context) : super(context);

  @VoltronMethod(kConsoleLog)
  bool log(String message, JSPromise promise) {
    LogUtils.d("Voltron_console", message);
    return false;
  }

  @VoltronMethod(kConsoleWarn)
  bool warn(String message, JSPromise promise) {
    LogUtils.w("Voltron_console", message);
    return false;
  }

  @VoltronMethod(kConsoleInfo)
  bool info(String message, JSPromise promise) {
    LogUtils.i("Voltron_console", message);
    return false;
  }

  @VoltronMethod(kConsoleError)
  bool error(String message, JSPromise promise) {
    LogUtils.e("Voltron_console", message);
    return false;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kConsoleLog: log,
        kConsoleWarn: warn,
        kConsoleInfo: info,
        kConsoleError: error
      };

  @override
  String get moduleName => kConsoleModuleName;
}
