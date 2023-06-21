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
import 'package:voltron/voltron.dart';
import '../base_voltron_page.dart';

class TestModule extends VoltronNativeModule {
  static const String kModuleName = "TestModule";

  static const String kDebugMethodName = "debug";
  static const String kRemoteDebugMethodName = "remoteDebug";
  static const String kLogMethodName = "log";
  static const String kHelloNativeMethodName = "helloNative";
  static const String kHelloNativeWithPromiseMethodName = "helloNativeWithPromise";

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

  /***
   * log
   * @param log
   * @param promise
   * 自定义了扩展了一个log的接口并且无回调
   */
  @VoltronMethod(kLogMethodName)
  bool log(String log, JSPromise promise) {
    //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
    LogUtils.d("TestModule", log);
    return true;
  }

  /***
   * helloNative
   * @param voltronMap
   * @param promise
   * 自定义了扩展了一个helloNative的接口，传入复杂结构参数
   */
  @VoltronMethod(kHelloNativeMethodName)
  bool helloNative(VoltronMap voltronMap, JSPromise promise) {
    //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
    String? hello = voltronMap.get<String>("hello");
    if (hello != null) {
      LogUtils.d("TestModule", hello);
    }
    return true;
  }

  /***
   * helloNativeWithPromise
   * @param voltronMap
   * @param promise
   * 自定义了扩展了一个helloNativeWithPromise的接口，支持回调
   */
  @VoltronMethod(kHelloNativeWithPromiseMethodName)
  bool helloNativeWithPromise(VoltronMap voltronMap, Promise promise) {
    //这里回来的参数可以为java的基础类型，和hippymap与hippyarry,但是前端调用的时候必须对应上
    String? hello = voltronMap.get<String>("hello");
    if (hello != null) {
      LogUtils.d("TestModule", hello);
      if (hello.isNotEmpty) {
        //TODO： 如果模块这里处理成功回调resolve
        VoltronMap hippyMap1 = VoltronMap();
        hippyMap1.push("code", 1);
        hippyMap1.push("result", "hello i am from native");
        promise.resolve(hippyMap1);
        return true;
      }
    }
    //失败就回调reject
    VoltronMap hippyMap1 = VoltronMap();
    hippyMap1.push("code", -1);
    promise.reject(hippyMap1);
    return true;
  }

  @override
  Map<String, Function> get extraFuncMap => {
        kDebugMethodName: debug,
        kRemoteDebugMethodName: remoteDebug,
        kLogMethodName: log,
        kHelloNativeMethodName: helloNative,
        kHelloNativeWithPromiseMethodName: helloNativeWithPromise,
      };

  @override
  String get moduleName => kModuleName;
}
