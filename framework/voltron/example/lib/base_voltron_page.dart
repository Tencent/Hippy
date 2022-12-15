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

import 'dart:io';

import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:voltron/voltron.dart';

import 'my_api_provider.dart';

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

class BaseVoltronPage extends StatefulWidget {
  final bool isHome;
  final bool debugMode;
  final String coreBundle;
  final String indexBundle;
  final String remoteServerUrl;

  BaseVoltronPage({
    this.isHome = false,
    this.debugMode = false,
    this.coreBundle = '',
    this.indexBundle = '',
    this.remoteServerUrl = '',
  });

  @override
  State<StatefulWidget> createState() {
    return _BaseVoltronPageState();
  }
}

class _BaseVoltronPageState extends State<BaseVoltronPage> {
  PageStatus pageStatus = PageStatus.init;
  late VoltronJSLoaderManager _loaderManager;
  late VoltronJSLoader _jsLoader;
  int errorCode = -1;
  late bool _debugMode;
  late String _coreBundle;
  late String _indexBundle;
  late String _remoteServerUrl;

  @override
  void initState() {
    super.initState();
    _debugMode = widget.debugMode;
    _coreBundle = widget.coreBundle;
    _indexBundle = widget.indexBundle;
    _remoteServerUrl = widget.remoteServerUrl;
    _initVoltronData();
  }

  void _initVoltronData() async {
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
    initParams.debugMode = _debugMode;
    initParams.enableLog = true;
    if (_debugMode) {
      // 调试模式下直接使用debug参数
      initParams.remoteServerUrl = _remoteServerUrl;
    } else {
      // 如果是不分包加载，可以只填写coreJSAssetsPath，下面的jsAssetsPath直接忽略即可
      initParams.coreJSAssetsPath = _coreBundle;
      initParams.codeCacheTag = "common";
    }
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
            errorCode = statusCode.value;
          });
        }
      },
    );
    var loadParams = ModuleLoadParams();
    loadParams.componentName = "Demo";
    loadParams.codeCacheTag = "Demo";
    if (isWebUrl(_indexBundle)) {
      loadParams.jsHttpPath = _indexBundle;
    } else {
      loadParams.jsAssetsPath = _indexBundle;
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
          loadingBuilder: _debugMode ? null : (context) => Container(),
        ),
      );
    } else if (pageStatus == PageStatus.error) {
      child = Center(
        child: Text('init engine error, code: ${errorCode.toString()}'),
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
    return WillPopScope(
      onWillPop: () async {
        return !(_jsLoader.back(() {
          Navigator.of(context).pop();
          if (widget.isHome) {
            SystemNavigator.pop();
          }
        }));
      },
      child: child,
    );
  }
}
