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

import 'package:flutter/material.dart';
import 'package:tencent_voltron_render/voltron_render.dart';
import 'package:voltron_renderer/voltron_renderer.dart';

const bool kUseVoltronDemo = true;
const bool kIsAndroidPlatform = true;

const String kHippyBundleDir = 'hippy-bundle';
const String kVoltronBundleDir = 'voltron-hippy-bundle';
const String kAndroidDir = 'android';
const String kIOSDir = 'ios';
const String kBundleDir = kUseVoltronDemo ? kVoltronBundleDir : kHippyBundleDir;
const String kPlatform = kIsAndroidPlatform ? kAndroidDir : kIOSDir;
const String kVendorPath = "jsbundle/$kBundleDir/$kPlatform/vendor.$kPlatform.js";
const String kIndexPath = "jsbundle/$kBundleDir/$kPlatform/index.$kPlatform.js";

VoltronJSLoaderManager generateManager({bool? debugMode}) {
  var initParams = EngineInitParams();
  initParams.iEngineType = EngineType.vue;
  // 可选，是否开启voltron debug模式
  initParams.debugMode = debugMode ?? false;
  // 可选：是否打印引擎的完整的log。默认为false
  initParams.enableLog = true;
  // 可选：debugMode = false 时必须设置coreJSAssetsPath或coreJSFilePath（debugMode = true时，所有jsbundle都是从debug server上下载）
  initParams.coreJSAssetsPath = kVendorPath;

  initParams.engineMonitor = Monitor();

  return VoltronJSLoaderManager.createLoaderManager(initParams, (code, msg) {
    LogUtils.i('loadEngine', 'code($code), msg($msg)');
  });
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
  late VoltronJSLoaderManager _loaderManager;
  late VoltronJSLoader _jsLoader;
  late String _bundle;
  late bool _debugMode;
  Offset offsetA = Offset(20, 300);

  @override
  void initState() {
    _bundle = widget.bundle ?? kIndexPath;
    _debugMode = widget.debugMode;
    _loaderManager = generateManager(debugMode: _debugMode);
    _jsLoader = _loaderManager.createLoader(generateParams(_bundle), moduleListener: (status, msg, viewModel) {
      LogUtils.i(
          "flutterRender",
          "loadModule status($status), msg"
              "($msg)");
    });
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
    _jsLoader.destroy();
    _loaderManager.destroy();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    final height = size.height;

    final voltronWidget = Scaffold(
      body: VoltronWidget(loader: _jsLoader),
    );

    return Material(
        child: _debugMode
            ? Stack(
                children: [
                  voltronWidget,
                  Positioned(
                      left: offsetA.dx,
                      top: offsetA.dy,
                      child: Draggable(
                          //创建可以被拖动的Widget
                          child: FloatingActionButton(
                            child: Icon(Icons.refresh),
                            backgroundColor: Color(0xFF40b883),
                            onPressed: () {
                              Future.delayed(Duration.zero, () {
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => PageTestWidget(
                                            _bundle, _debugMode)));
                              });
                            },
                          ),
                          //拖动过程中的Widget
                          feedback: FloatingActionButton(
                            child: Icon(Icons.refresh),
                            backgroundColor: Color(0xFF40b883),
                            onPressed: () {
                              Future.delayed(Duration.zero, () {
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (context) => PageTestWidget(
                                            _bundle, _debugMode)));
                              });
                            },
                          ),
                          //拖动过程中，在原来位置停留的Widget，设定这个可以保留原本位置的残影，如果不需要可以直接设置为Container()
                          childWhenDragging: Container(),

                          // FloatingActionButton(
                          //   tooltip: 'Increment',
                          //   child: Icon(Icons.add), onPressed: () {},
                          // ),
                          //拖动结束后的Widget
                          onDraggableCanceled: (velocity, offset) {
                            // 计算组件可移动范围  更新位置信息
                            setState(() {
                              var x = offset.dx;
                              var y = offset.dy;
                              if (offset.dx < 0) {
                                x = 20;
                              }

                              if (offset.dx > 375) {
                                x = 335;
                              }

                              if (offset.dy < kBottomNavigationBarHeight) {
                                y = kBottomNavigationBarHeight;
                              }

                              if (offset.dy > height - 100) {
                                y = height - 100;
                              }

                              offsetA = Offset(x, y);
                            });
                          })),
                ],
              )
            : voltronWidget);
  }
}

ModuleLoadParams generateParams(String bundle) {
  var loadParams = ModuleLoadParams();

  if (bundle.startsWith('http://') || bundle.startsWith('https://')) {
    loadParams.jsHttpPath = bundle;
  } else {
    loadParams.jsAssetsPath = bundle;
  }

  // 必须：指定要加载的Hippy模块里的组件（component）。componentName对应的是js文件中的"appName"，比如：
  // var hippy = new Voltron({
  //     appName: "Demo",
  //     entryPage: App
  // });
  loadParams.componentName = "Demo";

  // 可选：二选一设置。自己开发的业务模块的jsbundle的文件路径（assets路径和文件路径二选一，优先使用assets路径）
  // debugMode = false 时必须设置jsAssetsPath或jsFilePath
  // （debugMode =true时，所有jsbundle都是从debug server上下载）
  // 可选：发送给Voltron前端模块的参数
  loadParams.jsParams = VoltronMap();
  loadParams.jsParams!.push(
      "msgFromNative",
      "Hi js developer, I come from "
          "native code!");
  return loadParams;
}
