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

import '../engine.dart';

class DevServerHelper {
  final GlobalConfigs _configs;
  final String _serverHost;

  DevServerHelper(this._configs, this._serverHost);

  String createBundleURL(
    String host,
    String bundleName,
    bool devMode,
    bool hmr,
    bool jsMinify,
  ) {
    return "http://$host/$bundleName?dev=$devMode&hot=$hmr&minify=$jsMinify";
  }
}
