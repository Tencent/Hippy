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

import 'package:voltron_renderer/common/error.dart';
import 'package:voltron_renderer/widget/root.dart';

import '../engine.dart';
import '../inspector.dart';

class DevServerImplDisable implements DevServerInterface {
  late DevServerHelper _devServerHelper;

  DevServerImplDisable(
    GlobalConfigs configs,
    String serverHost,
  ) {
    _devServerHelper = DevServerHelper(configs, serverHost, null);
  }

  @override
  String createResourceUrl(String resName) {
    return '';
  }

  @override
  void handleException(JsError error) {}

  @override
  void attachToHost(RootWidgetViewModel viewModel) {}

  @override
  void detachFromHost(RootWidgetViewModel viewModel) {}

  @override
  void setDevServerCallback(DevServerCallback devServerCallback) {}

  @override
  void reload() {}

  @override
  String createDebugUrl(
      String host, String? componentName, String debugClientId) {
    return '';
  }
}
