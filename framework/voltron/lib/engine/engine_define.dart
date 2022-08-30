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

typedef DestoryBridgeCallback<T> = Function(T b);

typedef EngineListener = void Function(
  EngineInitStatus statusCode,
  String? msg,
);

typedef ModuleListener = void Function(
  ModuleLoadStatus statusCode,
  String? msg,
);

enum EngineState {
  unInit,
  onInit,
  onRestart,
  initError,
  inited,
  destroyed,
}

// Voltron engine mode
// normal ---  正常模式,具有最好的隔离已经运行速度
// low_memory --- 内存极简模式
enum EngineMode {
  normal,
  singleThread,
}

/// 引擎初始化过程中的错误码，对于Voltron sdk开发者调查Voltron sdk的使用者在使用过程中遇到的问题，很必须。
enum EngineInitStatus {
  ok, // 初始化过程，一切正常
  errBridge, // 初始化过程，initBridge错误
  errDevServer, // 初始化过程，devServer错误
  wrongState, // 状态错误。调用init函数时，引擎不在未初始化的状态
  initException, // 监听时状态已经错误，未知原因
}

extension EngineInitStatusExtension on EngineInitStatus {
  int get value {
    switch (this) {
      case EngineInitStatus.ok:
        return 0;
      case EngineInitStatus.errBridge:
        return -101;
      case EngineInitStatus.errDevServer:
        return -102;
      case EngineInitStatus.wrongState:
        return -103;
      case EngineInitStatus.initException:
        return -104;
      default:
        return -1;
    }
  }
}

enum ModuleLoadStatus {
  ok, // 加载正常
  engineUninit, // 引擎未完成初始化就加载JSBundle
  varialeNull, // check变量(bundleUniKey, loader, rootView)引用为空
  errRunBundle, // 业务JSBundle执行错误
  repeatLoad, // 重复加载同一JSBundle
}

extension ModuleLoadStatusExtension on ModuleLoadStatus {
  int get value {
    switch (this) {
      case ModuleLoadStatus.ok:
        return 0;
      case ModuleLoadStatus.engineUninit:
        return -201;
      case ModuleLoadStatus.varialeNull:
        return -202;
      case ModuleLoadStatus.errRunBundle:
        return -203;
      case ModuleLoadStatus.repeatLoad:
        return -204;
      default:
        return -1;
    }
  }
}

class EngineMonitorEventKey {
  static const String engineLoadEventInitEngine = "initEngine";
  static const String engineLoadEventInitInstance = "initInstance";
  static const String engineLoadEventInitBridge = "initBridge";
  static const String engineLoadEventLoadCommonJs = "loadCommonJS";
  static const String engineLoadEventNotifyEngineInited = "notifyEngineInited";
  static const String moduleLoadEventWaitEngine = "waitEngine";
  static const String moduleLoadEventWaitLoadBundle = "waitLoadBundle";
  static const String moduleLoadEventLoadBundle = "loadBundle";
  static const String moduleLoadEventRunBundle = "runBundle";
  static const String moduleLoadEventCreateView = "createView";
}
