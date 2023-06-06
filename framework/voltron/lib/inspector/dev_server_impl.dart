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

import 'package:voltron_renderer/common/error.dart';
import 'package:voltron_renderer/widget/root.dart';

import '../engine.dart';
import '../inspector.dart';

class DevServerImpl implements DevServerInterface {
  late DevServerHelper _devServerHelper;
  late DevServerConfig _devServerConfig;
  DevServerCallback? _devServerCallback;

  DevServerImpl(
    GlobalConfigs configs,
    String serverHost,
    String bundleName,
    String remoteServerUrl
  ) {
    _devServerHelper = DevServerHelper(configs, serverHost, remoteServerUrl);
    _devServerConfig = DevServerConfig(serverHost, bundleName);
  }

  @override
  String createResourceUrl(String resName) {
    return _devServerHelper.createBundleURL(
      _devServerConfig.getServerHost(),
      resName,
      false,
      false,
      false,
    );
  }

  @override
  void attachToHost(RootWidgetViewModel viewModel) {
    viewModel.isDebugMode = true;
    viewModel.reload = reload;
  }

  @override
  void detachFromHost(RootWidgetViewModel viewModel) {
    viewModel.isDebugMode = false;
    viewModel.reload = null;
  }

  @override
  String createDebugUrl(String host, String? componentName, String debugClientId) {
    return _devServerHelper.createDebugURL(host, componentName ?? _devServerConfig.getBundleName(), debugClientId);
  }

  @override
  void reload() {
    _devServerCallback?.onDevBundleReload();
  }

  @override
  void setDevServerCallback(DevServerCallback devServerCallback) {
    _devServerCallback = devServerCallback;
  }
}
