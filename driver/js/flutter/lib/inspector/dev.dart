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
import 'dart:math';

import 'package:voltron_renderer/voltron_renderer.dart';
import 'package:path_provider/path_provider.dart';

import '../engine.dart';

class DevSupportManager {
  DevServerInterface? _devImp;
  late bool _supportDev;
  final String _serverHost = "localhost:38989";
  late String _debugClientId;

  DevSupportManager(GlobalConfigs? configs, bool enableDev, String? serverHost,
      String? bundleName) {
    // this._devImp = DevFactory.create(configs, enableDev, serverHost, bundleName);
    _supportDev = enableDev;
    _debugClientId = generateDebugClientId();
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

  Future<String> getTracingDataDir() async {
    var dir = await getApplicationSupportDirectory();
    return dir.path;
  }

  String getDebugUrl()  {
    return "ws://$_serverHost/debugger-proxy?role=android_client&clientId=$_debugClientId";
  }

  // to differ hippy pages in different device and page
  String generateDebugClientId() {
    var randomSeq = Random().nextInt(1000).toString();
    var timeSeq = DateTime.now().millisecondsSinceEpoch.toString();
    return randomSeq + timeSeq;
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
