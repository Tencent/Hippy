// @dart=2.9
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
import 'package:flutter/services.dart';
import 'package:tencent_voltron_render/voltron_render.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

import 'page_test.dart';

void main() {
  _MyWidgetInspector.init();
  // debugProfileBuildsEnabled = true; //向 Timeline 事件中添加 build 信息
  // debugPrintRebuildDirtyWidgets = true; // 记录每帧重建的 widget
  // debugProfilePaintsEnabled = true;
  if (Platform.isAndroid) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.light.copyWith(
      statusBarColor: Colors.black,
    ));
  }
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  _MyAppState createState() => _MyAppState();
}

enum PageStatus {
  init,
  loading,
  success,
  error,
}

class _MyAppState extends State<MyApp> {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Builder(
        builder: (context) => Scaffold(
          appBar: AppBar(
            title: Text('Voltron动态化方案'),
            backgroundColor: Color(0xFF40b883),
            systemOverlayStyle: Platform.isAndroid
                ? SystemUiOverlayStyle.light.copyWith(
                    statusBarColor: Colors.black,
                  )
                : null,
          ),
          body: MainPageWidget(),
        ),
      ),
    );
    // return MaterialApp(
    //   home: VoltronPage(),
    // );
  }
}

class VoltronPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _VoltronPageState();
  }
}

class MainPageWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: BouncingScrollPhysics(),
      child: Container(
        alignment: Alignment.topCenter,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 350,
              height: 150,
              child: Image.asset('assets/voltron-logo.png'),
            ),
            Card(
              margin: EdgeInsets.only(left: 10, right: 10, top: 20, bottom: 0),
              color: Colors.white,
              child: Container(
                padding: EdgeInsets.only(top: 12, bottom: 12, left: 8, right: 8),
                child: Column(
                  children: [
                    Text('官方Demo', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                    ButtonBar(
                      buttonHeight: 50,
                      alignment: MainAxisAlignment.center,
                      children: [
                        TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => PageTestWidget(),
                              ),
                            );
                          },
                          child: Text('进入体验'),
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ),
            Card(
              margin: EdgeInsets.only(left: 10, right: 10, top: 20, bottom: 40),
              color: Colors.white,
              child: Container(
                padding: EdgeInsets.only(top: 12, bottom: 12, left: 8, right: 8),
                child: Column(
                  children: [
                    Text('本地调试', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
                    SizedBox(
                      height: 20,
                    ),
                    SizedBox(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.start,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('1. 使用usb线链接Android手机和电脑，并启动Voltron'),
                          Text('2. 前端项目执行npm install安装依赖'),
                          Text('3. 前端项目执行npm run voltron:dev编译调试包'),
                          Text('4. 前端项目执行npm run voltron:debug链接手机并启动调试服务'),
                          Text('5. 点击下方开始调试进入调试页面'),
                          Text(
                              '6. 打开chrome://inspect，需要确保localhost:38989在Discover network targets右侧的Configuration弹窗中，下方会出现设备列表，点击inspect开始调试'),
                        ],
                      ),
                    ),
                    ButtonBar(
                      alignment: MainAxisAlignment.center,
                      children: [
                        TextButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) =>
                                    PageTestWidget('http://localhost:38989/index.bundle', true),
                              ),
                            );
                          },
                          child: Text('进入调试'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VoltronPageState extends State<VoltronPage> {
  PageStatus pageStatus = PageStatus.init;
  VoltronJSLoaderManager _loaderManager;
  VoltronJSLoader _jsLoader;

  @override
  void initState() {
    super.initState();
    DeviceInfoPlugin().iosInfo.then((deviceData) {
      var initParams = EngineInitParams();
      initParams.debugMode = false;
      initParams.enableLog = true;
      initParams.coreJSAssetsPath = 'assets/bundle/vendor.js';
      initParams.codeCacheTag = "common";
      initParams.providers = [];
      initParams.engineMonitor = Monitor();
      _loaderManager = VoltronJSLoaderManager.createLoaderManager(
        initParams,
        (statusCode, msg) {
          LogUtils.i(
            'loadEngine',
            'code($statusCode), msg($msg)',
          );
          if (statusCode == EngineInitStatus.ok) {
            pageStatus = PageStatus.success;
            setState(() {});
          } else {
            pageStatus = PageStatus.error;
            setState(() {});
          }
        },
      );
      var loadParams = ModuleLoadParams();
      loadParams.componentName = "Demo";
      loadParams.codeCacheTag = "Demo";
      loadParams.jsAssetsPath = 'assets/bundle/index.js';
      loadParams.jsParams = VoltronMap();
      loadParams.jsParams.push(
        "msgFromNative",
        "Hi js developer, I come from native code!",
      );
      if (Platform.isIOS) {
        loadParams.jsParams.push(
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
    }).catchError((err) {
      pageStatus = PageStatus.error;
      setState(() {});
    });
  }

  @override
  Widget build(BuildContext context) {
    Widget child;
    if (pageStatus == PageStatus.success) {
      child = VoltronWidget(loader: _jsLoader);
    } else {
      child = Container();
    }
    return Material(
      child: child,
    );
  }
}

class _MyWidgetInspector with WidgetInspectorService {
  static void init() {
    WidgetInspectorService.instance = _MyWidgetInspector();
  }

  @override
  void setPubRootDirectories(List<String> pubRootDirectories) {
    for (final dir in pubRootDirectories) {
      if (dir.contains('flutter/example')) {
        pubRootDirectories.add(dir.replaceFirst(
          'flutter/example',
          'flutter',
        ));
        pubRootDirectories.add(dir.replaceFirst(
          'driver/js/flutter/example',
          'renderer/flutter',
        ));
        break;
      }
      if (dir.contains('driver/js/flutter')) {
        pubRootDirectories.add(dir.replaceFirst(
          'driver/js/flutter',
          'renderer/flutter',
        ));
        break;
      }
    }
    super.setPubRootDirectories(pubRootDirectories);
  }
}
