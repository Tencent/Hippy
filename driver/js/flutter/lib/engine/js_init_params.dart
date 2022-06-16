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

import '../adapter.dart';
import 'bundle.dart';
import 'engine_define.dart';
import 'js_api_provider.dart';

// 引擎初始化时的参数设置
class EngineInitParams {
  // 可选参数 核心的js bundle的assets路径（assets路径和文件路径二选一，优先使用assets路径），debugMode = false时有效
  String? coreJSAssetsPath;

  // 可选参数 核心的js bundle的文件路径（assets路径和文件路径二选一，优先使用assets路径）,debugMode = false时有效
  String? coreJSFilePath;

  // 可选参数 指定需要预加载的业务模块bundle assets路径
  VoltronBundleLoader? jsPreloadAssetsPath;

  // 可选参数 指定需要预加载的业务模块bundle 文件路径
  VoltronBundleLoader? jsPreloadFilePath;

  // 可选参数 指定需要预加载的业务模块bundle assets路径
  VoltronBundleLoader? coreAssetsLoader;

  // 可选参数 指定需要预加载的业务模块bundle 文件路径
  VoltronBundleLoader? coreFileLoader;

  // 可选参数 调试模式
  bool debugMode = false;

  // 可选参数 Server的jsbundle名字，默认为"index.bundle"。debugMode = true时有效
  String debugBundleName = "index.bundle";

  // 可选参数 Server的Host。默认为"localhost:38989"。debugMode = true时有效
  String debugServerHost = "localhost:38989";

  // 可选参数 引擎模式 默认为NORMAL
  EngineMode engineMode = EngineMode.normal;

  // 可选参数 自定义的，用来提供Native modules、JavaScript modules、View controllers的管理器。1个或多个
  List<APIProvider>? providers;

  // 可选参数 是否打印引擎的完整的log。默认为false
  bool enableLog = false;

  // 可选参数 code cache的名字，如果设置为空，则不启用code cache，默认为 ""
  String codeCacheTag = "";

  // 自定义日志
  LogListener? logListener;

  //可选参数 接收RuntimeId
  VoltronThirdPartyAdapter? thirdPartyAdapter;

  // 可选参数 接收异常
  ExceptionHandlerAdapter? exceptionHandler;

  // 可选参数 设置相关
  ShredPreferenceAdapter? sharedPreferencesAdapter;

  // 可选参数 Http request adapter
  HttpAdapter? httpAdapter;

  // 可选参数 Storage adapter 设置相关
  StorageAdapter? storageAdapter;

  // 可选参数 Engine Monitor adapter
  EngineMonitor? engineMonitor;

  // 可选参数 font scale adapter
  FontScaleAdapter? fontScaleAdapter;

  // 可选参数 device adapter
  DeviceAdapter? deviceAdapter;

  // 设置引擎的组，同一组的Engine，会共享C层的v8 引擎实例。 默认值为-1（无效组，即不属于任何group组）
  int groupId = -1;

  void check() {
    sharedPreferencesAdapter ??= ShredPreferenceAdapter();
    exceptionHandler ??= ExceptionHandlerAdapter();
    httpAdapter ??= HttpAdapter();
    storageAdapter ??= StorageAdapter();
    engineMonitor ??= EngineMonitor();
    fontScaleAdapter ??= FontScaleAdapter();
    deviceAdapter ??= DeviceAdapter();
    providers ??= [];
    providers!.insert(0, CoreApi());
    if (!debugMode) {
      if ((isEmpty(coreJSAssetsPath)) && isEmpty(coreJSFilePath)) {
        throw StateError(
          "Voltron: debugMode=true, initParams.coreJSAssetsPath and coreJSFilePath both null!",
        );
      }
    }
  }

  EngineInitParams();
}
