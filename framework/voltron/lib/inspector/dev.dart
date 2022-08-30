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

import 'package:path_provider/path_provider.dart';
import 'package:uuid/uuid.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import '../engine.dart';
import '../inspector.dart';

class DevSupportManager {
  late DevServerInterface _devImp;
  late bool _supportDev;
  final String _uuid = const Uuid().v4();

  DevSupportManager(
    GlobalConfigs configs,
    bool enableDev,
    String serverHost,
    String bundleName,
  ) {
    _devImp = DevFactory.create(configs, enableDev, serverHost, bundleName);
    _supportDev = enableDev;
  }

  DevServerInterface getDevImp() {
    return _devImp;
  }

  void setDevCallback(DevServerCallback devCallback) {
    _devImp.setDevServerCallback(devCallback);
  }

  void attachToHost(RootWidgetViewModel view) {
    _devImp.attachToHost(view);
  }

  void detachFromHost(RootWidgetViewModel view) {
    _devImp.detachFromHost(view);
  }

  String createResourceUrl(String resName) {
    return _devImp.createResourceUrl(resName);
  }

  void handleException(JsError error) {
    _devImp.handleException(error);
  }

  String getDevInstanceUUID() {
    return _uuid;
  }

  bool supportDev() {
    return _supportDev;
  }

  Future<String> getTracingDataDir() async {
    var dir = await getApplicationSupportDirectory();
    return dir.path;
  }
}
