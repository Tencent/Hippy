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

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:tencent_voltron_render/voltron_render.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import 'my_api_provider.dart';

const bool kUseHippyVueDemo = false;

const String kHippyVueBundleDir = 'hippy-vue-demo';
const String kHippyReactBundleDir = 'hippy-react-demo';
const String kBundleDir = kUseHippyVueDemo ? kHippyVueBundleDir : kHippyReactBundleDir;
const String kPlatform = 'android'; // ios and android use same bundle
const String kVendorPath = "jsbundle/$kBundleDir/$kPlatform/vendor.$kPlatform.js";
const String kIndexPath = "jsbundle/$kBundleDir/$kPlatform/index.$kPlatform.js";

enum PageStatus {
  init,
  loading,
  success,
  error,
}

class Monitor extends EngineMonitor {
  @override
  bool enableBuildTime = true;

  @override
  bool enablePerformance = true;

  @override
  bool enableCreateElementTime = true;
}

class PageTestWidget extends StatefulWidget {
  final String? bundle;
  final bool debugMode;

  PageTestWidget([this.bundle, this.debugMode = false]);

  @override
  State<StatefulWidget> createState() {
    return _PageTestWidgetState();
  }
}

class _PageTestWidgetState extends State<PageTestWidget> {
  PageStatus pageStatus = PageStatus.init;
  late VoltronJSLoaderManager _loaderManager;
  late VoltronJSLoader _jsLoader;
  late String _bundle;
  int _errorCode = -1;
  Offset offsetA = Offset(20, 300);

  @override
  void initState() {
    super.initState();
    _bundle = widget.bundle ?? kIndexPath;
    _initVoltronData();
  }

  _initVoltronData() async {
    IosDeviceInfo? deviceData;
    if (Platform.isIOS) {
      try {
        deviceData = await DeviceInfoPlugin().iosInfo;
      } catch (err) {
        setState(() {
          pageStatus = PageStatus.error;
        });
      }
    }
    var initParams = EngineInitParams();
    initParams.debugMode = widget.debugMode;
    initParams.enableLog = true;
    initParams.coreJSAssetsPath = kVendorPath;
    initParams.codeCacheTag = "common";
    initParams.providers = [
      MyAPIProvider(),
    ];
    initParams.engineMonitor = Monitor();
    _loaderManager = VoltronJSLoaderManager.createLoaderManager(
      initParams,
      (statusCode, msg) {
        LogUtils.i(
          'loadEngine',
          'code($statusCode), msg($msg)',
        );
        if (statusCode == EngineInitStatus.ok) {
          setState(() {
            pageStatus = PageStatus.success;
          });
        } else {
          setState(() {
            pageStatus = PageStatus.error;
            _errorCode = statusCode.value;
          });
        }
      },
    );
    var loadParams = ModuleLoadParams();
    loadParams.componentName = "Demo";
    loadParams.codeCacheTag = "Demo";
    if (_bundle.startsWith('http://') || _bundle.startsWith('https://')) {
      loadParams.jsHttpPath = _bundle;
    } else {
      loadParams.jsAssetsPath = _bundle;
    }
    loadParams.jsParams = VoltronMap();
    loadParams.jsParams?.push(
      "msgFromNative",
      "Hi js developer, I come from native code!",
    );
    if (deviceData != null) {
      loadParams.jsParams?.push(
        "isSimulator",
        !deviceData.isPhysicalDevice,
      );
    }
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
    Widget child;
    if (pageStatus == PageStatus.success) {
      child = Scaffold(
        body: VoltronWidget(
          loader: _jsLoader,
        ),
      );
    } else if (pageStatus == PageStatus.error) {
      child = Center(
        child: Text('init engine error, code: ${_errorCode.toString()}'),
      );
    } else {
      child = Container();
    }
    if (Platform.isAndroid) {
      child = SafeArea(
        bottom: false,
        child: child,
      );
    }
    return Material(
      child: child,
    );
  }
}
