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

class VoltronDemoPage extends StatefulWidget {
  VoltronDemoPage();

  @override
  State<StatefulWidget> createState() {
    return _VoltronDemoPageState();
  }
}

class _VoltronDemoPageState extends State<VoltronDemoPage> {
  late VoltronJSLoaderManager _loaderManager;
  late VoltronJSLoader _jsLoader;

  @override
  void initState() {
    super.initState();
    _initVoltronData();
  }

  void _initVoltronData() async {
    var initParams = EngineInitParams();
    initParams.debugMode = false;
    initParams.enableLog = true;
    initParams.coreJSAssetsPath = "assets/jsbundle/vendor.android.js";
    initParams.codeCacheTag = "common";
    _loaderManager = VoltronJSLoaderManager.createLoaderManager(
      initParams,
      (statusCode, msg) {
        LogUtils.i(
          'loadEngine',
          'code($statusCode), msg($msg)',
        );
      },
    );
    var loadParams = ModuleLoadParams();
    loadParams.componentName = "Demo";
    loadParams.codeCacheTag = "Demo";
    loadParams.jsAssetsPath = "assets/jsbundle/index.android.js";
    loadParams.jsParams = VoltronMap();
    loadParams.jsParams?.push(
      "msgFromNative",
      "Hi js developer, I come from native code!",
    );
    _jsLoader = _loaderManager.createLoader(
      loadParams,
      moduleListener: (status, msg) {
        LogUtils.i(
          "flutterRender",
          "loadModule status($status), msg ($msg)",
        );
      },
    );
  }

  @override
  void dispose() {
    super.dispose();
    _jsLoader.destroy();
    _loaderManager.destroy();
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
      onWillPop: () async {
        return !(_jsLoader.back(() {
          Navigator.of(context).pop();
        }));
      },
      child: Scaffold(
        body: VoltronWidget(
          loader: _jsLoader,
        ),
      ),
    );
  }
}
