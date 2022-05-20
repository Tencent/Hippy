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

import 'dart:io';

import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';

class DevSupportManager {
  DevServerInterface? _devImp;
  late bool _supportDev;

  DevSupportManager(GlobalConfigs configs, bool enableDev, String serverHost,
      String bundleName) {
    // this._devImp = DevFactory.create(configs, enableDev, serverHost, bundleName);
    _supportDev = enableDev;
  }

  bool supportDev() {
    return _supportDev;
  }

  void setDevCallback(DevServerCallBack devCallback) {
    _devImp?.setDevServerCallback(devCallback);
  }

  void attachToHost(RootWidgetViewModel view) {
    _devImp?.attachToHost(view);
  }

  void detachFromHost(RootWidgetViewModel view) {
    _devImp?.detachFromHost(view);
  }

  void init(DevRemoteDebugProxy remoteDebugManager) {
    _devImp?.reload(remoteDebugManager);
  }

  void handleException(Error throwable) {
    _devImp?.handleException(throwable);
  }
}

abstract class DevServerInterface {
  void reload(DevRemoteDebugProxy remoteDebugManager);

  void setDevServerCallback(DevServerCallBack devServerCallback);

  void attachToHost(RootWidgetViewModel view);

  void detachFromHost(RootWidgetViewModel view);

  void handleException(Error error);
}

mixin DevRemoteDebugProxy {
  void destroy();
}

mixin OnReceiveDataListener {
  void onReceiveData(String msg);
}

abstract class DevServerCallBack {
//The bundle is loaded successfully callback
  void onDevBundleLoadReady(File bundle);

  void onInitDevError(Error e);
}
