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

import 'bundle.dart';
import 'js_engine_context.dart';
import 'js_module_params.dart';
import 'voltron_js_engine.dart';

class JSLoadInstanceContext with LoadInstanceContext {
  final ModuleLoadParams _moduleParams;
  VoltronBundleLoader? _bundleLoader;

  JSLoadInstanceContext(ModuleLoadParams params) : _moduleParams = params {
    moduleParams = params;
  }

  VoltronBundleLoader? get bundleLoader => _bundleLoader;

  ModuleLoadParams get moduleParams => _moduleParams;

  VoltronMap? get launchParams => _moduleParams.jsParams;

  String get name => _moduleParams.componentName;

  set moduleParams(ModuleLoadParams params) {
    var bundleLoader = _moduleParams.bundleLoader;
    if (bundleLoader != null) {
      _bundleLoader = bundleLoader;
    } else {
      var jsAsstsPath = params.jsAssetsPath;
      var jsFilePath = params.jsFilePath;
      var jsHttpPath = params.jsHttpPath;
      if (jsAsstsPath != null && !isEmpty(jsAsstsPath)) {
        _bundleLoader = AssetBundleLoader(jsAsstsPath,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      } else if (jsFilePath != null && !isEmpty(jsFilePath)) {
        _bundleLoader = FileBundleLoader(jsFilePath,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      } else if (jsHttpPath != null && !isEmpty(jsHttpPath)) {
        _bundleLoader = HttpBundleLoader(jsHttpPath,
            canUseCodeCache: !isEmpty(params.codeCacheTag),
            codeCacheTag: params.codeCacheTag);
      }
    }
  }
}
