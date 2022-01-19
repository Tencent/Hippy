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

class UtilsModule extends VoltronNativeModule {
  static const String kUtilsModuleName = "UtilsModule";
  static const String kFuncCheckAPI = "checkApi";
  EngineContext? _context;

  UtilsModule(EngineContext context) : super(context) {
    _context = context;
  }

  @VoltronMethod(kFuncCheckAPI)
  bool checkApi(VoltronMap message, JSPromise promise) {
    var nativeModuleMap = _context?.moduleManager.nativeModule;
    var jsModuleMap = _context?.moduleManager.jsModule;
    var controllerGeneratorMap = _context?.moduleManager.controllerGenerator;
    List? checkModuleList = message.get('module')?.toList();
    List? checkComponentList = message.get('component')?.toList();
    var result = VoltronMap();

    if (checkModuleList != null && checkModuleList.isNotEmpty) {
      var moduleResult = VoltronMap();
      for (var item in checkModuleList) {
        var ret = false;
        if (nativeModuleMap != null) {
          ret = nativeModuleMap[item] != null;
        }
        if (!ret && jsModuleMap != null) {
          ret = jsModuleMap[item] != null;
        }
        moduleResult.push(item, ret);
      }
      result.push('module', moduleResult);
    }

    if (checkComponentList != null &&
        controllerGeneratorMap != null &&
        checkComponentList.isNotEmpty) {
      var componentResult = VoltronMap();
      for (var item in checkComponentList) {
        componentResult.push(item, controllerGeneratorMap[item] != null);
      }
      result.push('component', componentResult);
    }

    promise.resolve(result);
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {kFuncCheckAPI: checkApi};

  @override
  String get moduleName => kUtilsModuleName;
}
